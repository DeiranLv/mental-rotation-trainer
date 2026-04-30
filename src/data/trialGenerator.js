import { stimulusPool } from './stimulusPool';

// Only base shapes — filter out hardcoded mirror entries so we never
// produce an objectId like 'shape_01_mirror' (which would then try to
// look up 'shape_01_mirror_mirror' and throw).
const baseShapes = stimulusPool.filter((s) => !s.id.endsWith('_mirror'));
// Difficulty tiers — Shepard & Metzler (1971) equal 60° thirds.
// Random integer angle picked within [min, max] per trial.
// Counts: 7 easy + 7 medium + 6 hard = 20 trials, matching the fixed experiment ratio.
const TIERS = [
  { label: 'easy',   min:  0, max:  60, count: 7 },
  { label: 'medium', min: 61, max: 120, count: 7 },
  { label: 'hard',   min: 121, max: 180, count: 6 },
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Fisher-Yates shuffle (in-place).
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a balanced random 20-trial session from the stimulus pool.
 * Guarantees:
 *   - Exactly 10 isIdentical=true + 10 isIdentical=false
 *   - Each angle appears exactly 4 times (2 same + 2 different)
 *   - Shape drawn randomly per trial (with replacement from pool)
 *
 * @returns {Array<{trialOrder, objectId, rotationAngle, isIdentical}>}
 */
export function generateTrials() {
  // Build one trial per slot, random angle within tier, balanced same/diff.
  // Pre-assign exactly 10 same + 10 different, then shuffle together with angles.
  const identicals = shuffle([...Array(10).fill(true), ...Array(10).fill(false)]);
  let idx = 0;
  const trials = [];

  TIERS.forEach(({ min, max, count }) => {
    for (let i = 0; i < count; i++) {
      const shape = baseShapes[Math.floor(Math.random() * baseShapes.length)];
      trials.push({
        objectId: shape.id,
        rotationAngle: randInt(min, max),
        isIdentical: identicals[idx++],
      });
    }
  });

  shuffle(trials);

  return trials.map((t, i) => ({ ...t, trialOrder: i + 1 }));
}

/**
 * Generates 3 practice trials — one easy (0°), one medium (90°), one hard (180°).
 * Uses random shapes and random same/different.
 *
 * @returns {Array<{trialOrder, objectId, rotationAngle, isIdentical, isPractice}>}
 */
export function generatePracticeTrials() {
  // One practice trial per tier, random angle within range
  const practiceAngles = [
    randInt(0,  60),  // easy
    randInt(61, 120), // medium
    randInt(121, 180), // hard
  ];
  return practiceAngles.map((angle, i) => {
    const shape = baseShapes[Math.floor(Math.random() * baseShapes.length)];
      return {
      trialOrder: i + 1,
      objectId: shape.id,
      rotationAngle: angle,
      isIdentical: Math.random() < 0.5,
      isPractice: true,
    };
  });
}
