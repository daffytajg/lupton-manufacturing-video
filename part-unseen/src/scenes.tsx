import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig, Img, staticFile, Easing} from 'remotion';
import {WHITE, SAGE, SAGE_DIM, GRAY, EYEBROW, rand} from './theme';
import {FONT} from './font';
import {Bracket, Harness, Block, Board, Housing, ServerSled, MedDevice, TruckModule, DefenseBox} from './parts';
import {MAP_DOTS, PRINCIPALS, HQ, OUTLINE_POINTS} from './usmap';

const HOOK_LINE = "Every product you touched today was made by someone you've never heard of.";

const center: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
};

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// u = design unit scale (px multiplier)
export const useUnit = () => {
  const {width, height} = useVideoConfig();
  return width / height > 1.5 ? width / 1920 : width / 1250;
};

// ---------- Hook 0-120: black; line types in; nothing else moves ----------
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const chars = f < 9 ? 0 : Math.min(HOOK_LINE.length, Math.floor(((f - 9) / 78) * HOOK_LINE.length));
  const done = chars >= HOOK_LINE.length;
  const cursorOn = done ? Math.floor(f / 8) % 2 === 0 : true;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#050808'}}>
      <div style={{...center, padding: `0 ${120 * u}px`}}>
        <div style={{
          fontFamily: FONT, fontWeight: 600, fontSize: 52 * u, lineHeight: 1.5,
          color: WHITE, textAlign: 'center', maxWidth: 1400 * u, letterSpacing: -0.5,
        }}>
          {HOOK_LINE.slice(0, chars)}
          <span style={{opacity: cursorOn ? 1 : 0, color: SAGE}}>▌</span>
        </div>
      </div>
    </div>
  );
};

// ---------- Beat 1, 120-300: five parts, 36f each ----------
const PARTS: {C: React.FC<{p: number}>; label: string}[] = [
  {C: Bracket, label: 'STAMPED.'},
  {C: Harness, label: 'HARNESSED.'},
  {C: Block, label: 'MACHINED.'},
  {C: Board, label: 'POPULATED.'},
  {C: Housing, label: 'MOLDED.'},
];

export const Beat1: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const idx = Math.min(4, Math.floor(f / 36));
  const lf = f - idx * 36;
  const p = clamp(lf / 18);
  const {C, label} = PARTS[idx];
  const stampIn = clamp((lf - 16) / 5);
  const stampScale = interpolate(stampIn, [0, 1], [1.9, 1], {easing: Easing.out(Easing.cubic)});
  const photoIn = clamp((lf - 8) / 10);
  const W = 1120 * u, H = 630 * u;
  return (
    <div style={center}>
      <div style={{width: W, height: H, position: 'relative', borderRadius: 10 * u, overflow: 'hidden'}}>
        <Img src={staticFile(`img/part${idx + 1}.png`)} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          opacity: photoIn, transform: `scale(${1.07 - photoIn * 0.05})`,
        }} />
        <div style={{
          position: 'absolute', left: '50%', top: '50%', width: H, height: H,
          transform: 'translate(-50%,-50%)', opacity: 0.9 - photoIn * 0.62,
        }}>
          <C p={p} />
        </div>
        <div style={{
          position: 'absolute', left: '50%', top: '72%',
          transform: `translate(-50%,-50%) scale(${stampScale}) rotate(-4deg)`,
          opacity: stampIn,
          fontFamily: FONT, fontWeight: 800, fontSize: 74 * u, letterSpacing: 6 * u,
          color: WHITE, border: `${5 * u}px solid ${WHITE}`, padding: `${6 * u}px ${26 * u}px`,
          background: 'rgba(13,18,19,0.55)',
        }}>
          {label}
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 70 * u, fontFamily: FONT, fontWeight: 600,
        fontSize: 24 * u, letterSpacing: 10 * u, color: EYEBROW, textTransform: 'uppercase',
      }}>
        {String(idx + 1).padStart(2, '0')} / 05
      </div>
    </div>
  );
};

