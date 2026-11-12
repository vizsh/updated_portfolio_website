import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  displaceSphere,
  measureVolumes,
  renderSlice,
  sliceWorldPosition,
  REGION_INFO,
  TUMOUR_CENTRE,
  VIEW_EXTENT,
  MM_PER_UNIT,
  type RegionId,
  type SliceAxis
} from '../../lib/phantom';
import { retroAudio } from '../../services/audio';

const REGIONS: RegionId[] = ['WT', 'TC', 'ET'];
const AXIS_INDEX: Record<SliceAxis, 0 | 1 | 2> = { sagittal: 0, axial: 1, coronal: 2 };
const AXIS_LETTER: Record<SliceAxis, string> = { sagittal: 'x', axial: 'y', coronal: 'z' };
const SLICE_SIZE = 160;
const REPO_URL = 'https://github.com/vizsh/DecentralisedIntelligence_NeuroScope3d_Outliers3797_PS02';

/** Normalised slider position that passes through the tumour centre on this axis. */
const throughTumour = (axis: SliceAxis) => TUMOUR_CENTRE[AXIS_INDEX[axis]] / VIEW_EXTENT[AXIS_INDEX[axis]];

/* ------------------------------ 3D parts ------------------------------ */

const PhantomMesh: React.FC<{
  kind: 'brain' | RegionId;
  color: string;
  opacity: number;
  visible: boolean;
  plane: THREE.Plane;
  clip: boolean;
}> = ({ kind, color, opacity, visible, plane, clip }) => {
  const geometry = useMemo(() => {
    const g = kind === 'brain' ? new THREE.SphereGeometry(1, 128, 96) : new THREE.SphereGeometry(1, 96, 72);
    displaceSphere(g.attributes.position.array as Float32Array, kind);
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [kind]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} visible={visible} renderOrder={kind === 'brain' ? 3 : kind === 'WT' ? 2 : kind === 'TC' ? 1 : 0}>
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity >= 0.9}
        side={THREE.DoubleSide}
        roughness={0.55}
        metalness={0}
        clippingPlanes={clip ? [plane] : []}
      />
    </mesh>
  );
};

