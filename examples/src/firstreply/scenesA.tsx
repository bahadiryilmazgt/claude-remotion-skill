import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { B, COPY, fr, FR_W } from "./theme3";
import {
  Avatar,
  Check,
  clamp,
  DoubleTick,
  Flare,
  GhostWord,
  glass,
  GoldText,
  Label,
  ramp,
  Sweep,
  Title,
  track,
  Typing,
} from "./atoms";

// ---------- chat bubble (shared by phone, race and win scenes) ----------
export const Bubble: React.FC<{
  text: string;
  side: "left" | "right";
  width?: number;
  size?: number;
  time?: string;
  ticks?: "one" | "two" | "none";
  variant?: "cream" | "gold";
  style?: React.CSSProperties;
}> = ({ text, side, width, size = 26, time, ticks = "none", variant = "cream", style }) => {
  const cream = variant === "cream";
  return (
    <div
      style={{
        width,
        maxWidth: width ? undefined : 560,
        padding: `${size * 0.62}px ${size * 0.8}px ${size * 0.5}px`,
        borderRadius: size * 1.05,
        borderBottomRightRadius: side === "right" ? size * 0.25 : size * 1.05,
        borderBottomLeftRadius: side === "left" ? size * 0.25 : size * 1.05,
        background: cream
          ? `linear-gradient(160deg, #FBF5E8 0%, ${fr.colors.cream} 60%, #E9DCC1 100%)`
          : "linear-gradient(150deg, rgba(230,199,122,0.30) 0%, rgba(201,162,75,0.16) 60%, rgba(201,162,75,0.10) 100%)",
        border: cream ? "none" : "1.5px solid rgba(230,199,122,0.55)",
        boxShadow: cream
          ? "0 24px 50px -20px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.8)"
          : "0 24px 50px -24px rgba(0,0,0,0.6), inset 0 1.5px 0 rgba(255,240,200,0.35)",
        fontFamily: fr.fonts.body,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.28,
        color: cream ? fr.colors.navyDeep : fr.colors.cream,
        ...style,
      }}
    >
      {text}
      {time ? (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 6,
            marginTop: 4,
            fontSize: size * 0.62,
            fontWeight: 500,
            color: cream ? "rgba(11,31,58,0.5)" : fr.colors.creamDim,
          }}
        >
          {time}
          {ticks !== "none" ? (
            ticks === "two" ? (
              <DoubleTick color={fr.colors.gold} size={size * 0.62} />
            ) : (
              <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 20 20">
                <path d="M3 11 L8 16 L17 5" fill="none" stroke="rgba(11,31,58,0.45)" strokeWidth={2.4} strokeLinecap="round" />
              </svg>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

// ======================================================================
// SCENE 1+2 — the ad, the tap, the message (beats 0–19)
// ======================================================================
const PH_W = 500;
const PH_H = 1000;
const BEZ = 14;
const SC_W = PH_W - BEZ * 2;
const SC_H = PH_H - BEZ * 2;
const PERSP = 2000;
// in-phone bubble centre, phone-local coords (origin = phone centre)
const BUB_LOCAL = { x: 46, y: 300 };
const FLAT_Z = 214; // translateZ that reads as scale 1.12 at PERSP 2000
const FLAT_S = PERSP / (PERSP - FLAT_Z);
export const HANDOFF = { x: 540, y: 470, s: 1.5 };

const Skyline: React.FC = () => (
  <svg width={SC_W} height={240} viewBox="0 0 472 240" style={{ position: "absolute", bottom: 0, left: 0 }}>
    <defs>
      <linearGradient id="sky-s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#10284A" />
        <stop offset="1" stopColor="#061325" />
      </linearGradient>
    </defs>
    <g fill="url(#sky-s)">
      {/* minarets */}
      <rect x="92" y="50" width="12" height="190" />
      <path d="M92 50 L98 18 L104 50 Z" />
      <rect x="368" y="62" width="12" height="178" />
      <path d="M368 62 L374 30 L380 62 Z" />
      <rect x="150" y="90" width="9" height="150" />
      <path d="M150 90 L154.5 66 L159 90 Z" />
      <rect x="314" y="92" width="9" height="148" />
      <path d="M314 92 L318.5 68 L323 92 Z" />
      {/* domes */}
      <path d="M176 160 A60 60 0 0 1 296 160 Z" />
      <rect x="236" y="88" width="2" height="16" />
      <path d="M200 160 A36 36 0 0 1 236 130 L236 160 Z" />
      <path d="M130 190 A40 40 0 0 1 210 190 Z" />
      <path d="M262 190 A40 40 0 0 1 342 190 Z" />
      <rect x="60" y="188" width="352" height="52" />
      <rect x="0" y="214" width="472" height="26" />
    </g>
  </svg>
);

const AdPost: React.FC<{ press: number; ripple: number }> = ({ press, ripple }) => (
  <div style={{ width: SC_W }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
      <Avatar letter="Y" size={52} gold />
      <div>
        <div style={{ fontFamily: fr.fonts.body, fontWeight: 700, fontSize: 22, color: fr.colors.cream }}>
          {COPY.adClinic}
        </div>
        <div style={{ fontFamily: fr.fonts.body, fontWeight: 500, fontSize: 16, color: fr.colors.creamDim }}>Sponsored</div>
      </div>
    </div>
    <div
      style={{
        position: "relative",
        width: SC_W,
        height: 470,
        overflow: "hidden",
        background: "linear-gradient(180deg, #F7EEDB 0%, #F3EAD8 40%, #E9CF8E 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 236 - 110,
          top: 150,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, #FFF4D2 0%, #E6C77A 45%, rgba(201,162,75,0) 72%)",
        }}
      />
      <Skyline />
      <div
        style={{
          position: "absolute",
          top: 34,
          left: 30,
          fontFamily: fr.fonts.display,
          fontWeight: 800,
          fontSize: 42,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: fr.colors.navyDeep,
          whiteSpace: "pre-line",
        }}
      >
        {COPY.adHeadline}
      </div>
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 30,
          fontFamily: fr.fonts.body,
          fontWeight: 600,
          fontSize: 17,
          letterSpacing: "0.18em",
          color: fr.colors.goldDeep,
        }}
      >
        CONSULTATION · 24/7
      </div>
    </div>
    <div style={{ padding: "16px 18px", position: "relative" }}>
      <div
        style={{
          position: "relative",
          height: 66,
          borderRadius: 16,
          overflow: "hidden",
          background: fr.goldBrushed,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          transform: `scale(${1 - press * 0.05})`,
          boxShadow: `0 0 ${30 + press * 40}px rgba(230,199,122,${0.25 + press * 0.4})`,
        }}
      >
        <span style={{ fontFamily: fr.fonts.body, fontWeight: 800, fontSize: 24, color: fr.colors.navyDeep }}>{COPY.adCta}</span>
        <svg width="26" height="26" viewBox="0 0 26 26">
          <path d="M8 4 L17 13 L8 22" fill="none" stroke={fr.colors.navyDeep} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {ripple > 0 && ripple < 1 ? (
          <div
            style={{
              position: "absolute",
              left: 300 - 200 * ripple,
              top: 33 - 200 * ripple,
              width: 400 * ripple,
              height: 400 * ripple,
              borderRadius: "50%",
              background: "rgba(255,250,235,0.55)",
              opacity: 1 - ripple,
            }}
          />
        ) : null}
      </div>
      {[0.92, 0.7].map((w, i) => (
        <div key={i} style={{ marginTop: 16, height: 12, width: `${w * 100}%`, borderRadius: 6, background: "rgba(243,234,216,0.12)" }} />
      ))}
    </div>
  </div>
);

const PlaceholderPost: React.FC = () => (
  <div style={{ width: SC_W, padding: "16px 20px" }}>
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(243,234,216,0.12)" }} />
      <div style={{ width: 160, height: 14, borderRadius: 7, background: "rgba(243,234,216,0.12)" }} />
    </div>
    <div
      style={{
        marginTop: 16,
        height: 420,
        borderRadius: 4,
        background: "linear-gradient(160deg, rgba(91,101,119,0.35), rgba(16,40,74,0.6))",
      }}
    />
  </div>
);

const ChatScreen: React.FC<{ f: number }> = ({ f }) => {
  const typeP = interpolate(f, [B(10.2), B(13.6)], [0, 1], clamp);
  const chars = Math.floor(typeP * COPY.patientMsg.length);
  const sent = f >= B(14);
  const { fps } = useVideoConfig();
  const bp = spring({ frame: f - B(14), fps, config: fr.spring.settle });
  const cursor = Math.floor(f / 8) % 2 === 0 && !sent;
  const showBubble = sent && f < B(16.5);
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${fr.colors.navyMid}, ${fr.colors.navyDeep})` }}>
      {/* subtle pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          backgroundImage: "radial-gradient(rgba(230,199,122,0.07) 1.5px, transparent 1.5px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          height: 96,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 18px",
          borderBottom: "1px solid rgba(243,234,216,0.1)",
          background: "rgba(6,19,37,0.5)",
        }}
      >
        <svg width="22" height="30" viewBox="0 0 22 30">
          <path d="M16 4 L6 15 L16 26" fill="none" stroke={fr.colors.cream} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Avatar letter="Y" size={56} gold />
        <div>
          <div style={{ fontFamily: fr.fonts.body, fontWeight: 700, fontSize: 25, color: fr.colors.cream }}>{COPY.adClinic}</div>
          <div style={{ fontFamily: fr.fonts.body, fontWeight: 500, fontSize: 17, color: fr.colors.creamDim }}>online</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 176,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "6px 16px",
          borderRadius: 12,
          background: "rgba(243,234,216,0.1)",
          fontFamily: fr.fonts.body,
          fontWeight: 600,
          fontSize: 16,
          color: fr.colors.creamDim,
        }}
      >
        Today
      </div>
      <div
        style={{
          position: "absolute",
          top: 236,
          left: 46,
          right: 46,
          padding: "28px 24px",
          borderRadius: 26,
          background: "rgba(243,234,216,0.06)",
          border: "1px solid rgba(243,234,216,0.12)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Avatar letter="Y" size={92} gold />
        <div style={{ fontFamily: fr.fonts.body, fontWeight: 700, fontSize: 26, color: fr.colors.cream, marginTop: 6 }}>{COPY.adClinic}</div>
        <div style={{ fontFamily: fr.fonts.body, fontWeight: 500, fontSize: 18, color: fr.colors.creamDim }}>Hair · Dental · Aesthetics</div>
        <div style={{ fontFamily: fr.fonts.body, fontWeight: 600, fontSize: 15, letterSpacing: "0.2em", color: fr.colors.gold }}>ISTANBUL</div>
      </div>
      {showBubble ? (
        <div
          style={{
            position: "absolute",
            right: 20,
            bottom: SC_H - 860,
            transformOrigin: "100% 100%",
            transform: `scale(${interpolate(bp, [0, 1], [0.5, 1])}) translateY(${(1 - bp) * 30}px)`,
            opacity: Math.min(1, bp * 2),
          }}
        >
          <Bubble text={COPY.patientMsg} side="right" width={330} time="21:48" ticks={f >= B(15) ? "two" : "one"} />
        </div>
      ) : null}
      {/* input bar */}
      <div style={{ position: "absolute", left: 16, right: 16, top: 876, height: 72, display: "flex", gap: 12 }}>
        <div
          style={{
            flex: 1,
            borderRadius: 36,
            background: "rgba(243,234,216,0.1)",
            border: "1px solid rgba(243,234,216,0.16)",
            display: "flex",
            alignItems: "center",
            padding: "0 22px",
            fontFamily: fr.fonts.body,
            fontWeight: 500,
            fontSize: 20,
            color: fr.colors.cream,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {sent ? (
            <span style={{ color: fr.colors.creamDim }}>Message</span>
          ) : chars > 0 ? (
            <span style={{ display: "inline-block", direction: "rtl", overflow: "hidden", maxWidth: 300 }}>
              <bdi>{COPY.patientMsg.slice(0, chars)}</bdi>
            </span>
          ) : (
            <span style={{ color: fr.colors.creamDim }}>Message</span>
          )}
          {cursor ? <span style={{ width: 2, height: 26, marginLeft: 2, background: fr.colors.goldHi }} /> : null}
        </div>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: fr.goldBrushed,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 - 0.12 * Math.max(0, 1 - Math.abs(f - B(13.9)) / 4)})`,
            boxShadow: "0 0 24px rgba(230,199,122,0.35)",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 30 30">
            <path d="M5 15 L25 6 L19 26 L15 17 Z" fill={fr.colors.navyDeep} />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const PhoneStory: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // continuous camera choreography on the phone
  const z = track(f, [
    [0, -1700],
    [B(3), -90],
    [B(8.5), 0],
    [B(10.5), FLAT_Z],
    [B(16.5), FLAT_Z],
    [B(19), -1600],
  ]);
  const ry = track(f, [
    [0, -42],
    [B(3), -15],
    [B(8.5), -8],
    [B(10.5), 0],
    [B(16.5), 0],
    [B(19), 34],
  ]);
  const rx = track(f, [
    [0, 22],
    [B(3), 8],
    [B(8.5), 4],
    [B(10.5), 0],
    [B(16.5), 0],
    [B(19), -24],
  ]);
  const rz = track(f, [
    [0, 9],
    [B(3), 2],
    [B(10.5), 0],
  ]);
  const cy = track(f, [
    [0, 760],
    [B(3), 650],
    [B(8.5), 640],
    [B(10.5), 600],
    [B(16.5), 600],
    [B(19), 760],
  ]);
  const settled = f > B(10.5) && f < B(16.5) ? 0 : 1;
  const breathe = Math.sin(f / 26) * 5 * settled;
  const opacity = interpolate(f, [0, B(1.2)], [0, 1], clamp) * interpolate(f, [B(17.2), B(18.8)], [1, 0], clamp);

  // screen states
  const feedY = track(f, [[0, 760], [B(3.2), 0]], fr.ease.out);
  const tapF = B(6.5);
  const press = Math.max(0, 1 - Math.abs(f - tapF) / 5);
  const ripple = interpolate(f, [tapF, tapF + 18], [0, 1], clamp);
  const sw = ramp(f, B(8.4), B(9.9));

  // light sweep across the glass at the reveal
  const glare = interpolate(f, [B(2), B(5)], [0, 1], { ...clamp, easing: fr.ease.inOut });
  const glare2 = interpolate(f, [B(10), B(12)], [0, 1], { ...clamp, easing: fr.ease.inOut });

  // world-space bubble lift (beats 16.5 → 18.8)
  const lift = ramp(f, B(16.5), B(18.8), fr.ease.out);
  const startX = 540 + BUB_LOCAL.x * FLAT_S;
  const startY = 600 + BUB_LOCAL.y * FLAT_S;
  const bx = startX + (HANDOFF.x - startX) * lift;
  const by = startY + (HANDOFF.y - startY) * lift - Math.sin(lift * Math.PI) * 60;
  const bs = FLAT_S + (HANDOFF.s - FLAT_S) * lift;

  const tag = spring({ frame: f - B(2.2), fps, config: fr.spring.settle });
  const tagOut = interpolate(f, [B(16), B(16.6)], [1, 0], clamp);

  return (
    <AbsoluteFill>
      {/* layered ghost type */}
      <div style={{ opacity: interpolate(f, [B(1), B(3)], [0, 1], clamp) * interpolate(f, [B(8), B(9.5)], [1, 0], clamp) }}>
        <GhostWord text="21:47" top={300 + f * -0.25} x={-60 + f * 0.4} size={420} />
      </div>
      <div style={{ opacity: interpolate(f, [B(9.5), B(11)], [0, 1], clamp) * interpolate(f, [B(16.5), B(18)], [1, 0], clamp) }}>
        <GhostWord text="MESAJ" top={240} x={120 - (f - B(9)) * 0.5} size={330} />
      </div>

      <AbsoluteFill style={{ perspective: PERSP, perspectiveOrigin: `540px ${cy}px` }}>
        <div
          style={{
            position: "absolute",
            left: 540 - PH_W / 2,
            top: cy - PH_H / 2 + breathe,
            width: PH_W,
            height: PH_H,
            opacity,
            transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry + Math.sin(f / 40) * 1.5 * settled}deg) rotateZ(${rz}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* brushed gold body with rim light */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 78,
              background: fr.goldBrushed,
              boxShadow: `0 0 0 2px rgba(255,236,190,0.35), 0 80px 140px -40px rgba(0,0,0,0.85), 0 0 120px rgba(201,162,75,0.22)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: BEZ,
              borderRadius: 66,
              overflow: "hidden",
              background: fr.colors.navyDeep,
            }}
          >
            {/* AD feed */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateX(${-sw * 140}px)`,
                filter: sw > 0.01 ? `brightness(${1 - sw * 0.5})` : undefined,
              }}
            >
              <div style={{ position: "absolute", top: 60 + feedY - 470, left: 0 }}>
                <PlaceholderPost />
                <AdPost press={press} ripple={ripple} />
              </div>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 56, background: fr.colors.navyDeep }} />
            </div>
            {/* CHAT */}
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - sw) * SC_W}px)` }}>
              <ChatScreen f={f} />
            </div>
            {/* status bar */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 34,
                right: 34,
                display: "flex",
                justifyContent: "space-between",
                fontFamily: fr.fonts.body,
                fontWeight: 700,
                fontSize: 19,
                color: fr.colors.cream,
              }}
            >
              <span>21:47</span>
              <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[10, 14, 18].map((h) => (
                  <span key={h} style={{ width: 5, height: h, borderRadius: 2, background: fr.colors.cream }} />
                ))}
                <span style={{ width: 30, height: 14, borderRadius: 4, border: `2px solid ${fr.colors.cream}`, marginLeft: 6 }} />
              </span>
            </div>
            {/* glass reflections */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.05) 100%)",
              }}
            />
            <Sweep p={glare} width={160} strength={0.22} angle={22} />
            <Sweep p={glare2} width={120} strength={0.16} angle={22} />
          </div>
          {/* dynamic island */}
          <div
            style={{
              position: "absolute",
              top: BEZ + 14,
              left: PH_W / 2 - 60,
              width: 120,
              height: 32,
              borderRadius: 16,
              background: "#030A15",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* patient tag + leader line */}
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 214,
          opacity: tag * tagOut,
          transform: `translateY(${(1 - tag) * 30}px)`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 24px",
          borderRadius: 40,
          ...glass(0.07, 0.2),
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: fr.colors.goldHi, boxShadow: "0 0 14px #E6C77A" }} />
        <span style={{ fontFamily: fr.fonts.body, fontWeight: 600, fontSize: 24, color: fr.colors.cream }}>{COPY.patientMeta}</span>
      </div>

      {/* lifted bubble — leaves the phone and becomes "the message" */}
      {f >= B(16.5) ? (
        <div
          style={{
            position: "absolute",
            left: bx,
            top: by,
            transform: `translate(-50%, -50%) scale(${bs})`,
            filter: `drop-shadow(0 0 ${20 + lift * 40}px rgba(230,199,122,${0.25 + lift * 0.35}))`,
          }}
        >
          <Bubble text={COPY.patientMsg} side="right" width={330} time="21:48" ticks="two" />
        </div>
      ) : null}

      <Title lines={COPY.s1} start={B(3.5)} end={B(8.4)} top={1190} size={100} />
      <Title lines={COPY.s2} start={B(10.6)} end={B(16.2)} top={1250} size={108} />
    </AbsoluteFill>
  );
};

// ======================================================================
// SCENE 3+4 — five clinics, one message, the race (beats 19–50)
// ======================================================================
type Pose = { x: number; y: number; z: number; ry: number; rx: number; w: number; h: number };
const ARC: Pose[] = [
  { x: -235, y: 560, z: -240, ry: 30, rx: 6, w: 450, h: 140 },
  { x: 240, y: 700, z: -150, ry: -26, rx: 6, w: 450, h: 140 },
  { x: 0, y: 870, z: 120, ry: 0, rx: 2, w: 480, h: 148 },
  { x: -230, y: 1040, z: -120, ry: 22, rx: -4, w: 450, h: 140 },
  { x: 235, y: 1150, z: -260, ry: -28, rx: -6, w: 450, h: 140 },
];
const LANE_Y0 = 568;
const LANE_GAP = 146;
const LANE: Pose[] = ARC.map((_, i) => ({ x: 0, y: LANE_Y0 + i * LANE_GAP, z: 0, ry: 0, rx: 0, w: 930, h: 124 }));
export const WIN_LANE = { y: 700, s: 1.12, w: 930, h: 124 };
const RP = 1800;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const fmtClock = (sec: number) => {
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(ss)}`;
};

