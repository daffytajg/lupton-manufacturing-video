# Site architecture: luptons.com redesign

Status: **proposal for review.** The prototype in [`prototype/`](prototype/) builds every page marked ✓ below with real copy. Nothing here is live and nothing has been changed on the WordPress site.

## Principles

1. **One domain.** Everything lives on luptons.com. The data center content comes back from luptonsolutions.com.
2. **Every URL answers one buyer question.** The H1 names the part family. The **first two sentences answer the question** with the thresholds, materials and processes that decide it, then say what to send.
3. **Specs are verified or flagged.** Untagged specs are published on luptons.com today. Anything else carries a yellow **[CONFIRM]** tag. [CONFIRM] text is kept out of JSON-LD and llms.txt automatically, and a production build fails while any [CONFIRM] remains (`prototype/src/lib/rich.ts`).
4. **Hub → spoke → cross-link.** Capability hubs and industry hubs, joined by capability × industry pages. Resources link back to both. Every page has breadcrumbs and three RFQ entry points.
5. **Static HTML first.** Every page is complete in the HTML response, which matters because AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not run JavaScript. Motion is progressive enhancement: with JS off or reduced motion on, every page is fully readable.
6. **Two conversion actions everywhere:** *Send an RFQ* (`/rfq/`) and *Book time with our team* (shared Microsoft Bookings page), plus the phone number.

## Sitemap

✓ built in the prototype · ◻ migrate existing content at the new URL · ✚ new page, next wave

```
/                                              ✓ Home
/capabilities/                                 ✓ Capability hub
├── metal-stamping/                            ✓
│   ├── short-run/                             ✓  (replaces /metal-fabrication/short-run-stamping/)
│   └── progressive-die/                       ✓
├── sheet-metal-fabrication/                   ✓
├── cnc-machining/                             ✓
├── wire-harnesses-cable-assemblies/           ✓
├── plastic-molding/                           ✓
│   ├── injection-molding/                     ◻
│   ├── gas-assist/                            ◻  (712 words today, keep)
│   ├── structural-foam/                       ◻  (756 words today, keep)
│   ├── rotational-molding/                    ◻  (688 words today, keep)
│   ├── thermoforming/                         ◻
│   └── rim/                                   ◻
├── casting/                                   ✓
├── extrusions/                                ✓
├── electronic-assembly/                       ✓
├── prototyping/                               ✓
├── low-cost-region-manufacturing/             ✓
└── other/  labels · cleaning & sealing · lift systems · gas springs   ◻
/industries/                                   ✓ Industry hub
├── data-center/                               ✓
│   ├── sheet-metal-enclosures/                ✓
│   ├── copper-busbars/                        ✓
│   └── cold-plates/                           ✓
├── medical/                                   ✓
│   ├── wire-harnesses/                        ✓
│   ├── metal-stamping/                        ✓
│   └── plastic-housings/                      ✚
├── heavy-truck/                               ✓
│   ├── wire-harnesses/                        ✚
│   └── metal-stamping/                        ✚
├── military-aerospace/                        ✓
│   ├── cnc-machining/                         ✓
│   └── castings/                              ✚
├── robotics/                                  ✓
│   └── cable-assemblies/                      ✚
├── energy/                                    ✓
│   ├── battery-enclosures/                    ✚
│   └── copper-busbars/                        ✚
└── agriculture-heavy-equipment/               ✓
    └── rotational-molding/                    ✚
/rfq/                                          ✓ One-screen RFQ (replaces /manufacturing-path/ and /contact/)
/about/                                        ✓ Company, leadership, full team, contact facts
/resources/                                    ✓ Resource hub
├── fabrication-vs-stamping-break-even/        ✓ new answer
├── what-to-send-with-an-rfq/                  ✓ new answer (absorbs why-custom-part-is-difficult-to-quote)
├── choose-manufacturing-process-custom-part/  ✓ migrated
├── second-source-custom-components/           ✓ migrated
├── short-run-stamping-part-conversion/        ✓ case study
├── automated-pharmaceutical-dispensing-machine-structural-frame/ ✓ case study
├── contract-manufacturing-cryogenic-vacuum-pump/                 ✓ case study
├── (9 more 2018 case studies)                 ◻ rewrite from the PDFs
├── field-signal/ · over-the-wire/             ◻
└── next answers                               ✚ plastic process by size & volume · cable assembly vs wire harness ·
                                                  ISO 13485 for suppliers · domestic vs Mexico vs Asia landed cost ·
                                                  graphite vs die casting · UL 764 explained
/privacy/                                      ◻
/llms.txt · /llms-full.txt · /robots.txt · /sitemap-index.xml   ✓
/review/                                       ✓ reviewer-only: [CONFIRM] register + 301 map (noindex, not in sitemap)
```

