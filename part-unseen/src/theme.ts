export const BG0 = '#0D1213';
export const BG1 = '#131A1A';
export const BG2 = '#1C2424';
export const WHITE = '#F4F7F4';
export const SAGE = '#8FBC97';
export const SAGE_DIM = '#6B8E7B';
export const GRAY = '#9DABA5';
export const EYEBROW = '#7E948A';

export const bgStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: `radial-gradient(120% 90% at 50% 30%, ${BG2} 0%, ${BG1} 55%, ${BG0} 100%)`,
};

// deterministic pseudo-random from an integer seed
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
