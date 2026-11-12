/**
 * Knowledge base for "Ask Jeevesh", built from the same data the site renders.
 *
 * Used in two places:
 *  - the browser's offline answerer (keyword search, no API key needed);
 *  - the serverless endpoint, via api/_knowledge.ts, which vite.config.ts
 *    regenerates from this module on every dev start and build, so the
 *    deployed function never has to import the app's TypeScript at runtime.
 */
import {
  PERSONAL_INFO,
  PROJECTS_DATA,
  EXPERIENCE_DATA,
  HACKATHONS_DATA,
  EDUCATION_DATA,
  CERTIFICATIONS_DATA
} from './portfolioData';
import { CASE_STUDIES } from './caseStudies';
import { getRepoStats, formatDate, isCiPassing } from '../lib/githubStats';

export type KnowledgeLink =
  | { kind: 'project'; projectId: string }
  | { kind: 'app'; slug: 'jarvis' | 'drishti' | 'neuroscope' }
  | { kind: 'url'; url: string };

export interface KnowledgeChunk {
  /** Citation id, e.g. "drishti-ai". Lowercase letters, digits and hyphens only. */
  id: string;
  title: string;
  text: string;
  link?: KnowledgeLink;
}

const lines = (...parts: (string | false | undefined | null)[]) => parts.filter(Boolean).join('\n');
const bullets = (items: string[]) => items.map(i => `- ${i}`).join('\n');

/** Repo activity from the build-time GitHub snapshot, with absolute dates. */
function activityLine(repoName?: string): string | undefined {
  const stats = getRepoStats(repoName);
  if (!stats) return undefined;
  const parts = [
    `GitHub activity (snapshot of ${formatDate(stats.fetchedAt)}): ${stats.commits} commits on ${stats.defaultBranch}`,
    `last commit on ${formatDate(stats.lastCommitAt)}${stats.lastCommitMessage ? ` ("${stats.lastCommitMessage}")` : ''}`
  ];
  if (isCiPassing(stats) && stats.ci) parts.push(`latest CI run (${stats.ci.workflow}) passed`);
  if (stats.stars > 0) parts.push(`${stats.stars} GitHub stars`);
  return `${parts.join('; ')}.`;
}

