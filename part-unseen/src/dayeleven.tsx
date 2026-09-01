import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {WHITE, SAGE, GRAY, EYEBROW} from './theme';
import {FONT, loadInter} from './font';
import {useUnit} from './scenes';

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

const center: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
};

const Footage: React.FC<{src: string; rate: number; frames: number; filter?: string}> = ({src, rate, frames, filter}) => {
  const f = useCurrentFrame();
  const enter = clamp(f / 5);
  return (
    <Sequence from={0} durationInFrames={frames} layout="none">
      <OffthreadVideo muted playbackRate={rate} src={staticFile(src)} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: enter, filter,
      }} />
    </Sequence>
  );
};

// ---------- 0-120: empty CNC bay, 6 a.m. ----------
const D1Bay: React.FC = () => (
  <div style={center}>
    <Footage src="vid/day1.mp4" rate={1.25} frames={120} filter="saturate(0.85) brightness(0.96)" />
  </div>
);

// ---------- 120-240: the purchasing desk ----------
const D2Office: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const cardIn = clamp((f - 22) / 8);
  return (
    <div style={center}>
      <Footage src="vid/day2.mp4" rate={1.25} frames={120} filter="saturate(0.8) brightness(0.95)" />
      <div style={{
        position: 'absolute', top: 120 * u, left: 110 * u, width: 520 * u,
        background: 'rgba(16,20,20,0.88)', borderRadius: 12 * u, padding: `${20 * u}px ${26 * u}px`,
        border: '1px solid rgba(143,188,151,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
        opacity: cardIn, transform: `translateY(${(1 - cardIn) * 16}px)`,
      }}>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 20 * u, letterSpacing: 4 * u, color: EYEBROW, textTransform: 'uppercase', marginBottom: 10 * u}}>
          Inbox
        </div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 30 * u, color: WHITE, marginBottom: 6 * u}}>
          RE: RE: RE: Delivery update?
        </div>
        <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 24 * u, color: GRAY, fontStyle: 'italic'}}>
          No reply.
        </div>
      </div>
    </div>
  );
};

// ---------- 240-360: half-loaded truck, golden hour ----------
const D3Truck: React.FC = () => (
  <div style={center}>
    <Footage src="vid/day3.mp4" rate={1.25} frames={120} />
  </div>
);

// ---------- 360-510: the plant that answers ----------
const D4Plant: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const capIn = clamp((f - 15) / 8);
  return (
    <div style={center}>
      <Footage src="vid/day4.mp4" rate={1.0} frames={150} filter="saturate(1.1) brightness(1.02)" />
      <div style={{
        position: 'absolute', top: 90 * u, right: 100 * u,
        fontFamily: FONT, fontWeight: 600, fontSize: 23 * u, letterSpacing: 4 * u,
        color: '#CDD9D2', textTransform: 'uppercase',
        background: 'rgba(13,18,19,0.55)', padding: `${10 * u}px ${18 * u}px`, borderRadius: 8 * u,
        opacity: capIn,
      }}>
        Sheet metal · Stampings · Machining · Plastics · Harnesses
      </div>
    </div>
  );
};

// ---------- 510-600: logo, the ask ----------
const D5End: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const badgeA = clamp((f - 6) / 12);
  const dmA = clamp((f - 100) / 12);
  const buildA = clamp((f - 170) / 12);
  const urlA = clamp((f - 216) / 12);
  const blackout = clamp((f - 255) / 10);
  return (
    <div style={center}>
      <Img src={staticFile('badge.png')} style={{width: 130 * u, height: 130 * u, opacity: badgeA, marginBottom: 28 * u}} />
      <div style={{
        fontFamily: FONT, fontWeight: 700, fontSize: 40 * u, letterSpacing: 8 * u,
        color: WHITE, opacity: badgeA, marginBottom: 34 * u,
      }}>
        LUPTON ASSOCIATES
      </div>
      <div style={{
        fontFamily: FONT, fontWeight: 500, fontSize: 30 * u, color: GRAY,
        opacity: dmA, transform: `translateY(${(1 - dmA) * 16}px)`, marginBottom: 40 * u,
      }}>
        DM me the part family you&rsquo;re worried about.
      </div>
      <div style={{
        fontFamily: FONT, fontWeight: 800, fontSize: 62 * u, letterSpacing: -1, color: SAGE,
        opacity: buildA, transform: `translateY(${(1 - buildA) * 20}px)`, marginBottom: 34 * u,
      }}>
        Let&rsquo;s build it together.
      </div>
      <div style={{
        fontFamily: FONT, fontWeight: 600, fontSize: 27 * u, letterSpacing: 9 * u, color: EYEBROW, opacity: urlA,
      }}>
        LUPTONS.COM
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#050808', opacity: blackout}} />
    </div>
  );
};

// ---------- burned-in captions, safe-zone above the LinkedIn UI ----------
const CAPS: {from: number; to: number; text: string}[] = [
  {from: 8, to: 118, text: 'Day eleven. Your supplier’s gone quiet.'},
  {from: 132, to: 238, text: 'Your customer hasn’t.'},
  {from: 248, to: 358, text: 'Every hour you spend hunting a second source is an hour your competitor doesn’t.'},
  {from: 360, to: 447, text: 'We work with qualified shops all over the U.S.'},
  {from: 452, to: 578, text: 'When your source goes quiet, we already know who runs your part family.'},
  {from: 582, to: 612, text: 'One call.'},
  {from: 618, to: 680, text: 'DM me the part family you’re worried about.'},
  {from: 684, to: 727, text: 'Let’s build it together.'},
  {from: 731, to: 762, text: 'Luptons.com'},
];

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const cap = CAPS.find((c) => f >= c.from && f <= c.to);
  if (!cap) return null;
  const a = Math.min(clamp((f - cap.from) / 6), clamp((cap.to - f) / 6));
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 150 * u,
      display: 'flex', justifyContent: 'center', opacity: a,
    }}>
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

export const DayEleven: React.FC = () => {
  loadInter();
  return (
    <AbsoluteFill style={{background: '#050808'}}>
      <Sequence from={0} durationInFrames={120}><D1Bay /></Sequence>
      <Sequence from={120} durationInFrames={120}><D2Office /></Sequence>
      <Sequence from={240} durationInFrames={120}><D3Truck /></Sequence>
      <Sequence from={360} durationInFrames={150}><D4Plant /></Sequence>
      <Sequence from={510} durationInFrames={270}><D5End /></Sequence>

      <Captions />

      {/* bed: synth drone under shots 1-3, resolves warm at the shot-4 cut; pre-shaped */}
      <Audio src={staticFile('audio/day_drone.wav')} volume={0.5} />
      {/* narration: placeholder v9-cloned narrator — swap public/audio/D1-D5.wav for Joe's recording and re-render */}
      {sfx('D1', 8, 1.42)}
      {sfx('D2', 132, 1.42)}
      {sfx('D3', 248, 1.42)}
      {sfx('D4', 360, 1.42)}
      {sfx('day_beep', 40, 0.5)}
      {sfx('day_beep', 82, 0.4)}
      {sfx('day_buzz', 140, 0.6)}
      {sfx('day_brakes', 246, 0.5)}
      {sfx('day_spindle', 366, 0.45)}
    </AbsoluteFill>
  );
};
