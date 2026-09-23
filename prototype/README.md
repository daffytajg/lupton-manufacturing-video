# luptons.com redesign: working prototype

A separate, static prototype of the new luptons.com. **It does not touch the live WordPress site.** Nothing is deployed, forms post nowhere, and every page carries `noindex` and a "prototype" banner.

```bash
cd prototype
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
npm run check:site   # post-build checks (see below)
```

Start at `/` and `/review/`. The review page lists every unverified claim ([CONFIRM]) by page, plus the 301 redirect map.

## Why Astro, not a Next.js static export

| | Astro (chosen) | Next.js `output: 'export'` |
|---|---|---|
| JS shipped to a content page | **None by default.** This site ships one 6.6 KB motion module (2.6 KB gzipped). | React runtime plus hydration on every page, typically 80–100 KB+ before any site code |
| What crawlers and AI bots get | Complete HTML for every page | Complete HTML too, but with a large JS payload the page doesn't need |
| Content model | Typed TS data (`src/data/*.ts`) → 40 pages from 5 templates | Same is possible |
| Images | `astro:assets` generates responsive WebP with width/height at build | `next/image` optimization is not available in static export without a loader |
| Hosting | Any static host (Cloudflare Pages, Netlify, S3), or behind the existing Cloudflare zone | Same |
| Future CMS | Content collections or headless WordPress later | Same |

This is a marketing and content site with almost no app state, so shipping zero framework JS is the deciding factor. It is also the main reason the prototype scores 93–97 on mobile Lighthouse performance against the live site's 35–53.

## Results (measured 2026-09-23, Lighthouse 12, mobile)

| Page | Live site perf / a11y / best practices | Prototype perf / a11y / best practices |
|---|---|---|
| Home | 35 / 91 / 79 (LCP 19.3 s, 4.8 MB, 166 requests) | **93 / 100 / 100** (LCP 2.8 s, 314 KB) |
| Short run stamping | 46 / 92 / 75 (LCP 14.9 s, 5.3 MB) | **96 / 98→100 / 100** (LCP 2.4 s, 235 KB) |
| RFQ | 53 / 87 / 75 | **96 / 100 / 100** (LCP 2.3 s, 215 KB) |

The live site was measured through the container's proxy and the prototype on localhost, so absolute timings favor the prototype. Page weight and request counts compare directly. The prototype's SEO category scores 69 only because prototype pages are deliberately `noindex`. In a production build (`PUBLIC_PROTOTYPE=false`) that check passes.

## Structure

```
src/
  data/            ← all copy lives here
    site.ts          company facts, nav, team (from luptons.com/about-us)
    capabilities.ts  10 capabilities + 2 stamping sub-pages
    industries.ts    7 industries
    combos.ts        6 capability × industry pages
    resources.ts     4 guides + 3 case studies
    redirects.ts     301 map from every indexable legacy URL
  components/      PageHero, CapabilityPage, Blueprint (animated drawings), ProcessFinder, Steps, Blocks, …
  pages/           routes (file-based), llms.txt, llms-full.txt, robots.txt, review page
  lib/             rich text + [CONFIRM], JSON-LD builders, llms builders, image registry
  scripts/motion.ts  the only client JS
  styles/global.css  design tokens + all styles
public/            logo variants, OG image, favicon, the 38-second story video (re-encoded to 2 MB)
scripts/           check-site.mjs (post-build QA), architecture-table.mjs (feeds /sitemap.md)
```

## The [CONFIRM] system

- Write `[CONFIRM]` or `[CONFIRM: note]` anywhere in a data string. In the prototype it renders as a yellow chip and is listed on `/review/`.
- `plain()` strips it, and every JSON-LD and llms.txt builder **drops the whole sentence, spec or FAQ that contains it**, so unverified claims never reach structured data.
- `PUBLIC_PROTOTYPE=false npm run build` **fails** on the first unresolved [CONFIRM], so an unverified claim can never ship with its tag silently removed. Resolve each one by deleting the tag (verified), rewriting the claim, or cutting it.

## Motion