// ---------- Beat 2, 300-510 ----------
const PRODUCTS: {C: React.FC<{p: number}>; word: number}[] = [
  {C: ServerSled, word: 0},
  {C: MedDevice, word: 1},
  {C: TruckModule, word: 2},
  {C: DefenseBox, word: 3},
];
const WORDS = ['Datacenter.', 'Medical.', 'Heavy truck.', 'Defense.', 'Robotics.'];

export const Beat2: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  if (f >= 168) {
    // "Same parts. Same sourcing problem." over the dimmed robotics floor
    const a = clamp((f - 168) / 8);
    return (
      <div style={{position: 'absolute', inset: 0}}>
        <Img src={staticFile('img/ind5.png')} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          opacity: a * 0.45, transform: `scale(${1.05 - a * 0.03})`,
        }} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(90% 70% at 50% 50%, rgba(10,15,15,0.45) 0%, rgba(10,15,15,0.85) 100%)', opacity: a}} />
        <div style={center}>
          <div style={{
            fontFamily: FONT, fontWeight: 800, fontSize: 96 * u, letterSpacing: -1.5,
            color: WHITE, textAlign: 'center', lineHeight: 1.25, opacity: a,
            transform: `translateY(${(1 - a) * 26}px)`, maxWidth: 1500 * u,
          }}>
            Same parts.<br /><span style={{color: SAGE}}>Same sourcing problem.</span>
          </div>
        </div>
      </div>
    );
  }
  const idx = Math.min(3, Math.floor(f / 42));
  const lf = f - idx * 42;
  const p = clamp(lf / 16);
  const photoIn = clamp((lf - 3) / 8);
  const envIn = clamp((lf - 21) / 6); // cut to the industry environment mid-beat
  const {C} = PRODUCTS[idx];
  const snap = clamp(f / 8);
  const hi = f >= 150 ? 4 : idx;
  const W = 1240 * u, H = 700 * u;
  return (
    <div style={center}>
      <Img src={staticFile(`img/ind${idx + 1}.png`)} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: envIn, transform: `scale(${1.08 - envIn * 0.05})`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: envIn,
        background: 'linear-gradient(0deg, rgba(10,15,15,0.75) 0%, rgba(10,15,15,0.15) 40%, rgba(10,15,15,0.25) 100%)',
      }} />
      <div style={{width: W, height: H, position: 'relative', borderRadius: 10 * u, overflow: 'hidden', transform: `scale(${0.94 + snap * 0.06})`, opacity: snap * (1 - envIn)}}>
        <Img src={staticFile(`img/prod${idx + 1}.png`)} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          opacity: photoIn, transform: `scale(${1.06 - photoIn * 0.04})`,
        }} />
        <div style={{position: 'absolute', inset: 0, opacity: 0.85 - photoIn * 0.65}}>
          <C p={p} />
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 90 * u, display: 'flex', gap: 26 * u,
        fontFamily: FONT, fontWeight: 700, fontSize: 34 * u,
      }}>
        {WORDS.map((w, i) => (
          <span key={w} style={{
            color: i === hi ? SAGE : GRAY, opacity: i === hi ? 1 : 0.55,
            transform: i === hi ? 'scale(1.08)' : 'scale(1)',
          }}>{w}</span>
        ))}
      </div>
    </div>
  );
};

