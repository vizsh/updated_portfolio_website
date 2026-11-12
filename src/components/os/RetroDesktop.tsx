import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import type { AppId, WindowState, Position, Size } from '../../types/os';
import { DesktopGrid } from './DesktopGrid';
import { Taskbar } from './Taskbar';
import { RetroWindow } from './RetroWindow';
import { DesktopContextMenu } from './DesktopContextMenu';
import { ShowcaseExplorer } from '../apps/ShowcaseExplorer';
import { Notepad } from '../apps/Notepad';
import { Terminal } from '../apps/Terminal';
import { Minesweeper } from '../apps/Minesweeper';
import { SnakeGame } from '../apps/SnakeGame';
import { DisplayProperties, WALLPAPERS, type WallpaperOption } from '../apps/DisplayProperties';
import { ResumeViewer } from '../apps/ResumeViewer';
import { MediaPlayer } from '../apps/MediaPlayer';
import { RecycleBin } from '../apps/RecycleBin';
import { VideoPlayer } from '../apps/VideoPlayer';
import { JarvisApp } from '../apps/JarvisApp';
import { AskJeeveshApp } from '../apps/AskJeeveshApp';

// Heavy demos (ML runtimes, extra WebGL contexts) load only when their window opens.
const DrishtiApp = lazy(() => import('../apps/DrishtiApp').then(m => ({ default: m.DrishtiApp })));
const NeuroScopeApp = lazy(() => import('../apps/NeuroScopeApp').then(m => ({ default: m.NeuroScopeApp })));

const AppLoading: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000000',
      color: '#39ff14',
      fontFamily: 'var(--font-dos), monospace',
      fontSize: '16px'
    }}
  >
    LOADING {label}...
  </div>
);
import { ShutdownDialog, SafeToTurnOffScreen } from './ShutdownDialog';
import { retroAudio } from '../../services/audio';
import type { InitialRoute } from '../../lib/route';

const INITIAL_WINDOWS: Record<AppId, WindowState> = {
  showcase: {
    id: 'showcase',
    title: 'My Showcase - Portfolio Explorer',
    icon: 'computer',
    isOpen: true, // Opened by default so visitors see content right away
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 40, y: 30 },
    size: { width: 720, height: 500 },
    minSize: { width: 340, height: 260 }
  },
  projects: {
    id: 'projects',
    title: 'Projects Explorer',
    icon: 'folder',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 9,
    position: { x: 70, y: 50 },
    size: { width: 680, height: 480 },
    minSize: { width: 320, height: 240 }
  },
  about: {
    id: 'about',
    title: 'About_Me.txt - Notepad',
    icon: 'notepad',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 8,
    position: { x: 100, y: 70 },
    size: { width: 560, height: 380 },
    minSize: { width: 280, height: 200 }
  },
  resume: {
    id: 'resume',
    title: 'Resume.pdf - Document Viewer',
    icon: 'resume',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    position: { x: 120, y: 40 },
    size: { width: 660, height: 520 },
    minSize: { width: 320, height: 260 }
  },
  terminal: {
    id: 'terminal',
    title: 'MS-DOS Prompt',
    icon: 'terminal',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 6,
    position: { x: 90, y: 90 },
    size: { width: 580, height: 360 },
    minSize: { width: 300, height: 200 }
  },
  minesweeper: {
    id: 'minesweeper',
    title: 'Minesweeper',
    icon: 'minesweeper',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 5,
    position: { x: 140, y: 110 },
    size: { width: 280, height: 340 },
    minSize: { width: 260, height: 320 }
  },
  snake: {
    id: 'snake',
    title: 'Snake.exe',
    icon: 'snake',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 5,
    position: { x: 130, y: 70 },
    size: { width: 400, height: 490 },
    minSize: { width: 320, height: 420 }
  },
  player: {
    id: 'player',
    title: 'Media Player v2.1',
    icon: 'player',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 4,
    position: { x: 160, y: 130 },
    size: { width: 360, height: 380 },
    minSize: { width: 320, height: 320 }
  },
  recycleBin: {
    id: 'recycleBin',
    title: 'Recycle Bin',
    icon: 'recycle-full',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 3,
    position: { x: 180, y: 80 },
    size: { width: 520, height: 340 },
    minSize: { width: 300, height: 220 }
  },
  displayProperties: {
    id: 'displayProperties',
    title: 'Display Properties',
    icon: 'display',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 6,
    position: { x: 150, y: 50 },
    size: { width: 440, height: 450 },
    minSize: { width: 340, height: 380 }
  },
  videoDemo: {
    id: 'videoDemo',
    title: 'ActiveMovie - Jeevesh_Bodhani_Portfolio_Splits.mp4',
    icon: 'video',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    position: { x: 100, y: 40 },
    size: { width: 640, height: 490 },
    minSize: { width: 360, height: 320 }
  },
  jarvis: {
    id: 'jarvis',
    title: 'JARVIS.exe - Deterministic Finance',
    icon: 'jarvis',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    position: { x: 110, y: 30 },
    size: { width: 660, height: 540 },
    minSize: { width: 340, height: 320 }
  },
  drishti: {
    id: 'drishti',
    title: 'Drishti.exe - Privacy-First Behaviour Monitor',
    icon: 'eye',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    position: { x: 70, y: 20 },
    size: { width: 800, height: 580 },
    minSize: { width: 420, height: 380 }
  },
  neuroscope: {
    id: 'neuroscope',
    title: 'NeuroScope3D.exe - Segmentation Viewer (Synthetic Phantom)',
    icon: 'brain',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    position: { x: 90, y: 24 },
    size: { width: 820, height: 600 },
    minSize: { width: 440, height: 400 }
  },
  ask: {
    id: 'ask',
    title: 'Ask Jeevesh - Portfolio Assistant',
    icon: 'chat',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    position: { x: 200, y: 36 },
    size: { width: 440, height: 560 },
    minSize: { width: 300, height: 360 }
  }
};

