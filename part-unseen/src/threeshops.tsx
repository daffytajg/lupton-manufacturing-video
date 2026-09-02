import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {WHITE, SAGE, GRAY, EYEBROW, bgStyle} from './theme';
import {FONT, loadInter} from './font';
import {useUnit} from './scenes';

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

const center: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
};

const HOOK = 'Three POs. One bracket.';

const Footage: React.FC<{src: string; rate: number; frames: number; filter?: string; dim?: number}> = ({src, rate, frames, filter, dim = 1}) => {
  const f = useCurrentFrame();
  const enter = clamp(f / 5);
  return (
    <Sequence from={0} durationInFrames={frames} layout="none">
      <OffthreadVideo muted playbackRate={rate} src={staticFile(src)} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: enter * dim, filter,
      }} />
    </Sequence>
  );
};

// ---------- 0-105: black; the hook types in ----------
const TsHook: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const chars = f < 6 ? 0 : Math.min(HOOK.length, Math.floor(((f - 6) / 50) * HOOK.length));
  const done = chars >= HOOK.length;
  const cursorOn = done ? Math.floor(f / 8) % 2 === 0 : true;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#050808'}}>
      <div style={{...center, padding: `0 ${120 * u}px`}}>
        <div style={{
          fontFamily: FONT, fontWeight: 800, fontSize: 84 * u, lineHeight: 1.3,
          color: WHITE, textAlign: 'center', letterSpacing: -1.5,
        }}>
          {HOOK.slice(0, chars)}
          <span style={{opacity: cursorOn ? 1 : 0, color: SAGE}}>▌</span>
        </div>
      </div>
    </div>
  );
};

// ---------- one shop, one PO: footage + slammed PO stamp ----------
const TsShop: React.FC<{src: string; rate: number; frames: number; po: string; process: string; stampAt: number; filter?: string}> =
  ({src, rate, frames, po, process, stampAt, filter}) => {
  const f = useCurrentFrame();
  const u = useUnit();
  const stampIn = clamp((f - stampAt) / 5);
  const stampScale = interpolate(stampIn, [0, 1], [1.9, 1], {easing: Easing.out(Easing.cubic)});
  return (
    <div style={center}>
      <Footage src={src} rate={rate} frames={frames} filter={filter} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(0deg, rgba(10,15,15,0.62) 0%, rgba(10,15,15,0.08) 45%, rgba(10,15,15,0.25) 100%)',
      }} />
      <div style={{
        position: 'absolute', left: 130 * u, top: 120 * u, transformOrigin: 'left center',
        transform: `scale(${stampScale}) rotate(-4deg)`, opacity: stampIn,
        fontFamily: FONT, fontWeight: 800, fontSize: 64 * u, letterSpacing: 4 * u,
        color: WHITE, border: `${5 * u}px solid ${WHITE}`, padding: `${6 * u}px ${24 * u}px`,
        background: 'rgba(13,18,19,0.55)', display: 'flex', alignItems: 'baseline', gap: 22 * u,
      }}>
        <span>{po}</span>
        <span style={{fontSize: 30 * u, fontWeight: 600, color: SAGE, letterSpacing: 7 * u}}>{process}</span>
      </div>
    </div>
  );
};

// ---------- the holes don't line up ----------
const TsMisfit: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 0.18 + 0.12 * Math.sin(f / 4);
  return (
    <div style={center}>
      <Footage src="vid/ts_misfit.mp4" rate={1.0} frames={150} filter="saturate(0.8) contrast(1.08)" />
      <div style={{
        position: 'absolute', inset: 0, opacity: clamp((f - 60) / 20),
        background: `radial-gradient(70% 60% at 50% 50%, rgba(0,0,0,0) 40%, rgba(120,20,20,${pulse}) 100%)`,
      }} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(10,15,15,0.6) 0%, rgba(10,15,15,0.05) 45%)'}} />
    </div>
  );
};

