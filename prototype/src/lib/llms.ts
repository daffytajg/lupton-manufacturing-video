// Builds llms.txt and llms-full.txt from the same data as the pages.
// Only verified text is emitted: any sentence, spec or FAQ carrying [CONFIRM] is dropped.
import { SITE_URL, org, oneLiner, processes } from '../data/site';
import { capabilities, capabilityPath, topCapabilities } from '../data/capabilities';
import { industries } from '../data/industries';
import { combos, comboPath } from '../data/combos';
import { resources } from '../data/resources';
import { hasConfirm, plain } from './rich';
import type { Faq, Spec } from '../data/types';

const url = (p: string) => `${SITE_URL}${p}`;
const safe = (xs: string[]) => xs.filter((s) => !hasConfirm(s)).map(plain);
const firstSafe = (xs: string[], fallback: string) => safe(xs)[0] || plain(fallback);
const specs = (xs: Spec[]) => xs.filter((s) => !hasConfirm(s.value)).map((s) => `- ${s.label}: ${plain(s.value)}`);
const faqs = (xs: Faq[]) => xs.filter((f) => !hasConfirm(f.q) && !hasConfirm(f.a)).map((f) => `Q: ${plain(f.q)}\nA: ${plain(f.a)}`);

const facts = [
  `- Company: ${org.name}`,
  `- Founded: ${org.founded}`,
  `- Headquarters: ${org.address.street}, ${org.address.city}, ${org.address.region} ${org.address.postal}, USA`,
  `- Phone: ${org.phone}`,
  `- Coverage: ${org.territory.join(', ')}`,
  `- First response to an RFQ: within ${org.responsePromise} (not a quotation)`,
  `- Model: Lupton reviews manufacturing fit and routes the project; the manufacturer confirms feasibility, capacity, pricing, lead time and terms and quotes the buyer directly.`,
  `- Request a quote: ${url('/rfq/')}`,
  `- Book time with the team: ${org.bookingUrl}`,
];

export function llmsTxt(): string {
  const lines: string[] = [];
  lines.push(`# ${org.name}`, '', `> ${oneLiner}`, '', ...facts, '');
  lines.push(`Processes covered: ${processes.join(', ')}.`, '');
  lines.push('## Capabilities', '');
  for (const c of capabilities) lines.push(`- [${c.name}](${url(capabilityPath(c))}): ${firstSafe(c.lede, c.description)}`);
  lines.push('', '## Industries', '');
  for (const i of industries) lines.push(`- [${i.name}](${url(`/industries/${i.slug}/`)}): ${firstSafe(i.lede, i.description)}`);
  lines.push('', '## Industry × capability', '');
  for (const c of combos) lines.push(`- [${c.name}](${url(comboPath(c))}): ${firstSafe(c.lede, c.description)}`);
  lines.push('', '## Resources (answers and case studies)', '');
  for (const r of resources) lines.push(`- [${r.h1}](${url(`/resources/${r.slug}/`)}): ${firstSafe(r.lede, r.description)}`);
  lines.push('', '## Company', '');
  lines.push(`- [About and team](${url('/about/')}): Founded 1969 in Canandaigua, NY; leadership and business development team by territory.`);
  lines.push(`- [Request a quote](${url('/rfq/')}): Upload drawings; response within ${org.responsePromise}.`);
  lines.push('', '## Optional', '', `- [Full text for LLMs](${url('/llms-full.txt')})`, `- [Sitemap](${url('/sitemap-index.xml')})`, '');
  return lines.join('\n');
}

export function llmsFullTxt(): string {
  const out: string[] = [`# ${org.name}: full reference`, '', `> ${oneLiner}`, '', ...facts, ''];
  for (const c of capabilities) {
    out.push(`## ${c.name}`, `URL: ${url(capabilityPath(c))}`, '', ...safe(c.lede), '');
    out.push('Routes:', ...c.routes.filter((r) => !hasConfirm(r.text)).map((r) => `- ${r.title}: ${plain(r.text)}`), '');
    out.push('Specs (verified):', ...specs(c.specs), '');
    out.push('What to send:', ...c.send.map((s) => `- ${plain(s)}`), '');
    out.push(...faqs(c.faqs).flatMap((f) => [f, '']));
  }
  for (const i of industries) {
    out.push(`## Industry: ${i.name}`, `URL: ${url(`/industries/${i.slug}/`)}`, '', ...safe(i.lede), '');
    out.push('Parts:', ...safe(i.parts).map((p) => `- ${p}`), '');
    out.push('Requirements to state in the RFQ:', ...safe(i.requirements).map((p) => `- ${p}`), '');
    out.push(...faqs(i.faqs).flatMap((f) => [f, '']));
  }
  for (const c of combos) {
    out.push(`## ${c.name}`, `URL: ${url(comboPath(c))}`, '', ...safe(c.lede), '', 'Specs (verified):', ...specs(c.specs), '', ...faqs(c.faqs).flatMap((f) => [f, '']));
  }
  for (const r of resources) {
    out.push(`## ${r.h1}`, `URL: ${url(`/resources/${r.slug}/`)}`, `Updated: ${r.updated}`, '', ...safe(r.lede), '');
    for (const b of r.body) {
      if (b.type === 'h2') out.push(`### ${b.text}`);
      else if (b.type === 'p' || b.type === 'callout') !hasConfirm(b.text) && out.push(plain(b.text), '');
      else if (b.type === 'ul' || b.type === 'ol') out.push(...safe(b.items).map((x) => `- ${x}`), '');
      else if (b.type === 'facts') out.push(...specs(b.items), '');
      else if (b.type === 'table') out.push(`| ${b.table.head.join(' | ')} |`, ...b.table.rows.map((r) => `| ${r.map(plain).join(' | ')} |`), '');
    }
    if (r.faqs) out.push(...faqs(r.faqs).flatMap((f) => [f, '']));
  }
  return out.join('\n');
}

export const topCount = topCapabilities.length;
