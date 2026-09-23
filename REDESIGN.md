# luptons.com redesign: review package

Nothing in this package touches the live WordPress site. The crawl was read-only, nothing was deployed, and the prototype's forms send nothing.

| Step | Deliverable | What's in it |
|---|---|---|
| 1. Audit | [`audit.md`](audit.md) · [`audit-data/page-inventory.csv`](audit-data/page-inventory.csv) · [`audit-data/page-copy.md`](audit-data/page-copy.md) | 211 URLs inventoried (title, meta, H1, copy, images, forms, CTAs, links); Gravity Forms #1/#2 and where they post; Lighthouse; schema; broken links; alt text; thin pages; duplicate titles; AI-crawler access; llms.txt |
| 2. Who it's for | [`search-intent.md`](search-intent.md) | Buyer roles, trigger events, search queries and AI prompts by capability and industry, capability × industry priority list. **Draft:** the Semrush account had no API units, so there is no volume data yet. |
| 3. Architecture | [`sitemap.md`](sitemap.md) | Intent-based sitemap, page templates, linking rules, conversion and AI-engine plan, decisions needed, the question each page answers, full 301 map |
| 4. Prototype | [`prototype/`](prototype/) ([README](prototype/README.md)) | Astro static site: 40 pages of real copy, animated manufacturing-drawing heroes and motion, one-screen RFQ, JSON-LD, llms.txt. Unverified specs are tagged **[CONFIRM]** and listed on `/review/`. |

```bash
cd prototype && npm install && npm run dev   # http://localhost:4321  → start at / and /review/
```
