# Lupton Associates — Video Production Playbook

This repo holds Lupton's LinkedIn brand videos and the reusable production kit
(`brand-kit/`). Any new video should follow this playbook so every piece stays
consistent with `lupton-manufacturing-v9.mp4` (legacy 4:5 style) and
`lupton-buyer-painting-v7.mp4` (current 16:9 motion-graphics style — the
preferred look, matching the promo / AI-shift reference videos).

## Brand system (current, 16:9)

- Canvas: 1920×1080 @ 30fps, H.264/AAC, faststart, target ≈ -14 LUFS integrated.
- Ground: dark green-charcoal radial `#1C2424 → #131A1A → #0D1213`, faint 96px
  grid at 2.5% white, ~60 seeded particles, light film grain (`noise=alls=3:allf=t`).
- Type: Inter (variable, `brand-kit/fonts/Inter-var.woff2`). Headlines 800 weight,
  -2px letter-spacing, white `#F4F7F4` with one phrase in sage `#8FBC97`.
  Eyebrows: 26px, 600, 11px letter-spacing, uppercase, `#7E948A`.
  Body: 31px, `#9DABA5`. Counters `01 / 04` + 640px rule with 96px sage progress.
- Sage brand color: `#6B8E7B` (badge), button gradient `#84AC8E → #6B8E7B`.
- Badge: `brand-kit/badge.png` (white LA mark on sage, 150px, pixel-matched to
  the reference videos).
- Layouts (templates in `brand-kit/templates/`, render → overlay PNGs):
  - `ov01` hook statement, `ov02/04/06/08` split capability cards (opaque left
    panel, diagonal gradient into footage on right), `ov03/05` full-bleed beats
    with bottom-left eyebrow caption, `ov07/09` full-bleed statements,
    `ov10` end card (badge, LUPTON ASSOCIATES, body, sage "Request a Quote →"
    button, LUPTONS.COM). `L*_*.html` are per-line layers for staggered reveals.
  - `swipe_sage/​swipe_dark.html` (4400×1080) — paint-swipe transition slabs.
- Rendering overlays: headless Chromium,
  `--headless --no-sandbox --disable-gpu --default-background-color=00000000
  --window-size=1920,1168 --screenshot=out.png file://...html`, then
  `crop=1920:1080:0:0`. **The +88px height matters** — the viewport paints only
  ~992px at a 1080 window, which silently cuts the bottom of every overlay.
  (Swipes: window 4400×1168, crop 4400:1080.)

## Editorial pattern (what tested best)

- ~38s total. 1s cold open of the three highest-energy frames (rapid cuts) →
  hook statement → alternating capability cards and full-bleed beats with
  close-up "punch-in" crops as fake second angles → statement beat →
  direct-quote card → "Send us the drawing." → 7s end card.
- Staggered text reveals (scrim → dash/eyebrow → line 1 → line 2, each fade
  0.3-0.45s + 20-26px rise). Sage paint-swipe (dark slab leads by 0.05s) over
  every major cut, 0.44s sweep, with `brand-kit/audio/whoosh.wav` at ~0.34 vol.
- Measured on Higgsfield's virality predictor: leading with sparks moved the
  attention peak to second 0 and raised hook engagement 24 → 32.

## Voice, narration, and audio

- Narrator: cloned from the v9 video's narration. Reference audio:
  `brand-kit/audio/v9_narrator_reference.m4a`. On Higgsfield, upload it and pass
  `medias:[{role:"audio_references", value:"<media_id>"}]` to `generate_audio`
  (model seed_audio). Never use stock preset voices (a British preset was
  rejected early on).
- Generate narration as ONE SHORT LINE PER SCENE (`generate_audio_batch`),
  silence-trim each (`silenceremove` + `areverse` trick), place with `adelay`
  at scene starts, mild `atempo` 1.06–1.13 to fit. Never one long take — it
  drifts off picture. Existing trimmed lines: `brand-kit/audio/T1–T8.wav`.
