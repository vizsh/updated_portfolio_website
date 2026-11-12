/**
 * Synthetic brain-tumour phantom for the NeuroScope viewer demo.
 *
 * Everything is generated procedurally from a few radial shape functions, so the
 * 3D meshes, the 2D slice and the voxel volumes are all derived from the same
 * definition and always agree. It is an illustration of NeuroScope 3D's output
 * format (nested BraTS regions WT ⊃ TC ⊃ ET), not patient data.
 *
 * Units: 1 scene unit = 100 mm.
 */

export type Vec3 = [number, number, number];
export type RegionId = 'WT' | 'TC' | 'ET';
export type SliceAxis = 'axial' | 'coronal' | 'sagittal';

export const MM_PER_UNIT = 100;

/** Brain half-axes (x lateral, y vertical, z anterior–posterior), ~1.3 L ellipsoid. */
export const BRAIN_SCALE: Vec3 = [0.66, 0.56, 0.84];

/** Tumour centre in the right hemisphere (scene units). */
export const TUMOUR_CENTRE: Vec3 = [0.24, 0.1, 0.12];

interface RegionShape {
  base: number;
  amplitude: number;
  frequency: number;
  seed: number;
}

/**
 * Nested by construction: min radius of each region (base × (1 − amplitude)) exceeds
 * the max radius of the next one in (base × (1 + amplitude)), so WT ⊃ TC ⊃ ET.
 */
export const REGION_SHAPES: Record<RegionId, RegionShape> = {
  WT: { base: 0.24, amplitude: 0.15, frequency: 2.2, seed: 11 },
  TC: { base: 0.15, amplitude: 0.12, frequency: 2.6, seed: 23 },
  ET: { base: 0.085, amplitude: 0.2, frequency: 3.1, seed: 37 }
};

export const REGION_INFO: Record<RegionId, { name: string; color: string; description: string }> = {
  WT: { name: 'Whole tumour', color: '#f2e94e', description: 'Edema + tumour core' },
  TC: { name: 'Tumour core', color: '#ff8c42', description: 'Necrotic + enhancing tissue' },
  ET: { name: 'Enhancing tumour', color: '#e63946', description: 'Contrast-enhancing region' }
};

/* ------------------------------ noise ------------------------------ */

function hash3(x: number, y: number, z: number, seed: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1440662683) + Math.imul(seed, 1013904223)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return ((h & 0xffff) / 0xffff) * 2 - 1;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Trilinear value noise in [-1, 1]. */
function valueNoise(x: number, y: number, z: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const tx = smooth(x - xi);
  const ty = smooth(y - yi);
  const tz = smooth(z - zi);
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz, seed);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), tx), lerp(c(0, 1, 0), c(1, 1, 0), tx), ty),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), tx), lerp(c(0, 1, 1), c(1, 1, 1), tx), ty),
    tz
  );
}

/** Fractal noise in [-1, 1] (normalised by the sum of octave amplitudes). */
export function fbm(x: number, y: number, z: number, seed: number, octaves = 3): number {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  let freq = 1;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x * freq, y * freq, z * freq, seed + o * 101);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

/* ------------------------- radial shape functions ------------------------- */

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** Brain surface radius (in ellipsoid-normalised space) for unit direction d. */
export function brainRadius(dx: number, dy: number, dz: number): number {
  const gyri = 0.035 * fbm(dx * 3.2 + 5, dy * 3.2 + 5, dz * 3.2 + 5, 1);
  const fissure = 0.1 * Math.exp(-((dx / 0.06) ** 2)) * smoothstep(-0.1, 0.6, dy);
  return 1 + gyri - fissure;
}

/** Tumour region radius (scene units) for unit direction d. */
export function regionRadius(region: RegionId, dx: number, dy: number, dz: number): number {
  const s = REGION_SHAPES[region];
  const n = fbm(dx * s.frequency + 3, dy * s.frequency + 3, dz * s.frequency + 3, s.seed, 2);
  return s.base * (1 + s.amplitude * n);
}

