import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { B, FR_TOTAL_F } from "./theme3";
import { Beams, Grade, Grain, Particles, Space, Vignette, clamp, track } from "./atoms";
import { PhoneStory, Race } from "./scenesA";
import { EMBLEM, End, Equation, Win } from "./scenesB";

// ---------- "First Reply Wins" — silent motion showcase, 1080x1920, 105 BPM ----------
// Scene map (beats): ad 0–9 · message 9–19 · five clinics 19–30 · race 30–48 ·
// booking 49–62 · equation 61.5–70 · emblem + line 69.5–82

// [beat, sfx, volume] — SFX lead their visual by ~2 frames
const SFX: [number, string, number][] = [
  [0.4, "swell", 0.35],
  [1.0, "whoosh", 0.45],
  [3.0, "tick", 0.35],
  [3.4, "whoosh", 0.3],
  [6.4, "pop", 0.55],
  [8.3, "whoosh", 0.4],
  [10.5, "whoosh", 0.25],
  [13.85, "send", 0.55],
  [15.0, "tick", 0.3],
  [16.4, "whoosh", 0.5],
  [16.6, "shimmer", 0.35],
  [19.85, "whoosh", 0.45],
  [20.9, "pop", 0.3],
  [21.1, "pop", 0.28],
  [21.25, "pop", 0.3],
  [21.45, "pop", 0.26],
  [21.6, "pop", 0.3],
  [21.0, "whoosh", 0.25],
  [25.5, "whoosh", 0.4],
  [28.6, "tick", 0.3],
  [33.9, "ding", 0.6],
  [34.0, "thud", 0.5],
  [34.1, "shimmer", 0.4],
  [34.9, "whoosh", 0.3],
  [37.9, "late", 0.4],
  [39.9, "late", 0.4],
  [41.9, "late", 0.4],
  [42.9, "late", 0.35],
  [43.3, "toolate", 0.5],
  [47.8, "whoosh", 0.45],
  [48.0, "thud", 0.45],
  [50.0, "pop", 0.35],
  [51.0, "pop", 0.35],
  [52.2, "pop", 0.35],
  [53.4, "pop", 0.35],
  [54.6, "pop", 0.35],
  [55.6, "swell", 0.4],
  [56.15, "thud", 0.55],
  [56.3, "shimmer", 0.4],
  [56.9, "whoosh", 0.3],
  [61.9, "thud", 0.4],
  [62.9, "thud", 0.42],
  [63.9, "thud", 0.5],
  [64.0, "shimmer", 0.35],
  [69.3, "whoosh", 0.4],
  [70.0, "swell", 0.4],
  [70.8, "shimmer", 0.45],
  [71.0, "thud", 0.4],
  [71.8, "whoosh", 0.25],
];

export const FirstReplyWins: React.FC = () => {
  const f = useCurrentFrame();
  const beams = track(f, [
    [0, 0],
    [B(2.5), 1],
    [B(19), 0.85],
    [B(30), 0.5],
    [B(48), 0.95],
    [B(62), 0.7],
    [B(71), 1.15],
    [B(80), 0.9],
  ]);
  const converge = track(f, [
    [B(69.4), 0],
    [B(71.1), 0.92],
    [B(72.8), 0],
  ]);
  const speed = track(f, [
    [B(28), 1],
    [B(34), 2.2],
    [B(46), 2.6],
    [B(49), 1],
  ]);
  const fadeOut = interpolate(f, [B(80.4), FR_TOTAL_F - 1], [0, 1], clamp);
  const fadeIn = interpolate(f, [0, 8], [1, 0], clamp);

  // typing clicks across the input (beats 10.2–13.6), one every ~3 frames
  const keys: number[] = [];
  for (let k = B(10.2); k < B(13.6); k += 3 + (k % 2)) keys.push(k);

  return (
    <AbsoluteFill style={{ backgroundColor: "#061325" }}>
      {/* layer 1: deep space + light + atmosphere (continuous across every scene) */}
      <Space warmth={1 + converge} />
      <Beams intensity={beams * 2.1} />
      <Particles count={80} converge={converge} cx={EMBLEM.x} cy={EMBLEM.y + 16} speed={speed} />

      {/* layers 2–3: scenes, overlapped so every hand-off is continuous */}
      <Sequence from={0} durationInFrames={B(19) + 2} name="Ad + Message">
        <PhoneStory />
      </Sequence>
      <Sequence from={B(19)} durationInFrames={B(31)} name="Five clinics + Race">
        <Race />
      </Sequence>
      <Sequence from={B(49)} durationInFrames={B(12.8)} name="Booking">
        <Win />
      </Sequence>
      <Sequence from={B(61.5)} durationInFrames={B(9)} name="Equation">
        <Equation />
      </Sequence>
      <Sequence from={B(69.5)} name="Ending">
        <End />
      </Sequence>

      {/* layer 4: grade · layer 5: grain + vignette */}
      <Grade />
      <Grain />
      <Vignette />
      <AbsoluteFill style={{ backgroundColor: "#061325", opacity: Math.max(fadeOut, fadeIn), pointerEvents: "none" }} />

      {/* sound */}
      <Audio src={staticFile("sfx/fr/track.wav")} volume={0.75} />
      {SFX.map(([b, name, vol], i) => (
        <Sequence key={i} from={Math.max(0, B(b) - 2)} durationInFrames={B(4)} layout="none">
          <Audio src={staticFile(`sfx/fr/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
      {keys.map((k, i) => (
        <Sequence key={`k${i}`} from={k} durationInFrames={4} layout="none">
          <Audio src={staticFile("sfx/fr/key.wav")} volume={0.18 + (i % 3) * 0.04} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