// ---------- under one roof: the one-take with the capability ticker ----------
const STATIONS = ['LASER', 'FORM', 'WELD', 'POWDER'];

const TsRoof: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const wm = clamp((f - 6) / 10);
  return (
    <div style={center}>
      <Footage src="vid/ts_roof.mp4" rate={1.0} frames={300} filter="saturate(1.08) brightness(1.02)" />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(10,15,15,0.62) 0%, rgba(10,15,15,0.06) 45%, rgba(10,15,15,0.28) 100%)'}} />
      <div style={{position: 'absolute', top: 96 * u, left: 100 * u, display: 'flex', alignItems: 'center', gap: 16 * u, opacity: wm}}>
        <Img src={staticFile('badge.png')} style={{width: 44 * u, height: 44 * u}} />
        <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 24 * u, letterSpacing: 6 * u, color: WHITE, textShadow: '0 2px 12px rgba(0,0,0,0.6)'}}>
          LUPTON ASSOCIATES
        </span>
      </div>
      <div style={{
        position: 'absolute', top: 100 * u, right: 100 * u, opacity: wm,
        fontFamily: FONT, fontWeight: 600, fontSize: 24 * u, letterSpacing: 9 * u, color: SAGE, textTransform: 'uppercase',
      }}>
        Under one roof
      </div>
      <div style={{position: 'absolute', top: 180 * u, right: 100 * u, display: 'flex', gap: 18 * u}}>
        {STATIONS.map((s, i) => {
          const ats = [41, 67, 94, 121];
          const at = ats[i];
          const a = clamp((f - at) / 6);
          const current = (i === 3) || f < ats[i + 1];
          return (
            <div key={s} style={{
              fontFamily: FONT, fontWeight: 700, fontSize: 24 * u, letterSpacing: 5 * u,
              color: current ? WHITE : GRAY, opacity: a * (current ? 1 : 0.6),
              border: `${2 * u}px solid ${current ? SAGE : 'rgba(157,171,165,0.4)'}`,
              padding: `${8 * u}px ${18 * u}px`, borderRadius: 6 * u,
              background: current ? 'rgba(107,142,123,0.28)' : 'rgba(13,18,19,0.4)',
              transform: `translateY(${(1 - a) * 14}px)`,
            }}>
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- end card ----------
const TsEnd: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const badgeA = clamp((f - 6) / 12);
  const sendA = clamp((f - 72) / 12);
  const buildA = clamp((f - 125) / 12);
  const urlA = clamp((f - 164) / 12);
  const blackout = clamp((f - 232) / 10);
  return (
    <div style={center}>
      <Img src={staticFile('badge.png')} style={{width: 150 * u, height: 150 * u, opacity: badgeA, marginBottom: 28 * u}} />
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 44 * u, letterSpacing: 9 * u, color: WHITE, opacity: badgeA, marginBottom: 40 * u}}>
        LUPTON ASSOCIATES
      </div>
      <div style={{
        fontFamily: FONT, fontWeight: 800, fontSize: 70 * u, letterSpacing: -1, color: SAGE,
        opacity: sendA, transform: `translateY(${(1 - sendA) * 20}px)`, marginBottom: 26 * u,
      }}>
        Send us the print.
      </div>
      <div style={{
        fontFamily: FONT, fontWeight: 600, fontSize: 38 * u, color: WHITE,
        opacity: buildA, transform: `translateY(${(1 - buildA) * 16}px)`, marginBottom: 40 * u,
      }}>
        Let&rsquo;s build it together.
      </div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 38 * u, letterSpacing: 1 * u, color: WHITE, opacity: urlA}}>
        Luptons.com
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#050808', opacity: blackout}} />
    </div>
  );
};

