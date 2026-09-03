#!/usr/bin/env python3
"""Set up the Guad Squad "How to Start With AI Agents" course on Whop.

Idempotent: safe to re-run. Matches existing objects by route/name/title and
creates only what is missing; updates text content on every run.

Env:
  WHOP_API_KEY   (falls back to API_KEY)   account API key, apik_...
  WHOP_COMPANY_ID  optional, biz_...       auto-detected from the key if unset

Usage:
  python3 whop_setup.py            # create/update everything
  python3 whop_setup.py --dry-run  # show what would happen, no writes
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

import course_content as cc

BASE = "https://api.whop.com/api/v1"
API_VERSION = "2026-07-23"
COURSES_APP_ID = "app_0vPZThfBpAwLo"  # Whop's official Courses app
DRY = "--dry-run" in sys.argv

API_KEY = os.environ.get("WHOP_API_KEY") or os.environ.get("API_KEY")
if not API_KEY:
    sys.exit("Set WHOP_API_KEY (or API_KEY) to a Whop account API key.")


def api(method, path, body=None, params=None, base=BASE, retries=3):
    url = base + path
    if params:
        url += "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {API_KEY}",
        "Api-Version-Date": API_VERSION,
        "Content-Type": "application/json",
        "Accept": "application/json",
    })
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                raw = r.read()
                return json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")
            if e.code in (429, 500, 502, 503) and attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise RuntimeError(f"{method} {path} -> {e.code}: {msg[:600]}") from None


def list_all(path, params):
    out, after = [], None
    while True:
        p = dict(params, first=50)
        if after:
            p["after"] = after
        d = api("GET", path, params=p)
        out.extend(d.get("data", []))
        pi = d.get("page_info", {})
        if not pi.get("has_next_page"):
            return out
        after = pi.get("end_cursor")


def write(method, path, body):
    """Perform a write, or print it in dry-run mode."""
    if DRY:
        print(f"  [dry-run] {method} {path} {json.dumps(body)[:160] if body else ''}")
        return {"id": f"dry_{path.strip('/').replace('/', '_')}"}
    return api(method, path, body)


def main():
    company_id = os.environ.get("WHOP_COMPANY_ID")
    if not company_id:
        company_id = api("GET", "/company", base="https://api.whop.com/api/v5")["id"]
    company = api("GET", f"/companies/{company_id}")
    route = company.get("route") or company_id
    print(f"Company: {company['title']} ({company_id}) route={route}")

    # 1. Courses experience -------------------------------------------------
    exps = list_all("/experiences", {"company_id": company_id})
    exp = next((e for e in exps if e.get("app", {}).get("id") == COURSES_APP_ID
                and e.get("name") == cc.EXPERIENCE_NAME), None)
    if exp:
        print(f"Experience exists: {exp['id']}")
    else:
        print("Creating Courses experience...")
        exp = write("POST", "/experiences", {
            "account_id": company_id, "app_id": COURSES_APP_ID,
            "name": cc.EXPERIENCE_NAME, "is_public": False,
        })
        print(f"  created {exp['id']}")
    exp_id = exp["id"]

    # 2. Product ------------------------------------------------------------
    P = cc.PRODUCT
    products = list_all("/products", {"account_id": company_id})
    product = next((p for p in products if p.get("route") == P["route"]), None)
    body = {
        "title": P["title"], "headline": P["headline"],
        "description": cc.render(P["description"]),
        "custom_cta": P["custom_cta"], "visibility": "visible",
        "metadata": {"source": "guad-squad-course", "funnel": "start-with-agents"},
    }
    if product:
        print(f"Product exists: {product['id']} -> updating copy")
        write("PATCH", f"/products/{product['id']}", body)
    else:
        print("Creating product...")
        product = write("POST", "/products", dict(body, account_id=company_id,
                                                  route=P["route"], experience_ids=[exp_id],
                                                  send_welcome_message=True))
        print(f"  created {product['id']}")
    product_id = product["id"]

    # make sure the course experience is attached to the product
    attached = [] if str(product_id).startswith("dry_") else list_all(
        "/experiences", {"company_id": company_id, "product_id": product_id})
    if not str(product_id).startswith("dry_") and not any(e["id"] == exp_id for e in attached):
        print("Attaching course experience to product...")
        write("POST", f"/experiences/{exp_id}/attach", {"product_id": product_id})

    # 3. Plan ---------------------------------------------------------------
    PL = P["plan"]
    plans = [] if str(product_id).startswith("dry_") else list_all(
        "/plans", {"account_id": company_id, "product_id": product_id})
    plan = next((p for p in plans if p.get("plan_type") == "one_time"
                 and p.get("visibility") in ("visible", None)), None)
    plan_body = {
        "title": PL["title"], "description": PL["description"],
        "initial_price": PL["price_usd"], "currency": "usd",
        "plan_type": "one_time", "release_method": "buy_now",
        "visibility": "visible", "unlimited_stock": True,
        "custom_fields": PL["custom_fields"],
        "metadata": {"source": "guad-squad-course"},
    }
    if plan:
        print(f"Plan exists: {plan['id']} -> updating title/description/custom fields")
        upd = dict(plan_body)
        upd["custom_fields"] = [dict(f) for f in PL["custom_fields"]]
        # keep existing field ids so they are updated instead of duplicated
        existing = {f.get("name"): f.get("id") for f in (plan.get("custom_fields") or [])}
        for f in upd["custom_fields"]:
            if existing.get(f["name"]):
                f["id"] = existing[f["name"]]
        try:
            write("PATCH", f"/plans/{plan['id']}", upd)
        except RuntimeError as e:
            print(f"  (plan update skipped: {e})")
    else:
        print(f"Creating one-time plan at ${PL['price_usd']:.2f}...")
        plan = write("POST", "/plans", dict(plan_body, account_id=company_id, product_id=product_id))
        print(f"  created {plan['id']}")
    plan_id = plan["id"]

    # 4. Course -------------------------------------------------------------
    courses = list_all("/courses", {"experience_id": exp_id}) if not str(exp_id).startswith("dry_") else []
    course = next((c for c in courses if c.get("title") == cc.COURSE["title"]), None)
    cbody = {
        "title": cc.COURSE["title"], "tagline": cc.COURSE["tagline"],
        "visibility": "visible",
        "require_completing_lessons_in_order": cc.COURSE["require_completing_lessons_in_order"],
        "certificate_after_completion_enabled": cc.COURSE["certificate_after_completion_enabled"],
    }
    if course:
        print(f"Course exists: {course['id']} -> updating")
        write("PATCH", f"/courses/{course['id']}", cbody)
    else:
        print("Creating course...")
        course = write("POST", "/courses", dict(cbody, experience_id=exp_id))
        print(f"  created {course['id']}")
    course_id = course["id"]

    # 5. Chapters + lessons -------------------------------------------------
    chapters = list_all("/course_chapters", {"course_id": course_id}) if not str(course_id).startswith("dry_") else []
    # Whop seeds a new course with an empty "Chapter 1" / "Lesson 1"; drop it.
    wanted = {ch["title"] for ch in cc.CHAPTERS}
    for c in chapters:
        if c.get("title") not in wanted and c.get("title", "").startswith("Chapter "):
            ls = list_all("/course_lessons", {"chapter_id": c["id"]})
            if all(not (l.get("content") or "").strip() for l in ls):
                print(f"Removing empty placeholder chapter: {c.get('title')}")
                write("DELETE", f"/course_chapters/{c['id']}", None)
    chapters = [c for c in chapters if c.get("title") in wanted or not c.get("title", "").startswith("Chapter ")]
    by_title = {c.get("title"): c for c in chapters}
    summary = []
    for ch in cc.CHAPTERS:
        chapter = by_title.get(ch["title"])
        if chapter:
            print(f"Chapter exists: {ch['title']}")
        else:
            print(f"Creating chapter: {ch['title']}")
            chapter = write("POST", "/course_chapters", {"course_id": course_id, "title": ch["title"]})
        chap_id = chapter["id"]
        lessons = list_all("/course_lessons", {"chapter_id": chap_id}) if not str(chap_id).startswith("dry_") else []
        lby = {l.get("title"): l for l in lessons}
        for ls in ch["lessons"]:
            lbody = {"title": ls["title"], "lesson_type": "text", "content": cc.render(ls["content"])}
            if ls["title"] in lby:
                print(f"  updating lesson: {ls['title']}")
                write("PATCH", f"/course_lessons/{lby[ls['title']]['id']}", lbody)
                lid = lby[ls["title"]]["id"]
            else:
                print(f"  creating lesson: {ls['title']}")
                lid = write("POST", "/course_lessons", dict(lbody, chapter_id=chap_id))["id"]
            summary.append({"chapter": ch["title"], "lesson": ls["title"], "id": lid})

    # 6. Record IDs ---------------------------------------------------------
    state = {
        "company_id": company_id, "company_route": route,
        "experience_id": exp_id, "product_id": product_id, "product_route": P["route"],
        "plan_id": plan_id, "course_id": course_id,
        "urls": {
            "storefront": f"https://whop.com/{route}/",
            "product_page": f"https://whop.com/{route}/{P['route']}/",
            "checkout": f"https://whop.com/checkout/{plan_id}",
            "dashboard_product": f"https://whop.com/dashboard/{company_id}/products/{product_id}",
            "dashboard_leads": f"https://whop.com/dashboard/{company_id}/leads",
        },
        "lessons": summary,
    }
    if not DRY:
        with open(os.path.join(os.path.dirname(__file__), "whop_ids.json"), "w") as f:
            json.dump(state, f, indent=2)
    print("\nDone.")
    print(json.dumps(state["urls"], indent=2))


if __name__ == "__main__":
    main()
