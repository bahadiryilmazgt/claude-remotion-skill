import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { cpl } from "./theme";
import { T } from "./timeline";
import { Funnel, G, H } from "./Funnel";
import { Card, Chip, Icon, ip, Num, Rise, Sheen, useCount, useSec, useSpring, Words } from "./ui";

const C = cpl.colors;
const display: React.CSSProperties = { fontFamily: cpl.fonts.display };
const serif: React.CSSProperties = { fontFamily: cpl.fonts.serif, fontStyle: "italic" };

// scene wrapper: fast scale-through exit into the next scene
const Scene: React.FC<{ outAt: number; children: React.ReactNode; dir?: "up" | "left" }> = ({ outAt, children, dir = "up" }) => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const o = ip(frame, [outAt, outAt + sec(0.3)], [0, 1], cpl.ease.in);
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - o,
        transform: dir === "up" ? `scale(${1 + o * 0.14}) translateY(${-o * 60}px)` : `translateX(${-o * 260}px) scale(${1 - o * 0.06})`,
        filter: `blur(${o * 14}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Abs: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", top, left: 0, width: 1080, display: "flex", justifyContent: "center", ...style }}>{children}</div>
);

// ================================================================ 0–4s HOOK
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const f = (s: number) => sec(s);
  const v = useCount(25, 10, f(T.countStart), f(T.countEnd - T.countStart));
  const good = ip(frame, [f(T.good), f(T.good) + 8], [0, 1]);
  const bad = ip(frame, [f(T.hook2), f(T.hook2) + 10], [0, 1]);
  const slam = useSpring(f(T.hook2), cpl.spring.bouncy);
  const card = useSpring(f(0.3), cpl.spring.smooth);
  const draw = ip(frame, [f(T.countStart), f(T.countEnd)], [0, 1], cpl.ease.inOut);
  const strike = ip(frame, [f(T.hook2) + 2, f(T.hook2) + 10], [0, 1]);
  const breathe = 1 + Math.sin(frame / 20) * 0.008;
  // descending cost line drawn behind the number
  const pts = [
    [0, 40], [90, 60], [180, 52], [270, 96], [360, 120], [450, 112], [540, 158], [630, 176], [720, 210],
  ];
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <Scene outAt={f(T.hookOut)}>
      <Abs top={300}>
        <Rise at={f(0.05)} y={20}>
          <Chip>Performans Pazarlaması</Chip>
        </Rise>
      </Abs>
      <Abs top={410}>
        <div style={{ width: 1000, ...display, fontWeight: 800, fontSize: 104, lineHeight: 1.04, letterSpacing: "-0.035em", color: C.cream, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 28 }}>
            <Words text="Düşük CPL" at={f(0.12)} per={4} wordStyle={(i) => (i === 1 ? { color: C.goldBright } : undefined)} />
            <Rise at={f(0.35)} config={cpl.spring.bouncy} y={10}>
              <span style={{ position: "relative", display: "inline-block", color: C.creamDim, width: 80, textAlign: "center" }}>
                =
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "56%",
                    width: 8,
                    height: 104 * strike,
                    background: C.loss,
                    borderRadius: 8,
                    transform: "translate(-50%, -50%) rotate(28deg)",
                  }}
                />
              </span>
            </Rise>
          </div>
          <Words text="Başarılı Reklam mı?" at={f(0.55)} per={4} style={{ marginTop: 6 }} />
        </div>
      </Abs>

      {/* hero metric card */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 760,
          width: 860,
          height: 520,
          opacity: Math.min(1, card),
          transform: `translateY(${interpolate(card, [0, 1], [90, 0])}px) scale(${interpolate(card, [0, 1], [0.9, 1]) * breathe}) rotateX(${(1 - card) * 18}deg)`,
          filter: `saturate(${1 - bad * 0.65})`,
        }}
      >
        <Card glow={good * (1 - bad)} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <svg width={860} height={520} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="hookFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={C.gold} stopOpacity={0.28} />
                <stop offset="1" stopColor={C.gold} stopOpacity={0} />
              </linearGradient>
              <clipPath id="hookClip">
                <rect x={0} y={0} width={70 + 720 * draw} height={520} />
              </clipPath>
            </defs>
            <g transform="translate(70 250)" clipPath="url(#hookClip)">
              <path d={`${path} L720 260 L0 260 Z`} fill="url(#hookFill)" transform="translate(-70 0)" />
              <path d={path} stroke={C.gold} strokeWidth={5} fill="none" transform="translate(-70 0)" />
            </g>
          </svg>
          <div style={{ position: "absolute", left: 56, top: 48, ...display, fontWeight: 700, fontSize: 28, letterSpacing: "0.16em", color: C.creamDim }}>
            LEAD BAŞI MALİYET · CPL
          </div>
          <div
            style={{
              position: "absolute",
              left: 50,
              top: 96,
              ...display,
              fontWeight: 800,
              fontSize: 250,
              letterSpacing: "-0.05em",
              color: bad > 0 ? C.cream : C.goldBright,
              textShadow: `0 0 ${60 * good * (1 - bad)}px ${C.glow}`,
              lineHeight: 1,
            }}
          >
            €<Num v={v} />
          </div>
          {/* delta badge */}
          <div
            style={{
              position: "absolute",
              right: 52,
              top: 120,
              opacity: good,
              transform: `scale(${0.6 + good * 0.4}) translateY(${(1 - good) * 20}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 26px",
              borderRadius: 24,
              background: "rgba(217,178,111,0.14)",
              border: `1.5px solid ${C.gold}`,
              ...display,
              fontWeight: 800,
              fontSize: 46,
              color: C.goldBright,
            }}
          >
            <Icon.arrowDown size={42} color={C.goldBright} />
            %60
          </div>
          <div style={{ position: "absolute", right: 56, top: 228, opacity: good, ...display, fontWeight: 600, fontSize: 30, color: C.creamDim }}>
            daha ucuz lead
          </div>
          <Sheen at={f(T.good)} />
        </Card>
      </div>

      {/* "Her zaman değil." slam */}
      <Abs top={1360}>
        <div
          style={{
            ...serif,
            fontWeight: 600,
            fontSize: 118,
            color: C.cream,
            letterSpacing: "-0.02em",
            opacity: Math.min(1, slam),
            transform: `scale(${interpolate(slam, [0, 1], [1.6, 1])})`,
            filter: `blur(${(1 - Math.min(1, slam)) * 12}px)`,
            textShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          Her zaman değil.
        </div>
      </Abs>
      <Abs top={1530}>
        <div style={{ width: 520 * ip(frame, [f(T.hook2) + 6, f(T.hook2) + 20], [0, 1]), height: 4, borderRadius: 4, background: `linear-gradient(90deg, transparent, ${C.loss}, transparent)` }} />
      </Abs>
    </Scene>
  );
};

