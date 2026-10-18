import React, { useState, useEffect, useRef } from 'react';
import { retroAudio } from '../../services/audio';

const TRACKS = [
  { id: 'track1', title: '01. Cybernetic Dawn (120 BPM)', artist: 'RetroChip 1998', duration: '3:24' },
  { id: 'track2', title: '02. Phosphor Screen Dream', artist: 'CRT Dreams', duration: '2:48' },
  { id: 'track3', title: '03. Dial-Up Nostalgia', artist: 'Modem Symphony', duration: '4:12' }
];

export const MediaPlayer: React.FC = () => {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [spectrum, setSpectrum] = useState<number[]>([40, 65, 30, 85, 50, 70, 90, 45, 60, 75]);
  const synthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated visualizer loop
  useEffect(() => {
    let animFrame: number;
    if (isPlaying) {
      const updateSpectrum = () => {
        setSpectrum(prev =>
          prev.map(() => Math.floor(Math.random() * 80) + 15)
        );
        animFrame = requestAnimationFrame(updateSpectrum);
      };
      animFrame = requestAnimationFrame(updateSpectrum);
    } else {
      setSpectrum([10, 15, 10, 20, 15, 10, 25, 15, 10, 15]);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  // Audio synthesis loop when playing
  useEffect(() => {
    if (isPlaying && !retroAudio.isMuted()) {
      synthIntervalRef.current = setInterval(() => {
        const chord = [220, 261.63, 329.63, 392, 440];
        const note = chord[Math.floor(Math.random() * chord.length)];
        retroAudio.playBeep(note, 0.12);
      }, 450);
    } else {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    }
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    retroAudio.playMouseDown();
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    retroAudio.playMouseDown();
    setCurrentTrackIdx((currentTrackIdx + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    retroAudio.playMouseDown();
    setCurrentTrackIdx((currentTrackIdx - 1 + TRACKS.length) % TRACKS.length);
  };

  const track = TRACKS[currentTrackIdx];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#2b2b2b',
        color: '#00ff66',
        padding: '12px',
        height: '100%',
        fontFamily: 'monospace'
      }}
    >
      {/* Top LCD Display Panel */}
      <div
        className="win-inset"
        style={{
          backgroundColor: '#000000',
          padding: '10px',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: isPlaying ? '#00ff66' : '#888' }}>
            {isPlaying ? '▶ PLAYING' : '■ STOPPED'}
          </span>
          <span style={{ fontSize: '11px', color: '#ffcc00' }}>128 kbps 44.1kHz</span>
        </div>

        {/* Scrolling Title marquee */}
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '14px', color: '#00ff66', fontWeight: 'bold' }}>
            {track.title} &mdash; {track.artist}
          </span>
        </div>

        {/* Visualizer EQ Bars */}
        <div
          style={{
            height: '42px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            backgroundColor: '#0a0a0a',
            padding: '2px 4px',
            border: '1px solid #1a1a1a'
          }}
        >
          {spectrum.map((val, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${val}%`,
                background: val > 70 ? '#ff3333' : val > 45 ? '#ffff00' : '#00ff66',
                transition: 'height 0.08s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Control Buttons Panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="win-button" onClick={prevTrack} title="Previous Track">
            ⏮
          </button>
          <button className="win-button" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            className="win-button"
            onClick={() => {
              retroAudio.playMouseDown();
              setIsPlaying(false);
            }}
            title="Stop"
          >
            ⏹
          </button>
          <button className="win-button" onClick={nextTrack} title="Next Track">
            ⏭
          </button>
        </div>

        {/* Volume Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
          <span style={{ color: '#aaa' }}>VOL</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            style={{ width: '70px', accentColor: '#008080' }}
          />
        </div>
      </div>

      {/* Track List */}
      <div
        className="win-inset"
        style={{
          marginTop: '12px',
          flex: 1,
          backgroundColor: '#111111',
          overflowY: 'auto',
          padding: '4px'
        }}
      >
        {TRACKS.map((t, idx) => (
          <div
            key={t.id}
            onClick={() => {
              retroAudio.playMouseDown();
              setCurrentTrackIdx(idx);
              setIsPlaying(true);
            }}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              cursor: 'pointer',
              color: currentTrackIdx === idx ? '#00ff66' : '#cccccc',
              backgroundColor: currentTrackIdx === idx ? '#003311' : 'transparent',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>{t.title}</span>
            <span>{t.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
