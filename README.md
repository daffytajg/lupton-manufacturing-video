# Trident Wealth Management Group — website redesign concept

A motion-first rebuild of [trident-wealth.com](https://www.trident-wealth.com/) as a static site, with an AI concierge (**Navigator**), an in-browser **Planning Lab**, and the firm's real content — team, services, insights and disclosures.

No build step. Open `index.html` or serve the folder:

```bash
npm run dev          # serves on http://localhost:4173
npm run check        # syntax-checks every script
```

## What's in the box

| Area | Where | Notes |
|---|---|---|
| Home | `index.html` | Interactive flow-field hero, live "agent console", pinned Strength/Skill/Value story, persona switcher, Navigator showcase, Planning Lab teaser, team, process timeline, insights, founder tribute |
| About | `strength.html`, `skill.html`, `value.html` | Team grid + full bios, four service disciplines, value props with an interactive fee-drag illustration |
| Insights | `insights.html`, `insights/*.html` | Search + category filters, typed "AI takeaways" per card; article pages with table of contents, key takeaways, **Listen** (browser speech synthesis), related pieces |
| Planning Lab | `planning-lab.html` | Retirement Readiness Pulse (7-question score), Scenario Lab (1,000-path Monte Carlo fan chart with hover crosshair + table view), Social Security timing (claim-age comparison with break-even) |
| Contact / Login / Disclosures | `contact.html`, `client-login.html`, `disclosures.html` | Validated form with success state, map, Wealthscape + Envestnet portal cards, full regulatory copy |
| Navigator | `assets/js/assistant.js` | Floating concierge, see below |
| Command palette | `Ctrl/⌘ + K` | Searches pages, advisors, insights, tools and actions |

### Motion system (`assets/js/motion.js`)
Lenis smooth scroll, GSAP ScrollTrigger flourishes, scroll reveals with stagger, word-split headline reveals, parallax, counters, magnetic buttons, 3D tilt cards with pointer spotlight, custom cursor, marquee, page-transition curtain. Everything degrades without the CDN libraries and honours `prefers-reduced-motion`.

### Navigator (`assets/js/assistant.js`)
Runs fully client-side by default ("on-site knowledge mode"):

- Intent routing + whole-word retrieval over the knowledge base in `assets/js/knowledge.js` (team, services, FAQs, insights, portals)
- Visible "tool steps" and streamed replies, rich cards (advisors, articles, portals, stats with sparklines), suggested chips
- Slot-filling **introduction request** flow (name → email → phone → topic → timing → confirm) — stored in `localStorage` under `twm_inquiries` for the demo; wire `finishFlow()` to your CRM or form endpoint
- Educational calculators: retirement income estimate, RMD ages, Social Security timing, 4% guideline
- Page-aware greetings and proactive nudges (article summaries, lab explanations, contact hand-off)
- Voice input (Web Speech API), session persistence, expand/reset, keyboard shortcuts
- Guardrails: declines personalized advice and hands off to an advisor; disclosure pinned in the footer

**Claude-connected mode.** `api/chat.js` is a serverless function (Vercel-style Node) that streams replies from Claude using the same knowledge base as a cached system prompt. Deploy it with `ANTHROPIC_API_KEY` set, then point each page's `<meta name="twm-ai-endpoint" content="/api/chat">` at it. The widget streams from the endpoint and falls back to on-site mode if it's unreachable. Introduction requests always stay client-side.

```bash
npm install            # installs @anthropic-ai/sdk for the function
vercel dev             # or any host that runs api/*.js as Node functions
```

### Content
All copy, team bios, services, disclosures and the ten insights come from the current site. Headshots and photos are referenced from the live site's uploads with initials fallbacks — replace with local files in `assets/img/` for production. Article pages live in `insights/` and article metadata (summary, takeaways, category) lives in `knowledge.js`.

### Deployment
Static hosting (GitHub Pages, Netlify, Vercel, S3) works as-is — links are relative, so the site can live in a sub-path. The previous video landing page is preserved at `lupton-video.html`.

### Compliance notes
- Navigator and the Planning Lab are labelled as educational/illustrative on every surface and in `disclosures.html`.
- No testimonials, performance claims or fee figures are stated; the Forbes rating carries its SHOOK Research disclosure wherever it appears.
- The contact form and Navigator store demo submissions in the browser only; connect a real endpoint before launch.
