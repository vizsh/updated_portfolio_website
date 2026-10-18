import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural GLSL Steam Shader for Coffee Mug
const SteamShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#fff7e6') }
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Gentle curling sinusoidal wind drift
      float drift = sin(uTime * 1.5 + pos.y * 4.0) * 0.035 * (pos.y + 0.1);
      float curl = cos(uTime * 2.0 + pos.y * 6.0) * 0.02 * (pos.y + 0.1);
      pos.x += drift;
      pos.z += curl;

      vElevation = pos.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      // Horizontal bell-curve fade to keep center dense and edges soft
      float xDist = abs(vUv.x - 0.5) * 2.0;
      float xAlpha = smoothstep(1.0, 0.1, xDist);

      // Vertical fade: fades in at bottom (cup rim), peaks mid-height, dissipates at top
      float yAlpha = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);

      // Animated turbulence bands
      float turbulence = sin(vUv.y * 12.0 - uTime * 2.5) * 0.15 + 0.85;

      float alpha = xAlpha * yAlpha * turbulence * 0.45;
      gl_FragColor = vec4(uColor, alpha);
    }
  `
};

export const CoffeeSteam: React.FC = () => {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);

  const material1 = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#fff3db') }
      },
      vertexShader: SteamShaderMaterial.vertexShader,
      fragmentShader: SteamShaderMaterial.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    });
  }, []);

  const material2 = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 1.5 },
        uColor: { value: new THREE.Color('#ffeedb') }
      },
      vertexShader: SteamShaderMaterial.vertexShader,
      fragmentShader: SteamShaderMaterial.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    });
  }, []);

  useFrame((_, delta) => {
    if (material1) material1.uniforms.uTime.value += delta;
    if (material2) material2.uniforms.uTime.value += delta * 1.15;
  });

  return (
    // Positioned directly at the coffee mug rim [x: 1.93, y: 0.06, z: 1.01]
    <group position={[1.93, 0.08, 1.01]}>
      {/* Primary steam plume */}
      <mesh ref={meshRef1} material={material1} rotation={[0, 0.3, 0]}>
        <planeGeometry args={[0.22, 0.65, 16, 16]} />
      </mesh>

      {/* Crossed secondary steam plume for 3D volumetric depth */}
      <mesh ref={meshRef2} material={material2} rotation={[0, -1.2, 0]}>
        <planeGeometry args={[0.18, 0.58, 16, 16]} />
      </mesh>
    </group>
  );
};
