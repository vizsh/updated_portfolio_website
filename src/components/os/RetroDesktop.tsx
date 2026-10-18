import React, { useState, useEffect } from 'react';
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
import { ShutdownDialog, SafeToTurnOffScreen } from './ShutdownDialog';
import { retroAudio } from '../../services/audio';

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
  }
};

interface RetroDesktopProps {
  onToggle3DMode: () => void;
  crtIntensity?: 'off' | 'subtle' | 'authentic' | 'heavy';
  onChangeCrtIntensity?: (intensity: 'off' | 'subtle' | 'authentic' | 'heavy') => void;
}

export const RetroDesktop: React.FC<RetroDesktopProps> = ({
  onToggle3DMode,
  crtIntensity = 'authentic',
  onChangeCrtIntensity
}) => {
  const [windows, setWindows] = useState<Record<AppId, WindowState>>(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<AppId | null>('showcase');
  const [highestZ, setHighestZ] = useState(10);
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
    setHighestZ(prevZ => {
      const newZ = prevZ + 1;
      setWindows(prev => ({
        ...prev,
        [id]: { ...prev[id], zIndex: newZ, isMinimized: false }
      }));
      return newZ;
    });
  };

  // Open an app with smart mobile snap
  const openApp = (id: AppId) => {
    retroAudio.playMouseDown();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        zIndex: highestZ + 1,
        ...(isMobile
          ? {
              position: { x: 4, y: 38 },
              size: { width: window.innerWidth - 8, height: window.innerHeight - 84 }
            }
          : {})
      }
    }));
    setHighestZ(h => h + 1);
    setActiveWindowId(id);
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
        <ShowcaseExplorer />
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
        <ShowcaseExplorer />
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