// ======================================================= 4–12s CAMPAIGN A
export const CampaignA: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const f = (s: number) => sec(s);
  const badge = useSpring(f(T.aBadge), cpl.spring.bouncy);
  const wow = useSpring(f(T.a2), cpl.spring.bouncy);
  const shift = ip(frame, [f(T.aShift), f(T.aShift) + 18], [0, 1], cpl.ease.inOut);
  const pulse = 1 + Math.sin(frame / 9) * 0.02 * (1 - shift);
  const top = 650;
  return (
    <Scene outAt={f(T.aOut)} dir="left">
      <Abs top={290}>
        <Rise at={f(T.a)} y={20}>
          <Chip>Kampanya A</Chip>
        </Rise>
      </Abs>
      <Abs top={380}>
        <Words
          text="Ucuz lead, bol lead."
          at={f(T.a) + 4}
          style={{ ...display, fontWeight: 800, fontSize: 96, letterSpacing: "-0.035em", color: C.cream, opacity: 1 - shift * 0.75 }}
        />
      </Abs>
      <div style={{ position: "absolute", top, left: 0 }}>
        <Funnel
          survive={[0.2, 0.06]}
          focusAt={f(T.aShift)}
          tiers={[
            { value: 100, label: "Lead", at: f(T.aTier1) },
            { value: 20, label: "Nitelikli Lead", at: f(T.aTier2) },
            { value: 2, label: "Satış", at: f(T.aTier3), tone: "loss" },
          ]}
        >
          {/* attractive €10 CPL badge */}
          <div
            style={{
              position: "absolute",
              right: 40,
              top: -78,
              opacity: Math.min(1, badge) * (1 - shift * 0.8),
              transform: `rotate(${interpolate(badge, [0, 1], [-30, -7])}deg) scale(${Math.min(1.2, badge) * pulse * (1 + wow * 0.08 - shift * 0.15)})`,
              filter: `grayscale(${shift * 0.9}) blur(${shift * 2}px)`,
            }}
          >
            <div
              style={{
                position: "relative",
                padding: "22px 38px",
                borderRadius: 30,
                background: `linear-gradient(135deg, ${C.goldBright}, ${C.gold} 60%, ${C.goldDeep})`,
                boxShadow: `0 0 70px ${C.glow}, 0 24px 40px -12px rgba(0,0,0,0.6)`,
                ...display,
                fontWeight: 800,
                fontSize: 64,
                color: C.bg,
                letterSpacing: "-0.02em",
                overflow: "hidden",
              }}
            >
              €10 <span style={{ fontSize: 38, fontWeight: 700 }}>CPL</span>
              <Sheen at={f(T.a2)} radius={30} />
            </div>
            {/* sparkles on "Harika" */}
            {[0, 1, 2, 3].map((k) => {
              const sp = ip(frame, [f(T.a2) + k * 3, f(T.a2) + k * 3 + 16], [0, 1]);
              const fade = ip(frame, [f(T.a2) + 20 + k * 3, f(T.a2) + 34 + k * 3], [1, 0]);
              const ang = (k / 4) * Math.PI * 2 + 0.6;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    left: 150 + Math.cos(ang) * 190 * sp,
                    top: 50 + Math.sin(ang) * 110 * sp,
                    width: 18,
                    height: 18,
                    background: C.goldBright,
                    opacity: sp * fade,
                    transform: `rotate(45deg) scale(${sp})`,
                    boxShadow: `0 0 20px ${C.glow}`,
                  }}
                />
              );
            })}
          </div>
        </Funnel>
      </div>
      {/* caption: first excitement, then the letdown */}
      <Abs top={top + 3 * H + 2 * G + 90}>
        <Rise at={f(T.a2)} exit={f(T.aTier2)} y={30}>
          <div style={{ ...serif, fontSize: 82, color: C.cream }}>Harika, değil mi?</div>
        </Rise>
      </Abs>
      <Abs top={top + 3 * H + 2 * G + 100}>
        <Rise at={f(T.aShift) + 6} y={30}>
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ ...display, fontWeight: 800, fontSize: 54, color: C.loss }}>%2</div>
            <div style={{ ...display, fontWeight: 600, fontSize: 44, color: C.creamDim }}>dönüşüm · ucuz ama boş</div>
          </div>
        </Rise>
      </Abs>
    </Scene>
  );
};

