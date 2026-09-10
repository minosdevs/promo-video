// Synthese procedurale de la musique de fond + bruitages (WAV 44.1 kHz stereo 16 bits), 100% libre
// de droits (aucun sample externe). Structure calee sur le montage de Story.tsx :
//   0-8 s   intro tendue : nappe sombre + riser (scenes accroche/tension)
//   8 s     DROP : kick/clap/hats + basse + arpege (revelation du produit)
//   8-36 s  groove (demo du SaaS), variation d'octave a 22 s
//   36 s    coup final + queue de nappe (signature/CTA), fin ~42 s
// Usage : node make-music.mjs [--out public/audio] [--bpm 120] [--drop 8] [--end 36] [--total 42.5] [--seed 1337] [--transpose 0]
//   drop  = seconde ou la batterie demarre (= arrivee du produit dans la video)
//   end   = seconde du coup final (= debut de la signature) ; total = duree du fichier
import fs from "node:fs";

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf("--" + n); return i >= 0 ? argv[i + 1] : d; };
const OUT_DIR = flag("out", "public/audio");
const SR = 44100;
const BPM = Number(flag("bpm", 120));
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const DROP = Number(flag("drop", 8)); // s
const END_BEAT = Number(flag("end", 36)); // s
const TOTAL = Number(flag("total", END_BEAT + 6.5)); // s
const TRANSPOSE = Number(flag("transpose", 0)); // demi-tons
const N = Math.round(TOTAL * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const TAU = Math.PI * 2;
// Progression en La mineur : Am - F - C - G (une mesure chacun)
const CHORDS = [
  [57, 60, 64], // A3 C4 E4
  [53, 57, 60], // F3 A3 C4
  [55, 60, 64], // G3 C4 E4  (C/G)
  [55, 59, 62], // G3 B3 D4
];
const ROOTS = [45, 41, 48, 43]; // A2 F2 C3 G2 (basse)
const hz = (midi) => 440 * Math.pow(2, (midi + TRANSPOSE - 69) / 12);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

// Bruit blanc deterministe (LCG) pour un rendu reproductible
let seed = Number(flag("seed", 1337));
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296 - 0.5;
};

// Filtre passe-bas un pole (stateful)
class LP {
  constructor() {
    this.y = 0;
  }
  step(x, cutoff) {
    const a = 1 - Math.exp((-TAU * cutoff) / SR);
    this.y += a * (x - this.y);
    return this.y;
  }
}

function add(t, l, r) {
  const i = Math.floor(t * SR);
  if (i >= 0 && i < N) {
    L[i] += l;
    R[i] += r;
  }
}

// ---------- Enveloppe de sidechain (creuse tout au passage du kick) ----------
const duck = new Float32Array(N).fill(1);
function kickTimes() {
  const times = [];
  for (let t = DROP; t < END_BEAT; t += BEAT) times.push(t);
  return times;
}
for (const t of kickTimes()) {
  const i0 = Math.floor(t * SR);
  for (let k = 0; k < SR * 0.35; k++) {
    const i = i0 + k;
    if (i >= N) break;
    const env = Math.exp(-k / (SR * 0.09));
    duck[i] = Math.min(duck[i], 1 - 0.55 * env);
  }
}

// ---------- Kick ----------
function kick(t0, gain = 1) {
  const len = SR * 0.4;
  let phase = 0;
  for (let k = 0; k < len; k++) {
    const tt = k / SR;
    const f = 48 + 120 * Math.exp(-tt * 28);
    phase += (TAU * f) / SR;
    const env = Math.exp(-tt * 9);
    const click = k < 120 ? (1 - k / 120) * 0.5 * rnd() : 0;
    const v = (Math.sin(phase) * env + click) * 0.9 * gain;
    add(t0 + tt, v, v);
  }
}

// ---------- Clap ----------
function clap(t0, gain = 1) {
  const lp = new LP();
  for (let b = 0; b < 3; b++) {
    const off = b * 0.011;
    const len = SR * (b === 2 ? 0.22 : 0.03);
    for (let k = 0; k < len; k++) {
      const tt = k / SR;
      const env = Math.exp(-tt * (b === 2 ? 22 : 90));
      const n = rnd() * 2;
      const v = (n - lp.step(n, 900)) * env * 0.5 * gain; // passe-haut = bruit - passe-bas
      add(t0 + off + tt, v * 0.9, v * 1.1);
    }
  }
}

