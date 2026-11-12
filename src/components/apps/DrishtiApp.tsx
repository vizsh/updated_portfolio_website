import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { PoseLandmarker, ObjectDetector, Detection, NormalizedLandmark } from '@mediapipe/tasks-vision';
import wasmLoaderUrl from '@mediapipe/tasks-vision/vision_wasm_internal.js?url';
import wasmBinaryUrl from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url';
import {
  BaselineCalibrator,
  PersistenceGate,
  headTurnSignal,
  type BehaviourEvent,
  type CalibratorSnapshot
} from '../../lib/drishti';
import { retroAudio } from '../../services/audio';

/**
 * Drishti.exe: a browser-sized version of the Drishti / Kinesis pipeline.
 * Public MediaPipe models stand in for Drishti's fine-tuned YOLO11 weights; what this
 * window reproduces faithfully is the design: no faces, per-person baselines,
 * persistence-gated alerts and template explanations. Frames never leave the browser.
 */

const POSE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const OBJECT_MODEL =
  'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite';

/** COCO classes that matter in an exam hall. */
const FLAGGED_OBJECTS = new Set(['cell phone', 'book', 'laptop']);

type Status = 'idle' | 'loading' | 'ready' | 'running' | 'error';
type Source = 'none' | 'webcam' | 'video' | 'image';

interface Detectors {
  pose: PoseLandmarker;
  objects: ObjectDetector;
  connections: { start: number; end: number }[];
  delegate: 'GPU' | 'CPU';
}

interface UiSnapshot {
  fps: number;
  people: number;
  objects: { label: string; score: number }[];
  calib: CalibratorSnapshot;
  phoneActiveMs: number;
}

const EMPTY_UI: UiSnapshot = { fps: 0, people: 0, objects: [], calib: { phase: 'waiting' }, phoneActiveMs: 0 };

async function loadDetectors(): Promise<Detectors> {
  const vision = await import('@mediapipe/tasks-vision');
  const fileset = { wasmLoaderPath: wasmLoaderUrl, wasmBinaryPath: wasmBinaryUrl };

  const create = async (delegate: 'GPU' | 'CPU') => {
    const pose = await vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: POSE_MODEL, delegate },
      runningMode: 'VIDEO',
      numPoses: 1
    });
    try {
      const objects = await vision.ObjectDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: OBJECT_MODEL, delegate },
        runningMode: 'VIDEO',
        scoreThreshold: 0.35,
        maxResults: 8
      });
      return { pose, objects };
    } catch (err) {
      pose.close();
      throw err;
    }
  };

  const connections = vision.PoseLandmarker.POSE_CONNECTIONS;
  try {
    return { ...(await create('GPU')), connections, delegate: 'GPU' };
  } catch {
    return { ...(await create('CPU')), connections, delegate: 'CPU' };
  }
}

/* ---------------------------- drawing ---------------------------- */

