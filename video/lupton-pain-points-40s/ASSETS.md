# Production Assets — "The RFQ Black Hole" (40s)

Final cut: `lupton-rfq-blackhole-40s.mp4` — 1280×720, 24 fps, 40.0s, H.264/AAC.

## Pipeline

1. **Research** — web + Reddit-ecosystem pain points (see RESEARCH.md).
2. **Voiceover** — Higgsfield `text2speech_v2`, engine variant **elevenlabs**, preset voice
   "Arthur". Raw read 46.0s → pauses tightened (ffmpeg silenceremove) → atempo 1.06 →
   38.8s, loudness-normalized to −15 LUFS. Job `8807f280-1aff-4284-9e44-960c75633bd0`.
3. **Scenes 1–7** — Higgsfield Seedance 2.5, 16:9, 5s, 720p, native audio on (scene SFX/ambience).
4. **End card (scene 8)** — Nano Banana Pro 16:9 still with rendered typography, 5s hold with fade-in.
5. **Music** — synthesized in Higgsfield sandbox with sox: 52/104 Hz tremolo drone +
   2 Hz tick pulse + 2.4s riser (0–20s tension), A-major pad + 4 Hz drive + 55 Hz boom
   at the 35s logo hit (20–40s uplift), 3s fade-out.
6. **Assembly** — ffmpeg: scene normalize → concat → drawtext captions
   (Montserrat ExtraBold) → 3-stem mix (scene ambience 0.30 / music 0.50 / VO 1.0, limiter).

## Generation jobs (Higgsfield)

| Scene | Job ID |
|---|---|
| VO | 8807f280-1aff-4284-9e44-960c75633bd0 |
| 1 — RFQ black hole | 18e8f517-7c0a-4293-b62d-cf2f580e6cce |
| 2 — wrong quote | ec4640dc-e6da-4a18-8998-35808fdb2d56 |
| 3 — lead time slips | 221f7771-2832-4d3b-9273-5dd546230159 |
| 4 — tariffs/customs | f4e9eeb7-6077-4ace-919f-669b353a17c8 |
| 5 — the turn (sunrise factory) | 2178d9fe-36ac-4f7f-81c3-0ab0822760d3 |
| 6 — process montage | bf8b7f47-0cbd-4b43-8bed-58dd58724360 |
| 7 — handshake/phone | 5a7d0575-0b01-4464-94f0-596fd91def4b |
| 8 — end card (image) | ca415a61-2e50-47dc-b256-d5b589bb5134 |

Credit spend: ~230 Higgsfield credits (7 videos @ 32.5 + end card + VO), from a 371 balance.

## Remix notes

- For a 9:16 Reels/TikTok cut, re-run the same prompts with `aspect_ratio: "9:16"` or use
  Higgsfield `reframe` on the finished scenes.
- Captions, mix levels, and timing all live in the ffmpeg step — easy to retune.
- Voice can be swapped by re-running the VO job with any other preset from `list_voices`.
