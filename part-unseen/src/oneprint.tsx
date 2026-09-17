import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {WHITE, SAGE} from './theme';
import {FONT, loadInter} from './font';
import {useUnit} from './scenes';

// "One Print" — Apple product-film rules: black void, one hero object, one loud color (the
// powder coat + the closing line), brand type only, invisible cuts on the beat, sparse sound.

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const BLACK = '#000000';
const easeOut = Easing.out(Easing.cubic);

// cuts land on whole seconds so the edit and the score share one grid
const T = {print: 0, blank: 60, cut: 150, form: 270, weld: 390, coat: 510, roof: 630, end: 720, total: 900};
const XF = 10; // crossfade frames over the previous shot

const center: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
};

// ---------- footage shot: fades in over whatever is under it ----------
const Shot: React.FC<{src: string; rate?: number; frames: number; vol?: number}> = ({src, rate = 1, frames, vol = 0}) => {
  const f = useCurrentFrame();
  const a = clamp(f / XF);
  return (
    <Sequence from={0} durationInFrames={frames} layout="none">
      <OffthreadVideo
        muted={vol === 0}
        volume={vol}
        playbackRate={rate}
        src={staticFile(src)}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: a}}
      />
    </Sequence>
  );
};

// ---------- one word at a time; slides up out of a blur, leaves upward ----------
const Word: React.FC<{text: string; from: number; to: number; accent?: boolean; size?: number}> =
  ({text, from, to, accent, size = 92}) => {
  const f = useCurrentFrame();
  const u = useUnit();
  if (f < from || f > to) return null;
  const tin = clamp((f - from) / 13);
  const tout = clamp((f - (to - 8)) / 8);
  const ein = easeOut(tin);
  const eout = Easing.in(Easing.quad)(tout);
  const y = (1 - ein) * 30 * u - eout * 18 * u;
  const opacity = ein * (1 - eout);
  const blur = (1 - ein) * 10;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: '15%',
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: FONT, fontWeight: 800, fontSize: size * u, letterSpacing: -2.5 * u, lineHeight: 1.1,
        color: accent ? SAGE : WHITE, textAlign: 'center',
        opacity, transform: `translateY(${y}px)`, filter: `blur(${blur}px)`,
      }}>
        {text}
      </div>
    </div>
  );
};

// ---------- 0-60: the print. Flat pattern of the bracket draws itself on black ----------
const Print: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  // each element draws on with its own start; strokeDashoffset via pathLength=1
  const draw = (start: number, dur: number) => 1 - easeOut(clamp((f - start) / dur));
  const s: React.CSSProperties = {fill: 'none', stroke: WHITE, strokeWidth: 2.4, strokeLinecap: 'round'};
  const dim: React.CSSProperties = {...s, strokeWidth: 1.2, opacity: 0.55};
  const fadeOut = 1 - clamp((f - (T.blank - T.print + 2)) / XF);
  const h = 560 * u;
  return (
    <div style={{...center, opacity: fadeOut}}>
      <svg width={h * 400 / 520} height={h} viewBox="0 0 400 520" style={{overflow: 'visible'}}>
        {/* outline */}
        <rect x="40" y="40" width="320" height="440" rx="16" pathLength={1} style={s}
          strokeDasharray={1} strokeDashoffset={draw(4, 26)} />
        {/* bend line */}
        <line x1="40" y1="200" x2="360" y2="200" pathLength={1}
          style={{...s, strokeWidth: 1.6, opacity: 0.8}} strokeDasharray="0.03 0.025" strokeDashoffset={draw(22, 14) + 1} />
        {/* flange holes */}
        {[[90, 120], [310, 120]].map(([cx, cy], i) => (
          <circle key={`f${i}`} cx={cx} cy={cy} r="14" pathLength={1} style={s}
            strokeDasharray={1} strokeDashoffset={draw(26 + i * 3, 12)} />
        ))}
        {/* base holes */}
        {[[90, 280], [310, 280], [90, 440], [310, 440]].map(([cx, cy], i) => (
          <circle key={`b${i}`} cx={cx} cy={cy} r="14" pathLength={1} style={s}
            strokeDasharray={1} strokeDashoffset={draw(30 + i * 3, 12)} />
        ))}
        {/* slot */}
        <rect x="160" y="349" width="80" height="22" rx="11" pathLength={1} style={s}
          strokeDasharray={1} strokeDashoffset={draw(40, 12)} />
        {/* dimension ticks */}
        <g style={{opacity: clamp((f - 44) / 10)}}>
          <line x1="40" y1="500" x2="360" y2="500" style={dim} />
          <line x1="40" y1="492" x2="40" y2="508" style={dim} />
          <line x1="360" y1="492" x2="360" y2="508" style={dim} />
          <line x1="382" y1="40" x2="382" y2="480" style={dim} />
          <line x1="374" y1="40" x2="390" y2="40" style={dim} />
          <line x1="374" y1="480" x2="390" y2="480" style={dim} />
          <line x1="374" y1="200" x2="390" y2="200" style={dim} />
        </g>
      </svg>
    </div>
  );
};

