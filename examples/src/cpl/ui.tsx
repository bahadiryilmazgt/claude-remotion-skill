import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cpl } from "./theme";

const C = cpl.colors;

// seconds -> frames, so every timing in the reel derives from fps
export const useSec = () => {
  const { fps } = useVideoConfig();
  return (s: number) => Math.round(s * fps);
};

// clamped, eased interpolate — the only kind this reel uses
export const ip = (
  f: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = cpl.ease.out,
) =>
  interpolate(f, input, output, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const useSpring = (
  delay: number,
  config: (typeof cpl.spring)[keyof typeof cpl.spring] = cpl.spring.smooth,
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

// fade + rise + scale + de-blur entrance, optional fast exit
export const Rise: React.FC<{
  at: number;
  exit?: number;
  y?: number;
  config?: (typeof cpl.spring)[keyof typeof cpl.spring];
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, exit, y = 46, config = cpl.spring.smooth, style, children }) => {
  const frame = useCurrentFrame();
  const p = useSpring(at, config);
  const out = exit === undefined ? 0 : ip(frame, [exit, exit + 9], [0, 1], cpl.ease.in);
  return (
    <div
      style={{
        opacity: Math.min(p, 1) * (1 - out),
        transform: `translateY(${interpolate(p, [0, 1], [y, 0]) - out * 30}px) scale(${interpolate(p, [0, 1], [0.92, 1]) - out * 0.04})`,
        filter: `blur(${(1 - Math.min(p, 1)) * 8 + out * 6}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// word-by-word headline reveal
export const Words: React.FC<{
  text: string;
  at: number;
  per?: number;
  style?: React.CSSProperties;
  wordStyle?: (i: number, w: string) => React.CSSProperties | undefined;
}> = ({ text, at, per = 3, style, wordStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 22, ...style }}>
      {text.split(" ").map((w, i) => {
        const p = spring({ frame: frame - at - i * per, fps, config: cpl.spring.snappy });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: Math.min(1, p),
              transform: `translateY(${interpolate(p, [0, 1], [38, 0])}px) rotate(${interpolate(p, [0, 1], [4, 0])}deg)`,
              filter: `blur(${(1 - Math.min(1, p)) * 6}px)`,
              ...wordStyle?.(i, w),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// eased count between two values
export const useCount = (from: number, to: number, at: number, dur: number) => {
  const frame = useCurrentFrame();
  return ip(frame, [at, at + dur], [from, to], cpl.ease.inOut);
};

export const Num: React.FC<{ v: number; decimals?: number; style?: React.CSSProperties }> = ({
  v,
  decimals = 0,
  style,
}) => (
  <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
    {v.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
  </span>
);

export const Chip: React.FC<{ children: React.ReactNode; tone?: "gold" | "dim"; style?: React.CSSProperties }> = ({
  children,
  tone = "dim",
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 26px",
      borderRadius: 999,
      fontFamily: cpl.fonts.display,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: tone === "gold" ? C.bg : C.creamDim,
      background: tone === "gold" ? `linear-gradient(135deg, ${C.goldBright}, ${C.gold})` : "rgba(244,236,220,0.06)",
      border: `1px solid ${tone === "gold" ? C.goldBright : C.cardEdge}`,
      ...style,
    }}
  >
    {children}
  </div>
);

// glass card with a gold hairline edge and soft depth
export const Card: React.FC<{ style?: React.CSSProperties; glow?: number; children: React.ReactNode }> = ({
  style,
  glow = 0,
  children,
}) => (
  <div
    style={{
      position: "relative",
      borderRadius: 36,
      background: `linear-gradient(160deg, rgba(28,44,86,0.82), ${C.card} 55%, rgba(8,14,32,0.9))`,
      border: `1.5px solid ${glow > 0 ? `rgba(243,215,155,${0.25 + glow * 0.55})` : C.cardEdge}`,
      boxShadow: `0 50px 90px -30px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 ${80 * glow}px ${C.glow}`,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------- layers
export const Backdrop: React.FC<{ dim?: number }> = ({ dim = 0 }) => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 60) * 60;
  const d2 = Math.cos(frame / 75) * 50;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bgAlt} 0%, ${C.bg} 45%, #04070F 100%)` }}>
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 1500,
          borderRadius: "50%",
          top: -620 + d2 * 0.4,
          left: -500 + d1,
          filter: "blur(40px)",
          opacity: 1 - dim * 0.7,
          background: `radial-gradient(circle, ${C.gold}2E, transparent 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          bottom: -560,
          right: -560 - d2,
          filter: "blur(60px)",
          background: `radial-gradient(circle, ${C.blue}40, transparent 62%)`,
        }}
      />
      <Floor />
      <Dust />
    </AbsoluteFill>
  );
};

// perspective data-grid floor, slowly scrolling toward camera
const Floor: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = (frame * 1.4) % 120;
  return (
    <div
      style={{
        position: "absolute",
        left: -600,
        right: -600,
        bottom: -200,
        height: 1000,
        transform: "perspective(900px) rotateX(68deg)",
        transformOrigin: "50% 100%",
        backgroundImage: `linear-gradient(${C.gold}22 2px, transparent 2px), linear-gradient(90deg, ${C.gold}1A 2px, transparent 2px)`,
        backgroundSize: "120px 120px",
        backgroundPosition: `0 ${scroll}px`,
        maskImage: "linear-gradient(0deg, rgba(0,0,0,0.9), transparent 85%)",
        WebkitMaskImage: "linear-gradient(0deg, rgba(0,0,0,0.9), transparent 85%)",
      }}
    />
  );
};

// deterministic floating gold dust for depth
const DUST = Array.from({ length: 38 }, (_, i) => {
  const r = (n: number) => (Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1;
  const a = Math.abs(r(1)), b = Math.abs(r(2)), c = Math.abs(r(3));
  return { x: a * 1080, y: b * 1920, s: 2 + c * 5, sp: 0.3 + c * 0.9, ph: a * 10 };
});
const Dust: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {DUST.map((d, i) => {
        const y = (d.y - frame * d.sp + 1920 * 4) % 1920;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / 24 + d.ph));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x + Math.sin(frame / 40 + d.ph) * 14,
              top: y,
              width: d.s,
              height: d.s,
              borderRadius: "50%",
              background: C.goldBright,
              opacity: tw * (d.s > 5 ? 0.35 : 0.55),
              filter: d.s > 5 ? "blur(2px)" : undefined,
              boxShadow: `0 0 ${d.s * 3}px ${C.glow}`,
            }}
          />
        );
      })}
    </>
  );
};

export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: C.gold, mixBlendMode: "soft-light", opacity: 0.1 }} />
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.25), transparent 22%, transparent 75%, rgba(0,0,0,0.35))",
      }}
    />
  </AbsoluteFill>
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity: 0.06,
        mixBlendMode: "overlay",
      }}
    />
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.5) 100%)",
    }}
  />
);

// soft light sweep across a block (premium sheen)
export const Sheen: React.FC<{ at: number; dur?: number; radius?: number }> = ({ at, dur = 24, radius = 36 }) => {
  const frame = useCurrentFrame();
  const x = ip(frame, [at, at + dur], [-120, 220], cpl.ease.inOut);
  if (frame < at || frame > at + dur) return null;
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: radius, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${x}%`,
          width: "45%",
          transform: "skewX(-20deg)",
          background: "linear-gradient(90deg, transparent, rgba(255,240,210,0.22), transparent)",
        }}
      />
    </div>
  );
};

