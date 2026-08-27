import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';

export const Root: React.FC = () => (
  <>
    <Composition id="Wide" component={Video} durationInFrames={1200} fps={30} width={1920} height={1080} />
    <Composition id="Tall" component={Video} durationInFrames={1200} fps={30} width={1080} height={1350} />
  </>
);