/** Shrink and shift a window so it fits inside the current viewport (above the taskbar). */
const fitBounds = (win: WindowState): Pick<WindowState, 'position' | 'size'> => {
  if (typeof window === 'undefined') return { position: win.position, size: win.size };
  const width = Math.min(win.size.width, window.innerWidth - 16);
  const height = Math.min(win.size.height, window.innerHeight - 56);
  return {
    size: { width, height },
    position: {
      x: Math.max(0, Math.min(win.position.x, window.innerWidth - width - 8)),
      y: Math.max(0, Math.min(win.position.y, window.innerHeight - height - 48))
    }
  };
};

/** Window the deep link should bring to the front, if any. */
const routeTargetWindow = (route: InitialRoute): AppId | null => {
  if (route.kind === 'project') return 'showcase';
  if (route.kind === 'app') return route.appId;
  return null;
};

/** Apply a deep link to the boot-time window layout. */
const windowsForRoute = (route: InitialRoute): Record<AppId, WindowState> => {
  const target = routeTargetWindow(route);
  if (!target) return INITIAL_WINDOWS;
  return {
    ...INITIAL_WINDOWS,
    [target]: {
      ...INITIAL_WINDOWS[target],
      ...fitBounds(INITIAL_WINDOWS[target]),
      isOpen: true,
      isMinimized: false,
      zIndex: 11
    }
  };
};

interface RetroDesktopProps {
  onToggle3DMode: () => void;
  onOpenRecruiterMode?: () => void;
  initialRoute?: InitialRoute;
  crtIntensity?: 'off' | 'subtle' | 'authentic' | 'heavy';
  onChangeCrtIntensity?: (intensity: 'off' | 'subtle' | 'authentic' | 'heavy') => void;
}

