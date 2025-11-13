/* eslint-disable react/no-unknown-property */
import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

// Modèle 3D Circuit animé
function CircuitModel() {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/esp8266.glb');

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={0.4}>
      <primitive object={scene} />
    </group>
  );
}

// Fallback pendant le chargement
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4a9eff" wireframe />
    </mesh>
  );
}

export default function Model3DViewer({ className = '' }) {
  return (
    <div className={`model-3d-viewer ${className}`} style={{ width: '100%', height: '100%', minHeight: '200px', maxHeight: '300px' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Lumières améliorées pour un meilleur rendu */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.4} />
        <pointLight position={[-3, 3, -3]} intensity={0.6} color="#88ccff" />
        <pointLight position={[3, -3, 3]} intensity={0.4} color="#ff88cc" />
        <spotLight position={[0, 8, 0]} angle={0.3} penumbra={1} intensity={0.7} />

        <Suspense fallback={<LoadingFallback />}>
          <CircuitModel />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minDistance={3}
          maxDistance={6}
          autoRotate={true}
          autoRotateSpeed={1.5}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>

      <style>{`
        .model-3d-viewer {
          overflow: visible;
          border-radius: 20px;
        }

        .model-3d-viewer canvas {
          display: block;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
