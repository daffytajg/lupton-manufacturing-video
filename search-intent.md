# Search and AI-prompt intent map

> **DRAFT: no keyword volume data behind this list.** I tried to pull US search volume, keyword difficulty and luptons.com's current rankings through the connected Semrush account on 2026-09-23. Every call returned `API UNITS BALANCE IS ZERO`, and the Google PageSpeed/CrUX quota was also exhausted. Everything below comes from buyer-role reasoning, the language already working on luptons.com (short run stamping, cable assemblies, cold plates, data center power), and how engineers phrase questions to ChatGPT, Claude and Perplexity. **Before we lock page titles, run the "Validate" list at the bottom through Semrush (or Google Search Console → Performance → Queries) and re-rank.**

## Who is asking

| Role | What they arrive with | What they need to see in 10 seconds | What converts them |
|---|---|---|---|
| **Design engineer** (new program) | A CAD model, a material, a target cost, no supplier yet | "Can this process make my geometry at my volume?" Thresholds, tolerances, materials, DFM help | Upload the model and get DFM questions back, not a form letter |
| **Sourcing / supplier engineer** | A print, a current supplier that failed or is too slow, a PPAP/FAI requirement | Capacity, certifications, second-source process, lead time | A named contact, a response-time promise, proof they have re-sourced this part class before |
| **Commodity manager** | A spend category (harnesses, sheet metal, castings), a cost-down target, tariff exposure | Low-cost region options with a domestic fallback, landed-cost thinking, consolidation | A call to review the category, not one part |
| **Program / ops lead** | A launch date and a lead-time crisis | "Who can start in weeks, not months?" Bridge tooling, short-run, domestic capacity | Book time today |

## Trigger events (the "problem" in "a part and a problem")

1. **New program / NPI:** "who can make this," prototype → production path, process selection.
2. **Supplier failure:** quality escape, capacity loss, supplier closure, missed deliveries → second source, re-source, fast quote.
3. **Cost-down target:** fab → stamping conversion, metal → plastic conversion, low-cost region, tooling payback.
4. **Lead-time crisis:** bridge tooling, domestic capacity, short-run tooling "in weeks rather than months."
5. **Tariff / geopolitical risk:** China+1, Mexico, Thailand, reshoring, dual sourcing.
6. **Compliance gate:** ISO 13485, ITAR, AS9100, IATF 16949, UL 764/UL 508A, IPC/WHMA-A-620, NIST SP 800-171/CMMC.
7. **Volume change:** ramping past the fab break-even or dropping below a progressive-die payback.

---

## By capability

Priority: **P1** = high buyer intent, and Lupton has clear verified proof or strong existing copy. **P2** = high intent, but proof needs confirming. **P3** = supporting or informational.

### Metal stamping (short run + progressive die) · P1
Existing strength: the `/metal-fabrication/short-run-stamping/` title already targets "2,500 to 100,000 Parts/Yr."

| Search query (Google) | AI prompt phrasing (ChatGPT/Claude/Perplexity) | Stage | Target page |
|---|---|---|---|
| short run metal stamping | "What is short run metal stamping and when does it make sense?" | Learn | /capabilities/metal-stamping/short-run/ |
| short run stamping vs progressive die | "At what volume should I move from short run stamping to a progressive die?" | Compare | /capabilities/metal-stamping/ + resource |
| laser cut vs stamping cost | "Should my laser-cut and brake-formed bracket be a stamping at 20,000 a year?" | Compare | /resources/fabrication-vs-stamping-break-even/ |
| low volume metal stamping | "Who does low-volume metal stamping without expensive progressive tooling?" | Vendor | /capabilities/metal-stamping/short-run/ |
| progressive die stamping supplier | "Find a progressive die stamping supplier for 500k parts a year" | Vendor | /capabilities/metal-stamping/progressive-die/ |
| copper busbar stamping / busbar manufacturer | "Who can stamp and plate copper bus bars for a PDU?" | Vendor | /industries/data-center/copper-busbars/ |
| short-run metal stamping for medical devices | "Short-run stamping supplier for medical device brackets, ISO 13485?" | Vendor | /industries/medical/metal-stamping/ |
| metal stamping tooling cost | "How much does short run stamping tooling cost vs a progressive die?" | Learn | short-run page FAQ |
| pancake die / master die set | "What is a pancake die?" | Learn | short-run page FAQ |

