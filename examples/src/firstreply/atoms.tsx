import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fr, FR_W, Word } from "./theme3";

// ---------- math helpers ----------
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// eased 0..1 between two frames
export const ramp = (f: number, a: number, b: number, ease = fr.ease.inOut) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

// piecewise keyframe track: [[frame, value], ...] eased per segment
export const track = (f: number, keys: [number, number][], ease = fr.ease.inOut) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (f <= f1) return v0 + (v1 - v0) * ease((f - f0) / Math.max(1, f1 - f0));
  }
  return keys[keys.length - 1][1];
};

export const useSpring = (delay: number, config: object = fr.spring.settle) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

// deterministic pseudo-random
export const rand = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- layer 1: deep navy velvet space ----------
export const Space: React.FC<{ glowX?: number; glowY?: number; warmth?: number }> = ({
  glowX = 0.5,
  glowY = 0.38,
  warmth = 1,
}) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 90) * 60;
  const dy = Math.cos(frame / 110) * 40;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(130% 90% at ${glowX * 100}% ${glowY * 100}%, ${fr.colors.navyMid} 0%, ${fr.colors.navy} 38%, ${fr.colors.navyDeep} 100%)`,
      }}
    >
      {/* velvet sheen folds */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 40% at ${30 + dx / 20}% ${70 + dy / 30}%, rgba(201,162,75,${0.07 * warmth}) 0%, transparent 70%),
            radial-gradient(50% 35% at ${78 - dx / 25}% ${22 + dy / 40}%, rgba(230,199,122,${0.06 * warmth}) 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.35,
          background:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.012) 0px, rgba(0,0,0,0.02) 3px, rgba(255,255,255,0.0) 7px)",
        }}
      />
    </AbsoluteFill>
  );
};

// soft volumetric light beams with dust
export const Beams: React.FC<{ intensity?: number; angle?: number; x?: number }> = ({
  intensity = 1,
  angle = 24,
  x = 0.18,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", overflow: "hidden" }}>
      {[0, 1, 2].map((i) => {
        const sway = Math.sin(frame / (70 + i * 23) + i) * 3;
        const w = [260, 140, 380][i];
        const op = [0.16, 0.1, 0.07][i] * intensity * (0.85 + 0.15 * Math.sin(frame / 40 + i * 2));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -400,
              left: FR_W * x + i * 170 - w / 2,
              width: w,
              height: 3000,
              transformOrigin: "50% 0%",
              transform: `rotate(${angle + sway - i * 6}deg)`,
              background: `linear-gradient(180deg, rgba(230,199,122,${op * 1.4}) 0%, rgba(230,199,122,${op}) 30%, rgba(201,162,75,${op * 0.4}) 65%, transparent 90%)`,
              maskImage: "linear-gradient(90deg, transparent, black 40%, black 60%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, black 40%, black 60%, transparent)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// floating gold particles at three depths + large bokeh discs
export const Particles: React.FC<{
  count?: number;
  converge?: number; // 0..1 pulls particles toward (cx, cy)
  cx?: number;
  cy?: number;
  speed?: number;
  opacity?: number;
}> = ({ count = 70, converge = 0, cx = 540, cy = 760, speed = 1, opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {Array.from({ length: count }).map((_, i) => {
        const depth = rand(i, 3); // 0 far .. 1 near
        const size = 2 + depth * depth * 9;
        const baseX = rand(i, 1) * 1180 - 50;
        const rise = (frame * speed * (0.3 + depth * 1.1) + rand(i, 2) * 2100) % 2100;
        const baseY = 2000 - rise;
        const wob = Math.sin(frame / (30 + rand(i, 4) * 40) + i) * (10 + depth * 25);
        const x = baseX + wob + (cx - baseX) * converge;
        const y = baseY + (cy - baseY) * converge;
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(frame / (14 + rand(i, 5) * 20) + i * 1.7));
        const bokeh = depth > 0.9;
        const s = bokeh ? size * 7 : size;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - s / 2,
              top: y - s / 2,
              width: s,
              height: s,
              borderRadius: "50%",
              opacity: (bokeh ? 0.22 : 0.35 + depth * 0.6) * tw,
              background: bokeh
                ? `radial-gradient(circle, rgba(230,199,122,0.55) 0%, rgba(230,199,122,0.25) 45%, rgba(230,199,122,0.0) 70%)`
                : `radial-gradient(circle, #FFF3CF 0%, ${fr.colors.goldHi} 35%, rgba(201,162,75,0) 72%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- layers 4 + 5: grade, grain, vignette ----------
export const Grade: React.FC<{ warm?: number }> = ({ warm = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: fr.colors.gold, mixBlendMode: "soft-light", opacity: 0.1 * warm }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(6,19,37,0.55) 0%, transparent 18%, transparent 78%, rgba(6,19,37,0.6) 100%)",
      }}
    />
  </AbsoluteFill>
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: noise,
        backgroundSize: "240px",
        backgroundPosition: `${(frame * 37) % 240}px ${(frame * 53) % 240}px`,
        opacity: 0.07,
        mixBlendMode: "overlay",
      }}
    />
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse 75% 60% at 50% 46%, transparent 55%, rgba(3,10,22,0.62) 100%)",
    }}
  />
);

