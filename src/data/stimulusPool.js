/**
 * Stimulus pool — chiral 3D shapes + their hardcoded mirrors.
 *
 * ── Coordinate system ─────────────────────────────────────────
 *
 *   x → right      (0 = leftmost column)
 *   y → up         (0 = bottom row)
 *   z → depth/back (0 = front face, 1 = one step behind, etc.)
 *
 *   Each { x, y, z } is the integer grid position of one unit cube.
 *   Cubes should be face-connected (share a full face with at least one neighbour).
 *
 * ── How to write a shape ──────────────────────────────────────
 *
 *   Think of it as layers:
 *     z=0 → front layer  (what you see facing the screen)
 *     z=1 → layer behind it
 *     z=2 → even further back
 *
 *   Within each layer, x goes left→right and y goes bottom→top.
 *
 *   Example — a simple L-shape, front layer only (z=0):
 *     { x:0, y:0, z:0 }, { x:0, y:1, z:0 }, { x:0, y:2, z:0 },  ← left column, 3 tall
 *     { x:1, y:0, z:0 }, { x:2, y:0, z:0 }                       ← bottom row extends right
 *
 * ── Rules ─────────────────────────────────────────────────────
 *
 *   - Shapes can have any number of cubes (7, 8, 9, 10, etc.)
 *   - Each shape must be genuinely chiral: its mirror image (x → -x)
 *     cannot be achieved by any rotation of the original.
 *   - Add both the base shape AND its _mirror variant.
 *
 * ── How to compute the mirror ────────────────────────────────
 *
 *   1. Negate all x values:  x_new = -x
 *   2. Shift so the minimum x is 0:
 *        minX = min of all x_new
 *        x_final = x_new - minX
 *   y and z stay the same.
 *
 *   Example:  { x:2, y:0, z:0 } → { x:-2, y:0, z:0 } → shift by +2 → { x:0, y:0, z:0 }
 *
 * ── Usage in trials ───────────────────────────────────────────
 *
 *   isIdentical = true  → left & right both use shape_XX (right is Y-rotated)
 *   isIdentical = false → left uses shape_XX, right uses shape_XX_mirror (Y-rotated)
 */

