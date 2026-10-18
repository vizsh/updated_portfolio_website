import React, { useState } from 'react';
import {
  PERSONAL_INFO,
  PROJECTS_DATA,
  EXPERIENCE_DATA,
  EDUCATION_DATA,
  CERTIFICATIONS_DATA
} from '../../data/portfolioData';
import { retroAudio } from '../../services/audio';

export const ResumeViewer: React.FC = () => {
  const [zoom, setZoom] = useState(100);

  const handlePrint = () => {
    retroAudio.playMouseDown();
    window.print();
  };

  const handleDownloadPdf = () => {
    retroAudio.playStartup();
    const link = document.createElement('a');
    link.href = '/Jeevesh_Bodhani_Resume.pdf';
    link.download = 'Jeevesh_Bodhani_Resume.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#808080' }}>
      {/* Viewer Toolbar */}
      <div
        className="win-outset"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          background: '#c0c0c0',
          borderBottom: '1px solid #000'
        }}
      >
        <button
          className="win-button"
          onClick={handleDownloadPdf}
          title="Download Official PDF Resume"
          style={{ fontWeight: 'bold' }}
        >
          💾 Download Official PDF
        </button>
        <button className="win-button" onClick={handlePrint} title="Print Document">
          🖨️ Print
        </button>
        <div style={{ width: '1px', height: '16px', background: '#808080', margin: '0 4px' }} />
        <button
          className="win-button"
          onClick={() => {
            retroAudio.playMouseDown();
            setZoom(z => Math.max(70, z - 10));
          }}
        >
          - Zoom
        </button>
        <span style={{ fontSize: '11px', minWidth: '40px', textAlign: 'center' }}>{zoom}%</span>
        <button
          className="win-button"
          onClick={() => {
            retroAudio.playMouseDown();
            setZoom(z => Math.min(150, z + 10));
          }}
        >
          + Zoom
        </button>
      </div>

      {/* Document Sheet Canvas */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          background: '#555555'
        }}
      >
        <div
          className="win-inset"
          style={{
            width: '100%',
            maxWidth: '720px',
            backgroundColor: '#ffffff',
            padding: '40px 48px',
            color: '#111111',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.45'
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: '2px solid #111', paddingBottom: '10px', marginBottom: '14px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 2px 0' }}>
              {PERSONAL_INFO.name}
            </h1>
            <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#333', margin: '0 0 4px 0' }}>
              Artificial Intelligence and Data Science
            </p>
            <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>
              {PERSONAL_INFO.location} &bull; {PERSONAL_INFO.email} &bull; {PERSONAL_INFO.phone} &bull; linkedin.com/in/jeeveshbodhani21
            </p>
          </div>

          {/* Objective Statement */}
          <p style={{ fontSize: '11px', lineHeight: '1.5', color: '#222', marginBottom: '14px', textAlign: 'justify' }}>
            B.Tech student in Artificial Intelligence and Data Science (<strong>Cumulative CGPA: 9.6</strong>) with hands-on experience
            building real-time computer vision systems, from model fine-tuning through to deployment. Strong foundation in Python,
            applied machine learning, and structured problem-solving, with a consistent track record across national-level hackathons
            and case competitions.
          </p>

          {/* Technical Skills */}
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '6px', color: '#000080' }}>
              Technical & Core Skills
            </h2>
            <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
              <div><strong>Programming Languages:</strong> {PERSONAL_INFO.skills.languages.join(', ')}</div>
              <div><strong>AI/ML & Computer Vision:</strong> {PERSONAL_INFO.skills.ai_ml.join(', ')}</div>
              <div><strong>Data & Systems:</strong> {PERSONAL_INFO.skills.data_systems.join(', ')}</div>
              <div><strong>Finance & Quantitative Analysis:</strong> {PERSONAL_INFO.skills.finance_quant.join(', ')}</div>
            </div>
          </div>

          {/* Domain-Specific Projects */}
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '6px', color: '#000080' }}>
              Domain-Specific Projects
            </h2>
            {PROJECTS_DATA.slice(0, 4).map(proj => (
              <div key={proj.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '12px', color: '#000' }}>{proj.title}</strong>
                  <span style={{ fontSize: '10px', fontStyle: 'italic', color: '#555' }}>{proj.year}</span>
                </div>
                <ul style={{ margin: '3px 0 3px 16px', fontSize: '11px', color: '#222', lineHeight: '1.4' }}>
                  {proj.features.slice(0, 3).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Professional Simulations */}
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '6px', color: '#000080' }}>
              Professional Experience & Simulations
            </h2>
            {EXPERIENCE_DATA.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '12px' }}>{exp.company} &mdash; {exp.role}</strong>
                  <span style={{ fontSize: '10px', color: '#666' }}>{exp.period}</span>
                </div>
                <ul style={{ margin: '2px 0 2px 16px', fontSize: '11px', color: '#222' }}>
                  {exp.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education */}
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '6px', color: '#000080' }}>
              Education
            </h2>
            {EDUCATION_DATA.map((edu, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <div>
                  <strong>{edu.institution}</strong> &mdash; {edu.degree} (<strong>{edu.score}</strong>)
                </div>
                <span style={{ color: '#666' }}>{edu.period}</span>
              </div>
            ))}
          </div>

          {/* Competitions & Certifications */}
          <div>
            <h2 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #333', paddingBottom: '2px', marginBottom: '6px', color: '#000080' }}>
              Certifications & Academic Honors
            </h2>
            <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
              {CERTIFICATIONS_DATA.map((c, i) => (
                <div key={i}>
                  &bull; <strong>{c.title}</strong> &mdash; {c.issuer} (<strong>{c.grade}</strong>, {c.date})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