// ======================================================= 12–16s CAMPAIGN B
export const CampaignB: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const f = (s: number) => sec(s);
  const badge = useSpring(f(T.bBadge), cpl.spring.bouncy);
  const top = 650;
  const zoomOut = ip(frame, [f(T.bOut), f(T.bOut) + 9], [0, 1], cpl.ease.in);
  return (
    <AbsoluteFill style={{ opacity: 1 - zoomOut, transform: `scale(${1 - zoomOut * 0.12})`, filter: `blur(${zoomOut * 10}px)` }}>
      <Abs top={290}>
        <Rise at={f(T.b)} y={20}>
          <Chip>Kampanya B</Chip>
        </Rise>
      </Abs>
      <Abs top={380}>
        <Words text="Daha pahalı lead." at={f(T.b) + 4} style={{ ...display, fontWeight: 800, fontSize: 96, letterSpacing: "-0.035em", color: C.cream }} />
      </Abs>
      <div style={{ position: "absolute", top, left: 0 }}>
        <Funnel
          survive={[0.5, 0.2]}
          tiers={[
            { value: 60, label: "Lead", at: f(T.bTier1) },
            { value: 30, label: "Nitelikli Lead", at: f(T.bTier2) },
            { value: 8, label: "Satış", at: f(T.bTier3), tone: "win" },
          ]}
        >
          <div
            style={{
              position: "absolute",
              right: 40,
              top: -78,
              opacity: Math.min(1, badge),
              transform: `rotate(${interpolate(badge, [0, 1], [-30, -7])}deg) scale(${Math.min(1.2, badge)})`,
              padding: "22px 38px",
              borderRadius: 30,
              background: "rgba(11,20,48,0.92)",
              border: `2.5px solid ${C.cream}`,
              boxShadow: "0 24px 40px -12px rgba(0,0,0,0.6)",
              ...display,
              fontWeight: 800,
              fontSize: 64,
              color: C.cream,
              letterSpacing: "-0.02em",
            }}
          >
            €18 <span style={{ fontSize: 38, fontWeight: 700, color: C.creamDim }}>CPL</span>
          </div>
        </Funnel>
      </div>
      {/* reference: campaign A, small and dim */}
      <Abs top={top + 3 * H + 2 * G + 90}>
        <Rise at={f(T.bTier1) + 10} y={30}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "22px 36px",
              borderRadius: 26,
              background: "rgba(244,236,220,0.04)",
              border: `1px solid ${C.cardEdge}`,
              ...display,
              fontSize: 36,
              fontWeight: 600,
              color: C.creamFaint,
            }}
          >
            <span style={{ letterSpacing: "0.14em", fontSize: 26, fontWeight: 700 }}>A</span>
            <span>100 Lead</span>
            <span>·</span>
            <span>€10 CPL</span>
            <span>·</span>
            <span style={{ color: C.loss, opacity: 0.8 }}>2 Satış</span>
          </div>
        </Rise>
      </Abs>
      <Abs top={top + 3 * H + 2 * G + 210}>
        <Rise at={f(T.bLess)} y={24}>
          <div style={{ ...display, fontWeight: 600, fontSize: 40, color: C.creamDim }}>
            %40 daha az lead <span style={{ color: C.creamFaint }}>·</span> ama…
          </div>
        </Rise>
      </Abs>
    </AbsoluteFill>
  );
};

