import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {WHITE, SAGE} from './theme';
import {FONT, loadInter} from './font';

// "BUILT" — cut to the Apple product-film grammar, on Joe's five product stills brought to life.
//
// Every shot is his own photography: each still went into Higgsfield seedance 2.5 as the
// first frame of an image-to-video generation, so the frame he approved is frame one and
// the model only supplies the camera move and the physics. Nothing here is invented footage.
//
// What that grammar actually is, read off the keynote reel frame by frame:
//   · Black is a material, not a background. Type sits alone on it with enormous margins.
//   · Type is moderate, never shouty. Statements ~5% of frame height; emphasis ~10%.
//   · Headlines BUILD on screen rather than slamming in.
//   · Product beats and black type cards alternate.
//   · One loud colour in the whole film. Here that is the sage.
//   · Cuts are invisible and sit on the music grid; nothing flashy between shots.

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const BLACK = '#000000';
const outCubic = Easing.out(Easing.cubic);

// scene map (frames @30fps). Cuts land on Joe's spoken words, the structural beats on the grid.
const T = {
  open: 0, laser: 87, brake: 132, weld: 222, finished: 312,
  apart: 390, slam: 585, hero: 690, end: 825, total: 990,
};
const XF = 7;

const FR_LEN = T.hero - T.apart;
const FR_PEAK = T.slam - T.apart;   // 195 — widest
const FR_SNAP = FR_PEAK + 10;       // 205 — shut, on the score's hit

const AR = 1080 / 1352; // the hero clips are 4:5
// In 16:9 the object sits in the upper four fifths so the type below it has clear black
// to live in, rather than crowding the bottom edge of the plate.
const PLATE_H = 0.82;

// ---------- type ----------
// One scale for both formats, measured against frame height, so the type occupies the
// same share of the screen in the 16:9 and the 4:5 cut.
const useTh = () => useVideoConfig().height / 1080;

// Apple's reveal: it arrives, it does not attack. Fade, a short rise, a whisper of scale.
const arrive = (f: number, at: number, dur = 11) => {
  const e = outCubic(clamp((f - at) / dur));
  return {opacity: e, y: (1 - e) * 16, scale: interpolate(e, [0, 1], [1.035, 1])};
};

const Line: React.FC<{
  text: string; at: number; out?: number; size?: number; accent?: boolean; weight?: number;
}> = ({text, at, out, size = 54, accent, weight = 700}) => {
  const f = useCurrentFrame();
  const th = useTh();
  if (f < at) return null;
  const a = arrive(f, at);
  const fade = out === undefined ? 1 : 1 - clamp((f - out) / 8);
  const lift = out === undefined ? 0 : clamp((f - out) / 8) * 10;
  return (
    <div style={{
      fontFamily: FONT, fontWeight: weight, fontSize: size * th, letterSpacing: -0.022 * size * th,
      lineHeight: 1.22, color: accent ? SAGE : WHITE, textAlign: 'center',
      opacity: a.opacity * fade,
      transform: `translateY(${a.y - lift}px) scale(${a.scale})`,
      textShadow: '0 2px 40px rgba(0,0,0,0.9)',
    }}>
      {text}
    </div>
  );
};

// dead-centre block, for the black cards
const Centre: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
    {children}
  </AbsoluteFill>
);

// lower third, for type that shares the frame with a product
const Lower: React.FC<{children: React.ReactNode}> = ({children}) => {
  const th = useTh();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'column',
      paddingBottom: 108 * th}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------- 0-87: a black card. The line builds, the way Apple builds a headline. ----------
const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const th = useTh();
  const L1 = 'Every part you buy';
  const L2 = 'starts as a print.';
  const n1 = f < 8 ? 0 : Math.min(L1.length, Math.round(((f - 8) / 26) * L1.length));
  const n2 = f < 40 ? 0 : Math.min(L2.length, Math.round(((f - 40) / 24) * L2.length));
  const done = n2 >= L2.length;
  const caret = done ? Math.floor((f - 64) / 9) % 2 === 0 : true;
  const out = 1 - clamp((f - 80) / 7);
  return (
    <AbsoluteFill style={{background: BLACK}}>
      <Centre>
        <div style={{
          fontFamily: FONT, fontWeight: 700, fontSize: 56 * th, letterSpacing: -1.2 * th,
          lineHeight: 1.3, color: WHITE, textAlign: 'center', opacity: out,
        }}>
          <div>{L1.slice(0, n1)}</div>
          <div>
            {L2.slice(0, n2)}
            <span style={{
              opacity: caret ? 1 : 0, color: SAGE, fontWeight: 400,
              marginLeft: 3 * th,
            }}>|</span>
          </div>
        </div>
      </Centre>
    </AbsoluteFill>
  );
};

