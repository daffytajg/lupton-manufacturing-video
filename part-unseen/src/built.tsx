import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {WHITE, SAGE} from './theme';
import {FONT, loadInter} from './font';
import {useUnit} from './scenes';

// "BUILT" — cut from Joe's five product stills. Apple-keynote energy comes from the
// camera moves, the type that lands hard on the beat, and the finished assembly
// fracturing into four slabs under "four shops" before slamming back together on
// "Under one roof." 120 BPM; every cut sits on the grid the score is built from.

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const BLACK = '#000000';
const outCubic = Easing.out(Easing.cubic);
const outExpo = Easing.out(Easing.exp);
const inOutQuad = Easing.inOut(Easing.quad);

// scene map (frames @30fps) — 0, 4, 7, 10, 13, 19.5, 23, 27.5 s
const T = {laser: 0, brake: 120, weld: 210, finished: 300, apart: 390, slam: 585, hero: 690, end: 825, total: 990};
const XF = 8;

// the fracture runs as one continuous move from `apart` through the slam into `hero`
const FR_LEN = T.hero - T.apart;   // 300 frames
const FR_PEAK = T.slam - T.apart;  // 195 — widest separation, 19.5 s
const FR_SNAP = FR_PEAK + 10;      // 205 — closed, 19.83 s: the score's hit and the flash

const center: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
};

// Joe's stills are 4:5 (1122x1402). The 4:5 cut is a native fit; the 16:9 cut is not,
// so there are two framings:
//   'bleed' — full-frame cover. Right for the macro process shots: they are abstract
//             textures of light and sparks and crop beautifully.
//   'fit'   — the image sits at full frame height, centred, over a heavily blurred and
//             darkened copy of itself. Right for the product shots, where cropping to
//             16:9 would cut the bracket base off the bottom and the cover off the top
//             — which is exactly the part of the object the film is selling.
// In the 4:5 cut the two modes resolve to the same thing, since the image already fits.
const AR = 1122 / 1402;

const Still: React.FC<{
  src: string; frames: number; mode?: 'bleed' | 'fit';
  z?: [number, number]; x?: [number, number]; y?: [number, number];
  filter?: string; ease?: (n: number) => number;
}> = ({src, frames, mode = 'bleed', z = [1.16, 1.04], x = [0, 0], y = [0, 0], filter, ease = inOutQuad}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const wide = width / height > 1.5;
  const yMul = wide ? 1 : 0.28;
  const e = ease(clamp(f / frames));
  const scale = interpolate(e, [0, 1], z);
  const tx = interpolate(e, [0, 1], x);
  const ty = interpolate(e, [0, 1], y) * yMul;
  const fitted = mode === 'fit' && wide;
  const imgW = height * AR;

  return (
    <AbsoluteFill style={{opacity: clamp(f / XF), overflow: 'hidden', background: BLACK}}>
      {fitted && (
        <>
          <Img src={staticFile(src)} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${scale * 1.6})`, filter: 'blur(70px) brightness(0.2) saturate(0.45)',
          }} />
          {/* sink the flanks to black so the product is the only lit thing in frame */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, #000 0%, rgba(0,0,0,0.82) ${(width - imgW) / 2 / width * 100}%,`
              + ` rgba(0,0,0,0) 50%, rgba(0,0,0,0.82) ${(width + imgW) / 2 / width * 100}%, #000 100%)`,
          }} />
        </>
      )}
      <Img src={staticFile(src)} style={{
        position: 'absolute', top: 0, left: fitted ? (width - imgW) / 2 : 0,
        width: fitted ? imgW : '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${scale}) translate(${tx}%, ${ty}%)`, filter,
      }} />
    </AbsoluteFill>
  );
};

// ---------- the finished part breaks into four, then slams back into one ----------
const SLABS = 4;
const OFFSETS = [-1.5, -0.5, 0.5, 1.5];
const DRIFT_Y = [-0.9, 0.5, -0.4, 1.0];
const DRIFT_R = [-1.6, 0.8, -0.7, 1.5];

