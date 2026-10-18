import React, { useState } from 'react';
import { RetroIcon } from '../common/RetroIcon';
import { retroAudio } from '../../services/audio';

interface ShutdownDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ShutdownDialog: React.FC<ShutdownDialogProps> = ({ isOpen, onCancel, onConfirm }) => {
  const [selectedOption, setSelectedOption] = useState<'shutdown' | 'restart'>('shutdown');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 2000000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="win-outset"
        style={{
          width: '320px',
          padding: '3px',
          boxShadow: '4px 4px 16px rgba(0,0,0,0.6)'
        }}
      >
        {/* Title Bar */}
        <div className="win-titlebar">
          <span>Shut Down Windows</span>
          <button
            className="win-ctrl-btn"
            onClick={onCancel}
            aria-label="Close Dialog"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <RetroIcon name="computer" size={36} />
          <div style={{ flex: 1, fontSize: '12px' }}>
            <p style={{ marginBottom: '12px' }}>What would you like the computer to do?</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shutdown_opt"
                  checked={selectedOption === 'shutdown'}
                  onChange={() => setSelectedOption('shutdown')}
                />
                <span>Shut down</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shutdown_opt"
                  checked={selectedOption === 'restart'}
                  onChange={() => setSelectedOption('restart')}
                />
                <span>Restart</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '8px 12px',
            borderTop: '1px solid #808080'
          }}
        >
          <button
            className="win-button"
            onClick={() => {
              retroAudio.playMouseDown();
              onConfirm();
            }}
            style={{ minWidth: '70px' }}
          >
            OK
          </button>
          <button
            className="win-button"
            onClick={() => {
              retroAudio.playMouseDown();
              onCancel();
            }}
            style={{ minWidth: '70px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const SafeToTurnOffScreen: React.FC<{ onReboot: () => void }> = ({ onReboot }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        zIndex: 3000000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ff8800',
        fontFamily: 'var(--font-retro), serif',
        textAlign: 'center',
        padding: '24px'
      }}
    >
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 'normal',
          letterSpacing: '1px',
          marginBottom: '24px',
          textShadow: '0 0 10px #ff8800'
        }}
      >
        It's now safe to turn off<br />your computer.
      </h1>

      <button
        className="win-button"
        onClick={() => {
          retroAudio.playStartup();
          onReboot();
        }}
        style={{
          marginTop: '16px',
          fontSize: '13px',
          padding: '6px 16px'
        }}
      >
        🔄 Restart System
      </button>
    </div>
  );
};
