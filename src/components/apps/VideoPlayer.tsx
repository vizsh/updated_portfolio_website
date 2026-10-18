import React, { useState, useRef, useEffect } from 'react';
import { retroAudio } from '../../services/audio';

interface VideoPlayerProps {
  src?: string;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src = '/videos/Jeevesh_Bodhani_Portfolio_Splits.mp4',
  autoPlay = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Ready');

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setStatusText(`Loaded • ${video.videoWidth || 1920}x${video.videoHeight || 1080}`);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      setStatusText('Playing');
    };
    const handlePause = () => {
      setIsPlaying(false);
      setStatusText('Paused');
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setStatusText('Playback Complete');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    retroAudio.playMouseDown();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {
        // Fallback if browser blocks unmuted autoplay
        video.muted = true;
        setIsMuted(true);
        video.play();
      });
    }
  };

  const handleStop = () => {
    retroAudio.playMouseDown();
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
    setStatusText('Stopped');
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipTime = (delta: number) => {
    retroAudio.playMouseDown();
    if (videoRef.current) {
      const nextTime = Math.min(Math.max(videoRef.current.currentTime + delta, 0), duration);
      videoRef.current.currentTime = nextTime;
    }
  };

  const toggleMute = () => {
    retroAudio.playMouseDown();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const cycleSpeed = () => {
    retroAudio.playMouseDown();
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    retroAudio.playMouseDown();
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const jumpToTime = (seconds: number) => {
    retroAudio.playMouseDown();
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#c0c0c0',
        fontFamily: 'var(--font-retro), sans-serif',
        userSelect: 'none',
        overflow: 'hidden'
      }}
      onClick={() => activeMenu && setActiveMenu(null)}
    >
      {/* Classic Windows 98 Menu Bar */}
      <div
        className="win-outset"
        style={{
          display: 'flex',
          gap: '12px',
          padding: '2px 8px',
          fontSize: '11px',
          background: '#c0c0c0',
          borderBottom: '1px solid #808080'
        }}
      >
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}><u>F</u>ile</span>
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}><u>E</u>dit</span>
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}><u>D</u>evice</span>
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}><u>S</u>cale</span>
        <span style={{ cursor: 'pointer' }} onClick={() => retroAudio.playMouseDown()}><u>H</u>elp</span>
      </div>

      {/* Main Video Screen Container */}
      <div
        className="win-sunken"
        style={{
          flex: 1,
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '200px'
        }}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay={autoPlay}
          playsInline
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
          onClick={togglePlay}
        />

        {/* Video Overlay Play Button when paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(0,0,0,0.8)'
            }}
            title="Click to Play Demonstration Video"
          >
            <span style={{ color: '#00ff66', fontSize: '24px', marginLeft: '4px' }}>▶</span>
          </div>
        )}
      </div>

      {/* Video Seeker Timeline */}
      <div
        style={{
          padding: '6px 10px 2px 10px',
          backgroundColor: '#c0c0c0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          style={{
            flex: 1,
            cursor: 'pointer',
            accentColor: '#000080',
            height: '6px'
          }}
          title="Seek video position"
        />
        <div
          className="win-sunken"
          style={{
            padding: '2px 6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            background: '#000000',
            color: '#00ff66',
            minWidth: '95px',
            textAlign: 'center'
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 10px 6px 10px',
          gap: '6px',
          flexWrap: 'wrap'
        }}
      >
        {/* Playback Transport Buttons */}
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          <button
            className="win-button"
            onClick={togglePlay}
            style={{ minWidth: '32px', height: '24px', fontSize: '11px', fontWeight: 'bold' }}
            title={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            className="win-button"
            onClick={handleStop}
            style={{ minWidth: '32px', height: '24px', fontSize: '11px' }}
            title="Stop Video"
          >
            ■
          </button>
          <button
            className="win-button"
            onClick={() => skipTime(-10)}
            style={{ height: '24px', padding: '0 6px', fontSize: '11px' }}
            title="Rewind 10 Seconds"
          >
            ⏮ -10s
          </button>
          <button
            className="win-button"
            onClick={() => skipTime(10)}
            style={{ height: '24px', padding: '0 6px', fontSize: '11px' }}
            title="Forward 10 Seconds"
          >
            +10s ⏭
          </button>
          <button
            className="win-button"
            onClick={cycleSpeed}
            style={{ height: '24px', padding: '0 6px', fontSize: '11px' }}
            title="Cycle Playback Speed"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Volume & Fullscreen Controls */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            className="win-button"
            onClick={toggleMute}
            style={{ minWidth: '30px', height: '24px', fontSize: '12px' }}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ width: '60px', height: '6px', cursor: 'pointer', accentColor: '#000080' }}
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
          <button
            className="win-button"
            onClick={toggleFullscreen}
            style={{ height: '24px', padding: '0 6px', fontSize: '12px' }}
            title="Full Screen Video"
          >
            ⛶ Full
          </button>
        </div>
      </div>

      {/* Quick Chapter Markers */}
      <div
        className="win-sunken"
        style={{
          margin: '0 8px 6px 8px',
          padding: '4px 8px',
          background: '#ece9d8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10.5px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#000080' }}>Jump To:</span>
        <button
          className="win-button"
          onClick={() => jumpToTime(0)}
          style={{ padding: '1px 5px', fontSize: '10px' }}
        >
          00:00 Intro
        </button>
        <button
          className="win-button"
          onClick={() => jumpToTime(Math.min(30, duration * 0.25))}
          style={{ padding: '1px 5px', fontSize: '10px' }}
        >
          Drishti AI (CV)
        </button>
        <button
          className="win-button"
          onClick={() => jumpToTime(Math.min(60, duration * 0.5))}
          style={{ padding: '1px 5px', fontSize: '10px' }}
        >
          JARVIS Hedge Fund
        </button>
        <button
          className="win-button"
          onClick={() => jumpToTime(Math.min(90, duration * 0.75))}
          style={{ padding: '1px 5px', fontSize: '10px' }}
        >
          SIH Surveillance
        </button>
      </div>

      {/* Bottom Status Bar */}
      <div
        className="win-sunken"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2px 8px',
          fontSize: '11px',
          color: '#333333',
          background: '#dfdfdf'
        }}
      >
        <span>● {statusText}</span>
        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555' }}>
          Jeevesh_Bodhani_Portfolio_Splits.mp4 (61.5 MB)
        </span>
      </div>
    </div>
  );
};