// ======================================================= 16–19.5s VERSUS
const VsColumn: React.FC<{
  side: "A" | "B";
  cpl: number;
  sales: number;
  at: number;
  barAt: number;
}> = ({ side, cpl: price, sales, at, barAt }) => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const win = side === "B";
  const p = useSpring(at, cpl.spring.smooth);
  const bar = useSpring(barAt, { damping: 16, stiffness: 70, mass: 1 });
  const v = useCount(0, sales, barAt, sec(0.7));
  const barH = 400 * (sales / 8) * Math.min(1.04, bar);
  const accent = win ? C.goldBright : C.loss;
  return (
    <div
      style={{
        width: 430,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: Math.min(1, p),
        transform: `translateX(${interpolate(p, [0, 1], [win ? 140 : -140, 0])}px)`,
      }}
    >
      <div style={{ ...display, fontWeight: 700, fontSize: 28, letterSpacing: "0.2em", color: C.creamDim }}>KAMPANYA {side}</div>
      <div style={{ ...display, fontWeight: 800, fontSize: 110, letterSpacing: "-0.04em", color: C.cream, marginTop: 12, lineHeight: 1 }}>
        €{price}
        <span style={{ fontSize: 40, fontWeight: 700, color: C.creamDim, marginLeft: 8 }}>CPL</span>
      </div>
      <div style={{ marginTop: 18, opacity: 0.7 }}>
        <Icon.arrowDown size={56} color={C.creamDim} />
      </div>
      {/* bar */}
      <div style={{ position: "relative", width: 250, height: 540, marginTop: 14, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: "rgba(244,236,220,0.04)", border: `1px dashed ${C.cardEdge}` }} />
        <div
          style={{
            position: "relative",
            width: 250,
            height: barH,
            borderRadius: 28,
            background: win
              ? `linear-gradient(180deg, ${C.goldBright}, ${C.gold} 45%, ${C.goldDeep})`
              : `linear-gradient(180deg, ${C.loss}, rgba(217,122,102,0.35))`,
            boxShadow: win ? `0 0 ${50 * ip(frame, [barAt, barAt + 20], [0, 1])}px ${C.glow}` : undefined,
            overflow: "hidden",
          }}
        >
          {win ? <Sheen at={barAt + sec(0.5)} radius={28} /> : null}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: barH + 16,
            ...display,
            fontWeight: 800,
            fontSize: 88,
            color: accent,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            opacity: ip(frame, [barAt, barAt + 6], [0, 1]),
            textAlign: "center",
          }}
        >
          <Num v={v} />
          <div style={{ fontSize: 34, fontWeight: 700, color: C.creamDim, letterSpacing: 0 }}>Satış</div>
        </div>
      </div>
    </div>
  );
};