### Sheet metal fabrication · P1
| Search query | AI prompt | Stage | Target |
|---|---|---|---|
| sheet metal enclosures for data center racks | "Who fabricates custom sheet metal enclosures and rack hardware for data centers?" | Vendor | /industries/data-center/sheet-metal-enclosures/ |
| custom sheet metal fabrication | "Sheet metal fabricator for chassis and enclosures, powder coat, hardware insertion" | Vendor | /capabilities/sheet-metal-fabrication/ |
| sheet metal enclosure manufacturer | "Electrical enclosure fabricator with powder coat and assembly" | Vendor | same |
| second source sheet metal supplier | "My sheet metal supplier can't keep up. How do I qualify a second source fast?" | Problem | /resources/second-source-custom-components/ |
| sheet metal fabrication China vs US | "Should I source sheet metal chassis from China, Thailand or Mexico with tariffs?" | Compare | /capabilities/low-cost-region-manufacturing/ |
| weldment fabrication / welded frame supplier | "Who builds welded structural frames to AWS D1.1 with powder coat?" | Vendor | sheet metal page + pharma frame case study |
| box build sheet metal assembly | "Sheet metal fabricator that also does electromechanical box build and hi-pot test" | Vendor | sheet metal page |

### CNC machining · P2
| Search query | AI prompt | Stage | Target |
|---|---|---|---|
| precision cnc machining services | "Precision CNC machining supplier for aerospace, AS9100, ITAR" | Vendor | /capabilities/cnc-machining/ |
| 5 axis machining aerospace | "5-axis machining for Inconel and titanium aerospace parts" | Vendor | /industries/military-aerospace/cnc-machining/ |
| swiss machining supplier | "Swiss screw machining for small medical pins, tight tolerance" | Vendor | CNC page §Swiss |
| creep feed grinding | "Who does creep feed grinding on Inconel?" | Vendor | CNC page |
| cold plate manufacturer / liquid cold plate | "Who manufactures custom liquid cold plates for power electronics?" | Vendor | /industries/data-center/cold-plates/ |
| itar machine shop | "ITAR registered machine shop near New York" | Vendor | military page [CONFIRM] |

### Wire harnesses and cable assemblies · P1
Existing strength: 24 AWG–4/0, ISO 9001:2015 and UL 764 sources, FAQ schema.

| Search query | AI prompt | Stage | Target |
|---|---|---|---|
| wire harness supplier iso 13485 | "Wire harness supplier with ISO 13485 for a medical device" | Vendor | /industries/medical/wire-harnesses/ |
| custom cable assembly manufacturer | "Build-to-print cable assembly manufacturer, low volume OK" | Vendor | /capabilities/wire-harnesses-cable-assemblies/ |
| wire harness manufacturer mexico | "Wire harness supplier in Mexico with a US contact" | Vendor | cable page + LCR page |
| overmolded cable assembly | "Who does overmolded cable assemblies with custom strain relief?" | Vendor | cable page |
| ul 764 wire harness | "What is UL 764 and does my harness need it?" | Learn | cable page FAQ |
| cable assembly vs wire harness | "Difference between a cable assembly and a wire harness" | Learn | cable page FAQ |
| robot cable assembly / high flex cable | "High-flex cable assemblies for robot arms and AMRs" | Vendor | /industries/robotics/cable-assemblies/ |
| heavy truck wire harness | "Wire harness supplier for heavy truck / off-road vehicles" | Vendor | /industries/heavy-truck/ |

### Plastic molding (injection, structural foam, gas assist, RIM, rotational, thermoforming, blow, compression) · P2
| Search query | AI prompt | Stage | Target |
|---|---|---|---|
| custom injection molding company | "Injection molder for engineered enclosures, 500 to 50,000 per year" | Vendor | /capabilities/plastic-molding/ |
| injection molding vs thermoforming vs rotomolding | "Which plastic process for a large, low-volume cover?" | Compare | plastic molding page decision table |
| structural foam molding | "Structural foam molding for large equipment housings" | Vendor | plastic molding §structural foam (migrate existing page) |
| gas assist injection molding | "When should I use gas assist injection molding?" | Learn | existing page (migrate) |
| reaction injection molding medical | "RIM supplier for medical equipment covers" | Vendor | plastic molding + medical |
| metal to plastic conversion | "Can this cast aluminum housing become a molded plastic part?" | Problem | resource |
| thermoforming for low volume | "Pressure forming vs injection molding for 1,000 covers a year" | Compare | plastic molding page |
| rotational molding company | "Rotomolded tanks and housings for agricultural equipment" | Vendor | /industries/agriculture-heavy-equipment/ |