// ---------- a shot ----------
// Each one is a Higgsfield clip whose first frame is Joe's own photograph, so the camera
// move is the only thing the model added. Two ways of sitting in the frame:
//
// 'band'  — the 16:9 macros (laser, brake, weld). Full-bleed in the wide cut. In the 4:5
//           cut they stay 16:9, held as a scope band high on black, rather than being
//           cropped down to a slot: the word then lives in real black underneath.
// 'plate' — the 4:5 hero clips. Native in the tall cut; in the wide cut the object sits
//           at 82% of frame height on pure black, wide flanks and all. That emptiness is
//           the point, and it is why there is no blurred fill behind it.
const Shot: React.FC<{
  src: string; frames: number; mode?: 'band' | 'plate';
  from?: number;   // seconds into the clip
  rate?: number;   // playback rate; below 1 is slow motion
  z?: [number, number]; x?: [number, number]; y?: [number, number];
}> = ({src, frames, mode = 'band', from = 0, rate = 1, z = [1.0, 1.0], x = [0, 0], y = [0, 0]}) => {
  const f = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const wide = width / height > 1.5;
  const e = Easing.inOut(Easing.quad)(clamp(f / frames));
  const scale = interpolate(e, [0, 1], z);
  const tx = interpolate(e, [0, 1], x);
  const ty = interpolate(e, [0, 1], y) * (wide ? 1 : 0.4);
  const move = `scale(${scale}) translate(${tx}%, ${ty}%)`;

  // the clip itself; the generated move does the work, these are only the framing nudges
  const clip = (
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={Math.round(from * fps)}
      playbackRate={rate}
      muted
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', transform: move}}
    />
  );

  // the faintest lift under the lower third so white type stays crisp over sparks
  const scrim = (
    <AbsoluteFill style={{
      background: 'linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.22) 18%, rgba(0,0,0,0) 38%)',
    }} />
  );

  if (mode === 'plate') {
    if (!wide) {
      return (
        <AbsoluteFill style={{background: BLACK, opacity: clamp(f / XF), overflow: 'hidden'}}>
          {clip}
          {scrim}
        </AbsoluteFill>
      );
    }
    const h = height * PLATE_H;
    const w = h * AR;
    return (
      <AbsoluteFill style={{background: BLACK, opacity: clamp(f / XF)}}>
        <div style={{position: 'absolute', left: (width - w) / 2, top: 0, width: w, height: h,
          overflow: 'hidden'}}>
          {clip}
        </div>
      </AbsoluteFill>
    );
  }

  if (!wide) {
    const w = width * 1.45;
    const h = w * 9 / 16;
    return (
      <AbsoluteFill style={{background: BLACK, opacity: clamp(f / XF), overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: (width - w) / 2, top: height * 0.13,
          width: w, height: h, overflow: 'hidden'}}>
          {clip}
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: BLACK, opacity: clamp(f / XF), overflow: 'hidden'}}>
      {clip}
      {scrim}
    </AbsoluteFill>
  );
};

// ---------- the object breaks into four, then locks back into one ----------
const SLABS = 4;
const OFFSETS = [-1.5, -0.5, 0.5, 1.5];
const DRIFT_Y = [-0.9, 0.5, -0.4, 1.0];
const DRIFT_R = [-1.5, 0.7, -0.6, 1.4];