export function insideBrain(x: number, y: number, z: number): number {
  const qx = x / BRAIN_SCALE[0];
  const qy = y / BRAIN_SCALE[1];
  const qz = z / BRAIN_SCALE[2];
  const r = Math.hypot(qx, qy, qz);
  if (r === 0) return 1;
  const R = brainRadius(qx / r, qy / r, qz / r);
  /** > 0 inside, normalised depth in [0, 1] toward the centre. */
  return r < R ? 1 - r / R : -(r / R - 1);
}

export function insideRegion(region: RegionId, x: number, y: number, z: number): boolean {
  const vx = x - TUMOUR_CENTRE[0];
  const vy = y - TUMOUR_CENTRE[1];
  const vz = z - TUMOUR_CENTRE[2];
  const r = Math.hypot(vx, vy, vz);
  if (r === 0) return true;
  if (r > REGION_SHAPES[region].base * (1 + REGION_SHAPES[region].amplitude)) return false;
  return r < regionRadius(region, vx / r, vy / r, vz / r);
}

/** Innermost region containing the point, or null. */
export function regionAt(x: number, y: number, z: number): RegionId | null {
  if (!insideRegion('WT', x, y, z)) return null;
  if (!insideRegion('TC', x, y, z)) return 'WT';
  return insideRegion('ET', x, y, z) ? 'ET' : 'TC';
}

/* ------------------------------ meshes ------------------------------ */

/**
 * Displace a unit sphere's vertices along their directions. Works on a flat
 * position array (as in THREE.SphereGeometry) so this module stays three-free.
 */
export function displaceSphere(positions: Float32Array, kind: 'brain' | RegionId): void {
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    const len = Math.hypot(x, y, z) || 1;
    const dx = x / len;
    const dy = y / len;
    const dz = z / len;
    if (kind === 'brain') {
      const R = brainRadius(dx, dy, dz);
      positions[i] = dx * R * BRAIN_SCALE[0];
      positions[i + 1] = dy * R * BRAIN_SCALE[1];
      positions[i + 2] = dz * R * BRAIN_SCALE[2];
    } else {
      const R = regionRadius(kind, dx, dy, dz);
      positions[i] = TUMOUR_CENTRE[0] + dx * R;
      positions[i + 1] = TUMOUR_CENTRE[1] + dy * R;
      positions[i + 2] = TUMOUR_CENTRE[2] + dz * R;
    }
  }
}

/* ------------------------------ slices ------------------------------ */

/** Half-extent of the view along each axis (scene units). */
export const VIEW_EXTENT: Vec3 = [0.75, 0.66, 0.95];

const AXIS_INDEX: Record<SliceAxis, 0 | 1 | 2> = { sagittal: 0, axial: 1, coronal: 2 };

export const sliceWorldPosition = (axis: SliceAxis, t: number) => t * VIEW_EXTENT[AXIS_INDEX[axis]];

/** Map slice pixel (u, v in [0,1]) at normalised depth t to a world point. */
function slicePoint(axis: SliceAxis, t: number, u: number, v: number): Vec3 {
  const d = sliceWorldPosition(axis, t);
  const ex = VIEW_EXTENT;
  switch (axis) {
    case 'axial':
      // Looking down: image x = patient left→right, image y = anterior→posterior
      return [(u * 2 - 1) * ex[0], d, (v * 2 - 1) * ex[2]];
    case 'coronal':
      return [(u * 2 - 1) * ex[0], (1 - v * 2) * ex[1], d];
    case 'sagittal':
      return [d, (1 - v * 2) * ex[1], (u * 2 - 1) * ex[2]];
  }
}

const OVERLAY_RGB: Record<RegionId, [number, number, number]> = {
  WT: [242, 233, 78],
  TC: [255, 140, 66],
  ET: [230, 57, 70]
};

/**
 * Render a FLAIR-like synthetic slice into RGBA pixels, with optional label overlay.
 * Returns the pixel buffer and voxel counts per region on this slice.
 */
