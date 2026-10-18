import type { ProjectItem, ExperienceItem } from '../types/os';

export const PERSONAL_INFO = {
  name: 'Jeevesh Bodhani',
  headline: 'Artificial Intelligence & Data Science Engineer',
  role: 'AI / ML & Computer Vision Engineer',
  institution: 'Dwarkadas J. Sanghvi College of Engineering',
  degree: 'B.Tech in Artificial Intelligence and Data Science (2024 - 2028)',
  cgpa: '9.6 Cumulative CGPA',
  location: 'Mumbai, Maharashtra, India',
  email: 'jeeveshbodhani5@gmail.com',
  phone: '+91-9372031465',
  github: 'https://github.com/vizsh',
  linkedin: 'https://www.linkedin.com/in/jeeveshbodhani21',
  resumeUrl: '/Jeevesh_Bodhani_Resume.pdf',
  bioMonologue: `===================================================================
  JEEVESH BODHANI - PORTFOLIO SYSTEM & ENGINEERING LOG
  B.Tech in Artificial Intelligence and Data Science (CGPA: 9.6)
  Dwarkadas J. Sanghvi College of Engineering, Mumbai
===================================================================

Welcome to my retro workstation!

I am an Artificial Intelligence and Data Science undergraduate specializing
in real-time Computer Vision pipelines, deep learning model fine-tuning,
quantitative financial modeling, and production-grade full-stack systems.

CORE TECHNICAL HIGHLIGHTS:
-------------------------------------------------------------------
* Computer Vision & AI:
  Fine-tuned custom object detection & tracking models (92% mAP50 on 25k+
  images), pose estimation, image segmentation, and camera-calibrated
  spatial position mapping (eliminating the need for facial biometric data).

* Full-Stack AI Products:
  Production FastAPI backends with sub-50ms latency, React dashboards,
  real-time telemetry streams, and role-based incident review systems.

* Competitive Engineering Record:
  5x 1st Place Champion in National-Level Hackathons (Drishti AI,
  Sathaye College, HackOut, PCCOE Hacktopia, NMFC TechTatva).

* Quantitative & Financial Engineering:
  DCF financial modeling, credit risk assessment, and quantitative analytics
  certified by New York Institute of Finance & Google Cloud (100% Grade).

SYSTEM WORKSTATION SHORTCUTS:
  [1] Open 'Showcase Explorer' to inspect deep architectural case studies.
  [2] Launch 'Terminal.exe' for interactive MS-DOS commands and stats.
  [3] Launch 'Snake.exe' or 'Minesweeper' for retro break time.
  [4] View 'Resume.pdf' for downloadable official credentials.

Feel free to test out the desk lamp or explore the desktop!
`,
  skills: {
    languages: ['Python', 'C', 'JavaScript / TypeScript', 'SQL', 'C++ basics'],
    ai_ml: [
      'PyTorch',
      'OpenCV',
      'Computer Vision',
      'Object Detection (YOLO / Custom)',
      'Pose Estimation',
      'Deep Learning',
      'Model Fine-Tuning & Evaluation',
      'Image Segmentation'
    ],
    data_systems: [
      'FastAPI',
      'React',
      'NumPy',
      'Pandas',
      'Time-Series Forecasting',
      'Data Visualization',
      'REST APIs',
      'Git & GitHub'
    ],
    finance_quant: [
      'Financial Modeling (DCF)',
      'Credit Risk Analysis',
      'Company & Market Valuation',
      'Quantitative Telemetry Modeling'
    ],
    competencies: [
      'Structured Problem-Solving',
      'Camera-Calibrated Spatial Mapping',
      'Statistical Baseline Calibration',
      'Rapid Prototyping under Hackathon Deadlines'
    ]
  }
};

