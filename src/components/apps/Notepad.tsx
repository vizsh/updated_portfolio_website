import React, { useState } from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { retroAudio } from '../../services/audio';

export const Notepad: React.FC = () => {
  const [content, setContent] = useState(PERSONAL_INFO.bioMonologue);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    retroAudio.playKeyStroke();
    const textarea = e.currentTarget;
    const textBefore = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
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
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}>F<u>o</u>rmat</span>
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}><u>H</u>elp</span>
      </div>

      {/* Textarea Monospace Editor */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyUp={handleKeyUp}
        onClick={e => {
          const textarea = e.currentTarget;
          const textBefore = textarea.value.substring(0, textarea.selectionStart);
          const lines = textBefore.split('\n');
          setCursorPos({ line: lines.length, col: lines[lines.length - 1].length + 1 });
        }}
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          outline: 'none',
          padding: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: '1.4',
          resize: 'none',
          background: '#ffffff',
          color: '#000000',
          whiteSpace: 'pre'
        }}
        spellCheck={false}
      />

      {/* Notepad Status Bar */}
      <div
        className="win-sunken"
        style={{
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 12px',
          fontSize: '11px',
          color: '#333',
          background: '#c0c0c0'
        }}
      >
        <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
      </div>
    </div>
  );
};
