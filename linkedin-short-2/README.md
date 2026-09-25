# LinkedIn short 2: single source, one weak link

`lupton-linkedin-short-2-weak-link.mp4`: 15 s, 1080×1920 (9:16), 24 fps, H.264 + AAC. `cover.jpg` is the end card, for use as a thumbnail.

| Time | Beat | On-screen copy |
|---|---|---|
| 0–4.1 s | A sheet metal enclosure hangs from one chain while one link glows red | "SINGLE SOURCE / ONE SUPPLIER." then "NO BACKUP / ONE WEAK LINK." |
| 4.2 s | The link snaps and the part drops | "LINE DOWN." |
| 4.6 s | The Lupton LA tile slams in and three sage chains shoot down and catch the part | (none) |
| 5.4–11.4 s | The part hangs from three chains | "A SECOND SOURCE BEFORE YOU NEED ONE." + Domestic / Offshore / Same drawing, then "WE QUOTE IT. WE BUILD IT." |
| 11.7–15 s | End card | "No single point of failure on your parts." LUPTON ASSOCIATES, "Servicing the working world since 1969", luptons.com |

## How it was made

Same pipeline as `linkedin-short/`:

- **3D:** Blender 5.2 through the Higgsfield 3D Jutsu MCP (`src/build_scene2.py`, the first-pass scene script). After that pass, the final render also stood the chain links upright, turned the part to a 3/4 view at 1.15× scale, reframed the camera, and re-hung the sage chains to three points on the part.
- **Text:** a Pillow overlay (`src/overlays2.py`).
- **Sound:** procedural (`src/sound2.py`): metal strain, alarm beeps, the snap, the impact and link clinks, then a pad.
- **Assembly:** ffmpeg (`src/assemble.py`).
