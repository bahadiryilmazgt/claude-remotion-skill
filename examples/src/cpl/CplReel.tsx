// CplReel — 30s 9:16 Turkish performance-marketing reel:
// "Lead başı maliyet neden tek başına yeterli değildir?"
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { cpl } from "./theme";
import { T, VO } from "./timeline";
import { Backdrop, Grade, Grain, ip, useSec, Vignette } from "./ui";
import { CampaignA, CampaignB, Final, Hook, Metrics, Versus } from "./scenes";
import lines from "../../public/vo/lines.json";

export const CPL_TOTAL_S = T.total;
const C = cpl.colors;

// render children only inside [from, to) seconds; children use global frames
const Window: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  const sec = useSec();
  return frame >= sec(from) && frame < sec(to) ? <>{children}</> : null;
};

// big hits: screen shake + warm flash
const HITS = [T.hook2, T.vs, T.b3, T.fin];
const useHit = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  let shake = 0;
  let flash = 0;
  for (const h of HITS) {
    const d = frame - sec(h);
    if (d >= 0 && d < 12) {
      const k = Math.exp(-d / 3.5);
      shake += k * 14;
      flash = Math.max(flash, k * 0.22);
    }
  }
  return { x: Math.sin(frame * 2.7) * shake, y: Math.cos(frame * 3.3) * shake * 0.7, flash };
};

// diagonal light band sweeping across on every scene cut
const CUTS = [T.a, T.b, T.vs, T.m, T.fin];
const Sweep: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  return (
    <>
      {CUTS.map((c) => {
        const s = sec(c) - 6;
        if (frame < s || frame > s + 14) return null;
        const x = ip(frame, [s, s + 14], [-1400, 1400], cpl.ease.inOut);
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              top: -400,
              left: 540 - 300 + x,
              width: 600,
              height: 2700,
              transform: "rotate(18deg)",
              background: `linear-gradient(90deg, transparent, ${C.gold}2A, rgba(255,240,210,0.18), ${C.gold}2A, transparent)`,
              filter: "blur(30px)",
            }}
          />
        );
      })}
    </>
  );
};

