import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { retroAudio } from '../../services/audio';

interface DeskLampProps {
  isNightMode: boolean;
  onToggleLamp: () => void;
}

export const DeskLamp: React.FC<DeskLampProps> = ({ isNightMode, onToggleLamp }) => {
  const targetRef = useRef<THREE.Object3D>(null);

  // Antique brass material
  const brassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#c59b27',
      metalness: 0.85,
      roughness: 0.25
    });
  }, []);

  // Emerald green glass lampshade material
  const emeraldShadeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isNightMode ? '#1b4332' : '#2d6a4f',
      emissive: isNightMode ? '#52b788' : '#000000',
      emissiveIntensity: isNightMode ? 0.35 : 0.0,
      roughness: 0.2,
      metalness: 0.1
    });
  }, [isNightMode]);

  // Glowing incandescent bulb material
  const bulbMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isNightMode ? '#ffffff' : '#dddddd',
      emissive: isNightMode ? '#ffbe0b' : '#333333',
      emissiveIntensity: isNightMode ? 2.5 : 0.1
    });
  }, [isNightMode]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    retroAudio.playLampClick();
    onToggleLamp();
  };

  return (
    // Situated on the left desk surface next to papers and monitor
    <group position={[-2.05, -0.48, 0.45]}>
      {/* Target object for spotlight cone aimed at keyboard and desk center */}
      <object3D ref={targetRef} position={[1.5, 0.0, 0.6]} />

      {/* 1. Heavy Stepped Brass Base */}
      <mesh
        material={brassMaterial}
        position={[0, 0.02, 0]}
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <cylinderGeometry args={[0.22, 0.25, 0.04, 32]} />
      </mesh>
      <mesh material={brassMaterial} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.16, 0.20, 0.03, 32]} />
      </mesh>

      {/* 2. Curved Brass Stem / Armature */}
      <mesh material={brassMaterial} position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.65, 16]} />
      </mesh>
      {/* Arm bend towards center desk */}
      <mesh material={brassMaterial} position={[0.10, 0.72, 0.06]} rotation={[0.4, 0, -0.4]}>
        <cylinderGeometry args={[0.022, 0.022, 0.28, 16]} />
      </mesh>
      {/* Swivel joint */}
      <mesh material={brassMaterial} position={[0.22, 0.82, 0.12]}>
        <sphereGeometry args={[0.045, 16, 16]} />
      </mesh>

      {/* 3. Authentic Green Glass Banker's Lampshade */}
      <group
        position={[0.25, 0.84, 0.14]}
        rotation={[0.35, 0.45, -0.2]}
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        {/* Outer green glass hood */}
        <mesh material={emeraldShadeMaterial} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.15, 0.44, 32, 1, false, 0, Math.PI]} />
        </mesh>

        {/* Brass side caps */}
        <mesh material={brassMaterial} position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
        </mesh>
        <mesh material={brassMaterial} position={[0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
        </mesh>

        {/* Incandescent lightbulb tucked inside hood */}
        <mesh material={bulbMaterial} position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
        </mesh>

        {/* Golden pull-chain with bead */}
        <mesh material={brassMaterial} position={[0.14, -0.16, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.22, 8]} />
        </mesh>
        <mesh material={brassMaterial} position={[0.14, -0.28, 0]}>
          <sphereGeometry args={[0.016, 12, 12]} />
        </mesh>
      </group>

      {/* 4. Active Night-Mode Lighting System */}
      {isNightMode && targetRef.current && (
        <>
          {/* Intense warm spotlight cone projecting across desk workspace */}
          <spotLight
            position={[0.25, 0.82, 0.14]}
            target={targetRef.current}
            angle={0.80}
            penumbra={0.75}
            intensity={8.5}
            color="#ffb347"
            distance={8.5}
          />
          {/* Soft ambient bulb halo */}
          <pointLight
            position={[0.25, 0.78, 0.14]}
            intensity={3.2}
            color="#ff9900"
            distance={2.8}
          />
        </>
      )}
    </group>
  );
};
