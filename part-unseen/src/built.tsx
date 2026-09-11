import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {WHITE, SAGE} from './theme';
import {FONT, loadInter} from './font';
import {useUnit} from './scenes';

// "BUILT" — Apple-keynote energy: extreme macro process shots with sparks and fast
// camera moves, an exploded-view assembly that slams together, type that lands hard
// on the beat. 120 BPM; every cut sits on the grid the score is built from.

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const BLACK = '#000000';
const outCubic = Easing.out(Easing.cubic);
const outExpo = Easing.out(Easing.exp);

// scene map (frames @30fps) — 0, 4, 7, 10, 13, 19.5, 23, 27.5 s
const T = {laser: 0, brake: 120, weld: 210, coat: 300, apart: 390, slam: 585, hero: 690, end: 825, total: 990};
const XF = 8; // crossfade frames — cuts stay quick

const center: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
};

// ---------- footage, cropped to fill either aspect, with a slow push for extra life ----------
const Shot: React.FC<{src: string; frames: number; rate?: number; vol?: number; filter?: string; push?: number; startFrom?: number}> =
  ({src, frames, rate = 1, vol = 0, filter, push = 0.05, startFrom = 0}) => {
  const f = useCurrentFrame();
  const a = clamp(f / XF);
  const scale = 1 + push * (f / frames);
  return (
    <Sequence from={0} durationInFrames={frames} layout="none">
      <OffthreadVideo
        muted={vol === 0}
        volume={vol}
        playbackRate={rate}
        startFrom={startFrom}
        src={staticFile(src)}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          opacity: a, filter, transform: `scale(${scale})`,
        }}
      />
    </Sequence>
  );
};

// ---------- a word that SLAMS: oversized + blurred, snaps to size, holds, lifts away ----------
const Slam: React.FC<{
  text: string; from: number; to: number; size?: number; accent?: boolean;
  y?: string; from2?: number;
}> = ({text, from, to, size = 104, accent, y = '16%'}) => {
  const f = useCurrentFrame();
  const u = useUnit();
  if (f < from || f > to) return null;
  const tin = clamp((f - from) / 9);
  const tout = clamp((f - (to - 7)) / 7);
  const ein = outExpo(tin);
  const scale = interpolate(ein, [0, 1], [2.2, 1]);
  const blur = (1 - ein) * 26;
  const opacity = Math.min(ein * 1.6, 1) * (1 - tout);
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: y,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: FONT, fontWeight: 800, fontSize: size * u, letterSpacing: -3 * u, lineHeight: 1.05,
        color: accent ? SAGE : WHITE, textAlign: 'center',
        textShadow: '0 4px 40px rgba(0,0,0,0.85)',
        opacity, transform: `scale(${scale}) translateY(${-tout * 22 * u}px)`,
      }}>
        {text}
      </div>
    </div>
  );
};

// ---------- a stacked list that builds line by line ----------
const Stack: React.FC<{
  lines: {text: string; at: number; accent?: boolean}[];
  to: number; size?: number; y?: string;
}> = ({lines, to, size = 58, y = '15%'}) => {
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
            color: l.accent ? SAGE : WHITE, textShadow: '0 4px 40px rgba(0,0,0,0.85)',
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

// ---------- white flash on the assembly impact ----------
const Impact: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const a = f < at ? 0 : Math.max(0, 1 - (f - at) / 11) ** 1.8;
  if (a <= 0) return null;
  return <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', opacity: a * 0.85}} />;
};

// ---------- brand lockup, top-left ----------
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
      <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 20 * u, letterSpacing: 6 * u, color: WHITE}}>
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

export const Built: React.FC = () => {
  loadInter();
  const {width, height} = useVideoConfig();
  const wide = width / height > 1.5;
  return (
    <AbsoluteFill style={{background: BLACK}}>
      {/* ---- the process: extreme macro, sparks, fast camera ---- */}
      <Sequence from={T.laser} durationInFrames={T.brake - T.laser + XF}>
        <Shot src="vid/bu_laser.mp4" frames={T.brake - T.laser + XF} vol={0.26} />
      </Sequence>
      <Sequence from={T.brake} durationInFrames={T.weld - T.brake + XF}>
        <Shot src="vid/bu_brake.mp4" frames={T.weld - T.brake + XF} rate={1.15} vol={0.2} filter="brightness(1.18) contrast(1.05)" />
      </Sequence>
      <Sequence from={T.weld} durationInFrames={T.coat - T.weld + XF}>
        <Shot src="vid/bu_weld.mp4" frames={T.coat - T.weld + XF} rate={1.15} vol={0.24} />
      </Sequence>
      <Sequence from={T.coat} durationInFrames={T.apart - T.coat + XF}>
        <Shot src="vid/bu_coat.mp4" frames={T.apart - T.coat + XF} rate={1.15} vol={0.18} />
      </Sequence>

      {/* ---- the problem: the assembly drifts apart ---- */}
      <Sequence from={T.apart} durationInFrames={T.slam - T.apart + XF}>
        <Shot src="vid/bu_apart.mp4" frames={T.slam - T.apart + XF} rate={0.62} push={0.08} />
      </Sequence>

      {/* ---- the turn: it slams together ---- */}
      <Sequence from={T.slam} durationInFrames={T.hero - T.slam + XF}>
        {/* the clip's own light burst peaks 1.667 s in; startFrom lands it on frame 10
            of this sequence (19.83 s), where the score's hit and the VO turn also sit */}
        <Shot src="vid/bu_slam.mp4" frames={T.hero - T.slam + XF} vol={0.22} push={0.03} startFrom={40} />
        <Impact at={10} />
      </Sequence>

      {/* ---- hero orbit ---- */}
      <Sequence from={T.hero} durationInFrames={T.end - T.hero + XF}>
        <Shot src="vid/bu_hero.mp4" frames={T.end - T.hero + XF} rate={0.92} push={0.04} />
      </Sequence>

      <Sequence from={T.end} durationInFrames={T.total - T.end}><End /></Sequence>

      {/* ---- type: every spoken line is on screen for the muted feed ---- */}
      <Slam text="Cut." from={87} to={T.brake + 4} />
      <Slam text="Formed." from={132} to={T.weld + 4} />
      <Slam text="Welded." from={222} to={T.coat + 4} />
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

      {/* ---- score: 120 BPM, cuts on the grid, hit on the slam ---- */}
      <Audio src={staticFile('audio/bu_music.wav')} volume={0.5} />

      {/* ---- narration: Joe's own recording, one continuous take, sliced at his own
              pauses. The problem section (BU6-8) runs 6% faster so his more deliberate
              read still hands off to the slam line on the beat. ---- */}
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
    </AbsoluteFill>
  );
};
