import React, { useState } from 'react';
import { retroAudio } from '../../services/audio';

export interface WallpaperOption {
  id: string;
  name: string;
  color: string;
  backgroundStyle: string;
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: 'classic-teal',
    name: 'Windows 98 Teal (Default)',
    color: '#008080',
    backgroundStyle: '#008080'
  },
  {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    color: '#00003b',
    backgroundStyle: 'linear-gradient(180deg, #000028 0%, #000055 100%)'
  },
  {
    id: 'matrix-green',
    name: 'Cyber Matrix Green',
    color: '#03140a',
    backgroundStyle: 'radial-gradient(circle, #082916 0%, #020b05 100%)'
  },
  {
    id: 'sky-clouds',
    name: '90s Nostalgia Sky',
    color: '#3a88c8',
    backgroundStyle: 'linear-gradient(180deg, #2c7da0 0%, #61a5c2 60%, #a9d6e5 100%)'
  },
  {
    id: 'vintage-slate',
    name: 'Vintage Slate Gray',
    color: '#465362',
    backgroundStyle: 'linear-gradient(135deg, #38404a 0%, #526071 100%)'
  }
];

interface DisplayPropertiesProps {
  onClose?: () => void;
  currentWallpaper?: string;
  onWallpaperChange?: (wallpaper: WallpaperOption) => void;
  crtIntensity?: 'off' | 'subtle' | 'authentic' | 'heavy';
  onCrtChange?: (intensity: 'off' | 'subtle' | 'authentic' | 'heavy') => void;
}

