import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { cpl } from "./theme";
import { ip, Num, Sheen, useCount, useSec, useSpring } from "./ui";

const C = cpl.colors;

// funnel geometry (px): each tier narrows into the next
export const W = [900, 730, 560, 400];
export const H = 200;
export const G = 22;
export const tierCenterY = (i: number) => i * (H + G) + H / 2;

export type Tier = {
  value: number;
  label: string;
  at: number; // frame
  tone?: "base" | "loss" | "win";
};

// leads flowing down the funnel; most of them leak out in campaign A
const DOTS = Array.from({ length: 34 }, (_, k) => {
  const h = (n: number) => Math.abs((Math.sin(k * 91.7 + n * 47.3) * 9631.17) % 1);
  return { x: h(1) * 2 - 1, phase: h(2), keep: h(3), size: 7 + h(4) * 6 };
});

const TierShape: React.FC<{ i: number; tier: Tier; dimmed: number }> = ({ i, tier, dimmed }) => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const p = useSpring(tier.at, cpl.spring.snappy);
  const v = useCount(0, tier.value, tier.at + 2, sec(0.75));
  const w = W[i];
  const inset = (W[i] - W[i + 1]) / 2;
  const tone = tier.tone ?? "base";
  const lit = tone === "base" ? 0 : ip(frame, [tier.at + 4, tier.at + sec(0.6)], [0, 1]);
  const stroke = tone === "loss" ? C.loss : tone === "win" ? C.goldBright : "rgba(243,215,155,0.55)";
  const numColor = tone === "loss" ? C.loss : tone === "win" ? C.goldBright : C.cream;
  const id = `tier-${i}-${tone}`;
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - w) / 2,
        top: i * (H + G),
        width: w,
        height: H,
        opacity: Math.min(1, p) * (1 - dimmed * 0.62),
        transform: `translateY(${interpolate(p, [0, 1], [-40, 0])}px) scaleX(${interpolate(p, [0, 1], [0.7, 1])})`,
        filter: `blur(${dimmed * 3 + (1 - Math.min(1, p)) * 6}px) drop-shadow(0 0 ${lit * 50}px ${tone === "loss" ? "rgba(217,122,102,0.45)" : C.glow})`,
      }}
    >
      <svg width={w} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={tone === "win" ? "#3A3220" : "#1B2A52"} />
            <stop offset="1" stopColor={tone === "win" ? "#1A1810" : "#0C1532"} />
          </linearGradient>
        </defs>
        <path d={`M1 1 H${w - 1} L${w - inset} ${H - 1} H${inset} Z`} fill={`url(#${id})`} stroke={stroke} strokeWidth={2.5} />
        <path d={`M8 6 H${w - 8}`} stroke="rgba(255,255,255,0.10)" strokeWidth={2} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          fontFamily: cpl.fonts.display,
        }}
      >
        <Num v={v} style={{ fontSize: 112, fontWeight: 800, color: numColor, letterSpacing: "-0.03em" }} />
        <span style={{ fontSize: 44, fontWeight: 600, color: C.creamDim, maxWidth: 300, lineHeight: 1.05 }}>{tier.label}</span>
      </div>
      {tone !== "base" ? <Sheen at={tier.at + sec(0.3)} radius={0} /> : null}
    </div>
  );
};

export const Funnel: React.FC<{
  tiers: Tier[];
  survive: [number, number]; // share of dots that pass into tier 2 and tier 3
  focusAt?: number; // frame: camera pushes into the last tier
  children?: React.ReactNode;
}> = ({ tiers, survive, focusAt, children }) => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const focus = focusAt === undefined ? 0 : ip(frame, [focusAt, focusAt + sec(0.8)], [0, 1], cpl.ease.inOut);
  const total = 3 * H + 2 * G;
  const flowFrom = tiers[0].at + sec(0.4);
  const period = sec(1.8);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        height: total,
        transformOrigin: `540px ${tierCenterY(2)}px`,
        transform: `scale(${1 + focus * 0.12}) translateY(${focus * 20}px)`,
      }}
    >
      {tiers.map((t, i) => (
        <TierShape key={i} i={i} tier={t} dimmed={i < 2 ? focus : 0} />
      ))}
      {/* lead particles */}
      {DOTS.map((d, k) => {
        const local = frame - flowFrom - d.phase * period;
        if (local < 0) return null;
        const u = (local % period) / period;
        const y = u * total;
        const tierIdx = Math.min(2, Math.floor(y / (H + G)));
        const within = (y - tierIdx * (H + G)) / H;
        const half = interpolate(within, [0, 1], [W[tierIdx], W[tierIdx + 1]], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }) / 2;
        const passes = tierIdx === 0 || (tierIdx === 1 ? d.keep < survive[0] : d.keep < survive[1]);
        const dying = tierIdx === 0 ? (d.keep < survive[0] ? 0 : ip(within, [0.55, 0.95], [0, 1])) : tierIdx === 1 ? (d.keep < survive[1] ? 0 : ip(within, [0.55, 0.95], [0, 1])) : 0;
        if (!passes) return null;
        const reveal = ip(tiers[tierIdx].at > frame ? 0 : 1, [0, 1], [0, 1]);
        const o = (1 - dying) * ip(u, [0, 0.06], [0, 1]) * ip(u, [0.9, 1], [1, 0]) * reveal * (1 - focus * 0.5);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 540 + d.x * (half - 60) - d.size / 2,
              top: y - d.size / 2,
              width: d.size,
              height: d.size,
              borderRadius: "50%",
              background: C.goldBright,
              opacity: o * 0.8,
              boxShadow: `0 0 18px ${C.glow}`,
            }}
          />
        );
      })}
      {children}
    </div>
  );
};
