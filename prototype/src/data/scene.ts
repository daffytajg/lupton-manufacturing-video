// "Inside a rack power shelf": an illustrative exploded drawing (not a specific customer product).
// Each part maps to the process that makes it. Detail copy uses only facts published on luptons.com.

export type ScenePoint = { title: string; text: string };
export type ScenePart = {
  id: string;
  name: string;
  process: string;
  href: string;
  linkLabel: string;
  anchor: [number, number, number]; // 3D point the hotspot sits on (drawing units)
  points: [ScenePoint, ScenePoint, ScenePoint];
};

export const sceneParts: ScenePart[] = [
  {
    id: 'chassis',
    name: 'Chassis & rack ears',
    process: 'Sheet metal fabrication',
    href: '/industries/data-center/sheet-metal-enclosures/',
    linkLabel: 'Sheet metal enclosures for data centers',
    anchor: [616, 390, 70],
    points: [
      { title: 'Laser, punch, brake, weld', text: 'Cut on a fiber laser or turret, formed on press brakes, welded MIG, TIG, spot or robotic, with hardware inserted.' },
      { title: 'Finish in the same quote', text: 'Powder coat, e-coat, wet paint and silk screen, reviewed against your finish spec.' },
      { title: 'Ship it assembled', text: 'Turnkey assembly with boards, cables and backplanes installed, plus hi-pot, functional and software testing.' },
    ],
  },
  {
    id: 'busbar',
    name: 'Copper bus bars',
    process: 'Metal stamping',
    href: '/industries/data-center/copper-busbars/',
    linkLabel: 'Bus bars for data center power',
    anchor: [28, 190, 82],
    points: [
      { title: 'Path set by volume', text: 'Fabricated for prototypes and low runs, short run stamped at roughly 2,500–100,000 pcs/yr, progressive die above ~100,000.' },
      { title: 'Finished, not blank', text: 'Forming, machining, tapping, hardware, plating and insulation quoted with the bar, so one supplier owns the result.' },
      { title: 'What to send', text: 'Alloy and temper (for example C110), thickness, plating, insulation, current rating and annual volume.' },
    ],
  },
  {
    id: 'coldplate',
    name: 'Liquid cold plate',
    process: 'CNC machining & brazing',
    href: '/industries/data-center/cold-plates/',
    linkLabel: 'Liquid cold plates',
    anchor: [230, 140, 20],
    points: [
      { title: 'Built around the fluid path', text: 'Machined or drilled passages, fitted tubing, brazing, bonding or welding, chosen by heat load, pressure and volume.' },
      { title: 'Aluminum or copper', text: 'Chosen for conductivity, weight, corrosion and coolant compatibility.' },
      { title: 'Tested as specified', text: 'Leak, pressure, flow and cleanliness testing written into the RFQ. Thermal performance is proven in test, not promised.' },
    ],
  },
  {
    id: 'heatsink',
    name: 'Extruded heat sink',
    process: 'Aluminum extrusion',
    href: '/capabilities/extrusions/',
    linkLabel: 'Extrusions',
    anchor: [470, 128, 64],
    points: [
      { title: 'Profile, then fabricate', text: '6000-series aluminum pushed through your die, then cut, drilled, machined and deburred.' },
      { title: 'Finished in one order', text: 'Anodize, paint, chromate or heat treat quoted with the extrusion.' },
      { title: 'What to send', text: 'Profile drawing (a DXF of the cross-section helps), alloy and temper, cut lengths, secondary operations and annual volume.' },
    ],
  },
  {
    id: 'pcba',
    name: 'Control board',
    process: 'PCB assembly',
    href: '/capabilities/electronic-assembly/',
    linkLabel: 'Electronic assembly',
    anchor: [470, 296, 14],
    points: [
      { title: 'SMT and through-hole', text: 'Fine pitch, package-on-package and BGA, checked with AOI and X-ray.' },
      { title: 'Tested before it ships', text: 'Continuity, manufacturing defect analysis, in-circuit and full functional test.' },
      { title: 'Board to box', text: 'Conformal coat and potting, then harnesses and sheet metal combined into a box build.' },
    ],
  },
  {
    id: 'harness',
    name: 'Power harness',
    process: 'Wire harnesses',
    href: '/capabilities/wire-harnesses-cable-assemblies/',
    linkLabel: 'Wire harnesses & cable assemblies',
    anchor: [0, 0, 0], // placed on the harness curve at render time
    points: [
      { title: '24 AWG to 4/0', text: 'Signal harnesses through heavy power cable, overmolded where the design calls for it.' },
      { title: 'Tested to your spec', text: 'Continuity, hipot and pull testing, or your own test procedure.' },
      { title: 'No minimum for review', text: 'Prototype, pilot and production programs. Factory minimums are confirmed for the selected source.' },
    ],
  },
  {
    id: 'bezel',
    name: 'Front bezel',
    process: 'Plastic molding',
    href: '/capabilities/plastic-molding/',
    linkLabel: 'Plastic molding',
    anchor: [716, 200, 56],
    points: [
      { title: 'Process set by volume', text: 'Injection molding for volume and fine detail; thermoforming or RIM for large covers at low volume.' },
      { title: 'Design help before tooling', text: 'Part design, DFM and mold flow analysis before any steel is cut.' },
      { title: 'Cosmetics in the RFQ', text: 'Texture, color, inserts and paint called out up front.' },
    ],
  },
];