// ---------- Hi-hat ----------
function hat(t0, open = false, gain = 1, pan = 0) {
  const len = SR * (open ? 0.22 : 0.06);
  const lp = new LP();
  for (let k = 0; k < len; k++) {
    const tt = k / SR;
    const env = Math.exp(-tt * (open ? 18 : 70));
    const n = rnd() * 2;
    const v = (n - lp.step(n, 6000)) * env * 0.22 * gain;
    add(t0 + tt, v * (1 - pan) , v * (1 + pan));
  }
}

// ---------- Basse (saw + sub, filtre avec enveloppe) ----------
function bassNote(t0, dur, midi, gain = 1) {
  const f = hz(midi);
  const len = Math.floor(dur * SR);
  const lp = new LP();
  let ph = 0;
  for (let k = 0; k < len; k++) {
    const tt = k / SR;
    ph += f / SR;
    if (ph > 1) ph -= 1;
    const saw = 2 * ph - 1;
    const sub = Math.sin(TAU * f * 0.5 * tt);
    const env = Math.min(1, tt / 0.008) * (tt > dur - 0.03 ? clamp01((dur - tt) / 0.03) : 1);
    const cutoff = 180 + 900 * Math.exp(-tt * 10);
    const v = (lp.step(saw, cutoff) * 0.7 + sub * 0.5) * env * 0.42 * gain;
    const i = Math.floor((t0 + tt) * SR);
    if (i < N) {
      L[i] += v * duck[i];
      R[i] += v * duck[i];
    }
  }
}

// ---------- Nappe (3 saws detunes par note, passe-bas doux) ----------
function pad(t0, dur, midis, gain = 1, cutoffBase = 900) {
  const len = Math.floor(dur * SR);
  const voices = [];
  for (const m of midis) {
    for (const det of [-0.35, 0, 0.35]) {
      voices.push({ f: hz(m) * Math.pow(2, det / 1200 * 6), ph: rnd() + 0.5, det });
    }
    voices.push({ f: hz(m + 12), ph: rnd() + 0.5, det: 0.6 });
  }
  const lpL = new LP();
  const lpR = new LP();
  for (let k = 0; k < len; k++) {
    const tt = k / SR;
    let l = 0;
    let r = 0;
    for (const v of voices) {
      v.ph += v.f / SR;
      if (v.ph > 1) v.ph -= 1;
      const s = 2 * v.ph - 1;
      const w = v.det < 0 ? 1 : v.det > 0 ? 0.35 : 0.7;
      l += s * w;
      r += s * (1.35 - w);
    }
    l /= voices.length;
    r /= voices.length;
    const env = Math.min(1, tt / 0.6) * (tt > dur - 0.8 ? clamp01((dur - tt) / 0.8) : 1);
    const cutoff = cutoffBase + 300 * Math.sin(TAU * 0.11 * (t0 + tt));
    const i = Math.floor((t0 + tt) * SR);
    if (i < N) {
      const d = 0.5 + 0.5 * duck[i];
      L[i] += lpL.step(l, cutoff) * env * 0.55 * gain * d;
      R[i] += lpR.step(r, cutoff) * env * 0.55 * gain * d;
    }
  }
}

// ---------- Pluck d'arpege ----------
function pluck(t0, midi, gain = 1, pan = 0) {
  const f = hz(midi);
  const len = SR * 0.22;
  const lp = new LP();
  let ph = 0;
  for (let k = 0; k < len; k++) {
    const tt = k / SR;
    ph += f / SR;
    if (ph > 1) ph -= 1;
    const sq = ph < 0.5 ? 1 : -1;
    const tri = 4 * Math.abs(ph - 0.5) - 1;
    const env = Math.exp(-tt * 22);
    const v = lp.step(sq * 0.4 + tri * 0.6, 900 + 5000 * Math.exp(-tt * 30)) * env * 0.26 * gain;
    const i = Math.floor((t0 + tt) * SR);
    if (i < N) {
      L[i] += v * (1 - pan) * duck[i];
      R[i] += v * (1 + pan) * duck[i];
    }
  }
}