// ---------- 630-720: the lineup. Four parts slide in; the coated bracket is the only color ----------
const PARTS = ['img/op_coat.png', 'img/op_housing.png', 'img/op_harness.png', 'img/op_molded.png'];
const Roof: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const {width, height} = useVideoConfig();
  const wide = width / height > 1.5; // 16:9 → one row; 4:5 → 2x2
  const size = wide ? 430 * u : 470 * u;
  const eyebrow = clamp((f - 34) / 10);
  return (
    <div style={{...center, background: BLACK}}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center',
        width: wide ? size * 4 + 60 * u : size * 2 + 20 * u, marginBottom: 120 * u,
      }}>
        {PARTS.map((src, i) => {
          const t = easeOut(clamp((f - 2 - i * 5) / 16));
          return (
            <div key={src} style={{
              width: size, height: size * 0.72, overflow: 'hidden',
              opacity: t, transform: `translateX(${(1 - t) * 140 * u}px)`,
            }}>
              <Img src={staticFile(src)} style={{
                width: '100%', height: '100%', objectFit: 'cover',
                WebkitMaskImage: 'radial-gradient(ellipse 50% 56% at 50% 50%, #000 38%, transparent 88%)',
                maskImage: 'radial-gradient(ellipse 50% 56% at 50% 50%, #000 38%, transparent 88%)',
              }} />
            </div>
          );
        })}
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: '8.5%', textAlign: 'center',
        fontFamily: FONT, fontWeight: 600, fontSize: 22 * u, letterSpacing: 6 * u, textTransform: 'uppercase',
        color: '#7E948A', opacity: eyebrow,
      }}>
        Sheet metal · Machining · Plastics · Harnesses
      </div>
    </div>
  );
};

// ---------- brand lockup, top-left, from the lineup onward ----------
const Lockup: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame();
  const u = useUnit();
  const a = clamp((f - from) / 12);
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', top: 72 * u, left: 84 * u, display: 'flex', alignItems: 'center', gap: 14 * u, opacity: a}}>
      <Img src={staticFile('badge.png')} style={{width: 40 * u, height: 40 * u}} />
      <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 21 * u, letterSpacing: 6 * u, color: WHITE}}>
        LUPTON ASSOCIATES
      </span>
    </div>
  );
};

// ---------- 720-900: end card. One line at a time, then the close holds ----------
const End: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const send = {in: clamp((f - 10) / 12), out: clamp((f - 66) / 8)};
  const build = clamp((f - 78) / 14);
  const url = clamp((f - 126) / 12);
  const badge = clamp((f - 78) / 14);
  const rise = (t: number) => (1 - easeOut(t)) * 26 * u;
  return (
    <div style={{...center, background: BLACK}}>
      <div style={{
        position: 'absolute', fontFamily: FONT, fontWeight: 800, fontSize: 92 * u, letterSpacing: -2.5 * u, color: WHITE,
        opacity: easeOut(send.in) * (1 - send.out), transform: `translateY(${rise(send.in) - send.out * 18 * u}px)`,
        filter: `blur(${(1 - easeOut(send.in)) * 10}px)`,
      }}>
        Send us the print.
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: build > 0 ? 1 : 0}}>
        <Img src={staticFile('badge.png')} style={{width: 84 * u, height: 84 * u, marginBottom: 44 * u, opacity: easeOut(badge), transform: `translateY(${rise(badge)}px)`}} />
        <div style={{
          fontFamily: FONT, fontWeight: 800, fontSize: 84 * u, letterSpacing: -2.5 * u, color: SAGE, lineHeight: 1.1,
          opacity: easeOut(build), transform: `translateY(${rise(build)}px)`, filter: `blur(${(1 - easeOut(build)) * 10}px)`,
        }}>
          Let&rsquo;s build it together.
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 600, fontSize: 40 * u, letterSpacing: 2 * u, color: WHITE, marginTop: 36 * u,
          opacity: easeOut(url), transform: `translateY(${rise(url)}px)`,
        }}>
          Luptons.com
        </div>
      </div>
    </div>
  );
};

