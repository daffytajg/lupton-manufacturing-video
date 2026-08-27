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

      {/* audio: bed carries drone/pulse/tension/pad with the 23.2-24.0s hard silence baked in */}
      <Audio src={staticFile('audio/bed.wav')} volume={0.9} />
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