/** Translucent square marking the current slice in the 3D view. */
const SliceMarker: React.FC<{ axis: SliceAxis; position: number }> = ({ axis, position }) => {
  const [ex, ey, ez] = VIEW_EXTENT;
  const props: { position: [number, number, number]; rotation: [number, number, number]; size: [number, number] } =
    axis === 'axial'
      ? { position: [0, position, 0], rotation: [-Math.PI / 2, 0, 0], size: [ex * 2, ez * 2] }
      : axis === 'coronal'
        ? { position: [0, 0, position], rotation: [0, 0, 0], size: [ex * 2, ey * 2] }
        : { position: [position, 0, 0], rotation: [0, Math.PI / 2, 0], size: [ez * 2, ey * 2] };
  return (
    <mesh position={props.position} rotation={props.rotation}>
      <planeGeometry args={props.size} />
      <meshBasicMaterial color="#5ad1ff" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

/* ------------------------------ 2D slice ------------------------------ */

const SliceView: React.FC<{ axis: SliceAxis; t: number; overlay: Record<RegionId, boolean> }> = ({ axis, t, overlay }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [counts, setCounts] = useState<Record<RegionId, number>>({ WT: 0, TC: 0, ET: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { pixels, counts: c } = renderSlice(axis, t, SLICE_SIZE, overlay);
    const image = ctx.createImageData(SLICE_SIZE, SLICE_SIZE);
    image.data.set(pixels);
    ctx.putImageData(image, 0, 0);
    setCounts(c);
  }, [axis, t, overlay]);

  const mm = sliceWorldPosition(axis, t) * MM_PER_UNIT;
  const pixelMm = ((VIEW_EXTENT[axis === 'sagittal' ? 2 : 0] * 2) / SLICE_SIZE) * MM_PER_UNIT;

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={SLICE_SIZE}
        height={SLICE_SIZE}
        className="win-sunken"
        style={{ width: '100%', aspectRatio: '1 / 1', display: 'block', background: '#000' }}
        aria-label={`${axis} slice of the synthetic phantom`}
      />
      <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#333', marginTop: '3px' }}>
        {axis} · {AXIS_LETTER[axis]} = {mm >= 0 ? '+' : ''}
        {mm.toFixed(0)} mm · pixel ≈ {pixelMm.toFixed(1)} mm
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555' }}>
        on slice: {REGIONS.map(r => `${r} ${counts[r]}px`).join(' · ')}
      </div>
    </div>
  );
};

/* ------------------------------ app ------------------------------ */

export const NeuroScopeApp: React.FC = () => {
  const [axis, setAxis] = useState<SliceAxis>('axial');
  const [t, setT] = useState(() => throughTumour('axial'));
  const [cutaway, setCutaway] = useState(true);
  const [visible, setVisible] = useState<Record<RegionId, boolean>>({ WT: true, TC: true, ET: true });
  const [brainOpacity, setBrainOpacity] = useState(0.28);
  const [autoRotate, setAutoRotate] = useState(true);

  // Clipping plane: keep everything on the near side of the slice (negative side is clipped).
  const plane = useMemo(() => {
    const normal = axis === 'axial' ? [0, -1, 0] : axis === 'coronal' ? [0, 0, -1] : [-1, 0, 0];
    return new THREE.Plane(new THREE.Vector3(normal[0], normal[1], normal[2]), sliceWorldPosition(axis, t));
  }, [axis, t]);
  const volumes = useMemo(() => measureVolumes(48), []);

  const overlay = visible;
  const sliceWorld = sliceWorldPosition(axis, t);

  const selectAxis = (next: SliceAxis) => {
    retroAudio.playMouseDown();
    setAxis(next);
    setT(throughTumour(next));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', fontSize: '11px' }}>
      <div style={{ background: '#5c0b2e', color: '#ffe3ec', padding: '5px 10px', fontSize: '10.5px', lineHeight: 1.4 }}>
        <strong style={{ color: '#ffffff' }}>Synthetic phantom, generated in your browser.</strong> Not patient data and never a
        diagnosis. It shows NeuroScope 3D&apos;s output format: nested BraTS regions, a cutaway plane linked to a slice view, and
        volumes that show their formula.
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '8px', padding: '8px', minHeight: 0, flexWrap: 'wrap' }}>
        {/* 3D view */}
        <div className="win-sunken" style={{ flex: '1 1 320px', minHeight: '260px', background: '#05070d', position: 'relative' }}>
          <Canvas
            camera={{ position: [1.85, 1.05, 2.1], fov: 38 }}
            dpr={[1, 2]}
            onCreated={({ gl }) => {
              gl.localClippingEnabled = true;
            }}
          >
            <color attach="background" args={['#05070d']} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[2, 3, 2]} intensity={1.4} />
            <directionalLight position={[-2, -1, -2]} intensity={0.35} />
            <group>
              {REGIONS.slice()
                .reverse()
                .map(r => (
                  <PhantomMesh
                    key={r}
                    kind={r}
                    color={REGION_INFO[r].color}
                    opacity={r === 'ET' ? 1 : r === 'TC' ? 0.6 : 0.38}
                    visible={visible[r]}
                    plane={plane}
                    clip={cutaway}
                  />
                ))}
              <PhantomMesh kind="brain" color="#f3c7d3" opacity={brainOpacity} visible={brainOpacity > 0.01} plane={plane} clip={cutaway} />
              <SliceMarker axis={axis} position={sliceWorld} />
            </group>
            <OrbitControls enablePan={false} enableDamping autoRotate={autoRotate} autoRotateSpeed={0.8} minDistance={1.1} maxDistance={4} />
          </Canvas>
          <div style={{ position: 'absolute', left: 6, bottom: 4, color: '#8899aa', fontFamily: 'monospace', fontSize: '10px', pointerEvents: 'none' }}>
            drag to orbit · scroll to zoom
          </div>
        </div>

        {/* Controls + slice + measurements */}
        <div style={{ flex: '0 1 250px', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', minHeight: 0 }}>
          <fieldset style={{ border: '2px groove #fff', padding: '6px 8px', margin: 0 }}>
            <legend style={{ fontWeight: 'bold', color: '#000080' }}>Cut plane</legend>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '5px' }}>
              {(['axial', 'coronal', 'sagittal'] as SliceAxis[]).map(a => (
                <button
                  key={a}
                  className={`win-button ${axis === a ? 'active' : ''}`}
                  onClick={() => selectAxis(a)}
                  style={{ fontSize: '10.5px', padding: '2px 6px', flex: 1, fontWeight: axis === a ? 'bold' : 'normal' }}
                >
                  {a}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.005}
              value={t}
              onChange={e => setT(Number(e.target.value))}
              style={{ width: '100%' }}
              aria-label="Slice position"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={cutaway} onChange={e => setCutaway(e.target.checked)} /> Cutaway
              </label>
              <button className="win-button" style={{ fontSize: '10px', padding: '1px 6px' }} onClick={() => setT(throughTumour(axis))}>
                Centre on tumour
              </button>
            </div>
          </fieldset>

          <SliceView axis={axis} t={t} overlay={overlay} />

          <fieldset style={{ border: '2px groove #fff', padding: '6px 8px', margin: 0 }}>
            <legend style={{ fontWeight: 'bold', color: '#000080' }}>Regions & volumes</legend>
            {REGIONS.map(r => (
              <label key={r} style={{ display: 'grid', gridTemplateColumns: '16px 14px 1fr', gap: '4px', alignItems: 'start', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={visible[r]}
                  onChange={e => setVisible(prev => ({ ...prev, [r]: e.target.checked }))}
                  style={{ margin: '1px 0 0 0' }}
                />
                <span style={{ width: '12px', height: '12px', background: REGION_INFO[r].color, border: '1px solid #000', marginTop: '1px' }} />
                <span>
                  <strong>{r}</strong> {REGION_INFO[r].name}: <strong>{volumes.volumesMl[r].toFixed(1)} mL</strong>
                  <br />
                  <span style={{ fontFamily: 'monospace', fontSize: '9.5px', color: '#555' }}>
                    {volumes.voxels[r].toLocaleString('en-IN')} vox × ({volumes.voxelMm.toFixed(2)} mm)³
                  </span>
                </span>
              </label>
            ))}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <span>Brain shell opacity</span>
              <input type="range" min={0} max={0.8} step={0.02} value={brainOpacity} onChange={e => setBrainOpacity(Number(e.target.value))} />
            </label>
            <label style={{ display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer', marginTop: '2px' }}>
              <input type="checkbox" checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} /> Auto-rotate
            </label>
          </fieldset>

          <fieldset style={{ border: '2px groove #fff', padding: '6px 8px', margin: 0, background: '#f5f5f5' }}>
            <legend style={{ fontWeight: 'bold', color: '#000080' }}>The real project</legend>
            <div style={{ lineHeight: 1.45 }}>
              NeuroScope 3D runs MONAI SegResNet on real MRI: Dice <strong>0.88 / 0.87 / 0.79</strong> (WT/TC/ET) on 10 held-out
              Decathlon cases, <strong>17/17</strong> judge tests, fully local.
            </div>
            <a href={REPO_URL} target="_blank" rel="noreferrer" style={{ color: '#000080', fontWeight: 'bold' }}>
              View repository ↗
            </a>
          </fieldset>
        </div>
      </div>
    </div>
  );
};
