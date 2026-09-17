# Lupton Associates — 40s LinkedIn video — Storyboard

Status: APPROVED 2026-09-17, generated and delivered. See "Result" at the end for what actually happened.

## Account

| Item | Value |
|---|---|
| Higgsfield credits available | 1,192.17 (Plus plan) |
| Model | `seedance_2_5` (Seedance 2.5, ByteDance, text-to-video mode `t2v`) |
| Cost preflight | see "Cost" below |

## Model choice

`models_explore` lists three Seedance models. Seedance 2.5 was requested and is the best fit:

| Model | Durations | Max res | Vertical ratios | Notes |
|---|---|---|---|---|
| `seedance1_5` | 4 / 8 / 12 s | 1080p | 9:16, 3:4 | older, fixed steps |
| `seedance_2_0` | 4–15 s | 4k | 9:16, 3:4 | reference-driven, no unlim on this account |
| **`seedance_2_5`** | **4–30 s** | **1080p** | **9:16, 3:4, 1:1** | **chosen: newest t2v, 8 s supported** |

No Seedance model offers 4:5. Nearest supported ratio is **3:4** (0.75 vs 0.80). Generating at 3:4 1080p gives 1080x1440; the 4:5 master is a center crop to 1080x1350 (drops 45 px top and bottom, about 6%). The 1:1 version is a center crop to 1080x1080 from the same footage. 9:16 would throw away 30% of the frame, so 3:4 wins.

Settings for every generated shot:

| Parameter | Value | Why |
|---|---|---|
| `mode` | `t2v` | prompt only, no reference media |
| `duration` | `8` | one shot = one 8 s beat |
| `aspect_ratio` | `3:4` | closest to 4:5 |
| `resolution` | `1080p` | full-res master |
| `bitrate_mode` | `high` | less blocking on metal textures before re-encode |
| `generate_audio` | `false` | video ships silent-safe; no music unless we own a track |

Negative prompts: Seedance 2.5 has **no negative-prompt field**. Each prompt ends with an explicit exclusion clause instead. The exclusion list for every shot: **no text, no lettering, no numbers, no labels, no logos, no readable brand names, no watermark, no faces, no people (only a single hand where the shot calls for one, with a natural five-fingered hand), no screens with readable text.**

## Shot list

Timeline math: 5 beats x 8.000 s with four 6-frame (0.200 s at 30 fps) crossfades would come out at 39.2 s. To land on **exactly 40.000 s** the locally rendered end card is held for 8.800 s (it is a still card, so the extra hold is invisible). Shots 1–4 are trimmed to exactly 8.000 s each. If you would rather keep the end card at 8.0 s and use hard cuts instead of crossfades, say so.

Effective on-screen timeline after crossfades:

| Beat | Clip runs | Captions |
|---|---|---|
| 1 Hook | 0.00 – 8.00 | 0.00–3.60 "SEND US THE DRAWING." then 3.60–7.90 adds "We'll tell you what it costs to make." |
| 2 Process | 7.80 – 15.80 | 7.90–15.70 "STAMPING · FABRICATION · MACHINING / MOLDING · ELECTRONICS" |
| 3 Quote path | 15.60 – 23.60 | 15.70–19.60 "We quote it. We make it." then 19.60–23.50 adds "No reseller layer." |
| 4 Parts | 23.40 – 31.40 | 23.50–27.40 "Brackets. Housings. Chassis. Bus bars. Harnesses." then 27.40–31.30 adds "Made here and in low cost regions since 1969." |
| 5 End card | 31.20 – 40.00 | rendered into the card: "Send us your drawings." / www.luptons.com · 585-393-4999 / "Book time with our team." |

Hook text is on screen from frame 0, well inside the 1.5 s requirement.

---

### Shot 1 — HOOK (0–8 s)

Generated: yes. Model `seedance_2_5`, `t2v`, 8 s, 3:4, 1080p.

Prompt:

