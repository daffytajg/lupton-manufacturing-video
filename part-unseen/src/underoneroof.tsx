import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {BG0, BG1, BG2, WHITE, SAGE, SAGE_DIM, GRAY, EYEBROW, rand} from './theme';
import {FONT, loadInter} from './font';

// "Under One Roof" — built in Lupton's own house system, not a borrowed one.
//
// The four cuts before this chased a black Apple-keynote look and none of them
// landed. This one goes back to what the playbook actually calls the preferred
// style, the one v7 ships: the dark green-charcoal ground with its grid and
// particles, split capability cards with an opaque left panel bleeding into
// footage, full-bleed beats captioned bottom-left, counters on a rule, sage
// paint-swipes over every cut, and the badge end card with the quote button.
//
// Joe's recording is unchanged — same fifteen phrases, re-spaced to the house
// rhythm (~40 s) rather than the 33 s the scrapped cut used.

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const outCubic = Easing.out(Easing.cubic);
const inOut = Easing.inOut(Easing.quad);

// ---------- scene map (frames @30fps) ----------
const T = {
  cold: 0, hook: 30, p1: 132, p2: 186, p3: 258, p4: 342,
  problem: 432, turn: 684, payoff: 768, send: 948, end: 1032, total: 1200,
};

// every major cut gets a swipe
const CUTS = [T.hook, T.p1, T.p2, T.p3, T.p4, T.problem, T.turn, T.payoff, T.send, T.end];

// design unit: one scale for both crops, so type holds its share of the frame
const useUnit = () => {
  const {width, height} = useVideoConfig();
  return width / height > 1.5 ? width / 1920 : width / 1250;
};
const useWide = () => {
  const {width, height} = useVideoConfig();
  return width / height > 1.5;
};

