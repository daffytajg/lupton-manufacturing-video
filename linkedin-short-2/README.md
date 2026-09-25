# LinkedIn short 2: one supplier jams, a second source keeps the line running

`lupton-linkedin-short-2-second-source.mp4`: 15 s, 1080×1920 (9:16), 24 fps, H.264 + AAC. `cover.jpg` is the end card, for use as a thumbnail.

Bright studio look: a cream floor, soft sun shadows, a slow orthographic orbit over a small production line. All text sits in the top band so the 3D stays clear.

| Time | Beat | On-screen copy |
|---|---|---|
| 0–3.6 s | A gray supplier hopper feeds brackets down a chute onto the conveyor and into the assembly cell. Stack light green. | "SINGLE-SOURCED PART / ONE SUPPLIER. / Running fine. For now." Callout: SUPPLIER A |
| 3.7–6.3 s | A part jams in the chute, the hopper shudders, the beacon flashes, the belt drains | "SUPPLIER JAMMED / PARTS STOP COMING." Callout: JAMMED |
| 6.3–7.3 s | Belt stops, stack light and HMI go red, alarm | "LINE DOWN." |
| 6.9–8.0 s | The green Lupton hopper (LA badge) drops in, lands, and its chute swings onto the belt | "SECOND SOURCE ONLINE / A SECOND SOURCE BEFORE YOU NEED ONE. / Send us the drawing." Callout: LUPTON |
| 8.0–11.5 s | Belt restarts, parts flow again, stack light back to green | "WE QUOTE IT. / WE BUILD IT." + capabilities line |
| 11.7–15 s | End card over the running line | "Keep the line running." LUPTON ASSOCIATES, "Servicing the working world since 1969", luptons.com |

A status chip at the top ("YOUR LINE · RUNNING / STARVED / LINE DOWN") follows the stack light.

## How it was made

- **3D:** Blender 5.2 through the Higgsfield 3D Jutsu MCP (`src/build_scene.py`). EEVEE at 720×1280 with 5 samples, upscaled to 1080×1920 at assembly. The worker ignores the keyframe-interpolation preference, so the script sets interpolation on each key directly. The 360 frames were split across three identical 3D Jutsu projects and rendered in parallel.
- **Timing:** the scene script returns its event frames (jam, line down, landing, back to green), each part's landing frame, and per-frame screen positions of the hoppers and stack light. Those are saved in `src/anchors.json`.
- **Text:** a Pillow overlay (`src/overlays.py`) reads the anchors so the callouts follow the hoppers.
- **Sound:** procedural (`src/sound.py`), synced to the same frames. It layers a conveyor hum that spins down and back up, a clack per part landing, the jam grind, beacon pips, the line-down alarm, the drop whoosh and landing thud, and a pulse that stops when the line stops and returns when the Lupton hopper lands. It is normalized to about −14 LUFS.
- **Assembly:** ffmpeg (`src/assemble.py`).
