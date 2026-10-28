// Synthesizes the CplReel audio: an original 30s music bed at 120 BPM
// (beat = 0.5s = 15 frames) and a premium motion-graphics SFX kit.
// Bed structure follows the story: filtered intro 0-4s -> drive 4-8.3s ->
// deflated half-time 8.3-12s (the "2 satış" letdown) -> lift 12-20s ->
// full drive 20-27s -> final hit 27.3s and ringing tail.
// All stereo 16-bit WAVs into public/sfx/cpl/. Deterministic, no downloads.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sfx", "cpl");
mkdirSync(OUT, { recursive: true });

function wav(L, R = L) {
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
    buf.writeInt16LE(Math.round(Math.tanh(L[i]) * 32000), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.tanh(R[i]) * 32000), 46 + i * 4);
  }
  return buf;
}

let seed = 7;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
};
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const TAU = 2 * Math.PI;

// one-pole lowpass state helper
const lowpass = () => {
  let y = 0;
  return (x, a) => (y += a * (x - y));
};

// ---------------------------------------------------------------- SFX kit
const sfx = (name, dur, fn) => {
  const n = Math.round(dur * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  fn(n, L, R);
  writeFileSync(join(OUT, name), wav(L, R));
};

// whoosh — filtered noise sweep with stereo pan travel
sfx("whoosh.wav", 0.5, (n, L, R) => {
  const lp = lowpass(), lp2 = lowpass();
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * Math.pow(t, 0.6)) ** 2;
    const a = 0.03 + 0.3 * Math.sin(Math.PI * t);
    const v = lp2(lp(rnd(), a), a) * env * 1.6;
    L[i] = v * (1 - t * 0.7);
    R[i] = v * (0.3 + t * 0.7);
  }
});

// swish — short, bright
sfx("swish.wav", 0.22, (n, L, R) => {
  const lp = lowpass();
  let hp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * Math.pow(t, 0.4)) ** 3;
    const x = lp(rnd(), 0.5);
    const h = x - hp;
    hp += 0.08 * (x - hp);
    L[i] = R[i] = h * env * 0.7;
  }
});

// pop — round pitch-drop bubble
sfx("pop.wav", 0.16, (n, L, R) => {
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    ph += (TAU * (900 - 520 * Math.sqrt(t))) / SR;
    L[i] = R[i] = Math.sin(ph) * Math.exp(-t * 8) * 0.55;
  }
});

// click — UI tick with a little body
sfx("click.wav", 0.06, (n, L, R) => {
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    ph += (TAU * 2600) / SR;
    const v = (Math.sin(ph) * 0.5 + rnd() * 0.35) * Math.exp(-t * 22);
    L[i] = R[i] = v * 0.6;
  }
});

// tick — counter tick
sfx("tick.wav", 0.035, (n, L, R) => {
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    ph += (TAU * 3400) / SR;
    L[i] = R[i] = Math.sin(ph) * Math.exp(-t * 12) * 0.32;
  }
});

// impact — sub boom + noise crack + long tail
sfx("impact.wav", 1.8, (n, L, R) => {
  const lp = lowpass();
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const s = i / SR;
    ph += (TAU * (38 + 90 * Math.exp(-s * 18))) / SR;
    const boom = Math.sin(ph) * Math.exp(-s * 2.6) * 1.1;
    const crack = lp(rnd(), 0.35) * Math.exp(-s * 16) * 0.9;
    const tail = rnd() * Math.exp(-s * 3.2) * 0.04;
    L[i] = boom + crack + tail;
    R[i] = boom + crack * 0.85 - tail;
  }
});

// thud — muted low hit for the letdown
sfx("thud.wav", 0.7, (n, L, R) => {
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const s = i / SR;
    ph += (TAU * (70 - 30 * Math.min(1, s * 4))) / SR;
    L[i] = R[i] = Math.sin(ph) * Math.exp(-s * 5) * 0.9;
  }
});

