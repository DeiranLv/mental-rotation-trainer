import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function RotatingObject() {
  const meshRef = useRef();

  useFrame((_, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.8;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#4f8ef7" />
    </mesh>
  );
}
