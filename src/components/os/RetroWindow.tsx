import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { WindowState, Position, Size } from '../../types/os';
import { RetroIcon } from '../common/RetroIcon';
import type { RetroIconType } from '../common/RetroIcon';
import { retroAudio } from '../../services/audio';

interface RetroWindowProps {
  window: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximizeToggle: () => void;
  onUpdateBounds: (position: Position, size: Size) => void;
  children: React.ReactNode;
}

export const RetroWindow: React.FC<RetroWindowProps> = ({
  window: win,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximizeToggle,
  onUpdateBounds,
  children
}) => {
  const windowRef = useRef<HTMLDivElement>(null);

  // Ghost wireframe states for 90s-authentic drag and resize preview
  const [ghostBox, setGhostBox] = useState<{
    visible: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
  }>({ visible: false, x: 0, y: 0, width: 0, height: 0 });

  const dragStartRef = useRef<{
    pointerStartX: number;
    pointerStartY: number;
    initX: number;
    initY: number;
    initW: number;
    initH: number;
    mode: 'drag' | 'resize-se' | 'resize-e' | 'resize-s';
  } | null>(null);

  // Pointer move handler during ghost dragging
  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragStartRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStartRef.current.pointerStartX;
    const dy = clientY - dragStartRef.current.pointerStartY;
    const { initX, initY, initW, initH, mode } = dragStartRef.current;

    if (mode === 'drag') {
      const newX = Math.max(0, initX + dx);
      const newY = Math.max(0, initY + dy);
      setGhostBox({ visible: true, x: newX, y: newY, width: initW, height: initH });
    } else if (mode === 'resize-se') {
      const newW = Math.max(win.minSize.width, initW + dx);
      const newH = Math.max(win.minSize.height, initH + dy);
      setGhostBox({ visible: true, x: initX, y: initY, width: newW, height: newH });
    } else if (mode === 'resize-e') {
      const newW = Math.max(win.minSize.width, initW + dx);
      setGhostBox({ visible: true, x: initX, y: initY, width: newW, height: initH });
    } else if (mode === 'resize-s') {
      const newH = Math.max(win.minSize.height, initH + dy);
      setGhostBox({ visible: true, x: initX, y: initY, width: initW, height: newH });
    }
  }, [win.minSize]);

  // Pointer up handler to commit new window position and size
  const handlePointerUp = useCallback(() => {
    if (!dragStartRef.current) return;
    if (ghostBox.visible) {
      onUpdateBounds(
        { x: ghostBox.x, y: ghostBox.y },
        { width: ghostBox.width, height: ghostBox.height }
      );
      retroAudio.playMouseUp();
    }
    dragStartRef.current = null;
    setGhostBox(prev => ({ ...prev, visible: false }));

    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('touchend', handlePointerUp);
  }, [ghostBox, handlePointerMove, onUpdateBounds]);

  const lastTapRef = useRef<number>(0);

  const handleTitleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double-tap detected on touchscreen
      e.preventDefault();
      retroAudio.playWhoosh(!win.isMaximized);
      onMaximizeToggle();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
    startDrag(e);
  };

  const handleMinimizeClick = () => {
    retroAudio.playWhoosh(false);
    onMinimize();
  };

  const handleMaximizeClick = () => {
    retroAudio.playWhoosh(!win.isMaximized);
    onMaximizeToggle();
  };

  // Start window dragging
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (win.isMaximized) return; // Cannot drag maximized window
    onFocus();
    retroAudio.playMouseDown();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      pointerStartX: clientX,
      pointerStartY: clientY,
      initX: win.position.x,
      initY: win.position.y,
      initW: win.size.width,
      initH: win.size.height,
      mode: 'drag'
    };

    setGhostBox({
      visible: true,
      x: win.position.x,
      y: win.position.y,
      width: win.size.width,
      height: win.size.height
    });

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);
  };

  // Start window resizing
  const startResize = (e: React.MouseEvent | React.TouchEvent, mode: 'resize-se' | 'resize-e' | 'resize-s') => {
    if (win.isMaximized) return;
    e.stopPropagation();
    onFocus();
    retroAudio.playMouseDown();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      pointerStartX: clientX,
      pointerStartY: clientY,
      initX: win.position.x,
      initY: win.position.y,
      initW: win.size.width,
      initH: win.size.height,
      mode
    };

    setGhostBox({
      visible: true,
      x: win.position.x,
      y: win.position.y,
      width: win.size.width,
      height: win.size.height
    });

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  if (!win.isOpen || win.isMinimized) return null;

  const currentX = win.isMaximized ? 0 : win.position.x;
  const currentY = win.isMaximized ? 0 : win.position.y;
  const currentW = win.isMaximized ? '100%' : `${win.size.width}px`;
  const currentH = win.isMaximized ? 'calc(100% - var(--taskbar-height))' : `${win.size.height}px`;

  return (
    <>
      {/* 90s Authentic Ghost Drag/Resize Wireframe Outline */}
      {ghostBox.visible && (
        <div
          className="win-ghost-wireframe"
          style={{
            left: `${ghostBox.x}px`,
            top: `${ghostBox.y}px`,
            width: `${ghostBox.width}px`,
            height: `${ghostBox.height}px`
          }}
        />
      )}

      {/* The Actual Rendered Window */}
      <div
        ref={windowRef}
        onMouseDown={onFocus}
        onTouchStart={onFocus}
        className="win-outset"
        style={{
          position: 'absolute',
          left: typeof currentX === 'number' ? `${currentX}px` : currentX,
          top: typeof currentY === 'number' ? `${currentY}px` : currentY,
          width: currentW,
          height: currentH,
          zIndex: win.zIndex,
          display: 'flex',
          flexDirection: 'column',
          padding: '3px',
          boxShadow: '2px 2px 8px rgba(0,0,0,0.4)',
          maxWidth: '100vw',
          maxHeight: 'calc(100vh - var(--taskbar-height))'
        }}
      >
        {/* Title Bar */}
        <div
          className={`win-titlebar ${!isActive ? 'inactive' : ''}`}
          onMouseDown={startDrag}
          onTouchStart={handleTitleTouchStart}
          onDoubleClick={handleMaximizeClick}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <RetroIcon name={win.icon as RetroIconType} size={16} />
            <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {win.title}
            </span>
          </div>

          <div className="win-title-controls" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
            {/* Minimize */}
            <button
              className="win-ctrl-btn"
              onClick={handleMinimizeClick}
              title="Minimize"
              aria-label="Minimize Window"
            >
              _
            </button>

            {/* Maximize / Restore */}
            <button
              className="win-ctrl-btn"
              onClick={handleMaximizeClick}
              title={win.isMaximized ? "Restore" : "Maximize"}
              aria-label="Maximize or Restore Window"
            >
              {win.isMaximized ? '❐' : '□'}
            </button>

            {/* Close */}
            <button
              className="win-ctrl-btn"
              onClick={() => {
                retroAudio.playMouseDown();
                onClose();
              }}
              style={{ fontWeight: '900', color: '#000000' }}
              title="Close"
              aria-label="Close Window"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Window Content Container */}
        <div
          className="win-inset"
          style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
            marginTop: '2px'
          }}
        >
          {children}
        </div>

        {/* Status Bar */}
        <div
          className="win-sunken"
          style={{
            height: '20px',
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 6px',
            fontSize: '11px',
            color: '#333'
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Ready
          </span>
        </div>

        {/* Resize Handles (Bottom Right Corner & Edges) */}
        {!win.isMaximized && (
          <>
            <div
              onMouseDown={e => startResize(e, 'resize-se')}
              onTouchStart={e => startResize(e, 'resize-se')}
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: '16px',
                height: '16px',
                cursor: 'se-resize',
                zIndex: 10
              }}
            />
            <div
              onMouseDown={e => startResize(e, 'resize-e')}
              onTouchStart={e => startResize(e, 'resize-e')}
              style={{
                position: 'absolute',
                right: 0,
                top: '24px',
                bottom: '16px',
                width: '6px',
                cursor: 'e-resize',
                zIndex: 10
              }}
            />
            <div
              onMouseDown={e => startResize(e, 'resize-s')}
              onTouchStart={e => startResize(e, 'resize-s')}
              style={{
                position: 'absolute',
                left: '6px',
                right: '16px',
                bottom: 0,
                height: '6px',
                cursor: 's-resize',
                zIndex: 10
              }}
            />
          </>
        )}
      </div>
    </>
  );
};
