import React, { useEffect } from 'react';
import {
  PERSONAL_INFO,
  PROJECTS_DATA,
  EXPERIENCE_DATA,
  HACKATHONS_DATA,
  EDUCATION_DATA,
  CERTIFICATIONS_DATA
} from '../../data/portfolioData';
import type { AppId } from '../../types/os';
import { getCaseStudy, demoWindowFor } from '../../data/caseStudies';
import { getRepoStats, isCiPassing, timeAgo, formatDate, GITHUB_STATS_FETCHED_AT } from '../../lib/githubStats';

/** "79 commits · last commit 3 months ago · CI passing", live from the build-time GitHub snapshot. */
const RepoLiveLine: React.FC<{ repoName?: string }> = ({ repoName }) => {
  const stats = getRepoStats(repoName);
  if (!stats) return null;
  const parts = [`${stats.commits} commits`, `last commit ${timeAgo(stats.lastCommitAt)}`];
  if (isCiPassing(stats)) parts.push('CI passing');
  if (stats.stars > 0) parts.push(`★ ${stats.stars}`);
  return (
    <p className="rm-live" title={`Synced from GitHub on ${formatDate(stats.fetchedAt)}`}>
      <span className="rm-live-dot" aria-hidden="true" /> {parts.join(' · ')}
    </p>
  );
};

/** The three projects shown first, in this order. */
const FEATURED_IDS = ['jarvis-hedge-fund', 'drishti-ai', 'neuroscope-3d'];

interface RecruiterModeProps {
  onEnterDesktop: () => void;
  onOpenProject: (projectId: string) => void;
  onOpenApp: (appId: AppId) => void;
}