// ---------- Riser (bruit filtre montant) ----------
function riser(t0, dur, gain = 1) {
  const len = Math.floor(dur * SR);
  const lp = new LP();
  for (let k = 0; k < len; k++) {
    const tt = k / SR;
    const p = tt / dur;
    const n = rnd() * 2;
    const cutoff = 150 + 9000 * p * p;
    const env = p * p;
    const v = lp.step(n, cutoff) * env * 0.5 * gain;
    add(t0 + tt, v * (0.8 + 0.2 * Math.sin(TAU * 6 * tt)), v * (0.8 - 0.2 * Math.sin(TAU * 6 * tt)));
  }
}

// ---------- Impact (boom + crash) ----------
function impact(t0, gain = 1) {
  const len = SR * 1.6;
  const lp = new LP();
  let ph = 0;
  for (let k = 0; k < len; k++) {
    const tt = k / SR;
    const f = 38 + 60 * Math.exp(-tt * 12);
    ph += (TAU * f) / SR;
    const boom = Math.sin(ph) * Math.exp(-tt * 3.2);
    const crash = lp.step(rnd() * 2, 7000) * Math.exp(-tt * 3.5) * 0.35;
    const v = (boom * 0.9 + crash) * gain;
    add(t0 + tt, v, v);
  }
}

// ================= ARRANGEMENT =================
// Intro : nappe sombre, tres filtree, 2 accords lents + tick d'horloge
pad(0, 4.4, CHORDS[0], 0.9, 420);
pad(4, 4.4, CHORDS[1], 1.0, 600);
for (let t = 4; t < DROP; t += BEAT) hat(t, false, 0.5, 0);
for (let t = 6; t < DROP; t += BEAT / 2) hat(t, false, 0.7, 0.3);
riser(DROP - 4, 4, 1.0);
kick(DROP - BEAT, 0.6);

// Drop
impact(DROP, 1.0);
const bars = Math.round((END_BEAT - DROP) / BAR); // 14 mesures
for (let b = 0; b < bars; b++) {
  const t0 = DROP + b * BAR;
  const chord = CHORDS[b % 4];
  const root = ROOTS[b % 4];
  // Nappe
  pad(t0, BAR + 0.1, chord, 1.0, 1100);
  // Batterie
  for (let beat = 0; beat < 4; beat++) {
    const tb = t0 + beat * BEAT;
    kick(tb, 1);
    if (beat === 1 || beat === 3) clap(tb, 1);
    hat(tb, false, 1, -0.2);
    hat(tb + BEAT / 2, true, 0.8, 0.25);
    if (b % 2 === 1 && beat === 3) hat(tb + BEAT * 0.75, false, 0.9, 0.4);
  }
  // Basse : croches, motif root-root-root-octave
  for (let e = 0; e < 8; e++) {
    const te = t0 + e * (BEAT / 2);
    const m = e === 6 ? root + 12 : e === 3 ? root + 7 : root;
    bassNote(te, BEAT / 2 - 0.02, m, e % 2 === 0 ? 1 : 0.8);
  }
  // Arpege : doubles-croches sur 2 octaves, octave haute apres 22 s
  const up = t0 >= 22 ? 12 : 0;
  const seq = [chord[0], chord[1], chord[2], chord[0] + 12, chord[2], chord[1] + 12, chord[0] + 12, chord[2] + 12];
  for (let s = 0; s < 16; s++) {
    const ts = t0 + s * (BEAT / 4);
    const m = seq[s % 8] + up + (s >= 8 ? 0 : 0);
    pluck(ts, m, s % 4 === 0 ? 1 : 0.7, s % 2 === 0 ? -0.5 : 0.5);
  }
}
// Fill avant la fin : roulement de claps + riser court
for (let k = 0; k < 8; k++) clap(END_BEAT - BEAT + k * (BEAT / 8), 0.5 + k * 0.06);
riser(END_BEAT - 2, 2, 0.6);
// Coup final + nappe de sortie
impact(END_BEAT, 1.1);
pad(END_BEAT, 6.4, [57, 60, 64, 69], 1.1, 700);
for (let t = END_BEAT + BAR; t < TOTAL - 0.5; t += BEAT) hat(t, false, 0.35, 0);

