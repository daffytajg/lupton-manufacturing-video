// Generates the "drawing view" layer for the spotlight reveal: an engineering-drawing
// rendering of each hero photo (Sobel edges on a blueprint grid), same aspect ratio so it
// registers exactly under object-fit: cover. Derived only from Lupton's own photos.
// Run: node scripts/make-drawings.mjs   (writes src/assets/img/drawings/<name>--drawing.webp)
import sharp from 'sharp';
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const IMG = join(ROOT, 'src/assets/img');
const OUT = join(IMG, 'drawings');
mkdirSync(OUT, { recursive: true });

// Every image used as a page hero (from the data files) + the About hero.
const names = new Set(['office-entrance']);
for (const f of readdirSync(join(ROOT, 'src/data'))) {
  for (const m of readFileSync(join(ROOT, 'src/data', f), 'utf8').matchAll(/image: '([^']+)'/g)) names.add(m[1]);
}
const find = (n) => [join(IMG, 'parts', n + '.jpg'), join(IMG, n + '.jpg')].find(existsSync);

const BG = [6, 18, 29];
const GRID = [143, 192, 164];
const INK = [201, 230, 212];

for (const name of names) {
  const src = find(name);
  if (!src) continue;
  const meta = await sharp(src).metadata();
  if (meta.width < 900) continue; // PageHero only uses photos ≥ 900 px wide
  const W = Math.min(1400, meta.width);
  const { data: g, info } = await sharp(src).resize({ width: W }).greyscale().blur(1.1).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  // Sobel magnitude
  const mag = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = -g[i - w - 1] - 2 * g[i - 1] - g[i + w - 1] + g[i - w + 1] + 2 * g[i + 1] + g[i + w + 1];
      const gy = -g[i - w - 1] - 2 * g[i - w] - g[i - w + 1] + g[i + w - 1] + 2 * g[i + w] + g[i + w + 1];
      mag[i] = Math.hypot(gx, gy);
    }
  }
  const sorted = Float32Array.from(mag).sort();
  const p98 = sorted[Math.floor(sorted.length * 0.98)] || 1;
  const out = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const lum = g[i] / 255;
      const edge = Math.pow(Math.min(1, Math.max(0, (mag[i] / p98 - 0.16) / 0.62)), 0.85);
      const major = x % 180 === 0 || y % 180 === 0;
      const minor = x % 36 === 0 || y % 36 === 0;
      const grid = major ? 0.16 : minor ? 0.07 : 0;
      for (let c = 0; c < 3; c++) {
        let v = BG[c] + lum * 16 * (c === 2 ? 1.4 : 1); // faint tonal ghost of the photo
        v = v * (1 - grid) + GRID[c] * grid;
        v = v * (1 - edge) + INK[c] * edge;
        out[i * 3 + c] = Math.max(0, Math.min(255, Math.round(v)));
      }
    }
  }
  const dst = join(OUT, `${name}--drawing.webp`);
  await sharp(out, { raw: { width: w, height: h, channels: 3 } }).webp({ quality: 80 }).toFile(dst);
  console.log('drawing', name, `${w}x${h}`);
}
