import React, { useState, useEffect, lazy, Suspense } from 'react';
import { TopHUD } from './components/common/TopHUD';
import { CRTStartupBloom } from './components/common/CRTStartupBloom';
import { RecruiterMode } from './components/recruiter/RecruiterMode';
import { retroAudio } from './services/audio';
import { readInitialRoute, replaceUrl, projectPath, appPath, RECRUITER_PATH, type InitialRoute } from './lib/route';
import type { AppId, CameraViewMode } from './types/os';

// The 3D scene (three.js + R3F, ~1 MB) and the OS are code-split so the
// recruiter summary can load without downloading either of them.
const RetroDeskScene = lazy(() =>
  import('./components/scene/RetroDeskScene').then(m => ({ default: m.RetroDeskScene }))
);
const RetroDesktop = lazy(() =>
  import('./components/os/RetroDesktop').then(m => ({ default: m.RetroDesktop }))
);

type ExperienceMode = 'recruiter' | 'desktop';

export const App: React.FC = () => {
  const [initialRoute] = useState<InitialRoute>(readInitialRoute);

  const [mode, setMode] = useState<ExperienceMode>(
    initialRoute.kind === 'recruiter' ? 'recruiter' : 'desktop'
  );

  // The route the OS should honour when it mounts (deep link or recruiter hand-off)
  const [desktopRoute, setDesktopRoute] = useState<InitialRoute>(initialRoute);

  // Deep links go straight to the screen; mobile devices default to screen mode
  // for touch ergonomics; everyone else starts at the desk.
  const [viewMode, setViewMode] = useState<CameraViewMode>(() => {
    if (initialRoute.kind === 'project' || initialRoute.kind === 'app') return 'screen';
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
        return saved as 'off' | 'subtle' | 'authentic' | 'heavy';
      }
    }
    return 'authentic';
  });

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const isDesktopMode = mode === 'desktop';
  const isZoomedIn = viewMode === 'screen';

  // Play startup sound on first user interaction (desktop experience only)
  useEffect(() => {
    if (!isDesktopMode || hasInteracted) return;
    const handleFirstClick = () => {
      setHasInteracted(true);
      retroAudio.playStartup();
    };
    window.addEventListener('click', handleFirstClick, { once: true });
    return () => window.removeEventListener('click', handleFirstClick);
  }, [hasInteracted, isDesktopMode]);

  // Global keyboard shortcut: Escape steps back (Screen -> Desk -> Room)
  useEffect(() => {
    if (!isDesktopMode) return;
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
  }, [viewMode, isDesktopMode]);

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

  const openRecruiterMode = () => {
    setMode('recruiter');
    replaceUrl(RECRUITER_PATH);
    window.scrollTo(0, 0);
  };

  const enterDesktop = (route: InitialRoute = { kind: 'home' }) => {
    setDesktopRoute(route);
    if (route.kind === 'project') {
      setViewMode('screen');
      replaceUrl(projectPath(route.projectId));
    } else if (route.kind === 'app') {
      setViewMode('screen');
      replaceUrl(appPath(route.appId));
    } else {
      setViewMode(typeof window !== 'undefined' && window.innerWidth < 768 ? 'screen' : 'desk');
      replaceUrl('/');
    }
    setMode('desktop');
  };

  if (mode === 'recruiter') {
    return (
      <RecruiterMode
        onEnterDesktop={() => enterDesktop()}
        onOpenProject={(projectId: string) => enterDesktop({ kind: 'project', projectId })}
        onOpenApp={(appId: AppId) => enterDesktop({ kind: 'app', appId })}
      />
    );
  }

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
      <Suspense fallback={<SceneLoadingFallback />}>
        <RetroDeskScene
          viewMode={viewMode}
          onChangeView={setViewMode}
          isNightMode={isNightMode}
          onToggleLamp={toggleLamp}
          onHoverItem={setHoveredItem}
          onInteract={handleInteract}
        />
      </Suspense>

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
        <Suspense fallback={null}>
          <RetroDesktop
            onToggle3DMode={() => setViewMode('desk')}
            onOpenRecruiterMode={openRecruiterMode}
            initialRoute={desktopRoute}
            crtIntensity={crtIntensity}
            onChangeCrtIntensity={setCrtIntensity}
          />
        </Suspense>

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
          onOpenRecruiterMode={openRecruiterMode}
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

const SceneLoadingFallback: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#39ff14',
      fontFamily: 'var(--font-dos), monospace',
      fontSize: '18px',
      letterSpacing: '1px'
    }}
  >
    LOADING WORKSTATION...
  </div>
);

export default App;