// ----------------------------------------------------------------- icons
type IconProps = { size?: number; color?: string };
const svg = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const Icon = {
  tag: ({ size = 48, color = C.gold }: IconProps) =>
    svg(size, <>
      <path d="M6 24 24 6h16v16L22 40Z" stroke={color} />
      <circle cx="32" cy="15" r="3" fill={color} />
    </>),
  gem: ({ size = 48, color = C.gold }: IconProps) =>
    svg(size, <>
      <path d="M8 18 16 8h16l8 10-16 22Z" stroke={color} />
      <path d="M8 18h32M20 8l-4 10 8 22 8-22-4-10" stroke={color} strokeWidth={2.2} />
    </>),
  funnel: ({ size = 48, color = C.gold }: IconProps) =>
    svg(size, <path d="M6 8h36L28 26v12l-8 4V26Z" stroke={color} />),
  user: ({ size = 48, color = C.gold }: IconProps) =>
    svg(size, <>
      <circle cx="20" cy="15" r="7" stroke={color} />
      <path d="M6 40c1-8 7-12 14-12 4 0 7 1 9 3" stroke={color} />
      <circle cx="36" cy="34" r="7" stroke={color} />
      <path d="M36 30v8M33.5 32.5h4" stroke={color} strokeWidth={2.4} />
    </>),
  trend: ({ size = 48, color = C.gold }: IconProps) =>
    svg(size, <>
      <path d="M6 36 18 24l8 7 16-17" stroke={color} />
      <path d="M32 14h10v10" stroke={color} />
    </>),
  arrowDown: ({ size = 48, color = C.gold }: IconProps) =>
    svg(size, <path d="M24 8v30M12 27l12 12 12-12" stroke={color} />),
  check: ({ size = 48, color = C.gold }: IconProps) =>
    svg(size, <path d="M10 25l9 9 19-20" stroke={color} />),
};
