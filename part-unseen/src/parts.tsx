import React from 'react';
import {SAGE, WHITE, SAGE_DIM} from './theme';

// A stroke that draws itself as p goes 0 -> 1.
export const Draw: React.FC<{
  d?: string;
  points?: string;
  p: number;
  delay?: number; // fraction of total progress before this stroke starts
  span?: number; // fraction of total progress this stroke occupies
  color?: string;
  w?: number;
  fillAt?: number; // progress at which a faint fill fades in
  fill?: string;
  el?: 'path' | 'polyline' | 'polygon';
}> = ({d, points, p, delay = 0, span = 1, color = WHITE, w = 3, fillAt, fill, el = 'path'}) => {
  const lp = Math.max(0, Math.min(1, (p - delay) / span));
  const fillOpacity = fillAt !== undefined && p > fillAt ? Math.min(0.18, (p - fillAt) * 2) : 0;
  const common = {
    pathLength: 1,
    strokeDasharray: '1',
    strokeDashoffset: 1 - lp,
    stroke: color,
    strokeWidth: w,
    fill: fill && fillOpacity > 0 ? fill : 'none',
    fillOpacity,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (el === 'polyline') return <polyline points={points} {...common} />;
  if (el === 'polygon') return <polygon points={points} {...common} />;
  return <path d={d} {...common} />;
};

// ---- Beat 1 parts: each drawn in a 400x400 viewBox, animated by p in [0,1] ----

export const Bracket: React.FC<{p: number}> = ({p}) => (
  <svg viewBox="0 0 400 400" style={{width: '100%', height: '100%'}}>
    <Draw p={p} span={0.55} color={SAGE} w={4} fillAt={0.7} fill={SAGE}
      d="M 90 80 L 250 80 L 250 130 L 140 130 L 140 320 L 90 320 Z" />
    <Draw p={p} delay={0.35} span={0.3} d="M 96 136 L 134 136" color={SAGE_DIM} w={2} />
    <Draw p={p} delay={0.5} span={0.25} el="path" d="M 170 105 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0" w={3} />
    <Draw p={p} delay={0.6} span={0.25} el="path" d="M 115 270 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0" w={3} />
  </svg>
);

export const Harness: React.FC<{p: number}> = ({p}) => (
  <svg viewBox="0 0 400 400" style={{width: '100%', height: '100%'}}>
    <Draw p={p} span={0.5} color={SAGE} w={5} d="M 60 200 C 140 200 160 200 210 200" />
    <Draw p={p} delay={0.3} span={0.4} color={SAGE} w={4} d="M 210 200 C 260 200 270 120 330 110" />
    <Draw p={p} delay={0.35} span={0.4} color={SAGE} w={4} d="M 210 200 C 270 200 280 290 335 300" />
    <Draw p={p} delay={0.45} span={0.35} color={SAGE_DIM} w={3} d="M 210 200 C 250 205 290 205 330 205" />
    <Draw p={p} delay={0.7} span={0.2} el="polygon" points="40,185 62,185 62,215 40,215" w={3} fillAt={0.85} fill={WHITE} />
    <Draw p={p} delay={0.72} span={0.2} el="polygon" points="330,95 355,95 355,123 330,123" w={3} fillAt={0.87} fill={WHITE} />
    <Draw p={p} delay={0.76} span={0.2} el="polygon" points="330,192 356,192 356,218 330,218" w={3} fillAt={0.9} fill={WHITE} />
    <Draw p={p} delay={0.8} span={0.2} el="polygon" points="333,287 358,287 358,314 333,314" w={3} fillAt={0.92} fill={WHITE} />
    <Draw p={p} delay={0.55} span={0.15} el="polygon" points="200,188 224,188 224,212 200,212" color={SAGE} w={3} />
  </svg>
);

export const Block: React.FC<{p: number}> = ({p}) => (
  <svg viewBox="0 0 400 400" style={{width: '100%', height: '100%'}}>
    <Draw p={p} span={0.45} w={3.5} el="polygon" points="110,150 250,110 340,160 200,205" />
    <Draw p={p} delay={0.2} span={0.4} w={3.5} d="M 110 150 L 110 270 L 200 320 L 200 205 M 200 320 L 340 275 L 340 160" />
    <Draw p={p} delay={0.45} span={0.3} color={SAGE} w={3} el="polygon" points="160,160 250,135 300,163 210,190" />
    <Draw p={p} delay={0.6} span={0.25} color={SAGE} w={2.5} d="M 160 160 L 165 185 L 255 158 L 250 135 M 165 185 L 305 186 M 300 163 L 305 186" />
    <Draw p={p} delay={0.78} span={0.18} color={SAGE_DIM} w={2} d="M 175 168 L 240 150 M 185 175 L 250 157 M 196 182 L 262 163" />
  </svg>
);

export const Board: React.FC<{p: number}> = ({p}) => (
  <svg viewBox="0 0 400 400" style={{width: '100%', height: '100%'}}>
    <Draw p={p} span={0.35} w={3.5} color={SAGE_DIM} el="polygon" points="70,100 330,100 330,300 70,300" fillAt={0.4} fill={SAGE_DIM} />
    <Draw p={p} delay={0.3} span={0.25} color={SAGE} w={3} el="polygon" points="170,170 230,170 230,230 170,230" fillAt={0.6} fill={SAGE} />
    <Draw p={p} delay={0.42} span={0.3} color={SAGE} w={2.5} d="M 170 185 L 110 185 L 110 130 M 170 215 L 95 215 M 230 185 L 290 185 L 290 140 M 230 215 L 305 215 L 305 265" />
    <Draw p={p} delay={0.55} span={0.3} color={SAGE} w={2.5} d="M 185 170 L 185 125 M 215 170 L 215 118 M 185 230 L 185 275 M 215 230 L 215 282" />
    {[
      [110, 130], [95, 215], [290, 140], [305, 265], [185, 125], [215, 118], [185, 275], [215, 282],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={7}
        fill={SAGE} opacity={p > 0.62 + i * 0.045 ? 1 : 0}
        style={{filter: 'drop-shadow(0 0 6px rgba(143,188,151,0.9))'}} />
    ))}
  </svg>
);