// anamorphic flare: horizontal streak + soft core, for key hits
export const Flare: React.FC<{ x: number; y: number; p: number; width?: number }> = ({ x, y, p, width = 1300 }) => {
  if (p <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          left: -width / 2,
          top: -3,
          width,
          height: 6,
          borderRadius: 6,
          opacity: p,
          background: "linear-gradient(90deg, transparent, rgba(230,199,122,0.5) 30%, #FFF6DA 50%, rgba(230,199,122,0.5) 70%, transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -170,
          top: -170,
          width: 340,
          height: 340,
          borderRadius: "50%",
          opacity: p * 0.8,
          background: "radial-gradient(circle, rgba(255,246,218,0.9) 0%, rgba(230,199,122,0.35) 22%, transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 220 - 40,
          top: -40,
          width: 80,
          height: 80,
          borderRadius: "50%",
          opacity: p * 0.35,
          border: "2px solid rgba(230,199,122,0.5)",
        }}
      />
    </div>
  );
};

// ---------- glass panel ----------
export const glass = (tint = 0.08, rim = 0.22): React.CSSProperties => ({
  background: `linear-gradient(150deg, rgba(243,234,216,${tint + 0.06}) 0%, rgba(243,234,216,${tint}) 40%, rgba(243,234,216,${tint * 0.5}) 100%)`,
  border: `1.5px solid rgba(243,234,216,${rim})`,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.18), inset 0 -20px 40px rgba(6,19,37,0.25), 0 40px 80px -30px rgba(0,0,0,0.65)`,
});

// moving specular light sweep across a surface (place inside overflow:hidden parent)
export const Sweep: React.FC<{ p: number; width?: number; strength?: number; angle?: number }> = ({
  p,
  width = 180,
  strength = 0.35,
  angle = 18,
}) => (
  <div
    style={{
      position: "absolute",
      top: "-50%",
      bottom: "-50%",
      left: `${-40 + p * 180}%`,
      width,
      transform: `rotate(${angle}deg)`,
      background: `linear-gradient(90deg, transparent, rgba(255,248,226,${strength}), transparent)`,
      pointerEvents: "none",
      mixBlendMode: "screen",
    }}
  />
);

// ---------- typography ----------
// gold foil text with extruded depth: back layer = solid extrusion, front = gradient foil,
// top = light sweep clipped to the glyphs
export const GoldText: React.FC<{
  children: string;
  size: number;
  depth?: number;
  sweep?: number;
  style?: React.CSSProperties;
}> = ({ children, size, depth = 0, sweep = -1, style }) => {
  const shadows = Array.from({ length: depth })
    .map((_, i) => `0 ${i + 1}px 0 ${i < depth - 2 ? fr.colors.goldDeep : fr.colors.goldShadow}`)
    .join(", ");
  const base: React.CSSProperties = {
    fontFamily: fr.fonts.display,
    fontWeight: 800,
    fontSize: size,
    letterSpacing: "-0.02em",
    lineHeight: 1.04,
    whiteSpace: "nowrap",
  };
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span
        style={{
          ...base,
          color: fr.colors.goldDeep,
          textShadow: depth
            ? `${shadows}, 0 ${depth + 10}px 30px rgba(0,0,0,0.55), 0 0 60px rgba(201,162,75,0.25)`
            : "0 0 40px rgba(201,162,75,0.35)",
        }}
      >
        {children}
      </span>
      <span
        style={{
          ...base,
          position: "absolute",
          left: 0,
          top: 0,
          backgroundImage: fr.goldFill,
          backgroundSize: "100% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {children}
      </span>
      {sweep >= 0 && sweep <= 1 ? (
        <span
          style={{
            ...base,
            position: "absolute",
            left: 0,
            top: 0,
            backgroundImage:
              "linear-gradient(105deg, transparent 0%, transparent 42%, rgba(255,252,240,0.95) 50%, transparent 58%, transparent 100%)",
            backgroundSize: "300% 100%",
            backgroundPosition: `${100 - sweep * 100}% 0%`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {children}
        </span>
      ) : null}
    </span>
  );
};

// main message: lines of words, masked rise with stagger, exits faster than it enters
export const Title: React.FC<{
  lines: readonly (readonly Word[])[];
  start: number;
  end: number;
  top: number;
  size?: number;
  align?: "center" | "left";
  left?: number;
}> = ({ lines, start, end, top, size = 104, align = "center", left = 80 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start - 2 || frame > end + 14) return null;
  let idx = 0;
  const lineH = Math.round(size * 1.12);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: align === "center" ? 0 : left,
        width: align === "center" ? FR_W : FR_W - left * 2,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", gap: Math.round(size * 0.26), height: lineH, overflow: "visible" }}>
          {line.map((w) => {
            const i = idx++;
            const p = spring({ frame: frame - start - i * 4, fps, config: fr.spring.settle });
            const e = interpolate(frame, [end + i * 2, end + 9 + i * 2], [0, 1], { ...clamp, easing: fr.ease.in });
            const y = interpolate(p, [0, 1], [size * 0.9, 0]) - e * size * 0.6;
            const blur = Math.max(0, (1 - p) * 10) + e * 8;
            const sweep = interpolate(frame, [start + 18 + i * 4, start + 48 + i * 4], [0, 1], clamp);
            const st: React.CSSProperties = {
              display: "inline-block",
              opacity: Math.min(1, p * 1.4) * (1 - e),
              transform: `translateY(${y}px) rotateX(${(1 - p) * 40}deg)`,
              filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
            };
            if (w.g) {
              return (
                <span key={i} style={st}>
                  <GoldText size={size} depth={Math.round(size / 14)} sweep={sweep}>
                    {w.t}
                  </GoldText>
                </span>
              );
            }
            return (
              <span
                key={i}
                style={{
                  ...st,
                  fontFamily: fr.fonts.display,
                  fontWeight: 800,
                  fontSize: size,
                  lineHeight: 1.04,
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  color: w.r ? fr.colors.red : fr.colors.cream,
                  textShadow: w.r
                    ? `0 0 50px rgba(192,86,75,0.55), 0 6px 24px rgba(0,0,0,0.5)`
                    : "0 6px 30px rgba(0,0,0,0.55)",
                }}
              >
                {w.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// small tracked label / data caption
export const Label: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 22, color = fr.colors.creamDim, style }) => (
  <div
    style={{
      fontFamily: fr.fonts.body,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: "0.28em",
      color,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

// huge semi-transparent outlined background word
export const GhostWord: React.FC<{ text: string; top: number; x: number; opacity?: number; size?: number }> = ({
  text,
  top,
  x,
  opacity = 0.09,
  size = 360,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: x,
      fontFamily: fr.fonts.display,
      fontWeight: 900,
      fontSize: size,
      letterSpacing: "-0.04em",
      whiteSpace: "nowrap",
      color: "transparent",
      WebkitTextStroke: `2px rgba(230,199,122,${opacity * 3})`,
      opacity: 1,
      backgroundImage: `linear-gradient(180deg, rgba(230,199,122,${opacity}) 0%, rgba(230,199,122,0) 90%)`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
    }}
  >
    {text}
  </div>
);

// ---------- icons drawn in theme colors (no emoji) ----------
export const Check: React.FC<{ p: number; size: number; color?: string; stroke?: number }> = ({
  p,
  size,
  color = fr.colors.goldHi,
  stroke = 8,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
    <path
      d="M22 53 L42 72 L80 30"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={100}
      strokeDashoffset={100 * (1 - p)}
      pathLength={100}
    />
  </svg>
);

export const DoubleTick: React.FC<{ color: string; size?: number }> = ({ color, size = 22 }) => (
  <svg width={size * 1.5} height={size} viewBox="0 0 30 20">
    <path d="M2 11 L7 16 L16 5" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 14 L13 16 L22 5" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// clinic monogram avatar
export const Avatar: React.FC<{ letter: string; size: number; gold?: boolean; dim?: number }> = ({
  letter,
  size,
  gold = false,
  dim = 0,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: gold ? fr.goldBrushed : `linear-gradient(150deg, ${fr.colors.navyMid}, ${fr.colors.navyDeep})`,
      border: gold ? "none" : `1.5px solid rgba(243,234,216,${0.3 - dim * 0.15})`,
      boxShadow: gold ? "0 0 24px rgba(230,199,122,0.4), inset 0 2px 0 rgba(255,255,255,0.4)" : "none",
      fontFamily: fr.fonts.display,
      fontWeight: 800,
      fontSize: size * 0.42,
      color: gold ? fr.colors.navyDeep : dim > 0.5 ? fr.colors.steel : fr.colors.cream,
    }}
  >
    {letter}
  </div>
);

// three bouncing typing dots
export const Typing: React.FC<{ color?: string; size?: number }> = ({ color = fr.colors.cream, size = 12 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: size * 0.7 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            opacity: 0.4 + 0.6 * Math.max(0, Math.sin(frame / 3.2 - i * 0.9)),
            transform: `translateY(${-Math.max(0, Math.sin(frame / 3.2 - i * 0.9)) * size * 0.5}px)`,
          }}
        />
      ))}
    </div>
  );
};