MotionSites (motionsites.ai) sells a prompt library for AI-built landing pages: video heroes, glass navs, blur-in type, glow cards, marquees, animated backgrounds. Its prompts sit behind an account and paywall, so this prototype does not copy them. It implements that motion vocabulary natively, for a manufacturing audience:

| Pattern | Where | How |
|---|---|---|
| Animated background hero | Every hero | Drifting blueprint grid, three slow aurora glows, film grain, cursor spotlight (CSS) |
| **Laser toolpath drawing** (signature) | Hero art on home and on pages without a strong photo | SVG part drawing (enclosure flat pattern, bracket, bus bar, harness, heat sink, PCB…) draws itself, then a hot laser head traces the outline throwing sparks, then an inspection scan sweeps |
| Blur-in headline | Every H1 | Words un-blur and rise in sequence (text stays in HTML for crawlers) |
| Liquid-glass nav | Site-wide | Transparent at top, frosted pill on scroll |
| Scramble text | Eyebrows | Mono label decodes on entry |
| Infinite marquee | Home | 32 processes, pauses on hover |
| Glow cards | Every card grid | Cursor-tracked radial glow and a gradient border that follows the pointer |
| Magnetic buttons + shine sweep | Primary CTAs | Pointer-follow translate and a light sweep on hover |
| Horizontal scroll | Home industries | Vertical scroll drives a pinned horizontal track with a progress bar (desktop). Swipe-snap on mobile. |
| Scroll-linked progress | Top bar, how-it-works timeline | CSS scroll timeline; the timeline line fills and nodes light as you pass |
| Count-up | Since-1969 counters | Eased count on entry |
| Interactive tool | Process finder | Volume slider + blank size light up fab / short run / progressive die using the published thresholds |
| Page transitions | Site-wide | Native cross-document View Transitions (blur/fade), zero JS |
| Footer wordmark reveal | Site-wide | Giant LUPTON wordmark wipes in |

All of it respects `prefers-reduced-motion`. Content is visible without JS, and a 2.5 s safety net un-hides everything if the module fails to load.

## RFQ form → Gravity Forms #1 field mapping

| Prototype field | GF1 field on luptons.com |
|---|---|
| `files` (multiple) | `input_14` Drawing or project file |
| `solve` * | `input_15` What are you trying to make or solve? * |
| `process` | (new) routes to the right team member |
| `reason` | (new) new program / second source / cost-down / lead time / tariff |
| `volume` | `input_9` Estimated quantity or annual volume |
| `material` | `input_8` Material or performance requirement |
| `timing` | `input_11` Project timing |
| `name` * | `input_1.3` First & Last |
| `email` * | `input_2` Work Email |
| `company` * | `input_3` Company |
| `phone` | `input_5` Phone |

The submit handler in `src/scripts/motion.ts` is a stub that shows the confirmation state and sends nothing.

## Post-build checks (`npm run check:site`)

Checks one H1 per page, title ≤ 75 chars, meta description 70–165 chars, valid JSON-LD with no [CONFIRM] text, `alt` on every image, no broken internal links, and no [CONFIRM] in llms.txt or llms-full.txt. It also reports words, CONFIRM count and HTML weight per page. Current result: 40 pages, all checks pass. All 39 content pages were also checked at 375 px for horizontal overflow and console errors (none).

## Launch checklist (not done; needs approval)

1. Resolve every item on `/review/` (99 chips across ~55 claims).
2. Decide the open questions in `/sitemap.md` → "Decisions needed".
3. Wire the RFQ form backend. Add GA4 events.
4. Build the ◻ migrate pages (plastic molding sub-pages, other solutions, newsletters, privacy).
5. Replace legacy low-resolution photos (see shot list in `/sitemap.md`).
6. `PUBLIC_PROTOTYPE=false npm run build` (fails until step 1 is done). Deploy to a staging host. Run `check:site` and Lighthouse.
7. Apply the 301 map at the edge, then cut DNS. Resubmit sitemaps to Google Search Console and Bing Webmaster Tools. Confirm Cloudflare AI-bot settings.