// ---------- the ground ----------
// Radial green-charcoal, a faint 96px grid, ~60 seeded particles. Grain is added
// in the ffmpeg master pass rather than here — it stays cheaper and cleaner.
const Ground: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const u = useUnit();
  const g = 96 * u;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{
        background: `radial-gradient(120% 90% at 50% 30%, ${BG2} 0%, ${BG1} 55%, ${BG0} 100%)`,
      }} />
      <AbsoluteFill style={{
        backgroundImage:
          `repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px ${g}px),` +
          `repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, transparent 1px ${g}px)`,
      }} />
      {Array.from({length: 60}, (_, i) => {
        const sx = rand(i * 3 + 1);
        const sy = rand(i * 7 + 2);
        const sp = 0.25 + rand(i * 11 + 3) * 0.7;
        const size = (1.2 + rand(i * 13 + 4) * 2.2) * u;
        const y = (sy * height - f * sp * u + height) % height;
        return (
          <div key={i} style={{
            position: 'absolute', left: sx * width, top: y,
            width: size, height: size, borderRadius: '50%',
            background: 'rgba(200,225,205,1)',
            opacity: 0.05 + rand(i * 17 + 5) * 0.12,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- the paint swipe ----------
// A dark slab leads by 0.05s, the sage slab follows; 0.44s sweep across frame.
const SWEEP = 13;   // 0.44s
const LEAD = 2;     // 0.05s

const Swipe: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  const slab = (delay: number, color: string) => {
    const p = clamp((f - at + delay) / SWEEP);
    if (p <= 0 || p >= 1) return null;
    // enters from the left, exits right; the slab is 1.35x frame so it covers
    const x = interpolate(inOut(p), [0, 1], [-width * 1.35, width]);
    return <div style={{
      position: 'absolute', left: x, top: 0, width: width * 1.35, height: '100%',
      background: color, transform: 'skewX(-9deg)', transformOrigin: 'top left',
    }} />;
  };
  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      {slab(LEAD, BG0)}
      {slab(0, SAGE_DIM)}
    </AbsoluteFill>
  );
};

// ---------- type primitives ----------
const Eyebrow: React.FC<{children: React.ReactNode; at?: number; over?: boolean}> = ({children, at = 0, over}) => {
  const f = useCurrentFrame();
  const u = useUnit();
  const a = clamp((f - at) / 10);
  return (
    <div style={{
      fontFamily: FONT, fontWeight: 600, fontSize: 26 * u, letterSpacing: 11 * u,
      textTransform: 'uppercase', color: over ? '#A9BFB4' : EYEBROW,
      textShadow: over ? '0 1px 16px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.8)' : undefined,
      opacity: a, transform: `translateY(${(1 - outCubic(a)) * 14 * u}px)`,
    }}>
      {children}
    </div>
  );
};

const Head: React.FC<{
  lines: {text: string; accent?: boolean}[]; at?: number; size?: number; stagger?: number; over?: boolean;
}> = ({lines, at = 0, size = 72, stagger = 8, over}) => {
  const f = useCurrentFrame();
  const u = useUnit();
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      {lines.map((l, i) => {
        const a = clamp((f - at - i * stagger) / 12);
        const e = outCubic(a);
        return (
          <div key={i} style={{
            fontFamily: FONT, fontWeight: 800, fontSize: size * u,
            letterSpacing: -2 * u * (size / 72), lineHeight: 1.14,
            color: l.accent ? SAGE : WHITE,
            textShadow: over ? '0 2px 30px rgba(0,0,0,0.92), 0 0 6px rgba(0,0,0,0.55)' : undefined,
            opacity: a, transform: `translateY(${(1 - e) * 24 * u}px)`,
          }}>
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

const Body: React.FC<{children: React.ReactNode; at?: number; width?: number}> = ({children, at = 0, width = 620}) => {
  const f = useCurrentFrame();
  const u = useUnit();
  const a = clamp((f - at) / 12);
  return (
    <div style={{
      fontFamily: FONT, fontWeight: 400, fontSize: 31 * u, lineHeight: 1.45,
      color: GRAY, maxWidth: width * u,
      opacity: a, transform: `translateY(${(1 - outCubic(a)) * 20 * u}px)`,
    }}>
      {children}
    </div>
  );
};

// counter "01 / 04" over a 640px rule with a 96px sage run
const Counter: React.FC<{n: number; of: number; at?: number}> = ({n, of, at = 0}) => {
  const u = useUnit();
  const f = useCurrentFrame();
  const a = clamp((f - at) / 12);
  return (
    <div style={{opacity: a}}>
      <div style={{
        fontFamily: FONT, fontWeight: 600, fontSize: 21 * u, letterSpacing: 5 * u,
        color: '#A9BFB4', marginBottom: 16 * u,
        textShadow: '0 1px 14px rgba(0,0,0,0.95)',
      }}>
        {String(n).padStart(2, '0')} / {String(of).padStart(2, '0')}
      </div>
      <div style={{position: 'relative', width: 640 * u, height: 2 * u,
        background: 'rgba(255,255,255,0.22)', boxShadow: '0 1px 10px rgba(0,0,0,0.8)'}}>
        <div style={{
          position: 'absolute', left: ((n - 1) / of) * 640 * u, top: 0,
          width: 96 * u, height: 2 * u, background: SAGE,
        }} />
      </div>
    </div>
  );
};

// ---------- footage ----------
const Clip: React.FC<{
  src: string; frames: number; from?: number; rate?: number;
  z?: [number, number]; opacity?: number;
}> = ({src, frames, from = 0, rate = 1, z = [1.04, 1.0], opacity = 1}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = inOut(clamp(f / frames));
  const scale = interpolate(e, [0, 1], z);
  return (
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={Math.round(from * fps)}
      playbackRate={rate}
      muted
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', transform: `scale(${scale})`, opacity,
      }}
    />
  );
};

// ---------- 0-30: cold open, three highest-energy frames ----------
// The playbook's finding: leading with sparks put the attention peak on second 0.
const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();
  const shots = [
    {src: 'vid/uor_laser.mp4', from: 1.4},
    {src: 'vid/uor_weld.mp4', from: 2.0},
    {src: 'vid/uor_brake.mp4', from: 3.2},
  ];
  const i = Math.min(2, Math.floor(f / 10));
  const s = shots[i];
  return (
    <AbsoluteFill style={{background: BG0, overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile(s.src)}
        startFrom={Math.round(s.from * 30)}
        muted
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', transform: 'scale(1.12)'}}
      />
      <AbsoluteFill style={{background: 'rgba(13,18,19,0.18)'}} />
    </AbsoluteFill>
  );
};

// ---------- 30-132: the hook statement ----------
const Hook: React.FC<{frames: number}> = ({frames}) => {
  const u = useUnit();
  const wide = useWide();
  return (
    <AbsoluteFill style={{background: BG0, overflow: 'hidden'}}>
      <Clip src="vid/uor_laser.mp4" frames={frames} from={0.2} z={[1.14, 1.02]} opacity={0.5} />
      <AbsoluteFill style={{
        background: `linear-gradient(90deg, rgba(13,18,19,0.93) 0%, rgba(13,18,19,0.82) 42%, rgba(13,18,19,0.35) 100%)`,
      }} />
      <div style={{
        position: 'absolute', left: (wide ? 130 : 84) * u, top: '50%',
        transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 26 * u,
      }}>
        <div style={{width: 62 * u, height: 3 * u, background: SAGE}} />
        <Head at={6} size={wide ? 76 : 64} lines={[
          {text: 'Every part you buy'},
          {text: 'starts as a print.', accent: true},
        ]} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- the four process beats: full-bleed, captioned bottom-left ----------
const Beat: React.FC<{
  src: string; frames: number; from: number; rate?: number;
  word: string; caption: string; n: number;
}> = ({src, frames, from, rate = 1, word, caption, n}) => {
  const u = useUnit();
  const wide = useWide();
  return (
    <AbsoluteFill style={{background: BG0, overflow: 'hidden'}}>
      <Clip src={src} frames={frames} from={from} rate={rate} z={[1.10, 1.0]} />
      <AbsoluteFill style={{
        background: 'linear-gradient(0deg, rgba(13,18,19,0.95) 0%, rgba(13,18,19,0.78) 18%, rgba(13,18,19,0.42) 34%, rgba(13,18,19,0) 60%)',
      }} />
      <div style={{
        position: 'absolute', left: (wide ? 130 : 84) * u, bottom: (wide ? 96 : 150) * u,
        display: 'flex', flexDirection: 'column', gap: 18 * u,
      }}>
        <Eyebrow at={2} over>{caption}</Eyebrow>
        <Head at={5} size={wide ? 88 : 74} lines={[{text: word}]} over />
        <div style={{marginTop: 10 * u}}><Counter n={n} of={4} at={8} /></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- split capability card ----------
// Wide: opaque panel left, diagonal gradient into footage right (the v7 layout).
// Tall: footage on top, panel beneath — the same idea, stacked.
const Card: React.FC<{
  src: string; frames: number; from?: number; rate?: number;
  eyebrow: string; lines: {text: string; accent?: boolean}[]; body?: React.ReactNode;
  headAt?: number; stagger?: number;
}> = ({src, frames, from = 0, rate = 1, eyebrow, lines, body, headAt = 8, stagger = 34}) => {
  const u = useUnit();
  const wide = useWide();
  const f = useCurrentFrame();
  const panel = wide ? 0.52 : 1;
  const enter = outCubic(clamp(f / 14));

  const footage = (
    <div style={{
      position: 'absolute',
      left: wide ? `${panel * 100}%` : 0,
      top: 0,
      width: wide ? `${(1 - panel) * 100}%` : '100%',
      height: wide ? '100%' : '52%',
      overflow: 'hidden',
    }}>
      <Clip src={src} frames={frames} from={from} rate={rate} z={[1.06, 1.0]} />
      <AbsoluteFill style={{
        background: wide
          ? `linear-gradient(100deg, ${BG0} 0%, rgba(13,18,19,0.72) 26%, rgba(13,18,19,0) 62%)`
          : `linear-gradient(180deg, rgba(13,18,19,0) 55%, rgba(13,18,19,0.85) 88%, ${BG0} 100%)`,
      }} />
    </div>
  );

  return (
    <AbsoluteFill style={{background: BG0, overflow: 'hidden'}}>
      <Ground />
      {footage}
      <div style={{
        position: 'absolute',
        left: 0, top: wide ? 0 : '48%',
        width: wide ? `${panel * 100}%` : '100%',
        height: wide ? '100%' : '52%',
        background: wide
          ? `linear-gradient(90deg, ${BG0} 0%, ${BG0} 86%, rgba(13,18,19,0.94) 100%)`
          : 'transparent',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: `0 ${(wide ? 130 : 84) * u}px`,
        gap: 24 * u,
        opacity: enter,
      }}>
        <Eyebrow at={2}>{eyebrow}</Eyebrow>
        <Head at={headAt} size={wide ? 54 : 50} stagger={stagger} lines={lines} />
        {body ? <div style={{marginTop: 8 * u}}><Body at={headAt + stagger * lines.length + 4} width={wide ? 560 : 900}>{body}</Body></div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------- full-bleed statement ----------
const Statement: React.FC<{
  lines: {text: string; accent?: boolean}[]; eyebrow?: string;
  src?: string; frames: number; from?: number; chips?: string[];
}> = ({lines, eyebrow, src, frames, from = 0, chips}) => {
  const u = useUnit();
  const wide = useWide();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: BG0, overflow: 'hidden'}}>
      <Ground />
      {src ? (
        <>
          <Clip src={src} frames={frames} from={from} z={[1.10, 1.0]} opacity={0.42} />
          <AbsoluteFill style={{background: 'rgba(13,18,19,0.5)'}} />
        </>
      ) : null}
      <div style={{
        position: 'absolute', left: (wide ? 130 : 84) * u, top: '50%',
        transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 24 * u,
      }}>
        {eyebrow ? <Eyebrow at={2}>{eyebrow}</Eyebrow> : <div style={{width: 62 * u, height: 3 * u, background: SAGE}} />}
        <Head at={6} size={wide ? 86 : 70} stagger={10} lines={lines} />
        {chips ? (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: `${10 * u}px ${18 * u}px`, marginTop: 14 * u,
            opacity: clamp((f - 30) / 12),
          }}>
            {chips.map((c, i) => (
              <span key={i} style={{
                fontFamily: FONT, fontWeight: 600, fontSize: 22 * u, letterSpacing: 6 * u,
                textTransform: 'uppercase', color: EYEBROW,
              }}>
                {c}{i < chips.length - 1 ? '  ·' : ''}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------- the end card ----------
const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const wide = useWide();
  const step = (at: number) => {
    const a = clamp((f - at) / 13);
    return {opacity: a, transform: `translateY(${(1 - outCubic(a)) * 18 * u}px)`};
  };
  return (
    <AbsoluteFill style={{background: BG0}}>
      <Ground />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <Img src={staticFile('badge.png')} style={{
          width: 150 * u, height: 150 * u, marginBottom: 40 * u, ...step(4),
        }} />
        <div style={{
          fontFamily: FONT, fontWeight: 700, fontSize: 46 * u, letterSpacing: 13 * u,
          color: WHITE, marginBottom: 34 * u, ...step(12),
        }}>
          LUPTON ASSOCIATES
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 400, fontSize: 31 * u, lineHeight: 1.5,
          color: GRAY, textAlign: 'center', maxWidth: (wide ? 900 : 1000) * u, ...step(20),
        }}>
          Cut, formed, welded and finished in the same shop.<br />
          Send the drawing, part details, annual volume and timing —<br />
          we come back with a feasibility estimate.
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 800, fontSize: 40 * u, letterSpacing: -0.9 * u,
          color: SAGE, marginTop: 40 * u, ...step(62),
        }}>
          Let&rsquo;s build it together.
        </div>
        <div style={{
          marginTop: 38 * u, padding: `${20 * u}px ${44 * u}px`, borderRadius: 8 * u,
          background: `linear-gradient(180deg, #84AC8E 0%, ${SAGE_DIM} 100%)`,
          fontFamily: FONT, fontWeight: 700, fontSize: 28 * u, color: '#0D1213',
          ...step(74),
        }}>
          Request a Quote &rarr;
        </div>
        <div style={{
          marginTop: 34 * u, fontFamily: FONT, fontWeight: 600, fontSize: 24 * u,
          letterSpacing: 9 * u, color: EYEBROW, ...step(86),
        }}>
          LUPTONS.COM
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- audio helpers ----------
const vo = (name: string, from: number, volume = 1.45) => (
  <Sequence key={`v${name}`} from={from}><Audio src={staticFile(`audio/${name}.wav`)} volume={volume} /></Sequence>
);
const sfx = (name: string, from: number, volume = 1) => (
  <Sequence key={`s${name}${from}`} from={from}><Audio src={staticFile(`audio/${name}.wav`)} volume={volume} /></Sequence>
);

export const UnderOneRoof: React.FC = () => {
  loadInter();
  return (
    <AbsoluteFill style={{background: BG0}}>
      <Sequence from={T.cold} durationInFrames={T.hook}><ColdOpen /></Sequence>

      <Sequence from={T.hook} durationInFrames={T.p1 - T.hook}>
        <Hook frames={T.p1 - T.hook} />
      </Sequence>

      <Sequence from={T.p1} durationInFrames={T.p2 - T.p1}>
        <Beat src="vid/uor_laser.mp4" frames={T.p2 - T.p1} from={0.4}
          word="Cut." caption="Laser cutting" n={1} />
      </Sequence>
      <Sequence from={T.p2} durationInFrames={T.p3 - T.p2}>
        <Beat src="vid/uor_brake.mp4" frames={T.p3 - T.p2} from={1.5} rate={0.9}
          word="Formed." caption="Press brake forming" n={2} />
      </Sequence>
      <Sequence from={T.p3} durationInFrames={T.p4 - T.p3}>
        <Beat src="vid/uor_weld.mp4" frames={T.p4 - T.p3} from={0.4}
          word="Welded." caption="TIG, MIG and spot" n={3} />
      </Sequence>
      <Sequence from={T.p4} durationInFrames={T.problem - T.p4}>
        <Beat src="vid/uor_heroA.mp4" frames={T.problem - T.p4} from={0.2} rate={0.9}
          word="Finished." caption="Off the line" n={4} />
      </Sequence>

      {/* the problem, as a capability card inverted: what the usual way costs */}
      <Sequence from={T.problem} durationInFrames={T.turn - T.problem}>
        <Card src="vid/uor_heroB_x.mp4" frames={T.turn - T.problem} from={0.1} rate={1}
          eyebrow="The usual way"
          lines={[
            {text: 'Four shops.'},
            {text: 'Four purchase orders.'},
            {text: 'Four people to call.', accent: true},
          ]}
          headAt={10} stagger={58}
          body={'\u2014 and none of them owns it when the holes don\u2019t line up.'}
        />
      </Sequence>

      <Sequence from={T.turn} durationInFrames={T.payoff - T.turn}>
        <Statement frames={T.payoff - T.turn} src="vid/uor_weld.mp4" from={2.1}
          eyebrow="In the same shop"
          lines={[{text: 'We do it'}, {text: 'under one roof.', accent: true}]}
        />
      </Sequence>

      <Sequence from={T.payoff} durationInFrames={T.send - T.payoff}>
        <Card src="vid/uor_heroA_x.mp4" frames={T.send - T.payoff} from={0.1} rate={0.82}
          eyebrow="What that buys you"
          lines={[
            {text: 'One print.'},
            {text: 'One project manager.'},
            {text: 'One team that owns the fit.', accent: true},
          ]}
          headAt={10} stagger={46}
          body="Quoted directly by the shop that runs the work."
        />
      </Sequence>

      <Sequence from={T.send} durationInFrames={T.end - T.send}>
        <Statement frames={T.end - T.send}
          lines={[{text: 'Send us'}, {text: 'the print.', accent: true}]}
          chips={['Part details', 'Material', 'Annual volume', 'Timing']}
        />
      </Sequence>

      <Sequence from={T.end} durationInFrames={T.total - T.end}><EndCard /></Sequence>

      {/* sage paint-swipe over every major cut */}
      {CUTS.map((c) => <Swipe key={`w${c}`} at={c - LEAD} />)}

      <Audio src={staticFile('audio/uor_music.wav')} volume={0.42} />

      {/* Joe's own recording, re-spaced to the house rhythm */}
      {vo('BU1', 39)}
      {vo('BU2', 141)}
      {vo('BU3', 195)}
      {vo('BU4', 267)}
      {vo('BU5', 351)}
      {vo('BU6', 441)}
      {vo('BU7', 504)}
      {vo('BU8', 555)}
      {vo('BU9', 690)}
      {vo('BU10', 780)}
      {vo('BU11', 813)}
      {vo('BU12', 861)}
      {vo('BU13', 957)}
      {vo('BU14', 1050)}
      {vo('BU15', 1113)}

      {CUTS.map((c) => sfx('whoosh', c - LEAD, 0.34))}
      {sfx('subbass', T.hook, 0.4)}
      {sfx('strike', T.turn, 0.42)}
      {sfx('resolve', T.end, 0.4)}
    </AbsoluteFill>
  );
};
