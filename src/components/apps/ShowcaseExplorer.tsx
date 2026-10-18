import React, { useState } from 'react';
import {
  PERSONAL_INFO,
  PROJECTS_DATA,
  EXPERIENCE_DATA,
  EDUCATION_DATA,
  CERTIFICATIONS_DATA
} from '../../data/portfolioData';
import { RetroIcon } from '../common/RetroIcon';
import { retroAudio } from '../../services/audio';

type Tab = 'overview' | 'projects' | 'experience' | 'education' | 'skills' | 'contact';

export const ShowcaseExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deepDiveProject, setDeepDiveProject] = useState<any | null>(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const categories = ['All', 'AI & Systems', 'Full-Stack', '3D & Graphics'];

  const filteredProjects = selectedCategory === 'All'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter(p => p.category === selectedCategory);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    retroAudio.playMouseDown();

    try {
      // Send message via Formspree or fallback
      const response = await fetch('https://formspree.io/f/xbjnqzzk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
          recipient: PERSONAL_INFO.email
        })
      });

      if (!response.ok) {
        // Fallback: trigger mailto link
        window.location.href = `mailto:${PERSONAL_INFO.email}?subject=Contact from ${encodeURIComponent(contactForm.name)}&body=${encodeURIComponent(contactForm.message + '\n\nSender Email: ' + contactForm.email)}`;
      }
    } catch {
      window.location.href = `mailto:${PERSONAL_INFO.email}?subject=Contact from ${encodeURIComponent(contactForm.name)}&body=${encodeURIComponent(contactForm.message + '\n\nSender Email: ' + contactForm.email)}`;
    }

    setIsSubmitting(false);
    setSubmittedMessage(true);
    retroAudio.playChord();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopiedEmail(true);
    retroAudio.playBeep(880, 0.08);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
      {/* Menu Bar */}
      <div
        className="win-outset"
        style={{
          display: 'flex',
          gap: '12px',
          padding: '2px 8px',
          borderBottom: '1px solid #808080',
          fontSize: '11px',
          background: '#c0c0c0'
        }}
      >
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}><u>F</u>ile</span>
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}><u>E</u>dit</span>
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}><u>V</u>iew</span>
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}><u>H</u>elp</span>
      </div>

      {/* Navigation & Address Bar */}
      <div
        className="win-outset"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          borderBottom: '1px solid #808080',
          background: '#c0c0c0'
        }}
      >
        <span style={{ fontSize: '11px', color: '#555' }}>Address</span>
        <div
          className="win-inset"
          style={{
            flex: 1,
            padding: '2px 6px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff'
          }}
        >
          <RetroIcon name="computer" size={14} />
          <span>C:\Showcase\{activeTab.toUpperCase()}{deepDiveProject ? `\\${deepDiveProject.id.toUpperCase()}` : ''}</span>
        </div>
      </div>

      {/* Main Workspace: Left Sidebar + Right Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Navigation Tree */}
        <div
          className="win-outset"
          style={{
            width: '180px',
            background: '#dfdfdf',
            borderRight: '2px solid #808080',
            padding: '8px 4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', color: '#444' }}>
            FOLDERS
          </div>

          {[
            { id: 'overview' as Tab, label: 'Overview', icon: 'computer' },
            { id: 'projects' as Tab, label: 'Projects', icon: 'folder' },
            { id: 'experience' as Tab, label: 'Experience & Sims', icon: 'resume' },
            { id: 'education' as Tab, label: 'Education & Certs', icon: 'document' },
            { id: 'skills' as Tab, label: 'Technical Skills', icon: 'terminal' },
            { id: 'contact' as Tab, label: 'Contact Transmission', icon: 'notepad' }
          ].map(tab => {
            const isCurrent = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  retroAudio.playMouseDown();
                  setActiveTab(tab.id);
                  setDeepDiveProject(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 6px',
                  cursor: 'pointer',
                  backgroundColor: isCurrent ? '#000080' : 'transparent',
                  color: isCurrent ? '#ffffff' : '#000000',
                  fontSize: '11px',
                  borderRadius: '1px'
                }}
              >
                <RetroIcon name={isCurrent && tab.icon === 'folder' ? 'folder-open' : (tab.icon as any)} size={16} />
                <span>{tab.label}</span>
              </div>
            );
          })}

          <div style={{ marginTop: 'auto', padding: '8px 4px', borderTop: '1px solid #aaa' }}>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>QUICK LINKS</div>
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#000080', textDecoration: 'none', marginBottom: '4px' }}
            >
              <span>&rarr;</span> GitHub Profile
            </a>
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#000080', textDecoration: 'none' }}
            >
              <span>&rarr;</span> LinkedIn Profile
            </a>
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#ffffff' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ borderBottom: '2px solid #000080', paddingBottom: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div>
                    <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-retro)', color: '#000080', margin: 0 }}>
                      {PERSONAL_INFO.name}
                    </h1>
                    <p style={{ fontSize: '13px', color: '#444', marginTop: '2px', fontWeight: 'bold' }}>
                      {PERSONAL_INFO.headline}
                    </p>
                    <p style={{ fontSize: '11px', color: '#666' }}>
                      {PERSONAL_INFO.degree} &bull; {PERSONAL_INFO.institution} &bull; <strong>{PERSONAL_INFO.cgpa}</strong>
                    </p>
                  </div>
                  <span className="win-sunken" style={{ padding: '4px 8px', fontSize: '11px', background: '#eef3ff', color: '#000080', fontWeight: 'bold' }}>
                    🏆 5x National Hackathon Champion
                  </span>
                </div>
              </div>

              {/* Bio Highlights Box */}
              <div
                className="win-outset"
                style={{ padding: '12px', background: '#f5f5f5', marginBottom: '16px', lineHeight: '1.5' }}
              >
                <h3 style={{ fontSize: '13px', marginBottom: '6px', color: '#000080' }}>Engineering Profile & Focus</h3>
                <p style={{ fontSize: '12px', color: '#222' }}>
                  B.Tech student in Artificial Intelligence and Data Science (<strong>CGPA: 9.6</strong>) with hands-on experience
                  building real-time computer vision systems, from custom model fine-tuning through to deployment. Strong foundation
                  in Python, applied machine learning, quantitative financial modeling, and structured problem-solving, with a consistent
                  track record across national hackathons and case competitions.
                </p>
              </div>

              {/* Quick Navigation Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div
                  className="win-outset"
                  style={{ padding: '10px', cursor: 'pointer' }}
                  onClick={() => {
                    retroAudio.playMouseDown();
                    setActiveTab('projects');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <RetroIcon name="folder" size={24} />
                    <strong style={{ fontSize: '13px', color: '#000080' }}>Projects ({PROJECTS_DATA.length})</strong>
                  </div>
                  <p style={{ fontSize: '11px', color: '#555' }}>
                    Inspect Kinesis AI (1st Place Drishti AI), CV defect inspection pipelines, and forecasting engines.
                  </p>
                </div>

                <div
                  className="win-outset"
                  style={{ padding: '10px', cursor: 'pointer' }}
                  onClick={() => {
                    retroAudio.playMouseDown();
                    setActiveTab('experience');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <RetroIcon name="resume" size={24} />
                    <strong style={{ fontSize: '13px', color: '#000080' }}>Experience & Sims</strong>
                  </div>
                  <p style={{ fontSize: '11px', color: '#555' }}>
                    JPMorgan Chase DCF modeling, Goldman Sachs quantitative risk management, and competitive team leadership.
                  </p>
                </div>

                <div
                  className="win-outset"
                  style={{ padding: '10px', cursor: 'pointer' }}
                  onClick={() => {
                    retroAudio.playMouseDown();
                    setActiveTab('education');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <RetroIcon name="document" size={24} />
                    <strong style={{ fontSize: '13px', color: '#000080' }}>Education & Certs</strong>
                  </div>
                  <p style={{ fontSize: '11px', color: '#555' }}>
                    D.J. Sanghvi 9.6 CGPA, NYIF / Google Cloud 100% Grade, IIT Bombay 93%, Meta 92%.
                  </p>
                </div>
              </div>

              {/* Hackathon Wins Callout */}
              <fieldset style={{ border: '2px groove #fff', padding: '12px', background: '#fafafa' }}>
                <legend style={{ padding: '0 6px', fontWeight: 'bold', color: '#000080' }}>
                  Recent National Hackathon & Case Study Titles
                </legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                  <div className="win-sunken" style={{ padding: '6px', fontSize: '11px', background: '#ffffff' }}>
                    🥇 <strong>1st Place</strong> - Drishti AI Hackathon (Kinesis AI)
                  </div>
                  <div className="win-sunken" style={{ padding: '6px', fontSize: '11px', background: '#ffffff' }}>
                    🥇 <strong>1st Place</strong> - Sathaye College Hackathon (Zenith)
                  </div>
                  <div className="win-sunken" style={{ padding: '6px', fontSize: '11px', background: '#ffffff' }}>
                    🥇 <strong>1st Place</strong> - HackOut Hackathon
                  </div>
                  <div className="win-sunken" style={{ padding: '6px', fontSize: '11px', background: '#ffffff' }}>
                    🥇 <strong>1st Place</strong> - PCCOE Hacktopia National Hackathon
                  </div>
                  <div className="win-sunken" style={{ padding: '6px', fontSize: '11px', background: '#ffffff' }}>
                    🥇 <strong>1st Place</strong> - NMFC TechTatva (X-Ray Fault Classifier)
                  </div>
                  <div className="win-sunken" style={{ padding: '6px', fontSize: '11px', background: '#ffffff' }}>
                    🥉 <strong>3rd Place</strong> - PCCOE Craftverse (Jarvis Hedge Fund)
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === 'projects' && (
            <div>
              {/* Deep Dive Modal View if selected */}
              {deepDiveProject ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    className="win-button"
                    onClick={() => {
                      retroAudio.playMouseDown();
                      setDeepDiveProject(null);
                    }}
                    style={{ alignSelf: 'flex-start', padding: '3px 10px', fontSize: '11px' }}
                  >
                    &larr; Back to Projects Explorer
                  </button>

                  <div className="win-outset" style={{ padding: '16px', background: '#fafafa' }}>
                    <div style={{ borderBottom: '2px solid #000080', paddingBottom: '6px', marginBottom: '12px' }}>
                      <span className="win-sunken" style={{ fontSize: '10px', padding: '2px 6px', background: '#dfdfdf' }}>
                        {deepDiveProject.category} &bull; {deepDiveProject.year}
                      </span>
                      <h2 style={{ fontSize: '18px', color: '#000080', margin: '6px 0 2px 0' }}>
                        {deepDiveProject.title}
                      </h2>
                      <p style={{ fontSize: '12px', color: '#555' }}>{deepDiveProject.tagline}</p>
                    </div>

                    {deepDiveProject.repoStats && (
                      <div
                        className="win-sunken"
                        style={{
                          padding: '10px 14px',
                          background: '#071018',
                          color: '#39ff14',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          marginBottom: '14px',
                          display: 'flex',
                          gap: '16px',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          border: '1px solid #1a3a5a'
                        }}
                      >
                        <div>COMMITS: <strong style={{ color: '#ffffff' }}>{deepDiveProject.repoStats.commits}</strong></div>
                        {deepDiveProject.repoStats.tests && (
                          <div>TESTS: <strong style={{ color: '#75b798' }}>{deepDiveProject.repoStats.tests}</strong></div>
                        )}
                        {deepDiveProject.repoStats.verifiedBadge && (
                          <div>VERIFICATION: <strong style={{ color: '#85d7ff' }}>{deepDiveProject.repoStats.verifiedBadge}</strong></div>
                        )}
                        <div>
                          REPO: <a href={deepDiveProject.githubUrl} target="_blank" rel="noreferrer" style={{ color: '#ffca3a', textDecoration: 'underline' }}>
                            {deepDiveProject.repoStats.repoName}
                          </a>
                        </div>
                      </div>
                    )}

                    {deepDiveProject.deepDive && (
                      <>
                        <h4 style={{ fontSize: '13px', color: '#000080', marginBottom: '4px' }}>System Overview & Problem Solved</h4>
                        <p style={{ fontSize: '12px', lineHeight: '1.5', color: '#222', marginBottom: '14px' }}>
                          {deepDiveProject.deepDive.overview}
                        </p>

                        <h4 style={{ fontSize: '13px', color: '#000080', marginBottom: '6px' }}>Pipeline Architecture Flow</h4>
                        <div className="win-inset" style={{ padding: '12px', background: '#0a101d', color: '#39ff14', fontFamily: 'monospace', fontSize: '12px', marginBottom: '14px' }}>
                          {deepDiveProject.deepDive.architecture.map((step: string, sIdx: number) => (
                            <div key={sIdx} style={{ marginBottom: '6px' }}>
                              [{sIdx + 1}] {step}
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                          <div className="win-sunken" style={{ flex: 1, minWidth: '200px', padding: '8px', background: '#eef3ff' }}>
                            <strong style={{ fontSize: '11px', color: '#000080', display: 'block' }}>Key Benchmark:</strong>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{deepDiveProject.deepDive.benchmark}</span>
                          </div>
                        </div>

                        <h4 style={{ fontSize: '13px', color: '#000080', marginBottom: '6px' }}>Engineering Highlights:</h4>
                        <ul style={{ margin: '0 0 14px 20px', fontSize: '12px', color: '#333', lineHeight: '1.5' }}>
                          {deepDiveProject.deepDive.highlights.map((h: string, hIdx: number) => (
                            <li key={hIdx}>{h}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <a
                        href={deepDiveProject.githubUrl || PERSONAL_INFO.github}
                        target="_blank"
                        rel="noreferrer"
                        className="win-button"
                        style={{ padding: '4px 14px', textDecoration: 'none', color: '#000', fontSize: '11px' }}
                      >
                        Inspect Repository on GitHub
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* Projects List */
                <div>
                  {/* Category Pills */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        className={`win-button ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => {
                          retroAudio.playMouseDown();
                          setSelectedCategory(cat);
                        }}
                        style={{ fontSize: '11px', padding: '3px 10px' }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filteredProjects.map(proj => (
                      <div
                        key={proj.id}
                        className="win-outset"
                        style={{ padding: '12px', background: '#fafafa' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                          <div>
                            <h3 style={{ fontSize: '14px', color: '#000080', fontWeight: 'bold', margin: 0 }}>
                              {proj.title}
                            </h3>
                            <p style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                              {proj.tagline} &bull; {proj.year}
                            </p>
                          </div>
                          <span
                            className="win-sunken"
                            style={{ padding: '2px 6px', fontSize: '10px', background: '#dfdfdf' }}
                          >
                            {proj.category}
                          </span>
                        </div>

                        <p style={{ fontSize: '12px', color: '#222', margin: '8px 0', lineHeight: '1.4' }}>
                          {proj.description}
                        </p>

                        {/* Features list */}
                        <ul style={{ margin: '6px 0 10px 18px', fontSize: '11px', color: '#444' }}>
                          {proj.features.map((feat, i) => (
                            <li key={i}>{feat}</li>
                          ))}
                        </ul>

                        {/* Repository Test & Commit Metrics */}
                        {proj.repoStats && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', margin: '6px 0', flexWrap: 'wrap' }}>
                            <span className="win-sunken" style={{ background: '#000', color: '#39ff14', fontSize: '10px', padding: '2px 6px', fontFamily: 'monospace' }}>
                              commits: {proj.repoStats.commits}
                            </span>
                            {proj.repoStats.tests && (
                              <span className="win-sunken" style={{ background: '#0a3622', color: '#75b798', fontSize: '10px', padding: '2px 6px', fontFamily: 'monospace' }}>
                                tests: {proj.repoStats.tests}
                              </span>
                            )}
                            {proj.repoStats.verifiedBadge && (
                              <span className="win-sunken" style={{ background: '#002b36', color: '#85d7ff', fontSize: '10px', padding: '2px 6px', fontFamily: 'monospace' }}>
                                {proj.repoStats.verifiedBadge}
                              </span>
                            )}
                            <span style={{ fontSize: '10px', color: '#555' }}>
                              {proj.repoStats.highlights}
                            </span>
                          </div>
                        )}

                        {/* Tech Badges */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '8px 0' }}>
                          {proj.tech.map(t => (
                            <span
                              key={t}
                              className="win-sunken"
                              style={{
                                fontSize: '10px',
                                padding: '1px 5px',
                                background: '#e0e0e0',
                                fontFamily: 'monospace'
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          {proj.deepDive && (
                            <button
                              className="win-button"
                              onClick={() => {
                                retroAudio.playMouseDown();
                                setDeepDiveProject(proj);
                              }}
                              style={{ fontSize: '11px', padding: '3px 10px' }}
                            >
                              🔍 View Architecture & Deep Dive
                            </button>
                          )}
                          <a
                            href={proj.githubUrl || PERSONAL_INFO.github}
                            target="_blank"
                            rel="noreferrer"
                            className="win-button"
                            style={{ fontSize: '11px', padding: '3px 10px', textDecoration: 'none', color: '#000' }}
                          >
                            GitHub Repo &rarr;
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {EXPERIENCE_DATA.map((exp, idx) => (
                <div key={idx} className="win-outset" style={{ padding: '12px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', borderBottom: '1px solid #c0c0c0', paddingBottom: '6px' }}>
                    <div>
                      <h3 style={{ fontSize: '13px', color: '#000080', margin: 0 }}>{exp.role}</h3>
                      <strong style={{ fontSize: '12px', color: '#111' }}>{exp.company}</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#555' }}>{exp.period} | {exp.location}</span>
                  </div>

                  <ul style={{ margin: '8px 0 8px 18px', fontSize: '11px', color: '#333', lineHeight: '1.5' }}>
                    {exp.achievements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>

                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {exp.tech.map(t => (
                      <span key={t} className="win-sunken" style={{ fontSize: '10px', padding: '1px 5px' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: EDUCATION & CERTIFICATIONS */}
          {activeTab === 'education' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '14px', color: '#000080', marginBottom: '8px' }}>Formal Academic Education</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {EDUCATION_DATA.map((edu, idx) => (
                    <div key={idx} className="win-outset" style={{ padding: '10px', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '12px', color: '#000080' }}>{edu.institution}</strong>
                        <span style={{ fontSize: '11px', color: '#666' }}>{edu.period}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#222', marginTop: '2px' }}>
                        {edu.degree} &bull; <strong style={{ color: '#000080' }}>{edu.score}</strong>
                      </div>
                      {edu.highlights.map((h, i) => (
                        <p key={i} style={{ fontSize: '11px', color: '#555', margin: '4px 0 0 0' }}>&bull; {h}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', color: '#000080', marginBottom: '8px' }}>Professional Certifications & Honors</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                  {CERTIFICATIONS_DATA.map((cert, idx) => (
                    <div key={idx} className="win-sunken" style={{ padding: '8px', background: '#ffffff' }}>
                      <strong style={{ fontSize: '11px', color: '#000080', display: 'block' }}>{cert.title}</strong>
                      <span style={{ fontSize: '11px', color: '#444' }}>{cert.issuer}</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px' }}>
                        <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{cert.grade}</span>
                        <span style={{ color: '#888' }}>{cert.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SKILLS */}
          {activeTab === 'skills' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {Object.entries(PERSONAL_INFO.skills).map(([group, list]) => (
                <div key={group} className="win-outset" style={{ padding: '10px', background: '#fafafa' }}>
                  <h3 style={{ fontSize: '12px', color: '#000080', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {group.replace('_', ' ')}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {list.map(skill => (
                      <div
                        key={skill}
                        className="win-sunken"
                        style={{ padding: '3px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span style={{ color: '#008000', fontWeight: 'bold' }}>&#10003;</span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: CONTACT */}
          {activeTab === 'contact' && (
            <div style={{ maxWidth: '520px' }}>
              <div className="win-outset" style={{ padding: '14px', background: '#fafafa' }}>
                <h3 style={{ fontSize: '14px', color: '#000080', marginBottom: '6px' }}>Direct Contact Transmission</h3>
                <p style={{ fontSize: '11px', color: '#555', marginBottom: '12px' }}>
                  Send a message directly to <strong>{PERSONAL_INFO.name}</strong> ({PERSONAL_INFO.email}).
                </p>

                {/* Quick copy email box */}
                <div
                  className="win-sunken"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: '#eef3ff',
                    marginBottom: '14px'
                  }}
                >
                  <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{PERSONAL_INFO.email}</span>
                  <button
                    className="win-button"
                    onClick={handleCopyEmail}
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                  >
                    {copiedEmail ? 'Copied!' : 'Copy Email'}
                  </button>
                </div>

                {submittedMessage ? (
                  <div className="win-inset" style={{ padding: '16px', textAlign: 'center', background: '#e8f5e9' }}>
                    <h4 style={{ color: '#2e7d32', marginBottom: '4px' }}>Transmission Sent Successfully!</h4>
                    <p style={{ fontSize: '12px' }}>
                      Thank you. Your message has been safely transmitted to Jeevesh Bodhani.
                    </p>
                    <button
                      className="win-button"
                      onClick={() => setSubmittedMessage(false)}
                      style={{ marginTop: '10px', padding: '3px 10px', fontSize: '11px' }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Your Name:</label>
                      <input
                        className="win-inset"
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '12px' }}
                        placeholder="Ada Lovelace"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Email Address:</label>
                      <input
                        className="win-inset"
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '12px' }}
                        placeholder="ada@computing.org"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Message:</label>
                      <textarea
                        className="win-inset"
                        required
                        rows={4}
                        value={contactForm.message}
                        onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '12px', resize: 'vertical' }}
                        placeholder="Hi Jeevesh, I saw your Kinesis AI project and would love to connect..."
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="submit"
                        className="win-button"
                        disabled={isSubmitting}
                        style={{ padding: '4px 16px', fontWeight: 'bold' }}
                      >
                        {isSubmitting ? 'Transmitting...' : 'Transmit Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
