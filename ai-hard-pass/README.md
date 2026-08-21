# AI Hard Pass — kinetic typography video

40-second, 1080×1350 (4:5 feed), 30fps kinetic-text video for Lupton Associates.

## Files

- `animation.html` — the whole video as a deterministic timeline; `window.seek(t)` renders the exact state at time `t` (seconds). Open in a browser and call `seek(12.5)` from the console to scrub.
- `render.mjs` — screenshots every frame with headless Chromium (`node render.mjs <outDir>`; `--previews-only` renders just the spot-check frames at 0s / 20s / 38s / 39.5s).
- `encode.sh` — encodes frames to H.264 MP4 with clean file metadata (author: Joe Guadagnino, company: Lupton Associates; no muxer/encoder identification tags).
- `assets/` — Lupton logo (from luptons.com, light variant for dark backgrounds), Archivo variable + Anton woff2.

## Build

```sh
npm i playwright-core
node render.mjs frames
./encode.sh frames ../lupton-ai-hard-pass.mp4
```

## Timeline

| Time | Beat |
|---|---|
| 0–4 | "ChatGPT can now text people for you." — word-by-word snap-in |
| 4–8 | "Read your messages. / Draft the reply. / Hit send." — stacking lines |
| 8–11 | "Shipped this week." → hard cut → "HARD PASS." (orange, screen shake) |
| 11–16 | "Whether you install it or not…" — calm beat |
| 16–21 | "The next quote request…" → "written by AI." highlighted |
| 21–25 | "…sound polished. Fast. Professional." — punch-in words |
| 25–27 | "And none of that will matter." — stillness |
| 27–33 | Three slide-in lines with orange accent bars |
| 33–36 | "AI just made sounding good FREE." — oversized FREE |
| 36–40 | Closing line (2s hold) → Lupton end card, SINCE 1969 |
