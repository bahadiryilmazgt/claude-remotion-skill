// theme3.ts — "First Reply Wins". Single source of truth for palette, type,
// easing, springs and the beat grid. Never inline a hex or easing in a scene.
import { Easing } from "remotion";

export const FR_FPS = 30;
export const FR_BPM = 105;
export const FR_W = 1080;
export const FR_H = 1920;
// frames per beat at 105 BPM / 30 fps = 17.142857
export const FPB = (FR_FPS * 60) / FR_BPM;
// beat -> frame (rounded so every cut lands on a whole frame)
export const B = (beats: number) => Math.round(beats * FPB);
export const FR_TOTAL_BEATS = 82;
export const FR_TOTAL_F = B(FR_TOTAL_BEATS);

// Instagram safe zone: keep main messages out of the top 12% and bottom 20%
export const SAFE = { top: Math.round(FR_H * 0.12), bottom: Math.round(FR_H * 0.8) };

export const fr = {
  colors: {
    navy: "#0B1F3A",
    navyDeep: "#061325",
    navyMid: "#10284A",
    cream: "#F3EAD8",
    creamDim: "rgba(243,234,216,0.62)",
    creamFaint: "rgba(243,234,216,0.14)",
    gold: "#C9A24B",
    goldHi: "#E6C77A",
    goldDeep: "#8A6A26",
    goldShadow: "#5E4515",
    steel: "#5B6577",
    steelDim: "rgba(91,101,119,0.55)",
    red: "#C0564B", // used exactly once: the "too late" moment
  },
  // brushed / liquid gold gradients
  goldFill:
    "linear-gradient(172deg, #F6E3A8 0%, #E6C77A 18%, #C9A24B 42%, #9C7A30 58%, #E6C77A 76%, #B8913E 100%)",
  goldBrushed:
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(0,0,0,0.06) 2px, rgba(255,255,255,0.03) 4px), linear-gradient(135deg, #7E5F22 0%, #E6C77A 22%, #C9A24B 40%, #F3DFA0 52%, #A88536 70%, #E6C77A 88%, #8A6A26 100%)",
  fonts: {
    display: "Montserrat",
    body: "Montserrat",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
    soft: Easing.bezier(0.33, 0, 0.2, 1),
  },
  spring: {
    settle: { damping: 15, stiffness: 120, mass: 0.9 }, // overshoot + settle
    smooth: { damping: 22, stiffness: 80, mass: 1 },
    snappy: { damping: 13, stiffness: 180, mass: 0.6 },
    heavy: { damping: 18, stiffness: 60, mass: 1.6 },
  },
} as const;

// ---- all on-screen copy lives here. Supers are Turkish; the in-phone UI is the
// foreign patient's own WhatsApp, so it stays in English (health tourism). ----
export const COPY = {
  patient: "Sarah",
  patientMeta: "Sarah, 34 · Londra",
  adClinic: "Your Clinic",
  adHeadline: "Hair Transplant\nin Istanbul",
  adCta: "Send Message",
  patientMsg: "Hi! How much is a hair transplant?",
  clinics: ["Aurea Clinic", "Medivia", "Your Clinic", "Vitalis", "Lumen Health"],
  winner: 2,
  convo: [
    { from: "clinic", text: "Hello Sarah! Happy to help." },
    { from: "clinic", text: "Could you send us a photo?" },
    { from: "patient", text: "Sure, sending now!" },
    { from: "clinic", text: "We have a slot on 14 November." },
    { from: "patient", text: "Perfect, please book it!" },
  ],
  // late reply times for the other four lanes (indexes into clinics)
  lateTimes: { 0: "ertesi gün", 1: "2 sa 10 dk", 3: "5 sa 40 dk", 4: "cevap yok" } as Record<number, string>,
  // main messages per scene — each held ≥ 2s inside the safe zone
  s1: [[{ t: "Bir hasta" }], [{ t: "reklamınızı", g: true }], [{ t: "gördü." }]],
  s2: [[{ t: "WhatsApp'tan" }], [{ t: "yazdı.", g: true }]],
  s3: [[{ t: "Ama sadece" }], [{ t: "size", g: true }, { t: "değil." }]],
  s3cap: "AYNI MESAJ · 5 KLİNİK · AYNI ANDA",
  s4a: [[{ t: "İlk cevap" }], [{ t: "veren" }, { t: "kazanır.", g: true }]],
  s4b: [[{ t: "Diğerleri için:" }], [{ t: "Çok geç.", r: true }]],
  s5: [[{ t: "Güven" }, { t: "kazanıldı." }], [{ t: "Randevu", g: true }, { t: "alındı." }]],
  ticketTitle: "RANDEVU ONAYLANDI",
  ticketDay: "14",
  ticketMonth: "KASIM",
  ticketSub: "Saç Ekimi · İstanbul",
  eq: ["HIZ", "GÜVEN", "HASTA"],
  vizX: "CEVAP SÜRESİ",
  vizY: "RANDEVU ŞANSI",
  end: [[{ t: "Sağlık turizminde" }], [{ t: "ilk cevap" }], [{ t: "kazanır.", g: true }]],
  endSub: "Hastalarınız beklemez.",
  race: { timer: "İLK CEVAP SÜRESİ", replied: "CEVAP", seen: "Mesaj iletildi" },
} as const;

export type Word = { t: string; g?: boolean; r?: boolean };
