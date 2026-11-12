/**
 * Behaviour logic for the Drishti.exe demo, mirroring the Drishti/Kinesis design:
 *  - a per-person baseline (z-score against that person's own settling window),
 *    not a global threshold;
 *  - persistence gating: a short glance never becomes an alert;
 *  - deterministic, template-based explanations built from measured values.
 *
 * Pure and framework-free so it can be unit-tested without a camera.
 */

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

/** MediaPipe BlazePose landmark indices. */
export const POSE = {
  NOSE: 0,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12
} as const;

/**
 * Head-turn signal: horizontal offset of the nose from the midpoint between the
 * ears, normalised by ear distance. About 0 when facing the camera; positive when
 * the head turns towards the person's own left (raw, un-mirrored image coordinates).
 * Returns null when the nose is not visible.
 */
export function headTurnSignal(landmarks: Landmark[], minVisibility = 0.5): number | null {
  const nose = landmarks[POSE.NOSE];
  const leftEar = landmarks[POSE.LEFT_EAR];
  const rightEar = landmarks[POSE.RIGHT_EAR];
  if (!nose || !leftEar || !rightEar) return null;
  if ((nose.visibility ?? 1) < minVisibility) return null;
  const earWidth = Math.abs(leftEar.x - rightEar.x);
  if (earWidth < 1e-3) return null;
  return (nose.x - (leftEar.x + rightEar.x) / 2) / earWidth;
}

export interface BehaviourEvent {
  /** Timestamp (ms) at which the episode started. */
  at: number;
  kind: 'head-turn' | 'phone';
  durationMs: number;
  message: string;
}

export interface CalibratorOptions {
  /** Length of the settling window used to learn this person's normal range. */
  settleMs: number;
  /** |z| at or above this counts as a deviation. */
  zThreshold: number;
  /** A deviation must last at least this long to become an event. */
  minEpisodeMs: number;
  /** Lower bound on σ so a very still person doesn't make every twitch an outlier. */
  stdFloor: number;
  /** Gaps in the signal shorter than this don't end an episode. */
  maxGapMs: number;
}

export const DEFAULT_CALIBRATOR: CalibratorOptions = {
  settleMs: 5000,
  zThreshold: 3,
  minEpisodeMs: 1500,
  stdFloor: 0.04,
  maxGapMs: 500
};

export type CalibratorSnapshot =
  | { phase: 'waiting' }
  | { phase: 'calibrating'; progress: number; samples: number }
  | { phase: 'monitoring'; mean: number; std: number; z: number | null; episodeMs: number };

export class BaselineCalibrator {
  private readonly opts: CalibratorOptions;
  private startedAt: number | null = null;
  private samples: number[] = [];
  private mean = 0;
  private std = 0;
  private calibrated = false;
  private lastZ: number | null = null;
  private episodeStart: number | null = null;
  private lastAbove = 0;
  private peakZ = 0;

  constructor(opts: Partial<CalibratorOptions> = {}) {
    this.opts = { ...DEFAULT_CALIBRATOR, ...opts };
  }

  reset() {
    this.startedAt = null;
    this.samples = [];
    this.mean = 0;
    this.std = 0;
    this.calibrated = false;
    this.lastZ = null;
    this.episodeStart = null;
    this.peakZ = 0;
  }

  get isCalibrated() {
    return this.calibrated;
  }

