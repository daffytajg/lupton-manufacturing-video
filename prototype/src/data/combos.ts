import type { Combo } from './types';

// Highest-intent capability × industry pages (see search-intent.md, "priority order").

export const combos: Combo[] = [
  {
    industry: 'data-center',
    capability: 'sheet-metal-fabrication',
    slug: 'sheet-metal-enclosures',
    name: 'Sheet metal enclosures & racks',
    title: 'Sheet Metal Enclosures & Rack Hardware for Data Centers | Lupton',
    description:
      'Custom PDU and UPS enclosures, switchgear panels, rack frames, server chassis and EMI shields: laser-cut, formed, welded, powder-coated and assembled.',
    h1: 'Sheet metal enclosures, racks and chassis for data center equipment',
    lede: [
      'Lupton gets custom sheet metal for data center equipment built (PDU and UPS enclosures, switchgear panels, rack frames and rails, server and battery chassis, brackets and EMI shields), laser-cut, punched, formed, welded, powder-coated and assembled, from prototype through volume ramp.',
      'Send the drawing or model, material and gauge, finish, hardware, annual volume and launch date; we match it to a fabricator with the capacity and finishing lines for the program, domestic or low-cost region.',
    ],
    image: 'sm-brake',
    imageAlt: 'Press brake forming a long sheet metal panel for an electrical enclosure',
    parts: [
      'PDU, UPS and switchgear enclosures and panels',
      'Rack frames, rails and cabinet hardware',
      'Server, storage and battery chassis',
      'Brackets, covers and EMI shields',
      'Busway and cable-management hardware',
      'Turnkey enclosures with boards, cables and backplanes installed',
    ],
    specs: [
      { label: 'Processes', value: 'Laser, turret punch, press brake and panel bender, MIG/TIG/spot/robotic weld, hardware insertion' },
      { label: 'Finish', value: 'Powder coat, e-coat, wet paint, silk screen' },
      { label: 'Assembly and test', value: 'Mechanical and electrical integration with hi-pot, functional and software testing' },
      { label: 'Thickness', value: '24 gauge to 0.375 in. [CONFIRM]' },
      { label: 'Locations', value: 'US, Mexico, China, Thailand [CONFIRM]' },
      { label: 'Certifications available', value: 'ISO 9001:2015, ISO 14001:2015, UL [CONFIRM]' },
      { label: 'Supply', value: 'US warehousing, kanban/JIT release for offshore builds [CONFIRM]' },
    ],
    requirements: [
      'Flatness and hole position on mounting and rail interfaces',
      'Grounding and bonding points; masking for conductive paths',
      'Powder coat spec, color and thickness',
      'EMI gasketing and shielding',
      'UL or customer certification requirements on the end product [CONFIRM]',
      'Packaging for rack-level shipment',
    ],
    send: [
      'Drawing or model (STEP + PDF) and revision',
      'Material and gauge',
      'Finish spec and color',
      'Hardware and gasket callouts',
      'Annual volume, release quantity and ramp plan',
      'Assembly scope and test requirements',
      'Launch date and any second-source reason',
    ],
    faqs: [
      {
        q: 'Can the enclosure shop also install the bus bars, harnesses and boards?',
        a: 'Yes, turnkey assembly including boards, cables and backplanes with hi-pot, functional and software testing is available at sheet metal sources. Send the full scope so it is quoted together.',
      },
      {
        q: 'We are ramping fast. How do we add capacity without re-qualifying from scratch?',
        a: 'Start the second-source package early: current drawing and revision, material, finish, tooling, quality history and validation plan. We will look for a shop that can run the part as-is or with minimal changes.',
      },
      {
        q: 'Domestic or offshore for enclosures?',
        a: 'Large, low-density enclosures are expensive to ship, which often favors domestic or Mexico builds; high-volume chassis may favor Asia. We price both on the same drawing.',
      },
    ],
    proof: ['second-source-custom-components', 'automated-pharmaceutical-dispensing-machine-structural-frame'],
    legacy: [],
  },
  {
    industry: 'data-center',
    capability: 'metal-stamping',
    slug: 'copper-busbars',
    name: 'Copper bus bars',
    title: 'Copper Bus Bars for Data Center Power: Stamped & Fabricated | Lupton',
    description:
      'Copper and aluminum bus bars for PDUs, UPS and switchgear: punched or stamped, formed, machined, plated and insulated. Fab for prototypes, stamping at volume.',
    h1: 'Copper and aluminum bus bars for data center power',
    lede: [
      'Lupton gets copper and aluminum bus bars quoted and built for PDUs, UPS systems, switchgear and rack power (punched or stamped, formed, machined, plated and insulated), with the path chosen by volume: fabrication for prototypes and low runs, short run or progressive stamping as volume climbs.',
      'Send the drawing with alloy and temper, thickness, plating, insulation, current rating and annual volume, and we will route it to a shop that runs conductive parts.',
    ],
    image: '', // no verified bus bar photo yet; page uses the blueprint drawing [CONFIRM photo]
    imageAlt: 'Bus bar line drawing',
    parts: [
      'Rack and PDU bus bars',
      'Switchgear and UPS bus bars',
      'Flexible and laminated bus bar assemblies [CONFIRM]',
      'Battery interconnects and terminals',
      'Stamped lugs, clips and contacts',
    ],
    specs: [
      { label: 'Materials', value: 'Copper (e.g., C110) and aluminum; confirm alloy and temper on the print' },
      { label: 'Forming routes', value: 'CNC punch or laser and brake at low volume; short run stamping ~2,500–100,000 pcs/yr; progressive die above ~100,000' },
      { label: 'Plating', value: 'Tin, silver or nickel [CONFIRM]' },
      { label: 'Insulation', value: 'Powder or epoxy coating, heat shrink, laminated insulation [CONFIRM]' },
      { label: 'Secondary', value: 'Machining, tapping, hardware insertion, marking' },
    ],
    requirements: [
      'Current rating and allowable temperature rise',
      'Contact-surface flatness and finish at joints',
      'Plating type and thickness; masking',
      'Dielectric and insulation requirements',
      'Hole position for mating hardware',
      'Traceability and material certs',
    ],
    send: [
      'Drawing (PDF + STEP) with alloy, temper and thickness',
      'Plating and insulation spec',
      'Current rating and test requirements',
      'Annual volume and release quantity',
      'Assembly scope (hardware, insulation, kitting)',
      'Launch date',
    ],
    faqs: [
      {
        q: 'Should our bus bars be stamped or fabricated?',
        a: 'Follow the same volume logic as any sheet metal part: fabrication for prototypes and low runs, short run stamping around 2,500 to 100,000 pieces a year, progressive dies above that. Thick copper and plating requirements shift the break-even, so send the print and volume.',
      },
      {
        q: 'Can plating and insulation be quoted with the bus bar?',
        a: 'Yes. Quote the finished part (formed, plated, insulated and marked) so one supplier owns the result.',
      },
    ],
    proof: ['fabrication-vs-stamping-break-even', 'short-run-stamping-part-conversion'],
    legacy: [],
  },
  {
    industry: 'data-center',
    capability: 'cnc-machining',
    slug: 'cold-plates',
    name: 'Liquid cold plates',
    title: 'Liquid Cold Plates for Data Center & Power Electronics | Lupton',
    description:
      'Custom liquid cold plates and cooling components: machined, brazed or tubed channels, flatness, fittings, leak and pressure test. Send heat load and CAD.',
    h1: 'Liquid cold plates for data center and power electronics cooling',
    lede: [
      'When air cooling is not enough, a cold plate moves heat from a component into a controlled liquid path, and the quote depends on more than plate dimensions: material, flatness, channel design, fittings, joining method, pressure, finish, testing and volume all decide how it should be made.',
      'Send the drawing or CAD, heat load, coolant, flow and pressure, contact-surface flatness, test requirements, annual volume and timing; Lupton reviews it and routes it to a machining and brazing shop set up for liquid-cooling parts.',
    ],
    image: 'thermal-components',
    imageAlt: 'Copper and aluminum cold plates, heat pipes and thermal management components',
    parts: [
      'Cold plates for GPUs, CPUs and power modules',
      'Cold plates for power electronics and energy storage',
      'Manifolds and fluid-path components',
      'Heat sinks and thermal interfaces',
      'Expanded-tube and brazed assemblies',
    ],
    specs: [
      { label: 'Materials', value: 'Commonly aluminum or copper; choice depends on conductivity, weight, corrosion and coolant compatibility' },
      { label: 'Construction', value: 'Machining, drilled passages, fitted tubing or channels, brazing, bonding, welding, hydraulically expanded tubing' },
      { label: 'Finish', value: 'Surface finishing, plating and coating as specified' },
      { label: 'Testing', value: 'Leak, pressure, flow, cleanliness and inspection as specified' },
    ],
    requirements: [
      'Heat load and operating conditions',
      'Coolant type, flow, temperature and pressure',
      'Envelope and mounting interface',
      'Contact surface flatness and finish',
      'Channel or fluid-path concept, fitting type and location',
      'Plating, coating, corrosion and compatibility',
      'Leak, pressure, flow, cleanliness and inspection',
    ],
    send: [
      'Drawing or CAD model',
      'Thermal load and coolant, flow and pressure requirements',
      'Material, dimensions, flatness and fittings',
      'Surface treatment and test requirements',
      'Annual volume and timing',
    ],
    faqs: [
      {
        q: 'Can Lupton help if the flow path is not finalized?',
        a: 'Yes. Send the heat load, envelope, contact surfaces, coolant information and open questions. We will identify what the manufacturer needs before confirming feasibility and quote details.',
      },
      {
        q: 'Does Lupton guarantee thermal performance?',
        a: 'No. Thermal performance and manufacturability are established through the appropriate engineering, manufacturing and test review.',
      },
      {
        q: 'Aluminum or copper?',
        a: 'Both are common because of thermal conductivity. The right choice depends on weight, conductivity, corrosion, coolant compatibility, joining method, cost and application.',
      },
    ],
    legacy: ['/machined-components/cold-plates/'],
  },
  {
    industry: 'medical',
    capability: 'wire-harnesses-cable-assemblies',
    slug: 'wire-harnesses',
    name: 'Medical wire harnesses',
    title: 'Medical Wire Harnesses & Cable Assemblies, ISO 13485 | Lupton',
    description:
      'Build-to-print medical cable assemblies and wire harnesses with ISO 13485 sources, test, labeling and lot traceability defined in the RFQ.',
    h1: 'Medical wire harnesses and cable assemblies',
    lede: [
      'Lupton gets build-to-print cable assemblies and wire harnesses built for medical devices and lab equipment, with ISO 13485-certified harness sources available [CONFIRM] and test, labeling and traceability defined in the RFQ.',
      'Send the drawing, BOM or wire list with connector part numbers, annual volume, and your documentation needs (first article, certificates of conformance, lot traceability, cleanliness), and we confirm the source can meet them before it quotes.',
    ],
    image: 'cable-bundle',
    imageAlt: 'Cable assemblies with circular metal connectors',
    parts: [
      'Device and cart harnesses',
      'Patient-adjacent and equipment cable assemblies',
      'Overmolded cable assemblies',
      'Power, signal and data cables',
      'Harnesses kitted with box-build sub-assemblies',
    ],
    specs: [
      { label: 'Range', value: '24 AWG multi-conductor to 4/0 power' },
      { label: 'Quality systems', value: 'ISO 13485:2016 harness source [CONFIRM]; ISO 9001:2015; UL 764' },
      { label: 'Workmanship', value: 'IPC/WHMA-A-620 [CONFIRM class]' },
      { label: 'Testing', value: 'Continuity, hipot, pull test, customer-specified' },
      { label: 'Volume', value: 'No minimum for Lupton review; source MOQs confirmed' },
    ],
    requirements: [
      'ISO 13485 at the source',
      'First article and dimensional reports',
      'Lot traceability and certificates of conformance',
      'Labeling, cleanliness and packaging',
      'Change notification before material or process changes',
    ],
    send: [
      'Drawing and wire list / from-to table',
      'BOM with connector part numbers; flag long-lead parts',
      'Test and labeling requirements',
      'Annual volume and release quantity',
      'Quality documentation required',
    ],
    faqs: [
      {
        q: 'Is ISO 13485 required for a harness supplier?',
        a: 'It depends on your quality system and the device classification. Many device OEMs require it of harness suppliers; tell us your requirement and we will route accordingly. [CONFIRM source availability]',
      },
      {
        q: 'Can you quote from a sample?',
        a: 'Yes. A sample, sketch or competitor part number is enough to start. Missing documentation and any reverse-documentation needs are identified in review.',
      },
    ],
    legacy: [],
  },
  {
    industry: 'medical',
    capability: 'metal-stamping',
    slug: 'metal-stamping',
    name: 'Medical short-run stamping',
    title: 'Short-Run Metal Stamping for Medical Devices | Lupton Associates',
    description:
      'Short run metal stamping for medical device brackets, clips, plates and chassis parts at 2,500–100,000 pcs/yr, with the quality documentation your program needs.',
    h1: 'Short-run metal stamping for medical devices',
    lede: [
      'For medical device brackets, clips, plates, chassis parts and enclosure components running roughly 2,500 to 100,000 pieces a year and under about 20 × 30 in. flat, short run stamping usually lowers piece cost versus laser-and-brake fabrication without progressive-die tooling.',
      'Send the print, material (often stainless or aluminum), finish, annual volume and your quality documentation needs, and Lupton will confirm the stamping path and a source that can support your quality system [CONFIRM ISO 13485 availability].',
    ],
    image: 'formed-brackets',
    imageAlt: 'Short-run stamped brackets beside a pen for scale',
    parts: [
      'Brackets and mounting plates for devices and carts',
      'Chassis and enclosure components',
      'Clips, clamps and retainers',
      'Stamped parts feeding welded frames',
    ],
    specs: [
      { label: 'Volume', value: 'Roughly 2,500–100,000 pcs/yr' },
      { label: 'Size', value: 'Under about 20 × 30 in. in the flat' },
      { label: 'Tooling', value: 'Die inserts in a master holder; weeks, not months' },
      { label: 'Secondary', value: 'Welding, deburring, machining, plating, painting, passivation [CONFIRM passivation]' },
      { label: 'Quality systems', value: 'ISO 9001:2015 stamping source; ISO 13485 [CONFIRM]' },
    ],
    requirements: [
      'Material certs and traceability',
      'Burr and edge requirements for handled parts',
      'Cleanliness and passivation for stainless [CONFIRM]',
      'First article and change control',
    ],
    send: [
      'Print or flat pattern (PDF/STEP)',
      'Material and gauge',
      'Annual volume and release size',
      'Finish and secondary operations',
      'Quality documentation required',
    ],
    faqs: [
      {
        q: 'Our bracket is laser-cut today at 8,000 a year. Should it be stamped?',
        a: 'Likely worth a look. That is inside the short run range. In one published conversion, a 10,000 pcs/yr part went from about $2.65 to $1.45 each with a $1,000 tooling charge. Validation cost for a medical part belongs in the payback math.',
      },
    ],
    proof: ['short-run-stamping-part-conversion', 'fabrication-vs-stamping-break-even'],
    legacy: [],
  },
  {
    industry: 'military-aerospace',
    capability: 'cnc-machining',
    slug: 'cnc-machining',
    name: 'Defense & aerospace machining',
    title: 'CNC Machining for Defense & Aerospace Programs | Lupton Associates',
    description:
      '5-axis, Swiss, grinding and EDM for defense and aerospace in aluminum, titanium, Inconel and Invar, with AS9100 and ITAR-registered shops per program.',
    h1: 'CNC machining for defense and aerospace programs',
    lede: [
      'Lupton places tight-tolerance machined parts for defense and aerospace programs (5-axis milled housings and frames, Swiss-turned pins, ground components and EDM features in aluminum, stainless, titanium, Inconel and Invar) with shops holding AS9100 and ITAR registration [CONFIRM per shop].',
      'Call before sending controlled drawings: we will set up a compliant transfer, confirm first article and inspection requirements, and route the package only to qualified shops.',
    ],
    image: 'cnc-center',
    imageAlt: 'Vertical CNC machining center',
    parts: [
      'Housings, frames and chassis',
      'Pins, shafts and fasteners (Swiss)',
      'Ground and EDM components',
      'Machined castings',
      'Brazed and welded assemblies',
    ],
    specs: [
      { label: 'Processes', value: '5-axis and horizontal milling, CNC and Swiss turning, creep feed grinding, wire and sinker EDM, brazing' },
      { label: 'Materials', value: 'Aluminum, stainless, titanium, Inconel, Invar; cobalt alloys and Hastelloy [CONFIRM]' },
      { label: 'Compliance', value: 'AS9100, ITAR registration, NIST SP 800-171, CMMC roadmap at specific shops [CONFIRM]' },
      { label: 'Inspection', value: 'CMM, AS9102 first article [CONFIRM]' },
    ],
    requirements: [
      'ITAR: controlled technical data transferred outside the web form',
      'AS9100 quality system; flow-down clauses',
      'AS9102 first article; source inspection',
      'Material certs; DFARS specialty metals where applicable',
      'NIST SP 800-171 / CMMC level for CUI',
    ],
    send: [
      'Call first for controlled data: (585) 393-4999',
      'Non-controlled: drawing, material and condition',
      'Quantity per lot and annual volume',
      'Inspection and documentation requirements',
      'Program schedule',
    ],
    faqs: [
      {
        q: 'Which shops hold ITAR registration?',
        a: 'Several of the machining, casting and electronics manufacturers we work with. We confirm registration and AS9100 scope per shop before routing any drawing. [CONFIRM]',
      },
    ],
    legacy: [],
  },
];

export const comboPath = (c: Combo) => `/industries/${c.industry}/${c.slug}/`;
export const comboByKey = (key: string) => combos.find((c) => `${c.industry}/${c.slug}` === key);