// ---------- Master : soft clip + normalisation + fondu de fin ----------
function master(l, r) {
  let peak = 0;
  for (let i = 0; i < l.length; i++) {
    l[i] = Math.tanh(l[i] * 1.25);
    r[i] = Math.tanh(r[i] * 1.25);
    peak = Math.max(peak, Math.abs(l[i]), Math.abs(r[i]));
  }
  const g = 0.89 / (peak || 1);
  const fadeStart = Math.floor((TOTAL - 1.8) * SR);
  for (let i = 0; i < l.length; i++) {
    const fade = i > fadeStart ? clamp01(1 - (i - fadeStart) / (SR * 1.8)) : 1;
    l[i] *= g * fade;
    r[i] *= g * fade;
  }
}
master(L, R);

function writeWav(path, l, r) {
  const n = l.length;
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
  let o = 44;
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(l[i] * 32767))), o);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(r[i] * 32767))), o + 2);
    o += 4;
  }
  fs.writeFileSync(path, buf);
  console.log("wrote", path, (n / SR).toFixed(1) + "s");
}

fs.mkdirSync(OUT_DIR, { recursive: true });
writeWav(`${OUT_DIR}/music.wav`, L, R);

// ---------- Bruitages ----------
function sfx(dur, fn) {
  const n = Math.round(dur * SR);
  const l = new Float32Array(n);
  const r = new Float32Array(n);
  fn(l, r, n);
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(l[i]), Math.abs(r[i]));
  const g = 0.8 / (peak || 1);
  for (let i = 0; i < n; i++) {
    l[i] *= g;
    r[i] *= g;
  }
  return [l, r];
}
// Clic de souris : tick sec
{
  const [l, r] = sfx(0.12, (l, r, n) => {
    const lp = new LP();
    for (let i = 0; i < n; i++) {
      const tt = i / SR;
      const v = lp.step(rnd() * 2, 3500) * Math.exp(-tt * 120) + Math.sin(TAU * 1800 * tt) * Math.exp(-tt * 200) * 0.5;
      l[i] = v;
      r[i] = v;
    }
  });
  writeWav(`${OUT_DIR}/click.wav`, l, r);
}
// Whoosh : bruit filtre en balayage, stereo
{
  const [l, r] = sfx(0.55, (l, r, n) => {
    const lpL = new LP();
    const lpR = new LP();
    for (let i = 0; i < n; i++) {
      const p = i / n;
      const env = Math.sin(Math.PI * p) ** 1.5;
      const cutoff = 300 + 6000 * Math.sin(Math.PI * p);
      const nz = rnd() * 2;
      l[i] = lpL.step(nz, cutoff) * env * (1 - p * 0.6);
      r[i] = lpR.step(nz * 0.9 + rnd() * 0.2, cutoff * 1.1) * env * (0.4 + p * 0.6);
    }
  });
  writeWav(`${OUT_DIR}/whoosh.wav`, l, r);
}
// Pop : petite bulle (sinus a pitch descendant)
{
  const [l, r] = sfx(0.18, (l, r, n) => {
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const tt = i / SR;
      const f = 420 + 700 * Math.exp(-tt * 40);
      ph += (TAU * f) / SR;
      const v = Math.sin(ph) * Math.exp(-tt * 28);
      l[i] = v;
      r[i] = v;
    }
  });
  writeWav(`${OUT_DIR}/pop.wav`, l, r);
}
// Impact isole (pour la signature)
{
  const [l, r] = sfx(1.4, (l, r, n) => {
    const lp = new LP();
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const tt = i / SR;
      const f = 40 + 70 * Math.exp(-tt * 12);
      ph += (TAU * f) / SR;
      const v = Math.sin(ph) * Math.exp(-tt * 3.5) + lp.step(rnd() * 2, 6000) * Math.exp(-tt * 4) * 0.3;
      l[i] = v;
      r[i] = v;
    }
  });
  writeWav(`${OUT_DIR}/impact.wav`, l, r);
}