```
Documentary close-up inside a metal fabrication shop. A large mechanical engineering drawing printed on white paper slides slowly from left to right across a scratched brushed-steel workbench. Low camera angle, 35mm lens, shallow depth of field. The drawing shows part outlines and dimension lines; every dimension callout is tiny and softly out of focus so nothing is readable, and the title block is outside the frame. At the midpoint one adult hand with a natural five-fingered hand enters from the right, the index finger taps once on a dimension callout and then rests on the paper. Soft cool daylight from a high window with a faint warm overhead fill. Muted industrial palette: steel gray, paper white, deep navy shadows. Slow, steady, tripod-stable camera, no shake. Realistic, photographic, 4K detail. No text, no lettering, no numbers, no labels, no logos, no brand names, no watermark, no face, no person other than the single hand.
```

Watch for: garbage dimension numbers on the drawing, wrong finger count, a second hand.

---

### Shot 2 — PROCESS (8–16 s)

Generated: yes. One clip, four internal hard cuts of about 2 s each. Model `seedance_2_5`, `t2v`, 8 s, 3:4, 1080p.

Prompt:

```
Four fast documentary shots in one sequence with hard cuts between them, each about two seconds, all inside the same clean modern factory with cool overhead LED light and a muted steel-gray palette, tripod-stable camera. Shot one: close-up of a mechanical stamping press as the ram strokes down onto a steel strip in a progressive die and lifts, strip feeds forward. Cut. Shot two: top-down view of a fiber laser cutting head tracing a bracket outline into a sheet of steel, small bright spark plume, head moves fast. Cut. Shot three: macro close-up inside a CNC machine enclosure as a carbide end mill cuts a pocket into a block of aluminum, coolant spray, aluminum chips flying. Cut. Shot four: close-up of an injection molding machine as the two mold halves part and a gray plastic housing is pushed off the core by ejector pins. Realistic, photographic, industrial, 4K detail. No text, no lettering, no numbers, no labels, no logos, no brand names, no watermark, no screens with readable text, no people, no faces, no hands.
```

Watch for: cuts not happening (one long shot instead of four), a control screen with fake text, machine nameplates with garbage lettering. Fallback if the cuts do not land after two retries: generate four separate 4 s single-process clips and cut them to 2 s each (four extra generations, cost noted at the time).

---

### Shot 3 — QUOTE PATH (16–24 s)

Generated: yes. Model `seedance_2_5`, `t2v`, 8 s, 3:4, 1080p.

Prompt:

```
Documentary close-up on a wooden desk in a small manufacturing shop office, late afternoon window light, muted cool tones. A printed multi-page quotation packet held by a paper clip lies on the desk, seen at a low raking angle with shallow depth of field, 50mm lens, so the printed lines are soft gray blur and nothing is readable. Beside the packet a smartphone lies face-up; its dark screen lights up with a single new-message notification, shown as a bright softly blurred banner with no readable words. In the background, out of focus, a machined aluminum part sits on the desk as a paperweight and a shop floor is visible through an office window. Slow subtle push-in, tripod-stable. Realistic, photographic, 4K detail. No readable text, no legible words, no lettering, no numbers, no logos, no brand names, no watermark, no people, no hands, no faces.
```

Watch for: legible fake words on the quote or the phone (most likely artifact in the whole video), a phone that looks like a specific brand.

---

### Shot 4 — PARTS (24–32 s)

Generated: yes. Model `seedance_2_5`, `t2v`, 8 s, 3:4, 1080p.

Prompt:

```
Slow steady lateral dolly from left to right across a brushed-steel inspection table in a clean modern machine shop, soft cool overhead LED light with a faint warm fill, muted industrial palette, tripod-stable, shallow depth of field. Laid out in a row on the table: several zinc-plated stamped steel brackets with punched holes, a gray powder-coated sheet metal enclosure with louvered vents, a solid copper bus bar with plated bolt holes, a wire harness with black braided loom and white multi-pin connectors coiled neatly, and a machined aluminum housing with a clear anodized finish and precise milled pockets. Macro detail, faint machining marks, the parts look real and production-made. Realistic, photographic, 4K detail. No text, no lettering, no numbers, no labels, no part numbers, no logos, no brand names, no watermark, no people, no hands, no faces.
```

