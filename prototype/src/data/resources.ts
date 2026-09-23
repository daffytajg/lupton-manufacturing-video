import type { Resource } from './types';

// Guides migrate the live /resources/ articles (copy tightened, facts unchanged) plus two new
// answers built only from facts already published on luptons.com. Case studies keep the
// figures from Lupton's original case-study PDFs exactly as the live pages state them.

export const resources: Resource[] = [
  {
    slug: 'fabrication-vs-stamping-break-even',
    kind: 'Guide',
    title: 'Laser-Cut, Short Run Stamping or Progressive Die? The Volume Break-Even',
    description:
      'When a laser-cut part should become a short run stamping (~2,500–100,000 pcs/yr, ≤20×30 in. flat) or a progressive die (>100,000/yr), with a worked example.',
    h1: 'Laser-cut, short run stamping or progressive die: where is the break-even?',
    lede: [
      'For most sheet metal parts, laser or turret cutting plus press-brake forming is cheapest below roughly 2,500 pieces a year, short run stamping is cheapest from roughly 2,500 to 100,000 pieces a year on parts under about 20 × 30 in. flat, and progressive dies win above roughly 100,000 a year.',
      'Geometry, material, secondary operations and program life move those lines, so treat them as a screening rule and run the payback on your actual print.',
    ],
    published: '2026-09-23',
    updated: '2026-09-23',
    image: 'formed-brackets',
    imageAlt: 'Short-run stamped brackets beside a pen for scale',
    body: [
      { type: 'h2', text: 'The screening rule' },
      {
        type: 'table',
        table: {
          caption: 'Sheet metal process by annual volume',
          head: ['Annual volume', 'Usually cheapest', 'Tooling', 'Tooling lead time'],
          rows: [
            ['Prototypes to ~2,500', 'Laser / turret + press brake', 'None', 'None'],
            ['~2,500 to ~100,000', 'Short run stamping (parts ≤ ~20 × 30 in. flat)', 'Die inserts in a master holder', 'Weeks'],
            ['> ~100,000', 'Progressive die', 'Dedicated multi-station die', 'Months'],
          ],
        },
      },
      { type: 'h2', text: 'A worked example from a published case study' },
      {
        type: 'p',
        text: 'A recreational-industry detail part had been produced with laser or CNC turret operations. Demand was **10,000 pieces a year, released in quantities of 2,500**. Moving it to short run stamping with common holders and forming tools changed the numbers like this:',
      },
      {
        type: 'facts',
        items: [
          { label: 'Piece price before', value: '≈ $2.65' },
          { label: 'Piece price after', value: '≈ $1.45' },
          { label: 'Tooling charge', value: '$1,000' },
          { label: 'Annual savings reported', value: '≈ $11,000 at 10,000 pcs' },
        ],
      },
      {
        type: 'p',
        text: 'The math: $1.20 saved per piece × 10,000 pieces is about $12,000 a year, so the $1,000 tooling pays back in roughly one month, which is consistent with the ~$11,000 first-year savings the study reports. Your part will not match these numbers, but the method carries over: (current piece price − stamped piece price) × annual volume, against the tooling charge and any requalification cost.',
      },
      { type: 'h2', text: 'What moves the break-even' },
      {
        type: 'ul',
        items: [
          '**Flat size.** Above about 20 × 30 in. flat, short run tooling gets hard to justify, so fabrication usually stays cheaper.',
          '**Features per part.** More holes and forms mean more fabrication time per piece, which favors stamping sooner.',
          '**Material and thickness.** Thick or hard material can slow laser cutting and change die design.',
          '**Secondary operations.** Welding, hardware and finishing cost the same either way, so they dilute the savings.',
          '**Design stability.** If the part is still changing, short run inserts are cheaper to modify than a progressive die.',
          '**Program life.** A progressive die has to amortize over real lifetime volume, not a hopeful forecast.',
        ],
      },
      { type: 'h2', text: 'When to start short run and convert later' },
      {
        type: 'p',
        text: 'If the forecast is uncertain, a common path is to launch in short run stamping to prove the part and the demand, then convert to a progressive die once volume justifies it. Both paths can be reviewed against the same print.',
      },
      {
        type: 'callout',
        text: 'Send the print, material, gauge, annual volume and current piece price. We will tell you which path pays at your numbers.',
      },
    ],
    faqs: [
      {
        q: 'At what volume should a laser-cut part become a stamping?',
        a: 'As a rule of thumb, around 2,500 pieces a year for parts under about 20 × 30 in. flat. Geometry and material shift the break-even.',
      },
      {
        q: 'How much does short run stamping tooling cost?',
        a: 'It depends on the part. In the published example the tooling charge was $1,000. Short run NRE is a fraction of progressive-die tooling because inserts run in a shared master holder.',
      },
    ],
    capabilities: ['metal-stamping', 'sheet-metal-fabrication'],
    industries: ['heavy-truck', 'medical', 'data-center'],
    legacy: [],
  },
  {
    slug: 'what-to-send-with-an-rfq',
    kind: 'Guide',
    title: 'What to Send With a Custom Part RFQ So It Gets Quoted',
    description:
      'The quote-ready package for a custom part: drawing, CAD, material, volume, critical tolerances, finish, secondary ops, testing, documentation and timing.',
    h1: 'What should I send with an RFQ so the part actually gets quoted?',
    lede: [
      'Send the current drawing and revision, a CAD model, the material, annual volume and release quantities, the truly critical tolerances, finish and secondary operations, testing and documentation requirements, and the date you need parts, plus the reason you are quoting.',
      'Unknowns are fine; label them as open so the review resolves them instead of the quote burying an assumption.',
    ],
    published: '2026-09-23',
    updated: '2026-09-23',
    body: [
      { type: 'h2', text: 'The quote-ready checklist' },
      {
        type: 'ol',
        items: [
          '**Drawing and revision.** Identify the controlling revision; resolve conflicts between the drawing and the email.',
          '**CAD model.** STEP for mechanical parts; Gerbers/ODB++ for boards.',
          '**Material.** Grade and condition, not just "aluminum" or "plastic", and acceptable alternates.',
          '**Annual volume and release quantities.** One prototype, 500 a year and 100,000 a year point to different tooling.',
          '**Critical tolerances.** Mark what is truly critical to function; do not apply precision everywhere.',
          '**Finish and appearance.** Plating, coating, color, texture and cosmetic class.',
          '**Secondary operations and assembly.** Welding, hardware, inserts, heat treat, cleaning, marking, kitting.',
          '**Testing, inspection and documentation.** FAI, PPAP, certs, traceability, test specs.',
          '**Tooling status and ownership.** Existing tools, condition and who owns them.',
          '**Packaging and delivery.**',
          '**Timing.** Prototype, validation and production dates, and what drives them.',
          '**Why you are quoting.** New program, second source, cost-down, lead time or capacity.',
        ],
      },
      { type: 'h2', text: 'Why custom-part quotes stall' },
      {
        type: 'ul',
        items: [
          'The drawing and the request do not match.',
          'The material is missing or too broad.',
          'Annual volume and release quantities are unclear.',
          'Every tolerance appears critical.',
          'Secondary operations are incomplete.',
          'The process was chosen before the part was reviewed.',
          'Timing leaves out tooling, validation or approvals.',
        ],
      },
      { type: 'h2', text: 'If the design is still early' },
      {
        type: 'p',
        text: 'Say what is fixed, what is preferred and what is open. An early review can focus on likely process families, material questions, tooling and volume assumptions, tolerance and finish risks, and the information needed before formal quoting.',
      },
      {
        type: 'callout',
        text: 'Lupton responds within one business day to confirm whether the project appears to fit, what is still needed, or the practical next step. The first response is not a quotation.',
      },
    ],
    faqs: [
      {
        q: 'What is the minimum information for an early review?',
        a: 'A drawing or part description, material or performance requirement, dimensions, expected volume, critical tolerances, finish, application and timing, with anything open identified.',
      },
      {
        q: 'Why do manufacturers decline to quote?',
        a: 'Process mismatch, incomplete drawings, unclear volume, unrealistic timing, unavailable material, unsupported tolerances, missing secondary operations, capacity, or a program that does not fit the shop’s equipment and commercial model.',
      },
    ],
    capabilities: ['sheet-metal-fabrication', 'cnc-machining', 'plastic-molding'],
    industries: [],
    legacy: ['/resources/why-custom-part-is-difficult-to-quote/'],
  },
  {
    slug: 'choose-manufacturing-process-custom-part',
    kind: 'Guide',
    title: 'How to Choose a Manufacturing Process for a Custom Part',
    description:
      'Compare machining, casting, stamping, fabrication, molding and assembly paths using material, geometry, tolerances, volume, tooling, finish and timing.',
    h1: 'How should this part be made?',
    lede: [
      'Seven inputs usually decide the process for a custom part: material and performance, geometry and size, critical tolerances, annual volume, tooling and change risk, finish and documentation, and timing and supply path.',
      'Choosing the process too early can lock a program into unnecessary tooling, cost or lead time, so when more than one route could work, compare them against the same drawing before committing.',
    ],
    published: '2026-07-01',
    updated: '2026-09-23',
    body: [
      { type: 'h2', text: 'The seven inputs' },
      {
        type: 'ol',
        items: [
          '**Material and performance.** Load, impact, heat, chemicals, electrical requirements, environment, weight and service life.',
          '**Geometry and size.** Walls, undercuts, cavities, ribs, bosses, holes, bends, draft, enclosed sections and overall size.',
          '**Tolerances and critical features.** Separate truly critical dimensions from general tolerances.',
          '**Annual volume and order pattern.** Prototype, short-run, mid- and high-volume programs support different tooling economics.',
          '**Tooling and change risk.** If the design is still changing, lower initial tooling may deserve review.',
          '**Finish, assembly and documentation.** Coating, plating, heat treat, cleaning, welding, inserts, assembly, test, traceability, certifications.',
          '**Timing and supply path.** Prototype timing, launch, capacity, domestic or offshore preference and supplier risk.',
        ],
      },
      { type: 'h2', text: 'Common paths to compare' },
      {
        type: 'table',
        table: {
          caption: 'Screening tool, not a manufacturability decision',
          head: ['Process', 'Often reviewed when', 'Questions to settle'],
          rows: [
            ['CNC machining', 'Geometry or tolerances need direct material removal, design is changing, or volume is limited', 'Material, stock size, access, tolerances, finish, cycle time'],
            ['Casting', 'Metal geometry, consolidation or volume may justify tooling', 'Alloy, wall sections, porosity, draft, machining allowance, volume'],
            ['Stamping', 'Sheet metal parts have repeat volume and geometry that supports tooling', 'Material, thickness, blank size, forming, tolerances, volume'],
            ['Sheet metal fabrication', 'Parts need cutting, bending, welding, hardware or enclosure assembly', 'Gauge, bend radii, welds, hardware, finish, quantity'],
            ['Injection molding', 'Plastic parts may support production tooling and repeat volume', 'Resin, wall, draft, undercuts, cosmetics, tooling, volume'],
            ['Rotational molding', 'Larger hollow plastic parts, low to mid volume', 'Resin, wall, inserts, finish, size, volume'],
            ['Thermoforming', 'Sheet plastic housings, covers, trays or larger formed parts', 'Material, draw ratio, trim, texture, wall distribution, volume'],
            ['Electronics / electromechanical', 'PCBAs, harnesses, cables, box build or integration', 'BOM, drawings, test, traceability, components, volume'],
          ],
        },
      },
      { type: 'h2', text: 'When to compare more than one route' },
      {
        type: 'ul',
        items: ['The design is early', 'The quote feels high', 'Annual volume is changing', 'The current supplier cannot meet timing or quality', 'Tooling has not been committed', 'The part combines metal, plastic, electronics or assembly', 'Domestic, offshore or mixed production is being weighed', 'A second source is needed'],
      },
    ],
    faqs: [
      { q: 'Is the lowest piece price always the best process?', a: 'No. Tooling, secondary operations, scrap, testing, freight, inventory, change risk, quality and timing all affect total program cost.' },
      { q: 'What if annual volume is uncertain?', a: 'Give a low, expected and high range with release quantities. That separates prototype, bridge and production paths.' },
    ],
    capabilities: ['cnc-machining', 'casting', 'metal-stamping', 'sheet-metal-fabrication', 'plastic-molding', 'electronic-assembly'],
    industries: [],
    legacy: ['/resources/choose-manufacturing-process-custom-part/'],
  },
  {
    slug: 'second-source-custom-components',
    kind: 'Guide',
    title: 'How to Build a Second Source for a Custom Component',
    description:
      'Build a second-source package for custom metal, plastic, electronic and cable parts before supplier risk hits production: what to send, how to validate.',
    h1: 'Build a second source before the current one fails',
    lede: [
      'Start a second source when lead times slip, capacity tightens, quality or communication degrades, pricing jumps without a technical reason, tooling ownership is unclear, or tariff and freight risk changes, before it becomes an emergency.',
      'The new source needs the current drawing and revision, material, process, tooling details, quality history, volumes, documentation and the validation plan, so prepare that package first.',
    ],
    published: '2026-07-01',
    updated: '2026-09-23',
    body: [
      { type: 'h2', text: 'What the second source needs to see' },
      {
        type: 'ul',
        items: ['Current drawing and revision level', 'CAD files and specifications', 'Material and approved alternatives', 'Annual volume and release quantities', 'Current process and known secondary operations', 'Critical tolerances and inspection requirements', 'Finish, plating, heat treat, cleaning and packaging', 'Tooling information: ownership, location, age and condition', 'Quality history and recurring defects', 'Testing, certification, traceability and documentation', 'Target timing for validation and production', 'Reason for adding or changing the source'],
      },
      { type: 'h2', text: 'Do not assume the current process must be copied' },
      { type: 'p', text: 'The incumbent process may have been chosen for an older volume, material or supply condition. Before duplicating it, check whether the part still fits the current process, tooling strategy, domestic or offshore route, material, order pattern and inspection plan. Any change is reviewed and approved by you.' },
      { type: 'h2', text: 'Build validation into the RFQ' },
      { type: 'p', text: 'State how the second source will be approved (first articles, samples, capability studies, material records, functional testing, dimensional reports, customer approval). Validation affects timing and cost and should not be an afterthought.' },
    ],
    faqs: [
      { q: 'When should we begin a second-source project?', a: 'Before the current source becomes an emergency. Tooling, samples, validation, customer approval and documentation take time.' },
      { q: 'Can the second source use the existing tooling?', a: 'It depends on ownership, condition, location, compatibility and the receiving shop’s process. Send the tooling records and do not assume a transfer is possible.' },
    ],
    capabilities: ['sheet-metal-fabrication', 'metal-stamping', 'wire-harnesses-cable-assemblies', 'plastic-molding'],
    industries: ['data-center', 'medical'],
    legacy: ['/resources/second-source-custom-components/'],
  },
  {
    slug: 'short-run-stamping-part-conversion',
    kind: 'Case study',
    title: 'Case Study: Converting a Turret Part to Short Run Stamping',
    description:
      'A 10,000 pcs/yr recreational-industry part moved from laser/turret to short run stamping: piece price ≈$2.65 → ≈$1.45 with a $1,000 tooling charge.',
    h1: 'Short run stamping conversion: $2.65 to $1.45 a piece',
    lede: [
      'A recreational-industry detail part produced by laser or CNC turret was converted to short run metal stamping, cutting the piece price from about $2.65 to $1.45 with a $1,000 tooling charge at 10,000 pieces a year.',
      'The source study reports about $11,000 in annual savings while keeping tooling and design changes economical.',
    ],
    published: '2017-11-22',
    updated: '2026-09-23',
    image: 'tooling-guide-posts',
    imageAlt: 'Short run stamping tooling fixture with guide posts holding a plate',
    body: [
      { type: 'facts', items: [
        { label: 'Industry', value: 'Recreational' },
        { label: 'Annual demand', value: '10,000 pcs, released in 2,500s' },
        { label: 'Before', value: 'Laser / CNC turret, ≈ $2.65 ea' },
        { label: 'After', value: 'Short run stamping, ≈ $1.45 ea' },
        { label: 'Tooling', value: '$1,000' },
        { label: 'Savings reported', value: '≈ $11,000 / yr' },
      ] },
      { type: 'h2', text: 'Requirements' },
      { type: 'ul', items: ['Lower piece-part cost without a large hard-tool investment', 'Keep design changes economical', 'Annual demand of 10,000 pieces released in quantities of 2,500'] },
      { type: 'h2', text: 'Approach' },
      { type: 'ul', items: ['Use common holders and forming tools in a short run stamping process', 'Increase pieces per hour while keeping design-change flexibility'] },
      { type: 'callout', text: 'Source: the facts and figures in Lupton’s original case-study PDF. Fit, pricing, capacity and lead time are confirmed for each new requirement.' },
    ],
    capabilities: ['metal-stamping'],
    industries: ['heavy-truck'],
    legacy: ['/resources/short-run-stamping-part-conversion/'],
  },
  {
    slug: 'automated-pharmaceutical-dispensing-machine-structural-frame',
    kind: 'Case study',
    title: 'Case Study: Welded Structural Frame for a Pharmaceutical Dispensing Machine',
    description:
      'A welded frame held 0.050 in. across diagonal mounting points, 0.030 in. hole position and ≤1° beam twist, AWS D1.1 welding and appliance-white powder coat.',
    h1: 'Structural frame for an automated pharmaceutical dispensing machine',
    lede: [
      'A structural support frame for an automated pharmaceutical dispensing machine was built to hold 0.050 in. across diagonal mounting points, 0.030 in. positional tolerance on hole locations, and a horizontal beam within one degree of twist.',
      'It was welded to AWS D1.1, finished in appliance-white powder coat, fixtured to control distortion, and shipped on a skid for production-line assembly.',
    ],
    published: '2018-06-11',
    updated: '2026-09-23',
    body: [
      { type: 'facts', items: [
        { label: 'Diagonal mounting points', value: '0.050 in.' },
        { label: 'Hole position', value: '0.030 in.' },
        { label: 'Beam twist', value: '≤ 1°' },
        { label: 'Welding', value: 'AWS D1.1' },
        { label: 'Finish', value: 'Appliance-white powder coat' },
      ] },
      { type: 'h2', text: 'Approach' },
      { type: 'ul', items: ['Fixture all components for welding and reduce welding where possible to control distortion', 'Dedicated tooling and process controls to hold frame tolerances', 'DFM and cost-reduction work with the client engineering team', 'Ship on a skid to support production-line assembly'] },
      { type: 'callout', text: 'Source: the facts and figures in Lupton’s original case-study PDF.' },
    ],
    capabilities: ['sheet-metal-fabrication'],
    industries: ['medical'],
    legacy: ['/resources/automated-pharmaceutical-dispensing-machine-structural-frame/'],
  },
  {
    slug: 'contract-manufacturing-cryogenic-vacuum-pump',
    kind: 'Case study',
    title: 'Case Study: Contract Manufacturing for a Cryogenic Vacuum Pump',
    description:
      'High-mix and high-volume contract manufacturing for a cryogenic vacuum pump with embedded microprocessors: NPI, custom test, RoHS and EOL support.',
    h1: 'Contract manufacturing for a cryogenic vacuum pump',
    lede: [
      'A cryogenic vacuum pump with embedded microprocessors for performance, diagnostics and communications needed one contract manufacturer to support both high-mix/low-volume and high-volume builds.',
      'The program covered new-product introduction, assembly and custom-tailored testing, RoHS conversion when needed, and engineering support for end-of-life components.',
    ],
    published: '2018-06-11',
    updated: '2026-09-23',
    body: [
      { type: 'h2', text: 'Requirements' },
      { type: 'ul', items: ['Support high-mix/low-volume and high-volume production', 'Integrate electronics and assembly for a diagnostic, communications-enabled product', 'Manage product testing, RoHS conversion and end-of-life components'] },
      { type: 'h2', text: 'Approach' },
      { type: 'ul', items: ['New-product-introduction services', 'Assembly and custom-tailored testing', 'RoHS conversion support', 'Engineering support for EOL component management'] },
      { type: 'callout', text: 'Source: the facts in Lupton’s original case-study PDF.' },
    ],
    capabilities: ['electronic-assembly'],
    industries: [],
    legacy: ['/resources/contract-manufacturing-cryogenic-vacuum-pump/'],
  },
];

export const resourceBySlug = (slug: string) => resources.find((r) => r.slug === slug);