// downer — descending detuned "wah" for disappointing numbers
sfx("downer.wav", 0.9, (n, L, R) => {
  let p1 = 0, p2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const f = midi(64 - 7 * t * t);
    p1 += (TAU * f) / SR;
    p2 += (TAU * f * 1.006) / SR;
    const env = Math.min(1, t * 20) * Math.exp(-t * 2.4);
    const v = (Math.sin(p1) + 0.4 * Math.sin(2 * p1)) * env * 0.22;
    L[i] = v + Math.sin(p2) * env * 0.1;
    R[i] = v - Math.sin(p2) * env * 0.1;
  }
});

// riser — 1.2s noise + rising tone, ends abruptly (cut lands on the hit)
sfx("riser.wav", 1.2, (n, L, R) => {
  const lp = lowpass();
  let ph = 0, ph2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.pow(t, 2.2) * (t > 0.97 ? (1 - t) / 0.03 : 1);
    const nz = lp(rnd(), 0.02 + 0.5 * t * t);
    ph += (TAU * (220 + 900 * t * t)) / SR;
    ph2 += (TAU * (223 + 905 * t * t)) / SR;
    L[i] = (nz * 1.2 + Math.sin(ph) * 0.18) * env;
    R[i] = (nz * 1.2 + Math.sin(ph2) * 0.18) * env;
  }
});

// shimmer — gold sparkle: stacked high partials with random glints
sfx("shimmer.wav", 1.1, (n, L, R) => {
  const notes = [88, 91, 95, 100, 103].map(midi);
  for (let i = 0; i < n; i++) {
    const s = i / SR;
    let l = 0, r = 0;
    notes.forEach((f, k) => {
      const on = s - k * 0.045;
      if (on < 0) return;
      const v = Math.sin(TAU * f * on) * Math.exp(-on * 4.2) * 0.07;
      l += k % 2 ? v : v * 0.6;
      r += k % 2 ? v * 0.6 : v;
    });
    L[i] = l;
    R[i] = r;
  }
});

// ding — warm success bell (fundamental + inharmonic partials)
sfx("ding.wav", 1.4, (n, L, R) => {
  const f = midi(81);
  for (let i = 0; i < n; i++) {
    const s = i / SR;
    const v =
      Math.sin(TAU * f * s) * Math.exp(-s * 3) * 0.3 +
      Math.sin(TAU * f * 2.76 * s) * Math.exp(-s * 6) * 0.12 +
      Math.sin(TAU * f * 5.4 * s) * Math.exp(-s * 10) * 0.06;
    L[i] = v;
    R[i] = v * 0.92;
  }
});

