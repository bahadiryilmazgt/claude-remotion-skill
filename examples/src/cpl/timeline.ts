// Every beat of the reel in seconds, locked to the voiceover word timings
// (measured with Whisper on public/vo/*.wav). Scenes and audio both read
// from here, so picture and sound can never drift apart.
export const T = {
  // 0–4s hook
  hook1: 0.15,
  countStart: 0.5,
  countEnd: 1.85,
  good: 1.95,
  hook2: 2.4,
  hookOut: 3.6,
  // 4–12s campaign A
  a: 3.9,
  a1: 4.05,
  aTier1: 4.25,
  aBadge: 4.75,
  a2: 6.55,
  aTier2: 7.3,
  a3: 8.4,
  aTier3: 8.85,
  aShift: 9.05,
  aOut: 11.6,
  // 12–16s campaign B
  b: 11.9,
  b1: 11.95,
  bTier1: 12.15,
  bBadge: 13.25,
  bTier2: 14.6,
  bLess: 14.9,
  bTier3: 15.35,
  bOut: 15.95,
  // 16–19.5s comparison
  vs: 16.2,
  b2: 16.35,
  vsA: 16.45,
  vsB: 16.7,
  b3: 17.95,
  vsLine: 18.45,
  vsOut: 19.25,
  // 19.5–27s real performance
  m: 19.5,
  c1: 19.65,
  rows: [19.7, 20.35, 21.2, 22.05, 22.65],
  c2: 23.2,
  c3: 25.0,
  mOut: 26.85,
  // 27–30s final
  fin: 27.1,
  end: 27.3,
  finLead: 28.3,
  finStrike: 28.6,
  finResult: 29.02,
  total: 30,
} as const;

export const VO: { id: string; at: number }[] = [
  { id: "hook1", at: T.hook1 },
  { id: "hook2", at: T.hook2 },
  { id: "a1", at: T.a1 },
  { id: "a2", at: T.a2 },
  { id: "a3", at: T.a3 },
  { id: "b1", at: T.b1 },
  { id: "b2", at: T.b2 },
  { id: "b3", at: T.b3 },
  { id: "c1", at: T.c1 },
  { id: "c2", at: T.c2 },
  { id: "c3", at: T.c3 },
  { id: "end", at: T.end },
];