export const PROJECTS_DATA: (ProjectItem & {
  deepDive?: {
    overview: string;
    architecture: string[];
    benchmark: string;
    highlights: string[];
  };
})[] = [
  {
    id: 'jarvis-hedge-fund',
    title: 'JARVIS — Autonomous Quantitative Hedge Fund',
    tagline: '72 Commits | 532 Passing Tests (Badge-Verified) | Bilingual Hindi/English',
    category: 'Full-Stack',
    year: '2025',
    status: 'Featured',
    tech: ['Python', 'Quantitative Modeling', 'DCF', 'FastAPI', 'React', 'PyTest (532 tests)', 'NLP'],
    description: 'An institutional-grade algorithmic hedge fund and portfolio management engine built on a strict zero-hallucination paradigm: “no model writes a figure” — every financial calculation is deterministic code you can audit.',
    features: [
      '532 passing automated tests with CI verification badge and 72 deep iteration commits',
      'Deterministic financial verification: every valuation, DCF model, and sensitivity check runs audited arithmetic rather than generative guesswork',
      'Bilingual conversational interface supporting seamless financial queries in both English and Hindi',
      'Quantitative portfolio rebalancing optimizing Sharpe ratio and mitigating downside risk via automated stop-losses'
    ],
    repoStats: {
      commits: 72,
      tests: '532 passing tests',
      verifiedBadge: 'CI: Passing (532/532)',
      highlights: 'Bilingual (EN/HI) • Deterministic Auditability • Zero Financial Hallucination',
      repoName: 'vizsh/Jarvis_Hedge_Fund'
    },
    deepDive: {
      overview: 'Modern quantitative trading tools either rely on opaque black-box LLMs that hallucinate numerical figures or rigid terminals that lack intuitive querying. JARVIS bridges both: natural language understanding backed by auditable deterministic financial code.',
      architecture: [
        'Natural Language Intent Parsing with bilingual English/Hindi tokenization',
        'Deterministic Financial Computation Engine (DCF, WACC, Beta, Black-Scholes)',
        'Auditable Math Trace Generator: Every output includes code-verified derivation proofs',
        'Multi-Asset Portfolio Optimizer maximizing risk-adjusted Sharpe & Sortino ratios',
        'FastAPI Event Gateway with sub-30ms reaction latency to incoming telemetry'
      ],
      benchmark: '532 Passing PyTests across all pricing models with 100% mathematical reproducibility',
      highlights: [
        'Strict “no model writes a figure” compliance rule',
        'Bilingual English & Hindi support for Indian and global financial markets',
        'Selected 3rd Place overall at PCCOE Craftverse Hackathon'
      ]
    },
    liveUrl: 'https://github.com/vizsh/Jarvis_Hedge_Fund',
    githubUrl: 'https://github.com/vizsh/Jarvis_Hedge_Fund'
  },
  {
    id: 'drishti-ai',
    title: 'Drishti AI (Kinesis) — Real-Time Exam Behavioral Surveillance',
    tagline: '79 Commits (Highest Iteration) | 1st Place Drishti AI | Modular 5-Stage Pipeline',
    category: 'AI & Systems',
    year: '2025',
    status: 'Featured',
    tech: ['Python', 'PyTorch', 'OpenCV', 'TensorRT', 'FastAPI', 'React', 'Pose Tracking'],
    description: 'A privacy-first real-time computer vision pipeline monitoring exam-hall behaviour from standard CCTV footage without facial biometrics. Resolves identity via camera-calibrated seat positioning instead of biometric databases.',
    features: [
      'Highest commit iteration (79 commits) with a modular layered architecture across perception, behaviour, and calibration',
      'Fine-tuned custom object-detection model on 25,000+ images achieving 92% mAP50, beating the benchmark baseline',
      'Statistical baseline calibration scoring each student against individual norms, eliminating rigid alert cascades',
      '8 staged live demonstration scripts and full docs/ suite for turnkey audit deployment'
    ],
    repoStats: {
      commits: 79,
      tests: '8 staged demo scripts',
      verifiedBadge: '1st Place Hackathon Winner',
      highlights: 'Modular Architecture (perception/behaviour/calibration) • 92% mAP50 • Privacy-First',
      repoName: 'vizsh/Drishti_AI'
    },
    deepDive: {
      overview: 'Traditional proctoring compromises student biometrics and generates unbearable false positives from rigid head-angle thresholds. Drishti AI uses 3D hall spatial calibration to trace seats without storing face biometrics, scoring anomalies against rolling personal baselines.',
      architecture: [
        'ingestion/: RTSP Multi-Camera Video Stream Decoupling & Buffer Normalization',
        'calibration/: 2D Pixel to 3D Hall Coordinate Perspective Calibration Matrix',
        'perception/: Fine-Tuned PyTorch Detection & Multi-Object Spatial Tracking',
        'behaviour/ & risk_engine/: Temporal Sliding-Window Variance Scoring',
        'React Dashboard: Live alert queue with human-readable rationale and timestamped replays'
      ],
      benchmark: '92% mAP50 on 25,000+ real-world ground-truth images across varying lighting conditions',
      highlights: [
        'Won 1st Place overall at Drishti AI National Hackathon',
        'Zero facial biometric data stored or processed',
        'Clean modular directory layout: perception/, behaviour/, calibration/, risk_engine/, ingestion/'
      ]
    },
    liveUrl: 'https://github.com/vizsh/Drishti_AI',
    githubUrl: 'https://github.com/vizsh/Drishti_AI'
  },
  {
    id: 'neuroscope-3d',
    title: 'NeuroScope 3D — Decentralised Cranial Tumor Segmentation',
    tagline: '42 Commits | Real MONAI 3D Segmentation | 17/17 Judge Tests | 48 PyTests',
    category: '3D & Graphics',
    year: '2025',
    status: 'Featured',
    tech: ['Three.js', 'WebGL', 'MONAI', 'PyTorch', 'DICOM Raymarching', 'React', 'PyTest (48 tests)'],
    description: 'An in-browser medical imaging and cranial tumor volumetric segmentation viewer running real MONAI deep-learning models with verified Dice and HD95 accuracy on held-out patient data.',
    features: [
      '17/17 judge tests passing with 48 automated test suites verifying sub-millimeter anatomical clipping',
      'Real MONAI volumetric segmentation engine (zero mocked data) with measured Dice/HD95 metrics',
      'Documented “no claim ships without a reproducible run” engineering discipline',
      'Interactive 3D multi-planar raymarching across axial, coronal, and sagittal DICOM slices at 60 FPS'
    ],
    repoStats: {
      commits: 42,
      tests: '17/17 Judge Tests & 48 PyTests',
      verifiedBadge: 'Tests: 17/17 Passing',
      highlights: 'Real MONAI Model • Measured Dice/HD95 • Reproducible Run Discipline',
      repoName: 'vizsh/DecentralisedIntelligence_NeuroScope3d'
    },
    deepDive: {
      overview: '3D surgical visualization often relies on heavy workstation installs or mocked browser animations. NeuroScope 3D delivers real GPU raymarching directly in the browser, powered by validated MONAI segmentation models.',
      architecture: [
        'DICOM Volume Parser converting raw CT/MRI series into 3D GPU floating-point textures',
        'MONAI 3D Convolutional Segmentation Inference Engine running on held-out patient data',
        'Custom WebGL Raymarching Shader with interactive clipping plane transfer functions',
        'Multi-Planar Reconstruction (MPR) synchronizing 2D axial/sagittal/coronal slices with 3D mesh'
      ],
      benchmark: '17/17 Passing Judge Tests & measured Dice/HD95 scores on held-out real tumor datasets',
      highlights: [
        'Rigorous automated test suite of 48 pytest cases ensuring anatomical safety',
        'Zero mocked segmentations: every volume is verified against ground truth scans'
      ]
    },
    liveUrl: 'https://github.com/vizsh/DecentralisedIntelligence_NeuroScope3d_Outliers3797_PS02',
    githubUrl: 'https://github.com/vizsh/DecentralisedIntelligence_NeuroScope3d_Outliers3797_PS02'
  },
  {
    id: 'pillai-hotel360',
    title: 'Smart Resort 360 (Hotel360) — Hospitality Decision Science',
    tagline: '56 Commits | 100MB | CI Pipeline Badge | 12 Decision-Science Modules',
    category: 'Full-Stack',
    year: '2025',
    status: 'Featured',
    tech: ['Next.js', 'React', 'TypeScript', 'CCTV Computer Vision', 'Time-Series', 'CI/CD'],
    description: 'An enterprise resort decision-science platform integrating real-time CCTV computer vision occupancy estimation with weather-aware demand simulation across 12 analytical modules.',
    features: [
      '56 commits, 100MB production codebase with CI pipeline automated verification badge',
      'Twelve predictive decision-science modules balancing guest check-in rates, room turnover, and utility loads',
      'Real-time CCTV computer vision model monitoring pool, dining hall, and lobby spatial density',
      'Weather-aware dynamic revenue simulation adjusting staff scheduling and supply ordering'
    ],
    repoStats: {
      commits: 56,
      tests: 'CI Passing Badge',
      verifiedBadge: 'CI: Build Passing',
      highlights: '12 Decision-Science Modules • CCTV Vision • Weather-Aware Simulation',
      repoName: 'vizsh/Pillai_Hotel360'
    },
    deepDive: {
      overview: 'Resort operations lose margins through disconnected software silos between guest reservation systems, kitchen inventory, and facility surveillance. Smart Resort 360 unifies spatial vision with predictive decision models.',
      architecture: [
        'CCTV Vision Pipeline computing real-time area occupancy and transit patterns',
        'Dynamic Weather & Seasonal Demand Forecasting Engine',
        '12 Decision-Science Modules: Predictive housekeeping, kitchen prep, energy optimization',
        'Next.js 14 Responsive Control Tower with role-based supervisor dispatch'
      ],
      benchmark: 'Sub-second real-time occupancy synchronization across resort grounds',
      highlights: [
        'Passing CI automated pipeline badge on main branch',
        'Comprehensive documentation and live operational simulation models'
      ]
    },
    liveUrl: 'https://github.com/vizsh/Pillai_Hotel360',
    githubUrl: 'https://github.com/vizsh/Pillai_Hotel360'
  },
  {
    id: 'sih-ibvap',
    title: 'SIH IBVAP — Integrated Border Vehicle & Person Surveillance',
    tagline: '35 Commits | 106MB | Smart India Hackathon | Ministry of Home Affairs / SSB',
    category: 'AI & Systems',
    year: '2024',
    status: 'Featured',
    tech: ['Python', 'OpenCV', 'PyTorch', 'ANPR', 'Vehicle Re-ID', 'Multi-Camera Tracking'],
    description: 'A mission-critical surveillance system engineered against an official Government of India problem statement (Ministry of Home Affairs / SSB, Smart India Hackathon). Features cross-post vehicle-person correlation and automatic number plate recognition.',
    features: [
      'Built specifically against Ministry of Home Affairs / Sashastra Seema Bal (SSB) government specifications',
      'Automatic Number Plate Recognition (ANPR) optimized for varied plate fonts, angles, and dirt occlusion',
      'Cross-post correlation tracking suspect vehicles moving between distributed checkpoints',
      'Multi-camera person re-identification (Re-ID) mapping occupants entering and exiting transport'
    ],
    repoStats: {
      commits: 35,
      tests: 'MHA / SSB PS Evaluation',
      verifiedBadge: 'Smart India Hackathon',
      highlights: 'Govt PS (MHA / SSB) • ANPR • Cross-Post Vehicle Correlation',
      repoName: 'vizsh/SIH_IBVAP'
    },
    deepDive: {
      overview: 'Border checkpoint surveillance requires zero-latency coordination between vehicle license plate readers and passenger facial/pose detection to prevent cross-border transit fraud.',
      architecture: [
        'High-Resolution Optical Character Recognition & ANPR Pipeline with perspective deskew',
        'Vehicle Make/Model/Color Classification network with spatial feature embeddings',
        'Cross-Post Checkpoint Synchronization bus matching transit travel time anomalies',
        'Alert Gateway flagging mismatched vehicle registration and stolen registry entries'
      ],
      benchmark: '96.4% ANPR accuracy on challenging low-angle and nighttime border checkpoint video',
      highlights: [
        'Grounded, specific engineering solving a national security challenge',
        'Complete end-to-end pipeline handling multi-checkpoint transit topologies'
      ]
    },
    liveUrl: 'https://github.com/vizsh/SIH_IBVAP',
    githubUrl: 'https://github.com/vizsh/SIH_IBVAP'
  },
  {
    id: 'retro-3d-portfolio',
    title: 'Retro 3D Desktop Portfolio & Windows 98 OS',
    tagline: 'Dual Camera 3D Workspace | Authentic Windows 98 OS | Web Audio Synthesizer',
    category: '3D & Graphics',
    year: '2026',
    status: 'Featured',
    tech: ['React 19', 'TypeScript', 'Three.js', 'React Three Fiber', 'GLSL', 'Web Audio API'],
    description: 'An interactive 3D computing workstation merging physical desk exploration with a pixel-perfect, draggable Windows 98 operating system featuring games, terminal, document viewer, and audio synthesis.',
    features: [
      'Physical 3D desk with interactive day/night study lamp, procedural coffee steam, and CRT bloom',
      'Authentic Windows 98 desktop with wireframe ghost drag outlines, start menu, and taskbar',
      'Playable Snake.exe, Minesweeper, MS-DOS Prompt with interactive commands',
      'Zero-latency Web Audio API mechanical sound synthesis on every interaction'
    ],
    repoStats: {
      commits: 40,
      tests: '100% Type-Checked',
      verifiedBadge: 'Vercel Ready',
      highlights: 'Three.js R3F • GLSL Steam • Web Audio • Authentic Win98 OS',
      repoName: 'vizsh/portfolio'
    },
    liveUrl: 'https://github.com/vizsh',
    githubUrl: 'https://github.com/vizsh'
  }
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    company: 'JPMorgan Chase & Co.',
    role: 'Investment Banking Job Simulation',
    period: 'Jul 2025',
    location: 'Quantitative Simulation',
    achievements: [
      'Identified optimal M&A target options for a corporate client based on strict strategic and quantitative financial evaluation criteria.',
      'Constructed and calibrated a Discounted Cash Flow (DCF) model to compute enterprise and equity valuations.',
      'Stress-tested valuation models against sudden competitor bids and severe supply chain disruptions.'
    ],
    tech: ['Financial Modeling (DCF)', 'Valuation Analysis', 'M&A Assessment', 'Sensitivity Analysis']
  },
  {
    company: 'Goldman Sachs',
    role: 'Risk Management Job Simulation',
    period: 'Jun 2025',
    location: 'Quantitative Simulation',
    achievements: [
      'Conducted comprehensive credit risk and quantitative analysis utilizing detailed financial datasets to evaluate personal finance implications.',
      'Applied structured risk modeling to complex commercial real estate scenarios to assess operational and default probabilities.'
    ],
    tech: ['Credit Risk Modeling', 'Quantitative Analysis', 'Default Stress Testing', 'Risk Evaluation']
  },
  {
    company: 'National Hackathon Leadership & Builds',
    role: 'Lead AI Engineer & Technical Architect',
    period: '2024 - 2025',
    location: 'National Level (India)',
    achievements: [
      '1st Place at Drishti AI Hackathon: Built Kinesis AI real-time CV surveillance system without facial biometrics.',
      '1st Place at Sathaye College Hackathon: Engineered Zenith software solution under strict hackathon deadlines.',
      '1st Place at HackOut: Developed functional full-stack software prototype under timed team conditions.',
      '1st Place at PCCOE Hacktopia: Built high-impact engineering prototype solving national-level challenges.',
      '1st Place at NMFC TechTatva: Built machine learning pipeline classifying X-Ray database faults.',
      '3rd Place at PCCOE Craftverse: Built Jarvis Hedge Fund quantitative analysis platform.',
      '3rd Place at MPSTME Commit 1.0: Delivered full working technical software solution.'
    ],
    tech: ['Python', 'PyTorch', 'FastAPI', 'React', 'OpenCV', 'Team Leadership']
  }
];

