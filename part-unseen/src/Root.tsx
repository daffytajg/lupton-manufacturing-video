import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {LeadTime} from './leadtime';
import {DayEleven} from './dayeleven';

export const Root: React.FC = () => (
  <>
    <Composition id="Wide" component={Video} durationInFrames={1200} fps={30} width={1920} height={1080} />
    <Composition id="Tall" component={Video} durationInFrames={1200} fps={30} width={1080} height={1350} />
    <Composition id="LeadWide" component={LeadTime} durationInFrames={900} fps={30} width={1920} height={1080} />
    <Composition id="LeadTall" component={LeadTime} durationInFrames={900} fps={30} width={1080} height={1350} />
    <Composition id="DayWide" component={DayEleven} durationInFrames={780} fps={30} width={1920} height={1080} />
    <Composition id="DayTall" component={DayEleven} durationInFrames={780} fps={30} width={1080} height={1350} />
  </>
);