const Fracture: React.FC<{src: string}> = ({src}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  // slice the product itself, not the whole frame, so the break reads on the object
  const imgW = Math.min(width, height * AR);
  const imgLeft = (width - imgW) / 2;
  const slabW = imgW / SLABS;
  const maxGap = imgW * 0.075;

  // broken: 1 = fully apart, 0 = whole
  let broken: number;
  if (f < FR_PEAK) {
    broken = outCubic(clamp(f / FR_PEAK));              // drifts apart, decelerating
  } else if (f < FR_SNAP) {
    broken = 1 - Easing.in(Easing.cubic)(clamp((f - FR_PEAK) / (FR_SNAP - FR_PEAK)));
  } else {
    broken = 0;                                          // locked together
  }

  const gap = broken * maxGap;
  const scale = interpolate(clamp(f / FR_LEN), [0, 1], [1.0, 1.09]);
  // cold and drained while it's in pieces; full colour the instant it locks up
  const filter = `saturate(${1 - 0.6 * broken}) brightness(${1 - 0.28 * broken}) contrast(${1 + 0.06 * broken})`;

  return (
    <AbsoluteFill style={{opacity: clamp(f / XF), background: BLACK, overflow: 'hidden'}}>
      {imgW < width && (
        <>
          <Img src={staticFile(src)} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${scale * 1.6})`,
            filter: `blur(70px) brightness(${0.2 - 0.09 * broken}) saturate(${0.45 - 0.3 * broken})`,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, #000 0%, rgba(0,0,0,0.82) ${imgLeft / width * 100}%,`
              + ` rgba(0,0,0,0) 50%, rgba(0,0,0,0.82) ${(imgLeft + imgW) / width * 100}%, #000 100%)`,
          }} />
        </>
      )}
      {OFFSETS.map((o, i) => (
        <div key={i} style={{
          position: 'absolute', left: imgLeft + i * slabW, top: 0, width: slabW, height: '100%',
          overflow: 'hidden',
          transform: `translate(${o * gap}px, ${DRIFT_Y[i] * gap * 0.35}px) rotate(${DRIFT_R[i] * broken * 0.5}deg)`,
        }}>
          <div style={{position: 'absolute', left: -i * slabW, top: 0, width: imgW, height: '100%'}}>
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

// ---------- a word that SLAMS: oversized + blurred, snaps to size, holds, lifts away ----------
const Slam: React.FC<{text: string; from: number; to: number; size?: number; accent?: boolean; y?: string}> =
  ({text, from, to, size = 104, accent, y = '16%'}) => {
  const f = useCurrentFrame();
  const u = useUnit();
  if (f < from || f > to) return null;
  const ein = outExpo(clamp((f - from) / 9));
  const tout = clamp((f - (to - 7)) / 7);
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: y,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: FONT, fontWeight: 800, fontSize: size * u, letterSpacing: -3 * u, lineHeight: 1.05,
        color: accent ? SAGE : WHITE, textAlign: 'center',
        textShadow: '0 4px 44px rgba(0,0,0,0.9)',
        opacity: Math.min(ein * 1.6, 1) * (1 - tout),
        transform: `scale(${interpolate(ein, [0, 1], [2.2, 1])}) translateY(${-tout * 22 * u}px)`,
      }}>
        {text}
      </div>
    </div>
  );
};

