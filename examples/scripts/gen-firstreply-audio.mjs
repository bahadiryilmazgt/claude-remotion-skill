// Synthesizes the "First Reply Wins" score + SFX kit as 16-bit WAVs into
// public/sfx/fr/. Deterministic, zero downloads.
// Track: 105 BPM, B minor -> D major. Mysterious intro (beats 0-20), pulse
// joins (20-30), tension race (30-48, riser 44-48), bright resolution (48-68),
// warm ending (68-84).
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sfx", "fr");
mkdirSync(OUT, { recursive: true });

let seed = 7;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
};

function wavStereo(L, R) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  return buf;
}
const wavMono = (S) => wavStereo(S, S);
const normalize = (arrs, target) => {
  let peak = 0;
  for (const a of arrs) for (let i = 0; i < a.length; i++) peak = Math.max(peak, Math.abs(a[i]));
  const g = target / (peak || 1);
  for (const a of arrs) for (let i = 0; i < a.length; i++) a[i] *= g;
};
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ======================= TRACK =======================
const BPM = 105;
const BEAT = 60 / BPM;
const BEATS = 86;
const DUR = BEATS * BEAT + 1.5;
const N = Math.floor(DUR * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const add = (start, dur, fn, pan = 0) => {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n && s0 + i < N; i++) {
    if (s0 + i < 0) continue;
    const v = fn(i / SR, i / n);
    L[s0 + i] += v * gl;
    R[s0 + i] += v * gr;
  }
};

// soft piano-ish pluck: decaying harmonics, slight hammer
const piano = (t, midi, vel = 0.5, len = 2.4, pan = 0) => {
  const f = mtof(midi);
  add(
    t,
    len,
    (ts, p) => {
      const env = Math.min(1, ts * 300) * Math.exp(-ts * 2.2) * (1 - p);
      const h =
        Math.sin(2 * Math.PI * f * ts) +
        0.42 * Math.sin(2 * Math.PI * f * 2.001 * ts) * Math.exp(-ts * 3) +
        0.18 * Math.sin(2 * Math.PI * f * 3.003 * ts) * Math.exp(-ts * 5) +
        0.07 * Math.sin(2 * Math.PI * f * 4.01 * ts) * Math.exp(-ts * 8);
      return h * env * vel * 0.22;
    },
    pan,
  );
};
// bright pluck for ostinato
const pluck = (t, midi, vel = 0.3, pan = 0) => {
  const f = mtof(midi);
  add(
    t,
    0.5,
    (ts) => {
      const env = Math.min(1, ts * 500) * Math.exp(-ts * 9);
      return (Math.sin(2 * Math.PI * f * ts) + 0.3 * Math.sin(2 * Math.PI * f * 2 * ts) * Math.exp(-ts * 14)) * env * vel * 0.2;
    },
    pan,
  );
};
// warm pad: detuned sines + soft 2nd/3rd harmonic, slow attack/release
const pad = (t, notes, dur, vol = 0.05, bright = 0.3) => {
  for (const [k, m] of notes.entries()) {
    const f = mtof(m);
    for (const d of [-0.18, 0.17]) {
      add(
        t,
        dur + 1.2,
        (ts) => {
          const a = Math.min(1, ts / 1.1);
          const rel = Math.min(1, Math.max(0, (dur + 1.2 - ts) / 1.4));
          const ff = f * (1 + d / 100);
          const w = Math.sin(2 * Math.PI * ff * ts) + bright * 0.35 * Math.sin(2 * Math.PI * ff * 2 * ts) + bright * 0.12 * Math.sin(2 * Math.PI * ff * 3 * ts);
          return w * a * rel * vol * (1 + 0.15 * Math.sin(ts * 1.3 + k));
        },
        d < 0 ? -0.45 : 0.45,
      );
    }
  }
};
const kick = (t, vol = 0.6) =>
  add(t, 0.35, (ts, p) => {
    const f = 110 - 70 * Math.min(1, ts * 14);
    return Math.sin(2 * Math.PI * f * ts) * Math.exp(-p * 6) * vol;
  });
let lp = 0;
const shaker = (t, vol = 0.05, pan = 0.3) =>
  add(
    t,
    0.07,
    (ts, p) => {
      const n = rnd();
      lp += 0.6 * (n - lp);
      return (n - lp) * Math.exp(-p * 6) * vol;
    },
    pan,
  );
const bass = (t, midi, dur, vol = 0.22) => {
  const f = mtof(midi);
  add(t, dur, (ts, p) => {
    const env = Math.min(1, ts * 60) * Math.min(1, (1 - p) * 8) * Math.exp(-ts * 0.8);
    return (Math.sin(2 * Math.PI * f * ts) + 0.25 * Math.sin(2 * Math.PI * f * 2 * ts)) * env * vol;
  });
};

