import { PROTOTYPE } from '../data/site';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CONFIRM_RE = /\s*\[CONFIRM(?::?\s*([^\]]*))?\]/g;

/** Inline rich text → HTML. Supports **bold**, [text](/href/), and [CONFIRM] / [CONFIRM: note]. */
export function rich(s: string): string {
  let h = esc(s);
  h = h.replace(CONFIRM_RE, (_m, note: string | undefined) => {
    // A production build must never publish an unverified claim with its tag silently removed.
    if (!PROTOTYPE) throw new Error(`Unresolved [CONFIRM] in production build: "${s.slice(0, 120)}"`);
    const n = (note || '').trim();
    const label = n ? `CONFIRM: ${n}` : 'CONFIRM';
    return ` <mark class="confirm" title="Unverified. Confirm before publishing.">${label}</mark>`;
  });
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\[([^\]]+?)\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
  return h;
}

/** Plain text for meta tags, JSON-LD and llms.txt: strips markup and every [CONFIRM] marker. */
export function plain(s: string): string {
  return s
    .replace(CONFIRM_RE, '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+?)\]\([^)]+\)/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export const hasConfirm = (s: string) => /\[CONFIRM/.test(s);

/** Split a heading into word spans for the blur-in reveal. Text stays in the DOM for crawlers. */
export function words(s: string): string[] {
  return s.split(/\s+/).filter(Boolean);
}
