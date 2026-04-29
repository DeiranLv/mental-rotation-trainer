import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { centreCubes } from '../utils/shapeUtils';

const CUBE_SIZE = 0.92;   // slight gap between cubes
const CUBE_COLOR = '#4f8ef7';
const OUTLINE_COLOR = '#88bbff';

/**
 * Renders a single MR object as a group of unit cubes.
 *
 * Props:
 *   cubes        – Array<{x,y,z}>  raw cube positions
 *   quaternion   – THREE.Quaternion | null  applied rotation (interactive mode)
 *   highlight    – bool  show emissive outline (active drag state)
 */
export default function MRObject({ cubes, quaternion = null, quaternionRef = null, highlight = false }) {
  const groupRef = useRef();
  const centred = useMemo(() => centreCubes(cubes), [cubes]);

  useFrame(() => {
    if (!groupRef.current) return;
    // quaternionRef (live ref) takes priority — no React re-render needed
    if (quaternionRef) {
      groupRef.current.quaternion.copy(quaternionRef.current);
    } else if (quaternion) {
      groupRef.current.quaternion.copy(quaternion);
    }
  });

  return (
    <group ref={groupRef}>
      {centred.map(({ x, y, z }, i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
          <meshStandardMaterial
            color={CUBE_COLOR}
            emissive={highlight ? OUTLINE_COLOR : '#000000'}
            emissiveIntensity={highlight ? 0.4 : 0}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}
