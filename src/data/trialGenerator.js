import { stimulusPool } from './stimulusPool';

const ANGLES = [0, 45, 90, 135, 180];
const TRIALS_PER_SESSION = 20; // 5 angles × 2 types × 2 reps

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
  const trials = [];

  ANGLES.forEach((angle) => {
    // 2 same + 2 different per angle
    [true, true, false, false].forEach((isIdentical) => {
      const shape = stimulusPool[Math.floor(Math.random() * stimulusPool.length)];
      trials.push({ objectId: shape.id, rotationAngle: angle, isIdentical });
    });
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
  const practiceAngles = [0, 90, 180];
  return practiceAngles.map((angle, i) => {
    const shape = stimulusPool[Math.floor(Math.random() * stimulusPool.length)];
    return {
      trialOrder: i + 1,
      objectId: shape.id,
      rotationAngle: angle,
      isIdentical: Math.random() < 0.5,
      isPractice: true,
    };
  });
}
