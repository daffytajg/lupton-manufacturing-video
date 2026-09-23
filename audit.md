# luptons.com audit

Crawled 2026-09-23. Read-only: GET requests only. No forms were submitted and nothing on the WordPress site was changed.

**Method.** I seeded the crawl with all 57 URLs in the Yoast sitemap index (`/sitemap_index.xml` → post, page, category sitemaps), then followed every internal link. I checked 398 unique link targets and 185 image URLs for status codes, ran Lighthouse 12 (mobile) on three representative pages, and fetched the site with GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, Googlebot, Bingbot, ChatGPT-User and Claude-User user agents.

**Supporting files**

- [`audit-data/page-inventory.csv`](audit-data/page-inventory.csv): one row per URL (211 unique HTML pages). Columns: type, indexability, sitemap membership, title, meta description, H1, word count, images, images missing alt, forms, CTAs, inbound and outbound internal links, schema types, canonical, HTML weight, script count, copy excerpt.
- [`audit-data/page-copy.md`](audit-data/page-copy.md): full main-content copy for all 50 non-blog pages. Header, footer, nav and forms are stripped.

---

## 1. Top 12 findings, ranked by business impact

| # | Finding | Why it matters | Fix in the redesign |
|---|---|---|---|
| 1 | **The homepage says almost nothing.** It has 146 words, and the H1 is "Your next product breakthrough ." (with a stray space before the period). No sentence answers "what does Lupton do, for whom, and how do I start?" | The homepage is the highest-authority page, and it is what Google and the AI engines use to summarize the company. Right now they have to guess. | The new H1 and first two sentences state the offer: custom metal, plastic, cable and electronic parts, the processes covered, drawing-to-quote, and territory. |
| 2 | **The data center page lives on another domain.** `luptons.com/data-centers/` 301-redirects to `www.luptonsolutions.com/datacenter`, a client-rendered single-page app. It has one URL in its sitemap, and its `og:url` disagrees with its canonical. | Data center is the fastest-moving vertical, and its authority is split off the main domain. The page is also invisible to crawlers that do not run JavaScript (see #6). | Consolidate into `luptons.com/industries/data-center/` plus three data center × capability pages. |
| 3 | **Industries are one page with no depth.** `/industries-served/` has 346 words covering six sectors, and every industry nav item links to the same URL. There are no pages for medical, heavy truck, military/aerospace, robotics, energy or agriculture. | Buyers search by industry + part ("wire harness supplier medical device"). There is no page that can rank for any of those searches. | Seven industry pages and capability × industry pages. |
| 4 | **Thin capability pages.** 30 indexable pages are under 300 words, including Castings (168), Machined Components (154), Electronics (143), Injection Molding (210), Sheetmetal Fabrication (226) and Offshore Contract Manufacturing (198). 16 indexable pages have no meta description. | These are the pages that should rank for "die casting supplier" or "CNC machining services." Legacy pages (2015–2018) also read as equipment lists with no buyer framing. | Each capability page opens with the buyer's question answered, then what to send, then specs (verified or marked [CONFIRM]), then FAQ. |
| 5 | **The RFQ is hidden behind jargon.** The quote page is `/manufacturing-path/`, and `/request-a-quote/` redirects to it. The nav says "Request a Quote," but the page is titled "Manufacturing Path and Request for Quote." Gravity Form 1 is a 2-page form (Continue → Send RFQ) with the file upload on page 1. | "Manufacturing path" is internal language. The two-step form hides how short it is. | `/rfq/` with a one-screen form. Drawing upload goes up front, and a "what happens next" timeline sits beside the form. |
| 6 | **Mobile performance is poor.** Lighthouse mobile scores: Home 35, Short Run Stamping 46, Manufacturing Path 53. Home LCP is 19.3 s, TBT 1,040 ms, 4.8 MB transferred, 166 requests. Each page loads 62–76 script files: the full jQuery UI suite, 15 jQuery UI *effect* files, carouFredSel, fullPage.js, Google Maps JS on every page, Elementor + Elementor Pro, WPBakery and Qode Quick Links. | Slow pages lose engineers on mobile and rank worse. Two page builders (Elementor + WPBakery) are running at the same time. | Static HTML. The whole prototype ships one 6.6 KB JS module (2.6 KB gzipped) and scores 93–97 on mobile Lighthouse (see `prototype/README.md`). |
| 7 | **llms.txt is live but polluted.** Yoast auto-generates `/llms.txt`, and it lists 5 pages plus theme leftovers: "Testimonials: web development / web design," "Sliders: slider," "Carousels: carousel." Those taxonomy URLs are live and indexable (HTTP 200). | This is the one file written specifically for AI engines, and it points them at demo content and skips 90% of the capabilities. | A hand-built `llms.txt` that lists every capability, industry and resource page with a one-line answer each. Plus `llms-full.txt`. |
| 8 | **Schema is generic.** Yoast outputs WebPage/Organization/BreadcrumbList. 24 pages have `Service`, and only 3 have `FAQPage` (short run stamping, cable assemblies, data center). There is no `LocalBusiness`/`PostalAddress`, no `Person` markup for the team, and 58 indexable pages have no `og:image`. | Structured data is how search and AI engines extract "who, what, where" with confidence. | Organization + LocalBusiness (Canandaigua address, phone, founding date, areaServed), Service per capability, FAQPage wherever there is a Q&A, BreadcrumbList, and Person for leadership. |
| 9 | **129 blog posts, 124 noindexed.** Posts from 2018–2022 ("Click to keep reading!" titles, holiday greetings, COVID, tariffs) are `noindex, follow` and missing from the post sitemap, but they are still linked from 15 paginated "Insights Archive" pages. Those pages share one duplicate title and are also noindexed. | Noindexing was the right call, but 140 thin URLs are still being crawled for nothing. | Keep noindexed or 410 the off-topic posts. Migrate the few with buyer value (thixomolding, CMMC, NIST SP 800-171) into Resources. |
| 10 | **Internal links point at redirects.** 27 internal links point to non-trailing-slash or redirected URLs (home "see more" links, `/data-centers/`). The Cloudflare email-protection link (`/cdn-cgi/l/email-protection`) returns 404 to crawlers and appears on every page. | These are small crawl-efficiency and trust leaks. The address is also hidden from AI crawlers, so they cannot cite it. | Use absolute canonical links. Print the email in plain text or behind a mailto (decision: spam trade-off). |
| 11 | **Images.** 284 of 2,269 `<img>` tags have no alt text, mostly `header-9.jpg`, repeated on 160 pages. 2,131 have no width/height, and only 60 are lazy-loaded. Legacy 2017 JPGs are served at full size. | This hurts accessibility (Lighthouse a11y 87–92) and LCP. | Astro `<Image>` generates responsive WebP with width/height and lazy-loading below the fold. Every product image gets descriptive alt text. |
| 12 | **Duplicate and malformed headings.** `/prototyping` and `/prototyping/` both resolve with 200 (duplicate titles; canonical is set correctly). `/over-the-wire/` has two identical H1s. `/manufacturing-path/sheet-metal-fabrication/` has two H1s. Home headings skip levels. | These are minor issues but easy to fix. | One H1 per page, checked on every build (`npm run check:site`). |

---

## 2. Site inventory summary

| Type | Count | Indexable | In sitemap |
|---|---:|---:|---:|
| Pages (capability, industry, about, contact, RFQ, legal) | 45 | 44 | 43 |
| Resources / case studies (incl. hub) | 7 | 7 | 7 |
| Blog posts | 129 | 5 | 5 |
| Archives / pagination | 30 | 15 | 2 |
| **Total unique HTML URLs on luptons.com** | **211** | **71** | **57** |

Status codes: 236 of 237 fetched URLs returned 200. The single 404 is Cloudflare's `/cdn-cgi/l/email-protection`. The 26 redirects are trailing-slash normalizations plus `/request-a-quote/` → `/manufacturing-path/` and `/data-centers/` → `luptonsolutions.com/datacenter`.

### Core page inventory

The words column counts main content only. The per-page image, link, CTA and schema detail is in the CSV.

| URL | Title | H1 | Words | Meta desc | Notes |
|---|---|---|---:|:---:|---|
| `/` | Custom Manufacturing Solutions for Engineered Components | Your next product breakthrough . | 146 | ✓ | Form GF1 (RFQ) embedded. Carousel slider LCP. |
| `/about-us/` | About Lupton Associates \| Custom Manufacturing Since 1969 | About Lupton Associates | 966 | ✓ | Full 2026 team with photos and bios. Strongest E-E-A-T page. |
| `/contact/` | Contact Lupton Associates for RFQs and Manufacturing Questions | Contact Lupton Associates | 61 | ✓ | Form GF2 (contact/careers/RFQ). Address and phone. |
| `/manufacturing-path/` | Manufacturing Path and Request for Quote \| Lupton Associates | Manufacturing Path and Request for Quote | 343 | ✓ | Form GF1 (2-page RFQ). Promises a response within one business day. |
| `/manufacturing-path/sheet-metal-fabrication/` | Sheet Metal Fabrication Capacity \| Lupton Associates | 2 H1s | 609 | ✓ | Campaign landing page, only 1 inbound link. GF1. |
| `/industries-served/` | Industries Served - Lupton Associates | Industries Served | 346 | ✓ | 6 sectors on one page. All nav sub-items link here. |
| `/data-centers/power-distribution-hardware/` | Data Center Power Distribution Hardware Manufacturing \| Lupton | Manufacturing paths for data center power distribution hardware | 622 | ✓ | Good content, 1 inbound link. |
| `/prototyping/` | Prototyping \| Lupton Associates | Prototyping | 728 | ✓ | Different template (3 scripts, 31 KB). Fast. Heavy "concept visual" disclaimers. |
| `/electronics/` | Electronics Manufacturing and Assembly Support | Electronics | 143 | ✓ | Thin hub. |
| `/electronics/electronic-manufacturing/` | Electronic Manufacturing Services for OEMs | Electronic Manufacturing | 329 | ✓ | Capability list hedged "may include." |
| `/electronics/offshore-contract-manufacturing/` | Offshore Contract Manufacturing - Lupton Associates | Offshore Contract Manufacturing | 198 | ✗ | Thin. Generic. |
| `/electronics/cable-assemblies/` | Custom Cable Assemblies & Wire Harnesses \| Lupton Associates | Custom Cable Assemblies and Wire Harnesses | 617 | ✓ | Strong: 24 AWG–4/0, ISO 9001:2015, UL 764 sources, FAQ schema. |
| `/electronics/microelectronics/` | Microelectronics - Lupton Associates | Microelectronics | 230 | ✗ | Specific specs (01005, WLCSP, 12.5 µm flex). |
| `/metal-fabrication/` | Metal Fabrication for Custom Engineered Components | Metal Fabrication | 237 | ✓ | Claims "save as much as 30%." |
| `/metal-fabrication/sheetmetal-fabrication/` | Sheet Metal Fabrication for OEM Component Programs | Sheetmetal Fabrication | 226 | ✓ | "Salvagnini panel benders," "Powder coating (5 conveyor lines)," weldment example. |
| `/metal-fabrication/short-run-stamping/` | Short Run Metal Stamping \| 2,500 to 100,000 Parts/Yr \| Lupton Associates | Short Run Metal Stamping | 699 | ✓ | Best page on the site: clear thresholds, FAQ schema, case study. |
| `/metal-fabrication/progressive-die-stamping/` | Progressive Die Stamping for High-Volume Parts \| Lupton | Progressive Die Stamping | 619 | ✓ | Good. >100,000 pcs/yr threshold. |
| `/machined-components/` | Machined Components - Lupton Associates | Machined Components | 154 | ✗ | Equipment/material list only. |
| `/machined-components/castings/` | Custom Casting Solutions for Engineered Components | Castings | 168 | ✓ | "Graphite tooling <4 weeks," "capacities up to 4500T." |
| `/machined-components/aluminum-extrusions/` | Aluminum Extrusions - Lupton Associates | Aluminum Extrusions | 292 | ✗ | Generic process description. "14 in. diameter" and "15,000 tons" are industry figures. |
| `/machined-components/cold-plates/` | Cold Plates and Liquid Cooling Components \| Lupton Associates | Cold plates and liquid cooling components for high-heat equipment | 644 | ✓ | Good RFQ-input list. |
| `/thermoplastic-and-thermoset-molding/` | Thermoplastic and Thermoset Molding for Engineered Components | Thermoplastic and Thermoset Molding | 172 | ✓ | Hub. |
| `…/injection-molding/` | Custom Injection Molding for Engineered Components | Injection Molding | 210 | ✓ | "20 to 3300 tons." |
| `…/gas-assist-injection-molding/` | Gas Assist Injection Molding \| Lupton Associates | Gas Assist Injection Molding | 712 | ✓ | |
| `…/structural-web-molding/` | Structural Foam Molding: Low & High Pressure \| Lupton | Structural Foam Molding | 756 | ✓ | URL slug says "web," page says "foam." |
| `…/rotational-molding/` | Rotational Molding for Hollow Plastic Parts \| Lupton Associates | Rotational molding for hollow, one-piece plastic components | 688 | ✓ | |
| `…/thermoforming/` | Thermoforming - Lupton Associates | Thermoforming | 231 | ✗ | 6 images without alt. |
| `…/rim/`, `…/compression-molding/`, `…/blow-molding/`, `…/low-volume-composites/`, `…/plastic-fabrication/` | "X - Lupton Associates" | | 137–237 | mostly ✗ | Thin. |
| `/other-custom-solutions/` + labels, gas springs, lift systems, active cleaning/sealing | "X \| Lupton Associates" | | 699–735 | ✓ | Newer template. Solid. |
| `/resources/` | Case Studies and Manufacturing Resources | Case Studies & Resources | 323 | ✓ | Lists 12 case studies dated 2018 by author "jessicaskorich" (author archive 404s). |
| `/resources/choose-manufacturing-process-custom-part/` | How to Choose a Manufacturing Process for a Custom Part \| Lupton | How should this part be made? | 775 | ✓ | Good answer content. |
| `/resources/why-custom-part-is-difficult-to-quote/` | Why a Custom Part Is Difficult to Quote \| Lupton Associates | Why is this part difficult to quote? | 729 | ✓ | Good. |
| `/resources/second-source-custom-components/` | Second-Source Manufacturing for Custom Components \| Lupton | Build a second source before the current path fails | 659 | ✓ | 2 inbound links. |
| `/resources/short-run-stamping-part-conversion/` | Short-Run Stamping Part Conversion Case Study \| Lupton Associates | (same) | 203 | ✓ | $2.65 → $1.45/pc, $1,000 tooling, 10k pcs/yr. |
| `/resources/automated-pharmaceutical-dispensing-machine-structural-frame/` | … | … | 199 | ✓ | ±0.050 in. diagonal, 0.030 in. positional, AWS D1.1. |
| `/resources/contract-manufacturing-cryogenic-vacuum-pump/` | … | … | 158 | ✓ | |
| `/field-signal/` | The Lupton Field Signal \| Manufacturing and RFQ Intelligence | The Lupton Field Signal | 1,425 | ✓ | Newsletter-style market notes. |
| `/over-the-wire/`, `/over-the-wire/july-2026/` | Over The Wire | 2 identical H1s | 281 / 961 | ✗ | Newsletter. |
| `/office-space-for-lease/` | Office Space for Lease - Lupton Associates | | 81 | ✗ | Indexable and off-topic. Move off the main nav/sitemap. |
| `/privacy-statement-us/`, `/opt-out-preferences/` | | | 11–12 | ✗ | Near-empty consent-manager stubs, indexable. |

---

## 3. Forms and conversion paths

| Form | Where | Fields | Submits to | Notes |
|---|---|---|---|---|
| **Gravity Forms #1: RFQ** | `/`, `/manufacturing-path/`, `/manufacturing-path/sheet-metal-fabrication/` | Page 1: Name*, Work email*, Company*, Phone, Annual volume, **Drawing upload**. Page 2: "What are you trying to make or solve?"*, Material/performance, Timing. Buttons: Continue → Previous / **Send RFQ** | `POST` multipart to the same page (`action="/manufacturing-path/#gf_1"`), handled by the Gravity Forms plugin. Akismet honeypot (`ak_hp_textarea`). | A GA4 listener in the page (`trackFormSubmit`) fires on the Gravity Forms confirmation wrapper. Notification routing and recipients are set in the WP admin; I did not access it. |
| **Gravity Forms #2: Contact** | `/contact/` | Name*, Work email*, Phone, **"How can our team help?"*** (General Contact / Career Opportunities / Request a Quote), Company*, then conditional fields: make/solve*, drawing upload, volume, material, timing (RFQ branch) · position type, "about yourself"*, resume upload (Careers branch) · Message* (General) | `POST` multipart to `/contact/` | One form carries three intents. Careers submissions mix into sales intake. |
| **Book time** | Contact, RFQ, most capability pages | n/a | `outlook.office.com/book/LuptonAssociates@luptons.com/` (shared team Bookings page) | Correctly team-branded. |
| **Chatbot** | Site-wide | n/a | Script from `www.luptonsolutions.com/luptons-chatbot-v2/widget.js` | Opens a "Project/RFQ Review" card per the sheet metal page copy. |
| **Phone** | Header, every page | (585) 393-4999 | `tel:` | |
| **Email** | Header, every page | Cloudflare-obfuscated | `/cdn-cgi/l/email-protection` (404 for crawlers) | AI engines and crawlers never see the address. |

**CTA inventory.** The header on every page has *Contact* and *Request a Quote*. Body CTAs vary: "see more," "learn more," "Request a Quote," "Start the manufacturing path," "Submit a project," "Ask questions first," "Book time with our team," "Send drawings for review." The home page's six capability CTAs all say "see more." Lighthouse flags "Links do not have descriptive text."

**The prototype does not wire up a live submit.** Per the guardrail, the prototype RFQ form mirrors GF1's fields, and its submit handler is stubbed so it does not post anywhere. At launch, it can post to the existing Gravity Forms endpoint (GF REST API `POST /wp-json/gf/v2/forms/1/submissions` with an application password on a server-side proxy), to a serverless function that emails and creates the RepFabric opportunity, or to HubSpot/Formspark. That is a decision for review.

---

## 4. Technical findings

### Speed (Lighthouse 12, mobile, simulated throttling, run 2026-09-23 from a cloud container)

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Weight | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | **35** | 91 | 79 | 92 | 4.0 s | **19.3 s** | 1,040 ms | 0.007 | 4,830 KiB | 166 |
| `/metal-fabrication/short-run-stamping/` | **46** | 92 | 75 | 100 | 3.3 s | 14.9 s | 650 ms | 0 | 5,267 KiB | 135 |
| `/manufacturing-path/` | **53** | 87 | 75 | 92 | 3.5 s | 6.5 s | 380 ms | 0.014 | 3,751 KiB | 146 |

Absolute timings are pessimistic because the container routes through a proxy. The relative picture holds: about 1.5 s of render-blocking CSS/JS, about 430 KiB of unused JS, and a carousel image as the home LCP element. The Google PageSpeed API was over its daily quota, so field (CrUX) data was not available. Re-run PSI from a normal connection before launch to get the field numbers.

**Root causes:** the Qode "luptons" theme (v7.0.5) plus Elementor 4.2 plus Elementor Pro plus WPBakery (js_composer 6.10) plus Gravity Forms plus Site Kit plus Akismet plus Qode Quick Links; jQuery + jQuery Migrate + about 30 jQuery UI modules on every page; Google Maps JS on every page (only needed on Contact); carouFredSel/fullPage.js/lemmon slider/isotope loaded site-wide.

**Other speed notes:** Cloudflare + LiteSpeed caching are on (good TTFB, about 1 s from the crawler). HSTS, `nosniff` and a referrer policy are set. The Maps JS key is visible in page source, which is normal for browser keys. Confirm it is HTTP-referrer restricted in Google Cloud.

### Mobile
Every page has a viewport meta tag. Lighthouse found no tap-target or font-size failures, but it found contrast failures on all three pages, links without discernible names (icon-only social/header links), and on `/manufacturing-path/`, images without `alt`.

### Crawlability and indexing
- `robots.txt` is Yoast's default (`Disallow:` empty) and declares the sitemap index. Fine.
- The sitemap omits 124 noindexed posts (correct) but includes `/office-space-for-lease/`, `/opt-out-preferences/` and `/privacy-statement-us/` (low value).
- Canonicals are set on indexable pages. www → apex and http → https are both 301. Trailing-slash URLs 301 to slash.
- `/wp-json/` exposes the REST index publicly (normal for WP). `/?s=` search results return 200. Add `noindex` to search if it is not already set.
- Leftover theme taxonomies are live and indexable: `/testimonials-category/web-development/`, `/slides-category/slider/`, `/carousels-category/carousel/`. Noindex or remove them. They are also in llms.txt.

### AI crawler access

| Agent | Result on `/metal-fabrication/short-run-stamping/` |
|---|---|
| GPTBot, OAI-SearchBot, ChatGPT-User | 200, full HTML, content present |
| ClaudeBot, Claude-User | 200, full HTML, content present |
| PerplexityBot | 200, full HTML, content present |
| Google-Extended, Googlebot, Bingbot | 200, full HTML, content present |

`robots.txt` does not block any AI agent. **Caveat:** Cloudflare's "Block AI bots" and "AI Labyrinth" settings act on *verified* bot IPs, not user-agent strings, so a spoofed-UA test from a cloud IP cannot prove the real bots get through. Confirm in Cloudflare → Security → Bots that AI crawlers are **allowed** (or set to "Allow" under AI Crawl Control), and check the Cloudflare AI Audit log for GPTBot, ClaudeBot and PerplexityBot 200s.

The bigger AI-visibility problem is content shape, not blocking:
1. Core claims live in thin legacy pages or as hedged lists ("may include," "subject to verification"). AI engines cite pages that state a clear answer.
2. `luptonsolutions.com/datacenter` is client-rendered. The initial HTML is about 5.8 KB with the content injected by JS, and most AI crawlers do not execute JavaScript.
3. llms.txt covers 5 of about 45 useful pages and includes demo taxonomies.
4. There are no stable "facts" the engines can cite: founding year, HQ address, territory, response time and processes are scattered across pages. The prototype puts them in visible copy **and** in JSON-LD on every page.

### Schema (JSON-LD)
- Present: Yoast graph (WebSite, Organization, WebPage/CollectionPage, BreadcrumbList, Article + Person for posts). `Service` on 24 pages. `FAQPage` on 3.
- Missing: `LocalBusiness`/`PostalAddress`/`telephone`/`areaServed` on Organization, `foundingDate` on the main-site Organization (it is present only on luptonsolutions.com), `Person` for Alan/Joe on About, `FAQPage` on every page that has Q&A (progressive die, cold plates, data center power, RFQ), `HowTo`/`ItemList` for the RFQ checklist, `ImageObject` on case studies.

### Broken links
- **Internal:** none broken except the Cloudflare email-protection URL (404 to crawlers, on every page).
- **Redirect hops:** 27 internal links in 24 unique URLs link to a redirect (non-slash URLs, `/data-centers/`).
- **External (all in old blog posts):** `whitehouse.gov/.../ERP-2019.pdf` (404), `volvotrucks.com/.../pressrelease-190613.html` (404), `http://vsat` (malformed href), `acq.osd.mil/cmmc/` (TLS error). Several news sites return 403/401 to bots (Bloomberg, NYT, WSJ, Forbes). Those are paywall behavior, not broken links.
- **Social:** Instagram (sitewide) redirects to login. LinkedIn profile links return 999 (LinkedIn blocks bots). Both are normal.

### Missing alt text
284 `<img>` tags lack alt, across these top offenders:
- `wp-content/uploads/2017/10/header-9.jpg`: 160 occurrences (a sitewide header image).
- `2026/07/manufacturing-facility-interior-optimized.jpg`: 16.
- `2017/10/prototyping-header.jpg`: 14.
- Team thumbnails on old posts.
- Thermoforming (6), progressive die (5), sheetmetal (5), RIM (5).

### Thin pages (indexable, <300 words of main content)
`/` (146), `/contact/` (61), `/electronics/` (143), `/machined-components/` (154), `/machined-components/castings/` (168), `/thermoplastic-and-thermoset-molding/` (172), blow molding (174), plastic fabrication (167), low-volume composites (137), offshore contract manufacturing (198), injection molding (210), compression molding (216), sheetmetal fabrication (226), microelectronics (230), thermoforming (231), metal fabrication (237), RIM (237), aluminum extrusions (292), the 3 case studies (158–203), office space (81), privacy (12), opt-out (11), and 3 posts. 30 pages in total.

### Duplicate titles
- "Insights Archive" ×15 (`/company-news/page/N/`, noindexed).
- "Prototyping | Lupton Associates" ×2 (`/prototyping` and `/prototyping/`, canonicalized).
- "Happy Holidays - Lupton Associates" ×2 (noindexed).
- Generic "X - Lupton Associates" titles on 16 indexable pages with no descriptor.

### Content accuracy flags (for the rewrite)
These claims appear on the live site. Several are legacy (2015–2018) and specific to one manufacturer. The live Prototyping page itself says legacy equipment, capacity and certification claims "are not treated as blanket Lupton capabilities." I carried them into the prototype **only with a [CONFIRM] tag**:
- "save as much as 30% over traditional metal fabrication" (metal fabrication hub)
- "Powder coating (5 conveyor lines)," "Salvagnini panel benders," "over 1,100 inches of manual weld… 130 gallon… service life in excess of 15 years" (sheetmetal)
- "injection molding capabilities range from 20 to 3300 tons" (injection molding)
- "capacities up to 4500T," "graphite tooling produced in less than four weeks" (castings)
- "Spindle speeds greater than 20,000 RPM" (machined components)
- "01005 passives," "0.3–0.5 mm WLCSP," "flex down to 12.5 microns" (microelectronics)
- "ISO 9001:2015-certified operations and UL 764 wire-harness capabilities" (cable assemblies: newer copy, lower risk)
- "Expect a response within one business day" (RFQ page: a service promise that needs an owner)

---

## 5. What is already good (keep it)

- **Short Run Stamping, Progressive Die, Cable Assemblies, Cold Plates, Data Center Power, and the three "how to" resources.** These are written the right way: a buyer question, clear thresholds, what to send, FAQ. The new templates generalize this pattern.
- **The About page.** It has the real team with photos, start years and territories. That is strong E-E-A-T and it carries over nearly verbatim.
- **Honest scoping language.** "Lupton reviews… the manufacturer confirms feasibility, capacity, pricing, lead time." This protects credibility. The prototype keeps it, shortened, and moves it out of the first two sentences.
- **Published case studies with hard numbers.** Short-run conversion ($2.65 → $1.45/pc), pharma frame tolerances. These are the most citable facts on the site.
- **Team-branded booking** (shared Bookings page, not a personal link).

---

## 6. Recommendations carried into the architecture (see `sitemap.md`)

1. One domain. Fold luptonsolutions.com/datacenter into luptons.com.
2. Intent-first URL scheme: `/capabilities/…`, `/industries/…`, `/industries/{industry}/{capability}/`, `/resources/…`, `/rfq/`, `/about/`. Full 301 map from all 50 legacy URLs.
3. Every page opens with two sentences that answer the buyer's question. Specs come next, verified or tagged [CONFIRM].
4. Static HTML output (Astro), a hand-curated llms.txt + llms-full.txt, complete JSON-LD, and zero page-builder JS.
5. The RFQ is one screen, the upload is first, and the "what happens next" promise is explicit (with an owner).
6. Noindex or remove demo taxonomies, office-space and consent stubs from the index. Migrate 3–5 blog posts with buyer value into Resources and leave the rest noindexed.
