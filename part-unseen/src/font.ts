import {continueRender, delayRender, staticFile} from 'remotion';

let loaded = false;
export const loadInter = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('load Inter');
  const font = new FontFace('Inter', `url(${staticFile('Inter-var.woff2')}) format('woff2')`, {
    weight: '100 900',
  });
  font
    .load()
    .then((f) => {
      (document as any).fonts.add(f);
      continueRender(handle);
    })
    .catch(() => continueRender(handle));
};

export const FONT = "'Inter', Arial, sans-serif";
