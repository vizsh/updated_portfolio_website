import React, { useEffect } from 'react';
import { RetroIcon } from '../common/RetroIcon';
import { retroAudio } from '../../services/audio';

interface DesktopContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onOpenApp: (id: any) => void;
  onRefresh: () => void;
}

export const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({
  x,
  y,
  onClose,
  onOpenApp,
  onRefresh
}) => {
  // Dismiss on outside click or Escape
  useEffect(() => {
    const handleDown = () => onClose();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Adjust coordinate so menu doesn't overflow screen
  const menuW = 165;
  const menuH = 190;
  const safeX = typeof window !== 'undefined' ? Math.min(x, window.innerWidth - menuW - 10) : x;
  const safeY = typeof window !== 'undefined' ? Math.min(y, window.innerHeight - menuH - 45) : y;

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '3px 12px',
    fontSize: '11px',
    fontFamily: 'var(--font-retro)',
    cursor: 'pointer',
    userSelect: 'none'
  };

  return (
    <div
      className="win-outset"
      onMouseDown={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: `${safeX}px`,
        top: `${safeY}px`,
        width: `${menuW}px`,
        backgroundColor: '#c0c0c0',
        zIndex: 99999,
        padding: '2px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.45)'
      }}
    >
      <div
        style={itemStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#000080';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#000000';
        }}
        onClick={() => {
          retroAudio.playMouseDown();
          onRefresh();
          onClose();
        }}
      >
        <span><u>R</u>efresh</span>
      </div>

      <div style={{ height: '1px', backgroundColor: '#808080', margin: '3px 1px' }} />

      <div
        style={itemStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#000080';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#000000';
        }}
        onClick={() => {
          retroAudio.playMouseDown();
          onOpenApp('showcase');
          onClose();
        }}
      >
        <RetroIcon name="computer" size={14} />
        <span>Open Showcase</span>
      </div>

      <div
        style={itemStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#000080';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#000000';
        }}
        onClick={() => {
          retroAudio.playMouseDown();
          onOpenApp('terminal');
          onClose();
        }}
      >
        <RetroIcon name="terminal" size={14} />
        <span>MS-DOS Prompt</span>
      </div>

      <div
        style={itemStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#000080';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#000000';
        }}
        onClick={() => {
          retroAudio.playMouseDown();
          onOpenApp('snake');
          onClose();
        }}
      >
        <RetroIcon name="snake" size={14} />
        <span>Play Snake.exe</span>
      </div>

      <div
        style={itemStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#000080';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#000000';
        }}
        onClick={() => {
          retroAudio.playMouseDown();
          onOpenApp('about');
          onClose();
        }}
      >
        <RetroIcon name="notepad" size={14} />
        <span>About_Me.txt</span>
      </div>

      <div style={{ height: '1px', backgroundColor: '#808080', margin: '3px 1px' }} />

      <div
        style={itemStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#000080';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#000000';
        }}
        onClick={() => {
          retroAudio.playMouseDown();
          onOpenApp('displayProperties');
          onClose();
        }}
      >
        <RetroIcon name="display" size={14} />
        <span>P<u>r</u>operties</span>
      </div>
    </div>
  );
};