### Casting · P2
| Search query | AI prompt | Stage | Target |
|---|---|---|---|
| graphite casting / graphite mold casting | "Fast aluminum casting prototypes without a die cast tool" | Vendor | /capabilities/casting/ |
| die casting companies | "Aluminum and zinc die casting supplier" | Vendor | casting page |
| investment casting supplier | "Stainless investment casting for a valve body" | Vendor | casting page |
| sand casting vs die casting | "Which casting process for 500 parts a year?" | Compare | casting page decision table |
| casting to machining supplier | "Who delivers a cast and machined part, finished?" | Vendor | casting page |
| heavy truck castings | "Iron/aluminum casting supplier for heavy truck brackets" | Vendor | /industries/heavy-truck/ |

### Extrusions · P3
| Search query | AI prompt | Stage | Target |
|---|---|---|---|
| custom aluminum extrusion | "Custom aluminum extrusion with CNC fabrication and anodize" | Vendor | /capabilities/extrusions/ |
| aluminum extrusion fabrication | "Who cuts, drills, bends and finishes aluminum extrusions?" | Vendor | extrusions page |
| heat sink extrusion | "Extruded heat sinks for power electronics" | Vendor | extrusions + data center |
| plastic profile extrusion | "Custom PVC/TPE profile extrusion, dual durometer" | Vendor | extrusions page [CONFIRM scope] |

### Electronic assembly (PCBA, box build, microelectronics) · P2
| Search query | AI prompt | Stage | Target |
|---|---|---|---|
| pcb assembly low volume | "Low-volume PCBA with box build and functional test" | Vendor | /capabilities/electronic-assembly/ |
| box build contract manufacturer | "Contract manufacturer for complete box build with cable and sheet metal" | Vendor | electronic assembly page |
| ems iso 13485 | "EMS provider with ISO 13485 for a medical device" | Vendor | /industries/medical/ |
| as9100 electronics manufacturer | "AS9100 ITAR PCB assembly supplier" | Vendor | military page [CONFIRM] |
| end of life component management | "Our board has EOL parts. Who can redesign and re-source?" | Problem | cryo pump case study |
| microelectronics assembly / wire bonding | "Wire bonding and flip chip assembly services" | Vendor | electronic assembly §micro |

### Prototyping · P2
| Search query | AI prompt | Stage | Target |
|---|---|---|---|
| prototype to production manufacturing | "Who can take my part from prototype to production without switching suppliers?" | Vendor | /capabilities/prototyping/ |
| bridge tooling | "Bridge tooling so we can launch before production molds are ready" | Problem | prototyping page |
| cast urethane prototypes | "Cast urethane vs 3D print for 25 functional housings" | Compare | prototyping page |
| rapid sheet metal prototype | "Sheet metal prototype in a week" | Vendor | prototyping + sheet metal |

### Low-cost region manufacturing · P1 (commodity managers)
| Search query | AI prompt | Stage | Target |
|---|---|---|---|
| manufacturing in mexico vs china | "Should we move sheet metal from China to Mexico with tariffs?" | Compare | /capabilities/low-cost-region-manufacturing/ |
| china plus one sourcing | "China+1 options for metal and plastic parts" | Learn | LCR page |
| offshore contract manufacturing with us support | "Offshore manufacturer with US warehousing and a US point of contact" | Vendor | LCR page |
| thailand sheet metal manufacturer | "Sheet metal supplier in Thailand" | Vendor | LCR page [CONFIRM] |
| landed cost calculator manufacturing | "How do I compare landed cost for a China vs domestic part?" | Learn | resource |
| reshoring manufacturing supplier | "Reshore a part from China to the US or Mexico" | Problem | LCR page |

---

## By industry

### Data center (power, cooling, rack) · P1
Live proof: power distribution hardware page, cold plates page, luptonsolutions.com/datacenter.

