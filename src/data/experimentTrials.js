import { stimulusPool } from './stimulusPool';

/**
 * Fixed 20-trial experiment set — identical for every participant.
 * Design: 5 angles × 2 types (same/different) × 2 repetitions = 20 trials.
 * Order is pseudo-random but fixed (not shuffled at runtime).
 *
 * Each trial:
 *   objectId      – shape from stimulusPool
 *   rotationAngle – degrees (0 | 45 | 90 | 135 | 180)
 *   isIdentical   – true = same shape rotated | false = mirror
 */
export const experimentTrials = [
  { objectId: 'shape_01', rotationAngle:   0, isIdentical: true  },
  { objectId: 'shape_02', rotationAngle:  45, isIdentical: false },
  { objectId: 'shape_03', rotationAngle:  90, isIdentical: true  },
  { objectId: 'shape_04', rotationAngle: 135, isIdentical: false },
  { objectId: 'shape_05', rotationAngle: 180, isIdentical: true  },
  { objectId: 'shape_06', rotationAngle:  45, isIdentical: true  },
  { objectId: 'shape_07', rotationAngle:  90, isIdentical: false },
  { objectId: 'shape_08', rotationAngle: 135, isIdentical: true  },
  { objectId: 'shape_01', rotationAngle: 180, isIdentical: false },
  { objectId: 'shape_02', rotationAngle:   0, isIdentical: true  },
  { objectId: 'shape_03', rotationAngle: 135, isIdentical: false },
  { objectId: 'shape_04', rotationAngle:  45, isIdentical: true  },
  { objectId: 'shape_05', rotationAngle:   0, isIdentical: false },
  { objectId: 'shape_06', rotationAngle:  90, isIdentical: true  },
  { objectId: 'shape_07', rotationAngle: 180, isIdentical: false },
  { objectId: 'shape_08', rotationAngle:  45, isIdentical: false },
  { objectId: 'shape_01', rotationAngle:  90, isIdentical: false  },
  { objectId: 'shape_02', rotationAngle: 135, isIdentical: true  },
  { objectId: 'shape_03', rotationAngle: 180, isIdentical: true  },
  { objectId: 'shape_04', rotationAngle:   0, isIdentical: false },
].map((t, i) => ({ ...t, trialOrder: i + 1 }));

// Sanity checks (will throw during dev if violated)
const angles = [0, 45, 90, 135, 180];
angles.forEach((angle) => {
  const subset = experimentTrials.filter((t) => t.rotationAngle === angle);
  console.assert(subset.length === 4, `Expected 4 trials for angle ${angle}`);
  console.assert(subset.filter((t) => t.isIdentical).length === 2, `Expected 2 same for angle ${angle}`);
});

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