Watch for: melted or fused part geometry, a harness that turns into spaghetti, a connector with fake lettering.

---

### Shot 5 — END CARD (32–40 s)

Generated: **no.** Rendered locally with Pillow + ffmpeg so the logo is crisp. Held 8.800 s (see timeline math).

Layout (1080x1350, also composed for 1080x1080):

- Full-frame navy `#122536`, very subtle radial vignette so it does not read as flat.
- Lupton logo centered, light version: the mark keeps its green, the wordmark is inverted to white on navy (per brand note). Logo width about 46% of frame.
- Green rule `#618372`, 3 px, 220 px wide, centered under the logo, animates in over 12 frames.
- Text block under the rule, Inter, white, centered:
  - "Send us your drawings." (Inter SemiBold, sentence case)
  - `WWW.LUPTONS.COM · 585-393-4999` (Inter Medium, letterspaced caps, green)
  - "Book time with our team." (Inter Regular)
- Text lines fade in one at a time across the first second, then hold.

No generation cost for this beat.

---

## Caption style (all beats)

- Font: Inter (SemiBold for labels, Regular for sentences). Labels in letterspaced caps.
- White text, centered, positioned in the lower third, 96 px side margin so nothing hits the phone crop.
- Bar behind text: navy `#122536` at **8% opacity**, as specified. Note: at 8% the bar is close to invisible over bright footage; a soft drop shadow on the text will carry legibility. If you would rather have a solid bar, 80% opacity is the usual choice and is a one-line change.
- Captions are burned in. The same cues are written to `captions.srt`.

## Post pipeline (ffmpeg)

1. Download the four clips.
2. Conform each to 30 fps, scale/crop 1080x1440 → 1080x1350 (4:5) and → 1080x1080 (1:1), trim to exactly 8.000 s.
3. Color match: mild shared grade on all four clips: saturation 0.90, contrast 1.04, slight cool shift in shadows and mids. Subtle only.
4. Render end card at 8.800 s.
5. Stitch with `xfade` (6 frames, 0.200 s) between each pair.
6. Burn captions.
7. Encode H.264 (libx264, yuv420p, CRF 18, high profile), strip all metadata, set title "Lupton Associates" and artist "Joe Guadagnino".
8. Export `final_4x5.mp4`, `final_1x1.mp4`, `captions.srt`, `storyboard.md`, `contact_sheet.png` (one frame per shot).

## Retry rule

If a shot comes back with readable garbage text, a face, a wrong hand, or broken geometry: regenerate that one shot only, same prompt with the offending element tightened, max 2 retries per shot. Every retry's cost is reported.

## Cost

72 credits per 8 s shot at 1080p, 3:4, high bitrate, no audio (`get_cost` preflight, exact).

| Scenario | Generations | Credits |
|---|---|---|
| Four shots, first pass clean | 4 | 288 |
| One retry on one shot | 5 | 360 |
| Worst case, 2 retries on every shot | 12 | 864 |
| Shot 2 fallback (four 4 s clips) if used | +4 | +144 (est. at half the 8 s price; will preflight before spending) |

Balance 1,192.17 covers the worst case.

## Sound (revised at Joe's request after delivery)

All audio was generated through the ElevenLabs REST API on Joe's **Creator** plan (paid, commercial licence), using his own API key, after the connector's free-tier account turned out to be unusable for commercial work. Cost for the pass: 1,848 ElevenLabs credits of a 130,259 monthly allowance. The first music bed, made on the free-tier connector account, was discarded.

Voiceover, first person, Lupton as the shop, one line per beat, `eleven_multilingual_v2`, library voice "Vino - Warm Leadership Narrator" (alternate takes with the premade voice "Brian" in `assets/audio/alt_brian_vo*.mp3`):

