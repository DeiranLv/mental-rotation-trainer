import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import MRObject from './MRObject';

/**
 * Renders two MR objects side by side in a fixed scene.
 * Used for both classic (static) and interactive (controlled externally) modes.
 *
 * On mobile (≤ 700px) the camera zooms out and the two objects move closer
 * together so the full pair fits on the screen.
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export default function MRScene({ leftCubes, rightCubes, quaternion = null, quaternionRef, rightQuaternion, highlight = false, compact = false }) {
  const rightQ = rightQuaternion !== undefined ? rightQuaternion : quaternion;
  const isMobile = useIsMobile();

  // `compact` is used for small preview scenes (e.g. instruction examples)
  // where the canvas is much smaller than in the actual task view.
  const zoom = compact
    ? (isMobile ? 22 : 32)
    : (isMobile ? 36 : 55);
  const spread = compact
    ? (isMobile ? 2.2 : 3)
    : (isMobile ? 2.7 : 4);

  return (
    <Canvas
      shadows
      orthographic
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [4, 5, 10], zoom, near: 0.1, far: 100 }}
      style={{ width: '100%', height: '100%', background: '#09090d' }}
    >
      {/* Lighting — fixed, identical for both objects */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[8, 12, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.3} />

      {/* Left object */}
      <group position={[-spread, 0, 0]}>
        <MRObject cubes={leftCubes} quaternion={quaternion} quaternionRef={quaternionRef} highlight={highlight} />
      </group>

      {/* Right object */}
      <group position={[spread, 0, 0]}>
        <MRObject cubes={rightCubes} quaternion={rightQ} quaternionRef={quaternionRef} highlight={highlight} />
      </group>
    </Canvas>
  );
}