// ------------------------------------------------------------ music bed
{
  const DUR = 30;
  const N = SR * DUR;
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const add = (start, dur, fn, pan = 0) => {
    const s0 = Math.floor(start * SR);
    const n = Math.floor(dur * SR);
    const gl = Math.min(1, 1 - pan), gr = Math.min(1, 1 + pan);
    for (let i = 0; i < n && s0 + i < N; i++) {
      const v = fn(i / SR, i / n);
      L[s0 + i] += v * gl;
      R[s0 + i] += v * gr;
    }
  };
  const BEAT = 0.5;
  // Am - F - C - G, one chord per bar (2s)
  const prog = [
    [57, 60, 64, 69],
    [53, 57, 60, 65],
    [48, 55, 60, 64],
    [55, 59, 62, 67],
  ];
  const chordAt = (t) => prog[Math.floor(t / 2) % 4];

  // section energy
  const drive = (t) => (t >= 4 && t < 8.3) || (t >= 12 && t < 27.2);
  const letdown = (t) => t >= 8.3 && t < 12;

  // pad — detuned saws, slow attack, lowpass opens over the intro
  for (let bar = 0; bar < 15; bar++) {
    const t0 = bar * 2;
    const ch = chordAt(t0);
    const last = t0 >= 26;
    ch.forEach((m, k) => {
      [-0.07, 0.07].forEach((det, j) => {
        const f = midi(m + det);
        const lp = lowpass();
        let ph = (rnd() + 1) * Math.PI;
        add(
          t0,
          last ? 4 : 2.05,
          (s, p) => {
            ph += (TAU * f) / SR;
            const saw = ((ph / TAU) % 1) * 2 - 1;
            const cutoff = letdown(t0 + s) ? 0.02 : 0.03 + Math.min(0.06, (t0 + s) / 60);
            const env = Math.min(1, s / 0.25) * (last ? Math.exp(-s * 0.9) : Math.min(1, (2.05 - s) / 0.08));
            return lp(saw, cutoff) * env * 0.055;
          },
          j ? 0.5 : -0.5,
        );
      });
    });
  }

  // pluck arpeggio — 8ths, with a ping-pong echo
  for (let i = 0; i < 60; i++) {
    const t = i * 0.25;
    const tt = t * 2;
    if (tt >= 27.2) break;
    if (letdown(tt) && i % 2) continue;
    const ch = chordAt(tt);
    const m = ch[[0, 2, 1, 3, 2, 1, 3, 2][i % 8]] + 12;
    const gain = tt < 4 ? 0.06 + tt * 0.01 : letdown(tt) ? 0.05 : 0.1;
    [0, 0.375, 0.75].forEach((d, e) => {
      let ph = 0;
      add(
        tt + d,
        0.4,
        (s) => {
          ph += (TAU * midi(m)) / SR;
          return (Math.sin(ph) + 0.3 * Math.sin(2 * ph)) * Math.exp(-s * 11) * gain * Math.pow(0.45, e);
        },
        e === 0 ? 0 : e === 1 ? -0.7 : 0.7,
      );
    });
  }

  // kick, sub bass (sidechained), hats, claps
  const kickTimes = [];
  for (let t = 0; t < 27.2; t += BEAT) {
    if (drive(t)) kickTimes.push(t);
    else if (letdown(t) && Math.round(t / BEAT) % 4 === 0) kickTimes.push(t);
  }
  kickTimes.forEach((t) => {
    let ph = 0;
    add(t, 0.32, (s, p) => {
      ph += (TAU * (48 + 110 * Math.exp(-s * 30))) / SR;
      return Math.sin(ph) * Math.exp(-p * 5) * 0.62 + (s < 0.004 ? rnd() * 0.25 : 0);
    });
  });
  const duck = (t) => {
    let g = 1;
    for (const k of kickTimes) {
      const d = t - k;
      if (d >= 0 && d < 0.3) g = Math.min(g, 0.2 + 0.8 * (d / 0.3));
    }
    return g;
  };
  for (let t = 4; t < 27.2; t += 0.25) {
    if (!drive(t) && !letdown(t)) continue;
    const root = chordAt(t)[0] - 24;
    let ph = 0;
    add(t, 0.25, (s, p) => {
      ph += (TAU * midi(root)) / SR;
      const v = Math.sin(ph) + 0.25 * Math.sin(2 * ph);
      return v * Math.min(1, (0.25 - s) / 0.02) * duck(t + s) * (letdown(t) ? 0.16 : 0.24);
    });
  }
  for (let t = 4.25; t < 27.2; t += 0.5) {
    if (!drive(t)) continue;
    let hp = 0;
    add(
      t,
      0.07,
      (s, p) => {
        const x = rnd();
        const h = x - hp;
        hp += 0.25 * (x - hp);
        return h * Math.exp(-p * 6) * 0.1;
      },
      0.25,
    );
  }
  for (let t = 13; t < 27.2; t += 1) {
    const lp = lowpass();
    add(t, 0.2, (s, p) => lp(rnd(), 0.4) * Math.exp(-p * 7) * 0.22, -0.15);
  }

  // master fade-in and ring-out
  for (let i = 0; i < N; i++) {
    const s = i / SR;
    const g = Math.min(1, s / 0.15) * (s > 29 ? Math.max(0, (30 - s) / 1) : 1);
    L[i] *= g * 0.9;
    R[i] *= g * 0.9;
  }
  writeFileSync(join(OUT, "bed.wav"), wav(L, R));
}

console.log("wrote", OUT);
