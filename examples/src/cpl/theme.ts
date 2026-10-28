// theme.ts for CplReel — navy / gold / cream performance-marketing identity.
// Single source of truth: no inline colors or easings in the scenes.
import { Easing } from "remotion";

export const cpl = {
  colors: {
    bg: "#060B18", // very dark navy
    bgAlt: "#0B1430",
    card: "rgba(16, 27, 56, 0.78)",
    cardEdge: "rgba(232, 200, 138, 0.16)",
    gold: "#D9B26F", // THE hero color — one element per frame
    goldBright: "#F3D79B",
    goldDeep: "#9C7639",
    cream: "#F4ECDC",
    creamDim: "rgba(244, 236, 220, 0.62)",
    creamFaint: "rgba(244, 236, 220, 0.28)",
    blue: "#3D5FA8", // cool secondary light
    loss: "#D97A66", // muted coral, only for the letdown numbers
    glow: "rgba(217, 178, 111, 0.45)",
  },
  fonts: {
    display: "Plus Jakarta Sans",
    serif: "Fraunces",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
    soft: Easing.bezier(0.33, 1, 0.68, 1),
  },
  spring: {
    snappy: { damping: 14, stiffness: 170, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 10, stiffness: 180, mass: 0.7 },
    count: { damping: 30, stiffness: 55 },
  },
} as const;