export const RetroDesktop: React.FC<RetroDesktopProps> = ({
  onToggle3DMode,
  onOpenRecruiterMode,
  initialRoute = { kind: 'home' },
  crtIntensity = 'authentic',
  onChangeCrtIntensity
}) => {
  const [windows, setWindows] = useState<Record<AppId, WindowState>>(() => windowsForRoute(initialRoute));
  const [activeWindowId, setActiveWindowId] = useState<AppId | null>(
    () => routeTargetWindow(initialRoute) ?? 'showcase'
  );
  // Stacking counter in a ref: several raises in one event (focus, then open) each get a fresh z.
  const zCounter = useRef(routeTargetWindow(initialRoute) ? 11 : 10);
  const nextZ = () => ++zCounter.current;
  const initialProjectId = initialRoute.kind === 'project' ? initialRoute.projectId : undefined;
  // Opening a case study from another app (e.g. a chat citation) remounts the Showcase on that project.
  const [showcaseTarget, setShowcaseTarget] = useState<{ projectId: string; nonce: number } | null>(null);
  const showcaseProjectId = showcaseTarget?.projectId ?? initialProjectId;
  const [showShutdownDialog, setShowShutdownDialog] = useState(false);
  const [isShutDown, setIsShutDown] = useState(false);

  // Wallpaper state
  const [wallpaper, setWallpaper] = useState<WallpaperOption>(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('retro_wallpaper_id');
      const found = WALLPAPERS.find(w => w.id === savedId);
      if (found) return found;
    }
    return WALLPAPERS[0];
  });

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0
  });

  // Desktop refresh flicker state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-adapt window sizes to viewport on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setWindows(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          const key = k as AppId;
          next[key] = {
            ...next[key],
            position: { x: 4, y: 38 },
            size: {
              width: window.innerWidth - 8,
              height: window.innerHeight - 84
            }
          };
        });
        return next;
      });
    }
  }, []);

  // Bring window to top focus
  const focusWindow = (id: AppId) => {
    setActiveWindowId(id);
    const z = nextZ();
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: z, isMinimized: false }
    }));
  };

  // Open an app with smart mobile snap
  const openApp = (id: AppId) => {
    retroAudio.playMouseDown();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const z = nextZ();

    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        zIndex: z,
        ...(isMobile
          ? {
              position: { x: 4, y: 38 },
              size: { width: window.innerWidth - 8, height: window.innerHeight - 84 }
            }
          : prev[id].isOpen
            ? {}
            : fitBounds(prev[id]))
      }
    }));
    setActiveWindowId(id);
  };

  // Open the Showcase straight onto one project's case study
  const openProject = (projectId: string) => {
    setShowcaseTarget({ projectId, nonce: Date.now() });
    openApp('showcase');
  };

  // Close a window
  const closeWindow = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
    if (activeWindowId === id) {
      const remainingOpen = (Object.values(windows) as WindowState[]).filter(w => w.isOpen && w.id !== id);
      if (remainingOpen.length > 0) {
        const nextActive = remainingOpen.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), remainingOpen[0]);
        setActiveWindowId(nextActive.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  // Minimize a window
  const minimizeWindow = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));
    if (activeWindowId === id) {
      const remaining = (Object.values(windows) as WindowState[]).filter(w => w.isOpen && !w.isMinimized && w.id !== id);
      if (remaining.length > 0) {
        const next = remaining.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), remaining[0]);
        setActiveWindowId(next.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  // Toggle maximize
  const toggleMaximize = (id: AppId) => {
    setWindows(prev => {
      const current = prev[id];
      if (current.isMaximized) {
        // Restore pre-maximized dimensions
        return {
          ...prev,
          [id]: {
            ...current,
            isMaximized: false,
            position: current.preMaxSize ? current.preMaxSize.position : current.position,
            size: current.preMaxSize ? current.preMaxSize.size : current.size
          }
        };
      } else {
        // Save bounds before maximizing
        return {
          ...prev,
          [id]: {
            ...current,
            isMaximized: true,
            preMaxSize: { position: current.position, size: current.size }
          }
        };
      }
    });
  };

  // Update bounds from ghost drag/resize
  const updateWindowBounds = (id: AppId, pos: Position, size: Size) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], position: pos, size }
    }));
  };

  // Toggle window from taskbar pill
  const handleSelectTaskbarWindow = (id: AppId) => {
    const win = windows[id];
    if (win.isMinimized) {
      focusWindow(id);
    } else if (activeWindowId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  // Context Menu handler on background
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  // Desktop Refresh handler
  const handleRefresh = () => {
    retroAudio.playDegauss();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 220);
  };

  if (isShutDown) {
    return <SafeToTurnOffScreen onReboot={() => setIsShutDown(false)} />;
  }

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: wallpaper.backgroundStyle,
        backgroundColor: wallpaper.color,
        overflow: 'hidden',
        opacity: isRefreshing ? 0.75 : 1,
        transition: 'opacity 0.08s ease'
      }}
    >
      {/* Desktop Marquee Shortcut Grid */}
      <DesktopGrid onOpenApp={openApp} />

      {/* Render All Open Windows */}
      {/* 1. Showcase Explorer */}
      <RetroWindow
        window={windows.showcase}
        isActive={activeWindowId === 'showcase'}
        onFocus={() => focusWindow('showcase')}
        onClose={() => closeWindow('showcase')}
        onMinimize={() => minimizeWindow('showcase')}
        onMaximizeToggle={() => toggleMaximize('showcase')}
        onUpdateBounds={(pos, size) => updateWindowBounds('showcase', pos, size)}
      >
        <ShowcaseExplorer
          key={showcaseTarget?.nonce ?? 'boot'}
          onOpenApp={openApp}
          initialTab={showcaseProjectId ? 'projects' : 'overview'}
          initialProjectId={showcaseProjectId}
        />
      </RetroWindow>

      {/* 2. Projects Explorer (Folder View) */}
      <RetroWindow
        window={windows.projects}
        isActive={activeWindowId === 'projects'}
        onFocus={() => focusWindow('projects')}
        onClose={() => closeWindow('projects')}
        onMinimize={() => minimizeWindow('projects')}
        onMaximizeToggle={() => toggleMaximize('projects')}
        onUpdateBounds={(pos, size) => updateWindowBounds('projects', pos, size)}
      >
        <ShowcaseExplorer initialTab="projects" onOpenApp={openApp} />
      </RetroWindow>

      {/* 3. Notepad About Me */}
      <RetroWindow
        window={windows.about}
        isActive={activeWindowId === 'about'}
        onFocus={() => focusWindow('about')}
        onClose={() => closeWindow('about')}
        onMinimize={() => minimizeWindow('about')}
        onMaximizeToggle={() => toggleMaximize('about')}
        onUpdateBounds={(pos, size) => updateWindowBounds('about', pos, size)}
      >
        <Notepad />
      </RetroWindow>

      {/* 4. Resume Viewer */}
      <RetroWindow
        window={windows.resume}
        isActive={activeWindowId === 'resume'}
        onFocus={() => focusWindow('resume')}
        onClose={() => closeWindow('resume')}
        onMinimize={() => minimizeWindow('resume')}
        onMaximizeToggle={() => toggleMaximize('resume')}
        onUpdateBounds={(pos, size) => updateWindowBounds('resume', pos, size)}
      >
        <ResumeViewer />
      </RetroWindow>

      {/* 5. MS-DOS Prompt Terminal */}
      <RetroWindow
        window={windows.terminal}
        isActive={activeWindowId === 'terminal'}
        onFocus={() => focusWindow('terminal')}
        onClose={() => closeWindow('terminal')}
        onMinimize={() => minimizeWindow('terminal')}
        onMaximizeToggle={() => toggleMaximize('terminal')}
        onUpdateBounds={(pos, size) => updateWindowBounds('terminal', pos, size)}
      >
        <Terminal />
      </RetroWindow>

      {/* 6. Minesweeper */}
      <RetroWindow
        window={windows.minesweeper}
        isActive={activeWindowId === 'minesweeper'}
        onFocus={() => focusWindow('minesweeper')}
        onClose={() => closeWindow('minesweeper')}
        onMinimize={() => minimizeWindow('minesweeper')}
        onMaximizeToggle={() => toggleMaximize('minesweeper')}
        onUpdateBounds={(pos, size) => updateWindowBounds('minesweeper', pos, size)}
      >
        <Minesweeper />
      </RetroWindow>

      {/* 7. Snake.exe */}
      <RetroWindow
        window={windows.snake}
        isActive={activeWindowId === 'snake'}
        onFocus={() => focusWindow('snake')}
        onClose={() => closeWindow('snake')}
        onMinimize={() => minimizeWindow('snake')}
        onMaximizeToggle={() => toggleMaximize('snake')}
        onUpdateBounds={(pos, size) => updateWindowBounds('snake', pos, size)}
      >
        <SnakeGame />
      </RetroWindow>

      {/* 8. Media Player */}
      <RetroWindow
        window={windows.player}
        isActive={activeWindowId === 'player'}
        onFocus={() => focusWindow('player')}
        onClose={() => closeWindow('player')}
        onMinimize={() => minimizeWindow('player')}
        onMaximizeToggle={() => toggleMaximize('player')}
        onUpdateBounds={(pos, size) => updateWindowBounds('player', pos, size)}
      >
        <MediaPlayer />
      </RetroWindow>

      {/* 9. Recycle Bin */}
      <RetroWindow
        window={windows.recycleBin}
        isActive={activeWindowId === 'recycleBin'}
        onFocus={() => focusWindow('recycleBin')}
        onClose={() => closeWindow('recycleBin')}
        onMinimize={() => minimizeWindow('recycleBin')}
        onMaximizeToggle={() => toggleMaximize('recycleBin')}
        onUpdateBounds={(pos, size) => updateWindowBounds('recycleBin', pos, size)}
      >
        <RecycleBin />
      </RetroWindow>

      {/* 10. Display Properties Control Panel */}
      <RetroWindow
        window={windows.displayProperties}
        isActive={activeWindowId === 'displayProperties'}
        onFocus={() => focusWindow('displayProperties')}
        onClose={() => closeWindow('displayProperties')}
        onMinimize={() => minimizeWindow('displayProperties')}
        onMaximizeToggle={() => toggleMaximize('displayProperties')}
        onUpdateBounds={(pos, size) => updateWindowBounds('displayProperties', pos, size)}
      >
        <DisplayProperties
          currentWallpaper={wallpaper.id}
          onWallpaperChange={setWallpaper}
          crtIntensity={crtIntensity}
          onCrtChange={onChangeCrtIntensity}
          onClose={() => closeWindow('displayProperties')}
        />
      </RetroWindow>

      {/* 11. Video Demonstration Player */}
      <RetroWindow
        window={windows.videoDemo}
        isActive={activeWindowId === 'videoDemo'}
        onFocus={() => focusWindow('videoDemo')}
        onClose={() => closeWindow('videoDemo')}
        onMinimize={() => minimizeWindow('videoDemo')}
        onMaximizeToggle={() => toggleMaximize('videoDemo')}
        onUpdateBounds={(pos, size) => updateWindowBounds('videoDemo', pos, size)}
      >
        <VideoPlayer />
      </RetroWindow>

      {/* 12. JARVIS.exe — deterministic finance calculators */}
      <RetroWindow
        window={windows.jarvis}
        isActive={activeWindowId === 'jarvis'}
        onFocus={() => focusWindow('jarvis')}
        onClose={() => closeWindow('jarvis')}
        onMinimize={() => minimizeWindow('jarvis')}
        onMaximizeToggle={() => toggleMaximize('jarvis')}
        onUpdateBounds={(pos, size) => updateWindowBounds('jarvis', pos, size)}
      >
        <JarvisApp />
      </RetroWindow>

      {/* 13. Drishti.exe — in-browser pose + object pipeline */}
      <RetroWindow
        window={windows.drishti}
        isActive={activeWindowId === 'drishti'}
        onFocus={() => focusWindow('drishti')}
        onClose={() => closeWindow('drishti')}
        onMinimize={() => minimizeWindow('drishti')}
        onMaximizeToggle={() => toggleMaximize('drishti')}
        onUpdateBounds={(pos, size) => updateWindowBounds('drishti', pos, size)}
      >
        <Suspense fallback={<AppLoading label="DRISHTI.EXE" />}>
          <DrishtiApp />
        </Suspense>
      </RetroWindow>

      {/* 14. NeuroScope3D.exe — synthetic segmentation viewer */}
      <RetroWindow
        window={windows.neuroscope}
        isActive={activeWindowId === 'neuroscope'}
        onFocus={() => focusWindow('neuroscope')}
        onClose={() => closeWindow('neuroscope')}
        onMinimize={() => minimizeWindow('neuroscope')}
        onMaximizeToggle={() => toggleMaximize('neuroscope')}
        onUpdateBounds={(pos, size) => updateWindowBounds('neuroscope', pos, size)}
      >
        <Suspense fallback={<AppLoading label="NEUROSCOPE3D.EXE" />}>
          <NeuroScopeApp />
        </Suspense>
      </RetroWindow>

      {/* 15. Ask Jeevesh — portfolio assistant */}
      <RetroWindow
        window={windows.ask}
        isActive={activeWindowId === 'ask'}
        onFocus={() => focusWindow('ask')}
        onClose={() => closeWindow('ask')}
        onMinimize={() => minimizeWindow('ask')}
        onMaximizeToggle={() => toggleMaximize('ask')}
        onUpdateBounds={(pos, size) => updateWindowBounds('ask', pos, size)}
      >
        <AskJeeveshApp onOpenProject={openProject} onOpenApp={openApp} />
      </RetroWindow>

      {/* Right-Click Desktop Context Menu */}
      {contextMenu.visible && (
        <DesktopContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
          onOpenApp={openApp}
          onRefresh={handleRefresh}
        />
      )}

      {/* Taskbar & System Tray */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onSelectWindow={handleSelectTaskbarWindow}
        onOpenApp={openApp}
        onShutdown={() => setShowShutdownDialog(true)}
        onToggle3DMode={onToggle3DMode}
        onOpenRecruiterMode={onOpenRecruiterMode}
      />

      {/* Shutdown Confirmation Dialog */}
      <ShutdownDialog
        isOpen={showShutdownDialog}
        onCancel={() => setShowShutdownDialog(false)}
        onConfirm={() => {
          setShowShutdownDialog(false);
          setIsShutDown(true);
        }}
      />
    </div>
  );
};