export const Versus: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const f = (s: number) => sec(s);
  const x4 = useSpring(f(T.b3), cpl.spring.bouncy);
  const vs = useSpring(f(T.vs) + 6, cpl.spring.bouncy);
  const breathe = 1 + Math.sin(frame / 14) * 0.015;
  return (
    <Scene outAt={f(T.vsOut)}>
      <Abs top={290}>
        <Rise at={f(T.vs)} y={20}>
          <Chip>Asıl karşılaştırma</Chip>
        </Rise>
      </Abs>
      <div style={{ position: "absolute", top: 400, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 70 }}>
        <VsColumn side="A" cpl={10} sales={2} at={f(T.vs)} barAt={f(T.vsA)} />
        <VsColumn side="B" cpl={18} sales={8} at={f(T.vs) + 4} barAt={f(T.vsB)} />
      </div>
      {/* VS medallion */}
      <div
        style={{
          position: "absolute",
          left: 540 - 56,
          top: 470,
          width: 112,
          height: 112,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.bg,
          border: `2px solid ${C.cardEdge}`,
          ...serif,
          fontSize: 50,
          color: C.creamDim,
          opacity: Math.min(1, vs),
          transform: `scale(${vs})`,
        }}
      >
        vs
      </div>
      {/* 4x stamp */}
      <Abs top={1300}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            opacity: Math.min(1, x4),
            transform: `scale(${interpolate(x4, [0, 1], [2.2, 1]) * breathe}) rotate(${interpolate(x4, [0, 1], [-8, -3])}deg)`,
            filter: `blur(${(1 - Math.min(1, x4)) * 10}px)`,
          }}
        >
          <span
            style={{
              ...display,
              fontWeight: 800,
              fontSize: 230,
              letterSpacing: "-0.06em",
              lineHeight: 1,
              background: `linear-gradient(180deg, ${C.goldBright}, ${C.gold})`,
              WebkitBackgroundClip: "text",
              color: "transparent",
              filter: `drop-shadow(0 0 40px ${C.glow})`,
            }}
          >
            4×
          </span>
          <span style={{ ...display, fontWeight: 700, fontSize: 56, color: C.cream, lineHeight: 1.05 }}>
            daha fazla
            <br />
            satış
          </span>
        </div>
      </Abs>
      <Abs top={1560}>
        <Rise at={f(T.vsLine)} y={20}>
          <div style={{ ...serif, fontSize: 52, color: C.creamDim }}>Daha yüksek CPL, çok daha iyi sonuç.</div>
        </Rise>
      </Abs>
    </Scene>
  );
};

// ================================================ 19.5–27s REAL PERFORMANCE
const ROWS = [
  { icon: Icon.tag, name: "CPL", a: "€10", b: "€18", winA: true },
  { icon: Icon.gem, name: "Lead Kalitesi", a: "%20", b: "%50" },
  { icon: Icon.funnel, name: "Satış Oranı", a: "%2", b: "%13" },
  { icon: Icon.user, name: "Müşteri Edinme Maliyeti", a: "€500", b: "€135" },
  { icon: Icon.trend, name: "Ciro / ROAS", a: "0,8x", b: "3,0x" },
];

