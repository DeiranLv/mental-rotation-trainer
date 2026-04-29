/**
 * Stimulus pool — 8 chiral 3D shapes for the Shepard-Metzler paradigm.
 *
 * Each shape:
 *   - 9 face-connected unit cubes forming a single chain
 *   - Genuinely chiral: its mirror image cannot be obtained by any rotation
 *   - Distinct from every other shape AND from every other shape's mirror
 *   - Compact bounding box (~3-4 cells per axis) so all shapes have a
 *     consistent visual "size" on screen regardless of rotation angle
 *
 * Each shape was tested against the full cube symmetry group (24 rotations)
 * for both chirality and pairwise distinctness. They are safe to use in
 * same/different mental-rotation trials: a "different" trial is guaranteed
 * to show a genuinely different shape (the mirror), and no two shapes can
 * be confused with each other by any rotation.
 */

export const stimulusPool = [
  {
    id: 'shape_01',
    cubes: [
      { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 }, { x: 3, y: 0, z: 1 },
      { x: 3, y: 1, z: 1 }, { x: 2, y: 1, z: 1 }, { x: 2, y: 1, z: 0 },
      { x: 1, y: 1, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
    ],
  },
  {
    id: 'shape_02',
    cubes: [
      { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
      { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 },
      { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 2, z: 1 },
    ],
  },
  {
    id: 'shape_03',
    cubes: [
      { x: 3, y: 0, z: 2 }, { x: 2, y: 0, z: 2 }, { x: 2, y: 1, z: 2 },
      { x: 1, y: 1, z: 2 }, { x: 1, y: 0, z: 2 }, { x: 1, y: 0, z: 1 },
      { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 },
    ],
  },
  {
    id: 'shape_04',
    cubes: [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 },
      { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 2 }, { x: 2, y: 1, z: 2 },
      { x: 2, y: 0, z: 2 }, { x: 3, y: 0, z: 2 }, { x: 3, y: 0, z: 1 },
    ],
  },
  {
    id: 'shape_05',
    cubes: [
      { x: 2, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 1, z: 0 },
      { x: 2, y: 1, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 },
      { x: 1, y: 0, z: 1 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
    ],
  },
  {
    id: 'shape_06',
    cubes: [
      { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 },
      { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 2, y: 2, z: 0 },
      { x: 2, y: 2, z: 1 }, { x: 3, y: 2, z: 1 }, { x: 3, y: 2, z: 0 },
    ],
  },
  {
    id: 'shape_07',
    cubes: [
      { x: 0, y: 0, z: 2 }, { x: 0, y: 1, z: 2 }, { x: 0, y: 2, z: 2 },
      { x: 1, y: 2, z: 2 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 1, z: 1 },
      { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 },
    ],
  },
  {
    id: 'shape_08',
    cubes: [
      { x: 1, y: 3, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 1, z: 0 },
      { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 2 }, { x: 0, y: 0, z: 3 }, { x: 0, y: 1, z: 3 },
    ],
  },
];
