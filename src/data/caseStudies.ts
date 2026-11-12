import type { AppId } from '../types/os';

/**
 * Project case studies: Problem -> Constraints -> Architecture -> Decisions ->
 * Honest limits -> Results -> Next.
 *
 * Every statement here is taken from the project's own README / docs on GitHub
 * (linked in `sources`). Keep it that way: if a number isn't in the repo, it
 * doesn't go here. "Honest limits" mirrors each repo's own limitations section.
 */

export interface PipelineStage {
  label: string;
  detail: string;
}

export interface CaseStudy {
  /** One sentence a recruiter can read in five seconds. */
  summary: string;
  problem: string;
  constraints: string[];
  pipeline: PipelineStage[];
  decisions: { choice: string; why: string }[];
  limits: string[];
  results: { value: string; label: string }[];
  next: string[];
  sources: { label: string; url: string }[];
  /** Desktop app that demos this project in the browser, if any. */
  demoApp?: 'jarvis' | 'drishti' | 'neuroscope';
}

const gh = (repo: string, file = '') => `https://github.com/vizsh/${repo}${file ? `/blob/HEAD/${file}` : ''}`;

export const CASE_STUDIES: Record<string, CaseStudy> = {
  'jarvis-hedge-fund': {
    summary:
      'A bilingual (English/Hindi) money assistant where no language model ever writes a number: every figure comes from deterministic, tested code.',
    problem:
      'Three things cost Indian households money: digital fraud (about ₹22,845 crore lost in 2024, I4C as reported), informal credit (a moneylender quoting ₹5 per ₹100 a month is 60% a year on simple interest), and fees and unverified tips. Each has a moment where a short, plain check would change the outcome, yet most tools either hide the maths or let a language model invent figures.',
    constraints: [
      'The model never writes a number: figures are computed by code and placed into templates.',
      'The risk engine never imports a model.',
      'A translation may never change a figure: English and Hindi answers share the same computed values.',
      'Market data is a frozen public snapshot built into SQLite; the local model (Ollama) is optional.'
    ],
    pipeline: [
      { label: 'Question', detail: 'Typed or spoken, English or Hindi' },
      { label: 'Understand', detail: 'Whole-sentence intent parsing (understand.py)' },
      { label: 'Rule router', detail: 'Rules first; an optional local model may only pick one intent' },
      { label: 'Pure calculator', detail: 'Deterministic analysis, rural-credit and risk maths' },
      { label: 'Template', detail: 'Hand-written Hindi/English text; numbers placed by code' },
      { label: 'Answer card', detail: 'Figures, charts and next steps' }
    ],
    decisions: [
      {
        choice: 'Three layers: truth, meaning, words',
        why: 'Numbers live in pure modules, intent in rules, and wording in templates, so a wording change can never alter a figure.'
      },
      {
        choice: 'Optional local model, never required',
        why: 'Without Ollama the assistant asks a clarifying question instead of guessing.'
      },
      {
        choice: 'Hash-chained audit record with a tamper test',
        why: 'Trade-like actions leave an evidence trail that shows if it was edited.'
      }
    ],
    limits: [
      'Business numbers are assumptions: no pilot has run and no bank has used the product.',
      'WhatsApp delivery is a simulator; going live needs a Twilio account and approved templates.',
      'Prices are a frozen snapshot covering a 53-company universe, not live data.',
      'The tip scanner reads English tips only, and Hindi speech recognition is untested with rural speakers.',
      'The audit chain is tamper-evident, not tamper-proof: anchoring outside the machine is not built.',
      'No research desk beats a coin flip, and the project says so and builds around it.'
    ],
    results: [
      { value: '532', label: 'pytest tests (python -m pytest tests/)' },
      { value: '10', label: 'features across fraud, credit and investing protection' },
      { value: '32', label: 'checked explanations in English and Hindi' },
      { value: '19', label: 'government schemes in the rural tools' }
    ],
    next: [
      'Run a pilot with a real partner to replace assumed business numbers.',
      'Ship live WhatsApp delivery with approved templates.',
      'Anchor the audit chain outside the machine.',
      'Test Hindi speech recognition with rural speakers.'
    ],
    sources: [
      { label: 'README', url: gh('Jarvis_Hedge_Fund') },
      { label: 'docs/ARCHITECTURE.md', url: gh('Jarvis_Hedge_Fund', 'docs/ARCHITECTURE.md') },
      { label: 'docs/TESTING.md', url: gh('Jarvis_Hedge_Fund', 'docs/TESTING.md') }
    ],
    demoApp: 'jarvis'
  },

  'drishti-ai': {
    summary:
      'Real-time exam-hall monitoring from CCTV that never uses face recognition and scores each student against their own baseline to cut false positives.',
    problem:
      "CCTV proctoring fails in two ways: privacy (face recognition to identify students) and false positives. The problem statement's own risk #1 is normal behaviour such as thinking, stretching or looking around being flagged as misconduct. Every design decision targets that failure mode without losing recall on real misconduct.",
    constraints: [
      'No face recognition, ever: identity is the seat, anchored by homography, never a face embedding.',
      'Raw video never leaves the edge process; only keypoints, risk scores and face-blurred evidence clips do.',
      'Every alert carries a deterministic, template-based explanation from measured features, never a bare confidence score.',
      "Score each student against their own calibrated baseline (z-score), not a global threshold.",
      'Production target: NVIDIA Jetson Orin Nano at the edge.'
    ],
    pipeline: [
      { label: 'Ingest', detail: 'RTSP/ONVIF, hardware decode, ~10 fps sampling' },
      { label: 'Detect', detail: 'YOLO11n person detection' },
      { label: 'Track', detail: 'BoT-SORT multi-object tracking' },
      { label: 'Seat anchor', detail: 'Homography maps each track to a seat: identity = seat' },
      { label: 'Pose + objects', detail: 'YOLO11-pose (One-Euro filtered) + fine-tuned YOLO11 for phone / paper / earpiece' },
      { label: 'Baseline', detail: "Per-seat buffer, z-score vs. the student's own settling window" },
      { label: 'Behaviour', detail: 'ST-GCN++ (PYSKL) fused with rule-based scoring' },
      { label: 'Explain', detail: 'Risk fusion → FastAPI/WebSocket → React dashboard with template explanations' }
    ],
    decisions: [
      {
        choice: 'YOLO11n over RTMDet-tiny, Faster-RCNN or DETR',
        why: 'Direct TensorRT export for a low-cost edge box matters more than 1–2 mAP points; two-stage detectors are too slow for real time.'
      },
      {
        choice: 'Seat as identity',
        why: 'No face data is stored, and identity survives tracker ID switches.'
      },
      {
        choice: 'Feedback loop on dismissed alerts',
        why: "Dismissing an alert widens that student's threshold live, so the same false positive doesn't repeat."
      }
    ],
    limits: [
      'Earpieces are hard to detect at CCTV distance, and the docs say so rather than overclaiming.',
      'Public cheating datasets are close-up and well-lit and do not match an overhead CCTV view, so own staged footage is required.',
      'Seat calibration needs 4+ known floor points per camera; the latest commit recalibrated a hall to 3 confident seats instead of 6 guessed ones.'
    ],
    results: [
      { value: '8', label: 'staged demos (run_stage1…8_demo.py), each stage tested in isolation' },
      { value: '5', label: 'modules: ingestion, calibration, perception, behaviour, risk engine' },
      { value: '91.7%', label: 'benchmark target: accuracy of a published pose + YOLO system used as the bar to beat' }
    ],
    next: [
      'Deploy on the Jetson Orin Nano edge target, the final stage of the build order.',
      'Grow the own-footage dataset for phone, paper and earpiece classes.'
    ],
    sources: [
      { label: 'docs/architecture.md', url: gh('Drishti_AI', 'docs/architecture.md') },
      { label: 'docs/build_order.md', url: gh('Drishti_AI', 'docs/build_order.md') },
      { label: 'Repository', url: gh('Drishti_AI') }
    ],
    demoApp: 'drishti'
  },

  'neuroscope-3d': {
    summary:
      'See a brain tumour in 3D, measure it exactly, and know how far to trust it: real MONAI segmentation with a measured uncertainty signal, fully local.',
    problem:
      "A brain MRI study for suspected glioma is four 3D sequences of about 155 slices each, roughly 620 flat images per case. Understanding the tumour's 3D shape means reconstructing it mentally, and a confident-looking AI overlay on one slice doesn't say whether the 3D prediction underneath can be trusted. The thesis: a 3D viewer alone isn't new; a 3D viewer that tells you whether to trust what it shows is.",
    constraints: [
      'Research and teaching prototype only: never a diagnosis, never a substitute for a radiologist.',
      'Fully local, 0 cloud calls: uploads are deleted after processing and derived artefacts expire in 23 h.',
      'A 120 s per-case budget (T4 GPU reference).',
      'Fail-safe validation: a partially valid study produces zero output, never a degraded one.'
    ],
    pipeline: [
      { label: 'Ingest', detail: 'Multi-sequence MRI and DICOM, grouped by series UID, de-identification checked' },
      { label: 'Validate', detail: 'Geometry, orientation, affine agreement, finite values, skull-strip heuristics' },
      { label: 'Segment', detail: 'MONAI SegResNet sliding-window inference, sha256-pinned checkpoint' },
      { label: 'Uncertainty', detail: 'Flip-TTA ensemble → measured disagreement heat-map' },
      { label: 'Mesh', detail: 'Surface Nets extraction of nested WT / TC / ET isosurfaces' },
      { label: 'Review', detail: 'Linked axial / coronal / sagittal views, cutaway plane, volumes with formulas' }
    ],
    decisions: [
      {
        choice: 'Measured uncertainty as the differentiator',
        why: 'Flip-TTA disagreement is shown as a toggleable heat-map with an honest caveat wherever it appears.'
      },
      {
        choice: 'Every volume shows its formula',
        why: 'Voxel count × spacing on the original acquisition grid, so any number can be checked by hand.'
      },
      {
        choice: 'HTTP Range requests into the 7.6 GB Decathlon archive',
        why: "Reads the tar's 512-byte headers and fetches only the needed cases: about 99 MB instead of 7.6 GB."
      }
    ],
    limits: [
      'The uncertainty signal is real but modest: σ correlation 0.3463 pooled over 10 held-out cases (disagreement rises from 15.7% to about 65% as σ increases).',
      'Accuracy is measured on 10 held-out cases: enough for the problem statement, not for clinical claims.',
      'About 60–75 s per case on CPU only, so demos use a prewarmed cache of real runs.'
    ],
    results: [
      { value: '17/17', label: "judges' pipeline tests passing" },
      { value: '0.88 / 0.87 / 0.79', label: 'Dice (WT / TC / ET) on 10 real held-out MSD cases' },
      { value: '48', label: 'pytest tests' },
      { value: '0', label: 'cloud calls: inference and copilot run locally' }
    ],
    next: [
      'Evaluate on more held-out cases before making any broader accuracy claim.',
      'Bring CPU inference closer to the 120 s budget without relying on the prewarmed cache.'
    ],
    sources: [
      { label: 'README', url: gh('DecentralisedIntelligence_NeuroScope3d_Outliers3797_PS02') },
      { label: 'docs/VERIFICATION.md', url: gh('DecentralisedIntelligence_NeuroScope3d_Outliers3797_PS02', 'docs/VERIFICATION.md') },
      { label: 'docs/MODEL_CARD.md', url: gh('DecentralisedIntelligence_NeuroScope3d_Outliers3797_PS02', 'docs/MODEL_CARD.md') }
    ],
    demoApp: 'neuroscope'
  },

  'pillai-hotel360': {
    summary:
      'One live, explainable digital twin of a resort: twelve decision-science modules, CCTV vision and weather-aware what-if simulation that all read from the same model.',
    problem:
      'A resort runs on five departments that each keep their own record of the truth: front office on a spreadsheet, maintenance on a logbook, housekeeping on a walkie-talkie, revenue on a static rate card, guest requests on a phone call. None talk to each other in real time and none explain why a decision was made, so the property is permanently reacting.',
    constraints: [
      'Explainable by construction: every recommendation shows its measured basis (a Weibull hazard, an elasticity delta), never a bare confidence score.',
      'Numbers come from code: any figure ≥ 1,000 in an AI reply must appear in the data the model was given (±0.6%).',
      'Every value is tagged SIMULATED, MODELED or DERIVED.',
      'Graceful degradation: a blocked API or missing key degrades one feature, never the app.'
    ],
    pipeline: [
      { label: 'Signals', detail: 'Live weather, 7 public feeds, CCTV test clips' },
      { label: 'Digital twin', detail: 'Seeded deterministic simulation of the property' },
      { label: '12 modules', detail: 'Weibull maintenance, elasticity pricing, Holt/EOQ inventory, k-means segmentation…' },
      { label: 'What-if', detail: 'Monte Carlo on the real tick engine with online Bayesian calibration' },
      { label: 'Assistants', detail: 'Ops + Concierge with automatic Ollama fallback and a grounding gate' },
      { label: 'Act', detail: 'Accepting a recommendation dispatches a visible consequence on the twin' }
    ],
    decisions: [
      {
        choice: 'Persistence-gated everywhere a signal is noisy',
        why: 'One spike never becomes an alert, for maintenance, sentiment and CCTV alike.'
      },
      {
        choice: 'Autopilot calls the same accept() as a human click',
        why: 'Automation has a visible off-ramp and can be stopped at any time.'
      }
    ],
    limits: [
      'Sentiment is lexicon-based, and pricing blends elasticity by guest mix rather than estimating per channel.',
      'CCTV fire and altercation detectors are calibrated heuristics, not trained classifiers.',
      'The property, guests, staff and telemetry are simulated; weather and map are fixed to Goa as a stand-in property.',
      "The Nugen training service returned HTTP 502 at the time, so the assistants run on the Ollama fallback."
    ],
    results: [
      { value: '270+', label: 'tests across modules, simulation engine, auth/RBAC and the grounding gate' },
      { value: '12', label: 'decision-science modules sharing one model' },
      { value: '15', label: 'narrated automation scenarios' }
    ],
    next: [
      'Replace heuristic CCTV detectors with trained classifiers.',
      'Estimate price elasticity per channel.'
    ],
    sources: [
      { label: 'README', url: gh('Pillai_Hotel360') },
      { label: 'docs/INTELLIGENCE_MODELS.md', url: gh('Pillai_Hotel360', 'docs/INTELLIGENCE_MODELS.md') }
    ]
  },

  'sih-ibvap': {
    summary:
      "A software fusion layer that turns SSB's existing border CCTV into an AI surveillance platform without buying a single new camera.",
    problem:
      'Problem statement 26187 (Ministry of Home Affairs, Sashastra Seema Bal): border outposts already have CCTV, but footage is watched rather than analysed. The ask is detection, tracking, virtual fencing, ANPR, pose and thermal analysis and cross-post correlation on the existing camera network.',
    constraints: [
      'Software only, on top of cameras that are already installed.',
      'Honesty rule: every number on screen is computed from real pipeline output or clearly labelled as an assumption or simulation.',
      'Tamper-evident audit log for every security event.'
    ],
    pipeline: [
      { label: 'Edge cameras', detail: 'Four camera processes running simultaneously on real footage' },
      { label: 'Detect + track', detail: 'YOLOv8n + ByteTrack, YOLOv8n-pose skeletons' },
      { label: 'Rules', detail: 'Virtual-fence intrusion and loitering' },
      { label: 'ANPR', detail: 'Multi-frame fusion with EasyOCR' },
      { label: 'Thermal', detail: 'Thermal-trained detector for a dedicated LWIR sentry camera' },
      { label: 'Backend', detail: 'FastAPI, confidence-tiered routing, hash-chained audit log' },
      { label: 'Correlate', detail: 'Cross-BOP matching with haversine travel-time prediction' },
      { label: 'Console', detail: 'React command console with a 3D MapLibre + deck.gl map' }
    ],
    decisions: [
      {
        choice: 'Thermal as a dedicated LWIR post',
        why: "No camera has co-located sensors, so it's never presented as an RGB camera switching to thermal."
      },
      {
        choice: 'Multi-frame ANPR fusion',
        why: 'Combines OCR reads across frames instead of trusting a single frame.'
      },
      {
        choice: 'Per-camera cooldown on confidence-tiered events',
        why: 'Stops one noisy camera from flooding the operator.'
      }
    ],
    limits: [
      'The multi-sensor oscilloscope is simulated (no UGS or microphone hardware is installed), and it carries a badge saying so.',
      "The District Risk Index's terrain factor is a documented, geography-informed assumption, not a measured reading.",
      'Checkpoint digital twins are schematic, not as-built scans.'
    ],
    results: [
      { value: '4', label: 'live camera pipelines running at once' },
      { value: '7', label: 'console pages, from live feeds to the audit log' }
    ],
    next: ['Integrate real ground sensors in place of the simulated oscilloscope feed.'],
    sources: [{ label: 'README', url: gh('SIH_IBVAP') }]
  },

  'retro-3d-portfolio': {
    summary:
      'This site: a 3D room and a working Windows 98 desktop, with live GitHub numbers, in-browser project demos and evidence-backed case studies.',
    problem:
      'Most portfolios are a wall of claims that a reviewer cannot check. This one is built to be explored, and to be verifiable: repo numbers come from GitHub at build time, demos run in your browser, and every case study links to its sources.',
    constraints: [
      'Must stay fast for recruiters: the one-page summary loads without the 3D engine.',
      'Static Vite build on Vercel, plus one optional serverless function for the chat.',
      'Demos process camera frames in the browser; nothing is uploaded.'
    ],
    pipeline: [
      { label: 'Build', detail: 'GitHub API snapshot + per-project share pages, generated at build time' },
      { label: '3D room', detail: 'React Three Fiber scene with baked GLB models, lazy-loaded' },
      { label: 'Win98 OS', detail: 'Window manager, taskbar, start menu, deep-linkable apps' },
      { label: 'Apps', detail: 'Showcase, Terminal, live demos, Ask Jeevesh chat' }
    ],
    decisions: [
      {
        choice: 'Code-split three.js out of the first load',
        why: 'The recruiter view and deep links render before the 1 MB 3D bundle arrives.'
      },
      {
        choice: 'Build-time GitHub snapshot instead of client-side API calls',
        why: "Visitors never hit GitHub's rate limits, and numbers still refresh on every deploy."
      }
    ],
    limits: [
      'Link previews have per-project titles and descriptions, but no per-project images yet.',
      'The chat needs an API key on the server; without one it falls back to local keyword search.'
    ],
    results: [
      { value: '6', label: 'projects with shareable deep links' },
      { value: '3', label: 'in-browser demos: JARVIS, Drishti and NeuroScope' }
    ],
    next: ['Generate per-project preview images.', 'Add privacy-friendly analytics on which windows people open.'],
    sources: [{ label: 'Repository', url: gh('updated_portfolio_website') }]
  }
};

export const getCaseStudy = (projectId?: string): CaseStudy | undefined =>
  projectId ? CASE_STUDIES[projectId] : undefined;

/** Desktop windows that exist for each demo; a case study only offers a demo listed here. */
const DEMO_WINDOWS: Partial<Record<NonNullable<CaseStudy['demoApp']>, AppId>> = {
  jarvis: 'jarvis',
  drishti: 'drishti',
  neuroscope: 'neuroscope'
};

export const demoWindowFor = (projectId?: string): AppId | undefined => {
  const demo = getCaseStudy(projectId)?.demoApp;
  return demo ? DEMO_WINDOWS[demo] : undefined;
};
