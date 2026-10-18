import React, { useState, useEffect, useRef } from 'react';
import type { WindowState, AppId } from '../../types/os';
import { RetroIcon } from '../common/RetroIcon';
import type { RetroIconType } from '../common/RetroIcon';
import { retroAudio } from '../../services/audio';

interface TaskbarProps {
  windows: Record<AppId, WindowState>;
  activeWindowId: AppId | null;
  onSelectWindow: (id: AppId) => void;
  onOpenApp: (id: AppId) => void;
  onShutdown: () => void;
  onToggle3DMode: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  onSelectWindow,
  onOpenApp,
  onShutdown,
  onToggle3DMode
}) => {
  const [startOpen, setStartOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [isMuted, setIsMuted] = useState(retroAudio.isMuted());
  const startMenuRef = useRef<HTMLDivElement>(null);

  // Update clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close Start Menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(e.target as Node)) {
        setStartOpen(false);
      }
    };
    if (startOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [startOpen]);

  const toggleSound = () => {
    const next = retroAudio.toggleMute();
    setIsMuted(next);
  };

  const openWindowsList = (Object.values(windows) as WindowState[]).filter(w => w.isOpen);

  return (
    <>
      {/* Start Menu Popup */}
      {startOpen && (
        <div
          ref={startMenuRef}
          className="win-outset"
          style={{
            position: 'absolute',
            bottom: 'var(--taskbar-height)',
            left: 0,
            width: '240px',
            zIndex: 1000000,
            display: 'flex',
            boxShadow: '4px 4px 10px rgba(0,0,0,0.5)'
          }}
        >
          {/* Vertical Blue Branding Stripe */}
          <div
            style={{
              width: '32px',
              background: 'linear-gradient(180deg, #000080 0%, #1084d0 100%)',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '12px 6px',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '15px',
              letterSpacing: '2px',
              fontFamily: 'var(--font-retro)'
            }}
          >
            Windows<span style={{ fontWeight: 'normal', color: '#ffca3a' }}>98</span>
          </div>

          {/* Menu Items List */}
          <div style={{ flex: 1, padding: '4px 2px' }}>
            <div
              className="start-menu-item"
              onClick={() => {
                retroAudio.playMouseDown();
                onOpenApp('showcase');
                setStartOpen(false);
              }}
            >
              <RetroIcon name="computer" size={24} />
              <span>My Showcase</span>
            </div>

            <div
              className="start-menu-item"
              onClick={() => {
                retroAudio.playMouseDown();
                onOpenApp('projects');
                setStartOpen(false);
              }}
            >
              <RetroIcon name="folder" size={24} />
              <span>Projects Explorer</span>
            </div>

            <div
              className="start-menu-item"
              onClick={() => {
                retroAudio.playMouseDown();
                onOpenApp('about');
                setStartOpen(false);
              }}
            >
              <RetroIcon name="notepad" size={24} />
              <span>About Me.txt</span>
            </div>

            <div
              className="start-menu-item"
              onClick={() => {
                retroAudio.playMouseDown();
                onOpenApp('terminal');
                setStartOpen(false);
              }}
            >
              <RetroIcon name="terminal" size={24} />
              <span>MS-DOS Prompt</span>
            </div>

            <div
              className="start-menu-item"
              onClick={() => {
                retroAudio.playMouseDown();
                onOpenApp('minesweeper');
                setStartOpen(false);
              }}
            >
              <RetroIcon name="minesweeper" size={24} />
              <span>Minesweeper</span>
            </div>

            <div
              className="start-menu-item"
              onClick={() => {
                retroAudio.playMouseDown();
                onOpenApp('snake');
                setStartOpen(false);
              }}
            >
              <RetroIcon name="snake" size={24} />
              <span>Snake.exe</span>
            </div>

            <div
              className="start-menu-item"
              onClick={() => {
                retroAudio.playMouseDown();
                onOpenApp('player');
                setStartOpen(false);
              }}
            >
              <RetroIcon name="player" size={24} />
              <span>Media Player</span>
            </div>

            <div
              className="start-menu-item"
              onClick={() => {
                retroAudio.playMouseDown();
                onOpenApp('displayProperties');
                setStartOpen(false);
              }}
            >
              <RetroIcon name="display" size={24} />
              <span>Display Properties</span>
            </div>

            <div style={{ height: '1px', background: '#808080', margin: '4px 2px', borderBottom: '1px solid #ffffff' }} />

            <div
              className="start-menu-item"
              onClick={() => {
                retroAudio.playMouseDown();
                onToggle3DMode();
                setStartOpen(false);
              }}
            >
              <RetroIcon name="restore" size={24} />
              <span>Step Back to 3D Desk</span>
            </div>

            <div
              className="start-menu-item"
              onClick={() => {
                retroAudio.playMouseDown();
                onShutdown();
                setStartOpen(false);
              }}
            >
              <RetroIcon name="shutdown" size={24} />
              <span>Shut Down...</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Taskbar Container */}
      <div
        className="win-outset"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'var(--taskbar-height)',
          zIndex: 999990,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 4px',
          gap: '4px'
        }}
      >
        {/* Left Side: Start Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '100%' }}>
          <button
            className={`win-button ${startOpen ? 'active' : ''}`}
            onClick={() => {
              retroAudio.playMouseDown();
              setStartOpen(!startOpen);
            }}
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              fontWeight: 'bold',
              minWidth: '68px'
            }}
            aria-label="Start Menu"
          >
            {/* Windows 98 4-color flag */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" fill="#e63946" />
              <rect x="8" y="2" width="5" height="5" fill="#457b9d" />
              <rect x="2" y="8" width="5" height="5" fill="#2a9d8f" />
              <rect x="8" y="8" width="5" height="5" fill="#e9c46a" />
            </svg>
            <span>Start</span>
          </button>

          {/* Quick-Launch divider line */}
          <div style={{ width: '2px', height: '70%', background: '#808080', borderRight: '1px solid #ffffff', margin: '0 2px' }} />

          {/* Open Windows Pills */}
          <div
            style={{
              display: 'flex',
              gap: '3px',
              overflowX: 'auto',
              maxHeight: '100%',
              scrollbarWidth: 'none'
            }}
          >
            {openWindowsList.map(w => {
              const isSelected = activeWindowId === w.id && !w.isMinimized;
              return (
                <button
                  key={w.id}
                  className={`win-button ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    retroAudio.playMouseDown();
                    onSelectWindow(w.id);
                  }}
                  style={{
                    height: '100%',
                    maxWidth: '160px',
                    minWidth: '90px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'left'
                  }}
                  title={w.title}
                >
                  <RetroIcon name={w.icon as RetroIconType} size={16} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {w.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: System Tray with Audio & Clock */}
        <div
          className="win-sunken"
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 8px',
            whiteSpace: 'nowrap'
          }}
        >
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#000000',
              padding: '2px'
            }}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            aria-label="Toggle Sound"
          >
            <RetroIcon name={isMuted ? 'sound-off' : 'sound-on'} size={16} />
          </button>

          {/* Step Back to 3D Desk Button */}
          <button
            id="taskbar-btn-desk"
            onClick={() => {
              retroAudio.playMouseDown();
              onToggle3DMode();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '11px',
              fontFamily: 'var(--font-pixel)',
              color: '#000080',
              padding: '2px 4px',
              fontWeight: 'bold'
            }}
            title="Step Back to 3D Desk Scene (Esc)"
          >
            🛋️ Desk
          </button>

          {/* Real-time Clock */}
          <span style={{ fontSize: '11px', fontWeight: '500' }}>
            {timeStr}
          </span>
        </div>
      </div>

      <style>{`
        .start-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          cursor: pointer;
          font-size: 12px;
          font-family: var(--font-retro);
        }
        .start-menu-item:hover {
          background-color: #000080;
          color: #ffffff;
        }
      `}</style>
    </>
  );
};