export function renderSlice(
  axis: SliceAxis,
  t: number,
  size: number,
  overlay: Record<RegionId, boolean>,
  overlayAlpha = 0.55
): { pixels: Uint8ClampedArray; counts: Record<RegionId, number> } {
  const pixels = new Uint8ClampedArray(size * size * 4);
  const counts: Record<RegionId, number> = { WT: 0, TC: 0, ET: 0 };

  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const [x, y, z] = slicePoint(axis, t, (i + 0.5) / size, (j + 0.5) / size);
      const depth = insideBrain(x, y, z);
      let g = 0;
      if (depth > 0) {
        const texture = 0.08 * fbm(x * 14, y * 14, z * 14, 7, 2);
        const whiteMatter = 0.18 * smoothstep(0.18, 0.55, depth);
        g = 0.42 + texture + whiteMatter;
      } else if (depth > -0.06) {
        g = 0.82; // skull / scalp rim
      }

      let r = g * 255;
      let gg = g * 255;
      let b = g * 255;

      if (depth > 0) {
        const region = regionAt(x, y, z);
        if (region) {
          counts[region] += 1;
          // FLAIR-like appearance: edema bright, core mid, enhancing rim bright.
          const tissue = region === 'WT' ? 0.92 : region === 'TC' ? 0.55 : 0.8;
          r = gg = b = tissue * 255;
          const show = region === 'ET' ? overlay.ET : region === 'TC' ? overlay.TC : overlay.WT;
          if (show) {
            const [or, og, ob] = OVERLAY_RGB[region];
            r = r * (1 - overlayAlpha) + or * overlayAlpha;
            gg = gg * (1 - overlayAlpha) + og * overlayAlpha;
            b = b * (1 - overlayAlpha) + ob * overlayAlpha;
          }
        }
      }

      const k = (j * size + i) * 4;
      pixels[k] = r;
      pixels[k + 1] = gg;
      pixels[k + 2] = b;
      pixels[k + 3] = 255;
    }
  }
  return { pixels, counts };
}

/* ------------------------------ volumes ------------------------------ */

export interface VolumeReport {
  gridSize: number;
  voxelMm: number;
  voxelMm3: number;
  voxels: Record<RegionId, number>;
  /** Exclusive voxel counts nest up, so WT ≥ TC ≥ ET. */
  volumesMl: Record<RegionId, number>;
}

/**
 * Count voxels in each (inclusive) region on a regular grid around the tumour and
 * convert to millilitres: volume = voxel count × voxel spacing³, the same
 * "show the formula" convention NeuroScope 3D uses.
 */
export function measureVolumes(gridSize = 48): VolumeReport {
  const half = REGION_SHAPES.WT.base * (1 + REGION_SHAPES.WT.amplitude) * 1.04;
  const step = (2 * half) / gridSize;
  const voxels: Record<RegionId, number> = { WT: 0, TC: 0, ET: 0 };
  for (let k = 0; k < gridSize; k++) {
    const z = TUMOUR_CENTRE[2] - half + (k + 0.5) * step;
    for (let j = 0; j < gridSize; j++) {
      const y = TUMOUR_CENTRE[1] - half + (j + 0.5) * step;
      for (let i = 0; i < gridSize; i++) {
        const x = TUMOUR_CENTRE[0] - half + (i + 0.5) * step;
        const region = regionAt(x, y, z);
        if (!region) continue;
        voxels.WT += 1;
        if (region !== 'WT') voxels.TC += 1;
        if (region === 'ET') voxels.ET += 1;
      }
    }
  }
  const voxelMm = step * MM_PER_UNIT;
  const voxelMm3 = voxelMm ** 3;
  const toMl = (n: number) => (n * voxelMm3) / 1000;
  return {
    gridSize,
    voxelMm,
    voxelMm3,
    voxels,
    volumesMl: { WT: toMl(voxels.WT), TC: toMl(voxels.TC), ET: toMl(voxels.ET) }
  };
}
