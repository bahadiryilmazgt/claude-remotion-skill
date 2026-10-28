import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { B, COPY, fr, FR_W } from "./theme3";
import { Avatar, Check, clamp, Flare, GhostWord, glass, GoldText, Label, ramp, Sweep, Title, track } from "./atoms";
import { Bubble, WIN_LANE } from "./scenesA";

// ======================================================================
// SCENE 5 — the conversation, the booking (beats 49–62.5)
// ======================================================================
const PANEL = { w: 860, h: 800, cy: 690 };

export const Win: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (n: number) => B(n);

  // the winning lane unfolds into the conversation panel
  const unfold = spring({ frame: f - L(0.6), fps, config: fr.spring.heavy });
  const w = interpolate(unfold, [0, 1], [WIN_LANE.w * WIN_LANE.s, PANEL.w]);
  const h = interpolate(unfold, [0, 1], [WIN_LANE.h * WIN_LANE.s, PANEL.h]);
  const cy = interpolate(unfold, [0, 1], [WIN_LANE.y, PANEL.cy]);

  const ticketF = L(7.2);
  const recede = ramp(f, ticketF - 4, ticketF + 14, fr.ease.out);
  const orbit = track(f, [
    [0, 0],
    [L(3), 7],
    [L(7), -4],
    [L(13), -8],
  ]);
  const push = track(f, [
    [0, 1],
    [L(7), 1.04],
  ]);

  const tk = spring({ frame: f - ticketF, fps, config: fr.spring.settle });
  const tSweep = interpolate(f, [ticketF + 10, ticketF + 40], [0, 1], clamp);
  const flareP = interpolate(f, [ticketF + 2, ticketF + 6, ticketF + 30], [0, 1, 0], clamp);
  const exit = ramp(f, L(11.6), L(12.6), fr.ease.inOut);

  const times = [1.0, 2.0, 3.2, 4.4, 5.6];
  let yCursor = 0;

  return (
    <AbsoluteFill>
      <div style={{ opacity: interpolate(f, [L(1), L(3)], [0, 1], clamp) * (1 - exit) }}>
        <GhostWord text="RANDEVU" top={1500} x={-120 + f * 0.6} size={300} opacity={0.035} />
      </div>
      <AbsoluteFill style={{ perspective: 1800, perspectiveOrigin: `540px ${PANEL.cy}px` }}>
        {/* conversation panel */}
        <div
          style={{
            position: "absolute",
            left: 540 - w / 2,
            top: cy - h / 2,
            width: w,
            height: h,
            borderRadius: 40,
            overflow: "hidden",
            ...glass(0.08, 0.24),
            border: "2px solid rgba(230,199,122,0.5)",
            transform: `rotateY(${orbit}deg) scale(${push * (1 - recede * 0.1)}) translateY(${-recede * 40 - exit * 80}px)`,
            filter: recede > 0.01 ? `blur(${recede * 5}px) brightness(${1 - recede * 0.45})` : undefined,
            opacity: 1 - exit,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 124,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 30px",
              borderBottom: `1px solid rgba(230,199,122,${0.3 * unfold})`,
              background: "linear-gradient(100deg, rgba(201,162,75,0.22), rgba(201,162,75,0.05))",
            }}
          >
            <Avatar letter="Y" size={72} gold />
            <div>
              <div style={{ fontFamily: fr.fonts.body, fontWeight: 700, fontSize: 32, color: fr.colors.goldHi }}>{COPY.adClinic}</div>
              <div style={{ fontFamily: fr.fonts.body, fontWeight: 500, fontSize: 21, color: fr.colors.creamDim }}>
                {COPY.patient} · online
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 30, right: 30, top: 160, opacity: unfold }}>
            {COPY.convo.map((m, i) => {
              const p = spring({ frame: f - L(times[i]), fps, config: fr.spring.settle });
              const top = yCursor;
              yCursor += 112;
              const isClinic = m.from === "clinic";
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top,
                    left: isClinic ? 0 : undefined,
                    right: isClinic ? undefined : 0,
                    opacity: Math.min(1, p * 1.6),
                    transformOrigin: isClinic ? "0% 100%" : "100% 100%",
                    transform: `translateY(${(1 - p) * 30}px) scale(${interpolate(p, [0, 1], [0.7, 1])})`,
                  }}
                >
                  <Bubble text={m.text} side={isClinic ? "left" : "right"} size={28} variant={isClinic ? "gold" : "cream"} />
                </div>
              );
            })}
          </div>
        </div>

        {/* booking ticket */}
        {f >= ticketF - 2 ? (
          <div
            style={{
              position: "absolute",
              left: 540 - 410,
              top: PANEL.cy - 210,
              width: 820,
              height: 420,
              opacity: Math.min(1, tk * 2) * (1 - exit),
              transformOrigin: "50% 100%",
              transform: `translateY(${(1 - tk) * 160 - exit * 120}px) rotateX(${(1 - tk) * -85}deg) rotateY(${orbit * 0.5}deg) scale(${1 + exit * 0.1})`,
              filter: "drop-shadow(0 60px 60px rgba(0,0,0,0.6)) drop-shadow(0 0 50px rgba(201,162,75,0.3))",
              display: "flex",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 260,
                height: "100%",
                borderRadius: "36px 0 0 36px",
                background: fr.goldBrushed,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <div style={{ fontFamily: fr.fonts.display, fontWeight: 900, fontSize: 150, lineHeight: 1, color: fr.colors.navyDeep, letterSpacing: "-0.04em" }}>
                {COPY.ticketDay}
              </div>
              <div style={{ fontFamily: fr.fonts.body, fontWeight: 800, fontSize: 30, letterSpacing: "0.22em", color: fr.colors.navyDeep, marginTop: 6 }}>
                {COPY.ticketMonth}
              </div>
              <Sweep p={tSweep} width={140} strength={0.6} />
            </div>
            <div
              style={{
                position: "relative",
                flex: 1,
                borderRadius: "0 36px 36px 0",
                background: "linear-gradient(150deg, #FBF5E8 0%, #F3EAD8 55%, #E8D9BA 100%)",
                borderLeft: "3px dashed rgba(138,106,38,0.45)",
                padding: "54px 44px",
                overflow: "hidden",
              }}
            >
              <div style={{ fontFamily: fr.fonts.body, fontWeight: 800, fontSize: 34, letterSpacing: "0.06em", color: fr.colors.navyDeep }}>
                {COPY.ticketTitle}
              </div>
              <div style={{ marginTop: 16, height: 3, width: 120, background: fr.goldFill, borderRadius: 2 }} />
              <div style={{ marginTop: 26, fontFamily: fr.fonts.body, fontWeight: 600, fontSize: 30, color: fr.colors.navy }}>{COPY.ticketSub}</div>
              <div style={{ marginTop: 10, fontFamily: fr.fonts.body, fontWeight: 500, fontSize: 25, color: "rgba(11,31,58,0.6)" }}>
                {COPY.patient} · {COPY.adClinic}
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 36,
                  bottom: 36,
                  width: 104,
                  height: 104,
                  borderRadius: "50%",
                  background: fr.goldBrushed,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${spring({ frame: f - ticketF - 8, fps, config: fr.spring.snappy })})`,
                  boxShadow: "0 0 40px rgba(230,199,122,0.6), inset 0 2px 0 rgba(255,255,255,0.5)",
                }}
              >
                <Check p={interpolate(f, [ticketF + 12, ticketF + 26], [0, 1], { ...clamp, easing: fr.ease.out })} size={70} color={fr.colors.navyDeep} stroke={11} />
              </div>
              <Sweep p={tSweep} width={160} strength={0.5} />
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
      <Flare x={540} y={PANEL.cy - 210} p={flareP} width={1500} />
      <Title lines={COPY.s5} start={L(8)} end={L(11.3)} top={1220} size={92} />
    </AbsoluteFill>
  );
};

// ======================================================================
// SCENE 6 — HIZ = GÜVEN = HASTA, with the reply-time curve (beats 61.5–70.5)
// ======================================================================
const VIZ = { x: 110, y: 280, w: 860, h: 400 };

export const Equation: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (n: number) => B(n);
  const draw = ramp(f, L(0.2), L(2.6), fr.ease.inOut);
  const exit = ramp(f, L(8), L(9), fr.ease.in);
  const vizIn = spring({ frame: f, fps, config: fr.spring.smooth });

  // decay curve: appointment chance vs reply time (qualitative, no numbers)
  const pw = VIZ.w - 120;
  const ph = VIZ.h - 130;
  const pts = Array.from({ length: 60 }).map((_, i) => {
    const t = i / 59;
    const v = 0.06 + 0.9 * Math.exp(-t * 4.2);
    return [70 + t * pw, 40 + (1 - v) * ph] as const;
  });
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${path} L ${70 + pw} ${40 + ph} L 70 ${40 + ph} Z`;
  const head = pts[Math.min(59, Math.floor(draw * 59))];
  const fastDot = spring({ frame: f - L(2.4), fps, config: fr.spring.snappy });
  const lateDot = spring({ frame: f - L(2.9), fps, config: fr.spring.snappy });

  const words = COPY.eq;
  const hits = [L(0.5), L(1.5), L(2.5)];
  const flareP = interpolate(f, [hits[2], hits[2] + 4, hits[2] + 26], [0, 1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `scale(${1 + exit * 0.12})`,
        filter: exit > 0.01 ? `blur(${exit * 10}px)` : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: VIZ.x,
          top: VIZ.y,
          width: VIZ.w,
          height: VIZ.h,
          borderRadius: 34,
          ...glass(0.05, 0.16),
          opacity: vizIn,
          transform: `translateY(${(1 - vizIn) * 40}px) perspective(1600px) rotateX(${(1 - vizIn) * 20 + 4}deg)`,
        }}
      >
        <svg width={VIZ.w} height={VIZ.h} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="eq-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E6C77A" stopOpacity="0.32" />
              <stop offset="1" stopColor="#E6C77A" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="eq-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#F6E3A8" />
              <stop offset="0.5" stopColor="#C9A24B" />
              <stop offset="1" stopColor="#5B6577" />
            </linearGradient>
            <clipPath id="eq-clip">
              <rect x="0" y="0" width={70 + pw * draw} height={VIZ.h} />
            </clipPath>
          </defs>
          {/* grid dots */}
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 12 }).map((__, c) => (
              <circle key={`${r}-${c}`} cx={70 + (c * pw) / 11} cy={40 + (r * ph) / 5} r={1.6} fill="rgba(243,234,216,0.16)" />
            )),
          )}
          <line x1={70} y1={40 + ph} x2={70 + pw * draw} y2={40 + ph} stroke="rgba(243,234,216,0.35)" strokeWidth={2} />
          <line x1={70} y1={40 + ph} x2={70} y2={40 + ph - ph * Math.min(1, draw * 2)} stroke="rgba(243,234,216,0.35)" strokeWidth={2} />
          <g clipPath="url(#eq-clip)">
            <path d={area} fill="url(#eq-area)" />
            <path d={path} fill="none" stroke="url(#eq-line)" strokeWidth={6} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px rgba(230,199,122,0.6))" }} />
          </g>
          {draw > 0 && draw < 1 ? <circle cx={head[0]} cy={head[1]} r={9} fill="#FFF3CF" style={{ filter: "drop-shadow(0 0 14px #E6C77A)" }} /> : null}
          <circle cx={pts[3][0]} cy={pts[3][1]} r={14 * fastDot} fill={fr.colors.goldHi} style={{ filter: "drop-shadow(0 0 18px #E6C77A)" }} />
          <circle cx={pts[52][0]} cy={pts[52][1]} r={11 * lateDot} fill="none" stroke={fr.colors.steel} strokeWidth={3} />
        </svg>
        <Label size={18} color={fr.colors.creamDim} style={{ position: "absolute", left: 70, bottom: 34, opacity: draw }}>
          {COPY.vizX} →
        </Label>
        <Label size={18} color={fr.colors.creamDim} style={{ position: "absolute", left: 30, top: 18, opacity: draw }}>
          ↑ {COPY.vizY}
        </Label>
        <Label
          size={18}
          color={fr.colors.goldHi}
          style={{ position: "absolute", left: pts[3][0] + 28, top: pts[3][1] - 12, opacity: fastDot, letterSpacing: "0.2em" }}
        >
          İLK CEVAP
        </Label>
        <Label
          size={18}
          color={fr.colors.steel}
          style={{ position: "absolute", left: pts[52][0] - 150, top: pts[52][1] - 52, opacity: lateDot, letterSpacing: "0.2em" }}
        >
          GEÇ CEVAP
        </Label>
      </div>

      <div style={{ position: "absolute", top: 760, width: FR_W, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {words.map((wd, i) => {
          const p = spring({ frame: f - hits[i], fps, config: fr.spring.settle });
          const sweep = interpolate(f, [hits[2] + 6 + i * 4, hits[2] + 36 + i * 4], [0, 1], clamp);
          const eq = spring({ frame: f - hits[i] + 5, fps, config: fr.spring.snappy });
          return (
            <React.Fragment key={wd}>
              {i > 0 ? (
                <div
                  style={{
                    height: 78,
                    display: "flex",
                    alignItems: "center",
                    opacity: eq,
                    transform: `scale(${eq})`,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[0, 1].map((k) => (
                      <div key={k} style={{ width: 70, height: 9, borderRadius: 5, background: fr.colors.cream, boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }} />
                    ))}
                  </div>
                </div>
              ) : null}
              <div
                style={{
                  opacity: Math.min(1, p * 1.5),
                  transform: `translateY(${(1 - p) * -60}px) scale(${interpolate(p, [0, 1], [1.5, 1])})`,
                  filter: p < 0.97 ? `blur(${(1 - p) * 14}px)` : undefined,
                }}
              >
                <GoldText size={150} depth={12} sweep={sweep}>
                  {wd}
                </GoldText>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <Flare x={540} y={760 + 2 * (156 + 78) + 78} p={flareP} width={1300} />
    </AbsoluteFill>
  );
};

// ======================================================================
// SCENE 7 — the emblem and the line (beats 69.5–82)
// ======================================================================
export const EMBLEM = { x: 540, y: 560 };

export const End: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (n: number) => B(n);
  const ring = ramp(f, L(1.3), L(3.2), fr.ease.inOut);
  const pop = spring({ frame: f - L(1.3), fps, config: fr.spring.settle });
  const check = interpolate(f, [L(2.6), L(3.4)], [0, 1], { ...clamp, easing: fr.ease.out });
  const spin = f * 0.6;
  const flareP = interpolate(f, [L(1.4), L(1.6), L(3.2)], [0, 1, 0], clamp);
  const R = 150;
  const C = 2 * Math.PI * R;
  const breathe = 1 + Math.sin(f / 24) * 0.012;
  const subIn = spring({ frame: f - L(5.2), fps, config: fr.spring.smooth });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: EMBLEM.x - 220,
          top: EMBLEM.y - 220,
          width: 440,
          height: 440,
          opacity: Math.min(1, pop * 2),
          transform: `scale(${interpolate(pop, [0, 1], [0.6, 1]) * breathe})`,
        }}
      >
        {/* halo */}
        <div
          style={{
            position: "absolute",
            inset: -120,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(230,199,122,0.22) 0%, rgba(201,162,75,0.08) 40%, transparent 68%)",
          }}
        />
        <svg width={440} height={440} viewBox="0 0 440 440" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="ring-g" gradientTransform={`rotate(${spin} 0.5 0.5)`}>
              <stop offset="0" stopColor="#8A6A26" />
              <stop offset="0.3" stopColor="#E6C77A" />
              <stop offset="0.5" stopColor="#FFF1C9" />
              <stop offset="0.7" stopColor="#C9A24B" />
              <stop offset="1" stopColor="#8A6A26" />
            </linearGradient>
          </defs>
          {/* crown + side button */}
          <rect x={200} y={28 + (1 - ring) * 30} width={40} height={30} rx={8} fill="url(#ring-g)" opacity={ring} />
          <rect x={212} y={52} width={16} height={22} fill="url(#ring-g)" opacity={ring} />
          <g transform="rotate(42 220 236)" opacity={ring}>
            <rect x={210} y={66} width={20} height={20} rx={5} fill="url(#ring-g)" />
          </g>
          {/* minute ticks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const show = ring > i / 12 ? 1 : 0;
            return (
              <line
                key={i}
                x1={220 + Math.sin(a) * (R - 26)}
                y1={236 - Math.cos(a) * (R - 26)}
                x2={220 + Math.sin(a) * (R - (i % 3 ? 36 : 44))}
                y2={236 - Math.cos(a) * (R - (i % 3 ? 36 : 44))}
                stroke={i % 3 ? "rgba(243,234,216,0.4)" : fr.colors.goldHi}
                strokeWidth={i % 3 ? 3 : 5}
                strokeLinecap="round"
                opacity={show}
              />
            );
          })}
          <circle
            cx={220}
            cy={236}
            r={R}
            fill="none"
            stroke="url(#ring-g)"
            strokeWidth={16}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - ring)}
            transform="rotate(-90 220 236)"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 16px rgba(230,199,122,0.55))" }}
          />
          <g transform="translate(220 236) scale(1.5) translate(-50 -50)">
            <path
              d="M24 52 L43 70 L78 32"
              fill="none"
              stroke="url(#ring-g)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 * (1 - check)}
              style={{ filter: "drop-shadow(0 0 10px rgba(230,199,122,0.6))" }}
            />
          </g>
        </svg>
      </div>
      <Flare x={EMBLEM.x} y={EMBLEM.y + 16} p={flareP} width={1500} />
      <Title lines={COPY.end} start={L(2.4)} end={L(99)} top={860} size={88} />
      <div
        style={{
          position: "absolute",
          top: 1222,
          width: FR_W,
          display: "flex",
          justifyContent: "center",
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 24}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 60 * subIn, height: 2, background: fr.goldFill }} />
          <span style={{ fontFamily: fr.fonts.body, fontWeight: 600, fontSize: 38, color: fr.colors.cream, letterSpacing: "0.02em" }}>
            {COPY.endSub}
          </span>
          <div style={{ width: 60 * subIn, height: 2, background: fr.goldFill }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
