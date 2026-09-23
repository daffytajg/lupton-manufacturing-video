import type { Capability } from './types';

// Sources: luptons.com capability pages (crawled 2026-09-23; see audit-data/page-copy.md).
// Anything not published on the live site, or published only on 2015–2018 legacy pages
// that describe a single manufacturer's equipment, carries [CONFIRM].

const sendDrawing = 'Drawing or model (PDF and STEP), with revision';

export const capabilities: Capability[] = [
  // ───────────────────────────── METAL STAMPING ─────────────────────────────
  {
    slug: 'metal-stamping',
    name: 'Metal stamping',
    short: 'Short run stamping from 2,500 pcs/yr, progressive dies above ~100,000.',
    icon: 'stamp',
    title: 'Metal Stamping: Short Run & Progressive Die | Lupton',
    description:
      'Short run metal stamping for roughly 2,500–100,000 pcs/yr and progressive die stamping above ~100,000. Send your print for a fab vs. stamping review.',
    h1: 'Metal stamping, from short run to progressive die',
    lede: [
      'If your sheet metal part runs roughly 2,500 to 100,000 pieces a year and fits inside about 20 × 30 in. in the flat, short run stamping usually beats laser-and-brake fabrication on piece price without the cost of a progressive die; above roughly 100,000 a year, a progressive die usually wins.',
      'Send the print, material, gauge and annual volume, and Lupton will tell you which path pays at your numbers, then get you a quote directly from a stamping shop that runs it.',
    ],
    image: 'formed-brackets',
    imageAlt: 'Two short-run stamped steel brackets, one with a welded upright tube, beside a pen for scale',
    stats: [
      { value: '2,500–100,000', label: 'pcs/yr short run range' },
      { value: '≈20 × 30 in.', label: 'max flat blank for short run' },
      { value: '>100,000', label: 'pcs/yr where progressive dies pay' },
    ],
    routes: [
      {
        title: 'Short run stamping',
        text: 'Steel die inserts (pancake dies) run in a shared master die holder, so you tool the features instead of building a dedicated die. Tooling typically ships in weeks rather than months.',
        href: '/capabilities/metal-stamping/short-run/',
      },
      {
        title: 'Progressive die stamping',
        text: 'Coil-fed, multi-station dies make a finished part every press stroke. The per-piece cost is lowest at high volume, but the tooling investment and start-up time are higher.',
        href: '/capabilities/metal-stamping/progressive-die/',
      },
      {
        title: 'Secondary operations in the same quote',
        text: 'Welding, hardware insertion, tapping, deburring, machining, plating, painting and heat treating, quoted as a finished part or assembly.',
      },
    ],
    compare: {
      caption: 'Which sheet metal path fits the part',
      head: ['', 'Laser / turret + brake', 'Short run stamping', 'Progressive die'],
      rows: [
        ['Annual volume', 'Prototypes to ~2,500', '~2,500 to 100,000', '>~100,000'],
        ['Flat size', 'Any, including >20 × 30 in.', 'Under ~20 × 30 in.', 'Small form factor'],
        ['Tooling', 'None', 'Low: inserts in a master holder', 'High: dedicated multi-station die'],
        ['Tooling lead time', 'None', 'Weeks', 'Months'],
        ['Design changes', 'Easy', 'Economical (swap inserts)', 'Expensive'],
        ['Piece price', 'Highest', 'Middle', 'Lowest'],
      ],
    },
    specs: [
      { label: 'Short run volume range', value: 'Roughly 2,500–100,000 pcs/yr' },
      { label: 'Short run size limit', value: 'About 20 × 30 in. in the flat' },
      { label: 'Progressive die volume', value: 'Above roughly 100,000 pcs/yr' },
      { label: 'Short run tooling lead time', value: 'Weeks rather than months' },
      { label: 'Press range, short run', value: '12–400 tons [CONFIRM]' },
      { label: 'Press range, progressive die', value: '50–1,500 tons [CONFIRM]' },
      { label: 'Tooling warranty', value: 'Short run tooling warrantied for the life of the program [CONFIRM]' },
      { label: 'Certifications available', value: 'ISO 9001:2015; IATF 16949 at a progressive die source [CONFIRM]' },
      { label: 'Finishes', value: 'E-coat, powder coat, wet paint, plating [CONFIRM]' },
    ],
    send: [
      'Part print or flat pattern (PDF and/or STEP)',
      'Material spec and gauge',
      'Annual volume, lifetime volume and typical release size',
      'Finishing and secondary operations (welding, hardware, machining, plating, paint, heat treat)',
      'Tolerance-critical features flagged on the print',
      'Timeline: first article date and production start',
      'Current supplier and piece price, if you are re-sourcing',
    ],
    proof: ['short-run-stamping-part-conversion', 'fabrication-vs-stamping-break-even'],
    faqs: [
      {
        q: 'What volume justifies short run stamping tooling?',
        a: 'As a rule of thumb, 2,500 to 100,000 pieces per year. Below that, fabrication usually wins; well above it, progressive dies start to make sense. Geometry and material shift the break-even, which is why we review actual prints and volumes.',
      },
      {
        q: 'My volume forecast is uncertain. Should I wait on a progressive die?',
        a: 'Often, yes. A common path is to start in short run stamping to prove the part and the demand, then convert to a progressive die once volume justifies the investment. We can review both paths against the same print.',
      },
      {
        q: 'My part needs welding and plating too. Is that a separate quote?',
        a: 'No. Include it all in the RFQ. Short run stampings routinely combine with welding, deburring, machining and finishing, and they should be quoted as a finished part or assembly.',
      },
      {
        q: 'My part is bigger than 20 × 30 in. in the flat. Now what?',
        a: 'Above that size the tooling investment is hard to justify against the per-piece savings, so sheet metal fabrication is usually the better path. Send the print and we will confirm.',
      },
    ],
    industries: ['data-center', 'medical', 'heavy-truck', 'energy', 'robotics', 'agriculture-heavy-equipment'],
    combos: ['data-center/copper-busbars', 'medical/metal-stamping'],
    children: ['short-run', 'progressive-die'],
    legacy: [],
  },
  {
    slug: 'short-run',
    parent: 'metal-stamping',
    name: 'Short run metal stamping',
    short: 'Hard tooling economics at 2,500–100,000 pcs/yr, tooling in weeks.',
    icon: 'stamp',
    title: 'Short Run Metal Stamping | 2,500 to 100,000 Parts/Yr | Lupton',
    description:
      'Short run metal stamping for brackets, clips, plates and enclosure parts under ~20 x 30 in. at 2,500–100,000 pcs/yr. Lower tooling cost than progressive dies.',
    h1: 'Short run metal stamping',
    lede: [
      'Short run metal stamping fills the gap between laser-cut fabrication and progressive dies: it fits sheet metal parts that run roughly 2,500 to 100,000 pieces a year and fit inside about 20 × 30 in. in the flat.',
      'Because steel die inserts run in a shared master die holder, you tool the features instead of building a dedicated die, so tooling typically ships in weeks and costs a fraction of progressive-die NRE.',
    ],
    image: 'short-run-press',
    imageAlt: 'Mechanical stamping press set up for short run metal stamping',
    stats: [
      { value: '$2.65 → $1.45', label: 'piece price in a published conversion' },
      { value: '$1,000', label: 'tooling charge in that study' },
      { value: '3 weeks', label: 'drawing to parts on a UTV program' },
    ],
    routes: [
      {
        title: 'How the process works',
        text: 'Pancake die inserts fitted into a master die holder blank, pierce and form the part on traditional mechanical presses. Secondary presses and press brakes add formed features.',
      },
      {
        title: 'Finished parts, not just blanks',
        text: 'Welding, deburring, forming, machining, plating, painting and heat treating combine with the stampings to deliver a finished part or assembly.',
      },
      {
        title: 'When to stay in fabrication',
        text: 'Above roughly 20 × 30 in. in the flat, or below about 2,500 pieces a year, laser cutting and press-brake forming is usually the better cost path.',
        href: '/capabilities/sheet-metal-fabrication/',
      },
    ],
    specs: [
      { label: 'Good candidates', value: 'Brackets, clips, plates, chassis components, enclosure parts' },
      { label: 'Volume', value: 'Roughly 2,500–100,000 pcs/yr' },
      { label: 'Size', value: 'Under about 20 × 30 in. in the flat' },
      { label: 'Tooling', value: 'Die inserts in a master holder; weeks, not months' },
      { label: 'Published example', value: 'Tooling 2–3 weeks; parts on the customer welding line 3 weeks after kickoff (UTV program, 6 stamped components)' },
      { label: 'Presses', value: '60+ presses, 12–400 tons at the primary short run source [CONFIRM]' },
    ],
    send: [
      'Part print or flat pattern (PDF and/or STEP)',
      'Material spec and gauge',
      'Annual volume and typical release size',
      'Secondary operations: welding, hardware insertion, machining',
      'Finishing: plating, painting, heat treating',
      'Timeline: first article date and production start',
    ],
    proof: ['short-run-stamping-part-conversion', 'fabrication-vs-stamping-break-even'],
    faqs: [
      {
        q: 'How is short run tooling cheaper than a progressive die?',
        a: 'Pancake die inserts run in a shared master die holder, so you are tooling the features, not building a dedicated multi-station die. NRE is a fraction of progressive tooling, and short run tooling typically ships in weeks rather than months.',
      },
      {
        q: 'What volume justifies short run stamping tooling?',
        a: 'As a rule of thumb, 2,500 to 100,000 pieces per year. Below that, fabrication usually wins; well above it, progressive dies start to make sense.',
      },
      {
        q: 'Can a part I laser-cut today become a stamping?',
        a: 'Often. Parts that are laser-cut and brake-formed today, where volume has grown past the fabrication break-even, are the classic conversion. In one published case, a 10,000 pcs/yr part went from about $2.65 to $1.45 each with a $1,000 tooling charge.',
      },
      {
        q: 'Can I change the design after tooling?',
        a: 'Short run tooling keeps design changes economical because features are separate inserts. Send the revision and the affected features, and the shop will quote the change.',
      },
    ],
    industries: ['heavy-truck', 'medical', 'data-center', 'agriculture-heavy-equipment'],
    combos: ['medical/metal-stamping', 'data-center/copper-busbars'],
    legacy: ['/metal-fabrication/short-run-stamping/'],
  },
  {
    slug: 'progressive-die',
    parent: 'metal-stamping',
    name: 'Progressive die stamping',
    short: 'Lowest piece price above ~100,000 pcs/yr, if the tooling math works.',
    icon: 'stamp',
    title: 'Progressive Die Stamping for High-Volume Parts | Lupton',
    description:
      'Progressive die stamping for parts over ~100,000 pcs/yr. Send your print, material and volumes and Lupton reviews whether the tooling investment pays.',
    h1: 'Progressive die stamping',
    lede: [
      'Progressive die stamping makes sense when annual volume climbs past roughly 100,000 pieces and the part is small enough for a coil-fed, multi-station die; per-piece cost drops sharply, but the die costs real money and takes real time to build.',
      'Send the print, material, annual and lifetime volume and program length, and Lupton will run the tooling payback with you, or show you the short run path if the volume is not there yet.',
    ],
    image: 'stamped-chassis',
    imageAlt: 'Stamped steel equipment chassis',
    routes: [
      {
        title: 'How the process works',
        text: 'Material feeds from coil through a die with multiple stations. Each station blanks, pierces, forms or coins in sequence, and a finished part ejects at the last station on every stroke.',
      },
      {
        title: 'Why tolerances repeat',
        text: 'Features form in fixed sequential stations, so progressive dies hold tight tolerances repeatably. Flag tolerance-critical features so they are designed into the die.',
      },
      {
        title: 'Start short run, convert later',
        text: 'If the forecast is uncertain, prove the part and the demand in short run stamping, then convert once volume justifies the die.',
        href: '/capabilities/metal-stamping/short-run/',
      },
    ],
    specs: [
      { label: 'Volume', value: 'Greater than roughly 100,000 pcs/yr' },
      { label: 'Form factor', value: 'Small parts; terminals, contacts, brackets, clips' },
      { label: 'Tooling', value: 'Higher investment, offset by low piece price' },
      { label: 'Start-up', value: 'Longer than short run tooling; plan the timeline' },
      { label: 'Press range', value: '50–1,500 tons [CONFIRM]' },
      { label: 'Quality systems', value: 'IATF 16949:2016, ISO 9001:2015 at a progressive die source [CONFIRM]' },
    ],
    send: [
      'Part print (PDF and/or STEP) with tolerances',
      'Material spec and gauge',
      'Annual volume, lifetime volume estimate and program length',
      'Current source and piece price, if you are re-sourcing',
      'Timeline: first articles and production',
    ],
    faqs: [
      {
        q: 'At what volume does progressive die stamping make sense?',
        a: 'Generally above 100,000 pieces per year, but the honest answer depends on part complexity, material and program life. The die has to amortize across real volume, so send actual numbers and we will do the math with you.',
      },
      {
        q: 'How does a progressive die differ from short run tooling?',
        a: 'A progressive die is a dedicated multi-station tool fed from coil, producing a finished part per press stroke. Short run stamping uses lower-cost die inserts in a master holder with separate operations. Progressive means higher tooling cost, lower piece price and longer start-up.',
      },
      {
        q: 'Can progressive dies hold tight tolerances?',
        a: 'Yes. Repeatable tight tolerances are one of the process’s strengths because features form in fixed sequential stations. Flag the tolerance-critical features on the print.',
      },
    ],
    industries: ['data-center', 'heavy-truck', 'energy'],
    legacy: ['/metal-fabrication/progressive-die-stamping/'],
  },

  // ───────────────────────────── SHEET METAL ─────────────────────────────
  {
    slug: 'sheet-metal-fabrication',
    name: 'Sheet metal fabrication',
    short: 'Laser, punch, form, weld, powder coat and assemble: enclosures to weldments.',
    icon: 'sheet',
    title: 'Sheet Metal Fabrication: Enclosures, Chassis, Weldments | Lupton',
    description:
      'Laser-cut, punched, formed and welded sheet metal: brackets, chassis, enclosures, racks and weldments, finished and assembled, domestic or low-cost region.',
    h1: 'Sheet metal fabrication for enclosures, chassis and weldments',
    lede: [
      'For laser-cut, punched, formed and welded sheet metal (brackets, panels, chassis, electrical enclosures, racks and structural weldments), Lupton matches the part to a fabricator with the right equipment, finishing line and capacity, from prototype quantities through production.',
      'Send the drawing, material, gauge, finish and annual volume; the shop quotes you directly, domestic or low-cost region, with finishing and assembly in the same quote.',
    ],
    image: 'sm-laser',
    imageAlt: 'Fiber laser cutting a steel sheet in a fabrication shop',
    stats: [
      { value: '0.050 in.', label: 'diagonal mounting tolerance held on a welded frame' },
      { value: 'AWS D1.1', label: 'structural welding' },
      { value: 'US · MX · Asia', label: 'fabrication locations [CONFIRM]' },
    ],
    routes: [
      { title: 'Cut', text: 'Fiber laser, CNC turret punching and plasma for blanks and features, subject to drawing review.' },
      { title: 'Form', text: 'Press brakes and panel benders for brackets, panels, enclosures and chassis. Salvagnini panel benders at one source [CONFIRM].' },
      { title: 'Weld', text: 'MIG, TIG, spot and robotic welding for fabricated parts and structural weldments, including AWS D1.1.' },
      { title: 'Insert and assemble', text: 'Hardware insertion, mechanical and electrical integration including boards, cables and backplanes, with hi-pot, functional and software testing.' },
      { title: 'Finish', text: 'Powder coat, e-coat, wet paint and silk screen. Finish review is based on the part, finish spec and program.' },
      { title: 'Convert to stamping', text: 'Once volume passes roughly 2,500 pcs/yr on a part under ~20 × 30 in. flat, compare against short run stamping before committing to more fabrication.', href: '/capabilities/metal-stamping/short-run/' },
    ],
    specs: [
      { label: 'Material thickness', value: '24 gauge to 0.375 in. [CONFIRM]' },
      { label: 'Laser power', value: 'Up to 24 kW fiber laser at one source [CONFIRM]' },
      { label: 'Welding', value: 'MIG, TIG, spot, robotic; AWS D1.1 structural' },
      { label: 'Tolerances held (published case)', value: '0.050 in. across diagonal mounting points; 0.030 in. positional on holes; beam within 1° of twist' },
      { label: 'Finishing', value: 'Powder coat, e-coat, wet paint, silk screen; up to 11 powder lines at one source [CONFIRM]' },
      { label: 'Certifications available', value: 'ISO 9001:2015, ISO 14001:2015, UL [CONFIRM]' },
      { label: 'Logistics', value: 'Domestic warehousing and distribution for offshore programs; kanban/JIT [CONFIRM]' },
    ],
    send: [
      sendDrawing,
      'Material and gauge',
      'Finish spec and color',
      'Hardware callouts (PEM or equivalent)',
      'Annual and release quantities',
      'Tolerance, inspection and documentation requirements (FAI, PPAP)',
      'Target timing',
    ],
    proof: ['automated-pharmaceutical-dispensing-machine-structural-frame', 'second-source-custom-components'],
    faqs: [
      {
        q: 'When should a fabricated part become a stamping?',
        a: 'When it fits inside about 20 × 30 in. flat and runs roughly 2,500 pieces a year or more. Short run stamping usually lowers the piece price without progressive-die tooling. Send the print and annual volume for a side-by-side.',
      },
      {
        q: 'Can finishing and assembly be in the same quote?',
        a: 'Yes. One RFQ can cover cutting, forming, welding, finishing, silk screen and assembly. Quoting the finished part avoids the three-purchase-order problem where nobody owns the hole alignment.',
      },
      {
        q: 'Does open capacity guarantee a quote?',
        a: 'No. Capacity is one part of the decision. The shop still confirms the part, process, commercial requirements, timing and overall program fit before quoting.',
      },
      {
        q: 'Domestic or offshore?',
        a: 'It depends on volume, landed cost, lead time and risk. We can price a domestic option next to a low-cost-region option on the same drawing.',
      },
    ],
    industries: ['data-center', 'medical', 'energy', 'robotics', 'agriculture-heavy-equipment', 'military-aerospace'],
    combos: ['data-center/sheet-metal-enclosures'],
    legacy: ['/metal-fabrication/', '/metal-fabrication/sheetmetal-fabrication/', '/manufacturing-path/sheet-metal-fabrication/'],
  },

  // ───────────────────────────── CNC MACHINING ─────────────────────────────
  {
    slug: 'cnc-machining',
    name: 'CNC machining',
    short: '5-axis milling, Swiss turning, grinding and EDM in hard and soft alloys.',
    icon: 'mill',
    title: 'Precision CNC Machining, Grinding & EDM | Lupton Associates',
    description:
      '5-axis milling, CNC and Swiss turning, creep feed grinding, wire EDM and brazing in aluminum, stainless, titanium, Inconel and Invar, prototype to production.',
    h1: 'Precision CNC machining, grinding and EDM',
    lede: [
      'For machined parts (5-axis and 3-axis milling, CNC and Swiss turning, creep feed grinding, wire and conventional EDM, and brazed assemblies), Lupton works with shops that cut aluminum, stainless, titanium, Inconel, Invar, copper, brass, magnesium and engineered plastics, from prototype lots to production.',
      'Send the print with tolerances, material, quantity and any AS9100, ITAR or medical requirements, and we will route it only to shops that hold them and get you a direct quote.',
    ],
    image: 'machined-aero-frame',
    imageAlt: 'Precision-machined aluminum aerospace frame with circular bores and mounting bosses',
    routes: [
      { title: 'Milling', text: 'Vertical, horizontal and 5-axis CNC machining, including high-speed spindles for aluminum and precision robodrilling.' },
      { title: 'Turning', text: 'CNC and Swiss turning for pins, shafts and small precision parts.' },
      { title: 'Grinding', text: 'Creep feed, surface and cylindrical grinding for hard materials and tight form tolerances.' },
      { title: 'EDM', text: 'Wire and conventional (sinker) EDM for hardened steels and features a cutter cannot reach.' },
      { title: 'Joining', text: 'Welding, brazing and hydraulically expanded tubing, including cold plate fabrication.', href: '/industries/data-center/cold-plates/' },
      { title: 'Machined castings and extrusions', text: 'Deliver a cast or extruded part machined and finished instead of managing two suppliers.', href: '/capabilities/casting/' },
    ],
    specs: [
      { label: 'Materials', value: 'Aluminum (bar, cast, extruded), steel and stainless, titanium, Inconel, Invar, copper, brass, magnesium, thermoset and thermoplastic polymers; cobalt alloys and Hastelloy [CONFIRM]' },
      { label: 'High-speed milling', value: 'Spindles above 20,000 RPM; to 40,000 RPM at one source [CONFIRM]' },
      { label: 'Swiss turning', value: 'Up to 1.5 in. diameter, ±0.0002 in. at one source [CONFIRM]' },
      { label: 'Large-part machining', value: 'Horizontal machining to 89 in. X/Y at one source [CONFIRM]' },
      { label: 'Certifications available', value: 'AS9100, ITAR registration, NIST SP 800-171, ISO 9001:2015, confirmed per shop [CONFIRM]' },
      { label: 'Inspection', value: 'CMM, first article (AS9102) where required [CONFIRM]' },
    ],
    send: [
      sendDrawing,
      'Material and condition (e.g., 6061-T6, 17-4 PH H900)',
      'Critical tolerances and GD&T; which features are truly critical',
      'Quantity per release and annual volume',
      'Finish, plating, heat treat and marking',
      'Quality requirements: FAI, material certs, AS9100, ITAR',
    ],
    faqs: [
      {
        q: 'Do the shops hold AS9100 and ITAR registration?',
        a: 'Several do. Tell us the requirement in the RFQ and we will only route the drawing to shops that hold it. Certification scope is confirmed per shop before award. [CONFIRM]',
      },
      {
        q: 'Should this part be machined, cast or stamped?',
        a: 'Machining fits when geometry or tolerances need direct material removal, the design is still changing, or volume is limited. As volume grows, casting or stamping may lower cost. Send the volume and we will compare.',
      },
      {
        q: 'Can I send ITAR-controlled drawings through the website?',
        a: 'No. Do not upload export-controlled technical data through the web form. Call us and we will arrange a compliant transfer. [CONFIRM process]',
      },
    ],
    industries: ['military-aerospace', 'medical', 'data-center', 'robotics'],
    combos: ['military-aerospace/cnc-machining', 'data-center/cold-plates'],
    legacy: ['/machined-components/'],
  },

  // ───────────────────────────── WIRE HARNESSES ─────────────────────────────
  {
    slug: 'wire-harnesses-cable-assemblies',
    name: 'Wire harnesses & cable assemblies',
    short: '24 AWG signal harnesses to 4/0 power cable, overmolded, tested, kitted.',
    icon: 'cable',
    title: 'Custom Wire Harnesses & Cable Assemblies | Lupton Associates',
    description:
      'Build-to-print cable assemblies and wire harnesses from 24 AWG to 4/0, overmolded and tested. ISO 9001:2015 and UL 764 sources. No minimum for review.',
    h1: 'Custom wire harnesses and cable assemblies, built to print',
    lede: [
      'Lupton gets build-to-print cable assemblies and wire harnesses quoted and built, from 24 AWG multi-conductor harnesses and overmolded assemblies to heavy power cables up to 4/0, from prototypes through production, with no minimum program size for our review.',
      'Send the drawing, BOM or wire list with connector part numbers, annual volume and test requirements; we review it, flag hard-to-source components, and match it to a harness shop with the right certifications.',
    ],
    image: 'wire-harness',
    imageAlt: 'Wire harness with a circular socket, two rectangular connectors and multiple colored conductors',
    stats: [
      { value: '24 AWG–4/0', label: 'conductor range' },
      { value: 'No minimum', label: 'program size for Lupton review' },
      { value: 'UL 764', label: 'wire harness capability at available sources' },
    ],
    routes: [
      { title: 'Cable assemblies', text: 'Conductors in a protective jacket, terminated with connectors: power, signal and data cables.' },
      { title: 'Wire harnesses', text: 'Organized wires and branches that connect components inside a larger system, built from your from/to tables.' },
      { title: 'Overmolded assemblies', text: 'Overmold and strain relief requirements reviewed with the molded cable assembly.' },
      { title: 'Electromechanical scope', text: 'Box builds, fan trays, power supply integration and DIN rail assemblies.', href: '/capabilities/electronic-assembly/' },
      { title: 'Test', text: 'Continuity, hipot, pull test or customer-specified testing.' },
      { title: 'Supply programs', text: 'Kanban/JIT, kitting and inventory planning for the life of the program.' },
    ],
    specs: [
      { label: 'Conductor range', value: '24 AWG multi-conductor to 4/0 power cable' },
      { label: 'Program size', value: 'No minimum for Lupton review; factory MOQs confirmed per source' },
      { label: 'Quality systems', value: 'ISO 9001:2015 sources; UL 764 wire harness capability' },
      { label: 'Also available', value: 'ISO 13485:2016, ITAR, UL 508A, IPC/WHMA-A-620 workmanship at specific sources [CONFIRM]' },
      { label: 'Build locations', value: 'US and Nogales, Mexico [CONFIRM]' },
      { label: 'Testing', value: 'Continuity, hipot, pull test, customer-specified' },
      { label: 'Compliance callouts', value: 'RoHS and compliance callouts on the print are reviewed' },
    ],
    send: [
      'Drawing or print (PDF is fine; native CAD helps)',
      'BOM or wire list with connector part numbers',
      'Annual volume and typical release quantity',
      'Test, labeling and packaging requirements',
      'Obsolete or long-lead components flagged for second-source review',
      'Target date or program timeline',
    ],
    faqs: [
      {
        q: 'What volumes do you support?',
        a: 'Prototype, pilot, low-volume and production programs. There is no minimum program size for Lupton review; manufacturing minimum order quantities depend on the selected source, components and build requirements.',
      },
      {
        q: 'Cable assembly vs. wire harness: which do I need?',
        a: 'A cable assembly typically combines conductors within a protective jacket and terminates them with connectors. A wire harness organizes wires and branches to connect components within a larger system. Send the routing, environment and connection requirements so the right construction can be reviewed.',
      },
      {
        q: 'Can you build to my existing drawings?',
        a: 'Yes. Lupton reviews build-to-print programs using your drawings, BOM, wire lists and test requirements. If documentation is incomplete, send a sample or sketch and the expected volume; a sample or a competitor part number is enough to start.',
      },
      {
        q: 'What do I need to send for a quote?',
        a: 'Drawings or a sample, a BOM or wire list with connector part numbers, annual volume, release quantities and timing. Include test, labeling, packaging and compliance requirements, and flag obsolete or long-lead components.',
      },
    ],
    industries: ['medical', 'robotics', 'heavy-truck', 'data-center', 'energy', 'military-aerospace'],
    combos: ['medical/wire-harnesses'],
    legacy: ['/electronics/cable-assemblies/'],
  },

  // ───────────────────────────── PLASTIC MOLDING ─────────────────────────────
  {
    slug: 'plastic-molding',
    name: 'Plastic molding',
    short: 'Injection, structural foam, gas assist, RIM, rotomolding and thermoforming.',
    icon: 'mold',
    title: 'Plastic Molding: Injection, Structural Foam, RIM, Rotomolding | Lupton',
    description:
      'Choose the plastic process by size and volume: injection, gas assist, structural foam, RIM, rotational molding, thermoforming, blow and compression molding.',
    h1: 'Plastic molding, matched to part size and volume',
    lede: [
      'The right plastic process depends mostly on part size and annual volume: injection molding for high volume and fine detail, structural foam and gas assist for large rigid housings, RIM and thermoforming for large covers at low volume, and rotational molding for hollow one-piece parts.',
      'Lupton helps you pick the process before you pay for tooling: send the model, resin, volume and cosmetic requirements, and we will compare the paths and get quotes from molders that run them.',
    ],
    image: 'gas-assist-analyzer',
    imageAlt: 'Gas-assist injection molded cover for a laboratory blood analyzer',
    routes: [
      { title: 'Injection molding', text: 'Single and multi-cavity tools for engineered thermoplastics, insert molding and overmolding. Part design, DFM, mold flow and FEA support.' },
      { title: 'Gas assist injection', text: 'Internal and external gas assist for thick sections, long flow lengths and cosmetic surfaces without sink.' },
      { title: 'Structural foam and structural web', text: 'Low and high pressure, single- and multi-nozzle, and gas counter pressure for large, rigid equipment housings.' },
      { title: 'RIM', text: 'Reaction injection molding in polyurethane for large covers and cabinetry at low volume, often for medical and lab equipment.' },
      { title: 'Rotational molding', text: 'Hollow, one-piece tanks, housings and fenders with molded-in inserts.' },
      { title: 'Thermoforming', text: 'Vacuum and pressure forming with CNC trimming for large covers, trays and doors where injection tooling is not justified.' },
      { title: 'Compression, blow and composites', text: 'SMC, BMC and TMC thermosets in polyester, vinyl ester and epoxy; blow molding; low-volume composites.' },
      { title: 'Metal-to-plastic and thixomolding', text: 'Review metal-to-plastic conversion and magnesium thixomolding for thin, light parts.' },
    ],
    compare: {
      caption: 'Plastic process screening (a starting point, not a manufacturability decision)',
      head: ['Process', 'Best for', 'Relative tooling cost', 'Typical volume'],
      rows: [
        ['Injection molding', 'Detailed parts, tight tolerance', 'High', 'Mid to high'],
        ['Gas assist / structural foam', 'Large rigid housings, thick sections', 'Medium to high', 'Low to mid'],
        ['RIM', 'Large covers, cabinetry', 'Low to medium', 'Low'],
        ['Thermoforming', 'Covers, trays, doors from sheet', 'Low', 'Low to mid'],
        ['Rotational molding', 'Hollow one-piece tanks, housings', 'Low', 'Low to mid'],
        ['Compression (SMC/BMC)', 'Strong thermoset panels', 'Medium', 'Mid'],
      ],
    },
    specs: [
      { label: 'Injection press range', value: '20–3,300 tons [CONFIRM]' },
      { label: 'Structural foam', value: 'Up to 1,500 tons [CONFIRM]' },
      { label: 'Thermoforming size', value: 'Up to 6 × 10 ft, 41 in. deep [CONFIRM]' },
      { label: 'Thermoset materials', value: 'SMC, BMC and TMC in polyester, vinyl ester and epoxy' },
      { label: 'Thermoplastics', value: 'ABS, PC, TPE, nylon, PP, HIPS and engineered resins including PEEK [CONFIRM PEEK]' },
      { label: 'Engineering', value: 'Part design, DFM, mold flow analysis, FEA' },
      { label: 'Cleanroom molding', value: 'ISO 7/8 and Class 100,000 softwall at specific sources [CONFIRM]' },
      { label: 'Certifications available', value: 'ISO 9001:2015, IATF 16949, ISO 13485, UL, ITAR at specific sources [CONFIRM]' },
    ],
    send: [
      '3D model (STEP) and drawing',
      'Resin or performance requirement (temperature, impact, UV, flammability rating)',
      'Annual volume and release size',
      'Cosmetic class, texture and color',
      'Inserts, overmolding, paint, EMI shielding or assembly',
      'Tooling ownership and expected program life',
    ],
    proof: ['choose-manufacturing-process-custom-part'],
    faqs: [
      {
        q: 'Injection molding or thermoforming for low volume?',
        a: 'For large covers at a few hundred to a few thousand a year, thermoforming or RIM usually wins because tooling is far cheaper. As volume and detail requirements rise, injection molding pays back. Send the model and volume for a comparison.',
      },
      {
        q: 'Can a metal housing become a molded part?',
        a: 'Often. Metal-to-plastic conversion can consolidate parts and cut weight. We review wall sections, loads, heat and EMI requirements before recommending it.',
      },
      {
        q: 'Who owns the mold?',
        a: 'Typically the customer who pays for the tooling. Confirm ownership, maintenance and storage terms in the quote. [CONFIRM standard terms]',
      },
    ],
    industries: ['medical', 'robotics', 'agriculture-heavy-equipment', 'energy'],
    legacy: [
      '/thermoplastic-and-thermoset-molding/',
      '/thermoplastic-and-thermoset-molding/injection-molding/',
      '/thermoplastic-and-thermoset-molding/gas-assist-injection-molding/',
      '/thermoplastic-and-thermoset-molding/structural-web-molding/',
      '/thermoplastic-and-thermoset-molding/rim/',
      '/thermoplastic-and-thermoset-molding/rotational-molding/',
      '/thermoplastic-and-thermoset-molding/thermoforming/',
      '/thermoplastic-and-thermoset-molding/compression-molding/',
      '/thermoplastic-and-thermoset-molding/blow-molding/',
      '/thermoplastic-and-thermoset-molding/low-volume-composites/',
      '/thermoplastic-and-thermoset-molding/plastic-fabrication/',
    ],
  },

  // ───────────────────────────── CASTING ─────────────────────────────
  {
    slug: 'casting',
    name: 'Casting',
    short: 'Die, graphite, investment, sand and permanent mold: as-cast or machined.',
    icon: 'cast',
    title: 'Metal Castings: Die, Investment, Sand & Graphite | Lupton Associates',
    description:
      'Aluminum and zinc die casting, graphite and plaster mold, investment, sand, permanent mold, grey iron and stainless castings, as-cast or machined and finished.',
    h1: 'Metal castings: die, investment, sand, graphite and permanent mold',
    lede: [
      'Lupton works with foundries and die casters across high-pressure aluminum and zinc die casting, graphite and plaster mold casting, investment casting, air-set sand, permanent mold, grey iron and stainless, delivered as-cast or machined and finished.',
      'For prototypes and low volumes, graphite or plaster mold casting gets you production-like aluminum parts without a production die-cast tool. Send the model, alloy, annual volume and critical dimensions and we will recommend the process and get it quoted.',
    ],
    image: 'graphite-diecast',
    imageAlt: 'Aluminum valve body produced by graphite casting',
    routes: [
      { title: 'High-pressure die casting', text: 'Aluminum and zinc die casting for production volumes, with mold flow analysis and DFM.' },
      { title: 'Graphite and plaster mold', text: 'Fast, low-cost tooling for aluminum and zinc prototypes and bridge quantities that behave like die castings.' },
      { title: 'Investment casting', text: 'Near-net shapes in stainless and alloy steels for complex geometry.' },
      { title: 'Sand and permanent mold', text: 'Air-set sand, grey iron and permanent mold for larger parts and lower volumes.' },
      { title: 'Machined and finished', text: 'CNC machining, powder coat, e-coat and wet paint so the part arrives ready to assemble.', href: '/capabilities/cnc-machining/' },
    ],
    specs: [
      { label: 'Processes', value: 'Plaster mold, air-set sand, high-pressure aluminum and zinc die casting, graphite, investment, grey iron, stainless, permanent mold' },
      { label: 'Graphite tooling lead time', value: 'Under four weeks, supporting thousands of parts [CONFIRM]' },
      { label: 'Die casting machines', value: '150–1,200 tons at one source; capacities up to 4,500 T across sources [CONFIRM]' },
      { label: 'Part weight', value: 'Aluminum to ~25 lb, zinc to ~12 lb in die casting [CONFIRM]' },
      { label: 'Machined tolerance', value: '±0.0005 in. on machined cast features [CONFIRM]' },
      { label: 'Quality', value: 'Real-time X-ray and shot monitoring; AS9100, ITAR at specific sources [CONFIRM]' },
      { label: 'Regions', value: 'Domestic and offshore foundries' },
    ],
    send: [
      '3D model and drawing with machined features called out',
      'Alloy (e.g., A380, ZA-8, 356-T6) or performance need',
      'Annual volume and release size',
      'Critical dimensions, porosity/pressure-tightness requirements',
      'Finish and paint',
      'Prototype date and production start',
    ],
    faqs: [
      {
        q: 'Sand, graphite or die casting for 500 parts a year?',
        a: 'At that volume a production die-cast tool is rarely justified. Graphite, plaster or sand casting usually fits, depending on alloy, detail and surface finish. Send the model and we will compare.',
      },
      {
        q: 'Can I get the casting machined and painted in one order?',
        a: 'Yes. Machining and finishing can be quoted with the casting so you manage one delivered part.',
      },
    ],
    industries: ['military-aerospace', 'heavy-truck', 'robotics', 'agriculture-heavy-equipment'],
    legacy: ['/machined-components/castings/'],
  },

  // ───────────────────────────── EXTRUSIONS ─────────────────────────────
  {
    slug: 'extrusions',
    name: 'Extrusions',
    short: 'Custom aluminum and plastic profiles, cut, machined, bent and finished.',
    icon: 'extrude',
    title: 'Custom Aluminum & Plastic Extrusions, Fabricated | Lupton',
    description:
      'Custom aluminum extrusions with CNC machining, bending, welding, anodize and paint in one order. Plastic profile extrusion and co-extrusion on request.',
    h1: 'Aluminum and plastic extrusions, cut, machined and finished',
    lede: [
      'Aluminum extrusion fits parts with a constant cross-section (heat sinks, rails, frames, enclosures and structural profiles) because it is light, strong for its weight and inexpensive to tool; Lupton gets custom profiles quoted with fabrication and finishing in the same order.',
      'Send the profile drawing, alloy and temper, cut lengths, secondary operations and annual volume, and we will route it to an extruder that can run the die, fabrication and anodize together.',
    ],
    image: 'extrusion-profiles',
    imageAlt: 'Custom aluminum extrusion profiles with complex cross-sections',
    routes: [
      { title: 'Aluminum extrusion', text: '1000, 3000 and 6000 series alloys pushed through a steel die to your cross-section, then quenched, stretched and cut to length.' },
      { title: 'Fabrication', text: 'Robotic drilling, welding, de-bridging, CNC machining, contour milling, precision saw cutting, blanking and piercing.' },
      { title: 'Bending', text: 'Roll bending, die bending and stretch bending.' },
      { title: 'Finishing', text: 'Anodizing, paint, heat treat, chromate, deburring and buffing.' },
      { title: 'Plastic profile extrusion', text: 'Co-extrusion, dual durometer, tri-extrusion and tubing from 1/8 in. to 3 in. [CONFIRM]' },
    ],
    specs: [
      { label: 'Alloys', value: '1000, 3000 and 6000 series aluminum' },
      { label: 'Profile size', value: 'Complex shapes up to ~14 in. circumscribing diameter [CONFIRM]' },
      { label: 'Fabrication', value: 'Drill, weld, bend, machine, mill, saw, blank, pierce' },
      { label: 'Finishes', value: 'Anodize, paint, heat treat, chromate' },
      { label: 'Plastic extrusion', value: 'Class 8 cleanroom at one source [CONFIRM]' },
    ],
    send: [
      'Profile drawing (DXF of the cross-section helps)',
      'Alloy and temper (e.g., 6063-T5, 6061-T6)',
      'Cut lengths and tolerances',
      'Secondary operations and finish',
      'Annual volume in pounds or pieces',
    ],
    faqs: [
      {
        q: 'Is a custom extrusion die expensive?',
        a: 'Extrusion dies are usually modest compared with casting or molding tools, which is why extrusion is often the cheapest way to get a custom constant cross-section. Die cost depends on profile size and complexity. [CONFIRM typical range]',
      },
      {
        q: 'Can the extruder machine and anodize the part?',
        a: 'Yes. Fabrication and finishing can be quoted with the extrusion so the part arrives complete.',
      },
    ],
    industries: ['data-center', 'energy', 'robotics'],
    legacy: ['/machined-components/aluminum-extrusions/'],
  },

  // ───────────────────────────── ELECTRONIC ASSEMBLY ─────────────────────────────
  {
    slug: 'electronic-assembly',
    name: 'Electronic assembly',
    short: 'PCBA, box build, conformal coat, test and microelectronics.',
    icon: 'pcb',
    title: 'PCB Assembly, Box Build & Microelectronics | Lupton Associates',
    description:
      'PCB assembly (SMT, THT, BGA, fine pitch), box build, conformal coat, ICT and functional test, from quick-turn prototypes to high-volume offshore production.',
    h1: 'PCB assembly, box build and microelectronics',
    lede: [
      'Lupton gets printed circuit board assemblies and complete box builds quoted and built (SMT and through-hole, fine pitch and BGA, conformal coat and potting, harnesses and final test) from quick-turn prototypes through high-volume domestic or offshore production.',
      'Send the Gerbers, BOM, assembly drawings, test requirements and volumes; we check the program against each EMS provider’s certifications and capacity before it goes out for quote.',
    ],
    image: 'pcba',
    imageAlt: 'Circular printed circuit board assembly with surface-mount components',
    routes: [
      { title: 'NPI', text: 'New product introduction with DFM and DFT engineering, prototype through high-volume production.' },
      { title: 'SMT and THT', text: 'Mixed technology including ultra-fine pitch, package-on-package and ball grid array, with AOI and X-ray inspection.' },
      { title: 'Box build', text: 'Complete sub-assembly or box build including cable harnesses, sheet metal and custom packaging.' },
      { title: 'Coat and pot', text: 'In-house conformal coating and potting.' },
      { title: 'Test', text: 'Continuity, manufacturing defect analysis (MDA), in-circuit (ICT) and full functional test.' },
      { title: 'Lifecycle', text: 'RoHS conversion, end-of-life component management, depot and warranty repair.' },
      { title: 'Microelectronics', text: 'System-in-package, 3D die stacking, flip chip, MEMS packaging, WLCSP and wire bonding in gold, aluminum and copper.' },
    ],
    specs: [
      { label: 'Assembly', value: 'SMT/THT mixed, ultra-fine pitch, PoP, BGA and micro-BGA with X-ray' },
      { label: 'Inspection and test', value: 'AOI, X-ray, continuity, MDA, ICT, full functional' },
      { label: 'Passives', value: 'Placement down to 01005 in production [CONFIRM]' },
      { label: 'WLCSP / flex', value: '0.3–0.5 mm WLCSP; flex circuits down to 12.5 µm [CONFIRM]' },
      { label: 'Certifications available', value: 'ISO 13485 when required and verified for the source; AS9100D, ITAR, J-STD-001, NIST SP 800-171 at specific sources [CONFIRM]' },
      { label: 'Regions', value: 'Domestic and offshore (low-cost region) production' },
    ],
    send: [
      'Gerbers or ODB++, BOM with manufacturer part numbers, pick-and-place',
      'Assembly drawings and any conformal coat or potting maps',
      'Test requirements and fixtures (ICT, functional)',
      'Annual volume, build quantities and NPI timeline',
      'Compliance: RoHS, IPC class, ISO 13485 / AS9100 needs',
      'Box build scope: enclosure, harness, labeling, packaging',
    ],
    proof: ['contract-manufacturing-cryogenic-vacuum-pump'],
    faqs: [
      {
        q: 'Can one supplier do the board, the harness and the enclosure?',
        a: 'Yes. Box build programs routinely combine PCBA, cable harnesses and sheet metal. Send the full BOM and scope so the right source can quote the complete assembly.',
      },
      {
        q: 'Do you support ISO 13485 medical electronics?',
        a: 'When the program requires it and the certification is verified for the selected source. Put the requirement in the RFQ and we confirm it before quote. [CONFIRM]',
      },
      {
        q: 'Our board has end-of-life parts. Can you help?',
        a: 'Yes. EOL component management and RoHS conversion were part of the published cryogenic vacuum pump program. Send the BOM and flag the parts at risk.',
      },
    ],
    industries: ['medical', 'military-aerospace', 'data-center', 'energy', 'robotics'],
    legacy: ['/electronics/', '/electronics/electronic-manufacturing/', '/electronics/microelectronics/'],
  },

  // ───────────────────────────── PROTOTYPING ─────────────────────────────
  {
    slug: 'prototyping',
    name: 'Prototyping',
    short: 'Prototype routes chosen around what the part must prove, and how it will be produced.',
    icon: 'proto',
    title: 'Prototyping to Production: Metal, Plastic & Electronics | Lupton',
    description:
      'Pick the prototype route by what it must prove: additive, cast urethane, CNC, sheet metal, short-run stamping, graphite casting or bridge tooling.',
    h1: 'Prototypes that answer the question you need answered',
    lede: [
      'A useful prototype answers a defined question (fit, function, appearance, material behavior, assembly or test), so Lupton starts with what the prototype must prove, then picks the route: additive or SLA, cast urethane, CNC machining, sheet metal or short run stamping, graphite or sand casting, or bridge tooling.',
      'Send the model, the quantity, the date you need parts and the production process you expect to use, and we will recommend a prototype route that does not box you out of production.',
    ],
    image: 'machined-transmission',
    imageAlt: 'Machined aluminum transmission housing prototype',
    routes: [
      { title: 'Design and appearance models', text: 'Additive and stereolithography, cast urethane, fabricated plastic and thermoformed parts to review geometry, handling, fit and visual intent before production tooling.' },
      { title: 'Metal prototypes', text: 'CNC machining and turning, sheet metal fabrication and short run stamping, plaster, graphite or air-set sand casting, aluminum or polymer extrusion.' },
      { title: 'Production-like bridge quantities', text: 'Injection or reaction-injection molding, thixomolding, PCB and box-build assembly including custom cable assemblies, so launch does not wait for production tooling.' },
    ],
    specs: [
      { label: 'Prototype molds', value: 'Aluminum or P-20 prototype tools; 2–4 weeks on complex programs at one source [CONFIRM]' },
      { label: 'Graphite casting tooling', value: 'Under four weeks [CONFIRM]' },
      { label: 'Short run stamping tooling', value: 'Weeks rather than months' },
      { label: 'Sheet metal prototypes', value: 'Fiber-laser cut and brake formed [CONFIRM lead time]' },
    ],
    send: [
      'What the prototype must prove, and the decision it supports',
      'Current drawing, model, revision and known interfaces',
      'Target material and acceptable prototype substitutions',
      'Quantity, delivery sequence and required date',
      'Dimensions, appearance, function and test criteria',
      'Intended production process, volume and open risks',
    ],
    proof: ['choose-manufacturing-process-custom-part'],
    faqs: [
      {
        q: 'Should the prototype use the production process?',
        a: 'Only if the question you are answering depends on it. Appearance models can be printed or cast in urethane; functional tests of a die casting may need graphite casting; a stamped bracket can be prototyped on a laser. Tell us what the prototype must prove.',
      },
      {
        q: 'Can the same shop take us from prototype to production?',
        a: 'Often, and it saves re-qualification. We look for a route where the prototype source can also run production volumes, or where the tooling carries over.',
      },
    ],
    industries: ['robotics', 'medical', 'military-aerospace', 'data-center'],
    legacy: ['/prototyping/'],
  },

  // ───────────────────────────── LOW COST REGION ─────────────────────────────
  {
    slug: 'low-cost-region-manufacturing',
    name: 'Low-cost region manufacturing',
    short: 'Asia and Mexico production with DFM, program management and US warehousing.',
    icon: 'globe',
    title: 'Low-Cost Region Manufacturing: Asia & Mexico | Lupton Associates',
    description:
      'Move high-volume custom parts and box builds to qualified manufacturers in Asia and Mexico, with DFM, program management and US warehousing. Compare to domestic.',
    h1: 'Low-cost region manufacturing, with a North American contact',
    lede: [
      'When volume is high and cost is the driver, Lupton moves custom parts and box builds to qualified manufacturers in Asia and Mexico, with DFM, program management, quality planning and domestic warehousing handled so your team is not managing an overseas supplier alone.',
      'Send the drawing, annual volume, target price and current landed cost; we will compare offshore, nearshore and domestic options on the same drawing, including when staying domestic is the better call.',
    ],
    image: 'sm-shop',
    imageAlt: 'High-volume sheet metal production floor with parts staged between operations',
    routes: [
      { title: 'Asia', text: 'Sheet metal, stamping, die casting, molding, box build and EMS in China, Thailand and Taiwan [CONFIRM regions].' },
      { title: 'Mexico', text: 'Cable assemblies, fabrication, molding and extrusion in Mexico [CONFIRM locations], with territory coverage in Northern Mexico.' },
      { title: 'Program support', text: 'Customized production lines, in-house tooling, DFM and sustained engineering, total quality management and production material planning.' },
      { title: 'Logistics', text: 'Domestic warehousing and distribution, kanban/JIT release [CONFIRM], so you order like a local supplier.' },
    ],
    compare: {
      caption: 'Four checks before comparing production quotes',
      head: ['Check', 'Why it matters'],
      rows: [
        ['Landed cost', 'Include freight, duties, tariffs and inventory, not just piece price.'],
        ['Process fit', 'Match the method to the part, volume and tolerance.'],
        ['Current shop capacity', 'Confirm timing against work already scheduled.'],
        ['Complete RFQ inputs', 'State drawings, material, volume, timing and quality needs.'],
      ],
    },
    specs: [
      { label: 'Scope', value: 'Partial to complete box builds; customized production lines; in-house tooling' },
      { label: 'Engineering', value: 'DFM and sustained engineering support' },
      { label: 'Logistics', value: 'Domestic warehousing and distribution' },
      { label: 'Locations', value: 'China, Thailand, Taiwan, Mexico [CONFIRM]' },
      { label: 'US program management', value: 'Texas-based program management for the largest sheet metal source [CONFIRM]' },
      { label: 'Certifications available', value: 'ISO 9001:2015, ISO 14001:2015, UL, IATF 16949 at specific sources [CONFIRM]' },
    ],
    send: [
      sendDrawing,
      'Annual volume and release pattern',
      'Target price and current landed cost',
      'Quality, documentation and compliance requirements',
      'Packaging, labeling and delivery location',
      'Launch timing and any tariff or country-of-origin constraints',
    ],
    faqs: [
      {
        q: 'When does offshore production make sense?',
        a: 'When volume is high enough that piece-price savings outweigh freight, duties, inventory and longer lead time. For low volumes, fast-changing designs or tariff-exposed parts, domestic or Mexico often wins. We price the options side by side.',
      },
      {
        q: 'Who do we place the purchase order with?',
        a: 'With the manufacturer. Lupton reviews the project and supports the program, and the shop quotes, invoices and ships. [CONFIRM for offshore programs invoiced through a US entity]',
      },
      {
        q: 'How is quality managed offshore?',
        a: 'Through the manufacturer’s quality system, first article approval, and inspection and documentation requirements written into the RFQ. [CONFIRM specifics per source]',
      },
    ],
    industries: ['data-center', 'energy', 'heavy-truck'],
    legacy: ['/electronics/offshore-contract-manufacturing/'],
  },
];

export const topCapabilities = capabilities.filter((c) => !c.parent);
export const capabilityBySlug = (slug: string) => capabilities.find((c) => c.slug === slug && !c.parent);
export const capabilityPath = (c: Capability) =>
  c.parent ? `/capabilities/${c.parent}/${c.slug}/` : `/capabilities/${c.slug}/`;

// "Other custom solutions" on the live site: keep as-is and migrate URLs later.
export const otherSolutions = [
  { name: 'Labels & product decoration', legacy: '/other-custom-solutions/labels/' },
  { name: 'Active cleaning & sealing', legacy: '/other-custom-solutions/active-cleaning-sealing-solutions/' },
  { name: 'Bolt-on lift systems', legacy: '/other-custom-solutions/bolt-on-lift-systems/' },
  { name: 'Gas springs & dampers', legacy: '/other-custom-solutions/gas-springs/' },
];