1. "Send us the drawing. We'll tell you what it costs to make." (0.3 s)
2. "Stamping, fabrication, machining, molding and electronics. We do all of it." (8.1 s)
3. "We quote it, and we make it. No reseller layer." (15.9 s)
4. "Brackets. Housings. Chassis. Bus bars. Harnesses. Made here and in low cost regions, since 1969." (23.5 s, tempo +6% so it ends before the end card)
5. "Send us your drawings. Or book time with our team." (32.4 s)

Sound effects (`eleven_text_to_sound_v2`), timed to the picture: paper slide 1.8 s, fingertip tap 7.15 s, press stroke 8.0 s, laser 9.55 s, end mill 11.51 s, mold open 13.93 s (the last three on the measured cut points), office room tone 15.5–23.7 s, phone buzz 20.85 s (when the screen lights), a shop ambience bed under everything up to the end card, and a soft hit into the end card at 31.05 s.

Music: two 40-second instrumentals (`assets/audio/music_a.mp3` plucked guitar and brushed drums, used; `music_b.mp3` felt piano and low strings, alternate). The bed sits about 6 dB under the voice and ducks a further 8 dB while he speaks.

Mix (`scripts/mix_audio.py`): voice levelled to -18 dBFS, effects placed with fades, music ducked from the voice envelope, sum normalised to -16 LUFS / -1.5 dBTP, AAC 48 kHz stereo, video stream copied untouched. Silent masters kept as `final_*_silent.mp4`.

## Picture changes in the same revision

- Lupton logo (light version) top right on shots 1–4, 15% of frame width, fading out at 31.2–31.4 s as the end card's centred logo takes over.
- Beat 3 caption recast to first person: "We quote it. We make it." then "No reseller layer." SRT updated.

## Decisions I made that you may want to override

1. Generate at 3:4 and crop to 4:5 (no 4:5 in Seedance).
2. End card held 8.8 s so the crossfades still land the total at exactly 40.000 s.
3. Only four shots are generated; the end card is rendered locally, so the batch call has four items, not five.
4. Shot 3 has no hand (reduces the finger-artifact risk). Shot 1 keeps one hand because the tap is the hook.
5. No audio generated by the model. Silent delivery.
6. Caption bar at 8% opacity as written, with a text shadow for legibility.

---

## Result (what actually happened)

| Shot | Take used | Notes |
|---|---|---|
| 1 Hook | first take | drawing unrolls across the bench, index finger taps at ~7 s; dimension callouts are small generic numbers, not legible words |
| 2 Process | retry 1 | first take had a legible fake nameplate on the laser head; retry has a tiny illegible label, press and mold read correctly, all four cuts landed |
| 3 Quote path | first take | paper text is soft and unreadable, phone lights with a blurred banner; a small round stamp mark sits at the top of the form |
| 4 Parts | retry 1 | first take drew the bus bar as a hollow copper tube; retry shows a solid copper angle bar with bolt holes; lighting is flatter than take one |
| 5 End card | rendered locally | Pillow + ffmpeg, 8.8 s |

Source clips came back as 1248x1664 HEVC, 24 fps, 8.04 s. Conformed to 30 fps, cover-cropped, trimmed to 8.000 s each.

Credits: the `get_cost` preflight said 72 per generation. The transaction log shows **two 72-credit charges per generation** (one at submission, one at completion), so the six generations cost **864 credits** (balance 1,192.17 to 328.17). Shot 3's first submission was rejected by the server in favour of a preset and resubmitted with the preset declined; the log shows no extra charge for that.

Delivered: `final_4x5.mp4` (1080x1350), `final_1x1.mp4` (1080x1080), both H.264 30 fps exactly 40.000 s with voiceover, effects and music (silent masters alongside), metadata stripped except title and artist; `captions.srt`; `contact_sheet.png`; `linkedin_caption.txt`.