export const EDUCATION_DATA = [
  {
    institution: 'Dwarkadas J. Sanghvi College of Engineering (DJSCE)',
    degree: 'B.Tech in Artificial Intelligence and Data Science',
    score: 'Cumulative CGPA: 9.6',
    period: 'Sep 2024 – May 2028',
    location: 'Mumbai, Maharashtra',
    highlights: [
      'Consistently maintained top academic standing with 9.6 CGPA in AI & Data Science coursework.',
      'Active leadership in technical hackathons and competitive engineering builds.'
    ]
  },
  {
    institution: 'Pace Junior Science College',
    degree: 'HSC Higher Secondary Certificate Board Examination',
    score: 'Aggregate: 86.67%',
    period: 'May 2022 – Feb 2024',
    location: 'Mumbai, Maharashtra',
    highlights: ['Rigorous foundation in advanced physics, chemistry, and higher mathematics.']
  },
  {
    institution: 'Gundecha Education Academy',
    degree: 'ICSE Indian Certificate of Secondary Education',
    score: 'Aggregate: 94.1% (Mathematics: 99/100)',
    period: 'Completed May 2022',
    location: 'Mumbai, Maharashtra',
    highlights: ['Distinction in Mathematics (99/100) and Science.']
  }
];

export const CERTIFICATIONS_DATA = [
  {
    title: 'Using Machine Learning in Trading and Finance',
    issuer: 'New York Institute of Finance & Google Cloud',
    grade: 'Grade: 100%',
    date: 'Apr 2026'
  },
  {
    title: 'Introduction to Trading, Machine Learning & GCP',
    issuer: 'Google Cloud & New York Institute of Finance',
    grade: 'Grade: 99%',
    date: 'Mar 2026'
  },
  {
    title: 'Introduction to Tech Entrepreneurship',
    issuer: 'IIT Bombay',
    grade: 'Grade: 93%',
    date: 'Jan 2026'
  },
  {
    title: 'Introduction to Front-End Development',
    issuer: 'Meta',
    grade: 'Grade: 92%',
    date: '2025'
  },
  {
    title: 'Generative AI Foundations Certificate',
    issuer: 'Microsoft',
    grade: 'Certified',
    date: '2025'
  }
];
