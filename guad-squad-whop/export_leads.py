#!/usr/bin/env python3
"""Export Guad Squad leads from Whop to CSV.

Pulls three lists for the course product and merges them into one file:
  - members      : everyone who bought (or was granted) access, with email
  - memberships  : one row per purchase, with the checkout answers
  - leads        : people who showed interest but have not bought (Whop "leads")

Env:  WHOP_API_KEY (or API_KEY)
Usage:
  python3 export_leads.py                 # writes guad-squad-leads.csv
  python3 export_leads.py --out my.csv
"""
import csv
import json
import os
import sys
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = "https://api.whop.com/api/v1"
API_KEY = os.environ.get("WHOP_API_KEY") or os.environ.get("API_KEY")
if not API_KEY:
    sys.exit("Set WHOP_API_KEY (or API_KEY).")

with open(os.path.join(HERE, "whop_ids.json")) as f:
    IDS = json.load(f)
COMPANY, PRODUCT = IDS["company_id"], IDS["product_id"]
OUT = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else os.path.join(HERE, "guad-squad-leads.csv")


def get(path, **params):
    url = BASE + path + "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v is not None}, doseq=True)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {API_KEY}", "Api-Version-Date": "2026-07-23"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def list_all(path, **params):
    out, after = [], None
    while True:
        d = get(path, first=50, after=after, **params)
        out.extend(d.get("data", []))
        pi = d.get("page_info", {})
        if not pi.get("has_next_page"):
            return out
        after = pi["end_cursor"]


rows = {}


def row(user_id):
    return rows.setdefault(user_id, {
        "user_id": user_id, "name": "", "username": "", "email": "", "phone": "",
        "status": "", "source": "", "first_seen": "", "total_spent_usd": "",
        "checkout_answers": "", "referrer": "", "membership_id": "", "notes": "",
    })


def fill_user(r, u):
    if not u:
        return
    for k in ("name", "username", "email", "phone"):
        if u.get(k) and not r[k]:
            r[k] = u[k]


# 1. members (buyers) ------------------------------------------------------
try:
    for m in list_all("/members", account_id=COMPANY, product_ids=[PRODUCT]):
        u = m.get("user") or {}
        r = row(u.get("id") or m.get("id"))
        fill_user(r, u)
        fill_user(r, m)
        r["status"] = m.get("status") or m.get("access_level") or r["status"]
        r["source"] = "member"
        r["first_seen"] = m.get("created_at") or m.get("joined_at") or r["first_seen"]
        spent = m.get("total_spent") or m.get("usd_total_spent")
        if spent is not None:
            r["total_spent_usd"] = spent
except Exception as e:  # noqa: BLE001
    print("members:", e, file=sys.stderr)

# 2. memberships (purchases + checkout answers) ----------------------------
try:
    for ms in list_all("/memberships", account_id=COMPANY, product_ids=[PRODUCT]):
        u = ms.get("user") or ms.get("member") or {}
        r = row(u.get("id") or ms.get("id"))
        fill_user(r, u)
        r["membership_id"] = ms.get("id", "")
        r["status"] = ms.get("status") or r["status"]
        r["source"] = r["source"] or "membership"
        r["first_seen"] = r["first_seen"] or ms.get("created_at", "")
        answers = ms.get("custom_field_responses") or ms.get("custom_fields_responses") or ms.get("custom_field_responses_v2")
        if answers:
            if isinstance(answers, list):
                r["checkout_answers"] = " | ".join(
                    f"{a.get('question') or a.get('name') or a.get('custom_field_id')}: {a.get('answer') or a.get('value')}"
                    for a in answers)
            else:
                r["checkout_answers"] = json.dumps(answers)
except Exception as e:  # noqa: BLE001
    print("memberships:", e, file=sys.stderr)

# 3. Whop leads (interested, not yet bought) --------------------------------
try:
    for ld in list_all("/leads", account_id=COMPANY, product_ids=[PRODUCT]):
        u = ld.get("user") or {}
        r = row(u.get("id") or ld.get("id"))
        fill_user(r, u)
        r["source"] = r["source"] or "lead"
        r["status"] = r["status"] or "lead"
        r["first_seen"] = r["first_seen"] or ld.get("created_at", "")
        r["referrer"] = ld.get("referrer") or ""
        if ld.get("metadata"):
            r["notes"] = json.dumps(ld["metadata"])
except Exception as e:  # noqa: BLE001
    print("leads:", e, file=sys.stderr)

fields = list(row("_")) ; rows.pop("_")
with open(OUT, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for r in sorted(rows.values(), key=lambda x: x["first_seen"] or ""):
        w.writerow(r)
print(f"{len(rows)} contacts -> {OUT}")