**Why capability × industry pages sit under `/industries/`:** buyers search industry + part ("wire harness supplier medical", "sheet metal enclosures for data center racks"). Putting them under the industry keeps the breadcrumb honest (Industries › Medical › Medical wire harnesses), and each one links up to the capability page for process depth.

## Page templates

| Template | Order of sections | Schema |
|---|---|---|
| **Capability** | Hero (eyebrow · H1 · two-sentence answer · Send the drawing / Book time · photo or animated drawing · key stats) → routes we cover → decision table → process finder (sheet metal pages) → **specs** (verified vs [CONFIRM]) → **what to send** checklist → sub-pages → proof & applications → FAQ + industries → CTA band | WebPage, Service, BreadcrumbList, FAQPage |
| **Industry** | Hero → parts we see → capability × industry cards → the problems behind the RFQ → capabilities we route → requirements that change the quote → FAQ + proof → CTA | WebPage, Service, BreadcrumbList, FAQPage |
| **Capability × industry** | Hero → parts + requirements → process finder (stamping) → specs → RFQ package → FAQ + related → CTA | WebPage, Service, BreadcrumbList, FAQPage |
| **Resource** | Answer-first lede → body (tables, fact grids, lists) → FAQ → related links, publish date | WebPage, Article, BreadcrumbList, FAQPage |
| **RFQ** | One-screen form (upload first) → what happens next → what helps → FAQ | WebPage, BreadcrumbList, FAQPage |
| **Home** | Hero → process marquee → 10-capability bento → "a part and a problem" triggers → process finder → industries (horizontal scroll) → how it works → published results → since-1969 story video → at-a-glance facts + FAQ → CTA | Organization/ProfessionalService, WebSite, WebPage, FAQPage |

Every page also carries the Organization node: name, address, phone, founding date, areaServed (US/CA/MX), knowsAbout (processes) and leadership.

## Internal linking rules

- Capability → its industries (chips), its capability × industry pages, its proof resources, its sub-pages.
- Industry → its capabilities (cards with one line each), its capability × industry pages, its proof.
- Capability × industry → both parents (breadcrumb + "full process detail" link) and sibling combos that share the industry or capability.
- Resource → related capabilities and industries.
- Every page → `/rfq/` at least three times (nav, hero, CTA band) and the Bookings link at least twice.

## Conversion and measurement

- **RFQ form** mirrors Gravity Forms #1 (name, work email, company, phone, volume, drawing upload, "what are you trying to make or solve?", material, timing). It adds *process* and *why are you quoting* selects so routing and CRM source tagging start at intake. The prototype submit handler is stubbed and posts nothing.
- **Launch options for the form backend** (decision needed): (a) keep Gravity Forms as the system of record via its REST API behind a small serverless proxy; (b) a serverless function that emails the team, stores files in SharePoint and creates the RepFabric opportunity [CONFIRM RepFabric API]; (c) a hosted form service. (a) is the least change for the office. (b) is the best for speed-to-lead.
- **Events to track (GA4):** `rfq_submit`, `rfq_file_attached`, `book_click`, `phone_click`, `finder_used`, `video_play`. Pass UTM/source into hidden fields so RepFabric gets the source.

## AI answer-engine plan

