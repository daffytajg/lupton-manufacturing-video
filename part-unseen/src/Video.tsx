import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {bgStyle} from './theme';
import {loadInter} from './font';
import {Hook, Beat1, Beat2, Beat3, Beat4, Close} from './scenes';

const sfx = (name: string, from: number, volume = 1) => (
  <Sequence key={`${name}-${from}`} from={from}>
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume} />
  </Sequence>
);

export const Video: React.FC = () => {
  loadInter();
  const plinks = Array.from({length: 33}, (_, i) => sfx('plink', 546 + Math.round(i * 2.72), 0.5));
  return (
    <AbsoluteFill style={{background: '#050808'}}>
      <AbsoluteFill style={bgStyle} />

      <Sequence from={0} durationInFrames={120}><Hook /></Sequence>
      <Sequence from={120} durationInFrames={180}><Beat1 /></Sequence>
      <Sequence from={300} durationInFrames={210}><Beat2 /></Sequence>
      <Sequence from={510} durationInFrames={210}><Beat3 /></Sequence>
      <Sequence from={720} durationInFrames={240}><Beat4 /></Sequence>
      <Sequence from={960} durationInFrames={240}><Close /></Sequence>

      {/* music: Envision — Kevin MacLeod (incompetech.com), CC BY 4.0 — envelope and 23.2-24.0s hard silence pre-shaped */}
      <Audio src={staticFile('audio/music.wav')} volume={0.52} />
      {/* narration: v9-cloned narrator, scene-locked */}
      {sfx('V1', 14, 1.0)}
      {sfx('V2', 135, 1.0)}
      {sfx('V3', 310, 1.0)}
      {sfx('V4', 526, 1.0)}
      {sfx('V5', 725, 1.0)}
      {sfx('V6', 785, 1.0)}
      {sfx('V7', 866, 1.0)}
      {sfx('V8', 905, 1.0)}
      {sfx('V9', 1010, 1.0)}
      {sfx('type_ticks', 9, 0.7)}
      {sfx('subbass', 120)}
      {sfx('stamp', 136, 0.85)}
      {sfx('stamp', 172, 0.85)}
      {sfx('stamp', 208, 0.85)}
      {sfx('stamp', 244, 0.85)}
      {sfx('stamp', 280, 0.85)}
      {sfx('snap', 300, 0.8)}
      {sfx('tick', 342, 0.7)}
      {sfx('tick', 384, 0.7)}
      {sfx('tick', 426, 0.7)}
      {sfx('subbass', 468, 0.9)}
      {sfx('shatter', 510, 0.75)}
      {plinks}
      {sfx('riser', 636, 0.8)}
      {sfx('strike', 720)}
      {sfx('strike', 780)}
      {sfx('strike', 840)}
      {sfx('strike', 900)}
      {sfx('resolve', 960, 0.9)}
    </AbsoluteFill>
  );
};
