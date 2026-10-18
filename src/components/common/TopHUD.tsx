import React, { useState, useEffect } from 'react';
import { RetroIcon } from './RetroIcon';
import { retroAudio } from '../../services/audio';
import type { CameraViewMode } from '../../types/os';

interface TopHUDProps {
  viewMode: CameraViewMode;
  onChangeView: (mode: CameraViewMode) => void;
  isNightMode?: boolean;
  onToggleLamp?: () => void;
  hoveredItem?: string | null;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  viewMode,
  onChangeView,
  isNightMode = false,
  onToggleLamp = () => {},
  hoveredItem = null
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [isMuted, setIsMuted] = useState(retroAudio.isMuted());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const next = retroAudio.toggleMute();
    setIsMuted(next);
  };

  // CRITICAL REQUIREMENT: When inside the screen (focused on Windows 98 OS),
  // hide the TopHUD completely so it doesn't obstruct the desktop experience!
  if (viewMode === 'screen') {
    return null;
  }

  return (
    <>
      {/* Top Left Retro Workstation HUD */}
      <div className="top-hud-container">
        {/* Name pill */}
        <div
          style={{
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '2px 8px',
            border: '1px solid #333',
            alignSelf: 'flex-start',
            whiteSpace: 'nowrap'
          }}
        >
          JEEVESH BODHANI // WORKSTATION
        </div>

        {/* Role pill (hidden on mobile) */}
        <div
          className="hud-role-pill"
          style={{
            backgroundColor: '#000000',
            color: '#aaaaaa',
            padding: '2px 8px',
            border: '1px solid #333',
            alignSelf: 'flex-start',
            whiteSpace: 'nowrap'
          }}
        >
          AI & Computer Vision Engineer (CGPA: 9.6)
        </div>

        {/* Status / Controls pill */}
        <div
          style={{
            backgroundColor: '#000000',
            color: '#00ff66',
            padding: '2px 8px',
            border: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'flex-start',
            whiteSpace: 'nowrap'
          }}
        >
          <span>{timeStr}</span>

          {/* Sound Toggle */}
          <button
            id="hud-btn-sound"
            onClick={handleToggleSound}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isMuted ? '#ff5555' : '#00ff66',
              display: 'flex',
              alignItems: 'center',
              padding: '1px 3px'
            }}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label="Toggle Sound"
          >
            <RetroIcon name={isMuted ? 'sound-off' : 'sound-on'} size={14} />
          </button>

          {/* Lamp Study Mode Toggle */}
          <button
            id="hud-btn-daynight"
            onClick={() => {
              retroAudio.playLampClick();
              onToggleLamp();
            }}
            style={{
              background: isNightMode ? '#3a2e12' : '#222',
              border: isNightMode ? '1px solid #ffbe0b' : '1px solid #444',
              cursor: 'pointer',
              color: isNightMode ? '#ffbe0b' : '#cccccc',
              fontSize: '12px',
              fontFamily: 'inherit',
              padding: '1px 6px'
            }}
            title={isNightMode ? "Switch to Day Studio Mode" : "Turn on Desk Lamp (Night Study Mode)"}
          >
            {isNightMode ? '💡 Night' : '☀️ Day'}
          </button>

          {/* Camera View Switcher Buttons */}
          <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
            <button
              id="hud-btn-room"
              onClick={() => {
                retroAudio.playMouseDown();
                onChangeView('room');
              }}
              style={{
                background: viewMode === 'room' ? '#000080' : '#222',
                border: viewMode === 'room' ? '1px solid #5599ff' : '1px solid #444',
                color: viewMode === 'room' ? '#ffffff' : '#aaaaaa',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'inherit',
                padding: '1px 6px'
              }}
              title="Wide Room Panoramic Overview"
            >
              🛋️ Room
            </button>

            <button
              id="hud-btn-desk"
              onClick={() => {
                retroAudio.playMouseDown();
                onChangeView('desk');
              }}
              style={{
                background: viewMode === 'desk' ? '#000080' : '#222',
                border: viewMode === 'desk' ? '1px solid #5599ff' : '1px solid #444',
                color: viewMode === 'desk' ? '#ffffff' : '#aaaaaa',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'inherit',
                padding: '1px 6px'
              }}
              title="Workstation Desk View"
            >
              🪑 Desk
            </button>

            <button
              id="hud-btn-screen"
              onClick={() => {
                retroAudio.playMouseDown();
                onChangeView('screen');
              }}
              style={{
                background: '#222',
                border: '1px solid #444',
                color: '#00ff66',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'inherit',
                padding: '1px 6px'
              }}
              title="Zoom in to CRT Screen & Retro OS"
            >
              🖥️ Screen
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Floating Dynamic Hint / Object Tooltip */}
      <div
        onClick={() => {
          retroAudio.playMouseDown();
          onChangeView('screen');
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: hoveredItem ? 'rgba(0, 0, 128, 0.92)' : 'rgba(0, 0, 0, 0.88)',
          color: hoveredItem ? '#ffff55' : '#ffffff',
          padding: '7px 18px',
          fontFamily: 'var(--font-dos), monospace',
          fontSize: '14px',
          letterSpacing: '0.8px',
          border: hoveredItem ? '1px solid #ffff55' : '1px solid #555',
          cursor: 'pointer',
          zIndex: 9999999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          borderRadius: '2px',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap'
        }}
      >
        {hoveredItem ? (
          <span>{hoveredItem}</span>
        ) : (
          <span>[ 💡 Click objects to interact • Scroll wheel to zoom • Click CRT to enter ]</span>
        )}
      </div>

      <style>{`
        .top-hud-container {
          position: fixed;
          top: 14px;
          left: 14px;
          z-index: 9999999;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: var(--font-dos), monospace;
          font-size: 14px;
          letter-spacing: 0.8px;
        }

        @media (max-width: 768px) {
          .top-hud-container {
            top: 6px;
            left: 6px;
            right: 6px;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            background: rgba(0, 0, 0, 0.75);
            padding: 3px 6px;
            border-radius: 2px;
          }
          .hud-role-pill {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