// ---------- burned-in captions, every VO line ----------
const CAPS: {from: number; to: number; text: string}[] = [
  {from: 12, to: 100, text: 'One bracket. Three shops. Three purchase orders.'},
  {from: 108, to: 236, text: 'Cut here.'},
  {from: 243, to: 326, text: 'Formed there.'},
  {from: 333, to: 416, text: 'Coated somewhere else.'},
  {from: 424, to: 566, text: 'And when the holes don’t line up, everyone points at everyone.'},
  {from: 572, to: 752, text: 'We work with shops that cut, form, weld, and finish under one roof.'},
  {from: 756, to: 868, text: 'One print. One project manager.'},
  {from: 871, to: 940, text: 'One shop that owns the fit.'},
  {from: 944, to: 993, text: 'Send us the print.'},
  {from: 997, to: 1032, text: 'Let’s build it together.'},
  {from: 1036, to: 1092, text: 'Luptons.com'},
];

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const cap = CAPS.find((c) => f >= c.from && f <= c.to);
  if (!cap) return null;
  const a = Math.min(clamp((f - cap.from) / 6), clamp((cap.to - f) / 6));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 150 * u, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{
        fontFamily: FONT, fontWeight: 600, fontSize: 34 * u, lineHeight: 1.35,
        color: WHITE, textAlign: 'center', maxWidth: 1480 * u,
        background: 'rgba(0,0,0,0.55)', padding: `${12 * u}px ${28 * u}px`, borderRadius: 8 * u,
      }}>
        {cap.text}
      </div>
    </div>
  );
};

const sfx = (name: string, from: number, volume = 1) => (
  <Sequence key={`${name}-${from}`} from={from}>
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume} />
  </Sequence>
);

export const ThreeShops: React.FC = () => {
  loadInter();
  return (
    <AbsoluteFill style={{background: '#050808'}}>
      <AbsoluteFill style={bgStyle} />
      <Sequence from={0} durationInFrames={105}><TsHook /></Sequence>
      <Sequence from={105} durationInFrames={135}>
        <TsShop src="vid/ts_laser.mp4" rate={1.1} frames={135} po="PO #1" process="CUT" stampAt={22} filter="saturate(0.95)" />
      </Sequence>
      <Sequence from={240} durationInFrames={90}>
        <TsShop src="vid/ts_brake.mp4" rate={1.25} frames={90} po="PO #2" process="FORMED" stampAt={14} filter="saturate(0.9) hue-rotate(-8deg)" />
      </Sequence>
      <Sequence from={330} durationInFrames={90}>
        <TsShop src="vid/ts_coat.mp4" rate={1.25} frames={90} po="PO #3" process="COATED" stampAt={14} filter="saturate(0.9) hue-rotate(10deg)" />
      </Sequence>
      <Sequence from={420} durationInFrames={150}><TsMisfit /></Sequence>
      <Sequence from={570} durationInFrames={300}><TsRoof /></Sequence>
      <Sequence from={870} durationInFrames={240}><TsEnd /></Sequence>

      <Captions />

      {/* music: Prelude and Action — Kevin MacLeod (incompetech.com), CC BY 4.0 — envelope pre-shaped */}
      <Audio src={staticFile('audio/ts_music.wav')} volume={0.46} />
      {/* narration: v9-cloned narrator, two continuous takes */}
      {sfx('TS1', 12, 1.42)}
      {sfx('TS_cut', 125, 1.42)}
      {sfx('TS_form', 252, 1.42)}
      {sfx('TS_coat', 342, 1.42)}
      {sfx('TS_misfit', 426, 1.42)}
      {sfx('TS2', 570, 1.42)}
      {sfx('type_ticks', 6, 0.7)}
      {sfx('subbass', 105)}
      {sfx('stamp', 127, 0.85)}
      {sfx('stamp', 254, 0.85)}
      {sfx('stamp', 344, 0.85)}
      {sfx('subbass', 420, 0.9)}
      {sfx('strike', 480, 0.7)}
      {sfx('riser', 540, 0.7)}
      {sfx('strike', 570, 0.9)}
      {sfx('resolve', 870, 0.9)}
    </AbsoluteFill>
  );
};
