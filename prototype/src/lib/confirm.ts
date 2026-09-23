// Build-time register of every unverified claim, grouped by page, for /review/.
import { capabilities, capabilityPath } from '../data/capabilities';
import { industries } from '../data/industries';
import { combos, comboPath } from '../data/combos';
import { resources } from '../data/resources';
import { plain } from './rich';

export type ConfirmItem = { page: string; field: string; text: string };

function walk(node: unknown, page: string, field: string, out: ConfirmItem[]) {
  if (typeof node === 'string') {
    if (node.includes('[CONFIRM')) out.push({ page, field, text: node });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((n, i) => walk(n, page, `${field}[${i}]`, out));
    return;
  }
  if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    // Spec rows read better as "label: value"
    if (typeof o.label === 'string' && typeof o.value === 'string' && o.value.includes('[CONFIRM')) {
      out.push({ page, field: `${field} · ${o.label}`, text: o.value });
      return;
    }
    for (const [k, v] of Object.entries(o)) walk(v, page, field ? `${field}.${k}` : k, out);
  }
}

export function confirmRegister(extra: ConfirmItem[] = []): ConfirmItem[] {
  const out: ConfirmItem[] = [];
  for (const c of capabilities) walk(c, capabilityPath(c), '', out);
  for (const i of industries) walk(i, `/industries/${i.slug}/`, '', out);
  for (const c of combos) walk(c, comboPath(c), '', out);
  for (const r of resources) walk(r, `/resources/${r.slug}/`, '', out);
  return [...out, ...extra].map((x) => ({ ...x, field: x.field.replace(/^\./, '') }));
}

export const confirmSummary = (items: ConfirmItem[]) => items.map((i) => plain(i.text));
