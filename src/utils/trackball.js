import * as THREE from 'three';

/**
 * Arcball / trackball rotation helper.
 *
 * Maps pointer position on a DOM element to a quaternion representing
 * the cumulative rotation of a virtual sphere. Rotation only — no zoom, no pan.
 *
 * Usage:
 *   const tb = createTrackball(el);
 *   el.addEventListener('pointerdown', tb.onPointerDown);
 *   window.addEventListener('pointermove', tb.onPointerMove);
 *   window.addEventListener('pointerup',   tb.onPointerUp);
 *   // each frame: quaternion.value is a THREE.Quaternion
 */
export function createTrackball(getQuaternion, setQuaternion) {
  let dragging = false;
  let lastPos = { x: 0, y: 0 };
  let capturedEl = null;

  // Pre-allocated scratch objects — reused on every pointermove to avoid
  // GC pressure when the mouse fires events at 1000 Hz (especially noticeable
  // when the cursor leaves the scene container and small jitters compound).
  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const delta = new THREE.Quaternion();
  const next = new THREE.Quaternion();

  /** Map screen coords → normalised coords using the shorter dimension as radius.
   *  This gives equal angular sensitivity in X and Y regardless of aspect ratio.
   */
  function norm(e, el) {
    const rect = el.getBoundingClientRect();
    const r = Math.min(rect.width, rect.height) * 0.5;
    return {
      x:  (e.clientX - rect.left  - rect.width  * 0.5) / r,
      y: -(e.clientY - rect.top   - rect.height * 0.5) / r,
    };
  }

  /** Project point on unit sphere (outside → on rim). Writes into `out`. */
  function toSphere(p, out) {
    const lenSq = p.x * p.x + p.y * p.y;
    if (lenSq <= 1) {
      out.set(p.x, p.y, Math.sqrt(1 - lenSq));
    } else {
      const inv = 1 / Math.sqrt(lenSq);
      out.set(p.x * inv, p.y * inv, 0);
    }
    return out;
  }

  function onPointerDown(e) {
    dragging = true;
    capturedEl = e.currentTarget;
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPos = norm(e, capturedEl);
  }

  function onPointerMove(e) {
    if (!dragging || !capturedEl) return;
    const cur = norm(e, capturedEl);
    toSphere(lastPos, v0);
    toSphere(cur, v1);

    axis.crossVectors(v0, v1);
    const dot  = THREE.MathUtils.clamp(v0.dot(v1), -1, 1);
    const angle = Math.acos(dot);

    if (axis.lengthSq() > 0.0001) {
      axis.normalize();
      delta.setFromAxisAngle(axis, angle);
      next.multiplyQuaternions(delta, getQuaternion()).normalize();
      setQuaternion(next);
    }
    lastPos = cur;
  }

  function onPointerUp() {
    dragging = false;
    capturedEl = null;
  }

  return { onPointerDown, onPointerMove, onPointerUp, isDragging: () => dragging };
}