const Fracture: React.FC<{src: string}> = ({src}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const wide = width / height > 1.5;
  const h = height * (wide ? PLATE_H : 1);
  const w = h * AR;
  const left = (width - w) / 2;
  const top = 0;
  const slabW = w / SLABS;
  const maxGap = w * 0.075;

  let broken: number;
  if (f < FR_PEAK) broken = outCubic(clamp(f / FR_PEAK));
  else if (f < FR_SNAP) broken = 1 - Easing.in(Easing.cubic)(clamp((f - FR_PEAK) / (FR_SNAP - FR_PEAK)));
  else broken = 0;

  const gap = broken * maxGap;
  const scale = interpolate(clamp(f / FR_LEN), [0, 1], [1.0, 1.07]);
  const filter = `saturate(${1 - 0.62 * broken}) brightness(${1 - 0.3 * broken})`;

  return (
    <AbsoluteFill style={{background: BLACK, opacity: clamp(f / XF), overflow: 'hidden'}}>
      {OFFSETS.map((o, i) => (
        <div key={i} style={{
          position: 'absolute', left: left + i * slabW, top, width: slabW, height: h,
          overflow: 'hidden',
          transform: `translate(${o * gap}px, ${DRIFT_Y[i] * gap * 0.32}px) rotate(${DRIFT_R[i] * broken * 0.45}deg)`,
        }}>
          <div style={{position: 'absolute', left: -i * slabW, top: 0, width: w, height: '100%'}}>
            <Img src={staticFile(src)} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              transform: `scale(${scale})`, filter,
            }} />
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Impact: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  // short and hard: a full-frame white held any longer reads as a grey veil, not a hit
  const a = f < at ? 0 : Math.max(0, 1 - (f - at) / 6) ** 2;
  if (a <= 0) return null;
  return <AbsoluteFill style={{background: '#FFFFFF', opacity: a * 0.5}} />;
};

const Lockup: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame();
  const th = useTh();
  const a = clamp((f - from) / 14);
  if (a <= 0) return null;
  return (
    <div style={{
      position: 'absolute', top: 64 * th, left: 76 * th, display: 'flex', alignItems: 'center', gap: 13 * th,
      opacity: a * 0.85,
    }}>
      <Img src={staticFile('badge.png')} style={{width: 34 * th, height: 34 * th,
        filter: 'drop-shadow(0 1px 10px rgba(0,0,0,0.85))'}} />
      {/* in the 4:5 cut this sits over the part rather than over black, so it needs the lift */}
      <span style={{fontFamily: FONT, fontWeight: 600, fontSize: 18 * th, letterSpacing: 5.5 * th, color: WHITE,
        textShadow: '0 1px 14px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.6)'}}>
        LUPTON ASSOCIATES
      </span>
    </div>
  );
};

// ---------- 825-990: the end card, on black, with room around it ----------
const End: React.FC = () => {
  const f = useCurrentFrame();
  const th = useTh();
  const send = {i: clamp((f - 10) / 11), o: clamp((f - 54) / 8)};
  const badge = arrive(f, 60, 13);
  const build = arrive(f, 66, 13);
  const url = arrive(f, 110, 13);
  return (
    <AbsoluteFill style={{background: BLACK, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{
        position: 'absolute', fontFamily: FONT, fontWeight: 700, fontSize: 68 * th, letterSpacing: -1.5 * th,
        color: WHITE, opacity: outCubic(send.i) * (1 - send.o),
        transform: `translateY(${(1 - outCubic(send.i)) * 16 - send.o * 12}px) scale(${interpolate(outCubic(send.i), [0, 1], [1.035, 1])})`,
      }}>
        Send us the print.
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: build.opacity > 0 ? 1 : 0}}>
        <Img src={staticFile('badge.png')} style={{
          width: 74 * th, height: 74 * th, marginBottom: 40 * th,
          opacity: badge.opacity, transform: `translateY(${badge.y}px)`,
        }} />
        <div style={{
          fontFamily: FONT, fontWeight: 700, fontSize: 72 * th, letterSpacing: -1.6 * th, color: SAGE,
          opacity: build.opacity, transform: `translateY(${build.y}px) scale(${build.scale})`,
        }}>
          Let&rsquo;s build it together.
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 500, fontSize: 34 * th, letterSpacing: 1.5 * th, color: '#9DABA5',
          marginTop: 30 * th, opacity: url.opacity, transform: `translateY(${url.y}px)`,
        }}>
          Luptons.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

const vo = (name: string, from: number, volume = 1.45) => (
  <Sequence key={`v${name}${from}`} from={from}><Audio src={staticFile(`audio/${name}.wav`)} volume={volume} /></Sequence>
);
const sfx = (name: string, from: number, volume = 1) => (
  <Sequence key={`s${name}${from}`} from={from}><Audio src={staticFile(`audio/${name}.wav`)} volume={volume} /></Sequence>
);

