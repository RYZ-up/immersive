import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, useGLTF } from '@react-three/drei';
import './Model3D.css';

// Composant pour charger le modèle 3D
function Model3DObject({ modelPath = '/models/esp8266.glb', scale = 1.5 }) {
  const modelRef = useRef();
  const { scene } = useGLTF(modelPath);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Animation de rotation du modèle
    if (modelRef.current) {
      modelRef.current.rotation.y = time * 0.3;
      modelRef.current.position.y = Math.sin(time * 0.5) * 0.2;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={scale}
      position={[0, 0, 0]}
    />
  );
}

// Composant de chargement
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#888888" wireframe />
    </mesh>
  );
}

const Model3D = () => {
  return (
    <div className="model-3d-container">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />

        {/* Lumières */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#888888" />
        <spotLight
          position={[0, 5, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          color="#ffffff"
        />

        {/* Modèle 3D */}
        <Suspense fallback={<LoadingFallback />}>
          <Model3DObject modelPath="/models/esp8266.glb" scale={2} />
        </Suspense>

        {/* Contrôles de la caméra */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* Environnement */}
        <Environment preset="city" />
      </Canvas>

      <div className="model-overlay-text">
        <p>Interagissez avec le modèle 3D</p>
      </div>
    </div>
  );
};

export default Model3D;
