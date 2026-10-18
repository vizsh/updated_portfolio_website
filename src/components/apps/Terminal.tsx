import React, { useState, useRef, useEffect } from 'react';
import {
  PERSONAL_INFO,
  PROJECTS_DATA,
  EXPERIENCE_DATA,
  EDUCATION_DATA
} from '../../data/portfolioData';
import { retroAudio } from '../../services/audio';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
}

export const Terminal: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', text: 'Microsoft(R) Windows 98 [Version 4.10.1998]' },
    { type: 'output', text: '(C) Copyright Microsoft Corp 1981-1998.' },
    { type: 'output', text: '' },
    { type: 'output', text: 'Type "help" to see available terminal commands or "whoami" for user stats.' },
    { type: 'output', text: '' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isMatrix, setIsMatrix] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isMatrix]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    retroAudio.playKeyStroke();

    if (e.key === 'Enter') {
      const cmd = inputVal.trim().toLowerCase();
      const newLines: TerminalLine[] = [{ type: 'input', text: `C:\\WINDOWS> ${inputVal}` }];

      if (!cmd) {
        setHistory(prev => [...prev, ...newLines]);
        setInputVal('');
        return;
      }

      switch (cmd) {
        case 'help':
          newLines.push(
            { type: 'output', text: 'Available DOS commands:' },
            { type: 'output', text: '  whoami       - Display identity, CGPA, and role' },
            { type: 'output', text: '  whoami       - Display identity, CGPA, and role' },
            { type: 'output', text: '  repos        - List verified premier GitHub repositories' },
            { type: 'output', text: '  jarvis       - Inspect JARVIS autonomous quantitative hedge fund' },
            { type: 'output', text: '  drishti      - Inspect Drishti AI real-time exam surveillance' },
            { type: 'output', text: '  neuroscope   - Inspect NeuroScope 3D cranial tumor segmentation' },
            { type: 'output', text: '  hotel360     - Inspect Smart Resort 360 decision science' },
            { type: 'output', text: '  ibvap        - Inspect SIH IBVAP border vehicle surveillance' },
            { type: 'output', text: '  hackathons   - View national hackathon championship titles' },
            { type: 'output', text: '  projects     - List domain-specific engineering builds' },
            { type: 'output', text: '  skills       - View full technical competencies' },
            { type: 'output', text: '  education    - Display degrees and academic honors' },
            { type: 'output', text: '  contact      - Show direct email and social endpoints' },
            { type: 'output', text: '  matrix       - Toggle the Matrix phosphor rain' },
            { type: 'output', text: '  date         - Print current system timestamp' },
            { type: 'output', text: '  clear / cls  - Clear terminal screen' },
            { type: 'output', text: '  easteregg    - A secret retro transmission' }
          );
          break;

        case 'repos':
          newLines.push(
            { type: 'success', text: '=== VERIFIED FLAGSHIP GITHUB REPOSITORIES (vizsh) ===' },
            { type: 'output', text: '1. Jarvis_Hedge_Fund: 72 commits | 532 passing tests | Bilingual (EN/HI)' },
            { type: 'output', text: '   https://github.com/vizsh/Jarvis_Hedge_Fund' },
            { type: 'output', text: '2. Drishti_AI: 79 commits (highest) | Modular 5-stage pipeline | 92% mAP50' },
            { type: 'output', text: '   https://github.com/vizsh/Drishti_AI' },
            { type: 'output', text: '3. NeuroScope 3D: 42 commits | Real MONAI | 17/17 judge tests | 48 pytests' },
            { type: 'output', text: '   https://github.com/vizsh/DecentralisedIntelligence_NeuroScope3d_Outliers3797_PS02' },
            { type: 'output', text: '4. Pillai_Hotel360: 56 commits | 100MB | CI badge | 12 decision modules' },
            { type: 'output', text: '   https://github.com/vizsh/Pillai_Hotel360' },
            { type: 'output', text: '5. SIH_IBVAP: 35 commits | 106MB | Ministry of Home Affairs / SSB PS' },
            { type: 'output', text: '   https://github.com/vizsh/SIH_IBVAP' }
          );
          break;

        case 'jarvis':
          newLines.push(
            { type: 'success', text: '>>> [JARVIS - AUTONOMOUS QUANTITATIVE HEDGE FUND] <<<' },
            { type: 'output', text: '* 72 commits, 532 passing tests (badge-verified).' },
            { type: 'output', text: '* Bilingual (English / Hindi) natural language financial queries.' },
            { type: 'output', text: '* Core paradigm: “No model writes a figure” — every calculation is audited code.' },
            { type: 'output', text: '* Repo: https://github.com/vizsh/Jarvis_Hedge_Fund' }
          );
          break;

        case 'drishti':
        case 'kinesis':
          newLines.push(
            { type: 'success', text: '>>> [DRISHTI AI / KINESIS - 1ST PLACE WINNER] <<<' },
            { type: 'output', text: '* 79 commits (most iterative project) with modular perception/behaviour/calibration layers.' },
            { type: 'output', text: '* 92% mAP50 on 25k+ ground-truth images, camera-calibrated seat positioning (0 biometric capture).' },
            { type: 'output', text: '* 8 staged demonstration scripts and complete docs/ suite.' },
            { type: 'output', text: '* Repo: https://github.com/vizsh/Drishti_AI' }
          );
          break;

        case 'neuroscope':
          newLines.push(
            { type: 'success', text: '>>> [NEUROSCOPE 3D - VOLUMETRIC MEDICAL IMAGING] <<<' },
            { type: 'output', text: '* 42 commits, 17/17 judge tests passing, 48-test pytest suite.' },
            { type: 'output', text: '* Real MONAI deep-learning 3D tumor segmentation with measured Dice/HD95 scores.' },
            { type: 'output', text: '* Strict “no claim ships without a reproducible run” engineering discipline.' },
            { type: 'output', text: '* Repo: https://github.com/vizsh/DecentralisedIntelligence_NeuroScope3d_Outliers3797_PS02' }
          );
          break;

        case 'hotel360':
          newLines.push(
            { type: 'success', text: '>>> [SMART RESORT 360 - HOSPITALITY DECISION SCIENCE] <<<' },
            { type: 'output', text: '* 56 commits, 100MB production codebase with CI pipeline automated verification badge.' },
            { type: 'output', text: '* 12 predictive decision-science modules + real CCTV occupancy computer vision.' },
            { type: 'output', text: '* Repo: https://github.com/vizsh/Pillai_Hotel360' }
          );
          break;

        case 'ibvap':
          newLines.push(
            { type: 'success', text: '>>> [SIH IBVAP - BORDER SURVEILLANCE & ANPR] <<<' },
            { type: 'output', text: '* 35 commits, 106MB, engineered for Ministry of Home Affairs / SSB (Smart India Hackathon).' },
            { type: 'output', text: '* High-accuracy ANPR, multi-camera tracking, and cross-post vehicle-person correlation.' },
            { type: 'output', text: '* Repo: https://github.com/vizsh/SIH_IBVAP' }
          );
          break;

        case 'whoami':
        case 'about':
          newLines.push(
            { type: 'success', text: `USER: ${PERSONAL_INFO.name}` },
            { type: 'output', text: `DEGREE: ${PERSONAL_INFO.degree}` },
            { type: 'output', text: `INSTITUTION: ${PERSONAL_INFO.institution}` },
            { type: 'output', text: `ACADEMIC CGPA: ${PERSONAL_INFO.cgpa}` },
            { type: 'output', text: `SPECIALIZATION: Computer Vision, Applied ML, Quantitative Modeling & Full-Stack Systems.` }
          );
          break;

        case 'kinesis':
          newLines.push(
            { type: 'success', text: '>>> [KINESIS AI - 1ST PLACE DRISHTI AI HACKATHON] <<<' },
            { type: 'output', text: '* Real-time exam-hall monitoring without facial biometric identification.' },
            { type: 'output', text: '* Identity mapped through camera-calibrated seat positions.' },
            { type: 'output', text: '* Fine-tuned on 25,000+ images with 92% mAP50 benchmark.' },
            { type: 'output', text: '* Statistical rolling baseline engine to eliminate false-positive spikes.' },
            { type: 'output', text: '* Full-stack FastAPI WebSocket pipeline + React audit dashboard.' }
          );
          break;

        case 'hackathons':
        case 'awards':
          newLines.push(
            { type: 'success', text: '--- NATIONAL COMPETITIVE RECORDS ---' },
            { type: 'output', text: '  [1ST PLACE] Drishti AI Hackathon (Kinesis AI)' },
            { type: 'output', text: '  [1ST PLACE] Sathaye College Hackathon (Zenith)' },
            { type: 'output', text: '  [1ST PLACE] HackOut Hackathon' },
            { type: 'output', text: '  [1ST PLACE] PCCOE Hacktopia National Hackathon' },
            { type: 'output', text: '  [1ST PLACE] NMFC TechTatva (X-Ray Fault Classifier)' },
            { type: 'output', text: '  [3RD PLACE] PCCOE Craftverse (Jarvis Hedge Fund)' },
            { type: 'output', text: '  [3RD PLACE] MPSTME Commit 1.0' },
            { type: 'output', text: '  [3 WINS]    Top Finishes in Major Academic / Corporate Case Studies' }
          );
          break;

        case 'skills':
          newLines.push({ type: 'success', text: '--- TECHNICAL COMPETENCIES ---' });
          Object.entries(PERSONAL_INFO.skills).forEach(([category, items]) => {
            newLines.push({ type: 'output', text: `[${category.toUpperCase().replace('_', ' ')}]: ${(items as string[]).join(', ')}` });
          });
          break;

        case 'projects':
          newLines.push({ type: 'success', text: '--- DOMAIN-SPECIFIC PROJECTS ---' });
          PROJECTS_DATA.forEach((p, idx) => {
            newLines.push({ type: 'output', text: `${idx + 1}. ${p.title} (${p.year})` });
            newLines.push({ type: 'output', text: `   Tech: ${p.tech.join(', ')}` });
            newLines.push({ type: 'output', text: `   ${p.tagline}` });
          });
          break;

        case 'education':
          newLines.push({ type: 'success', text: '--- ACADEMIC CREDENTIALS ---' });
          EDUCATION_DATA.forEach(e => {
            newLines.push({ type: 'output', text: `* ${e.institution}` });
            newLines.push({ type: 'output', text: `  ${e.degree} | Score: ${e.score} (${e.period})` });
          });
          break;

        case 'experience':
          newLines.push({ type: 'success', text: '--- PROFESSIONAL SIMULATIONS & ROLES ---' });
          EXPERIENCE_DATA.forEach(e => {
            newLines.push({ type: 'output', text: `* ${e.role} @ ${e.company} (${e.period})` });
          });
          break;

        case 'contact':
          newLines.push(
            { type: 'output', text: `Email:    ${PERSONAL_INFO.email}` },
            { type: 'output', text: `Phone:    ${PERSONAL_INFO.phone}` },
            { type: 'output', text: `GitHub:   ${PERSONAL_INFO.github}` },
            { type: 'output', text: `LinkedIn: ${PERSONAL_INFO.linkedin}` }
          );
          break;

        case 'matrix':
          setIsMatrix(!isMatrix);
          newLines.push({
            type: 'success',
            text: isMatrix ? 'Matrix green phosphor mode deactivated.' : 'Wake up, Neo... Phosphor Matrix mode online!'
          });
          break;

        case 'clear':
        case 'cls':
          setHistory([]);
          setInputVal('');
          return;

        case 'date':
          newLines.push({ type: 'output', text: new Date().toString() });
          break;

        case 'easteregg':
          newLines.push(
            { type: 'success', text: '>>> [SYSTEM EASTER EGG UNLOCKED] <<<' },
            { type: 'output', text: 'You discovered the hidden retro register!' },
            { type: 'output', text: 'Built with passion for high-craft computing by Jeevesh Bodhani.' },
            { type: 'output', text: 'Check out the interactive desk lamp and Coffee steam in the 3D room!' }
          );
          retroAudio.playStartup();
          break;

        default:
          newLines.push({
            type: 'error',
            text: `Bad command or file name: "${cmd}". Type "help" for a list of DOS commands.`
          });
      }

      setHistory(prev => [...prev, ...newLines]);
      setInputVal('');
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        height: '100%',
        backgroundColor: '#000000',
        color: isMatrix ? '#39ff14' : '#e0e0e0',
        fontFamily: 'var(--font-dos), monospace',
        fontSize: '13px',
        padding: '12px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        lineHeight: '1.4'
      }}
    >
      {history.map((line, idx) => {
        let color = isMatrix ? '#39ff14' : '#ffffff';
        if (line.type === 'error') color = '#ff5555';
        if (line.type === 'success') color = '#55ff55';
        if (line.type === 'input') color = '#ffff55';

        return (
          <div key={idx} style={{ color, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {line.text}
          </div>
        );
      })}

      {/* Input Prompt Line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: '#ffff55' }}>C:\WINDOWS&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: isMatrix ? '#39ff14' : '#ffffff',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            padding: 0
          }}
        />
      </div>

      <div ref={bottomRef} />
    </div>
  );
};
