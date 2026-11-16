class WebAudioSoundEngine {
  private ctx: AudioContext | null = null;
  private sfxVolume = 0.8;
  private musicVolume = 0.4;
  private sfxMuted = false;
  private musicMuted = false;
  private isBgmPlaying = false;
  private bgmInterval: any = null;

  constructor() {
    // Lazily initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
  }

  public setSfxMuted(muted: boolean) {
    this.sfxMuted = muted;
  }

  public setMusicMuted(muted: boolean) {
    this.musicMuted = muted;
    if (muted && this.isBgmPlaying) {
      this.stopBGM();
    } else if (!muted && !this.isBgmPlaying) {
      this.startBGM();
    }
  }

  // --- SOUND EFFECTS ---

  public playSelect() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playSwap() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playInvalidSwap() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.14);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playLand() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(170, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playPop() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.06);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playMatch(comboCount = 1) {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.50, 1174.66];
    const baseFreq = notes[Math.min(notes.length - 1, (comboCount - 1) % notes.length)];

    const now = this.ctx.currentTime;
    [1, 1.5].forEach((mult, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * mult, now + i * 0.04);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.22);
    });
  }

  public playStripe() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.25);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playWrapped() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.35);

    gain.gain.setValueAtTime(0.5 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playColorBomb() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const freqs = [440, 554, 659, 830, 987, 1318];
    const now = this.ctx.currentTime;

    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
  }

  public playCombo() {
    if (this.sfxMuted) return;
    this.playWrapped();
    setTimeout(() => this.playColorBomb(), 80);
  }

  public playBooster() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [600, 800, 1000, 1200].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.28 * this.sfxVolume, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.15);
    });
  }

  public playWin() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const melody = [523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;

    melody.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.14);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, now + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + (i === melody.length - 1 ? 0.7 : 0.2));

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.7);
    });
  }

  public playFail() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const chord = [392.00, 349.23, 311.13, 261.63];
    const now = this.ctx.currentTime;

    chord.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.18);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.4);
    });
  }

  // --- BACKGROUND MUSIC ---
  public startBGM() {
    if (this.musicMuted || this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    const progression = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [196.00, 246.94, 293.66], // G major
    ];
    let chordIdx = 0;

    const playBgmChord = () => {
      if (!this.isBgmPlaying || this.musicMuted || !this.ctx) return;
      const chord = progression[chordIdx];
      chordIdx = (chordIdx + 1) % progression.length;

      const now = this.ctx.currentTime;
      chord.forEach((freq, noteIdx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 1.5, now + noteIdx * 0.12);

        gain.gain.setValueAtTime(0.04 * this.musicVolume, now + noteIdx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + noteIdx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + noteIdx * 0.12);
        osc.stop(now + noteIdx * 0.12 + 1.2);
      });
    };

    playBgmChord();
    this.bgmInterval = setInterval(playBgmChord, 1800);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const SoundEngine = new WebAudioSoundEngine();
