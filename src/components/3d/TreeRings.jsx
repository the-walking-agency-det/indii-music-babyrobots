'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function TreeRings({
  numRings = 15,
  baseRadius = 2,
  ringSpacing = 0.15,
  rotationSpeed = 0.2,
  ringColor = '#8B4513',
  interactive = true
}) {
  const groupRef = useRef();
  const meshRefs = useRef([]);

  // Generate ring geometries with varying radii
  const rings = useMemo(() => {
    return Array.from({ length: numRings }, (_, i) => {
      const radius = baseRadius - (i * ringSpacing);
      const thickness = ringSpacing * 0.8;
      const geometry = new THREE.RingGeometry(
        radius - thickness/2,
        radius + thickness/2,
        64
      );
      const roughness = 0.4 + Math.random() * 0.3;
      const metalness = 0.1 + Math.random() * 0.2;
      const color = new THREE.Color(ringColor).multiplyScalar(0.9 + Math.random() * 0.2);
      
      return {
        geometry,
        material: new THREE.MeshStandardMaterial({
          color,
          roughness,
          metalness,
          side: THREE.DoubleSide
        })
      };
    });
  }, [numRings, baseRadius, ringSpacing, ringColor]);

  // Animate rings
  useFrame((state, delta) => {
    if (!interactive) return;
    
    meshRefs.current.forEach((mesh, i) => {
      if (mesh) {
        // Alternate rotation direction for each ring
        const direction = i % 2 === 0 ? 1 : -1;
        mesh.rotation.z += delta * rotationSpeed * direction;
        
        // Add subtle wave motion
        mesh.position.z = Math.sin(state.clock.elapsedTime + i) * 0.02;
      }
    });

    // Gentle group rotation
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          ref={el => meshRefs.current[i] = el}
          geometry={ring.geometry}
          material={ring.material}
          position={[0, 0, i * 0.01]} // Slight z-offset to prevent z-fighting
        >
          {interactive && (
            <meshStandardMaterial
              {...ring.material}
              emissive={ring.material.color}
              emissiveIntensity={0.1}
            />
          )}
        </mesh>
      ))}
    </group>
  );
}

export default TreeRings;