export const RecruiterMode: React.FC<RecruiterModeProps> = ({ onEnterDesktop, onOpenProject, onOpenApp }) => {
  useEffect(() => {
    const previous = document.title;
    document.title = `${PERSONAL_INFO.name} | Recruiter Summary`;
    return () => {
      document.title = previous;
    };
  }, []);

  const featured = FEATURED_IDS.map(id => PROJECTS_DATA.find(p => p.id === id)).filter(
    (p): p is (typeof PROJECTS_DATA)[number] => Boolean(p)
  );
  const others = PROJECTS_DATA.filter(p => !FEATURED_IDS.includes(p.id));

  const skillGroups: { label: string; items: string[] }[] = [
    { label: 'AI / ML', items: PERSONAL_INFO.skills.ai_ml },
    { label: 'Languages', items: PERSONAL_INFO.skills.languages },
    { label: 'Data & Systems', items: PERSONAL_INFO.skills.data_systems },
    { label: 'Finance & Quant', items: PERSONAL_INFO.skills.finance_quant }
  ];

  return (
    <div className="rm-page">
      <style>{RECRUITER_CSS}</style>

      <header className="rm-header">
        <div className="rm-wrap rm-header-inner">
          <div>
            <p className="rm-eyebrow">Recruiter summary · reads in about 30 seconds</p>
            <h1 className="rm-name">{PERSONAL_INFO.name}</h1>
            <p className="rm-headline">{PERSONAL_INFO.role}</p>
            <p className="rm-meta">
              {PERSONAL_INFO.degree} · {PERSONAL_INFO.institution} · <strong>{PERSONAL_INFO.cgpa}</strong> ·{' '}
              {PERSONAL_INFO.location}
            </p>
          </div>
          <nav className="rm-actions" aria-label="Contact and links">
            <a className="rm-btn rm-btn-primary" href={PERSONAL_INFO.resumeUrl} target="_blank" rel="noreferrer">
              Resume (PDF)
            </a>
            <a className="rm-btn" href={`mailto:${PERSONAL_INFO.email}`}>
              Email
            </a>
            <a className="rm-btn" href={PERSONAL_INFO.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="rm-btn" href={PERSONAL_INFO.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <button className="rm-btn rm-btn-ghost rm-no-print" onClick={onEnterDesktop}>
              Enter the 3D desktop →
            </button>
          </nav>
        </div>
      </header>

      <main className="rm-wrap rm-main">
        <section className="rm-section" aria-labelledby="rm-featured">
          <h2 id="rm-featured" className="rm-h2">Featured projects</h2>
          <div className="rm-grid">
            {featured.map(project => (
              <article key={project.id} className="rm-card">
                <div className="rm-card-top">
                  <span className="rm-tag">{project.category}</span>
                  <span className="rm-year">{project.year}</span>
                </div>
                <h3 className="rm-card-title">{project.title}</h3>
                <p className="rm-card-text">{getCaseStudy(project.id)?.summary ?? project.description}</p>
                {getCaseStudy(project.id) ? (
                  <dl className="rm-results">
                    {getCaseStudy(project.id)!.results.slice(0, 3).map(result => (
                      <div key={result.label} className="rm-result">
                        <dt>{result.value}</dt>
                        <dd>{result.label}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <ul className="rm-list">
                    {project.features.slice(0, 3).map(feature => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                )}
                <div className="rm-chips">
                  {project.tech.slice(0, 6).map(t => (
                    <span key={t} className="rm-chip">{t}</span>
                  ))}
                </div>
                <RepoLiveLine repoName={project.repoStats?.repoName} />
                <div className="rm-card-actions rm-no-print">
                  <button className="rm-link-btn" onClick={() => onOpenProject(project.id)}>
                    Read case study →
                  </button>
                  {demoWindowFor(project.id) && (
                    <button className="rm-link-btn" onClick={() => onOpenApp(demoWindowFor(project.id)!)}>
                      Try live demo ▶
                    </button>
                  )}
                  {project.githubUrl && (
                    <a className="rm-link-btn" href={project.githubUrl} target="_blank" rel="noreferrer">
                      Repository ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          {others.length > 0 && (
            <div className="rm-others">
              <h3 className="rm-h3">More projects</h3>
              <ul className="rm-compact">
                {others.map(project => (
                  <li key={project.id}>
                    <button className="rm-inline-link" onClick={() => onOpenProject(project.id)}>
                      {project.title}
                    </button>
                    <span className="rm-muted"> — {getCaseStudy(project.id)?.summary ?? project.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <div className="rm-two-col">
          <section className="rm-section" aria-labelledby="rm-skills">
            <h2 id="rm-skills" className="rm-h2">Skills</h2>
            {skillGroups.map(group => (
              <div key={group.label} className="rm-skill-row">
                <span className="rm-skill-label">{group.label}</span>
                <div className="rm-chips">
                  {group.items.map(item => (
                    <span key={item} className="rm-chip">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="rm-section" aria-labelledby="rm-experience">
            <h2 id="rm-experience" className="rm-h2">Experience</h2>
            {EXPERIENCE_DATA.map(exp => (
              <div key={exp.company} className="rm-exp">
                <div className="rm-exp-head">
                  <strong>{exp.company}</strong>
                  <span className="rm-muted">{exp.period}</span>
                </div>
                <div className="rm-muted">{exp.role}</div>
                <p className="rm-card-text">{exp.achievements[0]}</p>
              </div>
            ))}
          </section>
        </div>

        <div className="rm-two-col">
          <section className="rm-section" aria-labelledby="rm-hackathons">
            <h2 id="rm-hackathons" className="rm-h2">Hackathon builds (2026)</h2>
            <ul className="rm-compact">
              {HACKATHONS_DATA.map(h => (
                <li key={h.event}>
                  <strong>{h.event}</strong>
                  <span className="rm-muted"> — {h.project}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rm-section" aria-labelledby="rm-education">
            <h2 id="rm-education" className="rm-h2">Education & certifications</h2>
            <ul className="rm-compact">
              {EDUCATION_DATA.map(ed => (
                <li key={ed.institution}>
                  <strong>{ed.degree}</strong>
                  <span className="rm-muted"> — {ed.institution} · {ed.score} · {ed.period}</span>
                </li>
              ))}
              {CERTIFICATIONS_DATA.map(cert => (
                <li key={cert.title}>
                  <strong>{cert.title}</strong>
                  <span className="rm-muted"> — {cert.issuer} · {cert.grade} · {cert.date}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="rm-wrap rm-footer">
        <span className="rm-muted">
          {PERSONAL_INFO.email} · {PERSONAL_INFO.location}
          {GITHUB_STATS_FETCHED_AT && ` · Repo stats synced from GitHub ${formatDate(GITHUB_STATS_FETCHED_AT)}`}
        </span>
        <span className="rm-footer-actions rm-no-print">
          <button className="rm-link-btn" onClick={() => window.print()}>
            Print / save as PDF
          </button>
          <button className="rm-link-btn" onClick={onEnterDesktop}>
            Enter the 3D desktop →
          </button>
        </span>
      </footer>
    </div>
  );
};

const RECRUITER_CSS = `
  .rm-page {
    min-height: 100vh;
    background: #f4f6f8;
    color: #1a1f26;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.55;
    overflow-y: auto;
    height: 100vh;
  }
  .rm-wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
  .rm-header { background: #0b2545; color: #f4f6f8; border-bottom: 4px solid #008080; }
  .rm-header-inner { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; padding-top: 36px; padding-bottom: 28px; flex-wrap: wrap; }
  .rm-eyebrow { margin: 0 0 6px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #8fd3d3; }
  .rm-name { margin: 0; font-size: 34px; line-height: 1.15; font-weight: 700; letter-spacing: -0.01em; }
  .rm-headline { margin: 4px 0 0; font-size: 17px; color: #d6e4f0; font-weight: 500; }
  .rm-meta { margin: 8px 0 0; font-size: 13px; color: #b5c7d8; max-width: 620px; }
  .rm-meta strong { color: #ffffff; }
  .rm-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .rm-btn { display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 6px; border: 1px solid #3d5a80; color: #f4f6f8; background: transparent; text-decoration: none; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
  .rm-btn:hover { background: #13315c; }
  .rm-btn:focus-visible, .rm-link-btn:focus-visible, .rm-inline-link:focus-visible { outline: 2px solid #ffca3a; outline-offset: 2px; }
  .rm-btn-primary { background: #ffca3a; border-color: #ffca3a; color: #0b2545; }
  .rm-btn-primary:hover { background: #ffd666; }
  .rm-btn-ghost { border-style: dashed; }
  .rm-main { padding-top: 28px; padding-bottom: 12px; }
  .rm-section { margin-bottom: 28px; }
  .rm-h2 { font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #3d5a80; margin: 0 0 12px; font-weight: 700; }
  .rm-h3 { font-size: 15px; margin: 0 0 8px; }
  .rm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 16px; }
  .rm-card { background: #ffffff; border: 1px solid #dde3ea; border-radius: 10px; padding: 18px; display: flex; flex-direction: column; gap: 10px; }
  .rm-card-top { display: flex; justify-content: space-between; align-items: center; }
  .rm-tag { font-size: 12px; font-weight: 600; color: #006d6d; background: #e3f4f4; padding: 2px 8px; border-radius: 999px; }
  .rm-year { font-size: 12px; color: #6b7785; }
  .rm-card-title { margin: 0; font-size: 17px; line-height: 1.3; }
  .rm-card-text { margin: 0; color: #3b4652; font-size: 14px; }
  .rm-list { margin: 0; padding-left: 18px; color: #3b4652; font-size: 13.5px; display: grid; gap: 4px; }
  .rm-results { margin: 0; display: grid; gap: 6px; }
  .rm-result { display: grid; grid-template-columns: minmax(64px, auto) 1fr; gap: 10px; align-items: baseline; }
  .rm-result dt { font-weight: 700; color: #0b2545; font-size: 15px; white-space: nowrap; }
  .rm-result dd { margin: 0; color: #3b4652; font-size: 13px; }
  .rm-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .rm-chip { font-size: 12px; background: #eef1f5; color: #2b3540; padding: 2px 8px; border-radius: 4px; }
  .rm-live { margin: 0; font-size: 12.5px; color: #2b6e3f; display: flex; align-items: center; gap: 6px; }
  .rm-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #2fa84f; display: inline-block; }
  .rm-card-actions { display: flex; gap: 14px; margin-top: auto; padding-top: 4px; flex-wrap: wrap; }
  .rm-link-btn { background: none; border: none; padding: 0; font: inherit; font-size: 14px; font-weight: 600; color: #0b5cad; cursor: pointer; text-decoration: none; }
  .rm-link-btn:hover { text-decoration: underline; }
  .rm-inline-link { background: none; border: none; padding: 0; font: inherit; font-weight: 600; color: #0b5cad; cursor: pointer; text-align: left; }
  .rm-inline-link:hover { text-decoration: underline; }
  .rm-others { margin-top: 18px; }
  .rm-compact { margin: 0; padding-left: 18px; display: grid; gap: 6px; font-size: 14px; }
  .rm-muted { color: #5d6875; }
  .rm-two-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 0 32px; }
  .rm-skill-row { display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 10px; align-items: start; }
  .rm-skill-label { font-size: 13px; font-weight: 600; color: #2b3540; padding-top: 2px; }
  .rm-exp { margin-bottom: 14px; }
  .rm-exp-head { display: flex; justify-content: space-between; gap: 8px; }
  .rm-footer { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding-top: 18px; padding-bottom: 36px; border-top: 1px solid #dde3ea; font-size: 13px; }
  .rm-footer-actions { display: flex; gap: 16px; }
  @media (max-width: 600px) {
    .rm-wrap { padding: 0 16px; }
    .rm-name { font-size: 28px; }
    .rm-skill-row { grid-template-columns: 1fr; gap: 4px; }
  }
  @media print {
    .rm-page { height: auto; overflow: visible; background: #ffffff; font-size: 12px; }
    .rm-header { background: #ffffff; color: #000000; border-bottom: 2px solid #000000; }
    .rm-headline, .rm-meta, .rm-eyebrow { color: #333333; }
    .rm-meta strong { color: #000000; }
    .rm-btn { color: #000000; border-color: #999999; }
    .rm-no-print { display: none !important; }
    .rm-card { break-inside: avoid; }
  }
`;
