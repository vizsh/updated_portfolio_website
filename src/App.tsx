import React, { useState, useEffect } from 'react';
import { RetroDeskScene } from './components/scene/RetroDeskScene';
import { RetroDesktop } from './components/os/RetroDesktop';
import { TopHUD } from './components/common/TopHUD';
import { CRTStartupBloom } from './components/common/CRTStartupBloom';
import { retroAudio } from './services/audio';
import type { CameraViewMode } from './types/os';

export const App: React.FC = () => {
  // Mobile devices default to screen mode for optimal touch ergonomics
  const [viewMode, setViewMode] = useState<CameraViewMode>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'screen' : 'desk';
    }
    return 'desk';
  });

  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retro_study_night_mode');
      return saved === 'true';
    }
    return false;
  });

  const [crtIntensity, setCrtIntensity] = useState<'off' | 'subtle' | 'authentic' | 'heavy'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retro_crt_intensity');
      if (saved && ['off', 'subtle', 'authentic', 'heavy'].includes(saved)) {
        return saved as any;
      }
    }
    return 'authentic';
  });

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const isZoomedIn = viewMode === 'screen';

  // Play startup sound on first user interaction
  useEffect(() => {
    const handleFirstClick = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        retroAudio.playStartup();
      }
    };
    window.addEventListener('click', handleFirstClick, { once: true });
    return () => window.removeEventListener('click', handleFirstClick);
  }, [hasInteracted]);

  // Global keyboard shortcut: Escape steps back (Screen -> Desk -> Room)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'screen') {
          retroAudio.playMouseDown();
          setViewMode('desk');
        } else if (viewMode === 'desk') {
          retroAudio.playMouseDown();
          setViewMode('room');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  const toggleLamp = () => {
    setIsNightMode(prev => {
      const next = !prev;
      localStorage.setItem('retro_study_night_mode', next ? 'true' : 'false');
      return next;
    });
  };

  const handleInteract = (msg: string) => {
    setToastMessage(msg);
  };

  // Auto-dismiss interaction toast after 2.6s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <main
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#030508'
      }}
    >
      {/* 1. Physical 3D Room & Entrance Desk Scene */}
      <RetroDeskScene
        viewMode={viewMode}
        onChangeView={setViewMode}
        isNightMode={isNightMode}
        onToggleLamp={toggleLamp}
        onHoverItem={setHoveredItem}
        onInteract={handleInteract}
      />

      {/* 2. Interactive Retro Windows 98 Operating System Layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: isZoomedIn ? 1 : 0,
          pointerEvents: isZoomedIn ? 'auto' : 'none',
          transition: 'opacity 0.4s ease-in-out',
          zIndex: 100
        }}
      >
        <RetroDesktop
          onToggle3DMode={() => setViewMode('desk')}
          crtIntensity={crtIntensity}
          onChangeCrtIntensity={setCrtIntensity}
        />

        {/* Authentic CRT Scanline & Phosphor Vignette Overlay */}
        <div className={`crt-overlay crt-${crtIntensity}`} />

        {/* CRT Turn-on Phosphor Bloom Line */}
        <CRTStartupBloom isActive={isZoomedIn} />
      </div>

      {/* 3. Top Left HUD Overlay - Automatically hidden when entering the screen */}
      {viewMode !== 'screen' && (
        <TopHUD
          viewMode={viewMode}
          onChangeView={setViewMode}
          isNightMode={isNightMode}
          onToggleLamp={toggleLamp}
          hoveredItem={hoveredItem}
        />
      )}

      {/* 4. Quick Exit / Step Back Button when in Screen Mode */}
      {viewMode === 'screen' && (
        <div
          style={{
            position: 'fixed',
            top: '8px',
            right: '12px',
            zIndex: 9999999
          }}
        >
          <button
            id="btn-exit-screen"
            className="win-button"
            onClick={() => {
              retroAudio.playMouseDown();
              setViewMode('desk');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-retro), sans-serif',
              fontWeight: 'bold',
              background: '#c0c0c0',
              color: '#000080',
              cursor: 'pointer',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
            }}
            title="Step back to 3D Desk View (Esc)"
          >
            <span style={{ fontSize: '13px' }}>🛋️</span>
            <span>Step Back to Desk</span>
          </button>
        </div>
      )}

      {/* 5. Desk Interaction Toast Notification */}
      {toastMessage && viewMode !== 'screen' && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#000080',
            color: '#ffff55',
            padding: '8px 18px',
            fontFamily: 'var(--font-dos), monospace',
            fontSize: '14px',
            letterSpacing: '0.8px',
            border: '2px solid #ffffff',
            boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.7)',
            zIndex: 99999999,
            pointerEvents: 'none',
            animation: 'toastPop 0.25s ease-out'
          }}
        >
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes toastPop {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </main>
  );
};

export default App;
