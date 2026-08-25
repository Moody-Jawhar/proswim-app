// On-device training of the insights model.
//
// There is no labelled dataset of ProSwim students, so the network is trained
// by knowledge distillation: we generate thousands of plausible synthetic
// students (correlated features driven by latent "engagement" and "progress"
// factors) and label them with noisy expert rules written with the coaching
// team's heuristics. The network learns a smooth scoring function that
// interpolates those rules for real, mixed cases.
//
// Training is deterministic (seeded RNG), takes a few tens of milliseconds on
// a phone, and the resulting weights are cached in localStorage so it runs
// once per model version per device.

import { NeuralNet, makeRng, type SerializedNet } from './nn';
import { N_FEATURES } from './features';

export const MODEL_VERSION = 1;
export const OUTPUTS = ['attendanceRisk', 'momentum', 'plateauRisk', 'churnRisk', 'paymentRisk'] as const;
export type OutputName = (typeof OUTPUTS)[number];

const CACHE_KEY = `proswim.insightsModel.v${MODEL_VERSION}`;
const SIZES = [N_FEATURES, 16, 10, OUTPUTS.length];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const sig = (z: number) => 1 / (1 + Math.exp(-z));

/** Small symmetric noise so the labels are soft, not brittle rules. */
const noise = (rng: () => number, scale: number) => (rng() + rng() - 1) * scale;

export function generateTrainingSet(n: number, seed = 42): { inputs: number[][]; targets: number[][] } {
  const rng = makeRng(seed);
  const inputs: number[][] = [];
  const targets: number[][] = [];

  for (let k = 0; k < n; k++) {
    // Latent factors: how engaged the swimmer is, and how healthy progress is.
    const e = rng();          // engagement
    const q = rng() * 0.6 + e * 0.4; // progress correlates with engagement
    const u = rng();          // independent variation

    const attRecent = clamp01(0.2 + 0.75 * e + noise(rng, 0.15));
    const attOverall = clamp01(0.3 + 0.55 * e + noise(rng, 0.1));
    const trend = clamp01((attRecent - attOverall + 1) / 2);
    const missStreak = clamp01((1 - attRecent) * (0.3 + rng() * 1.1) + noise(rng, 0.05));
    const daysSinceAtt = clamp01((1 - e) * rng() * 1.3);
    const completion = rng();
    const velRecent = clamp01(0.7 * q * attRecent + noise(rng, 0.12));
    const velDrop = clamp01(0.5 + (u - q) * 0.5 + noise(rng, 0.1));
    const daysSinceSkill = clamp01((1 - q) * (0.2 + rng()) + noise(rng, 0.05));
    const levelPace = clamp01(0.33 + (1 - q) * rng() * 0.6 + noise(rng, 0.05));
    const hasPrivate = rng() < 0.5 ? 1 : 0;
    const sessionsLeft = hasPrivate ? rng() : 0.5;
    const dueRatio = rng() < 0.55 ? 0 : rng() ** 2;
    const stopped = rng() < 0.06 + 0.15 * (1 - e) ? 1 : 0;

    inputs.push([
      attRecent, attOverall, trend, missStreak, daysSinceAtt,
      completion, velRecent, velDrop, daysSinceSkill, levelPace,
      sessionsLeft, hasPrivate, dueRatio, stopped,
    ]);

    // ── Expert-rule labels (soft probabilities + noise) ──────────────────
    const attendanceRisk = sig(
      6 * (0.6 - attRecent) + 2 * (attOverall - attRecent)
      + 2.5 * missStreak + 1.5 * daysSinceAtt - 1,
    );
    const momentum = sig(
      6 * velRecent - 3 * daysSinceSkill + 2 * (attRecent - 0.5)
      + 2 * (0.5 - velDrop) - 1.2,
    );
    const plateauRisk = sig(
      4 * daysSinceSkill + 3 * (levelPace - 0.4) + 2 * velDrop
      - 2 * velRecent - 1.5,
    );
    const churnRisk = sig(
      3 * (attendanceRisk - 0.5) + 2.5 * daysSinceAtt + 3 * stopped
      + 1.2 * dueRatio + (hasPrivate && sessionsLeft < 0.15 ? 1 : 0) - 1.6,
    );
    const paymentRisk = sig(6 * dueRatio - 2 + 0.5 * stopped);

    targets.push([attendanceRisk, momentum, plateauRisk, churnRisk, paymentRisk]
      .map((y) => clamp01(y + noise(rng, 0.04))));
  }
  return { inputs, targets };
}

export function trainModel(): NeuralNet {
  const net = new NeuralNet(SIZES, makeRng(1337));
  const { inputs, targets } = generateTrainingSet(3000);
  net.train(inputs, targets, { epochs: 30, lr: 0.06, momentum: 0.9, batch: 32, rng: makeRng(7) });
  return net;
}

let cached: NeuralNet | null = null;

/** The trained model: module cache → localStorage → train now (once). */
export function getModel(): NeuralNet {
  if (cached) return cached;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
    if (raw) {
      const data = JSON.parse(raw) as SerializedNet;
      if (Array.isArray(data.sizes) && data.sizes.length === SIZES.length) {
        cached = NeuralNet.fromJSON(data);
        return cached;
      }
    }
  } catch { /* corrupt cache — retrain below */ }

  cached = trainModel();
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached.toJSON()));
    }
  } catch { /* storage full/unavailable — model still works from memory */ }
  return cached;
}

/** Named scores in [0,1] for one feature vector. */
export function score(features: number[]): Record<OutputName, number> {
  const out = getModel().predict(features);
  const scores = {} as Record<OutputName, number>;
  OUTPUTS.forEach((name, i) => { scores[name] = out[i]; });
  return scores;
}
