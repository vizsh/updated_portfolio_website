import React from 'react';

export type RetroIconType = 
  | 'computer'
  | 'folder'
  | 'folder-open'
  | 'notepad'
  | 'terminal'
  | 'resume'
  | 'document'
  | 'minesweeper'
  | 'snake'
  | 'display'
  | 'lamp'
  | 'player'
  | 'recycle-empty'
  | 'recycle-full'
  | 'settings'
  | 'shutdown'
  | 'network'
  | 'globe'
  | 'cd'
  | 'sound-on'
  | 'sound-off'
  | 'maximize'
  | 'minimize'
  | 'close'
  | 'restore'
  | 'back';

interface RetroIconProps {
  name: RetroIconType;
  size?: number;
  className?: string;
}

export const RetroIcon: React.FC<RetroIconProps> = ({ name, size = 32, className = '' }) => {
  switch (name) {
    case 'computer':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="3" y="3" width="22" height="18" fill="#c0c0c0" stroke="#000" strokeWidth="1.5" />
          <rect x="6" y="6" width="16" height="12" fill="#000080" />
          <rect x="7" y="7" width="14" height="10" fill="#008080" />
          <path d="M10 21 L8 26 L20 26 L18 21 Z" fill="#808080" stroke="#000" strokeWidth="1.5" />
          <rect x="23" y="7" width="6" height="18" fill="#c0c0c0" stroke="#000" strokeWidth="1.5" />
          <rect x="25" y="10" width="2" height="1" fill="#00ff00" />
          <rect x="25" y="13" width="2" height="1" fill="#ff0000" />
          <line x1="24" y1="18" x2="28" y2="18" stroke="#000" strokeWidth="1" />
        </svg>
      );

    case 'folder':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <path d="M3 7 L12 7 L15 10 L28 10 L28 25 L3 25 Z" fill="#ffca3a" stroke="#000" strokeWidth="1.5" />
          <path d="M3 11 L28 11 L26 25 L3 25 Z" fill="#ffd166" stroke="#000" strokeWidth="1.5" />
          <line x1="5" y1="14" x2="25" y2="14" stroke="#fffae0" strokeWidth="1" />
        </svg>
      );

    case 'folder-open':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <path d="M3 6 L12 6 L15 9 L28 9 L28 24 L3 24 Z" fill="#c89b27" stroke="#000" strokeWidth="1.5" />
          <polygon points="1,26 6,13 31,13 26,26" fill="#ffd166" stroke="#000" strokeWidth="1.5" />
        </svg>
      );

    case 'notepad':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="6" y="3" width="18" height="25" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
          <rect x="8" y="3" width="2" height="25" fill="#e63946" />
          <line x1="12" y1="8" x2="21" y2="8" stroke="#808080" strokeWidth="1.5" />
          <line x1="12" y1="12" x2="21" y2="12" stroke="#808080" strokeWidth="1.5" />
          <line x1="12" y1="16" x2="21" y2="16" stroke="#808080" strokeWidth="1.5" />
          <line x1="12" y1="20" x2="18" y2="20" stroke="#808080" strokeWidth="1.5" />
          {/* Blue pencil */}
          <path d="M20 27 L28 15 L25 13 L17 25 Z" fill="#1d3557" stroke="#000" strokeWidth="1" />
          <polygon points="17,25 16,28 19,27" fill="#ffbe0b" stroke="#000" strokeWidth="0.8" />
        </svg>
      );

    case 'terminal':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="3" y="4" width="26" height="22" fill="#000000" stroke="#808080" strokeWidth="1.5" />
          <rect x="3" y="4" width="26" height="5" fill="#808080" />
          <text x="6" y="8" fill="#ffffff" fontSize="4" fontFamily="monospace" fontWeight="bold">MS-DOS</text>
          <text x="6" y="16" fill="#00ff00" fontSize="6" fontFamily="monospace">C:\&gt;_</text>
        </svg>
      );

    case 'resume':
    case 'document':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <path d="M6 3 L20 3 L26 9 L26 28 L6 28 Z" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
          <polygon points="20,3 20,9 26,9" fill="#dfdfdf" stroke="#000" strokeWidth="1" />
          <circle cx="12" cy="11" r="3" fill="#000080" />
          <line x1="17" y1="10" x2="23" y2="10" stroke="#000000" strokeWidth="1.5" />
          <line x1="17" y1="13" x2="22" y2="13" stroke="#808080" strokeWidth="1" />
          <line x1="9" y1="18" x2="23" y2="18" stroke="#000000" strokeWidth="1.5" />
          <line x1="9" y1="21" x2="23" y2="21" stroke="#808080" strokeWidth="1.5" />
          <line x1="9" y1="24" x2="19" y2="24" stroke="#808080" strokeWidth="1.5" />
        </svg>
      );

    case 'minesweeper':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="2" y="2" width="28" height="28" fill="#c0c0c0" stroke="#000" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="6" fill="#000000" />
          <line x1="16" y1="6" x2="16" y2="26" stroke="#000" strokeWidth="2" />
          <line x1="6" y1="16" x2="26" y2="16" stroke="#000" strokeWidth="2" />
          <line x1="9" y1="9" x2="23" y2="23" stroke="#000" strokeWidth="2" />
          <line x1="9" y1="23" x2="23" y2="9" stroke="#000" strokeWidth="2" />
          <circle cx="14" cy="14" r="1.5" fill="#ffffff" />
        </svg>
      );

    case 'snake':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="2" y="2" width="28" height="28" fill="#000000" stroke="#808080" strokeWidth="1.5" />
          {/* Retro green snake body segments */}
          <rect x="6" y="8" width="4" height="4" fill="#00ff00" />
          <rect x="10" y="8" width="4" height="4" fill="#00ff00" />
          <rect x="14" y="8" width="4" height="4" fill="#00ff00" />
          <rect x="14" y="12" width="4" height="4" fill="#00ff00" />
          <rect x="14" y="16" width="4" height="4" fill="#00ff00" />
          <rect x="18" y="16" width="4" height="4" fill="#00ff00" />
          <rect x="22" y="16" width="4" height="4" fill="#39ff14" />
          {/* Snake eye */}
          <rect x="24" y="17" width="1.5" height="1.5" fill="#000000" />
          {/* Red apple food */}
          <circle cx="8" cy="22" r="3" fill="#ff0044" />
          <line x1="8" y1="19" x2="10" y2="17" stroke="#00ff00" strokeWidth="1" />
        </svg>
      );

    case 'display':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="4" y="4" width="24" height="18" fill="#c0c0c0" stroke="#000" strokeWidth="1.5" />
          <rect x="7" y="7" width="18" height="12" fill="#008080" />
          {/* Mini wallpaper sunset/grid */}
          <polygon points="7,19 12,13 16,16 21,11 25,19" fill="#000080" />
          <circle cx="12" cy="11" r="2" fill="#ffca3a" />
          <path d="M12 22 L10 27 L22 27 L20 22 Z" fill="#808080" stroke="#000" strokeWidth="1.5" />
        </svg>
      );

    case 'lamp':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <ellipse cx="16" cy="27" rx="8" ry="3" fill="#c89b27" stroke="#000" strokeWidth="1" />
          <path d="M16 27 C16 20, 10 16, 14 10" stroke="#c89b27" strokeWidth="2.5" fill="none" />
          <path d="M8 10 C8 6, 24 6, 24 10 Z" fill="#2d6a4f" stroke="#000" strokeWidth="1.2" />
          <circle cx="16" cy="12" r="2" fill="#ffe066" />
        </svg>
      );

    case 'player':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="12" fill="#c0c0c0" stroke="#000" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="8" stroke="#808080" strokeWidth="1" strokeDasharray="3 2" />
          <circle cx="16" cy="16" r="4" fill="#ffffff" stroke="#000" strokeWidth="1" />
          <circle cx="16" cy="16" r="1.5" fill="#000000" />
          <polygon points="14,13 20,16 14,19" fill="#008000" />
        </svg>
      );

    case 'recycle-empty':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <path d="M7 10 L10 27 L22 27 L25 10 Z" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
          <line x1="5" y1="8" x2="27" y2="8" stroke="#000" strokeWidth="2" />
          <line x1="11" y1="12" x2="12" y2="25" stroke="#000080" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="16" y1="12" x2="16" y2="25" stroke="#000080" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="21" y1="12" x2="20" y2="25" stroke="#000080" strokeWidth="1" strokeDasharray="2 2" />
          <rect x="12" y="5" width="8" height="3" fill="#808080" stroke="#000" strokeWidth="1" />
        </svg>
      );

    case 'recycle-full':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <path d="M7 10 L10 27 L22 27 L25 10 Z" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
          <line x1="5" y1="8" x2="27" y2="8" stroke="#000" strokeWidth="2" />
          {/* Crumpled paper balls spilling out */}
          <circle cx="12" cy="7" r="3" fill="#e0e0e0" stroke="#000" strokeWidth="1" />
          <circle cx="18" cy="6" r="3.5" fill="#ffffff" stroke="#000" strokeWidth="1" />
          <line x1="11" y1="12" x2="12" y2="25" stroke="#000080" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="16" y1="12" x2="16" y2="25" stroke="#000080" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="21" y1="12" x2="20" y2="25" stroke="#000080" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'shutdown':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <circle cx="16" cy="16" r="12" fill="#c0c0c0" stroke="#000" strokeWidth="1.5" />
          <path d="M12 11 A7 7 0 1 0 20 11" stroke="#e63946" strokeWidth="2.5" fill="none" />
          <line x1="16" y1="7" x2="16" y2="15" stroke="#e63946" strokeWidth="2.5" />
        </svg>
      );

    case 'sound-on':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
          <path d="M3 5H1v6h2l4 4V1L3 5zm9 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM9.5 1.05v2.06c2.89.86 5 3.54 5 6.89s-2.11 6.03-5 6.89v2.06c4.01-.91 7-4.49 7-8.95s-2.99-8.04-7-8.95z"/>
        </svg>
      );

    case 'sound-off':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
          <path d="M1 5v6h2l4 4V1L3 5H1zm11.5 3c0-.85-.24-1.63-.66-2.3l1.45-1.45C14.07 5.25 14.5 6.58 14.5 8c0 3.07-1.92 5.67-4.63 6.63l-.7-1.99C11.12 12.03 12.5 10.18 12.5 8zm-2.03-4.99l1.44-1.44C10.74.87 9.42.43 8 .43v2.06c1.07 0 2.07.35 2.91.95l-.44.57zM1.71 1.28L.29 2.71 13.29 15.7l1.41-1.42L1.71 1.28z"/>
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
          <rect x="4" y="4" width="24" height="24" fill="#c0c0c0" stroke="#000" strokeWidth="1.5" />
          <text x="11" y="20" fill="#000" fontSize="14" fontWeight="bold">?</text>
        </svg>
      );
  }
};