// ---------- Beat 3, 510-720: shatter -> US scatter map -> 33 points -> converge ----------
export const Beat3: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const {width, height} = useVideoConfig();
  const mapW = Math.min(width * 0.86, height * 1.55);
  const mapScale = mapW / 1000;
  const ox = (width - 1000 * mapScale) / 2;
  const oy = (height - 600 * mapScale) / 2 - 30 * u;

  const px = (pt: [number, number]) => [ox + pt[0] * mapScale, oy + pt[1] * mapScale];

  // background dots: fly from center burst to map positions over f 0-42
  const dots = MAP_DOTS.map((d, i) => {
    const delay = rand(i * 3 + 1) * 12;
    const t = clamp((f - delay) / 30);
    const e = Easing.out(Easing.cubic)(t);
    const [tx, ty] = px(d);
    const ang = rand(i * 7 + 2) * Math.PI * 2;
    const burst = 60 + rand(i * 11 + 3) * 380;
    const sx = width / 2 + Math.cos(ang) * burst * u * 0.3;
    const sy = height / 2 + Math.sin(ang) * burst * u * 0.3;
    return {x: sx + (tx - sx) * e, y: sy + (ty - sy) * e, o: 0.26 + rand(i * 5) * 0.26, r: (2.2 + rand(i * 13) * 2.0) * mapScale * 1.6};
  });

  const outlineP = clamp((f - 8) / 34);

  // principals: appear one by one f 36-126, converge f 126-168
  const conv = clamp((f - 126) / 42);
  const ce = Easing.inOut(Easing.cubic)(conv);
  const [hx, hy] = px(HQ);
  const prins = PRINCIPALS.map((d, i) => {
    const born = 36 + (i / PRINCIPALS.length) * 90;
    const a = clamp((f - born) / 5);
    const [txx, tyy] = px(d);
    return {x: txx + (hx - txx) * ce, y: tyy + (hy - tyy) * ce, a};
  });
  const nodeR = (6 + ce * 22) * mapScale * 1.8;
  const captionA = clamp((f - 132) / 8);
  const dim = f >= 186 ? 0.82 : 1; // hold under hard silence
  const pulse = 1 + 0.06 * Math.sin(f / 3);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: dim}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${ox}, ${oy}) scale(${mapScale})`}>
          <polygon points={OUTLINE_POINTS} pathLength={1} strokeDasharray="1"
            strokeDashoffset={1 - outlineP} fill="none" stroke="#4E605A"
            strokeWidth={2.6} strokeLinejoin="round" opacity={0.5 * (1 - ce * 0.7)} />
        </g>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={WHITE} opacity={d.o * (1 - ce * 0.6)} />
        ))}
        {prins.map((d, i) => {
          const ring = d.a > 0 && d.a < 1 ? (1 - d.a) : 0;
          return (
            <g key={`p${i}`}>
              <circle cx={d.x} cy={d.y} r={5.4 * mapScale * 1.8 * (1 - ce * 0.75)} fill={SAGE} opacity={d.a}
                style={{filter: 'drop-shadow(0 0 9px rgba(143,188,151,0.95))'}} />
              {ring > 0 && (
                <circle cx={d.x} cy={d.y} r={(6 + (1 - ring) * 16) * mapScale * 1.8} fill="none"
                  stroke={SAGE} strokeWidth={2 * mapScale} opacity={ring * 0.8} />
              )}
            </g>
          );
        })}
        <circle cx={hx} cy={hy} r={nodeR * pulse} fill="none" stroke={SAGE} strokeWidth={2.5 * mapScale * 1.6} opacity={ce} />
        <circle cx={hx} cy={hy} r={nodeR * 0.45} fill={SAGE} opacity={ce}
          style={{filter: 'drop-shadow(0 0 18px rgba(143,188,151,1))'}} />
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 100 * u, textAlign: 'center',
        fontFamily: FONT, fontWeight: 800, fontSize: 62 * u, color: WHITE, opacity: captionA,
        transform: `translateY(${(1 - captionA) * 24}px)`, letterSpacing: -1,
      }}>
        33 manufacturers. <span style={{color: SAGE}}>One team knows them all.</span>
      </div>
    </div>
  );
};

// ---------- Beat 4, 720-960: kinetic typography with shake ----------
const PHRASES: [string, string][] = [
  ['Since', '1969.'],
  ['Sheet metal to', 'electronics.'],
  ['Prototype to', 'production.'],
  ['One call.', 'Every capability.'],
];

export const Beat4: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const idx = Math.min(3, Math.floor(f / 60));
  const lf = f - idx * 60;
  const a = clamp(lf / 5);
  const scale = interpolate(a, [0, 1], [2.6, 1], {easing: Easing.out(Easing.cubic)});
  const blur = (1 - a) * 18;
  const shakeAmp = Math.max(0, 1 - lf / 9) * 14 * u;
  const sx = shakeAmp * Math.sin(lf * 12.9 + idx);
  const sy = shakeAmp * Math.sin(lf * 17.3 + idx * 7);
  const [w1, w2] = PHRASES[idx];
  return (
    <div style={{...center, transform: `translate(${sx}px, ${sy}px)`}}>
      <div style={{
        fontFamily: FONT, fontWeight: 800, fontSize: 128 * u, letterSpacing: -2.5,
        color: WHITE, textAlign: 'center', lineHeight: 1.16,
        transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity: a,
      }}>
        {w1}<br /><span style={{color: SAGE}}>{w2}</span>
      </div>
    </div>
  );
};

// ---------- Close, 960-1200 ----------
export const Close: React.FC = () => {
  const f = useCurrentFrame();
  const u = useUnit();
  const {width, height} = useVideoConfig();
  const badge = 190 * u;
  const bx = width / 2, by = height * 0.30;
  const conv = clamp(f / 40);
  const ce = Easing.inOut(Easing.cubic)(conv);
  const particles = Array.from({length: 90}, (_, i) => {
    const ang = rand(i * 3 + 40) * Math.PI * 2;
    const r0 = (0.55 + rand(i * 5 + 9) * 0.6) * Math.min(width, height);
    const sx = bx + Math.cos(ang) * r0;
    const sy = by + Math.sin(ang) * r0;
    const jx = (rand(i * 7 + 4) - 0.5) * badge * 0.9;
    const jy = (rand(i * 9 + 6) - 0.5) * badge * 0.9;
    return {x: sx + (bx + jx - sx) * ce, y: sy + (by + jy - sy) * ce, o: (1 - ce) * 0.9 + 0.05, r: 2 + rand(i) * 3};
  });
  const badgeA = clamp((f - 32) / 16);
  const rows: {t: number; el: React.ReactNode}[] = [
    {t: 60, el: <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 52 * u, letterSpacing: 13 * u, color: WHITE}}>LUPTON&nbsp;&nbsp;ASSOCIATES</div>},
    {t: 84, el: <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 29 * u, letterSpacing: 3 * u, color: GRAY, fontVariant: 'small-caps'}}>The manufacturers behind the products you trust.</div>},
    {t: 114, el: <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 22 * u, letterSpacing: 4 * u, color: SAGE_DIM}}>MOLDING · CASTING · MACHINING · STAMPING · FABRICATION · ELECTRONICS · PROTOTYPING</div>},
    {t: 138, el: <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 30 * u, letterSpacing: 9 * u, color: SAGE}}>LUPTONS.COM</div>},
  ];
  const blackout = f >= 225 ? 1 : 0;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        {particles.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r * u} fill={i % 3 ? WHITE : SAGE} opacity={d.o * (1 - badgeA * 0.85)} />
        ))}
      </svg>
      <Img src={staticFile('badge.png')} style={{
        position: 'absolute', left: bx - badge / 2, top: by - badge / 2,
        width: badge, height: badge, opacity: badgeA,
        transform: `scale(${1.18 - badgeA * 0.18})`,
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, top: by + badge / 2 + 34 * u,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * u,
        textAlign: 'center', padding: `0 ${60 * u}px`,
      }}>
        {rows.map((r, i) => {
          const a = clamp((f - r.t) / 10);
          return (
            <div key={i} style={{opacity: a, transform: `translateY(${(1 - a) * 16}px)`}}>{r.el}</div>
          );
        })}
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: blackout}} />
    </div>
  );
};