1. Answer-first ledes on every page, written so a single sentence can be quoted.
2. A visible "Lupton at a glance" facts block that matches the JSON-LD and llms.txt word for word (name, founded, HQ, coverage, model, response time, phone).
3. `llms.txt` (index with a one-line answer per page) and `llms-full.txt` (full verified text), both generated from the page data.
4. robots.txt explicitly allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Google-Extended and Bingbot. **Also check Cloudflare → Security → Bots / AI Crawl Control**, which can block these bots whatever robots.txt says.
5. Submit the sitemap to Google Search Console **and Bing Webmaster Tools** (ChatGPT search relies heavily on Bing's index). Turn on IndexNow.
6. Monthly prompt tracking: the 20 buyer prompts in `search-intent.md` across ChatGPT, Perplexity, Claude and Google AI Overviews. Log citations and cited URLs.

## Decisions needed before launch

1. **Line card.** Name the manufacturers we work with (stronger entity signals and proof, more AI citations), or keep them unnamed as today? The prototype does not name them.
2. **Email address** to publish in plain text (today it is Cloudflare-obfuscated and invisible to crawlers).
3. **"No fee to the buyer" statement** on the home FAQ: approve or cut.
4. **Form backend** (above) and who owns the one-business-day response.
5. **Hosting.** A static host (Cloudflare Pages, already on Cloudflare DNS, is the natural fit) with WordPress retired or kept only for the newsletter archive. Cut over with the 301 map below.
6. **Old blog posts:** keep them noindexed at their URLs, or return 410.
7. **Photography.** No verified photos exist for bus bars, harness benches or cold plates in production. Shot list: stamping press + parts, bus bars, harness bench, cold plate leak test, finishing line, team at work.
8. **Chatbot.** The live site loads a widget from luptonsolutions.com. The prototype leaves it out. Decide whether it returns on the new site.

## Page-by-page: the question each page answers

Generated from the prototype data (`node prototype/scripts/architecture-table.mjs`), so it matches the built pages exactly. [CONFIRM] marks unverified claims.

| URL | Type | Buyer question | H1 | First two sentences (the answer) |
|---|---|---|---|---|
| `/capabilities/metal-stamping/` | Capability | Should my sheet metal part be stamped, and which stamping path pays? | Metal stamping, from short run to progressive die | If your sheet metal part runs roughly 2,500 to 100,000 pieces a year and fits inside about 20 × 30 in. in the flat, short run stamping usually beats laser-and-brake fabrication on piece price without the cost of a progressive die; above roughly 100,000 a year, a progressive die usually wins. Send the print, material, gauge and annual volume, and Lupton will tell you which path pays at your numbers, then get you a quote directly from a stamping shop that runs it. |
| `/capabilities/metal-stamping/short-run/` | Capability (sub) | What is short run stamping and does my part qualify? | Short run metal stamping | Short run metal stamping fills the gap between laser-cut fabrication and progressive dies: it fits sheet metal parts that run roughly 2,500 to 100,000 pieces a year and fit inside about 20 × 30 in. in the flat. Because steel die inserts run in a shared master die holder, you tool the features instead of building a dedicated die, so tooling typically ships in weeks and costs a fraction of progressive-die NRE. |
| `/capabilities/metal-stamping/progressive-die/` | Capability (sub) | Will a progressive die pay back at my volume? | Progressive die stamping | Progressive die stamping makes sense when annual volume climbs past roughly 100,000 pieces and the part is small enough for a coil-fed, multi-station die; per-piece cost drops sharply, but the die costs real money and takes real time to build. Send the print, material, annual and lifetime volume and program length, and Lupton will run the tooling payback with you, or show you the short run path if the volume is not there yet. |
| `/capabilities/sheet-metal-fabrication/` | Capability | Who can fabricate, finish and assemble my enclosure or weldment? | Sheet metal fabrication for enclosures, chassis and weldments | For laser-cut, punched, formed and welded sheet metal (brackets, panels, chassis, electrical enclosures, racks and structural weldments), Lupton matches the part to a fabricator with the right equipment, finishing line and capacity, from prototype quantities through production. Send the drawing, material, gauge, finish and annual volume; the shop quotes you directly, domestic or low-cost region, with finishing and assembly in the same quote. |
| `/capabilities/cnc-machining/` | Capability | Who can machine this, in this alloy, to these tolerances and certifications? | Precision CNC machining, grinding and EDM | For machined parts (5-axis and 3-axis milling, CNC and Swiss turning, creep feed grinding, wire and conventional EDM, and brazed assemblies), Lupton works with shops that cut aluminum, stainless, titanium, Inconel, Invar, copper, brass, magnesium and engineered plastics, from prototype lots to production. Send the print with tolerances, material, quantity and any AS9100, ITAR or medical requirements, and we will route it only to shops that hold them and get you a direct quote. |
| `/capabilities/wire-harnesses-cable-assemblies/` | Capability | Who will build my harness to print, at my volume? | Custom wire harnesses and cable assemblies, built to print | Lupton gets build-to-print cable assemblies and wire harnesses quoted and built, from 24 AWG multi-conductor harnesses and overmolded assemblies to heavy power cables up to 4/0, from prototypes through production, with no minimum program size for our review. Send the drawing, BOM or wire list with connector part numbers, annual volume and test requirements; we review it, flag hard-to-source components, and match it to a harness shop with the right certifications. |
| `/capabilities/plastic-molding/` | Capability | Which plastic process fits my part size and volume? | Plastic molding, matched to part size and volume | The right plastic process depends mostly on part size and annual volume: injection molding for high volume and fine detail, structural foam and gas assist for large rigid housings, RIM and thermoforming for large covers at low volume, and rotational molding for hollow one-piece parts. Lupton helps you pick the process before you pay for tooling: send the model, resin, volume and cosmetic requirements, and we will compare the paths and get quotes from molders that run them. |
| `/capabilities/casting/` | Capability | Which casting process, and can I get it machined? | Metal castings: die, investment, sand, graphite and permanent mold | Lupton works with foundries and die casters across high-pressure aluminum and zinc die casting, graphite and plaster mold casting, investment casting, air-set sand, permanent mold, grey iron and stainless, delivered as-cast or machined and finished. For prototypes and low volumes, graphite or plaster mold casting gets you production-like aluminum parts without a production die-cast tool. Send the model, alloy, annual volume and critical dimensions and we will recommend the process and get it quoted. |
| `/capabilities/extrusions/` | Capability | Can I get a custom profile extruded, fabricated and anodized in one order? | Aluminum and plastic extrusions, cut, machined and finished | Aluminum extrusion fits parts with a constant cross-section (heat sinks, rails, frames, enclosures and structural profiles) because it is light, strong for its weight and inexpensive to tool; Lupton gets custom profiles quoted with fabrication and finishing in the same order. Send the profile drawing, alloy and temper, cut lengths, secondary operations and annual volume, and we will route it to an extruder that can run the die, fabrication and anodize together. |
| `/capabilities/electronic-assembly/` | Capability | Who can build my PCBA and box build, with the right certifications? | PCB assembly, box build and microelectronics | Lupton gets printed circuit board assemblies and complete box builds quoted and built (SMT and through-hole, fine pitch and BGA, conformal coat and potting, harnesses and final test) from quick-turn prototypes through high-volume domestic or offshore production. Send the Gerbers, BOM, assembly drawings, test requirements and volumes; we check the program against each EMS provider’s certifications and capacity before it goes out for quote. |
| `/capabilities/prototyping/` | Capability | Which prototype route answers my question without boxing me out of production? | Prototypes that answer the question you need answered | A useful prototype answers a defined question (fit, function, appearance, material behavior, assembly or test), so Lupton starts with what the prototype must prove, then picks the route: additive or SLA, cast urethane, CNC machining, sheet metal or short run stamping, graphite or sand casting, or bridge tooling. Send the model, the quantity, the date you need parts and the production process you expect to use, and we will recommend a prototype route that does not box you out of production. |
| `/capabilities/low-cost-region-manufacturing/` | Capability | Should this move offshore or to Mexico, and who manages it? | Low-cost region manufacturing, with a North American contact | When volume is high and cost is the driver, Lupton moves custom parts and box builds to qualified manufacturers in Asia and Mexico, with DFM, program management, quality planning and domestic warehousing handled so your team is not managing an overseas supplier alone. Send the drawing, annual volume, target price and current landed cost; we will compare offshore, nearshore and domestic options on the same drawing, including when staying domestic is the better call. |
| `/industries/data-center/` | Industry | Who can supply enclosures, bus bars, cold plates and harnesses for our power/cooling gear? | Data center hardware: enclosures, bus bars, cold plates and harnesses | Lupton helps data center hardware teams get the custom parts inside power and cooling equipment made: sheet metal enclosures, racks and chassis, copper bus bars, cold plates and heat sinks, cable harnesses, PCB assemblies and insulation, from prototype through production ramp. Send the drawing, BOM, material, electrical or thermal requirements, annual volume and launch date; we review it before it goes to quote so the RFQ does not stall on a missing spec. |
| `/industries/medical/` | Industry | Who can build device harnesses, housings and frames with medical documentation? | Medical device components: harnesses, housings, frames and stampings | Lupton matches medical device and lab equipment OEMs with manufacturers for cable assemblies and harnesses, molded, RIM and thermoformed housings, sheet metal frames and carts, short-run stampings, machined parts and PCB assemblies, with ISO 13485 sources where the program requires it [CONFIRM]. Send the drawing, material, volume and the documentation your quality system needs (first article, material certs, traceability, cleanliness), and we confirm the source can meet it before it quotes. |
| `/industries/heavy-truck/` | Industry | Who can tool vehicle stampings, weldments and harnesses fast? | Heavy truck and specialty vehicle components | Lupton works with heavy truck, off-road and specialty vehicle OEMs on stamped and welded brackets, structural weldments, castings, wire harnesses and power cables up to 4/0, molded covers and battery enclosures, from prototypes through production volumes. Send the print, annual volume, PPAP level and launch timing, and we will route it to a shop set up for vehicle-program documentation [CONFIRM]. |
| `/industries/military-aerospace/` | Industry | Which shops hold ITAR/AS9100 for this part? | Military and aerospace components: machined, cast, fabricated and electronic | Lupton helps defense and aerospace programs source tight-tolerance machined parts, specialty castings, welded sheet metal, electronic enclosures, cable assemblies and PCB assemblies, with quality and compliance requirements defined in the RFQ. Tell us the requirements up front (ITAR, AS9100, NIST SP 800-171 or CMMC, first article, source inspection) and we route the drawing only to shops that hold them [CONFIRM]. |
| `/industries/robotics/` | Industry | Who can make robot parts at pilot-to-low volume without big tooling? | Robotics and automation components | Lupton helps robotics and automation builders get the physical parts of a robot made (machined and cast arm components, sheet metal chassis and guarding, cable assemblies and harnesses, molded covers and PCB assemblies) at the low-to-mid volumes typical of robot programs. Send the model, BOM, annual build rate and which parts are still changing; we will recommend processes that do not lock you into expensive tooling before the design settles. |
| `/industries/energy/` | Industry | Who builds battery/charger enclosures, bus bars and cold plates? | Energy storage, EV charging and power conversion components | Lupton helps energy equipment makers get the enclosures, cabinets, bus bars, cold plates, harnesses and electronic assemblies that go into battery storage, EV charging, inverters and grid equipment made, from first prototypes through production ramp. Send the drawing, current and thermal requirements, environmental rating, annual volume and launch date, and we will review the package and route it to shops with the right process and capacity. |
| `/industries/agriculture-heavy-equipment/` | Industry | Weldment, casting or rotomold for this equipment part? | Agriculture and heavy equipment components | Lupton works with agricultural, construction and off-highway equipment makers on weldments and structural frames, heavy-gauge sheet metal, castings, rotomolded tanks and fenders, thermoformed covers and harnesses: parts built for dirt, vibration and a long service life. Send the print, annual volume, finish and operating environment, and we will compare fabrication, casting and molding options before you commit to tooling. |
| `/industries/data-center/sheet-metal-enclosures/` | Capability × industry | Who fabricates custom sheet metal enclosures for data center racks? | Sheet metal enclosures, racks and chassis for data center equipment | Lupton gets custom sheet metal for data center equipment built (PDU and UPS enclosures, switchgear panels, rack frames and rails, server and battery chassis, brackets and EMI shields), laser-cut, punched, formed, welded, powder-coated and assembled, from prototype through volume ramp. Send the drawing or model, material and gauge, finish, hardware, annual volume and launch date; we match it to a fabricator with the capacity and finishing lines for the program, domestic or low-cost region. |
| `/industries/data-center/copper-busbars/` | Capability × industry | Who can stamp and plate copper bus bars for a PDU? | Copper and aluminum bus bars for data center power | Lupton gets copper and aluminum bus bars quoted and built for PDUs, UPS systems, switchgear and rack power (punched or stamped, formed, machined, plated and insulated), with the path chosen by volume: fabrication for prototypes and low runs, short run or progressive stamping as volume climbs. Send the drawing with alloy and temper, thickness, plating, insulation, current rating and annual volume, and we will route it to a shop that runs conductive parts. |
| `/industries/data-center/cold-plates/` | Capability × industry | Who manufactures custom liquid cold plates? | Liquid cold plates for data center and power electronics cooling | When air cooling is not enough, a cold plate moves heat from a component into a controlled liquid path, and the quote depends on more than plate dimensions: material, flatness, channel design, fittings, joining method, pressure, finish, testing and volume all decide how it should be made. Send the drawing or CAD, heat load, coolant, flow and pressure, contact-surface flatness, test requirements, annual volume and timing; Lupton reviews it and routes it to a machining and brazing shop set up for liquid-cooling parts. |
| `/industries/medical/wire-harnesses/` | Capability × industry | Wire harness supplier with ISO 13485? | Medical wire harnesses and cable assemblies | Lupton gets build-to-print cable assemblies and wire harnesses built for medical devices and lab equipment, with ISO 13485-certified harness sources available [CONFIRM] and test, labeling and traceability defined in the RFQ. Send the drawing, BOM or wire list with connector part numbers, annual volume, and your documentation needs (first article, certificates of conformance, lot traceability, cleanliness), and we confirm the source can meet them before it quotes. |
| `/industries/medical/metal-stamping/` | Capability × industry | Short-run metal stamping for medical devices? | Short-run metal stamping for medical devices | For medical device brackets, clips, plates, chassis parts and enclosure components running roughly 2,500 to 100,000 pieces a year and under about 20 × 30 in. flat, short run stamping usually lowers piece cost versus laser-and-brake fabrication without progressive-die tooling. Send the print, material (often stainless or aluminum), finish, annual volume and your quality documentation needs, and Lupton will confirm the stamping path and a source that can support your quality system [CONFIRM]. |
| `/industries/military-aerospace/cnc-machining/` | Capability × industry | AS9100 / ITAR CNC machining for a defense program? | CNC machining for defense and aerospace programs | Lupton places tight-tolerance machined parts for defense and aerospace programs (5-axis milled housings and frames, Swiss-turned pins, ground components and EDM features in aluminum, stainless, titanium, Inconel and Invar) with shops holding AS9100 and ITAR registration [CONFIRM]. Call before sending controlled drawings: we will set up a compliant transfer, confirm first article and inspection requirements, and route the package only to qualified shops. |
| `/resources/fabrication-vs-stamping-break-even/` | Resource (Guide) | At what volume should a laser-cut part become a stamping? | Laser-cut, short run stamping or progressive die: where is the break-even? | For most sheet metal parts, laser or turret cutting plus press-brake forming is cheapest below roughly 2,500 pieces a year, short run stamping is cheapest from roughly 2,500 to 100,000 pieces a year on parts under about 20 × 30 in. flat, and progressive dies win above roughly 100,000 a year. Geometry, material, secondary operations and program life move those lines, so treat them as a screening rule and run the payback on your actual print. |
| `/resources/what-to-send-with-an-rfq/` | Resource (Guide) | What do I send so my part actually gets quoted? | What should I send with an RFQ so the part actually gets quoted? | Send the current drawing and revision, a CAD model, the material, annual volume and release quantities, the truly critical tolerances, finish and secondary operations, testing and documentation requirements, and the date you need parts, plus the reason you are quoting. Unknowns are fine; label them as open so the review resolves them instead of the quote burying an assumption. |
| `/resources/choose-manufacturing-process-custom-part/` | Resource (Guide) | How should this part be made? | How should this part be made? | Seven inputs usually decide the process for a custom part: material and performance, geometry and size, critical tolerances, annual volume, tooling and change risk, finish and documentation, and timing and supply path. Choosing the process too early can lock a program into unnecessary tooling, cost or lead time, so when more than one route could work, compare them against the same drawing before committing. |
| `/resources/second-source-custom-components/` | Resource (Guide) | How do I build a second source before the current one fails? | Build a second source before the current one fails | Start a second source when lead times slip, capacity tightens, quality or communication degrades, pricing jumps without a technical reason, tooling ownership is unclear, or tariff and freight risk changes, before it becomes an emergency. The new source needs the current drawing and revision, material, process, tooling details, quality history, volumes, documentation and the validation plan, so prepare that package first. |
| `/resources/short-run-stamping-part-conversion/` | Resource (Case study) | Proof: what does a stamping conversion save? | Short run stamping conversion: $2.65 to $1.45 a piece | A recreational-industry detail part produced by laser or CNC turret was converted to short run metal stamping, cutting the piece price from about $2.65 to $1.45 with a $1,000 tooling charge at 10,000 pieces a year. The source study reports about $11,000 in annual savings while keeping tooling and design changes economical. |
| `/resources/automated-pharmaceutical-dispensing-machine-structural-frame/` | Resource (Case study) | Proof: can a welded frame hold tight tolerances? | Structural frame for an automated pharmaceutical dispensing machine | A structural support frame for an automated pharmaceutical dispensing machine was built to hold 0.050 in. across diagonal mounting points, 0.030 in. positional tolerance on hole locations, and a horizontal beam within one degree of twist. It was welded to AWS D1.1, finished in appliance-white powder coat, fixtured to control distortion, and shipped on a skid for production-line assembly. |
| `/resources/contract-manufacturing-cryogenic-vacuum-pump/` | Resource (Case study) | Proof: high-mix + high-volume EMS with EOL management | Contract manufacturing for a cryogenic vacuum pump | A cryogenic vacuum pump with embedded microprocessors for performance, diagnostics and communications needed one contract manufacturer to support both high-mix/low-volume and high-volume builds. The program covered new-product introduction, assembly and custom-tailored testing, RoHS conversion when needed, and engineering support for end-of-life components. |

Home, hubs, RFQ and About are hand-built pages. Their H1s and ledes are in `prototype/src/pages/`.

## 301 redirect map

Every indexable URL from the crawl. Also rendered on the prototype's `/review/` page.

| Old URL (luptons.com) | New URL | Note |
|---|---|---|
| `/about-us/` | `/about/` |  |
| `/contact/` | `/rfq/` | RFQ page carries phone, booking and address |
| `/manufacturing-path/` | `/rfq/` |  |
| `/request-a-quote/` | `/rfq/` | currently redirects to /manufacturing-path/: collapse the chain |
| `/manufacturing-path/sheet-metal-fabrication/` | `/capabilities/sheet-metal-fabrication/` |  |
| `/industries-served/` | `/industries/` |  |
| `/prototyping/` | `/capabilities/prototyping/` |  |
| `/electronics/` | `/capabilities/electronic-assembly/` |  |
| `/electronics/electronic-manufacturing/` | `/capabilities/electronic-assembly/` |  |
| `/electronics/microelectronics/` | `/capabilities/electronic-assembly/` |  |
| `/electronics/offshore-contract-manufacturing/` | `/capabilities/low-cost-region-manufacturing/` |  |
| `/electronics/cable-assemblies/` | `/capabilities/wire-harnesses-cable-assemblies/` |  |
| `/metal-fabrication/` | `/capabilities/sheet-metal-fabrication/` |  |
| `/metal-fabrication/sheetmetal-fabrication/` | `/capabilities/sheet-metal-fabrication/` |  |
| `/metal-fabrication/short-run-stamping/` | `/capabilities/metal-stamping/short-run/` |  |
| `/metal-fabrication/progressive-die-stamping/` | `/capabilities/metal-stamping/progressive-die/` |  |
| `/machined-components/` | `/capabilities/cnc-machining/` |  |
| `/machined-components/castings/` | `/capabilities/casting/` |  |
| `/machined-components/aluminum-extrusions/` | `/capabilities/extrusions/` |  |
| `/machined-components/cold-plates/` | `/industries/data-center/cold-plates/` |  |
| `/data-centers/` | `/industries/data-center/` |  |
| `/data-centers/power-distribution-hardware/` | `/industries/data-center/` |  |
| `https://www.luptonsolutions.com/datacenter` | `https://luptons.com/industries/data-center/` | configure on the luptonsolutions.com host |
| `/thermoplastic-and-thermoset-molding/` | `/capabilities/plastic-molding/` |  |
| `/thermoplastic-and-thermoset-molding/injection-molding/` | `/capabilities/plastic-molding/injection-molding/` | (migrate) |
| `/thermoplastic-and-thermoset-molding/gas-assist-injection-molding/` | `/capabilities/plastic-molding/gas-assist/` | (migrate) |
| `/thermoplastic-and-thermoset-molding/structural-web-molding/` | `/capabilities/plastic-molding/structural-foam/` | (migrate) |
| `/thermoplastic-and-thermoset-molding/rotational-molding/` | `/capabilities/plastic-molding/rotational-molding/` | (migrate) |
| `/thermoplastic-and-thermoset-molding/thermoforming/` | `/capabilities/plastic-molding/thermoforming/` | (migrate) |
| `/thermoplastic-and-thermoset-molding/rim/` | `/capabilities/plastic-molding/rim/` | (migrate) |
| `/thermoplastic-and-thermoset-molding/compression-molding/` | `/capabilities/plastic-molding/` |  |
| `/thermoplastic-and-thermoset-molding/blow-molding/` | `/capabilities/plastic-molding/` |  |
| `/thermoplastic-and-thermoset-molding/low-volume-composites/` | `/capabilities/plastic-molding/` |  |
| `/thermoplastic-and-thermoset-molding/plastic-fabrication/` | `/capabilities/plastic-molding/` |  |
| `/other-custom-solutions/` | `/capabilities/other/` | (migrate) |
| `/other-custom-solutions/labels/` | `/capabilities/other/labels/` | (migrate) |
| `/other-custom-solutions/active-cleaning-sealing-solutions/` | `/capabilities/other/cleaning-sealing/` | (migrate) |
| `/other-custom-solutions/bolt-on-lift-systems/` | `/capabilities/other/lift-systems/` | (migrate) |
| `/other-custom-solutions/gas-springs/` | `/capabilities/other/gas-springs/` | (migrate) |
| `/resources/why-custom-part-is-difficult-to-quote/` | `/resources/what-to-send-with-an-rfq/` |  |
| `/resources/choose-manufacturing-process-custom-part/` | `/resources/choose-manufacturing-process-custom-part/` | same URL |
| `/resources/second-source-custom-components/` | `/resources/second-source-custom-components/` | same URL |
| `/resources/short-run-stamping-part-conversion/` | `/resources/short-run-stamping-part-conversion/` | same URL |
| `/resources/automated-pharmaceutical-dispensing-machine-structural-frame/` | `/resources/automated-pharmaceutical-dispensing-machine-structural-frame/` | same URL |
| `/resources/contract-manufacturing-cryogenic-vacuum-pump/` | `/resources/contract-manufacturing-cryogenic-vacuum-pump/` | same URL |
| `/field-signal/` | `/resources/field-signal/` | (migrate) |
| `/over-the-wire/` | `/resources/over-the-wire/` | (migrate) |
| `/over-the-wire/july-2026/` | `/resources/over-the-wire/july-2026/` | (migrate) |
| `/category/news/` | `/resources/` |  |
| `/category/resources/` | `/resources/` |  |
| `/company-news/` | `/resources/` | archive posts stay noindexed at their URLs or return 410 (decision) |
| `/thixomolding-click-to-keep-reading/` | `/capabilities/plastic-molding/` |  |
| `/cmmc-update-click-to-keep-reading/` | `/industries/military-aerospace/` |  |
| `/libra-industries-nist-sp800-171-compliant/` | `/industries/military-aerospace/` |  |
| `/testimonials-category/web-development/` | `(410 Gone)` | theme demo taxonomy |
| `/testimonials-category/web-design-2/` | `(410 Gone)` | theme demo taxonomy |
| `/slides-category/slider/` | `(410 Gone)` | theme demo taxonomy |
| `/carousels-category/carousel/` | `(410 Gone)` | theme demo taxonomy |
| `/office-space-for-lease/` | `/office-space-for-lease/` | keep, noindex, remove from sitemap |
| `/privacy-statement-us/` | `/privacy/` | (migrate) with real policy text |
| `/opt-out-preferences/` | `/privacy/#opt-out` | (migrate) |
| `/disclaimer/` | `/privacy/#disclaimer` | (migrate) |
