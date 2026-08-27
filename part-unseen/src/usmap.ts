import {rand} from './theme';

// Stylized low-poly continental US outline in a 1000x600 box.
export const US_OUTLINE: [number, number][] = [
  [95, 95], [200, 78], [330, 70], [470, 68], [600, 72], [640, 78],
  [655, 110], [690, 96], [706, 126], [742, 108], [772, 66], [790, 78],
  [768, 118], [745, 152], [758, 182], [730, 232], [722, 282],
  [700, 330], [724, 398], [706, 434], [682, 392], [660, 340],
  [604, 330], [560, 362], [520, 332], [472, 352], [434, 332],
  [434, 392], [402, 434], [370, 382], [348, 330], [282, 330],
  [212, 300], [150, 252], [110, 220], [82, 205], [62, 150],
];

const inside = (x: number, y: number) => {
  let c = false;
  const n = US_OUTLINE.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = US_OUTLINE[i];
    const [xj, yj] = US_OUTLINE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

// ~260 background dots filling the silhouette (deterministic)
export const MAP_DOTS: [number, number][] = (() => {
  const dots: [number, number][] = [];
  let seed = 7;
  while (dots.length < 260 && seed < 12000) {
    seed++;
    const x = 40 + rand(seed * 2) * 780;
    const y = 50 + rand(seed * 2 + 1) * 400;
    if (inside(x, y)) dots.push([x, y]);
  }
  return dots;
})();

export const OUTLINE_POINTS = US_OUTLINE.map((p) => p.join(',')).join(' ');

// 33 principal locations, roughly matching real industrial geography.
export const PRINCIPALS: [number, number][] = [
  [735, 118], [742, 130], [718, 140], [700, 150], [745, 165], [726, 172],
  [755, 148], [712, 195], [730, 210], [700, 230], [688, 260], [672, 292],
  [655, 175], [640, 150], [620, 190], [600, 160], [636, 220], [615, 250],
  [585, 210], [560, 240], [590, 285], [545, 300], [510, 260], [480, 300],
  [430, 360], [415, 300], [380, 250], [330, 200], [270, 240], [200, 180],
  [140, 160], [110, 130], [160, 260],
];

// Canandaigua, upstate New York.
export const HQ: [number, number] = [738, 116];