export function buildKnowledgeChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  chunks.push({
    id: 'profile',
    title: 'Profile',
    text: lines(
      `${PERSONAL_INFO.name}: ${PERSONAL_INFO.role} (${PERSONAL_INFO.headline}).`,
      `${PERSONAL_INFO.degree} at ${PERSONAL_INFO.institution}, ${PERSONAL_INFO.cgpa}. Based in ${PERSONAL_INFO.location}.`,
      'Focus areas: real-time computer vision pipelines, deep-learning model fine-tuning and evaluation, quantitative financial modelling, and production full-stack systems (FastAPI backends, React dashboards).',
      'Built projects at several 2026 hackathons, including the Drishti AI Hackathon, Smart India Hackathon, PCCOE Craftverse and the Decentralised Intelligence Hackathon.'
    )
  });

  chunks.push({
    id: 'skills',
    title: 'Technical skills',
    text: lines(
      `Languages: ${PERSONAL_INFO.skills.languages.join(', ')}.`,
      `AI / ML: ${PERSONAL_INFO.skills.ai_ml.join(', ')}.`,
      `Data & systems: ${PERSONAL_INFO.skills.data_systems.join(', ')}.`,
      `Finance & quant: ${PERSONAL_INFO.skills.finance_quant.join(', ')}.`,
      `Other strengths: ${PERSONAL_INFO.skills.competencies.join(', ')}.`
    )
  });

  chunks.push({
    id: 'contact',
    title: 'Contact & links',
    text: lines(
      `Email: ${PERSONAL_INFO.email}`,
      `GitHub: ${PERSONAL_INFO.github}`,
      `LinkedIn: ${PERSONAL_INFO.linkedin}`,
      'Resume: a PDF is available on this site (Resume.pdf on the desktop, or the Recruiter Summary page at /recruiter).',
      'The Showcase Explorer also has a contact form ("Contact Transmission").'
    ),
    link: { kind: 'url', url: `mailto:${PERSONAL_INFO.email}` }
  });

  for (const project of PROJECTS_DATA) {
    const study = CASE_STUDIES[project.id];
    chunks.push({
      id: project.id,
      title: project.title,
      text: lines(
        `${project.title} (${project.category}, ${project.year}).`,
        project.description,
        `Tech: ${project.tech.join(', ')}.`,
        project.githubUrl && `Repository: ${project.githubUrl}`,
        activityLine(project.repoStats?.repoName),
        `Highlights listed on the site:\n${bullets(project.features)}`,
        study &&
          lines(
            `Case study (written from the project's own repository):`,
            `Summary: ${study.summary}`,
            `Problem: ${study.problem}`,
            `Constraints:\n${bullets(study.constraints.map(c => `Constraint: ${c}`))}`,
            `Architecture: ${study.pipeline.map(s => `${s.label} (${s.detail})`).join(' -> ')}`,
            `Key decisions:\n${bullets(study.decisions.map(d => `Decision: ${d.choice}, because ${d.why}`))}`,
            `Results:\n${bullets(study.results.map(r => `Result: ${r.value}, ${r.label}`))}`,
            `Honest limits:\n${bullets(study.limits.map(l => `Limit: ${l}`))}`,
            `Next steps:\n${bullets(study.next.map(n => `Next: ${n}`))}`,
            study.demoApp && `A live in-browser demo of this project is available on the site's desktop.`
          )
      ),
      link: { kind: 'project', projectId: project.id }
    });
  }

  chunks.push({
    id: 'demos',
    title: 'Live demos on this site',
    text: lines(
      'The site has three in-browser demos, each a window on the retro desktop:',
      '- JARVIS.exe (/apps/jarvis): deterministic finance calculators (DCF valuation with a sensitivity table, a moneylender interest check, and a fee-drag calculator), showing every step of the maths.',
      '- Drishti.exe (/apps/drishti): webcam or video behaviour monitoring with public MediaPipe models; pixelates faces, learns a per-person baseline and raises persistence-gated, explained alerts. Frames never leave the browser.',
      '- NeuroScope3D.exe (/apps/neuroscope): a synthetic brain-tumour phantom with nested WT/TC/ET regions, a cutaway plane, a linked slice view and volumes that show their formula. Not patient data.',
      'In the Ask Jeevesh chat, visitors can type commands such as "open jarvis", "show the Drishti case study", "open the IBVAP repo", "open resume" or "open recruiter summary", or type "help".'
    ),
    link: { kind: 'app', slug: 'jarvis' }
  });

  chunks.push({
    id: 'experience',
    title: 'Experience (job simulations)',
    text: EXPERIENCE_DATA.map(exp =>
      lines(`${exp.company}: ${exp.role} (${exp.period}, ${exp.location}).`, bullets(exp.achievements), `Skills: ${exp.tech.join(', ')}.`)
    ).join('\n\n')
  });

  chunks.push({
    id: 'hackathons',
    title: 'Hackathon builds (2026)',
    text: HACKATHONS_DATA.map(h => `- ${h.event}: ${h.project}. ${h.summary} (${h.tech.join(', ')})`).join('\n')
  });

  chunks.push({
    id: 'education',
    title: 'Education',
    text: EDUCATION_DATA.map(ed =>
      lines(`${ed.degree}, ${ed.institution} (${ed.period}, ${ed.location}): ${ed.score}.`, bullets(ed.highlights))
    ).join('\n')
  });

  chunks.push({
    id: 'certifications',
    title: 'Certifications',
    text: CERTIFICATIONS_DATA.map(c => `- ${c.title}, ${c.issuer} (${c.date}): ${c.grade}`).join('\n')
  });

  return chunks;
}

/** The documents block embedded in the assistant's system prompt. */
export function knowledgeDocument(chunks: KnowledgeChunk[] = buildKnowledgeChunks()): string {
  const docs = chunks.map(c => `<doc id="${c.id}" title="${c.title.replace(/"/g, "'")}">\n${c.text}\n</doc>`);
  return `<portfolio>\n${docs.join('\n')}\n</portfolio>`;
}