// chords per bar (4 beats). B minor intro -> D major resolution
const CH = {
  Bm: [47, 54, 59, 62, 66, 61 + 12],
  G: [43, 50, 55, 59, 62, 69],
  D: [50, 57, 62, 66, 69, 76],
  A: [45, 52, 57, 61, 64, 71],
  Em: [40, 47, 55, 59, 64, 66],
  Fs: [42, 49, 54, 58, 61, 66],
};
const bars = [
  "Bm", "G", "D", "A", "Bm", "G", "D", "A", // 0-32
  "Bm", "Bm", "G", "Fs", // 32-48 tension
  "D", "A", "Bm", "G", "D", "A", // 48-72 resolution
  "G", "D", "D", "D", "D", // 72-92 warm ending
];
const T = (beat) => beat * BEAT;

bars.forEach((name, bi) => {
  const b0 = bi * 4;
  if (b0 >= BEATS) return;
  const c = CH[name];
  const ending = b0 >= 72;
  const resolved = b0 >= 48 && !ending;
  const race = b0 >= 32 && b0 < 48;
  // pad
  pad(T(b0), c.slice(1, 5), 4 * BEAT * (ending && b0 >= 76 ? 2 : 1), ending ? 0.05 : 0.04, resolved ? 0.6 : 0.3);
  // bass root
  if (b0 >= 20 && b0 < 80) bass(T(b0), c[0] - 12, 4 * BEAT * 0.95, race ? 0.2 : 0.17);
  // piano: sparse intro, arpeggio in pulse, chords in resolution
  if (b0 < 20) {
    piano(T(b0), c[2] + 12, 0.45, 3, -0.2);
    piano(T(b0 + 1.5), c[3] + 12, 0.32, 2.5, 0.2);
    piano(T(b0 + 2.5), c[4] + 12, 0.3, 2.5, 0.1);
  } else if (b0 < 32) {
    [0, 1, 1.5, 2.5, 3].forEach((o, k) => piano(T(b0 + o), c[2 + (k % 4)] + 12, 0.32, 2, k % 2 ? 0.25 : -0.25));
  } else if (resolved) {
    piano(T(b0), c[1] + 12, 0.5, 3, -0.2);
    piano(T(b0), c[3] + 12, 0.45, 3, 0.15);
    piano(T(b0), c[5] + 12, 0.4, 3, 0.3);
    // bright motif
    const mel = [c[5] + 12, c[4] + 12, c[5] + 12, c[3] + 24];
    [0.5, 1.5, 2, 3].forEach((o, k) => piano(T(b0 + o), mel[k], 0.34, 1.6, 0.25));
  } else if (ending) {
    if (b0 === 72) {
      piano(T(b0), c[1], 0.4, 4, -0.2);
      piano(T(b0 + 0.5), c[3] + 12, 0.35, 4, 0.2);
    }
    if (b0 === 76) {
      // final chord: D maj9, rolled
      [50, 57, 62, 66, 69, 73, 76].forEach((m, k) => piano(T(b0) + k * 0.06, m + 12 * (k > 3 ? 0 : 0), 0.4, 7, -0.3 + k * 0.1));
    }
  }
  // race ostinato: 16th plucks, intensity rising
  if (race) {
    const arp = [c[2], c[3], c[4], c[3]].map((m) => m + 12);
    for (let s = 0; s < 16; s++) {
      const prog = (b0 - 32 + s / 4) / 16;
      pluck(T(b0 + s / 4), arp[s % 4] + (s % 8 >= 6 ? 12 : 0), 0.18 + prog * 0.22, s % 2 ? 0.35 : -0.35);
    }
  }
});

// drums
for (let b = 20; b < 32; b += 2) kick(T(b), 0.45);
for (let b = 32; b < 48; b++) kick(T(b), 0.5);
for (let b = 32; b < 48; b++) shaker(T(b + 0.5), 0.05 + (b - 32) * 0.004);
for (let b = 48; b < 68; b++) kick(T(b), 0.55);
for (let b = 48; b < 68; b++) shaker(T(b + 0.5), 0.06);
for (let b = 68; b < 72; b += 2) kick(T(b), 0.4);
// race clock tick (soft woodblock) on 8ths 30-34
for (let e = 60; e < 68; e++)
  add(T(e / 2), 0.04, (ts, p) => Math.sin(2 * Math.PI * 1500 * ts) * Math.exp(-p * 8) * 0.06, 0.4);
// riser 44-48: filtered noise swell + rising tone
{
  let l = 0;
  add(T(44), 4 * BEAT, (ts, p) => {
    const n = rnd();
    l += (0.02 + p * 0.25) * (n - l);
    return l * p * p * 0.5 + Math.sin(2 * Math.PI * (300 + 500 * p * p) * ts) * p * p * 0.03;
  });
}
// resolution swell + sparkle at 48
add(T(48), 3, (ts, p) => Math.sin(2 * Math.PI * 1318.5 * ts) * Math.exp(-ts * 1.6) * 0.04, 0.4);
add(T(48), 3, (ts, p) => Math.sin(2 * Math.PI * 1760 * ts) * Math.exp(-ts * 1.8) * 0.03, -0.4);

