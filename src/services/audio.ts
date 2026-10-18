// Retro Sound System with real audio clips and zero-latency Web Audio API synthesizer

class RetroAudioManager {
  private muted: boolean = false;
  private audioCtx: AudioContext | null = null;
  private keyIndex: number = 0;
  private keyClips: HTMLAudioElement[] = [];
  private mouseDownClip: HTMLAudioElement | null = null;
  private mouseUpClip: HTMLAudioElement | null = null;
  private startupClip: HTMLAudioElement | null = null;

  constructor() {
    // Check saved mute preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retro_portfolio_muted');
      this.muted = saved === 'true';
      this.preloadClips();
    }
  }

  private preloadClips() {
    try {
      this.mouseDownClip = new Audio('/audio/mouse/mouse_down.mp3');
      this.mouseUpClip = new Audio('/audio/mouse/mouse_up.mp3');
      this.startupClip = new Audio('/audio/startup/startup.mp3');

      for (let i = 1; i <= 6; i++) {
        const audio = new Audio(`/audio/keyboard/key_${i}.mp3`);
        audio.volume = 0.35;
        this.keyClips.push(audio);
      }

      if (this.mouseDownClip) this.mouseDownClip.volume = 0.4;
      if (this.mouseUpClip) this.mouseUpClip.volume = 0.4;
      if (this.startupClip) this.startupClip.volume = 0.6;
    } catch {
      // Audio autoplay policy or headless environment
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('retro_portfolio_muted', this.muted ? 'true' : 'false');
    if (!this.muted) {
      this.playBeep(800, 0.05);
    }
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    localStorage.setItem('retro_portfolio_muted', this.muted ? 'true' : 'false');
  }

  // Play mouse down click sound
  public playMouseDown() {
    if (this.muted) return;
    if (this.mouseDownClip) {
      const clone = this.mouseDownClip.cloneNode() as HTMLAudioElement;
      clone.volume = 0.4;
      clone.play().catch(() => this.synthClick(600, 0.02));
    } else {
      this.synthClick(600, 0.02);
    }
  }

  // Play mouse up click sound
  public playMouseUp() {
    if (this.muted) return;
    if (this.mouseUpClip) {
      const clone = this.mouseUpClip.cloneNode() as HTMLAudioElement;
      clone.volume = 0.4;
      clone.play().catch(() => this.synthClick(900, 0.015));
    } else {
      this.synthClick(900, 0.015);
    }
  }

  // Mechanical keystroke sound
  public playKeyStroke() {
    if (this.muted) return;
    if (this.keyClips.length > 0) {
      this.keyIndex = (this.keyIndex + 1) % this.keyClips.length;
      const clip = this.keyClips[this.keyIndex];
      const clone = clip.cloneNode() as HTMLAudioElement;
      clone.volume = 0.3;
      clone.play().catch(() => this.synthClick(400 + Math.random() * 200, 0.02));
    } else {
      this.synthClick(400 + Math.random() * 200, 0.02);
    }
  }

  // Startup chime
  public playStartup() {
    if (this.muted) return;
    if (this.startupClip) {
      this.startupClip.currentTime = 0;
      this.startupClip.play().catch(() => this.synthRetroChime());
    } else {
      this.synthRetroChime();
    }
  }

  // Synthetic frequency beep
  public playBeep(freq = 440, duration = 0.08) {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  // Window minimize/maximize whoosh sound effect
  public playWhoosh(upwards = true) {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      const duration = 0.14;

      osc.type = 'sine';
      if (upwards) {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + duration);
      } else {
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + duration);
      }

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Authentic Windows 98 chord.wav popup chime
  public playChord() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;
      notes.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      });
    } catch {}
  }

  // Windows 98 ding.wav warning / notification
  public playDing() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6 bell

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  // Heavy mechanical pull-chain lamp click
  public playLampClick() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Spring click
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(260, now);
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.05);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // Metallic latch release
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          const t2 = ctx.currentTime;
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(1400, t2);
          osc2.frequency.exponentialRampToValueAtTime(400, t2 + 0.04);
          gain2.gain.setValueAtTime(0.1, t2);
          gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.04);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t2);
          osc2.stop(t2 + 0.04);
        } catch {}
      }, 40);
    } catch {}
  }

  // CRT degauss coil discharge hum
  public playDegauss() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.7);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    } catch {}
  }

  // Ceramic coffee mug clink
  public playCoffeeClink() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High pitch ceramic ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2150, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Heavy tactile PC power button switch
  public playPowerButton() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Deep mechanical thud
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(160, now);
      osc1.frequency.exponentialRampToValueAtTime(50, now + 0.08);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Relay click
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          const t2 = ctx.currentTime;
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(820, t2);
          osc2.frequency.exponentialRampToValueAtTime(200, t2 + 0.03);
          gain2.gain.setValueAtTime(0.12, t2);
          gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.03);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t2);
          osc2.stop(t2 + 0.03);
        } catch {}
      }, 35);
    } catch {}
  }

  // Plant leaves soft rustle
  public playPlantRustle() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(280, now + 0.12);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  // Retro Snake Eat fruit chirp
  public playSnakeEat() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Game over buzzer
  public playGameOver() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.4);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  // Synthetic mechanical click
  private synthClick(freq: number, duration: number) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore
    }
  }

  // Synthetic retro chord chime (fallback for startup)
  private synthRetroChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const notes = [261.63, 329.63, 392.0, 523.25]; // C major retro chord
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        } catch {}
      }, idx * 140);
    });
  }
}

export const retroAudio = new RetroAudioManager();
