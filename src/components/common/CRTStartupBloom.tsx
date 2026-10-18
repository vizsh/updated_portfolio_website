import React, { useEffect, useState } from 'react';
import { retroAudio } from '../../services/audio';

interface CRTStartupBloomProps {
  isActive: boolean;
}

export const CRTStartupBloom: React.FC<CRTStartupBloomProps> = ({ isActive }) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isActive) {
      setAnimating(true);
      retroAudio.playDegauss();
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 550);
      return () => clearTimeout(timer);
    } else {
      setAnimating(false);
    }
  }, [isActive]);

  if (!animating) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        animation: 'crtFadeBg 0.55s ease-out forwards'
      }}
    >
      {/* Expanding phosphor beam line */}
      <div
        style={{
          width: '100%',
          height: '2px',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 20px #80ffff, 0 0 40px #ffffff, 0 0 80px #00ffff',
          animation: 'crtBeamExpand 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      />
    </div>
  );
};
