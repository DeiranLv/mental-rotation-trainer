import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const CUBE_SIZE = 0.92;

// Shapes to decorate the 404 page — small, visually distinct
const DECO_SHAPES = [
  // L-shape
  [{ x:0,y:0,z:0 },{ x:0,y:1,z:0 },{ x:0,y:2,z:0 },{ x:1,y:0,z:0 },{ x:2,y:0,z:0 }],
  // Z-snake
  [{ x:0,y:1,z:0 },{ x:1,y:1,z:0 },{ x:1,y:0,z:0 },{ x:2,y:0,z:0 }],
  // T-shape
  [{ x:0,y:1,z:0 },{ x:1,y:1,z:0 },{ x:2,y:1,z:0 },{ x:1,y:0,z:0 },{ x:1,y:2,z:0 }],
  // step
  [{ x:0,y:0,z:0 },{ x:0,y:1,z:0 },{ x:1,y:1,z:0 },{ x:1,y:2,z:0 }],
  // S-shape
  [{ x:1,y:0,z:0 },{ x:2,y:0,z:0 },{ x:0,y:1,z:0 },{ x:1,y:1,z:0 }],
  // corner 3D
  [{ x:0,y:0,z:0 },{ x:1,y:0,z:0 },{ x:0,y:1,z:0 },{ x:0,y:0,z:1 }],
  // tall I
  [{ x:0,y:0,z:0 },{ x:0,y:1,z:0 },{ x:0,y:2,z:0 },{ x:0,y:3,z:0 }],
];

function centre(cubes) {
  const xs = cubes.map(c => c.x), ys = cubes.map(c => c.y), zs = cubes.map(c => c.z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  return cubes.map(c => ({ x: c.x - cx, y: c.y - cy, z: c.z - cz }));
}

function SpinningShape({ cubes, speed = 0.6, initialY = 0 }) {
  const groupRef = useRef();
  const centred = centre(cubes);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += speed * delta;
      groupRef.current.rotation.x += speed * 0.3 * delta;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.3, initialY, 0]}>
      {centred.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]}>
          <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
          <meshStandardMaterial color="#6366f1" roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function DecoCanvas({ cubes, speed, initialY }) {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 38, position: [4, 4, 8], near: 0.1, far: 100 }}
      style={{ width: 180, height: 180 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <SpinningShape cubes={cubes} speed={speed} initialY={initialY} />
    </Canvas>
  );
}

export default function NotFoundView() {
  const navigate = useNavigate();

  return (
    <div className="view not-found-view">
      <div className="not-found-figures">
        {DECO_SHAPES.map((cubes, i) => (
          <DecoCanvas key={i} cubes={cubes} speed={0.4 + i * 0.1} initialY={i * 0.9} />
        ))}
      </div>

      <h1 className="not-found-code">404</h1>
      <p>Šāda lapa neeksistē.</p>

      <button onClick={() => navigate('/')}>Uz sākumu</button>
    </div>
  );
}
