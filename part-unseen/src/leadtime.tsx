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

const HOOK = '"What’s the lead time?"';

// ---------- 0-102: black; the question types in ----------
const LtHook: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const chars = f < 6 ? 0 : Math.min(HOOK.length, Math.floor(((f - 6) / 54) * HOOK.length));
  const done = chars >= HOOK.length;
  const cursorOn = done ? Math.floor(f / 8) % 2 === 0 : true;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#050808'}}>
      <div style={{...center, padding: `0 ${120 * u}px`}}>
        <div style={{
          fontFamily: FONT, fontWeight: 700, fontSize: 76 * u, lineHeight: 1.35,
          color: WHITE, textAlign: 'center', maxWidth: 1400 * u, letterSpacing: -1,
        }}>
          {HOOK.slice(0, chars)}
          <span style={{opacity: cursorOn ? 1 : 0, color: SAGE}}>▌</span>
        </div>
      </div>
    </div>
  );
};

// ---------- 102-300: shop take; the quoted number climbs 14 -> 22 ----------
const LtQuote: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const enter = clamp(f / 6);
  const weeks = Math.floor(interpolate(f, [140, 210], [14, 22], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const late = weeks >= 22;
  const numIn = clamp((f - 20) / 10);
  const subIn = clamp((f - 200) / 10);
  return (
    <div style={center}>
      <OffthreadVideo muted playbackRate={1.08} src={staticFile('vid/shop.mp4')} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: enter,
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: enter,
        background: 'linear-gradient(0deg, rgba(10,15,15,0.72) 0%, rgba(10,15,15,0.18) 50%, rgba(10,15,15,0.3) 100%)',
      }} />
      <div style={{position: 'absolute', left: 130 * u, bottom: 150 * u, opacity: numIn}}>
        <div style={{
          fontFamily: FONT, fontWeight: 600, fontSize: 26 * u, letterSpacing: 11 * u,
          color: EYEBROW, textTransform: 'uppercase', marginBottom: 18 * u,
        }}>
          Quoted lead time
        </div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 148 * u, letterSpacing: -3, lineHeight: 1, color: late ? SAGE : WHITE}}>
          {weeks} weeks
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 500, fontSize: 33 * u, color: GRAY,
          marginTop: 22 * u, opacity: subIn, transform: `translateY(${(1 - subIn) * 20}px)`,
        }}>
          Nobody puts that in the cost comparison.
        </div>
      </div>
    </div>
  );
};

// ---------- 300-435: the cascade — late bracket, late harness ----------
const CASCADE: {img: string; text: React.ReactNode}[] = [
  {img: 'img/part1.png', text: <>A late <span style={{color: SAGE}}>bracket</span> holds the enclosure.</>},
  {img: 'img/part2.png', text: <>A late <span style={{color: SAGE}}>harness</span> holds the build.</>},
];

