// Web Audio API Synthesizer for Lucky Draw SFX
// No external mp3 files required - works reliably in any browser environment!

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private spinOscillator: OscillatorNode | null = null;
  private spinGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('lucky_draw_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('lucky_draw_muted', String(this.isMuted));
    }
    if (this.isMuted) {
      this.stopSpinLoop();
    }
    return this.isMuted;
  }

  // Fast mechanical ticker sound during roulette
  public playTick(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440 * pitchMultiplier, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore audio context exceptions
    }
  }

  // Dramatic continuous rising suspense loop during spin
  public startSpinLoop() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.stopSpinLoop();

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      // Slowly rise pitch to build tension
      osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 4.0);

      // Low pass filter for muffled rumble
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 4.0);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      this.spinOscillator = osc;
      this.spinGain = gain;
    } catch {
      // Ignore audio error
    }
  }

  public stopSpinLoop() {
    if (this.spinOscillator && this.ctx) {
      try {
        if (this.spinGain) {
          this.spinGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
        }
        this.spinOscillator.stop(this.ctx.currentTime + 0.09);
      } catch {
        // Ignore
      }
      this.spinOscillator = null;
      this.spinGain = null;
    }
  }

  // Pop chime when an individual card locks in (Batch draw)
  public playCardReveal(slotIndex: number = 0) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pentatonic scale step
      const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
      const freq = pentatonic[slotIndex % pentatonic.length] || 523.25;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Ignore
    }
  }

  // Grand celebratory victory fanfare on draw completion
  public playFanfare() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.stopSpinLoop();

    // Orchestral arpeggio: C5 -> E5 -> G5 -> C6 -> Sustained chord
    const notes = [
      { f: 523.25, t: 0.00, d: 0.15 },
      { f: 659.25, t: 0.12, d: 0.15 },
      { f: 783.99, t: 0.24, d: 0.18 },
      { f: 1046.50, t: 0.38, d: 1.20 }, // Grand high C
      { f: 1318.51, t: 0.40, d: 1.10 }, // High E shimmer
    ];

    notes.forEach(({ f, t, d }) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);

        gain.gain.setValueAtTime(0.22, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + d);
      } catch {
        // Ignore
      }
    });
  }

  // Tension-building drumroll for Grand Prize reveals
  public playDrumRoll(durationSec: number = 3.5) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const stepCount = Math.floor(durationSec * 22);

    for (let i = 0; i < stepCount; i++) {
      const stepTime = startTime + (i / stepCount) * durationSec;
      const progress = i / stepCount;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(70 + progress * 50, stepTime);

        // Volume swells towards the climax
        const vol = 0.08 + progress * 0.18;
        gain.gain.setValueAtTime(vol, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(stepTime);
        osc.stop(stepTime + 0.05);
      } catch {
        // Ignore
      }
    }
  }
}

export const sound = new SoundEngine();