// slim progress rail — the five chapters of the story
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sec = useSec();
  const marks = [0, T.a, T.b, T.m, T.fin];
  const appear = ip(frame, [0, sec(0.5)], [0, 1]);
  return (
    <div style={{ position: "absolute", top: 210, left: 120, width: 840, height: 4, opacity: appear * 0.9 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 4, background: "rgba(244,236,220,0.1)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(frame / durationInFrames) * 100}%`, borderRadius: 4, background: `linear-gradient(90deg, ${C.goldDeep}, ${C.gold})` }} />
      {marks.map((m) => (
        <div key={m} style={{ position: "absolute", left: `${(sec(m) / durationInFrames) * 100}%`, top: -5, width: 14, height: 14, marginLeft: -7, borderRadius: "50%", background: frame >= sec(m) ? C.gold : "#1B2A52", border: `2px solid ${C.bg}` }} />
      ))}
    </div>
  );
};

// ------------------------------------------------------------------ audio
const sfx = (name: string) => staticFile(`sfx/cpl/${name}.wav`);
type Cue = { at: number; name: string; vol: number };

const SFX: Cue[] = [
  { at: 0, name: "impact", vol: 0.35 },
  { at: 0.08, name: "swish", vol: 0.5 },
  { at: 0.28, name: "whoosh", vol: 0.55 },
  { at: 1.22, name: "riser", vol: 0.4 },
  { at: T.good - 0.05, name: "shimmer", vol: 0.7 },
  { at: T.good, name: "pop", vol: 0.6 },
  { at: T.hook2 - 0.03, name: "impact", vol: 0.95 },
  { at: T.hookOut - 0.1, name: "whoosh", vol: 0.7 },
  { at: T.aTier1 - 0.05, name: "pop", vol: 0.6 },
  { at: T.aBadge - 0.05, name: "pop", vol: 0.7 },
  { at: T.aBadge, name: "shimmer", vol: 0.7 },
  { at: T.a2, name: "shimmer", vol: 0.6 },
  { at: T.aTier2 - 0.05, name: "pop", vol: 0.6 },
  { at: T.aTier3 - 0.05, name: "thud", vol: 0.9 },
  { at: T.aShift - 0.05, name: "downer", vol: 0.8 },
  { at: T.aOut - 1.2 + 0.3, name: "riser", vol: 0.45 },
  { at: T.aOut - 0.05, name: "whoosh", vol: 0.75 },
  { at: T.b, name: "swish", vol: 0.5 },
  { at: T.bTier1 - 0.05, name: "pop", vol: 0.6 },
  { at: T.bBadge - 0.05, name: "click", vol: 0.8 },
  { at: T.bBadge, name: "pop", vol: 0.5 },
  { at: T.bTier2 - 0.05, name: "pop", vol: 0.6 },
  { at: T.bLess, name: "click", vol: 0.5 },
  { at: T.bTier3 - 0.05, name: "ding", vol: 0.7 },
  { at: T.vs - 1.15, name: "riser", vol: 0.5 },
  { at: T.bOut - 0.05, name: "whoosh", vol: 0.7 },
  { at: T.vs - 0.02, name: "impact", vol: 0.7 },
  { at: T.vsA, name: "swish", vol: 0.4 },
  { at: T.vsB, name: "whoosh", vol: 0.5 },
  { at: T.vsB + 0.7, name: "ding", vol: 0.75 },
  { at: T.b3 - 0.03, name: "impact", vol: 1 },
  { at: T.b3, name: "shimmer", vol: 0.8 },
  { at: T.vsLine, name: "swish", vol: 0.35 },
  { at: T.vsOut - 0.05, name: "whoosh", vol: 0.7 },
  ...T.rows.flatMap((r) => [
    { at: r - 0.06, name: "swish", vol: 0.4 },
    { at: r, name: "click", vol: 0.7 },
  ]),
  { at: T.c2, name: "shimmer", vol: 0.7 },
  ...[0, 1, 2, 3, 4].map((i) => ({ at: T.c2 + 0.1 + i * 0.3, name: "tick", vol: 0.8 })),
  { at: T.c3 - 0.05, name: "whoosh", vol: 0.55 },
  { at: T.c3 + 0.02, name: "thud", vol: 0.6 },
  { at: T.fin - 1.15, name: "riser", vol: 0.5 },
  { at: T.fin - 0.02, name: "impact", vol: 1 },
  { at: T.fin, name: "shimmer", vol: 0.6 },
  { at: T.finStrike - 0.05, name: "swish", vol: 0.6 },
  { at: T.finResult - 0.03, name: "impact", vol: 0.6 },
  { at: T.finResult, name: "ding", vol: 0.8 },
  { at: T.finResult + 0.05, name: "shimmer", vol: 0.7 },
];

// counter ticks: one per integer step, derived from the same easing as the visuals
const countTicks = (from: number, to: number, at: number, dur: number, fps: number) => {
  const out: number[] = [];
  const val = (fr: number) => Math.round(ip(fr, [at, at + dur], [from, to], cpl.ease.inOut));
  for (let fr = at + 1; fr <= at + dur; fr++) if (val(fr) !== val(fr - 1)) out.push(fr / fps);
  return out;
};

const Sound: React.FC = () => {
  const { fps } = useVideoConfig();
  const sec = useSec();
  const vo = VO.map((v) => ({ ...v, dur: (lines as Record<string, number>)[v.id] }));
  // duck the bed under speech (-10 dB) with soft 0.15s ramps
  const bedVolume = (f: number) => {
    const t = f / fps;
    let speech = 0;
    for (const v of vo) {
      const inn = interpolate(t, [v.at - 0.15, v.at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const out = interpolate(t, [v.at + v.dur, v.at + v.dur + 0.25], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      speech = Math.max(speech, Math.min(inn, out));
    }
    return 0.42 - speech * 0.28;
  };
  const ticks = [
    ...countTicks(25, 10, sec(T.countStart), sec(T.countEnd - T.countStart), fps),
    ...countTicks(0, 100, sec(T.aTier1) + 2, sec(0.75), fps).filter((_, i) => i % 4 === 0),
    ...countTicks(0, 60, sec(T.bTier1) + 2, sec(0.75), fps).filter((_, i) => i % 3 === 0),
    ...countTicks(0, 8, sec(T.vsB), sec(0.7), fps),
  ];
  return (
    <>
      <Audio src={sfx("bed")} volume={bedVolume} />
      {vo.map((v) => (
        <Sequence key={v.id} from={sec(v.at)} layout="none">
          <Audio src={staticFile(`vo/${v.id}.wav`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map((c, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, sec(c.at))} layout="none">
          <Audio src={sfx(c.name)} volume={c.vol * 0.55} />
        </Sequence>
      ))}
      {ticks.map((t, i) => (
        <Sequence key={`t${i}`} from={Math.round(t * fps)} layout="none">
          <Audio src={sfx("tick")} volume={0.4} />
        </Sequence>
      ))}
    </>
  );
};

export const CplReel: React.FC = () => {
  const hit = useHit();
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${hit.x}px, ${hit.y}px) scale(1.02)` }}>
        {/* layer 1: background */}
        <Backdrop />
        {/* layers 2–3: story */}
        <Window from={0} to={T.a}>
          <Hook />
        </Window>
        <Window from={T.a} to={T.b}>
          <CampaignA />
        </Window>
        <Window from={T.b} to={T.vs}>
          <CampaignB />
        </Window>
        <Window from={T.vs} to={T.m}>
          <Versus />
        </Window>
        <Window from={T.m} to={T.fin}>
          <Metrics />
        </Window>
        <Window from={T.fin} to={T.total + 1}>
          <Final />
        </Window>
        <Sweep />
      </AbsoluteFill>
      <Progress />
      <AbsoluteFill style={{ background: C.goldBright, opacity: hit.flash, mixBlendMode: "screen", pointerEvents: "none" }} />
      {/* layer 4: grade — layer 5: grain + vignette */}
      <Grade />
      <Grain />
      <Vignette />
      <Sound />
    </AbsoluteFill>
  );
};