- Mix recipe: clip SFX 0.30 · music 0.38 · VO 1.0 → `amix normalize=0` →
  `volume=1.35` → `alimiter=limit=0.95` → end fades. AI clip ambience can hide
  tonal whines (a forklift clip carried a siren-like 3.3kHz warble) — check a
  spectrogram; double `lowpass=f=600` fixed it.
- Music: `brand-kit/music/Prelude_and_Action.mp3` — Kevin MacLeod
  (incompetech.com), **CC BY 4.0: every published post must credit**
  "Music: Kevin MacLeod (incompetech.com), CC BY 4.0".

## Footage

- `brand-kit/clips/s1–s7.mp4` (1280×720@24, native AI SFX) + matching keyframes
  in `brand-kit/frames/`: s1 paint-spray hook, s2 laser, s3 robotic weld,
  s4 spray booth, s5 curing oven conveyor, s6 QC gauge, s7 dock/forklift still
  (use as Ken Burns push-in — the animated forklift clips drifted unnaturally).
- New footage: Higgsfield nano_banana_pro keyframe → seedance_2_0_mini
  image-to-video via `start_image`, 720p 5s `generate_audio:true` (~12.5cr).
  Check `get_cost` first; upscale to 1920 with lanczos + light unsharp.
- Punch-in second angles: crop ~1024×576 around the action from the same clip's
  later half, scale up — reads as new coverage for free.

## Copy rules (Alan-approved)

- Every process claim must trace to a principal's website or the Lupton sales
  deck. Verified as of Aug 2026: PCI ProCoaters site ("ONE STOP", laser, CNC
  punching/forming, TIG/MIG/spot, "wet spray and batch powder"); Clow site
  (paint/powder finishes, test checks, custom pack-outs) and the Lupton deck's
  Clow slide ("e-coat, powder, and wet spray painting"); Tongrun deck (15 powder
  lines, E-coat ×2, cure ovens, testing labs). Tongrun does NOT list wet spray.
- Never: broker/partner/rep language, "connected buyers with manufacturers",
  CARC (Joe vetoed), unverified capabilities, principal counts ("33
  manufacturers" — it could be more), or anything that reads as pitting
  Lupton's principals against each other (a supplier "going dark" must be the
  buyer's incumbent, never one of ours). Always: direct shop quote path,
  concrete processes, and the house ask — drawings, part details, annual
  volume, timing → feasibility estimate. Frame everything as the rep firm
  selling to OEM buyers. Tagline: "Servicing the working world since 1969".
  Run copy through the `alan-lupton-approval-voice` skill.
- Every video ends with the VO "Let's build it together." then "Luptons dot
  com," with "Let's build it together." and LUPTONS.COM on the end card
  (Joe's standing rule, Sep 2026).
- VO smoothness: never splice separately generated lines back-to-back — the
  energy jumps read as choppy. Generate each section as one continuous take,
  split only at the narrator's own pauses (silencedetect), tighten gaps,
  RMS-match segments, 12ms fades. After EVERY cut, run the Higgsfield
  watch-back and confirm the transcript contains every VO line over its
  scene before shipping — captions with missing audio is the failure mode.

## Verification loop (do this every cut)

1. Frame contact sheet (ffmpeg fps sample + hstack/vstack) — check text,
   overlays, transitions.
2. Higgsfield `video_analysis_create` "watch-back" — confirm each narration
   line is transcribed over the scene it describes. This catches drift.
3. `ebur128` loudness (target ≈ -14 LUFS) and, for hook work,
   `virality_predictor` on the first ≤16s.

## Repo conventions

- Ship as `lupton-buyer-<topic>-vN.mp4`, update `painting.html` (or a new
  viewer page) to the new file, `git rm` the superseded version, push, keep the
  draft PR description current. Leave `index.html` + v9 untouched.
