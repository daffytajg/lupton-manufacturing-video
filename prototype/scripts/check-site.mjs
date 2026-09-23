// Post-build checks for the static output in dist/. No dependencies.
// Run: npm run build && npm run check:site
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(DIST);
const html = files.filter((f) => f.endsWith('.html'));
const problems = [];
const warn = (p, m) => problems.push(`${p}: ${m}`);

const routes = new Set(html.map((f) => '/' + relative(DIST, f).replace(/index\.html$/, '').replace(/\.html$/, '/')));
for (const f of files.filter((f) => !f.endsWith('.html'))) routes.add('/' + relative(DIST, f));

let jsBytes = 0;
for (const f of files.filter((f) => f.endsWith('.js'))) jsBytes += statSync(f).size;

const rows = [];
for (const f of html) {
  const route = '/' + relative(DIST, f).replace(/index\.html$/, '');
  const s = readFileSync(f, 'utf8');
  const isReview = route.startsWith('/review/') || route.startsWith('/404');
  const title = (s.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const h1s = (s.match(/<h1[\s>]/g) || []).length;
  if (!title) warn(route, 'missing <title>');
  if (!isReview && title.length > 75) warn(route, `title ${title.length} chars`);
  if (!isReview && (desc.length < 70 || desc.length > 165)) warn(route, `meta description ${desc.length} chars`);
  if (h1s !== 1) warn(route, `${h1s} <h1> elements`);
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      if (/CONFIRM/.test(m[1])) warn(route, 'JSON-LD contains an unverified [CONFIRM] claim');
      if (!j['@graph']?.length) warn(route, 'JSON-LD graph empty');
    } catch (e) { warn(route, 'invalid JSON-LD: ' + e.message); }
  }
  for (const m of s.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt(=|\s|>)/.test(m[0])) warn(route, 'img without alt attribute');
  }
  if (!isReview) {
    for (const m of s.matchAll(/href="(\/[^"#?]*)/g)) {
      const href = m[1];
      if (!routes.has(href) && !existsSync(join(DIST, href))) warn(route, `broken internal link ${href}`);
    }
  }
  const text = s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  rows.push({ route, words: text.split(' ').length, confirms: (s.match(/class="confirm"/g) || []).length, bytes: Buffer.byteLength(s) });
}

for (const t of ['llms.txt', 'llms-full.txt']) {
  const p = join(DIST, t);
  if (!existsSync(p)) { warn(t, 'missing'); continue; }
  if (/CONFIRM/.test(readFileSync(p, 'utf8'))) warn(t, 'contains [CONFIRM] text');
}

console.log(`Pages: ${html.length}  ·  total JS shipped: ${(jsBytes / 1024).toFixed(1)} KB (all pages share one module)`);
console.log('route'.padEnd(64), 'words'.padStart(6), 'confirm'.padStart(8), 'html KB'.padStart(8));
for (const r of rows.sort((a, b) => a.route.localeCompare(b.route)))
  console.log(r.route.padEnd(64), String(r.words).padStart(6), String(r.confirms).padStart(8), (r.bytes / 1024).toFixed(1).padStart(8));
if (problems.length) { console.log(`\n${problems.length} problem(s):`); problems.forEach((p) => console.log(' -', p)); process.exitCode = 1; }
else console.log('\nAll checks passed.');
