import { PERSONAL_INFO, PROJECTS_DATA } from '../data/portfolioData';
import type { AppId } from '../types/os';

/**
 * Site commands for the Ask Jeevesh chat ("open jarvis", "show the Drishti case
 * study", "open resume"). Handled instantly in the browser, before any question
 * is sent to the assistant. Pure: returns what to do; the chat window does it.
 */
export type ChatCommand =
  | { kind: 'app'; appId: AppId; label: string }
  | { kind: 'project'; projectId: string; label: string }
  | { kind: 'url'; url: string; label: string }
  | { kind: 'recruiter' }
  | { kind: 'help' };

const VERB = /^(?:please\s+|can you\s+|could you\s+|pls\s+)?(?:open|show(?:\s+me)?|launch|start|play|take me to|go to|bring up|try)\b\s*(.*)$/i;

/** "show me how drishti works" is a question, not a command. */
const QUESTION_WORDS = /\b(which|what|how|why|who|when|where|whether|does|do|is|are|can|could|would|that|with|using|uses?)\b/;

const PROJECT_KEYWORDS: { id: string; pattern: RegExp }[] = [
  { id: 'jarvis-hedge-fund', pattern: /\bjarvis\b|hedge fund/ },
  { id: 'drishti-ai', pattern: /\bdrishti\b|\bkinesis\b/ },
  { id: 'neuroscope-3d', pattern: /\bneuro\s?scope\b/ },
  { id: 'pillai-hotel360', pattern: /\bhotel\s?360\b|\bresort\b/ },
  { id: 'sih-ibvap', pattern: /\bibvap\b|\bsih\b|smart india|\bborder\b/ },
  { id: 'retro-3d-portfolio', pattern: /this (?:site|portfolio|website)|retro (?:desktop|portfolio)/ }
];

/** Apps a visitor can open by name, checked in order. Generic names only match short commands. */
const APP_KEYWORDS: { appId: AppId; label: string; pattern: RegExp; generic?: boolean }[] = [
  { appId: 'jarvis', label: 'JARVIS.exe (finance demo)', pattern: /\bjarvis\b|\bdcf\b|finance demo|calculator/ },
  { appId: 'drishti', label: 'Drishti.exe (vision demo)', pattern: /\bdrishti\b|\bkinesis\b|webcam|vision demo/ },
  { appId: 'neuroscope', label: 'NeuroScope3D.exe (3D demo)', pattern: /\bneuro\s?scope\b|\bbrain\b|tumou?r|\bmri\b/ },
  { appId: 'resume', label: 'Resume.pdf', pattern: /\br[eé]sum[eé]\b/ },
  { appId: 'terminal', label: 'MS-DOS Prompt', pattern: /\bterminal\b|\bdos\b|command prompt|\bcmd\b/ },
  { appId: 'videoDemo', label: 'the demo tour video', pattern: /\bvideo\b|\btour\b/, generic: true },
  { appId: 'projects', label: 'Projects Explorer', pattern: /\bprojects?\b|\bportfolio\b/, generic: true },
  { appId: 'showcase', label: 'My Showcase', pattern: /\bshowcase\b/, generic: true },
  { appId: 'about', label: 'About_Me.txt', pattern: /\babout\b|\bbio\b/, generic: true },
  { appId: 'minesweeper', label: 'Minesweeper', pattern: /minesweeper/ },
  { appId: 'snake', label: 'Snake.exe', pattern: /\bsnake\b/ }
];

const HELP = /^(?:help|commands|what can you do|what can i (?:ask|type)|how does this work)\??$/i;

export function parseChatCommand(input: string): ChatCommand | null {
  const text = input.trim().replace(/[.!?]+$/, '');
  if (HELP.test(text)) return { kind: 'help' };

  const match = text.match(VERB);
  if (!match) return null;
  const target = match[1]
    .toLowerCase()
    .replace(/^(?:(?:the|a|an|me|my|his|jeevesh'?s)\s+)+/, '')
    .trim();
  if (!target || QUESTION_WORDS.test(target)) return null;
  const isShort = target.split(/\s+/).length <= 3;

  if (/recruiter|one[- ]page|summary/.test(target)) return { kind: 'recruiter' };
  if (/linked\s?in/.test(target)) return { kind: 'url', url: PERSONAL_INFO.linkedin, label: 'LinkedIn' };

  const project = PROJECT_KEYWORDS.find(p => p.pattern.test(target));
  const projectData = project && PROJECTS_DATA.find(p => p.id === project.id);

  // "open the drishti repo", "show me neuroscope's code"
  if (projectData && /\b(repo|repository|code|source|github)\b/.test(target) && projectData.githubUrl) {
    return { kind: 'url', url: projectData.githubUrl, label: `the ${projectData.title.split(' — ')[0]} repository` };
  }
  if (/\bgithub\b/.test(target)) return { kind: 'url', url: PERSONAL_INFO.github, label: 'GitHub' };

  // "show the drishti case study", "open hotel360 details"
  if (projectData && /\b(case study|case-study|project|details|page|write-?up|overview)\b/.test(target)) {
    return { kind: 'project', projectId: projectData.id, label: projectData.title.split(' — ')[0] };
  }

  const app = APP_KEYWORDS.find(a => a.pattern.test(target) && (!a.generic || isShort));
  if (app) return { kind: 'app', appId: app.appId, label: app.label };

  // Projects without a demo window open their case study.
  if (projectData) return { kind: 'project', projectId: projectData.id, label: projectData.title.split(' — ')[0] };

  return null;
}

export const HELP_TEXT = [
  'You can ask me anything about Jeevesh\'s projects, skills, experience or contact details. I can also open things on this desktop:',
  '- "open jarvis", "open drishti" or "open neuroscope" for the live demos',
  '- "show the Hotel360 case study" or "open the IBVAP repo"',
  '- "open resume", "open terminal" or "open recruiter summary"',
  'Press ↑ in the message box to bring back your last question.'
].join('\n');
