import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import RotatingObject from './RotatingObject';

export default function ThreeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <RotatingObject />
      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}
