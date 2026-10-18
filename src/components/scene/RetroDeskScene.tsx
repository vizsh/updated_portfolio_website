import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { retroAudio } from '../../services/audio';
import { DeskLamp } from './DeskLamp';
import { CoffeeSteam } from './CoffeeSteam';
import type { CameraViewMode } from '../../types/os';

export interface RetroDeskSceneProps {
  viewMode: CameraViewMode;
  onChangeView: (mode: CameraViewMode) => void;
  isNightMode?: boolean;
  onToggleLamp?: () => void;
  onHoverItem: (item: string | null) => void;
  onInteract: (message: string) => void;
}

// 1. Model Loader Component with reactive materials, computed normals, and interactive targets
const BakedRoomModels: React.FC<{
  viewMode: CameraViewMode;
  onChangeView: (mode: CameraViewMode) => void;
  isNightMode: boolean;
  onToggleLamp: () => void;
  onHoverItem: (item: string | null) => void;
  onInteract: (message: string) => void;
}> = ({
  viewMode,
  onChangeView,
  isNightMode,
  onToggleLamp,
  onHoverItem,
  onInteract
}) => {
  // Load 3D Models
  const computerGltf = useGLTF('/models/Computer/computer_setup.glb');
  const envGltf = useGLTF('/models/World/environment.glb');
  const decorGltf = useGLTF('/models/Decor/decor.glb');

  // Load Baked Textures
  const computerTex = useTexture('/models/Computer/baked_computer.jpg');
  const envTex = useTexture('/models/World/baked_environment.jpg');
  const decorTex = useTexture('/models/Decor/baked_decor_modified.jpg');

  // Configure texture encoding, flipY, compute normals, and reactive MeshStandardMaterials
  useMemo(() => {
    [computerTex, envTex, decorTex].forEach(tex => {
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
    });

    // In Night mode, darken the base tone so unlit room parts plunge into deep atmospheric shadows
    const baseColor = isNightMode ? new THREE.Color('#727d96') : new THREE.Color('#ffffff');

    const compMat = new THREE.MeshStandardMaterial({
      map: computerTex,
      color: baseColor,
      roughness: 0.82,
      metalness: 0.08
    });

    const envMat = new THREE.MeshStandardMaterial({
      map: envTex,
      color: baseColor,
      roughness: 0.88,
      metalness: 0.04
    });

    const decorMat = new THREE.MeshStandardMaterial({
      map: decorTex,
      color: baseColor,
      roughness: 0.85,
      metalness: 0.06
    });

    // Compute vertex normals on all models so Three.js lights interact with them realistically
    [
      { gltf: computerGltf, mat: compMat },
      { gltf: envGltf, mat: envMat },
      { gltf: decorGltf, mat: decorMat }
    ].forEach(({ gltf, mat }) => {
      gltf.scene.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (!mesh.geometry.attributes.normal) {
            mesh.geometry.computeVertexNormals();
          }
          mesh.material = mat;
        }
      });
    });
  }, [computerGltf, envGltf, decorGltf, computerTex, envTex, decorTex, isNightMode]);

  const setPointer = (active: boolean) => {
    document.body.style.cursor = active ? 'pointer' : 'default';
  };

  return (
    <group>
      {/* 3D Meshes */}
      <primitive object={envGltf.scene} />
      <primitive object={decorGltf.scene} />
      <primitive object={computerGltf.scene} />

      {/* Procedural Drifting Coffee Cup Steam above mug */}
      <CoffeeSteam />

      {/* Interactive Vintage Banker's Desk Lamp with Night-Mode Spotlight */}
      <DeskLamp isNightMode={isNightMode} onToggleLamp={onToggleLamp} />

      {/* CRT Glass Display Screen perfectly fitted inside monitor bezel recess */}
      <mesh
        position={[0, 1.20, 0.22]}
        rotation={[-0.05, 0, 0]}
        onClick={e => {
          e.stopPropagation();
          retroAudio.playMouseDown();
          onChangeView('screen');
        }}
        onPointerOver={() => {
          setPointer(true);
          onHoverItem('🖥️ CRT Monitor (Click to enter Windows 98)');
        }}
        onPointerOut={() => {
          setPointer(false);
          onHoverItem(null);
        }}
      >
        <planeGeometry args={[1.15, 0.72]} />
        <meshStandardMaterial
          color="#008080"
          emissive="#008080"
          emissiveIntensity={isNightMode ? 0.6 : 0.25}
          roughness={0.2}
        />
      </mesh>

      {/* Mini Window Bar on CRT Screen */}
      <mesh position={[0, 1.52, 0.225]} rotation={[-0.05, 0, 0]}>
        <planeGeometry args={[1.10, 0.045]} />
        <meshBasicMaterial color="#000080" />
      </mesh>

      {/* Mini Taskbar on CRT Screen */}
      <mesh position={[0, 0.865, 0.225]} rotation={[-0.05, 0, 0]}>
        <planeGeometry args={[1.15, 0.045]} />
        <meshBasicMaterial color="#c0c0c0" />
      </mesh>

      {/* Interactive Hitbox: Mechanical Keyboard */}
      <mesh
        position={[-0.22, -0.42, 1.42]}
        onClick={e => {
          e.stopPropagation();
          retroAudio.playKeyStroke();
          onInteract('⌨️ Mechanical Keyboard — Tactile Cherry MX Blue keystrokes');
        }}
        onPointerOver={() => {
          setPointer(true);
          onHoverItem('⌨️ Mechanical Keyboard (Click to type)');
        }}
        onPointerOut={() => {
          setPointer(false);
          onHoverItem(null);
        }}
      >
        <boxGeometry args={[1.77, 0.16, 0.65]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Interactive Hitbox: Mouse */}
      <mesh
        position={[0.91, -0.41, 1.45]}
        onClick={e => {
          e.stopPropagation();
          retroAudio.playMouseDown();
          retroAudio.playMouseUp();
          onInteract('🖱️ Logitech Trackman Ball Mouse — Clicked & Responsive');
        }}
        onPointerOver={() => {
          setPointer(true);
          onHoverItem('🖱️ Vintage Mouse (Click)');
        }}
        onPointerOut={() => {
          setPointer(false);
          onHoverItem(null);
        }}
      >
        <boxGeometry args={[0.35, 0.16, 0.54]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Interactive Hitbox: Coffee Mug */}
      <mesh
        position={[1.93, -0.22, 1.01]}
        onClick={e => {
          e.stopPropagation();
          retroAudio.playCoffeeClink();
          onInteract('☕ Fresh Arabica Coffee — 100% Caffeinated focus!');
        }}
        onPointerOver={() => {
          setPointer(true);
          onHoverItem('☕ Coffee Mug (Click to sip)');
        }}
        onPointerOut={() => {
          setPointer(false);
          onHoverItem(null);
        }}
      >
        <cylinderGeometry args={[0.26, 0.26, 0.55, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Interactive Hitbox: PC Tower Power Switch */}
      <mesh
        position={[0.02, -0.24, -0.06]}
        onClick={e => {
          e.stopPropagation();
          retroAudio.playPowerButton();
          retroAudio.playDegauss();
          onInteract('⚡ Powering on Pentium II Workstation...');
          onChangeView('screen');
        }}
        onPointerOver={() => {
          setPointer(true);
          onHoverItem('⚡ PC Tower (Click power button to boot OS)');
        }}
        onPointerOut={() => {
          setPointer(false);
          onHoverItem(null);
        }}
      >
        <boxGeometry args={[1.73, 0.51, 1.78]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Interactive Hitbox: House Plant */}
      <mesh
        position={[4.10, -1.27, -0.03]}
        onClick={e => {
          e.stopPropagation();
          retroAudio.playPlantRustle();
          onInteract('🌿 Potted Monstera — Keeping the studio fresh');
        }}
        onPointerOver={() => {
          setPointer(true);
          onHoverItem('🌿 House Plant');
        }}
        onPointerOut={() => {
          setPointer(false);
          onHoverItem(null);
        }}
      >
        <cylinderGeometry args={[1.2, 1.2, 3.2, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Interactive Hitbox: Office Chair */}
      <mesh
        position={[0.85, -0.95, 2.66]}
        onClick={e => {
          e.stopPropagation();
          if (viewMode === 'room') {
            retroAudio.playMouseDown();
            onChangeView('desk');
            onInteract('🪑 Taking a seat at the workstation desk');
          }
        }}
        onPointerOver={() => {
          if (viewMode === 'room') {
            setPointer(true);
            onHoverItem('🪑 Office Chair (Click to sit at desk)');
          }
        }}
        onPointerOut={() => {
          setPointer(false);
          onHoverItem(null);
        }}
      >
        <boxGeometry args={[1.8, 2.0, 1.8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Interactive Hitbox: Desk Project Notes */}
      <mesh
        position={[-2.29, -0.49, 1.09]}
        onClick={e => {
          e.stopPropagation();
          retroAudio.playMouseDown();
          onInteract('📄 Jeevesh Bodhani — AI & CV Engineer (9.6 CGPA, Hackathon Winner)');
        }}
        onPointerOver={() => {
          setPointer(true);
          onHoverItem('📄 Engineer Project Notes');
        }}
        onPointerOut={() => {
          setPointer(false);
          onHoverItem(null);
        }}
      >
        <boxGeometry args={[1.13, 0.08, 1.19]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

// 2. Camera Rig supporting Room View <-> Desk View <-> Screen View + Mouse Wheel Zoom
const CameraRig: React.FC<{
  viewMode: CameraViewMode;
  onWheelZoom: (delta: number) => void;
}> = ({ viewMode, onWheelZoom }) => {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      // CRITICAL FIX: In screen view, wheel scrolling belongs to OS windows and documents.
      // Do NOT capture wheel events for camera zoom or exit!
      if (viewMode === 'screen') return;

      const now = performance.now();
      if (now - lastWheelTime < 280) return;
      if (Math.abs(e.deltaY) > 20) {
        lastWheelTime = now;
        onWheelZoom(e.deltaY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [viewMode, onWheelZoom]);

  useFrame((_, delta) => {
    let targetPos: THREE.Vector3;
    let targetLookAt: THREE.Vector3;

    if (viewMode === 'screen') {
      // Close-up centered on CRT monitor screen
      targetPos = new THREE.Vector3(0, 1.26, 1.65);
      targetLookAt = new THREE.Vector3(0, 1.26, 0.25);
    } else if (viewMode === 'room') {
      // Wide room overview showing the entire study, desk, chair, plant, and window
      targetPos = new THREE.Vector3(
        mouseRef.current.x * 0.65,
        3.35 + mouseRef.current.y * 0.22,
        9.8
      );
      targetLookAt = new THREE.Vector3(mouseRef.current.x * 0.15, 0.35, 0);
    } else {
      // 'desk' - Sitting right in front of the workstation
      targetPos = new THREE.Vector3(
        mouseRef.current.x * 0.35,
        1.75 + mouseRef.current.y * 0.16,
        4.9
      );
      targetLookAt = new THREE.Vector3(mouseRef.current.x * 0.1, 0.65, 0.2);
    }

    // Smooth damp camera translation and rotation
    camera.position.lerp(targetPos, Math.min(1, delta * 3.6));

    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    const destDir = targetLookAt.clone().sub(camera.position).normalize();
    currentLook.lerp(destDir, Math.min(1, delta * 4.2));
    camera.lookAt(camera.position.clone().add(currentLook));
  });

  return null;
};

// 3. Main Scene Container with Dramatic Day/Night Lighting
export const RetroDeskScene: React.FC<RetroDeskSceneProps> = ({
  viewMode,
  onChangeView,
  isNightMode = false,
  onToggleLamp = () => {},
  onHoverItem,
  onInteract
}) => {
  const handleWheelZoom = (deltaY: number) => {
    // When in screen mode, scrolling belongs strictly to OS windows and documents, never exit!
    if (viewMode === 'screen') return;

    if (deltaY > 0) {
      // Scrolling down / back -> Zoom Out to Room
      if (viewMode === 'desk') {
        onChangeView('room');
      }
    } else {
      // Scrolling up / forward -> Zoom In
      if (viewMode === 'room') {
        onChangeView('desk');
      } else if (viewMode === 'desk') {
        onChangeView('screen');
      }
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: isNightMode ? '#030508' : '#141c28',
        transition: 'background-color 0.8s ease'
      }}
    >
      <Canvas
        camera={{ position: [0, 1.8, 5.5], fov: 32 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Dynamic Studio Daylight vs Moody Midnight Atmosphere */}
        <ambientLight
          intensity={isNightMode ? 0.12 : 0.95}
          color={isNightMode ? '#101a2e' : '#e2efff'}
        />

        {/* Sun / Daylight Directional Lights */}
        {!isNightMode && (
          <>
            <directionalLight
              position={[7, 10, 6]}
              intensity={1.4}
              color="#fff7e6"
            />
            <directionalLight
              position={[-5, 7, -2]}
              intensity={0.4}
              color="#d8e8f8"
            />
          </>
        )}

        {/* Cool Window Moonlight in Night Mode */}
        {isNightMode && (
          <directionalLight
            position={[-7, 9, -5]}
            intensity={0.4}
            color="#3b5998"
          />
        )}

        {/* CRT Monitor Phosphor Screen Glow onto Desk at Night */}
        {isNightMode && (
          <pointLight
            position={[0, 1.20, 0.48]}
            intensity={2.4}
            color="#00e5ff"
            distance={3.6}
          />
        )}

        {/* 3D Baked Room, Props & Hitboxes */}
        <React.Suspense fallback={null}>
          <BakedRoomModels
            viewMode={viewMode}
            onChangeView={onChangeView}
            isNightMode={isNightMode}
            onToggleLamp={onToggleLamp}
            onHoverItem={onHoverItem}
            onInteract={onInteract}
          />
        </React.Suspense>

        {/* Smooth Camera Rig */}
        <CameraRig viewMode={viewMode} onWheelZoom={handleWheelZoom} />
      </Canvas>
    </div>
  );
};

// Preload models for instant rendering
useGLTF.preload('/models/Computer/computer_setup.glb');
useGLTF.preload('/models/World/environment.glb');
useGLTF.preload('/models/Decor/decor.glb');
