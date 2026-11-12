import React from 'react';
import type { CaseStudy, PipelineStage } from '../../data/caseStudies';
import type { AppId } from '../../types/os';
import { retroAudio } from '../../services/audio';

const h4: React.CSSProperties = { fontSize: '13px', color: '#000080', margin: '14px 0 6px 0' };
const list: React.CSSProperties = { margin: '0 0 4px 18px', fontSize: '11.5px', color: '#333', lineHeight: '1.55' };

/** Left-to-right flow of numbered stages that wraps on narrow windows. */
export const PipelineDiagram: React.FC<{ stages: PipelineStage[] }> = ({ stages }) => (
  <div
    role="list"
    aria-label="Architecture pipeline"
    style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: '6px 0' }}
  >
    {stages.map((stage, i) => (
      <div key={stage.label} role="listitem" style={{ display: 'flex', alignItems: 'center' }}>
        <div
          className="win-outset"
          style={{
            width: '132px',
            minHeight: '74px',
            padding: '6px 7px',
            background: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                background: '#000080',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 'bold',
                minWidth: '15px',
                height: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'monospace'
              }}
            >
              {i + 1}
            </span>
            <strong style={{ fontSize: '11px', color: '#000080' }}>{stage.label}</strong>
          </div>
          <span style={{ fontSize: '10px', color: '#444', lineHeight: '1.35' }}>{stage.detail}</span>
        </div>
        {i < stages.length - 1 && (
          <span aria-hidden="true" style={{ color: '#000080', fontWeight: 'bold', fontSize: '13px', padding: '0 3px' }}>
            ▶
          </span>
        )}
      </div>
    ))}
  </div>
);

interface CaseStudyViewProps {
  study: CaseStudy;
  /** Window that demos this project, when one exists. */
  demoWindow?: AppId;
  onOpenDemo?: (appId: AppId) => void;
}

export const CaseStudyView: React.FC<CaseStudyViewProps> = ({ study, demoWindow, onOpenDemo }) => (
  <div>
    <div
      className="win-sunken"
      style={{ padding: '8px 10px', background: '#eef3ff', fontSize: '12px', color: '#000040', lineHeight: '1.5' }}
    >
      <strong>In one line:</strong> {study.summary}
      {demoWindow && onOpenDemo && (
        <div style={{ marginTop: '8px' }}>
          <button
            className="win-button"
            onClick={() => {
              retroAudio.playMouseDown();
              onOpenDemo(demoWindow);
            }}
            style={{ fontSize: '11px', padding: '3px 12px', fontWeight: 'bold' }}
          >
            ▶ Try the live demo in your browser
          </button>
        </div>
      )}
    </div>

    <h4 style={h4}>1. Problem</h4>
    <p style={{ fontSize: '12px', color: '#222', lineHeight: '1.55', margin: 0 }}>{study.problem}</p>

    <h4 style={h4}>2. Constraints</h4>
    <ul style={list}>
      {study.constraints.map(c => (
        <li key={c}>{c}</li>
      ))}
    </ul>

    <h4 style={h4}>3. Architecture</h4>
    <PipelineDiagram stages={study.pipeline} />

    <h4 style={h4}>4. Key decisions</h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {study.decisions.map(d => (
        <div key={d.choice} className="win-sunken" style={{ padding: '6px 8px', background: '#ffffff', fontSize: '11.5px' }}>
          <strong style={{ color: '#000080' }}>{d.choice}</strong>
          <span style={{ color: '#444' }}> — {d.why}</span>
        </div>
      ))}
    </div>

    <h4 style={h4}>5. Results</h4>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
      {study.results.map(r => (
        <div
          key={r.label}
          className="win-sunken"
          style={{ padding: '8px', background: '#071018', color: '#39ff14', display: 'flex', flexDirection: 'column', gap: '3px' }}
        >
          <span style={{ fontFamily: 'var(--font-dos), monospace', fontSize: '22px', lineHeight: 1 }}>{r.value}</span>
          <span style={{ fontSize: '10px', color: '#b8c7b8', lineHeight: '1.35' }}>{r.label}</span>
        </div>
      ))}
    </div>

    <h4 style={h4}>6. Honest limits (what doesn&apos;t work yet)</h4>
    <ul style={{ ...list, listStyle: 'none', marginLeft: 0, padding: 0 }}>
      {study.limits.map(l => (
        <li key={l} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
          <span aria-hidden="true" style={{ color: '#b36b00' }}>⚠</span>
          <span>{l}</span>
        </li>
      ))}
    </ul>

    <h4 style={h4}>7. What I&apos;d do next</h4>
    <ul style={list}>
      {study.next.map(n => (
        <li key={n}>{n}</li>
      ))}
    </ul>

    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #c0c0c0', fontSize: '10.5px', color: '#555' }}>
      Sources (from the repository itself):{' '}
      {study.sources.map((s, i) => (
        <React.Fragment key={s.url}>
          {i > 0 && ' · '}
          <a href={s.url} target="_blank" rel="noreferrer" style={{ color: '#000080' }}>
            {s.label} ↗
          </a>
        </React.Fragment>
      ))}
    </div>
  </div>
);
