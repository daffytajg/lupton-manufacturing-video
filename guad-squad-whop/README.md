# Guad Squad on Whop: "How to Start With AI Agents"

Scripts and content for the Guad Squad ([guadsquadai.com](https://guadsquadai.com)) paid starter course on Whop, used as the front-end lead offer for the agency.

## What is live

| Item | Value |
|---|---|
| Whop company | Guad Squad (`biz_riLL9YVLTT4sFL`), route `guadsquadai` |
| Storefront | https://whop.com/guadsquadai/ |
| Product | How to Start With AI Agents (`prod_xcXj2QWuGPM7j`) |
| Product page | https://whop.com/guadsquadai/start-with-agents/ |
| Plan | Lifetime access, one-time **$47 USD** (`plan_Y65X7OKoHLRQI`) |
| Direct checkout link | https://whop.com/checkout/plan_Y65X7OKoHLRQI |
| Course | 5 modules, 17 text lessons, certificate on completion (`cors_ykGmllTjtK1Av`) |
| Course experience | `exp_bdT90VbaJBSEZU` (Whop Courses app), attached to the product |
| Dashboard | https://whop.com/dashboard/biz_riLL9YVLTT4sFL/products/prod_xcXj2QWuGPM7j |

All IDs are also in `whop_ids.json` (written by the setup script).

## How the lead funnel works

1. Someone buys the $47 course on Whop. Whop handles checkout, tax, and receipts.
2. At checkout they must answer **"What is the #1 task you want an AI agent to take off your plate?"** and can add their company or website. Those answers land on the membership record.
3. They get the course plus the Guad Squad community forum. The final lesson ("Want it built for you? Work with Guad Squad") sends them to guadsquadai.com to book a call.
4. Run `export_leads.py` (or use the Whop dashboard) to pull every buyer, their checkout answers, and any Whop leads into one CSV for follow-up.

## Files

| File | Purpose |
|---|---|
| `course_content.py` | Product copy, plan copy and price, and every module and lesson in Markdown. **Edit this to change the course.** |
| `whop_setup.py` | Creates or updates everything on Whop. Idempotent: matches by route and title, so re-running only updates text. |
| `export_leads.py` | Exports buyers, checkout answers, and Whop leads for the course product to CSV. |
| `whop_ids.json` | IDs and URLs from the last setup run. |

## Running

```bash
export WHOP_API_KEY=apik_...        # account API key from the Whop dashboard (API_KEY also works)
python3 whop_setup.py --dry-run     # preview
python3 whop_setup.py               # create / update on Whop
python3 export_leads.py             # writes guad-squad-leads.csv
```

Python 3.9+ and no third-party packages.

## Changing things

- **Price:** `PRODUCT["plan"]["price_usd"]` in `course_content.py`, then re-run setup. The script sends the new price on the plan update. Check the product page afterwards; if Whop refuses to change the price of a plan that already has buyers, create a new plan in the dashboard and archive the old one.
- **Lessons:** edit the Markdown in `course_content.py` and re-run. Chapters and lessons are matched by title. Renaming a title creates a new one, so rename in the Whop dashboard first or delete the old one.
- **Video lessons:** the API supports `lesson_type: "video"` with `embed_type` / `embed_id` (YouTube or Loom). Add those keys to a lesson dict and pass them through in `whop_setup.py`.
- **Checkout questions:** `PRODUCT["plan"]["custom_fields"]`.

## Still to do in the Whop dashboard

These need a browser session, not the API:

1. **Payouts.** Card and bank payments are already active on the account, but payouts are not. Complete identity/business verification under Settings so money can leave Whop.
2. **Logo and cover image** for the store and product page, and a course thumbnail.
3. **Reviews and social proof** once the first buyers finish.
4. Optional: a **webhook** to guadsquadai.com for `membership.activated` / `payment.succeeded` so new buyers drop straight into your CRM. `POST /api/v1/webhooks` with the URL once an endpoint exists.
5. Optional: enable the **member affiliate program** on the product so buyers can refer others.

## Notes on the API key

The key in use is an account API key for the Guad Squad company. `export_leads.py` returns empty emails if the key lacks the `member:email:read` permission. Add that permission to the key in the dashboard if you need emails in the CSV, or read them from the Members page.