  /** Feed one sample; returns an event when a qualifying deviation episode ends. */
  update(t: number, value: number | null): BehaviourEvent | null {
    if (!this.calibrated) {
      if (value === null) return null;
      if (this.startedAt === null) this.startedAt = t;
      this.samples.push(value);
      if (t - this.startedAt >= this.opts.settleMs && this.samples.length >= 10) {
        const n = this.samples.length;
        this.mean = this.samples.reduce((a, b) => a + b, 0) / n;
        const variance = this.samples.reduce((a, b) => a + (b - this.mean) ** 2, 0) / n;
        this.std = Math.max(Math.sqrt(variance), this.opts.stdFloor);
        this.calibrated = true;
      }
      return null;
    }

    if (value === null) {
      this.lastZ = null;
      return this.episodeStart !== null && t - this.lastAbove > this.opts.maxGapMs ? this.endEpisode() : null;
    }

    const z = (value - this.mean) / this.std;
    this.lastZ = z;

    if (Math.abs(z) >= this.opts.zThreshold) {
      if (this.episodeStart === null) {
        this.episodeStart = t;
        this.peakZ = z;
      } else if (Math.abs(z) > Math.abs(this.peakZ)) {
        this.peakZ = z;
      }
      this.lastAbove = t;
      return null;
    }

    if (this.episodeStart !== null && t - this.lastAbove > this.opts.maxGapMs) {
      return this.endEpisode();
    }
    return null;
  }

  snapshot(t: number): CalibratorSnapshot {
    if (!this.calibrated) {
      if (this.startedAt === null) return { phase: 'waiting' };
      return {
        phase: 'calibrating',
        progress: Math.min(1, (t - this.startedAt) / this.opts.settleMs),
        samples: this.samples.length
      };
    }
    return {
      phase: 'monitoring',
      mean: this.mean,
      std: this.std,
      z: this.lastZ,
      episodeMs: this.episodeStart !== null ? this.lastAbove - this.episodeStart : 0
    };
  }

  private endEpisode(): BehaviourEvent | null {
    const start = this.episodeStart!;
    const durationMs = this.lastAbove - start;
    const peak = this.peakZ;
    this.episodeStart = null;
    this.peakZ = 0;
    if (durationMs < this.opts.minEpisodeMs) return null;
    const direction = peak > 0 ? 'left' : 'right';
    return {
      at: start,
      kind: 'head-turn',
      durationMs,
      message:
        `Head turned to their ${direction} for ${(durationMs / 1000).toFixed(1)} s, ` +
        `peaking at ${Math.abs(peak).toFixed(1)}σ from this person's own baseline ` +
        `(μ ${this.mean.toFixed(2)}, σ ${this.std.toFixed(2)}, learned over the first ${(this.opts.settleMs / 1000).toFixed(0)} s).`
    };
  }
}

/**
 * Persistence gate for object sightings: emits one event per continuous episode
 * that lasts at least `minMs`, tolerating detector dropouts shorter than `maxGapMs`.
 */
export class PersistenceGate {
  private readonly label: string;
  private readonly minMs: number;
  private readonly maxGapMs: number;
  private episodeStart: number | null = null;
  private lastSeen = 0;
  private maxScore = 0;

  constructor(label: string, minMs = 1000, maxGapMs = 600) {
    this.label = label;
    this.minMs = minMs;
    this.maxGapMs = maxGapMs;
  }

  reset() {
    this.episodeStart = null;
    this.maxScore = 0;
  }

  update(t: number, present: boolean, score = 0): BehaviourEvent | null {
    if (present) {
      if (this.episodeStart === null) {
        this.episodeStart = t;
        this.maxScore = score;
      }
      this.maxScore = Math.max(this.maxScore, score);
      this.lastSeen = t;
      return null;
    }
    if (this.episodeStart !== null && t - this.lastSeen > this.maxGapMs) {
      const start = this.episodeStart;
      const durationMs = this.lastSeen - start;
      const maxScore = this.maxScore;
      this.reset();
      if (durationMs < this.minMs) return null;
      return {
        at: start,
        kind: 'phone',
        durationMs,
        message:
          `${this.label} visible for ${(durationMs / 1000).toFixed(1)} s (max detector score ${maxScore.toFixed(2)}). ` +
          `Sightings shorter than ${(this.minMs / 1000).toFixed(1)} s are ignored.`
      };
    }
    return null;
  }

  activeMs(t: number): number {
    return this.episodeStart !== null && t - this.lastSeen <= this.maxGapMs ? this.lastSeen - this.episodeStart : 0;
  }
}
