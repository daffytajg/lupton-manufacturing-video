// Prints the page-by-page table for sitemap.md from the built page inventory.
// Run after `npm run build`: node scripts/architecture-table.mjs > /tmp/table.md
import { readFileSync } from 'node:fs';

const rows = JSON.parse(readFileSync(new URL('../dist/review/pages.json', import.meta.url), 'utf8'));
const q = {
  '/capabilities/metal-stamping/': 'Should my sheet metal part be stamped, and which stamping path pays?',
  '/capabilities/metal-stamping/short-run/': 'What is short run stamping and does my part qualify?',
  '/capabilities/metal-stamping/progressive-die/': 'Will a progressive die pay back at my volume?',
  '/capabilities/sheet-metal-fabrication/': 'Who can fabricate, finish and assemble my enclosure or weldment?',
  '/capabilities/cnc-machining/': 'Who can machine this, in this alloy, to these tolerances and certifications?',
  '/capabilities/wire-harnesses-cable-assemblies/': 'Who will build my harness to print, at my volume?',
  '/capabilities/plastic-molding/': 'Which plastic process fits my part size and volume?',
  '/capabilities/casting/': 'Which casting process, and can I get it machined?',
  '/capabilities/extrusions/': 'Can I get a custom profile extruded, fabricated and anodized in one order?',
  '/capabilities/electronic-assembly/': 'Who can build my PCBA and box build, with the right certifications?',
  '/capabilities/prototyping/': 'Which prototype route answers my question without boxing me out of production?',
  '/capabilities/low-cost-region-manufacturing/': 'Should this move offshore or to Mexico, and who manages it?',
  '/industries/data-center/': 'Who can supply enclosures, bus bars, cold plates and harnesses for our power/cooling gear?',
  '/industries/medical/': 'Who can build device harnesses, housings and frames with medical documentation?',
  '/industries/heavy-truck/': 'Who can tool vehicle stampings, weldments and harnesses fast?',
  '/industries/military-aerospace/': 'Which shops hold ITAR/AS9100 for this part?',
  '/industries/robotics/': 'Who can make robot parts at pilot-to-low volume without big tooling?',
  '/industries/energy/': 'Who builds battery/charger enclosures, bus bars and cold plates?',
  '/industries/agriculture-heavy-equipment/': 'Weldment, casting or rotomold for this equipment part?',
  '/industries/data-center/sheet-metal-enclosures/': 'Who fabricates custom sheet metal enclosures for data center racks?',
  '/industries/data-center/copper-busbars/': 'Who can stamp and plate copper bus bars for a PDU?',
  '/industries/data-center/cold-plates/': 'Who manufactures custom liquid cold plates?',
  '/industries/medical/wire-harnesses/': 'Wire harness supplier with ISO 13485?',
  '/industries/medical/metal-stamping/': 'Short-run metal stamping for medical devices?',
  '/industries/military-aerospace/cnc-machining/': 'AS9100 / ITAR CNC machining for a defense program?',
  '/resources/fabrication-vs-stamping-break-even/': 'At what volume should a laser-cut part become a stamping?',
  '/resources/what-to-send-with-an-rfq/': 'What do I send so my part actually gets quoted?',
  '/resources/choose-manufacturing-process-custom-part/': 'How should this part be made?',
  '/resources/second-source-custom-components/': 'How do I build a second source before the current one fails?',
  '/resources/short-run-stamping-part-conversion/': 'Proof: what does a stamping conversion save?',
  '/resources/automated-pharmaceutical-dispensing-machine-structural-frame/': 'Proof: can a welded frame hold tight tolerances?',
  '/resources/contract-manufacturing-cryogenic-vacuum-pump/': 'Proof: high-mix + high-volume EMS with EOL management',
};
const esc = (s) => s.replace(/\|/g, '\\|').replace(/\*\*/g, '');
console.log('| URL | Type | Buyer question | H1 | First two sentences (the answer) |');
console.log('|---|---|---|---|---|');
for (const r of rows) console.log(`| \`${r.path}\` | ${r.type} | ${esc(q[r.path] || '')} | ${esc(r.h1)} | ${esc(r.lede.join(' '))} |`);