export const Built: React.FC = () => {
  loadInter();
  return (
    <AbsoluteFill style={{background: BLACK}}>
      {/* black card — the headline builds itself */}
      <Sequence from={T.open} durationInFrames={T.laser}><Opening /></Sequence>

      {/* process: the macros, one word each in the lower third.
          The camera work is the clip's own — these only nudge the framing. */}
      <Sequence from={T.laser} durationInFrames={T.brake - T.laser + XF}>
        <Shot src="vid/bu_laser.mp4" frames={T.brake - T.laser + XF} from={0.3} z={[1.04, 1.0]} />
        <Lower><Line text="Cut." at={4} out={T.brake - T.laser - 6} size={96} weight={800} /></Lower>
      </Sequence>
      <Sequence from={T.brake} durationInFrames={T.weld - T.brake + XF}>
        <Shot src="vid/bu_brake.mp4" frames={T.weld - T.brake + XF} from={1.5} rate={0.9} z={[1.03, 1.0]} />
        <Lower><Line text="Formed." at={4} out={T.weld - T.brake - 6} size={96} weight={800} /></Lower>
      </Sequence>
      <Sequence from={T.weld} durationInFrames={T.finished - T.weld + XF}>
        <Shot src="vid/bu_weld.mp4" frames={T.finished - T.weld + XF} from={0.4} z={[1.03, 1.0]} />
        <Lower><Line text="Welded." at={4} out={T.finished - T.weld - 6} size={96} weight={800} /></Lower>
      </Sequence>

      {/* the object arrives whole, on black, turning slowly under a raking key */}
      <Sequence from={T.finished} durationInFrames={T.apart - T.finished + XF}>
        <Shot src="vid/bu_heroA.mp4" frames={T.apart - T.finished + XF} mode="plate" from={0.2} rate={0.9} />
        <Lower><Line text="Finished." at={6} out={T.apart - T.finished - 6} size={96} weight={800} accent /></Lower>
      </Sequence>

      {/* it comes apart, then locks back together */}
      <Sequence from={T.apart} durationInFrames={FR_LEN}>
        <Fracture src="img/bu_fracture.png" />
        <Impact at={FR_SNAP} />
        <Lower>
          <Line text="Four shops." at={6} out={FR_PEAK - 8} size={50} />
          <Line text="Four purchase orders." at={45} out={FR_PEAK - 8} size={50} />
          <Line text="Four people to call." at={97} out={FR_PEAK - 8} size={50} />
        </Lower>
        <Lower><Line text="Under one roof." at={FR_SNAP + 5} out={FR_LEN - 10} size={104} weight={800} /></Lower>
      </Sequence>

      {/* the payoff angle */}
      <Sequence from={T.hero} durationInFrames={T.end - T.hero + XF}>
        <Shot src="vid/bu_heroB.mp4" frames={T.end - T.hero + XF} mode="plate" from={0.15} rate={0.92} />
        <Lower>
          <Line text="One print." at={13} out={T.end - T.hero - 8} size={50} />
          <Line text="One project manager." at={52} out={T.end - T.hero - 8} size={50} />
          <Line text="One team that owns the fit." at={100} out={T.end - T.hero - 8} size={50} accent />
        </Lower>
      </Sequence>

      <Sequence from={T.end} durationInFrames={T.total - T.end}><End /></Sequence>

      <Lockup from={T.finished + 12} />

      <Audio src={staticFile('audio/bu_music.wav')} volume={0.5} />

      {/* Joe's recording, sliced at his own pauses; BU6-8 at atempo 1.06 */}
      {vo('BU1', 12)}
      {vo('BU2', 87)}
      {vo('BU3', 132)}
      {vo('BU4', 222)}
      {vo('BU5', 312)}
      {vo('BU6', 372)}
      {vo('BU7', 431)}
      {vo('BU8', 483)}
      {vo('BU9', 598)}
      {vo('BU10', 699)}
      {vo('BU11', 738)}
      {vo('BU12', 786)}
      {vo('BU13', 843)}
      {vo('BU14', 885)}
      {vo('BU15', 936)}

      {/* sparse, like the reference: only the hits that matter */}
      {sfx('type_ticks', 10, 0.32)}
      {sfx('subbass', T.laser, 0.5)}
      {sfx('snap', T.brake, 0.34)}
      {sfx('strike', T.weld, 0.4)}
      {sfx('subbass', T.finished, 0.4)}
      {sfx('shatter', T.apart + 6, 0.26)}
      {sfx('strike', T.apart + FR_SNAP, 0.5)}
      {sfx('resolve', T.end, 0.45)}
    </AbsoluteFill>
  );
};