export const stimulusPool = [
  // ── shape_01 ──────────────────────────────────────────────────
  {
    id: 'shape_01',                        // 9 cubes — Z-snake: bottom-right → depth → up → left → up
    cubes: [
      { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 }, { x: 3, y: 0, z: 1 }, // bottom right, step back
      { x: 3, y: 1, z: 1 }, { x: 2, y: 1, z: 1 }, { x: 2, y: 1, z: 0 }, // up, step forward
      { x: 1, y: 1, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }, // left arm, top cap
    ],
  },
  {
    id: 'shape_01_mirror',
    cubes: [
      { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }, { x: 0, y: 0, z: 1 },
      { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 0 },
      { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 }, { x: 3, y: 2, z: 0 },
    ],
  },
  // ── shape_02 ──────────────────────────────────────────────────
  {
    id: 'shape_02',                        // 9 cubes — U-loop: bottom → depth → up → back → top cap
    cubes: [
      { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, // bottom, step back-left
      { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }, // left side up, right
      { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 2, z: 1 }, // forward, up, back cap
    ],
  },
  {
    id: 'shape_02_mirror',
    cubes: [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
      { x: 2, y: 0, z: 1 }, { x: 2, y: 1, z: 1 }, { x: 1, y: 1, z: 1 },
      { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 2, z: 1 },
    ],
  },
  // ── shape_03 ──────────────────────────────────────────────────
  {
    id: 'shape_03',                        // 9 cubes — S-snake through 3 depth layers, right-to-left
    cubes: [
      { x: 3, y: 0, z: 2 }, { x: 2, y: 0, z: 2 }, { x: 2, y: 1, z: 2 }, // back layer, up
      { x: 1, y: 1, z: 2 }, { x: 1, y: 0, z: 2 }, { x: 1, y: 0, z: 1 }, // left, down, step forward
      { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, // left, front, up cap
    ],
  },
  {
    id: 'shape_03_mirror',
    cubes: [
      { x: 0, y: 0, z: 2 }, { x: 1, y: 0, z: 2 }, { x: 1, y: 1, z: 2 },
      { x: 2, y: 1, z: 2 }, { x: 2, y: 0, z: 2 }, { x: 2, y: 0, z: 1 },
      { x: 3, y: 0, z: 1 }, { x: 3, y: 0, z: 0 }, { x: 3, y: 1, z: 0 },
    ],
  },
  // ── shape_04 ──────────────────────────────────────────────────
  {
    id: 'shape_04',                        // 9 cubes — diagonal stair: forward-up-right through all 3 axes
    cubes: [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }, // front-left, back, up
      { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 2 }, { x: 2, y: 1, z: 2 }, // right, back, right
      { x: 2, y: 0, z: 2 }, { x: 3, y: 0, z: 2 }, { x: 3, y: 0, z: 1 }, // down, right, step forward
    ],
  },
  {
    id: 'shape_04_mirror',
    cubes: [
      { x: 3, y: 0, z: 0 }, { x: 3, y: 0, z: 1 }, { x: 3, y: 1, z: 1 },
      { x: 2, y: 1, z: 1 }, { x: 2, y: 1, z: 2 }, { x: 1, y: 1, z: 2 },
      { x: 1, y: 0, z: 2 }, { x: 0, y: 0, z: 2 }, { x: 0, y: 0, z: 1 },
    ],
  },
  // ── shape_05 ──────────────────────────────────────────────────
  {
    id: 'shape_05',                        // 9 cubes — Z-flag: top pair + middle hook + bottom row with depth tail
    cubes: [
      { x: 2, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 1, z: 0 }, // top-right pair, down
      { x: 2, y: 1, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 }, // right hook, depth step
      { x: 1, y: 0, z: 1 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 }, // left, deeper tail
    ],
  },
  {
    id: 'shape_05_mirror',
    cubes: [
      { x: 0, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 1, z: 0 },
      { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 },
      { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 }, { x: 2, y: 0, z: 2 },
    ],
  },
  // ── shape_06 ──────────────────────────────────────────────────
  {
    id: 'shape_06',                        // 9 cubes — rising stair: left-low → right-high across XYZ
    cubes: [
      { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }, // left base up, right
      { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, // forward, up, right
      { x: 2, y: 2, z: 1 }, { x: 3, y: 2, z: 1 }, { x: 3, y: 2, z: 0 }, // back, right, forward cap
    ],
  },
  {
    id: 'shape_06_mirror',
    cubes: [
      { x: 3, y: 0, z: 1 }, { x: 3, y: 1, z: 1 }, { x: 2, y: 1, z: 1 },
      { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 1, y: 2, z: 0 },
      { x: 1, y: 2, z: 1 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 2, z: 0 },
    ],
  },
  // ── shape_07 ──────────────────────────────────────────────────
  {
    id: 'shape_07',                        // 9 cubes — tall left column then Z-turn to the right
    cubes: [
      { x: 0, y: 0, z: 2 }, { x: 0, y: 1, z: 2 }, { x: 0, y: 2, z: 2 }, // left column 3-tall, back layer
      { x: 1, y: 2, z: 2 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 1, z: 1 }, // right, forward, down
      { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, // forward, right, up cap
    ],
  },
  {
    id: 'shape_07_mirror',
    cubes: [
      { x: 2, y: 0, z: 2 }, { x: 2, y: 1, z: 2 }, { x: 2, y: 2, z: 2 },
      { x: 1, y: 2, z: 2 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 1, z: 1 },
      { x: 1, y: 1, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
    ],
  },
  // ── shape_08 ──────────────────────────────────────────────────
  {
    id: 'shape_08',                        // 9 cubes — tall T: right column 4-tall + long depth arm at bottom-left
    cubes: [
      { x: 1, y: 3, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 1, z: 0 }, // right column top-down
      { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 0, z: 1 }, // left branch, back, down
      { x: 0, y: 0, z: 2 }, { x: 0, y: 0, z: 3 }, { x: 0, y: 1, z: 3 }, // deep tail + up cap
    ],
  },
  {
    id: 'shape_08_mirror',
    cubes: [
      { x: 0, y: 3, z: 0 }, { x: 0, y: 2, z: 0 }, { x: 0, y: 1, z: 0 },
      { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 0, z: 1 },
      { x: 1, y: 0, z: 2 }, { x: 1, y: 0, z: 3 }, { x: 1, y: 1, z: 3 },
    ],
  },
  // ── shape_09 — 7 cubes — L-column with bottom row + depth cap ──
  {
    id: 'shape_09',
    cubes: [
      { x:0, y:0, z:0 }, { x:0, y:1, z:0 }, { x:0, y:2, z:0 }, // left column, 3 tall
      { x:1, y:0, z:0 },                                          // bottom row middle
      { x:2, y:0, z:0 }, { x:2, y:1, z:0 },                      // right column, 2 tall
      { x:0, y:2, z:1 },                                          // top-left goes 1 deep
    ],
  },
  {
    id: 'shape_09_mirror',
    cubes: [
      { x:2, y:0, z:0 }, { x:2, y:1, z:0 }, { x:2, y:2, z:0 }, // right column, 3 tall
      { x:1, y:0, z:0 },                                          // bottom row middle
      { x:0, y:0, z:0 }, { x:0, y:1, z:0 },                      // left column, 2 tall
      { x:2, y:2, z:1 },                                          // top-right goes 1 deep
    ],
  },
  // ── shape_10 — 8 cubes — tall-L with depth caps at top-left and bottom-right ──
  {
    id: 'shape_10',
    cubes: [
      { x:0, y:0, z:0 }, { x:0, y:1, z:0 }, { x:0, y:2, z:0 }, { x:0, y:3, z:0 }, // left column, 4 tall
      { x:1, y:0, z:0 }, { x:2, y:0, z:0 },                                          // bottom row, 2 right
      { x:0, y:3, z:1 },                                                               // top goes +1 depth
      { x:2, y:0, z:1 },                                                               // right end goes +1 depth
    ],
  },
  {
    id: 'shape_10_mirror',
    cubes: [
      { x:2, y:0, z:0 }, { x:2, y:1, z:0 }, { x:2, y:2, z:0 }, { x:2, y:3, z:0 }, // right column, 4 tall
      { x:1, y:0, z:0 }, { x:0, y:0, z:0 },                                          // bottom row, 2 left
      { x:2, y:3, z:1 },                                                               // top goes +1 depth
      { x:0, y:0, z:1 },                                                               // left end goes +1 depth
    ],
  },
  // ── shape_11 — 8 cubes — corner with depth arm (2 deep) + right arm (2 wide), each with upward cap ──
  {
    id: 'shape_11',
    cubes: [
      { x:0, y:0, z:0 }, { x:0, y:0, z:1 }, { x:0, y:0, z:2 }, // base + 2 depth
      { x:1, y:0, z:0 }, { x:2, y:0, z:0 },                     // 2 right
      { x:0, y:1, z:2 }, { x:0, y:2, z:2 },                     // depth end goes 2 up
      { x:2, y:1, z:0 },                                          // right end goes 1 up
    ],
  },
  {
    id: 'shape_11_mirror',
    cubes: [
      { x:2, y:0, z:0 }, { x:2, y:0, z:1 }, { x:2, y:0, z:2 }, // base + 2 depth
      { x:1, y:0, z:0 }, { x:0, y:0, z:0 },                     // 2 left
      { x:2, y:1, z:2 }, { x:2, y:2, z:2 },                     // depth end goes 2 up
      { x:0, y:1, z:0 },                                          // left end goes 1 up
    ],
  },  // ── shape_11 — 8 cubes — flat L with depth arm (2 deep, 2 up) + right arm (1 up) ──
  {
    id: 'shape_11',
    cubes: [
      { x:0, y:0, z:0 }, { x:0, y:0, z:1 }, { x:0, y:0, z:2 }, // base + 2 depth
      { x:1, y:0, z:0 }, { x:2, y:0, z:0 },                     // 2 right
      { x:0, y:1, z:2 }, { x:0, y:2, z:2 },                     // depth end goes 2 up
      { x:2, y:1, z:0 },                                          // right end goes 1 up
    ],
  },
  {
    id: 'shape_11_mirror',
    cubes: [
      { x:2, y:0, z:0 }, { x:2, y:0, z:1 }, { x:2, y:0, z:2 }, // base + 2 depth
      { x:1, y:0, z:0 }, { x:0, y:0, z:0 },                     // 2 left
      { x:2, y:1, z:2 }, { x:2, y:2, z:2 },                     // depth end goes 2 up
      { x:0, y:1, z:0 },                                          // left end goes 1 up
    ],
  },
  // ── shape_12 — 9 cubes — Z-riser: depth arm at base + right arm rising + depth arm at top ──
  {
    id: 'shape_12',
    cubes: [
      { x:0, y:0, z:0 }, { x:0, y:0, z:1 }, { x:0, y:0, z:2 }, // base + 2 depth
      { x:1, y:0, z:0 }, { x:2, y:0, z:0 },                     // 2 right from base
      { x:2, y:1, z:0 }, { x:2, y:2, z:0 },                     // right end rises 2 up
      { x:2, y:2, z:1 }, { x:2, y:2, z:2 },                     // top goes 2 depth
    ],
  },
  {
    id: 'shape_12_mirror',
    cubes: [
      { x:2, y:0, z:0 }, { x:2, y:0, z:1 }, { x:2, y:0, z:2 }, // base + 2 depth
      { x:1, y:0, z:0 }, { x:0, y:0, z:0 },                     // 2 left from base
      { x:0, y:1, z:0 }, { x:0, y:2, z:0 },                     // left end rises 2 up
      { x:0, y:2, z:1 }, { x:0, y:2, z:2 },                     // top goes 2 depth
    ],
  },
  // ── shape_13 — 10 cubes — S-riser: base row (3) → column (3 up) → depth (2) → top column (2 up) ──
  {
    id: 'shape_13',
    cubes: [
      { x:0, y:0, z:0 }, { x:1, y:0, z:0 }, { x:2, y:0, z:0 }, // base row, 3 wide
      { x:2, y:1, z:0 }, { x:2, y:2, z:0 }, { x:2, y:3, z:0 }, // right end rises 3 up
      { x:2, y:3, z:1 }, { x:2, y:3, z:2 },                     // top goes 2 depth
      { x:2, y:4, z:2 }, { x:2, y:5, z:2 },                     // depth end rises 2 up
    ],
  },
  {
    id: 'shape_13_mirror',
    cubes: [
      { x:2, y:0, z:0 }, { x:1, y:0, z:0 }, { x:0, y:0, z:0 }, // base row, 3 wide
      { x:0, y:1, z:0 }, { x:0, y:2, z:0 }, { x:0, y:3, z:0 }, // left end rises 3 up
      { x:0, y:3, z:1 }, { x:0, y:3, z:2 },                     // top goes 2 depth
      { x:0, y:4, z:2 }, { x:0, y:5, z:2 },                     // depth end rises 2 up
    ],
  },
];
