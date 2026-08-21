// Renders animation.html frame-by-frame to PNGs with headless Chromium.
// Usage: node render.mjs <outDir> [--previews-only]
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const FPS = 30;
const DURATION = 40;
const W = 1080, H = 1350;
const PREVIEW_TIMES = [0, 20, 38, 39.5];

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2] || path.join(here, 'frames');
const previewsOnly = process.argv.includes('--previews-only');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  args: ['--force-device-scale-factor=1', '--hide-scrollbars', '--force-color-profile=srgb'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto('file://' + path.join(here, 'animation.html'));
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => typeof window.seek === 'function');

async function shot(t, file) {
  await page.evaluate(tt => window.seek(tt), t);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
}

if (!previewsOnly) {
  const total = FPS * DURATION;
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    await shot(i / FPS, path.join(outDir, `f_${String(i).padStart(4, '0')}.png`));
    if (i % 150 === 0) console.log(`frame ${i}/${total} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  console.log(`rendered ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

for (const t of PREVIEW_TIMES) {
  const name = `preview-${String(t).replace('.', '_')}s.png`;
  await shot(t, path.join(outDir, name));
  console.log('preview', name);
}

await browser.close();