export const Housing: React.FC<{p: number}> = ({p}) => {
  const gap = Math.max(0, 1 - Math.min(1, p / 0.55)) * 80;
  return (
    <svg viewBox="0 0 400 400" style={{width: '100%', height: '100%'}}>
      <g transform={`translate(0, ${-gap})`}>
        <Draw p={p} span={0.4} w={3.5} d="M 100 200 L 100 140 Q 100 110 130 110 L 270 110 Q 300 110 300 140 L 300 200" />
      </g>
      <g transform={`translate(0, ${gap})`}>
        <Draw p={p} span={0.4} w={3.5} d="M 100 200 L 100 260 Q 100 290 130 290 L 270 290 Q 300 290 300 260 L 300 200" />
      </g>
      <Draw p={p} delay={0.55} span={0.2} color={SAGE} w={3} d="M 100 200 L 300 200" />
      <Draw p={p} delay={0.68} span={0.25} color={SAGE} w={2.5}
        d="M 130 150 L 270 150 M 130 250 L 270 250 M 150 110 L 150 96 M 250 110 L 250 96" />
    </svg>
  );
};

// ---- Beat 2 end products, drawn in 700x400 viewBox ----

export const ServerSled: React.FC<{p: number}> = ({p}) => (
  <svg viewBox="0 0 700 400" style={{width: '100%', height: '100%'}}>
    <Draw p={p} span={0.4} w={3.5} el="polygon" points="80,140 620,140 620,260 80,260" />
    <Draw p={p} delay={0.25} span={0.3} color={SAGE} w={2.5}
      d="M 110 165 L 110 235 M 130 165 L 130 235 M 150 165 L 150 235 M 170 165 L 170 235 M 190 165 L 190 235" />
    <Draw p={p} delay={0.4} span={0.3} color={SAGE} w={3} el="polygon" points="250,160 420,160 420,240 250,240" />
    <Draw p={p} delay={0.55} span={0.25} color={SAGE_DIM} w={2.5}
      d="M 460 175 L 590 175 M 460 200 L 590 200 M 460 225 L 590 225" />
    <Draw p={p} delay={0.7} span={0.2} color={SAGE} w={2.5} d="M 300 190 L 370 190 M 300 210 L 370 210" />
  </svg>
);