const LtCascade: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  return (
    <div style={{...center, gap: 56 * u}}>
      {CASCADE.map((row, i) => {
        const a = clamp((f - i * 62) / 10);
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 52 * u,
            opacity: a, transform: `translateY(${(1 - a) * 26}px)`,
          }}>
            <div style={{
              width: 380 * u, height: 214 * u, borderRadius: 10 * u, overflow: 'hidden',
              border: '1px solid rgba(143,188,151,0.3)', boxShadow: '0 24px 70px rgba(0,0,0,0.6)', flexShrink: 0,
            }}>
              <Img src={staticFile(row.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 56 * u, letterSpacing: -1, color: WHITE, maxWidth: 820 * u, lineHeight: 1.2}}>
              {row.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- 435-675: three checks over the slow robot line ----------
const CHECKS = [
  'They run your part family.',
  'An engineer reviewed the print.',
  'Project manager, not a sales inbox.',
];

const LtChecks: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const enter = clamp(f / 5);
  return (
    <div style={center}>
      <Sequence from={0} durationInFrames={210} layout="none">
        <OffthreadVideo muted playbackRate={0.63} src={staticFile('vid/ind5.mp4')} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: enter * 0.4,
        }} />
      </Sequence>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(90% 70% at 50% 50%, rgba(10,15,15,0.35) 0%, rgba(10,15,15,0.8) 100%)'}} />
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: 44 * u, maxWidth: 1360 * u}}>
        <div style={{
          fontFamily: FONT, fontWeight: 600, fontSize: 26 * u, letterSpacing: 11 * u,
          color: EYEBROW, textTransform: 'uppercase', opacity: clamp((f - 4) / 8), marginBottom: 10 * u,
        }}>
          Lead time is honest when
        </div>
        {CHECKS.map((line, i) => {
          const at = 14 + i * 70;
          const a = clamp((f - at) / 7);
          const scale = interpolate(a, [0, 1], [1.14, 1], {easing: Easing.out(Easing.cubic)});
          const current = f < 14 + (i + 1) * 70 || i === 2;
          return (
            <div key={line} style={{
              display: 'flex', alignItems: 'baseline', gap: 30 * u,
              opacity: a * (current ? 1 : 0.45), transform: `scale(${scale})`, transformOrigin: 'left center',
            }}>
              <span style={{fontFamily: FONT, fontWeight: 600, fontSize: 30 * u, color: SAGE, letterSpacing: 3 * u}}>
                0{i + 1}
              </span>
              <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 62 * u, letterSpacing: -1, color: WHITE, lineHeight: 1.15}}>
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 675-753: the payoff ----------
const LtHolds: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const a = clamp(f / 7);
  return (
    <div style={center}>
      <div style={{
        fontFamily: FONT, fontWeight: 800, fontSize: 110 * u, letterSpacing: -2,
        color: WHITE, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 26}px)`,
      }}>
        Then the number <span style={{color: SAGE}}>holds.</span>
      </div>
    </div>
  );
};

// ---------- 753-900: end card ----------
const LtEnd: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const badgeA = clamp(f / 10);
  const nameA = clamp((f - 12) / 10);
  const headA = clamp((f - 26) / 10);
  const bodyA = clamp((f - 40) / 10);
  const urlA = clamp((f - 54) / 10);
  const blackout = clamp((f - 100) / 10);
  return (
    <div style={center}>
      <Img src={staticFile('badge.png')} style={{width: 170 * u, height: 170 * u, opacity: badgeA, marginBottom: 34 * u}} />
      <div style={{
        fontFamily: FONT, fontWeight: 800, fontSize: 52 * u, letterSpacing: 10 * u,
        color: WHITE, opacity: nameA, marginBottom: 40 * u,
      }}>
        LUPTON ASSOCIATES
      </div>
      <div style={{
        fontFamily: FONT, fontWeight: 800, fontSize: 76 * u, letterSpacing: -1,
        color: SAGE, opacity: headA, transform: `translateY(${(1 - headA) * 22}px)`, marginBottom: 22 * u,
      }}>
        Send us the print.
      </div>
      <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 34 * u, color: GRAY, opacity: bodyA, marginBottom: 52 * u}}>
        A realistic number in 24 hours.
      </div>
      <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 27 * u, letterSpacing: 9 * u, color: EYEBROW, opacity: urlA}}>
        LUPTONS.COM
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#050808', opacity: blackout}} />
    </div>
  );
};

const sfx = (name: string, from: number, volume = 1) => (
  <Sequence key={`${name}-${from}`} from={from}>
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume} />
  </Sequence>
);

export const LeadTime: React.FC = () => {
  loadInter();
  return (
    <AbsoluteFill style={{background: '#050808'}}>
      <AbsoluteFill style={bgStyle} />

      <Sequence from={0} durationInFrames={108}><LtHook /></Sequence>
      <Sequence from={108} durationInFrames={276}><LtQuote /></Sequence>
      <Sequence from={384} durationInFrames={126}><LtCascade /></Sequence>
      <Sequence from={510} durationInFrames={210}><LtChecks /></Sequence>
      <Sequence from={720} durationInFrames={66}><LtHolds /></Sequence>
      <Sequence from={786} durationInFrames={114}><LtEnd /></Sequence>

      {/* music: Prelude and Action — Kevin MacLeod (incompetech.com), CC BY 4.0 — envelope pre-shaped */}
      <Audio src={staticFile('audio/lt_music.wav')} volume={0.46} />
      {/* narration: v9-cloned narrator, scene-locked */}
      {sfx('LT1', 15, 1.42)}
      {sfx('LT2', 249, 1.42)}
      {sfx('LT3', 390, 1.42)}
      {sfx('LT4', 519, 1.42)}
      {sfx('LT5', 729, 1.42)}
      {sfx('LT6', 795, 1.42)}
      {sfx('type_ticks', 6, 0.7)}
      {sfx('subbass', 108)}
      {sfx('tick', 252, 0.5)}
      {sfx('tick', 274, 0.5)}
      {sfx('tick', 296, 0.5)}
      {sfx('tick', 318, 0.5)}
      {sfx('stamp', 386, 0.85)}
      {sfx('stamp', 448, 0.85)}
      {sfx('strike', 524, 0.9)}
      {sfx('strike', 594, 0.9)}
      {sfx('strike', 664, 0.9)}
      {sfx('riser', 690, 0.6)}
      {sfx('subbass', 720, 0.9)}
      {sfx('resolve', 786, 0.9)}
    </AbsoluteFill>
  );
};