// master: gentle saturation + fade out tail
const fadeStart = T(82);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = t > fadeStart ? Math.max(0, 1 - (t - fadeStart) / (DUR - fadeStart)) : 1;
  L[i] = Math.tanh(L[i] * 1.2) * fade;
  R[i] = Math.tanh(R[i] * 1.2) * fade;
}
normalize([L, R], 0.89);
writeFileSync(join(OUT, "track.wav"), wavStereo(L, R));
console.log(`track.wav ${DUR.toFixed(1)}s`);

// ======================= SFX =======================
const mk = (dur, fn) => {
  const n = Math.floor(dur * SR);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = fn(i / SR, i / n);
  return a;
};
const save = (name, a, peak = 0.85) => {
  normalize([a], peak);
  writeFileSync(join(OUT, name), wavMono(a));
};

// airy whoosh: band-swept noise, smooth envelope
{
  let l1 = 0,
    l2 = 0;
  save(
    "whoosh.wav",
    mk(0.7, (t, p) => {
      const env = Math.pow(Math.sin(Math.PI * Math.pow(p, 0.8)), 2);
      const c = 0.04 + 0.22 * Math.sin(Math.PI * p);
      const n = rnd();
      l1 += c * (n - l1);
      l2 += c * 0.5 * (l1 - l2);
      return (l1 - l2 * 0.6) * env;
    }),
    0.7,
  );
}
// send: soft rising "bloop"
{
  let ph = 0;
  save(
    "send.wav",
    mk(0.22, (t, p) => {
      ph += (2 * Math.PI * (520 + 520 * Math.pow(p, 0.6))) / SR;
      return Math.sin(ph) * Math.min(1, t * 400) * Math.exp(-p * 5);
    }),
    0.6,
  );
}
// pop: gentle UI tap
{
  let ph = 0;
  save(
    "pop.wav",
    mk(0.12, (t, p) => {
      ph += (2 * Math.PI * (900 - 450 * p)) / SR;
      return Math.sin(ph) * Math.exp(-p * 8);
    }),
    0.5,
  );
}
// key click for typing
save("key.wav", mk(0.03, (t, p) => (rnd() * 0.6 + Math.sin(2 * Math.PI * 3200 * t)) * Math.exp(-p * 10)), 0.3);
// tick: tiny glassy blip
save("tick.wav", mk(0.06, (t, p) => Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-p * 12)), 0.35);
// ding: two-tone notification, bell-like (E6 then B6)
save(
  "ding.wav",
  mk(1.4, (t) => {
    const bell = (f, t0) =>
      t < t0 ? 0 : (Math.sin(2 * Math.PI * f * (t - t0)) + 0.3 * Math.sin(2 * Math.PI * f * 2.76 * (t - t0)) * Math.exp(-(t - t0) * 6)) * Math.exp(-(t - t0) * 3.2);
    return bell(1318.5, 0) * 0.8 + bell(1975.5, 0.11);
  }),
  0.7,
);
// shimmer: cluster of high partials, slow attack, airy
save(
  "shimmer.wav",
  mk(2.0, (t, p) => {
    let s = 0;
    [2349, 2637, 2960, 3520, 3951, 4699].forEach((f, k) => (s += Math.sin(2 * Math.PI * f * t + k) * (0.6 + 0.4 * Math.sin(t * (6 + k)))));
    return s * Math.min(1, t * 6) * Math.exp(-p * 3.2);
  }),
  0.45,
);
// thud: soft cinematic impact (low sine + muffled noise)
{
  let l = 0;
  save(
    "thud.wav",
    mk(1.2, (t, p) => {
      const f = 72 - 30 * Math.min(1, t * 4);
      l += 0.04 * (rnd() - l);
      return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 4) + l * 3 * Math.exp(-t * 9);
    }),
    0.8,
  );
}
// late: muted low "bonk" for grey lanes
{
  let ph = 0;
  save(
    "late.wav",
    mk(0.3, (t, p) => {
      ph += (2 * Math.PI * (330 - 120 * p)) / SR;
      return Math.sin(ph) * Math.exp(-p * 7);
    }),
    0.4,
  );
}
// too late: soft descending minor dyad, never harsh
save(
  "toolate.wav",
  mk(1.6, (t, p) => {
    const g = Math.min(1, t * 30) * Math.exp(-t * 2.2);
    const f1 = 311.1 * (1 - 0.04 * p);
    const f2 = 370 * (1 - 0.04 * p);
    return (Math.sin(2 * Math.PI * f1 * t) + 0.8 * Math.sin(2 * Math.PI * f2 * t) + 0.2 * Math.sin(2 * Math.PI * f1 * 2 * t)) * g;
  }),
  0.5,
);
// swell: reversed-ish warm rise into a hit
save(
  "swell.wav",
  mk(1.6, (t, p) => {
    let s = 0;
    [293.7, 440, 587.3, 740].forEach((f) => (s += Math.sin(2 * Math.PI * f * t)));
    return s * Math.pow(p, 2.2) * (p > 0.97 ? (1 - p) / 0.03 : 1);
  }),
  0.45,
);
console.log("sfx kit written to", OUT);