// ---------- a stacked list that builds line by line ----------
const Stack: React.FC<{lines: {text: string; at: number; accent?: boolean}[]; to: number; size?: number; y?: string}> =
  ({lines, to, size = 58, y = '15%'}) => {
  const f = useCurrentFrame();
  const u = useUnit();
  if (f > to) return null;
  const tout = clamp((f - (to - 8)) / 8);
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: y,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * u,
      pointerEvents: 'none', opacity: 1 - tout,
    }}>
      {lines.map((l) => {
        const t = clamp((f - l.at) / 8);
        if (t <= 0) return null;
        const e = outCubic(t);
        return (
          <div key={l.text} style={{
            fontFamily: FONT, fontWeight: 800, fontSize: size * u, letterSpacing: -1.6 * u, lineHeight: 1.15,
            color: l.accent ? SAGE : WHITE, textShadow: '0 4px 44px rgba(0,0,0,0.9)',
            opacity: e, transform: `translateY(${(1 - e) * 26 * u}px) scale(${interpolate(e, [0, 1], [1.25, 1])})`,
            filter: `blur(${(1 - e) * 12}px)`,
          }}>
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

const Impact: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const a = f < at ? 0 : Math.max(0, 1 - (f - at) / 8) ** 2.1;
  if (a <= 0) return null;
  return <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', opacity: a * 0.8}} />;
};

const Lockup: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame();
  const u = useUnit();
  const a = clamp((f - from) / 12);
  if (a <= 0) return null;
  return (
    <div style={{
      position: 'absolute', top: 70 * u, left: 82 * u, display: 'flex', alignItems: 'center', gap: 14 * u,
      opacity: a * 0.92,
    }}>
      <Img src={staticFile('badge.png')} style={{width: 38 * u, height: 38 * u}} />
      <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 20 * u, letterSpacing: 6 * u, color: WHITE,
        textShadow: '0 2px 16px rgba(0,0,0,0.8)'}}>
        LUPTON ASSOCIATES
      </span>
    </div>
  );
};

// ---------- 825-990: end card ----------
const End: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const send = {i: clamp((f - 8) / 10), o: clamp((f - 52) / 8)};
  const badge = clamp((f - 58) / 12);
  const build = clamp((f - 62) / 12);
  const url = clamp((f - 108) / 12);
  const rise = (t: number) => (1 - outCubic(t)) * 28 * u;
  return (
    <div style={{...center, background: BLACK}}>
      <div style={{
        position: 'absolute', fontFamily: FONT, fontWeight: 800, fontSize: 96 * u, letterSpacing: -3 * u, color: WHITE,
        opacity: outExpo(send.i) * (1 - send.o),
        transform: `scale(${interpolate(outExpo(send.i), [0, 1], [1.9, 1])}) translateY(${-send.o * 20 * u}px)`,
        filter: `blur(${(1 - outExpo(send.i)) * 20}px)`,
      }}>
        Send us the print.
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: build > 0 ? 1 : 0}}>
        <Img src={staticFile('badge.png')} style={{
          width: 88 * u, height: 88 * u, marginBottom: 42 * u,
          opacity: outCubic(badge), transform: `translateY(${rise(badge)}px)`,
        }} />
        <div style={{
          fontFamily: FONT, fontWeight: 800, fontSize: 86 * u, letterSpacing: -3 * u, color: SAGE, lineHeight: 1.1,
          opacity: outCubic(build), transform: `translateY(${rise(build)}px)`,
          filter: `blur(${(1 - outCubic(build)) * 12}px)`,
        }}>
          Let&rsquo;s build it together.
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 600, fontSize: 40 * u, letterSpacing: 2 * u, color: WHITE, marginTop: 34 * u,
          opacity: outCubic(url), transform: `translateY(${rise(url)}px)`,
        }}>
          Luptons.com
        </div>
      </div>
    </div>
  );
};

const vo = (name: string, from: number, volume = 1.45) => (
  <Sequence key={`${name}-${from}`} from={from}>
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume} />
  </Sequence>
);
const sfx = (name: string, from: number, volume = 1) => (
  <Sequence key={`${name}-${from}`} from={from}>
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume} />
  </Sequence>
);

