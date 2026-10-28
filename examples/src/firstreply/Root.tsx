import React from "react";
import { Composition } from "remotion";
import { FirstReplyWins } from "./FirstReplyWins";
import { loadMontserrat } from "./fonts";
import { FR_FPS, FR_H, FR_TOTAL_F, FR_W } from "./theme3";

loadMontserrat();

export const FirstReplyComposition: React.FC = () => (
  <Composition
    id="FirstReplyWins"
    component={FirstReplyWins}
    durationInFrames={FR_TOTAL_F}
    fps={FR_FPS}
    width={FR_W}
    height={FR_H}
  />
);

export const FirstReplyRoot: React.FC = () => <FirstReplyComposition />;