export const Metrics: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const f = (s: number) => sec(s);
  const rowH = 150;
  const gap = 20;
  const top = 560;
  const pulseY = ip(frame, [f(T.c2), f(T.c2) + sec(1.3)], [0, 4 * (rowH + gap)], cpl.ease.inOut);
  const pulseOn = frame >= f(T.c2) && frame < f(T.c2) + sec(1.5);
  const ask = ip(frame, [f(T.c3), f(T.c3) + 14], [0, 1], cpl.ease.inOut);
  const lineLen = ip(frame, [f(T.rows[0]), f(T.rows[4]) + 10], [0, 4 * (rowH + gap)], cpl.ease.inOut);
  return (
    <Scene outAt={f(T.mOut)}>
      <div style={{ opacity: 1 - ask * 0.82, filter: `blur(${ask * 7}px)`, transform: `scale(${1 - ask * 0.05})`, position: "absolute", inset: 0 }}>
        <Abs top={290}>
          <Rise at={f(T.m)} y={20}>
            <Chip>Gerçek performans</Chip>
          </Rise>
        </Abs>
        <Abs top={380}>
          <Words text="Bütün resme bak." at={f(T.m) + 4} style={{ ...display, fontWeight: 800, fontSize: 92, letterSpacing: "-0.035em", color: C.cream }} />
        </Abs>
        {/* column headers */}
        <div style={{ position: "absolute", top: top - 54, right: 110, display: "flex", gap: 0, ...display, fontWeight: 700, fontSize: 26, letterSpacing: "0.18em", color: C.creamFaint, opacity: ip(frame, [f(T.rows[0]), f(T.rows[0]) + 10], [0, 1]) }}>
          <span style={{ width: 150, textAlign: "center" }}>A</span>
          <span style={{ width: 150, textAlign: "center", color: C.gold }}>B</span>
        </div>
        {/* connector spine */}
        <div style={{ position: "absolute", left: 160, top: top + rowH / 2, width: 3, height: lineLen, background: `linear-gradient(180deg, ${C.gold}, ${C.gold}55)` }} />
        {pulseOn ? (
          <div style={{ position: "absolute", left: 161.5 - 14, top: top + rowH / 2 + pulseY - 14, width: 28, height: 28, borderRadius: "50%", background: C.goldBright, boxShadow: `0 0 40px 10px ${C.glow}` }} />
        ) : null}
        {ROWS.map((r, i) => {
          const at = f(T.rows[i]);
          const p = useRow(at);
          const lit = frame >= f(T.c2) && pulseY >= i * (rowH + gap) - 10;
          const first = i === 0;
          return (
            <div
              key={r.name}
              style={{
                position: "absolute",
                left: 80,
                top: top + i * (rowH + gap),
                width: 920,
                height: rowH,
                opacity: Math.min(1, p),
                transform: `translateX(${interpolate(p, [0, 1], [180, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
              }}
            >
              <Card glow={lit && first ? 0.8 : 0} style={{ width: "100%", height: "100%", borderRadius: 30 }}>
                <div style={{ position: "absolute", left: 40, top: rowH / 2 - 42, width: 84, height: 84, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: lit ? "rgba(217,178,111,0.2)" : C.bg, border: `2px solid ${lit ? C.goldBright : C.cardEdge}` }}>
                  <r.icon size={44} color={lit ? C.goldBright : C.gold} />
                </div>
                <div style={{ position: "absolute", left: 150, top: 0, height: rowH, display: "flex", flexDirection: "column", justifyContent: "center", ...display }}>
                  <div style={{ fontWeight: 700, fontSize: r.name.length > 14 ? 36 : 44, color: C.cream, lineHeight: 1.05, maxWidth: 360 }}>{r.name}</div>
                  {first ? (
                    <div style={{ marginTop: 8, fontWeight: 700, fontSize: 22, letterSpacing: "0.18em", color: C.gold, opacity: ip(frame, [f(T.c2), f(T.c2) + 10], [0, 1]) }}>SADECE BAŞLANGIÇ</div>
                  ) : null}
                </div>
                <div style={{ position: "absolute", right: 30, top: 0, height: rowH, display: "flex", alignItems: "center", ...display, fontWeight: 800, fontSize: 50, letterSpacing: "-0.02em" }}>
                  <span style={{ width: 150, textAlign: "center", color: first ? C.cream : C.creamFaint }}>{r.a}</span>
                  <span style={{ width: 150, textAlign: "center", color: first ? C.creamFaint : C.cream }}>{r.b}</span>
                </div>
                <Sheen at={at + 4} radius={30} />
              </Card>
            </div>
          );
        })}
        <Abs top={top + 5 * (rowH + gap) + 10}>
          <div style={{ ...display, fontSize: 24, color: C.creamFaint, opacity: ip(frame, [f(T.rows[4]), f(T.rows[4]) + 10], [0, 1]) }}>
            Örnek: satış başı €400 ciro varsayımıyla
          </div>
        </Abs>
        <Abs top={1500}>
          <Rise at={f(T.c2)} y={30}>
            <div style={{ ...serif, fontSize: 78, color: C.cream }}>
              CPL sadece <span style={{ color: C.goldBright }}>başlangıçtır.</span>
            </div>
          </Rise>
        </Abs>
      </div>
      {/* the real question */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <Rise at={f(T.c3)} y={30}>
          <div style={{ ...display, fontWeight: 700, fontSize: 34, letterSpacing: "0.3em", color: C.gold, textAlign: "center" }}>ASIL SORU</div>
        </Rise>
        <div style={{ height: 34 }} />
        <Words
          text="Bu lead'ler satışa dönüşüyor mu?"
          at={f(T.c3) + 8}
          per={4}
          style={{ ...display, fontWeight: 800, fontSize: 104, lineHeight: 1.06, letterSpacing: "-0.035em", color: C.cream, maxWidth: 900 }}
          wordStyle={(i) => (i === 2 ? { color: C.goldBright, textShadow: `0 0 50px ${C.glow}` } : undefined)}
        />
      </AbsoluteFill>
    </Scene>
  );
};
// row spring (hook in a helper so the map above stays readable)
const useRow = (at: number) => useSpring(at, cpl.spring.snappy);

// ======================================================= 27–30s FINAL
export const Final: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = useSec();
  const f = (s: number) => sec(s);
  const ring = ip(frame, [f(T.fin), f(T.fin) + sec(1.2)], [0, 1]);
  const strike = ip(frame, [f(T.finStrike), f(T.finStrike) + 10], [0, 1], cpl.ease.inOut);
  const under = ip(frame, [f(T.finResult) + 8, f(T.finResult) + 26], [0, 1], cpl.ease.inOut);
  const res = useSpring(f(T.finResult), cpl.spring.bouncy);
  const breathe = 1 + Math.sin(frame / 18) * 0.01;
  return (
    <AbsoluteFill>
      {/* expanding gold ring + central light */}
      <div style={{ position: "absolute", left: 540 - 700, top: 900 - 700, width: 1400, height: 1400, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}30, transparent 60%)`, opacity: ip(frame, [f(T.fin), f(T.fin) + 20], [0, 1]) }} />
      <div
        style={{
          position: "absolute",
          left: 540 - 450,
          top: 920 - 450,
          width: 900,
          height: 900,
          borderRadius: "50%",
          border: `2px solid ${C.gold}`,
          opacity: (1 - ring) * 0.8,
          transform: `scale(${0.3 + ring * 1.1})`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", ...display, letterSpacing: "-0.035em", textAlign: "center" }}>
        <Rise at={f(T.fin)} y={20}>
          <div style={{ width: 90, height: 4, borderRadius: 4, background: C.gold, marginBottom: 56 }} />
        </Rise>
        <Words text="Reklam performansını" at={f(T.end) - 2} per={4} style={{ fontWeight: 800, fontSize: 84, color: C.cream, lineHeight: 1.08 }} />
        <div style={{ height: 14 }} />
        <div style={{ position: "relative" }}>
          <Words text="lead ile değil," at={f(T.finLead) - 2} per={4} style={{ fontWeight: 700, fontSize: 84, color: C.creamFaint, lineHeight: 1.08 }} />
          <div style={{ position: "absolute", left: -10, top: "54%", width: 184 * strike, height: 8, borderRadius: 6, background: C.loss, opacity: 0.9 }} />
        </div>
        <div style={{ height: 22 }} />
        <div
          style={{
            position: "relative",
            ...serif,
            fontWeight: 600,
            fontSize: 150,
            letterSpacing: "-0.02em",
            color: C.goldBright,
            textShadow: `0 0 70px ${C.glow}`,
            opacity: Math.min(1, res),
            transform: `scale(${interpolate(res, [0, 1], [1.5, 1]) * breathe})`,
            filter: `blur(${(1 - Math.min(1, res)) * 10}px)`,
            lineHeight: 1.1,
          }}
        >
          sonuçla ölç.
          <div style={{ position: "absolute", left: "8%", bottom: -6, height: 6, width: `${84 * under}%`, borderRadius: 6, background: `linear-gradient(90deg, ${C.goldDeep}, ${C.goldBright}, ${C.goldDeep})` }} />
        </div>
      </AbsoluteFill>
      <Abs top={1580}>
        <Rise at={f(T.finResult) + 14} y={16}>
          <Chip>CPL ≠ Başarı</Chip>
        </Rise>
      </Abs>
    </AbsoluteFill>
  );
};