const sfx = (name: string, from: number, volume = 1) => (
  <Sequence key={`${name}-${from}`} from={from}>
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume} />
  </Sequence>
);

export const OnePrint: React.FC = () => {
  loadInter();
  return (
    <AbsoluteFill style={{background: BLACK}}>
      <Sequence from={T.print} durationInFrames={T.blank - T.print + XF + 2}><Print /></Sequence>
      <Sequence from={T.blank} durationInFrames={T.cut - T.blank + XF}><Shot src="vid/op_blank.mp4" frames={T.cut - T.blank + XF} /></Sequence>
      <Sequence from={T.cut} durationInFrames={T.form - T.cut + XF}><Shot src="vid/op_cut.mp4" rate={1.25} frames={T.form - T.cut + XF} vol={0.22} /></Sequence>
      <Sequence from={T.form} durationInFrames={T.weld - T.form + XF}><Shot src="vid/op_form.mp4" rate={1.25} frames={T.weld - T.form + XF} vol={0.18} /></Sequence>
      <Sequence from={T.weld} durationInFrames={T.coat - T.weld + XF}><Shot src="vid/op_weld.mp4" rate={1.25} frames={T.coat - T.weld + XF} vol={0.22} /></Sequence>
      <Sequence from={T.coat} durationInFrames={T.roof - T.coat + XF}><Shot src="vid/op_coat.mp4" rate={1.25} frames={T.roof - T.coat + XF} /></Sequence>
      <Sequence from={T.roof} durationInFrames={T.end - T.roof}><Roof /></Sequence>
      <Sequence from={T.end} durationInFrames={T.total - T.end}><End /></Sequence>

      {/* the words are the captions: every spoken phrase is on screen as type */}
      <Word text="One print." from={14} to={T.cut - 4} />
      <Word text="Cut." from={T.cut + 8} to={T.form - 4} />
      <Word text="Formed." from={T.form + 8} to={T.weld - 4} />
      <Word text="Welded." from={T.weld + 8} to={T.coat - 4} />
      <Word text="Finished." from={T.coat + 14} to={T.roof - 4} />
      <Word text="Under one roof." from={T.roof + 10} to={T.end - 2} />
      <Lockup from={T.roof + 12} />

      {/* score: one pulse per second, chords every 4 s, hit on the color beat, resolve under the close */}
      <Audio src={staticFile('audio/op_music.wav')} volume={0.55} />
      {/* narration: one continuous cloned take, split only at the narrator's own pauses */}
      {sfx('OP1', 18, 1.4)}
      {sfx('OP2', T.cut + 10, 1.4)}
      {sfx('OP3', T.form + 10, 1.4)}
      {sfx('OP4', T.weld + 10, 1.4)}
      {sfx('OP5', T.coat + 16, 1.4)}
      {sfx('OP6', T.roof + 12, 1.4)}
      {sfx('OP7', T.end + 14, 1.4)}
      {sfx('OP8', T.end + 82, 1.4)}
      {sfx('OP9', T.end + 130, 1.4)}
      {/* only the hits that matter */}
      {sfx('subbass', T.cut, 0.5)}
      {sfx('snap', T.form + 24, 0.45)}
      {sfx('resolve', T.end, 0.55)}
    </AbsoluteFill>
  );
};
