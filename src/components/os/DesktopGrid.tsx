import React, { useState, useRef } from 'react';
import type { AppId, DesktopShortcut } from '../../types/os';
import { RetroIcon } from '../common/RetroIcon';
import type { RetroIconType } from '../common/RetroIcon';
import { retroAudio } from '../../services/audio';

const SHORTCUTS: DesktopShortcut[] = [
  { id: 'showcase', title: 'My Showcase', icon: 'computer', row: 0, col: 0 },
  { id: 'projects', title: 'My Projects', icon: 'folder', row: 1, col: 0 },
  { id: 'about', title: 'About_Me.txt', icon: 'notepad', row: 2, col: 0 },
  { id: 'resume', title: 'Resume.pdf', icon: 'resume', row: 3, col: 0 },
  { id: 'terminal', title: 'MS-DOS Prompt', icon: 'terminal', row: 4, col: 0 },
  { id: 'minesweeper', title: 'Minesweeper', icon: 'minesweeper', row: 0, col: 1 },
  { id: 'snake', title: 'Snake.exe', icon: 'snake', row: 1, col: 1 },
  { id: 'player', title: 'Media Player', icon: 'player', row: 2, col: 1 },
  { id: 'displayProperties', title: 'Display Settings', icon: 'display', row: 3, col: 1 },
  { id: 'recycleBin', title: 'Recycle Bin', icon: 'recycle-full', row: 4, col: 1 }
];

interface DesktopGridProps {
  onOpenApp: (id: AppId) => void;
}

export const DesktopGrid: React.FC<DesktopGridProps> = ({ onOpenApp }) => {
  const [selectedId, setSelectedId] = useState<AppId | null>(null);

  // Marquee drag-selection box state
  const [selectionBox, setSelectionBox] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({ active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only trigger marquee selection if clicking directly on the desktop background
    if (e.target !== containerRef.current) return;
    setSelectedId(null);
    setSelectionBox({
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectionBox.active) return;
    setSelectionBox(prev => ({
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY
    }));
  };

  const handleMouseUp = () => {
    if (selectionBox.active) {
      setSelectionBox(prev => ({ ...prev, active: false }));
    }
  };

  const handleShortcutClick = (e: React.MouseEvent | React.TouchEvent, id: AppId) => {
    e.stopPropagation();
    retroAudio.playMouseDown();
    setSelectedId(id);

    // On mobile or touch devices, open on first tap; on desktop, allow double-click or enter
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      onOpenApp(id);
    }
  };

  const handleDoubleClick = (id: AppId) => {
    onOpenApp(id);
  };

  const boxX = Math.min(selectionBox.startX, selectionBox.currentX);
  const boxY = Math.min(selectionBox.startY, selectionBox.currentY);
  const boxW = Math.abs(selectionBox.currentX - selectionBox.startX);
  const boxH = Math.abs(selectionBox.currentY - selectionBox.startY);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 'var(--taskbar-height)',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 80px)',
        gridTemplateRows: 'repeat(auto-fill, 84px)',
        gridAutoFlow: 'column',
        gap: '12px 16px',
        alignContent: 'start',
        overflow: 'hidden'
      }}
    >
      {/* Marquee Drag Box */}
      {selectionBox.active && (
        <div
          style={{
            position: 'fixed',
            left: `${boxX}px`,
            top: `${boxY}px`,
            width: `${boxW}px`,
            height: `${boxH}px`,
            border: '1px dotted #ffffff',
            backgroundColor: 'rgba(0, 0, 128, 0.25)',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
      )}

      {/* Desktop Shortcut Icons */}
      {SHORTCUTS.map(shortcut => {
        const isSelected = selectedId === shortcut.id;
        return (
          <div
            key={shortcut.id}
            onClick={e => handleShortcutClick(e, shortcut.id)}
            onDoubleClick={() => handleDoubleClick(shortcut.id)}
            style={{
              width: '76px',
              height: '78px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '4px',
              backgroundColor: isSelected ? 'rgba(0, 0, 128, 0.4)' : 'transparent',
              outline: isSelected ? '1px dotted #ffffff' : 'none',
              borderRadius: '2px',
              transition: 'background-color 0.1s'
            }}
          >
            <RetroIcon name={shortcut.icon as RetroIconType} size={36} />
            <span
              style={{
                marginTop: '4px',
                fontSize: '11px',
                color: '#ffffff',
                textAlign: 'center',
                textShadow: '1px 1px 2px #000000',
                lineHeight: '1.2',
                wordBreak: 'break-word',
                padding: '1px 3px',
                backgroundColor: isSelected ? '#000080' : 'transparent'
              }}
            >
              {shortcut.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};
