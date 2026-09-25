# LinkedIn short: RFQ chaos to order

`lupton-linkedin-short.mp4`: 15 s, 1080×1920 (9:16), 24 fps, H.264 + AAC. `cover.jpg` is the end card, for use as a thumbnail.

| Time | Beat | On-screen copy |
|---|---|---|
| 0–4.8 s | RFQ sheets storm around a racing red clock | "RFQ · DAY 21 / STILL NO QUOTE." then "PROMISED: 6 WEEKS / NOW IT'S 14." |
| 4.9 s | 3D Lupton LA tile slams in, shockwave clears the storm | (none) |
| 5.3–11.3 s | Sheet metal, CNC, molded, PCBA and cable parts orbit the logo | "SEND US THE DRAWING." + Drawing / Material / Annual volume / Timing, then "WE QUOTE IT. WE BUILD IT." |
| 11.7–15 s | Parts line up under the logo | "Straight answers on quotes and lead times." LUPTON ASSOCIATES, "Servicing the working world since 1969", luptons.com |

## How it was made

- **3D:** Blender 5.2, run through the Higgsfield 3D Jutsu MCP (`src/build_scene.py`, which is the first-pass scene script; the final render also scaled the parts 1.45×, enlarged the RFQ sheets 1.5× and dimmed the dust). The LA tile is traced from the logo in the existing video, not from the official vector file.
- **Text:** rendered as a transparent PNG overlay with Pillow (`src/overlays.py`), using Barlow Condensed, IBM Plex Mono and Montserrat from `@fontsource`. Copy changes don't need a 3D re-render.
- **Sound:** procedural (`src/sound.py`): ticks, a riser, the impact and a pad. No licensed music.
- **Assembly:** `src/assemble.py` slices the rendered frame grids, upscales 720×1280 to 1080×1920, adds the overlay and muxes the audio with ffmpeg.