export const Built: React.FC = () => {
  loadInter();
  const {width, height} = useVideoConfig();
  const wide = width / height > 1.5;
  return (
    <AbsoluteFill style={{background: BLACK}}>
      {/* ---- the process: Joe's macro stills, each with a push along the action ---- */}
      <Sequence from={T.laser} durationInFrames={T.brake - T.laser + XF}>
        {/* rush along the cut: in toward the nozzle, drifting with the spark fan */}
        <Still src="img/bu_laser.png" frames={T.brake - T.laser + XF}
          z={[1.34, 1.08]} x={[-5, 2]} y={[3, -2]} ease={outCubic} />
      </Sequence>
      <Sequence from={T.brake} durationInFrames={T.weld - T.brake + XF}>
        {/* settle down into the V-die as the sheet folds */}
        <Still src="img/bu_brake.png" frames={T.weld - T.brake + XF}
          z={[1.30, 1.10]} x={[0, 0]} y={[-6, 4]} />
      </Sequence>
      <Sequence from={T.weld} durationInFrames={T.finished - T.weld + XF}>
        {/* push into the arc */}
        <Still src="img/bu_weld.png" frames={T.finished - T.weld + XF}
          z={[1.12, 1.34]} x={[3, -3]} y={[2, -3]} ease={outCubic} />
      </Sequence>
      <Sequence from={T.finished} durationInFrames={T.apart - T.finished + XF}>
        {/* the reveal: the whole finished assembly, settling out of a push */}
        <Still src="img/bu_heroA.png" frames={T.apart - T.finished + XF} mode="fit"
          z={[1.16, 1.02]} x={[0, 0]} y={[2, -1]} ease={outCubic} />
      </Sequence>

      {/* ---- the problem and the turn: one continuous break-and-slam ---- */}
      <Sequence from={T.apart} durationInFrames={FR_LEN}>
        <Fracture src="img/bu_heroA.png" />
        <Impact at={FR_SNAP} />
      </Sequence>

      {/* ---- hero: the payoff angle ---- */}
      <Sequence from={T.hero} durationInFrames={T.end - T.hero + XF}>
        <Still src="img/bu_heroB.png" frames={T.end - T.hero + XF} mode="fit"
          z={[1.0, 1.10]} x={[1, -1]} y={[-1, 1]} ease={outCubic} />
      </Sequence>

      <Sequence from={T.end} durationInFrames={T.total - T.end}><End /></Sequence>

      {/* ---- type: every spoken line is on screen for the muted feed ---- */}
      <Slam text="Cut." from={87} to={T.brake + 4} />
      <Slam text="Formed." from={132} to={T.weld + 4} />
      <Slam text="Welded." from={222} to={T.finished + 4} />
      <Slam text="Finished." from={312} to={T.apart + 4} accent />
      <Sequence from={T.apart} durationInFrames={T.slam - T.apart}>
        <Stack
          to={T.slam - T.apart - 2}
          size={wide ? 56 : 52}
          lines={[
            {text: 'Four shops.', at: 4},
            {text: 'Four purchase orders.', at: 43},
            {text: 'Four people to call.', at: 95},
          ]}
        />
      </Sequence>
      <Slam text="Under one roof." from={600} to={T.hero + 4} size={112} />
      <Sequence from={T.hero} durationInFrames={T.end - T.hero}>
        <Stack
          to={T.end - T.hero - 2}
          size={wide ? 60 : 54}
          lines={[
            {text: 'One print.', at: 11},
            {text: 'One project manager.', at: 50},
            {text: 'One team that owns the fit.', at: 98, accent: true},
          ]}
        />
      </Sequence>
      <Lockup from={T.apart + 10} />

      {/* ---- score: 120 BPM, cuts on the grid, hit aligned to the slam ---- */}
      <Audio src={staticFile('audio/bu_music.wav')} volume={0.5} />

      {/* ---- narration: Joe's own recording, sliced at his own pauses.
              BU6-8 run atempo=1.06 so the problem section hands off on the beat. ---- */}
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

      {/* ---- only the hits that matter; the stills carry no ambience of their own ---- */}
      {sfx('subbass', 0, 0.5)}
      {sfx('snap', T.brake, 0.38)}
      {sfx('strike', T.weld, 0.42)}
      {sfx('subbass', T.finished, 0.42)}
      {sfx('shatter', T.apart + 6, 0.3)}
      {sfx('strike', T.apart + FR_SNAP, 0.55)}
      {sfx('resolve', T.end, 0.5)}
    </AbsoluteFill>
  );
};