export const Race: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (n: number) => B(n); // local beats (scene starts at beat 19)

  // orbit camera during the arc phase, straightens into lanes
  const theta = track(f, [
    [0, -14],
    [L(6.5), 10],
    [L(10.5), 0],
  ]) + Math.sin(f / 50) * 2 * (1 - ramp(f, L(6.5), L(10.5)));

  const replyF = L(15);
  const secs = track(
    f,
    [
      [L(11), 0],
      [replyF, 47],
    ],
    fr.ease.soft,
  );
  const elapsed = track(f, [
    [replyF, 47],
    [L(19), 7800],
    [L(21), 20400],
    [L(23), 93600],
    [L(25), 101000],
  ]);
  const lateAt: Record<number, number> = { 1: L(19), 3: L(21), 0: L(23), 4: L(24) };
  const replied = f >= replyF;
  const won = spring({ frame: f - replyF, fps, config: fr.spring.settle });

  // waiting bars: shared clock fill
  const fill = (i: number) => {
    const stopF = i === COPY.winner ? replyF : lateAt[i];
    const t = Math.min(f, stopF);
    return track(t, [
      [L(11), 0],
      [replyF, 0.14],
      [L(25), 1],
    ]);
  };

  const exitP = (i: number) => ramp(f, L(28.6) + (i % 3) * 2, L(29.8) + (i % 3) * 2, fr.ease.in);
  const winMove = ramp(f, L(28.8), L(30.4), fr.ease.inOut);
  const sceneOut = f > L(30.8) ? 0 : 1;

  // bubble split → copies (lb 0.8 → 2.2)
  const bubbleOut = interpolate(f, [L(0.9), L(1.3)], [1, 0], clamp);
  const punch = 1 + 0.025 * Math.exp(-Math.max(0, f - replyF) / 6) * (replied ? 1 : 0);

  const poses = ARC.map((a, i) => {
    const m = ramp(f, L(6.6) + i * 2, L(10) + i * 2, fr.ease.inOut);
    const p: Pose = {
      x: lerp(a.x, LANE[i].x, m),
      y: lerp(a.y, LANE[i].y, m),
      z: lerp(a.z, LANE[i].z, m),
      ry: lerp(a.ry, LANE[i].ry, m),
      rx: lerp(a.rx, LANE[i].rx, m),
      w: lerp(a.w, LANE[i].w, m),
      h: lerp(a.h, LANE[i].h, m),
    };
    if (i === COPY.winner) {
      p.y = lerp(p.y, WIN_LANE.y, winMove);
      p.z = lerp(p.z, 140, winMove);
    } else {
      const e = exitP(i);
      p.y += e * 420;
      p.rx += e * 55;
      p.z -= e * 300;
    }
    return { p, m };
  });

  const project = (p: Pose) => {
    const t = (theta * Math.PI) / 180;
    const x2 = p.x * Math.cos(t) + p.z * Math.sin(t);
    const z2 = -p.x * Math.sin(t) + p.z * Math.cos(t);
    const s = RP / (RP - z2);
    return { sx: 540 + x2 * s, sy: 900 + (p.y - 900) * s, s, z2 };
  };

  // draw order: far first
  const order = poses.map((o, i) => ({ i, z: project(o.p).z2 })).sort((a, b) => a.z - b.z);

  const timerIn = spring({ frame: f - L(9.6), fps, config: fr.spring.settle });
  const timerOut = ramp(f, L(28.4), L(29.4), fr.ease.in);
  const flareP = interpolate(f, [replyF - 2, replyF + 2, replyF + 26], [0, 1, 0], clamp);

  // slow dolly-in through the race, a breath of roll, a punch on the reply
  const dolly = track(f, [
    [L(10), 1],
    [L(28), 1.06],
    [L(30), 1],
  ]);
  const roll = Math.sin(f / 70) * 0.5 * ramp(f, L(10), L(14));

  return (
    <AbsoluteFill style={{ opacity: sceneOut, transform: `scale(${dolly * punch}) rotate(${roll}deg)`, transformOrigin: "540px 860px" }}>
      <div style={{ opacity: interpolate(f, [L(10), L(12)], [0, 1], clamp) * (1 - timerOut) }}>
        <GhostWord text="00:47" top={1230} x={-40 - f * 0.3} size={400} opacity={0.035} />
      </div>

      {/* caption */}
      <div
        style={{
          position: "absolute",
          top: 330,
          width: FR_W,
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(f, [L(2.4), L(3.4)], [0, 1], clamp) * interpolate(f, [L(6.4), L(7.2)], [1, 0], clamp),
          transform: `translateY(${interpolate(f, [L(2.4), L(3.4)], [20, 0], { ...clamp, easing: fr.ease.out })}px)`,
        }}
      >
        <Label size={24} color={fr.colors.goldHi}>
          {COPY.s3cap}
        </Label>
      </div>

      {/* timer */}
      <div
        style={{
          position: "absolute",
          top: 268,
          width: FR_W,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: timerIn * (1 - timerOut),
          transform: `translateY(${(1 - timerIn) * 40 - timerOut * 60}px)`,
        }}
      >
        <Label size={22} color={replied ? fr.colors.goldHi : fr.colors.creamDim}>
          {COPY.race.timer}
        </Label>
        <div style={{ height: 150, marginTop: 8, display: "flex", alignItems: "center" }}>
          {replied ? (
            <GoldText size={140} depth={8} sweep={interpolate(f, [replyF, replyF + 30], [0, 1], clamp)}>
              {`00:${String(Math.floor(secs)).padStart(2, "0")}`}
            </GoldText>
          ) : (
            <span
              style={{
                fontFamily: fr.fonts.display,
                fontWeight: 800,
                fontSize: 140,
                letterSpacing: "-0.02em",
                color: fr.colors.cream,
                fontVariantNumeric: "tabular-nums",
                textShadow: "0 8px 30px rgba(0,0,0,0.5)",
              }}
            >
              {`00:${String(Math.floor(secs)).padStart(2, "0")}`}
            </span>
          )}
        </div>
        <div style={{ height: 34, opacity: interpolate(f, [L(16), L(17)], [0, 1], clamp) }}>
          <Label size={22} color={fr.colors.steel} style={{ fontVariantNumeric: "tabular-nums" }}>
            {`GEÇEN SÜRE  ${elapsed >= 86400 ? "1 GÜN+" : fmtClock(elapsed)}`}
          </Label>
        </div>
      </div>

      {/* the original message, then its five copies */}
      {bubbleOut > 0 ? (
        <div
          style={{
            position: "absolute",
            left: HANDOFF.x,
            top: HANDOFF.y + Math.sin(f / 12) * 4,
            transform: `translate(-50%, -50%) scale(${HANDOFF.s * (1 + 0.04 * Math.sin(Math.min(1, f / L(0.9)) * Math.PI))})`,
            opacity: bubbleOut,
            filter: "drop-shadow(0 0 50px rgba(230,199,122,0.55))",
          }}
        >
          <Bubble text={COPY.patientMsg} side="right" width={330} time="21:48" ticks="two" />
        </div>
      ) : null}
      {ARC.map((a, i) => {
        const t0 = L(0.9) + i * 3;
        const k = ramp(f, t0, t0 + 18, fr.ease.inOut);
        if (k <= 0 || k >= 1) return null;
        const pr = project(poses[i].p);
        const x = lerp(HANDOFF.x, pr.sx, k);
        const y = lerp(HANDOFF.y, pr.sy, k) - Math.sin(k * Math.PI) * 120;
        const s = lerp(HANDOFF.s, 0.32, k);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${s})`,
              filter: "drop-shadow(0 0 30px rgba(230,199,122,0.6))",
            }}
          >
            <Bubble text={COPY.patientMsg} side="right" width={330} />
          </div>
        );
      })}

      {/* clinic cards → lanes */}
      {order.map(({ i }) => {
        const { p, m } = poses[i];
        const pr = project(p);
        const isWin = i === COPY.winner;
        const appear = spring({ frame: f - (L(0.7) + i * 3), fps, config: fr.spring.settle });
        const arrive = Math.max(0, 1 - Math.abs(f - (L(0.9) + i * 3 + 18)) / 10);
        const lateF = lateAt[i];
        const isLate = !isWin && lateF !== undefined && f >= lateF;
        const grey = isWin ? 0 : ramp(f, L(18), L(24.5));
        const e = isWin ? 0 : exitP(i);
        const winGlow = isWin ? won * (replied ? 1 : 0) : 0;
        const hideWin = isWin && f >= L(30.2) ? 0 : 1;
        const typing = isWin && f >= L(13.3) && f < replyF;
        const nameColor = isWin && replied ? fr.colors.goldHi : grey > 0.5 ? fr.colors.steel : fr.colors.cream;
        const ws = isWin ? lerp(1, WIN_LANE.s, winMove) : 1;
        const lateBadge = isLate ? spring({ frame: f - lateF, fps, config: fr.spring.snappy }) : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pr.sx,
              top: pr.sy,
              width: p.w,
              height: p.h,
              opacity: appear * (1 - e) * hideWin,
              filter: e > 0.01 ? `blur(${e * 10}px)` : grey > 0.01 ? `saturate(${1 - grey * 0.8})` : undefined,
              transform: `translate(-50%, -50%) perspective(1400px) scale(${pr.s * ws * interpolate(appear, [0, 1], [0.7, 1]) * (1 + arrive * 0.04)}) rotateY(${p.ry + theta * 0.6}deg) rotateX(${p.rx}deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 30,
                overflow: "hidden",
                ...glass(isWin && replied ? 0.1 : 0.07, 0.2 + arrive * 0.4),
                border: winGlow > 0 ? `2px solid rgba(230,199,122,${0.4 + winGlow * 0.5})` : glass().border,
                boxShadow:
                  winGlow > 0
                    ? `0 0 ${60 * winGlow}px rgba(230,199,122,${0.45 * winGlow}), inset 0 1.5px 0 rgba(255,240,200,0.4), 0 40px 80px -30px rgba(0,0,0,0.7)`
                    : glass().boxShadow,
              }}
            >
              {winGlow > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: winGlow,
                    background: "linear-gradient(100deg, rgba(201,162,75,0.28) 0%, rgba(201,162,75,0.08) 60%, rgba(201,162,75,0.18) 100%)",
                  }}
                />
              ) : null}
              <Sweep p={interpolate(f, [replyF, replyF + 24], [0, 1], clamp) * (isWin ? 1 : 0) - (isWin ? 0 : 2)} width={200} strength={0.4} />
              {/* waiting bar */}
              <div
                style={{
                  position: "absolute",
                  left: 26,
                  right: 26,
                  bottom: 14,
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(243,234,216,0.08)",
                  opacity: m,
                }}
              >
                <div
                  style={{
                    width: `${fill(i) * 100}%`,
                    height: "100%",
                    borderRadius: 2,
                    background: isWin ? fr.goldFill : grey > 0.5 ? fr.colors.steel : "rgba(243,234,216,0.5)",
                    boxShadow: isWin ? "0 0 12px rgba(230,199,122,0.8)" : "none",
                  }}
                />
              </div>
            </div>
            <div style={{ position: "absolute", left: 24, top: 0, bottom: 10, right: 24, display: "flex", alignItems: "center", gap: 18 }}>
              <Avatar letter={COPY.clinics[i][0]} size={64} gold={isWin && replied} dim={grey} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: fr.fonts.body, fontWeight: 700, fontSize: 29, color: nameColor, whiteSpace: "nowrap" }}>
                    {COPY.clinics[i]}
                  </span>
                  {isWin ? (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 8,
                        border: `1.5px solid ${fr.colors.gold}`,
                        fontFamily: fr.fonts.body,
                        fontWeight: 800,
                        fontSize: 17,
                        letterSpacing: "0.12em",
                        color: fr.colors.goldHi,
                      }}
                    >
                      SİZ
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: fr.fonts.body,
                    fontWeight: 500,
                    fontSize: 20,
                    color: isWin && replied ? fr.colors.cream : fr.colors.creamDim,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {isWin && replied ? (
                    "Hello Sarah! Happy to help."
                  ) : (
                    <>
                      <DoubleTick color={grey > 0.5 ? fr.colors.steel : fr.colors.creamDim} size={16} />
                      {m > 0.5 ? COPY.race.seen : COPY.patientMsg}
                    </>
                  )}
                </div>
              </div>
              {/* right side status */}
              {typing ? <Typing color={fr.colors.goldHi} size={12} /> : null}
              {isWin && replied ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px 8px 10px",
                    borderRadius: 30,
                    background: fr.goldBrushed,
                    transform: `scale(${won})`,
                    boxShadow: "0 0 30px rgba(230,199,122,0.5)",
                  }}
                >
                  <Check p={interpolate(f, [replyF + 4, replyF + 16], [0, 1], { ...clamp, easing: fr.ease.out })} size={30} color={fr.colors.navyDeep} stroke={12} />
                  <span style={{ fontFamily: fr.fonts.body, fontWeight: 800, fontSize: 24, color: fr.colors.navyDeep, fontVariantNumeric: "tabular-nums" }}>
                    00:47
                  </span>
                </div>
              ) : null}
              {isLate ? (
                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: 30,
                    border: `1.5px solid ${fr.colors.steel}`,
                    fontFamily: fr.fonts.body,
                    fontWeight: 700,
                    fontSize: 22,
                    color: fr.colors.steel,
                    whiteSpace: "nowrap",
                    opacity: lateBadge,
                    transform: `translateX(${(1 - lateBadge) * 30}px)`,
                  }}
                >
                  {COPY.lateTimes[i]}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      <Flare x={540 + 330} y={LANE_Y0 + COPY.winner * LANE_GAP} p={flareP} width={1400} />

      <Title lines={COPY.s3} start={L(2)} end={L(6.4)} top={1290} size={108} />
      <Title lines={COPY.s4a} start={L(16)} end={L(22.6)} top={1290} size={104} />
      <Title lines={COPY.s4b} start={L(24.4)} end={L(28.6)} top={1290} size={104} />
    </AbsoluteFill>
  );
};