export const DisplayProperties: React.FC<DisplayPropertiesProps> = ({
  onClose,
  currentWallpaper = 'classic-teal',
  onWallpaperChange,
  crtIntensity = 'authentic',
  onCrtChange
}) => {
  const [activeTab, setActiveTab] = useState<'background' | 'crt' | 'about'>('background');
  const [selectedWallpaperId, setSelectedWallpaperId] = useState(currentWallpaper);
  const [selectedCrt, setSelectedCrt] = useState(crtIntensity);

  const selectedWallpaper = WALLPAPERS.find(w => w.id === selectedWallpaperId) || WALLPAPERS[0];

  const handleApply = () => {
    retroAudio.playChord();
    if (onWallpaperChange) {
      onWallpaperChange(selectedWallpaper);
    }
    if (onCrtChange) {
      onCrtChange(selectedCrt);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('retro_wallpaper_id', selectedWallpaper.id);
      localStorage.setItem('retro_crt_intensity', selectedCrt);
    }
  };

  const handleOk = () => {
    handleApply();
    if (onClose) onClose();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#c0c0c0',
        padding: '8px',
        fontSize: '11px',
        fontFamily: 'var(--font-retro)'
      }}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '2px solid #808080' }}>
        {[
          { id: 'background' as const, label: 'Background' },
          { id: 'crt' as const, label: 'CRT Screen Effects' },
          { id: 'about' as const, label: 'System Properties' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                retroAudio.playMouseDown();
                setActiveTab(tab.id);
              }}
              className="win-outset"
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderBottom: isActive ? 'none' : '2px solid #808080',
                backgroundColor: isActive ? '#c0c0c0' : '#b0b0b0',
                transform: isActive ? 'translateY(2px)' : 'none',
                fontWeight: isActive ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div
        className="win-outset"
        style={{
          flex: 1,
          padding: '12px',
          marginTop: '2px',
          backgroundColor: '#c0c0c0',
          overflowY: 'auto'
        }}
      >
        {/* TAB 1: BACKGROUND */}
        {activeTab === 'background' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Miniature CRT Monitor Preview */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '180px',
                  height: '120px',
                  backgroundColor: '#808080',
                  border: '3px solid #dfdfdf',
                  borderRadius: '6px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'inset 2px 2px 4px #000000'
                }}
              >
                {/* CRT Screen inside monitor */}
                <div
                  style={{
                    width: '100%',
                    height: '84px',
                    background: selectedWallpaper.backgroundStyle,
                    border: '2px inset #000',
                    borderRadius: '2px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Miniature window inside preview */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '20px',
                      width: '70px',
                      height: '45px',
                      backgroundColor: '#c0c0c0',
                      border: '1px outset #fff',
                      fontSize: '7px'
                    }}
                  >
                    <div style={{ background: '#000080', color: '#fff', padding: '1px 3px' }}>
                      Explorer
                    </div>
                  </div>
                </div>

                {/* Monitor Stand Base */}
                <div
                  style={{
                    width: '50px',
                    height: '12px',
                    backgroundColor: '#c0c0c0',
                    marginTop: '4px',
                    border: '1px outset #fff'
                  }}
                />
              </div>
            </div>

            {/* Wallpaper Selection List */}
            <div>
              <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Select a Wallpaper:</div>
              <div
                className="win-inset"
                style={{
                  height: '120px',
                  backgroundColor: '#ffffff',
                  overflowY: 'auto',
                  padding: '2px'
                }}
              >
                {WALLPAPERS.map(w => {
                  const isSelected = selectedWallpaperId === w.id;
                  return (
                    <div
                      key={w.id}
                      onClick={() => {
                        retroAudio.playMouseDown();
                        setSelectedWallpaperId(w.id);
                      }}
                      style={{
                        padding: '3px 8px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#000080' : 'transparent',
                        color: isSelected ? '#ffffff' : '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          display: 'inline-block',
                          border: '1px solid #000',
                          background: w.backgroundStyle
                        }}
                      />
                      <span>{w.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CRT SCREEN EFFECTS */}
        {activeTab === 'crt' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <fieldset style={{ border: '2px groove #fff', padding: '10px' }}>
              <legend style={{ padding: '0 4px', fontWeight: 'bold' }}>Scanline Phosphor Intensity</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'off' as const, label: 'Disabled (Flat Modern Display)' },
                  { id: 'subtle' as const, label: 'Subtle Scanlines (Low Intensity)' },
                  { id: 'authentic' as const, label: 'Authentic 1998 Cathode-Ray Tube (Recommended)' },
                  { id: 'heavy' as const, label: 'Heavy Retro Arcade Glitch' }
                ].map(opt => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="crt_level"
                      checked={selectedCrt === opt.id}
                      onChange={() => {
                        retroAudio.playMouseDown();
                        setSelectedCrt(opt.id);
                      }}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset style={{ border: '2px groove #fff', padding: '10px' }}>
              <legend style={{ padding: '0 4px', fontWeight: 'bold' }}>CRT Tube Degauss</legend>
              <p style={{ marginBottom: '8px', color: '#444' }}>
                Simulate cathode-ray tube coil electromagnetic degauss discharge to demagnetize the shadow mask.
              </p>
              <button
                className="win-outset"
                onClick={() => retroAudio.playDegauss()}
                style={{ padding: '4px 12px', cursor: 'pointer' }}
              >
                Trigger CRT Degauss Coil
              </button>
            </fieldset>
          </div>
        )}

        {/* TAB 3: ABOUT OS */}
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#000080' }}>
              Retro Desktop System 98 (Personal Edition)
            </div>
            <p><strong>Owner:</strong> Jeevesh Bodhani</p>
            <p><strong>Architecture:</strong> WebGL 2.0 / React 19 / Three.js / Web Audio API</p>
            <p><strong>Resolution:</strong> Dynamic High-DPI CRT Emulation</p>
            <p><strong>Sound Driver:</strong> RetroAudioManager Synthesizer v2.4</p>
            <p><strong>License:</strong> Open for Collaboration & Engineering Inquiries</p>
          </div>
        )}
      </div>

      {/* Action Buttons: OK, Cancel, Apply */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
        <button
          className="win-outset"
          onClick={handleOk}
          style={{ minWidth: '70px', padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          OK
        </button>
        <button
          className="win-outset"
          onClick={() => {
            retroAudio.playMouseDown();
            if (onClose) onClose();
          }}
          style={{ minWidth: '70px', padding: '4px 10px', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          className="win-outset"
          onClick={handleApply}
          style={{ minWidth: '70px', padding: '4px 10px', cursor: 'pointer' }}
        >
          <u>A</u>pply
        </button>
      </div>
    </div>
  );
};