export const MedDevice: React.FC<{p: number}> = ({p}) => (
  <svg viewBox="0 0 700 400" style={{width: '100%', height: '100%'}}>
    <Draw p={p} span={0.4} w={3.5} d="M 220 90 L 480 90 Q 500 90 500 110 L 500 270 Q 500 290 480 290 L 220 290 Q 200 290 200 270 L 200 110 Q 200 90 220 90" />
    <Draw p={p} delay={0.2} span={0.3} color={SAGE_DIM} w={3} el="polygon" points="230,120 470,120 470,230 230,230" />
    <Draw p={p} delay={0.45} span={0.35} color={SAGE} w={3.5}
      d="M 245 180 L 300 180 L 318 140 L 340 215 L 358 165 L 372 180 L 455 180" />
    <Draw p={p} delay={0.7} span={0.2} color={SAGE} w={3} d="M 290 260 L 410 260 M 330 320 L 370 320 L 370 290" />
  </svg>
);

export const TruckModule: React.FC<{p: number}> = ({p}) => (
  <svg viewBox="0 0 700 400" style={{width: '100%', height: '100%'}}>
    <Draw p={p} span={0.4} w={3.5} el="polygon" points="180,110 520,110 560,150 560,290 180,290" />
    <Draw p={p} delay={0.25} span={0.3} w={3} d="M 180 110 L 180 290 M 520 110 L 520 290" />
    <Draw p={p} delay={0.4} span={0.3} color={SAGE} w={2.5}
      d="M 210 140 L 210 260 M 240 140 L 240 260 M 270 140 L 270 260" />
    <Draw p={p} delay={0.55} span={0.3} color={SAGE} w={3} el="polygon" points="330,170 480,170 480,250 330,250" />
    {[350, 375, 400, 425, 450].map((x, i) => (
      <circle key={i} cx={x} cy={210} r={8} fill="none" stroke={SAGE} strokeWidth={2.5}
        opacity={p > 0.7 + i * 0.05 ? 1 : 0} />
    ))}
  </svg>
);

export const DefenseBox: React.FC<{p: number}> = ({p}) => (
  <svg viewBox="0 0 700 400" style={{width: '100%', height: '100%'}}>
    <Draw p={p} span={0.4} w={4} el="polygon" points="170,100 530,100 530,300 170,300" />
    <Draw p={p} delay={0.2} span={0.35} color={SAGE_DIM} w={3}
      d="M 200 100 L 200 300 M 260 100 L 260 300 M 440 100 L 440 300 M 500 100 L 500 300" />
    <Draw p={p} delay={0.45} span={0.25} color={SAGE} w={3.5}
      d="M 130 140 L 170 140 M 130 140 L 130 180 M 130 260 L 170 260 M 130 260 L 130 220 M 570 140 L 530 140 M 570 140 L 570 180 M 570 260 L 530 260 M 570 260 L 570 220" />
    <Draw p={p} delay={0.6} span={0.25} color={SAGE} w={3} el="polygon" points="300,160 400,160 400,240 300,240" />
    <Draw p={p} delay={0.75} span={0.18} color={SAGE} w={2.5} d="M 320 200 L 380 200 M 350 175 L 350 225" />
  </svg>
);
