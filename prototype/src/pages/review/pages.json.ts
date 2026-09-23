// Machine-readable page inventory used to generate the table in /sitemap.md.
import type { APIRoute } from 'astro';
import { capabilities, capabilityPath } from '../../data/capabilities';
import { industries } from '../../data/industries';
import { combos, comboPath } from '../../data/combos';
import { resources } from '../../data/resources';
import { plain } from '../../lib/rich';

export const GET: APIRoute = () => {
  const rows = [
    ...capabilities.map((c) => ({ type: c.parent ? 'Capability (sub)' : 'Capability', path: capabilityPath(c), title: c.title, h1: c.h1, lede: c.lede })),
    ...industries.map((i) => ({ type: 'Industry', path: `/industries/${i.slug}/`, title: i.title, h1: i.h1, lede: i.lede })),
    ...combos.map((c) => ({ type: 'Capability × industry', path: comboPath(c), title: c.title, h1: c.h1, lede: c.lede })),
    ...resources.map((r) => ({ type: `Resource (${r.kind})`, path: `/resources/${r.slug}/`, title: r.title, h1: r.h1, lede: r.lede })),
  ].map((r) => ({ ...r, lede: r.lede.map((s) => s.replace(/\s*\[CONFIRM[^\]]*\]/g, ' [CONFIRM]')), plainTitle: plain(r.title) }));
  return new Response(JSON.stringify(rows, null, 1), { headers: { 'Content-Type': 'application/json' } });
};
