/**
 * Returns a mirrored (reflected) version of a shape's cube array.
 * Mirrors along the X axis: x → -x, then re-centres.
 * A mirrored chiral shape cannot be obtained by rotation — it is genuinely
 * "different" from the original, as required by the same/different paradigm.
 *
 * @param {Array<{x,y,z}>} cubes
 * @returns {Array<{x,y,z}>}
 */
export function mirrorCubes(cubes) {
  const mirrored = cubes.map(({ x, y, z }) => ({ x: -x, y, z }));
  // Re-centre so minimum x is 0
  const minX = Math.min(...mirrored.map((c) => c.x));
  return mirrored.map(({ x, y, z }) => ({ x: x - minX, y, z }));
}

/**
 * Centres a cube array so its geometric centre is at the origin.
 * Applied before rendering so objects rotate around their own centre.
 *
 * @param {Array<{x,y,z}>} cubes
 * @returns {Array<{x,y,z}>}
 */
export function centreCubes(cubes) {
  const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const cx = avg(cubes.map((c) => c.x));
  const cy = avg(cubes.map((c) => c.y));
  const cz = avg(cubes.map((c) => c.z));
  return cubes.map(({ x, y, z }) => ({ x: x - cx, y: y - cy, z: z - cz }));
}
