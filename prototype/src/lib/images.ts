import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/img/**/*.{jpg,jpeg,png,webp}', { eager: true });

const byName: Record<string, ImageMetadata> = {};
for (const [path, mod] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.(jpe?g|png|webp)$/, '');
  byName[name] = mod.default;
}

/** The generated drawing-view layer for a photo (scripts/make-drawings.mjs), if one exists. */
export const drawingOf = (name: string) => (name ? byName[`${name}--drawing`] : undefined);

export function img(name: string): ImageMetadata | undefined {
  return name ? byName[name] : undefined;
}

/** Photos narrower than this are too soft for a hero; the page shows the blueprint drawing instead. */
export const HERO_MIN_WIDTH = 900;
export const heroWorthy = (name: string) => {
  const m = img(name);
  return !!m && m.width >= HERO_MIN_WIDTH;
};
