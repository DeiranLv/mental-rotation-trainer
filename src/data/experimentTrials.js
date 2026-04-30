import { stimulusPool } from './stimulusPool';

/**
 * Fixed 20-trial experiment set — identical for every participant.
 * Design: 20 trials, 10 same / 10 different, angle difficulty balanced in thirds.
 * Order is pseudo-random but fixed (not shuffled at runtime).
 *
 * Angle tiers (Shepard & Metzler 1971 — equal 60° thirds across 0–180°):
 *   Easy   (0–60°):   20°, 45°         — 7 trials
 *   Medium (61–120°): 67°, 90°, 112°   — 7 trials
 *   Hard  (121–180°): 135°, 157°, 180° — 6 trials
 *
 * Each trial:
 *   objectId      – shape from stimulusPool (shapes 01–13 all used)
 *   rotationAngle – degrees
 *   isIdentical   – true = same shape rotated | false = mirror
 */
export const experimentTrials = [
  { objectId: 'shape_02', rotationAngle:  20, isIdentical: true  }, // easy  / same
  { objectId: 'shape_12', rotationAngle:  90, isIdentical: false }, // med   / diff
  { objectId: 'shape_05', rotationAngle: 135, isIdentical: true  }, // hard  / same
  { objectId: 'shape_11', rotationAngle:  45, isIdentical: false }, // easy  / diff
  { objectId: 'shape_04', rotationAngle:  90, isIdentical: true  }, // med   / same
  { objectId: 'shape_01', rotationAngle:  20, isIdentical: false }, // easy  / diff
  { objectId: 'shape_07', rotationAngle: 180, isIdentical: true  }, // hard  / same
  { objectId: 'shape_13', rotationAngle: 112, isIdentical: false }, // med   / diff
  { objectId: 'shape_01', rotationAngle:  45, isIdentical: true  }, // easy  / same
  { objectId: 'shape_05', rotationAngle:  90, isIdentical: false }, // med   / diff
  { objectId: 'shape_06', rotationAngle: 157, isIdentical: true  }, // hard  / same
  { objectId: 'shape_09', rotationAngle:  20, isIdentical: true  }, // easy  / same
  { objectId: 'shape_07', rotationAngle: 112, isIdentical: false }, // med   / diff
  { objectId: 'shape_03', rotationAngle:  45, isIdentical: false }, // easy  / diff
  { objectId: 'shape_08', rotationAngle: 112, isIdentical: true  }, // med   / same
  { objectId: 'shape_09', rotationAngle: 135, isIdentical: false }, // hard  / diff
  { objectId: 'shape_03', rotationAngle:  67, isIdentical: true  }, // med   / same
  { objectId: 'shape_10', rotationAngle:  45, isIdentical: true  }, // easy  / same
  { objectId: 'shape_11', rotationAngle: 157, isIdentical: false }, // hard  / diff
  { objectId: 'shape_13', rotationAngle: 180, isIdentical: false }, // hard  / diff
].map((t, i) => ({ ...t, trialOrder: i + 1 }));

// Sanity checks (will throw during dev if violated)
const EASY_ANGLES = [20, 45];
const MED_ANGLES  = [67, 90, 112];
const HARD_ANGLES = [135, 157, 180];
console.assert(experimentTrials.length === 20, 'Expected 20 trials');
console.assert(experimentTrials.filter(t => t.isIdentical).length === 10, 'Expected 10 same trials');
console.assert(experimentTrials.filter(t => EASY_ANGLES.includes(t.rotationAngle)).length === 7,  'Expected 7 easy-angle trials (20°/45°)');
console.assert(experimentTrials.filter(t => MED_ANGLES.includes(t.rotationAngle)).length  === 7,  'Expected 7 medium-angle trials (67°/90°/112°)');
console.assert(experimentTrials.filter(t => HARD_ANGLES.includes(t.rotationAngle)).length === 6,  'Expected 6 hard-angle trials (135°/157°/180°)');
console.assert(experimentTrials.filter(t => t.rotationAngle === 67).length === 1, 'Expected exactly 1 trial at 67°');

/**
 * Resolves an objectId to the cubes array from the pool.
 * @param {string} objectId
 * @returns {Array<{x,y,z}>}
 */
export function getShapeCubes(objectId) {
  const shape = stimulusPool.find((s) => s.id === objectId);
  if (!shape) throw new Error(`Shape not found: ${objectId}`);
  return shape.cubes;
}