- "copper busbar stamping," "busbar manufacturer USA," "laminated busbar supplier" → **/industries/data-center/copper-busbars/**
- "sheet metal enclosures for data center racks," "server rack enclosure manufacturer," "PDU enclosure fabrication" → **/industries/data-center/sheet-metal-enclosures/**
- "liquid cold plate manufacturer," "cold plate for GPU / power electronics," "CDU components" → **/industries/data-center/cold-plates/**
- "UPS enclosure supplier," "switchgear sheet metal," "EMI shield fabrication" → /industries/data-center/
- AI prompt: *"We build PDUs and need a second source for copper bus bars and the enclosure. Who can quote both?"*

### Medical · P1
- "wire harness supplier ISO 13485," "medical cable assembly manufacturer" → **/industries/medical/wire-harnesses/**
- "short-run metal stamping for medical devices," "medical device bracket stamping" → **/industries/medical/metal-stamping/**
- "RIM medical equipment covers," "thermoformed medical device housing" → /industries/medical/
- "medical device contract manufacturer box build" → /industries/medical/
- AI prompt: *"Our medical cart supplier is late. Who can build the sheet metal frame, molded covers and harness?"*

### Heavy truck (and off-road / specialty vehicle) · P2
- "heavy truck wire harness supplier," "off-road vehicle wire harness" (live site shows UTV imagery)
- "heavy truck castings supplier," "truck bracket stamping," "battery enclosure fabrication EV truck"
- AI prompt: *"Tier 1 heavy truck supplier, IATF 16949, for stamped and welded brackets"* ([CONFIRM] IATF scope)

### Military and aerospace · P2
- "ITAR machine shop," "AS9100 CNC machining," "military cable assemblies MIL-spec"
- "graphite casting for defense electronics chassis" (resource: "Graphite Die Cast Aluminum Chassis for Field Deployed Communications Hardware")
- "NIST 800-171 compliant manufacturer," "CMMC level 2 supplier"
- AI prompt: *"ITAR-registered supplier for machined and welded sheet metal for a defense program"*

### Robotics (and automation / AMR) · P2
- "robot cable assembly," "high flex cable for robots," "robot arm castings," "AMR sheet metal chassis"
- AI prompt: *"Who makes the chassis, cable harness and covers for an autonomous mobile robot at 500 units a year?"*

### Energy (storage, EV charging, grid) · P2
- "battery enclosure manufacturer," "energy storage cabinet fabrication," "EV charger enclosure"
- "busbar for battery pack," "cold plate for battery / inverter"
- AI prompt: *"BESS cabinet sheet metal and busbar supplier in North America"*

### Agriculture and heavy equipment · P3
- "rotomolded tanks for agricultural equipment," "sheet metal for ag equipment," "castings for construction equipment," "wire harness off-highway"
- AI prompt: *"Low-volume rotomolded fuel tank and fenders for a new tractor attachment"*

---

## Capability × industry combinations: priority order

Scored on buyer intent × Lupton proof × gap versus current site.

| Rank | Combination | Why it is first | Build in prototype |
|---:|---|---|:---:|
| 1 | Data center × sheet metal enclosures/racks | Largest principal is sheet metal. Data center is the fastest-moving vertical. The current page is off-domain. | ✓ |
| 2 | Data center × copper busbars (stamping + fabrication) | High-value part class named in the live power-hardware copy | ✓ |
| 3 | Data center × cold plates (machining + brazing) | Live cold plate page exists. Liquid-cooling demand. | ✓ |
| 4 | Medical × wire harnesses/cable assemblies | "wire harness supplier ISO 13485" is a textbook vendor-selection query | ✓ |
| 5 | Medical × short-run metal stamping | Example query from the brief. Short-run thresholds are verified. | ✓ |
| 6 | Military/aerospace × CNC machining | High-value. Needs ITAR/AS9100 confirmation per source. | ✓ |
| 7 | Robotics × cable assemblies | Growing. Weak proof today. | planned |
| 8 | Heavy truck × wire harnesses | UTV/off-road imagery already on site | planned |
| 9 | Energy × battery enclosures | Sheet metal + busbar overlap with data center | planned |
| 10 | Agriculture × rotational molding | Clear process fit, lower volume of searches | planned |

---

## Validate before launch

Run these through Semrush Keyword Overview (US) and Google Search Console (last 16 months) and record volume, KD, and current luptons.com position:

```
short run metal stamping; short run stamping; low volume metal stamping; progressive die stamping;
copper busbar; busbar manufacturer; custom busbar; sheet metal enclosure manufacturer;
server rack enclosure manufacturer; custom sheet metal fabrication; liquid cold plate manufacturer;
cold plate manufacturer; custom cable assemblies; wire harness manufacturer; medical wire harness;
wire harness iso 13485; ul 764; overmolded cable assembly; precision cnc machining; itar machine shop;
as9100 machining; graphite casting; aluminum die casting; investment casting; custom aluminum extrusion;
structural foam molding; gas assist injection molding; rotational molding; reaction injection molding;
thermoforming vs injection molding; box build assembly; low volume pcb assembly; bridge tooling;
manufacturing in mexico vs china; china plus one sourcing; reshoring manufacturing; second source supplier
```

For AI visibility, run the same 20 buyer prompts monthly in ChatGPT (search on), Perplexity, Claude (web search) and Google AI Overviews. Log whether Lupton is cited and which URL. That is the baseline for "gets cited."
