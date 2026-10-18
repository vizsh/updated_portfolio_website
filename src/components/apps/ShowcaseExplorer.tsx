import React, { useState } from 'react';
import {
  PERSONAL_INFO,
  PROJECTS_DATA,
  EXPERIENCE_DATA,
  HACKATHONS_DATA,
  EDUCATION_DATA,
  CERTIFICATIONS_DATA
} from '../../data/portfolioData';
import { RetroIcon } from '../common/RetroIcon';
import { retroAudio } from '../../services/audio';

type Tab = 'overview' | 'projects' | 'experience' | 'hackathons' | 'education' | 'skills' | 'contact';

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
            width: '185px',
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
            { id: 'projects' as Tab, label: 'Projects (Repos & Tests)', icon: 'folder' },
            { id: 'experience' as Tab, label: 'Experience & Sims (2026)', icon: 'resume' },
            { id: 'hackathons' as Tab, label: 'Hackathons & Builds (2026)', icon: 'terminal' },
            { id: 'education' as Tab, label: 'Education & Certs', icon: 'document' },
            { id: 'skills' as Tab, label: 'Technical Skills', icon: 'display' },
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
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
                    💻 AI & Data Science Engineering • Class of 2028
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
                  B.Tech student in Artificial Intelligence and Data Science (<strong>CGPA: 9.6</strong>) with practical experience
                  building real-time computer vision systems, from custom model fine-tuning through to deployment. Strong foundation
                  in Python, applied machine learning, quantitative financial modeling, and structured problem-solving across collaborative
                  engineering builds in 2026.
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
                    Inspect 6 verified repositories, commit iteration depth, and passing test suites.
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
                    <strong style={{ fontSize: '13px', color: '#000080' }}>Experience & Sims (2026)</strong>
                  </div>
                  <p style={{ fontSize: '11px', color: '#555' }}>
                    JPMorgan Chase DCF modeling & Goldman Sachs quantitative risk management simulations.
                  </p>
                </div>

                <div
                  className="win-outset"
                  style={{ padding: '10px', cursor: 'pointer' }}
                  onClick={() => {
                    retroAudio.playMouseDown();
                    setActiveTab('hackathons');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <RetroIcon name="terminal" size={24} />
                    <strong style={{ fontSize: '13px', color: '#000080' }}>Hackathons & Builds (2026)</strong>
                  </div>
                  <p style={{ fontSize: '11px', color: '#555' }}>
                    Drishti AI, PCCOE Craftverse, Smart India Hackathon, and medical ML prototypes.
                  </p>
                </div>
              </div>

              {/* Collaborative Builds Callout */}
              <fieldset style={{ border: '2px groove #fff', padding: '12px', background: '#fafafa' }}>
                <legend style={{ padding: '0 6px', fontWeight: 'bold', color: '#000080', fontSize: '12px' }}>
                  Collaborative Engineering Builds (2026)
                </legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                  {HACKATHONS_DATA.map((h, i) => (
                    <div key={i} className="win-sunken" style={{ padding: '8px', fontSize: '11px', background: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ color: '#000080' }}>{h.event}</strong>
                        <span style={{ fontSize: '10px', color: '#666', background: '#eee', padding: '1px 4px' }}>{h.year}</span>
                      </div>
                      <div style={{ fontWeight: '500', color: '#222', marginBottom: '3px' }}>{h.project}</div>
                      <p style={{ margin: 0, color: '#555', fontSize: '10.5px', lineHeight: '1.3' }}>{h.summary}</p>
                    </div>
                  ))}
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
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ color: '#85d7ff', fontWeight: 'bold' }}>
                            REPO: {deepDiveProject.repoStats.repoName}
                          </span>
                          <span style={{ color: '#ffff55' }}>
                            COMMITS: {deepDiveProject.repoStats.commits}
                          </span>
                        </div>
                        <div>TEST SUITE: {deepDiveProject.repoStats.tests}</div>
                        <div>STATUS: {deepDiveProject.repoStats.verifiedBadge}</div>
                        <div style={{ color: '#aaaaaa', fontSize: '10px' }}>
                          KEY METRICS: {deepDiveProject.repoStats.highlights}
                        </div>
                      </div>
                    )}

                    <h4 style={{ fontSize: '13px', color: '#000080', marginBottom: '4px' }}>System Overview</h4>
                    <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.5', marginBottom: '12px' }}>
                      {deepDiveProject.deepDive.overview}
                    </p>

                    <h4 style={{ fontSize: '13px', color: '#000080', marginBottom: '4px' }}>Modular Architecture</h4>
                    <ul style={{ margin: '0 0 12px 18px', fontSize: '11px', color: '#444', lineHeight: '1.6' }}>
                      {deepDiveProject.deepDive.architecture.map((arch: string, i: number) => (
                        <li key={i}>{arch}</li>
                      ))}
                    </ul>

                    <h4 style={{ fontSize: '13px', color: '#000080', marginBottom: '4px' }}>Benchmark Verification</h4>
                    <div className="win-sunken" style={{ padding: '8px', background: '#f0f0f0', fontSize: '11px', marginBottom: '12px', color: '#222' }}>
                      <strong>Audit Benchmark:</strong> {deepDiveProject.deepDive.benchmark}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={deepDiveProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="win-button"
                        style={{ padding: '4px 12px', fontSize: '11px', textDecoration: 'none', color: '#000080', fontWeight: 'bold' }}
                      >
                        📂 View GitHub Repository ↗
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
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
                        <ul style={{ margin: '6px 0 8px 18px', fontSize: '11px', color: '#444' }}>
                          {proj.features.map((feat, i) => (
                            <li key={i}>{feat}</li>
                          ))}
                        </ul>

                        {/* Repository, Commit Count & Test Passed Index Card */}
                        {proj.repoStats && (
                          <div
                            className="win-sunken"
                            style={{
                              padding: '8px 10px',
                              background: '#f0f4f8',
                              border: '1px solid #c0c0c0',
                              margin: '8px 0',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  color: '#000080',
                                  textDecoration: 'none',
                                  fontFamily: 'monospace'
                                }}
                              >
                                <span>📁</span> {proj.repoStats.repoName} ↗
                              </a>
                              <span style={{ fontSize: '10px', color: '#666' }}>{proj.year}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span
                                className="win-sunken"
                                style={{
                                  background: '#071018',
                                  color: '#39ff14',
                                  fontSize: '10px',
                                  padding: '2px 7px',
                                  fontFamily: 'monospace',
                                  fontWeight: 'bold'
                                }}
                              >
                                Commits: {proj.repoStats.commits}
                              </span>

                              {proj.repoStats.tests && (
                                <span
                                  className="win-sunken"
                                  style={{
                                    background: '#0a3622',
                                    color: '#75b798',
                                    fontSize: '10px',
                                    padding: '2px 7px',
                                    fontFamily: 'monospace',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  Tests Passed: {proj.repoStats.tests}
                                </span>
                              )}

                              {proj.repoStats.verifiedBadge && (
                                <span
                                  className="win-sunken"
                                  style={{
                                    background: '#002b36',
                                    color: '#85d7ff',
                                    fontSize: '10px',
                                    padding: '2px 7px',
                                    fontFamily: 'monospace'
                                  }}
                                >
                                  {proj.repoStats.verifiedBadge}
                                </span>
                              )}
                            </div>

                            {proj.repoStats.highlights && (
                              <div style={{ fontSize: '10.5px', color: '#555', fontStyle: 'italic' }}>
                                &bull; {proj.repoStats.highlights}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tech Badges */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '6px 0' }}>
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

          {/* TAB 3: EXPERIENCE & JOB SIMS */}
          {activeTab === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="win-outset" style={{ padding: '10px 12px', background: '#f5f5f5' }}>
                <h3 style={{ fontSize: '13px', color: '#000080', margin: '0 0 4px 0' }}>
                  Institutional Job Simulations (2026)
                </h3>
                <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>
                  Structured quantitative finance and risk analysis modeling completed in 2026.
                </p>
              </div>

              {EXPERIENCE_DATA.map((exp, idx) => (
                <div key={idx} className="win-outset" style={{ padding: '12px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', borderBottom: '1px solid #c0c0c0', paddingBottom: '6px', gap: '6px' }}>
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

          {/* TAB 4: HACKATHONS & COLLABORATIVE BUILDS */}
          {activeTab === 'hackathons' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="win-outset" style={{ padding: '10px 12px', background: '#f5f5f5' }}>
                <h3 style={{ fontSize: '13px', color: '#000080', margin: '0 0 4px 0' }}>
                  Engineering Hackathons & Collaborative Builds (2026)
                </h3>
                <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>
                  Focused, time-constrained engineering sprints solving technical problems across computer vision, quantitative finance, and distributed systems.
                </p>
              </div>

              {HACKATHONS_DATA.map((h, idx) => (
                <div key={idx} className="win-outset" style={{ padding: '12px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', borderBottom: '1px solid #c0c0c0', paddingBottom: '6px', gap: '6px' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', color: '#000080', margin: 0, fontWeight: 'bold' }}>
                        {h.project}
                      </h4>
                      <strong style={{ fontSize: '11px', color: '#333' }}>{h.event}</strong>
                    </div>
                    <span className="win-sunken" style={{ fontSize: '10px', padding: '2px 6px', background: '#dfdfdf' }}>
                      {h.year}
                    </span>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#222', margin: '8px 0', lineHeight: '1.4' }}>
                    {h.summary}
                  </p>

                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '6px 0' }}>
                    {h.tech.map(t => (
                      <span key={t} className="win-sunken" style={{ fontSize: '10px', padding: '1px 5px', background: '#e0e0e0', fontFamily: 'monospace' }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {h.githubUrl && (
                    <div style={{ marginTop: '6px' }}>
                      <a
                        href={h.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="win-button"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', fontSize: '11px', textDecoration: 'none', color: '#000080' }}
                      >
                        <span>📂</span> View Code Repository ↗
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: EDUCATION & CERTIFICATIONS */}
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
                <h3 style={{ fontSize: '14px', color: '#000080', marginBottom: '8px' }}>Professional Certifications & Coursework (2026)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {CERTIFICATIONS_DATA.map((cert, idx) => (
                    <div key={idx} className="win-outset" style={{ padding: '8px 12px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <strong style={{ fontSize: '12px', color: '#000080' }}>{cert.title}</strong>
                        <p style={{ fontSize: '11px', color: '#555', margin: '2px 0 0 0' }}>{cert.issuer}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="win-sunken" style={{ fontSize: '10px', padding: '2px 6px', background: '#e0ffe0', color: '#006600', fontWeight: 'bold' }}>
                          {cert.grade}
                        </span>
                        <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{cert.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TECHNICAL SKILLS */}
          {activeTab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="win-outset" style={{ padding: '12px', background: '#fafafa' }}>
                <h3 style={{ fontSize: '13px', color: '#000080', marginBottom: '8px' }}>Languages & Core Stack</h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {PERSONAL_INFO.skills.languages.map(s => (
                    <span key={s} className="win-sunken" style={{ padding: '3px 8px', fontSize: '11px', background: '#ffffff' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="win-outset" style={{ padding: '12px', background: '#fafafa' }}>
                <h3 style={{ fontSize: '13px', color: '#000080', marginBottom: '8px' }}>AI, Computer Vision & Deep Learning</h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {PERSONAL_INFO.skills.ai_ml.map(s => (
                    <span key={s} className="win-sunken" style={{ padding: '3px 8px', fontSize: '11px', background: '#ffffff', color: '#000080', fontWeight: 'bold' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="win-outset" style={{ padding: '12px', background: '#fafafa' }}>
                <h3 style={{ fontSize: '13px', color: '#000080', marginBottom: '8px' }}>Full-Stack & Data Engineering Systems</h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {PERSONAL_INFO.skills.data_systems.map(s => (
                    <span key={s} className="win-sunken" style={{ padding: '3px 8px', fontSize: '11px', background: '#ffffff' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="win-outset" style={{ padding: '12px', background: '#fafafa' }}>
                <h3 style={{ fontSize: '13px', color: '#000080', marginBottom: '8px' }}>Financial & Quantitative Modeling</h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {PERSONAL_INFO.skills.finance_quant.map(s => (
                    <span key={s} className="win-sunken" style={{ padding: '3px 8px', fontSize: '11px', background: '#ffffff' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CONTACT TRANSMISSION */}
          {activeTab === 'contact' && (
            <div style={{ maxWidth: '520px' }}>
              <div className="win-outset" style={{ padding: '16px', background: '#fafafa' }}>
                <h3 style={{ fontSize: '14px', color: '#000080', marginBottom: '6px' }}>Direct Communication Channel</h3>
                <p style={{ fontSize: '11px', color: '#555', marginBottom: '14px' }}>
                  Transmit a dispatch directly to Jeevesh Bodhani. Alternatively, copy the address or connect via LinkedIn.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button
                    className="win-button"
                    onClick={handleCopyEmail}
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>📋</span> {copiedEmail ? 'Copied to Clipboard!' : `Copy: ${PERSONAL_INFO.email}`}
                  </button>
                </div>

                {submittedMessage ? (
                  <div className="win-sunken" style={{ padding: '14px', background: '#e8ffe8', color: '#006600', fontSize: '12px' }}>
                    <strong>✓ Transmission Dispatched Successfully!</strong>
                    <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#333' }}>
                      Thank you for getting in touch. I will respond to your transmission promptly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px', color: '#333' }}>Your Name:</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                        className="win-inset"
                        style={{ width: '100%', padding: '4px 6px', fontSize: '12px', background: '#ffffff' }}
                        placeholder="e.g. Dr. Ada Lovelace"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px', color: '#333' }}>Your Email:</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                        className="win-inset"
                        style={{ width: '100%', padding: '4px 6px', fontSize: '12px', background: '#ffffff' }}
                        placeholder="e.g. ada@analytical-engine.org"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px', color: '#333' }}>Transmission Content:</label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.message}
                        onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                        className="win-inset"
                        style={{ width: '100%', padding: '4px 6px', fontSize: '12px', background: '#ffffff', resize: 'vertical' }}
                        placeholder="Enter your message or opportunity details here..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="win-button"
                      style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', alignSelf: 'flex-start', marginTop: '4px' }}
                    >
                      {isSubmitting ? 'Transmitting...' : 'Send Transmission &rarr;'}
                    </button>
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
