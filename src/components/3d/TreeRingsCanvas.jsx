"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import TreeRings from './TreeRings';

const TreeRingsCanvas = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden">
      <Canvas
        gl={{ antialias: true }}
        style={{ 
          background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <TreeRings 
            numRings={20}
            baseRadius={3}
            ringSpacing={0.15}
            rotationSpeed={0.3}
            interactive={true}
          />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
      {mounted && (
        <div className="absolute bottom-4 left-4 text-white/50 text-sm">
          Debug: Three.js Canvas Active
        </div>
      )}
    </div>
  );
};

export default TreeRingsCanvas;