function drawFrame(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  width: number,
  height: number,
  mirror: boolean,
  landmarks: NormalizedLandmark[] | undefined,
  detections: Detection[],
  connections: { start: number; end: number }[],
  privacy: boolean,
  pixelCanvas: HTMLCanvasElement
) {
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  if (mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, 0, 0, width, height);

  // 1. Privacy: pixelate the head region before anything else is drawn.
  if (privacy && landmarks) {
    const head = landmarks.slice(0, 11);
    const xs = head.map(p => p.x * width);
    const ys = head.map(p => p.y * height);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const w = Math.max(maxX - minX, width * 0.06);
    const h = Math.max(maxY - minY, height * 0.06);
    const sx = Math.max(0, minX - w * 0.6);
    const sy = Math.max(0, minY - h * 1.6);
    const sw = Math.min(width - sx, w * 2.2);
    const sh = Math.min(height - sy, h * 3.4);
    if (sw > 2 && sh > 2) {
      const pctx = pixelCanvas.getContext('2d');
      if (pctx) {
        pctx.drawImage(source, sx, sy, sw, sh, 0, 0, pixelCanvas.width, pixelCanvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(pixelCanvas, 0, 0, pixelCanvas.width, pixelCanvas.height, sx, sy, sw, sh);
        ctx.imageSmoothingEnabled = true;
      }
    }
  }

  // 2. Body skeleton only (landmarks 11+); face keypoints are never drawn.
  if (landmarks) {
    ctx.lineWidth = Math.max(2, width / 220);
    ctx.strokeStyle = '#39ff14';
    for (const { start, end } of connections) {
      if (start < 11 || end < 11) continue;
      const a = landmarks[start];
      const b = landmarks[end];
      if ((a.visibility ?? 1) < 0.4 || (b.visibility ?? 1) < 0.4) continue;
      ctx.beginPath();
      ctx.moveTo(a.x * width, a.y * height);
      ctx.lineTo(b.x * width, b.y * height);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffff55';
    landmarks.forEach((p, i) => {
      if (i < 11 || (p.visibility ?? 1) < 0.4) return;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, Math.max(2.5, width / 180), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 3. Object boxes.
  for (const d of detections) {
    const box = d.boundingBox;
    const label = d.categories[0]?.categoryName ?? '';
    if (!box) continue;
    const flagged = FLAGGED_OBJECTS.has(label);
    ctx.lineWidth = flagged ? Math.max(3, width / 160) : 1.5;
    ctx.strokeStyle = label === 'cell phone' ? '#ff3b3b' : flagged ? '#ffca3a' : '#5ad1ff';
    ctx.strokeRect(box.originX, box.originY, box.width, box.height);
  }
  ctx.restore();

  // 4. Labels, drawn un-mirrored so text reads correctly.
  ctx.font = `${Math.max(11, Math.round(width / 48))}px monospace`;
  ctx.textBaseline = 'bottom';
  for (const d of detections) {
    const box = d.boundingBox;
    const cat = d.categories[0];
    if (!box || !cat) continue;
    const text = `${cat.categoryName} ${(cat.score * 100).toFixed(0)}%`;
    const x = mirror ? width - box.originX - box.width : box.originX;
    const y = Math.max(14, box.originY);
    const tw = ctx.measureText(text).width + 6;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x, y - 16, tw, 16);
    ctx.fillStyle = FLAGGED_OBJECTS.has(cat.categoryName) ? '#ffca3a' : '#5ad1ff';
    ctx.fillText(text, x + 3, y - 2);
  }
}

/* ---------------------------- component ---------------------------- */

export const DrishtiApp: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [source, setSource] = useState<Source>('none');
  const [error, setError] = useState<string | null>(null);
  const [delegate, setDelegate] = useState<'GPU' | 'CPU' | null>(null);
  const [privacy, setPrivacy] = useState(true);
  const [ui, setUi] = useState<UiSnapshot>(EMPTY_UI);
  const [events, setEvents] = useState<(BehaviourEvent & { clock: string })[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorsRef = useRef<Detectors | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const privacyRef = useRef(privacy);
  const mirrorRef = useRef(false);
  const calibratorRef = useRef(new BaselineCalibrator());
  const phoneGateRef = useRef(new PersistenceGate('Phone', 1000, 600));
  const loopState = useRef({ frame: 0, lastVideoTime: -1, lastObjects: [] as Detection[], lastUi: 0, fpsFrames: 0, fpsSince: 0, fps: 0 });

  useEffect(() => {
    privacyRef.current = privacy;
  }, [privacy]);

  const pushEvent = useCallback((event: BehaviourEvent | null) => {
    if (!event) return;
    retroAudio.playBeep(660, 0.06);
    const clock = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEvents(prev => [{ ...event, clock }, ...prev].slice(0, 20));
  }, []);

  const resetLogic = useCallback(() => {
    calibratorRef.current.reset();
    phoneGateRef.current.reset();
    loopState.current = { frame: 0, lastVideoTime: -1, lastObjects: [], lastUi: 0, fpsFrames: 0, fpsSince: performance.now(), fps: 0 };
    setEvents([]);
    setUi(EMPTY_UI);
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const releaseSource = useCallback(() => {
    stopLoop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
      video.removeAttribute('src');
      video.load();
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, [stopLoop]);

  const ensureDetectors = useCallback(async (): Promise<Detectors | null> => {
    if (detectorsRef.current) return detectorsRef.current;
    setStatus('loading');
    setError(null);
    try {
      const detectors = await loadDetectors();
      detectorsRef.current = detectors;
      setDelegate(detectors.delegate);
      setStatus('ready');
      return detectors;
    } catch (err) {
      setStatus('error');
      setError(
        `Could not load the vision models (${err instanceof Error ? err.message : String(err)}). They are downloaded from Google's MediaPipe model storage on first use, so this needs an internet connection.`
      );
      return null;
    }
  }, []);

  /** Process one frame: detect, update behaviour logic, draw, and refresh the side panel at ~5 Hz. */
  const processFrame = useCallback(
    (frameSource: HTMLVideoElement | HTMLImageElement, width: number, height: number, now: number) => {
      const detectors = detectorsRef.current;
      const canvas = canvasRef.current;
      if (!detectors || !canvas) return;
      if (!pixelCanvasRef.current) {
        pixelCanvasRef.current = document.createElement('canvas');
        pixelCanvasRef.current.width = 10;
        pixelCanvasRef.current.height = 10;
      }

      const state = loopState.current;
      state.frame += 1;
      const pose = detectors.pose.detectForVideo(frameSource, now);
      // Object detection at roughly a third of the frame rate, as Drishti samples ~10 fps.
      if (state.frame % 3 === 1 || frameSource instanceof HTMLImageElement) {
        state.lastObjects = detectors.objects.detectForVideo(frameSource, now).detections;
      }

      const landmarks = pose.landmarks[0];
      // Baselines and persistence need time; a still image only gets detection + pose.
      if (!(frameSource instanceof HTMLImageElement)) {
        pushEvent(calibratorRef.current.update(now, landmarks ? headTurnSignal(landmarks) : null));
        const phone = state.lastObjects.find(d => d.categories[0]?.categoryName === 'cell phone');
        pushEvent(phoneGateRef.current.update(now, Boolean(phone), phone?.categories[0]?.score ?? 0));
      }

      drawFrame(
        canvas,
        frameSource,
        width,
        height,
        mirrorRef.current,
        landmarks,
        state.lastObjects,
        detectors.connections,
        privacyRef.current,
        pixelCanvasRef.current
      );

      state.fpsFrames += 1;
      if (now - state.fpsSince >= 1000) {
        state.fps = (state.fpsFrames * 1000) / (now - state.fpsSince);
        state.fpsFrames = 0;
        state.fpsSince = now;
      }
      if (now - state.lastUi >= 200 || frameSource instanceof HTMLImageElement) {
        state.lastUi = now;
        setUi({
          fps: state.fps,
          people: pose.landmarks.length,
          objects: state.lastObjects
            .map(d => ({ label: d.categories[0]?.categoryName ?? '?', score: d.categories[0]?.score ?? 0 }))
            .filter(o => o.label !== 'person'),
          calib: calibratorRef.current.snapshot(now),
          phoneActiveMs: phoneGateRef.current.activeMs(now)
        });
      }
    },
    [pushEvent]
  );

  const runVideoLoop = useCallback(() => {
    const tick = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        const state = loopState.current;
        if (video.currentTime !== state.lastVideoTime) {
          state.lastVideoTime = video.currentTime;
          try {
            processFrame(video, video.videoWidth, video.videoHeight, performance.now());
          } catch (err) {
            setError(`Detection stopped: ${err instanceof Error ? err.message : String(err)}`);
            setStatus('error');
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    stopLoop();
    rafRef.current = requestAnimationFrame(tick);
  }, [processFrame, stopLoop]);

  const startWebcam = async () => {
    retroAudio.playMouseDown();
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not allow camera access here. Try opening a video or image file instead.');
      return;
    }
    const detectors = await ensureDetectors();
    if (!detectors) return;
    releaseSource();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      mirrorRef.current = true;
      resetLogic();
      setSource('webcam');
      setStatus('running');
      setError(null);
      runVideoLoop();
    } catch (err) {
      setStatus('ready');
      setError(
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission was declined. You can still open a video or image file from your computer.'
          : `Could not start the camera (${err instanceof Error ? err.message : String(err)}).`
      );
    }
  };

  const openFile = async (file: File) => {
    const detectors = await ensureDetectors();
    if (!detectors) return;
    releaseSource();
    resetLogic();
    mirrorRef.current = false;
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setError(null);

    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.src = url;
      try {
        await img.decode();
        processFrame(img, img.naturalWidth, img.naturalHeight, performance.now());
        setSource('image');
        setStatus('ready');
      } catch (err) {
        setError(`Could not read that image (${err instanceof Error ? err.message : String(err)}).`);
      }
      return;
    }

    const video = videoRef.current!;
    video.src = url;
    video.loop = true;
    video.muted = true;
    try {
      await video.play();
      setSource('video');
      setStatus('running');
      runVideoLoop();
    } catch (err) {
      setError(`Could not play that video (${err instanceof Error ? err.message : String(err)}).`);
    }
  };

  const stop = () => {
    retroAudio.playMouseDown();
    releaseSource();
    setSource('none');
    setStatus(detectorsRef.current ? 'ready' : 'idle');
  };

  // Release the camera and the models when the window closes.
  useEffect(
    () => () => {
      releaseSource();
      detectorsRef.current?.pose.close();
      detectorsRef.current?.objects.close();
      detectorsRef.current = null;
    },
    [releaseSource]
  );

  const calib = ui.calib;
  const stages: { label: string; detail: string; state: 'idle' | 'active' | 'done' }[] = [
    { label: 'Ingest', detail: source === 'none' ? 'no source' : source, state: source === 'none' ? 'idle' : 'done' },
    { label: 'Detect', detail: 'EfficientDet-Lite0 (COCO)', state: status === 'running' || source === 'image' ? 'done' : 'idle' },
    { label: 'Pose', detail: `${ui.people} person${ui.people === 1 ? '' : 's'}`, state: ui.people > 0 ? 'done' : 'idle' },
    {
      label: 'Baseline',
      detail:
        source === 'image'
          ? 'n/a for stills'
          : calib.phase === 'calibrating'
          ? `learning ${Math.round(calib.progress * 100)}%`
          : calib.phase === 'monitoring'
            ? 'calibrated'
            : 'waiting',
      state: calib.phase === 'monitoring' ? 'done' : calib.phase === 'calibrating' ? 'active' : 'idle'
    },
    { label: 'Explain', detail: `${events.length} alert${events.length === 1 ? '' : 's'}`, state: events.length ? 'done' : 'idle' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', fontSize: '11px' }}>
      {/* Pipeline strip */}
      <div style={{ display: 'flex', gap: '3px', padding: '6px 8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {stages.map((s, i) => (
          <React.Fragment key={s.label}>
            <div
              className="win-sunken"
              style={{
                padding: '2px 6px',
                background: s.state === 'done' ? '#0a3622' : s.state === 'active' ? '#3a2e12' : '#2a2a2a',
                color: s.state === 'done' ? '#75ffa0' : s.state === 'active' ? '#ffca3a' : '#9a9a9a',
                fontFamily: 'monospace',
                fontSize: '10px'
              }}
            >
              {i + 1}. {s.label}: {s.detail}
            </div>
            {i < stages.length - 1 && <span style={{ color: '#000080' }}>▶</span>}
          </React.Fragment>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '10px', color: '#333' }}>
          {status === 'running' ? `${ui.fps.toFixed(0)} fps · ${delegate}` : delegate ? `models ready · ${delegate}` : ''}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '8px', padding: '0 8px 8px 8px', minHeight: 0, flexWrap: 'wrap' }}>
        {/* Stage */}
        <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, minHeight: 0 }}>
          <div
            className="win-sunken"
            style={{ flex: 1, background: '#000000', minHeight: '220px', position: 'relative', overflow: 'hidden' }}
          >
            {/*
              The raw <video> must stay laid out (not display:none), or Chrome pauses muted
              video-only media "to save power". It sits underneath an opaque canvas, so
              visitors only ever see the processed frame with faces pixelated.
            */}
            <video
              ref={videoRef}
              playsInline
              muted
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 0 }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#000000',
                zIndex: 1
              }}
            />
            {source === 'none' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  background: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9fd7ff',
                  fontFamily: 'var(--font-dos), monospace',
                  fontSize: '15px',
                  textAlign: 'center',
                  padding: '16px',
                  lineHeight: 1.4
                }}
              >
                {status === 'loading' ? (
                  <>LOADING VISION MODELS…<br /><span style={{ fontSize: '12px', color: '#888' }}>about 10 MB, first time only</span></>
                ) : (
                  <>
                    DRISHTI.EXE — PRIVACY-FIRST BEHAVIOUR MONITOR
                    <br />
                    <span style={{ fontSize: '12px', color: '#aaa' }}>
                      Start the webcam, sit normally for 5 s while it learns your baseline,
                      <br />
                      then look away for 2 s or hold up a phone.
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="win-button" onClick={startWebcam} disabled={status === 'loading'} style={{ fontSize: '11px', padding: '3px 10px', fontWeight: 'bold' }}>
              ▶ Start webcam
            </button>
            <button
              className="win-button"
              onClick={() => {
                retroAudio.playMouseDown();
                fileRef.current?.click();
              }}
              disabled={status === 'loading'}
              style={{ fontSize: '11px', padding: '3px 10px' }}
            >
              📂 Open video / image…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="video/*,image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) void openFile(file);
                e.target.value = '';
              }}
            />
            <button className="win-button" onClick={stop} disabled={source === 'none'} style={{ fontSize: '11px', padding: '3px 10px' }}>
              ■ Stop
            </button>
            <button
              className="win-button"
              onClick={() => {
                retroAudio.playMouseDown();
                calibratorRef.current.reset();
                phoneGateRef.current.reset();
                setEvents([]);
              }}
              disabled={source === 'none' || source === 'image'}
              style={{ fontSize: '11px', padding: '3px 10px' }}
            >
              ↺ Recalibrate
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} />
              Pixelate faces
            </label>
          </div>
          {error && (
            <div className="win-sunken" style={{ padding: '6px 8px', background: '#fff4f4', color: '#8a0000' }}>
              ⛔ {error}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={{ flex: '0 1 230px', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px', minHeight: 0, overflowY: 'auto' }}>
          <fieldset style={{ border: '2px groove #fff', padding: '6px 8px', margin: 0 }}>
            <legend style={{ fontWeight: 'bold', color: '#000080' }}>Personal baseline</legend>
            {source === 'image' && (
              <div style={{ color: '#555' }}>
                A still image has no “normal” to compare against. Baselines and alerts need video or the webcam.
              </div>
            )}
            {source !== 'image' && calib.phase === 'waiting' && <div style={{ color: '#555' }}>Waiting for a person in view…</div>}
            {calib.phase === 'calibrating' && (
              <>
                <div style={{ marginBottom: '4px' }}>Learning your normal head movement…</div>
                <div className="win-sunken" style={{ height: '12px', background: '#fff' }}>
                  <div style={{ width: `${calib.progress * 100}%`, height: '100%', background: '#000080' }} />
                </div>
              </>
            )}
            {calib.phase === 'monitoring' && (
              <>
                <div style={{ fontFamily: 'monospace', marginBottom: '4px' }}>
                  μ {calib.mean.toFixed(2)} · σ {calib.std.toFixed(2)}
                </div>
                <ZMeter z={calib.z} threshold={3} />
                <div style={{ marginTop: '3px', color: calib.episodeMs > 0 ? '#b36b00' : '#555' }}>
                  {calib.episodeMs > 0 ? `Deviation for ${(calib.episodeMs / 1000).toFixed(1)} s (alerts at 1.5 s)` : 'Within your normal range'}
                </div>
              </>
            )}
          </fieldset>

          <fieldset style={{ border: '2px groove #fff', padding: '6px 8px', margin: 0 }}>
            <legend style={{ fontWeight: 'bold', color: '#000080' }}>Objects in view</legend>
            {ui.objects.length === 0 ? (
              <div style={{ color: '#555' }}>None detected</div>
            ) : (
              ui.objects.map((o, i) => (
                <div key={`${o.label}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', color: FLAGGED_OBJECTS.has(o.label) ? '#8a4b00' : '#222' }}>
                  <span>{FLAGGED_OBJECTS.has(o.label) ? '⚠ ' : ''}{o.label}</span>
                  <span style={{ fontFamily: 'monospace' }}>{(o.score * 100).toFixed(0)}%</span>
                </div>
              ))
            )}
            {ui.phoneActiveMs > 0 && (
              <div style={{ marginTop: '3px', color: '#b30000' }}>Phone in view {(ui.phoneActiveMs / 1000).toFixed(1)} s (alerts at 1 s)</div>
            )}
          </fieldset>

          <fieldset style={{ border: '2px groove #fff', padding: '6px 8px', margin: 0, flex: 1, minHeight: '90px' }}>
            <legend style={{ fontWeight: 'bold', color: '#000080' }}>Explained alerts</legend>
            {events.length === 0 ? (
              <div style={{ color: '#555' }}>No alerts. Short glances are ignored by design.</div>
            ) : (
              events.map(ev => (
                <div key={`${ev.kind}-${ev.at}`} className="win-sunken" style={{ background: '#fffbe6', padding: '4px 6px', marginBottom: '4px', lineHeight: 1.35 }}>
                  <div style={{ fontWeight: 'bold', color: ev.kind === 'phone' ? '#b30000' : '#8a4b00' }}>
                    {ev.clock} · {ev.kind === 'phone' ? 'Object' : 'Behaviour'}
                  </div>
                  <div>{ev.message}</div>
                </div>
              ))
            )}
          </fieldset>
        </div>
      </div>

      <div style={{ padding: '4px 8px 6px 8px', fontSize: '10px', color: '#333', lineHeight: 1.4, borderTop: '1px solid #808080' }}>
        🔒 Frames are processed in this browser tab and never uploaded. Demo models: MediaPipe Pose Landmarker Lite and EfficientDet-Lite0
        (public, COCO); one person is tracked at a time. The production Drishti pipeline uses fine-tuned YOLO11 + BoT-SORT + ST-GCN++ on an edge GPU; this window reproduces
        its design (no faces, per-person baselines, persistence-gated, explained alerts), not its trained weights.
      </div>
    </div>
  );
};

const ZMeter: React.FC<{ z: number | null; threshold: number }> = ({ z, threshold }) => {
  const range = 8;
  const clamp = (v: number) => Math.max(-range, Math.min(range, v));
  const pos = (v: number) => `${((clamp(v) + range) / (2 * range)) * 100}%`;
  const over = z !== null && Math.abs(z) >= threshold;
  return (
    <div>
      <div className="win-sunken" style={{ position: 'relative', height: '16px', background: '#ffffff' }}>
        <div style={{ position: 'absolute', left: pos(-threshold), right: `calc(100% - ${pos(threshold)})`, top: 0, bottom: 0, background: '#e3f4e3' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: '#999' }} />
        {z !== null && (
          <div
            style={{
              position: 'absolute',
              left: pos(z),
              top: '1px',
              bottom: '1px',
              width: '6px',
              marginLeft: '-3px',
              background: over ? '#d00000' : '#000080'
            }}
          />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '9.5px', color: '#555' }}>
        <span>right</span>
        <span>z = {z === null ? '—' : z.toFixed(1)} (alert |z| ≥ {threshold})</span>
        <span>left</span>
      </div>
    </div>
  );
};
