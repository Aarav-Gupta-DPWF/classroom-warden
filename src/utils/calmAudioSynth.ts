/**
 * WardenCalmEngine — procedural Web Audio (no CDN). Warm, low-pass tones.
 */
export type SynthSound = 'uiClick' | 'successChime' | 'alertSoft';

export class WardenCalmSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private masterLevel = 0.3;

  async init(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.masterLevel;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    return this.ctx;
  }

  setOutput(volume: number, muted: boolean) {
    this.masterLevel = volume;
    if (!this.master || !this.ctx) return;
    const target = muted ? 0 : volume;
    this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
    if (this.ambientGain && !muted) {
      const amb = volume * 0.12;
      this.ambientGain.gain.setTargetAtTime(amb, this.ctx.currentTime, 0.15);
    }
  }

  private t() {
    return this.ctx!.currentTime;
  }

  private blip(
    freq: number,
    duration: number,
    peak: number,
    type: OscillatorType = 'sine',
    lp = 1400,
  ) {
    if (!this.ctx || !this.master) return;
    const start = this.t();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lp;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  playUiClick() {
    const v = this.masterLevel * 0.35;
    this.blip(280, 0.07, v, 'sine', 900);
    window.setTimeout(() => this.blip(420, 0.05, v * 0.65, 'sine', 1100), 28);
  }

  playSuccess() {
    const v = this.masterLevel * 0.4;
    this.blip(392, 0.32, v, 'sine', 1200);
    window.setTimeout(() => this.blip(523.25, 0.38, v * 0.85, 'sine', 1400), 140);
    window.setTimeout(() => this.blip(659.25, 0.28, v * 0.5, 'triangle', 1600), 280);
  }

  playWarning() {
    const v = this.masterLevel * 0.38;
    this.blip(165, 0.42, v, 'triangle', 500);
  }

  startAmbient() {
    if (!this.ctx || !this.master || this.ambientGain) return;
    const start = this.t();
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(this.masterLevel * 0.1, start + 2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;

    const freqs = [55, 82.5];
    const oscs = freqs.map((f) => {
      const o = this.ctx!.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      o.connect(filter);
      o.start(start);
      return o;
    });

    filter.connect(gain);
    gain.connect(this.master);
    this.ambientOscs = oscs;
    this.ambientGain = gain;
  }

  stopAmbient() {
    if (!this.ctx || !this.ambientGain) return;
    const end = this.t();
    this.ambientGain.gain.setTargetAtTime(0, end, 0.45);
    const oscs = [...this.ambientOscs];
    const gain = this.ambientGain;
    this.ambientOscs = [];
    this.ambientGain = null;
    window.setTimeout(() => {
      oscs.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* already stopped */
        }
      });
      try {
        gain.disconnect();
      } catch {
        /* noop */
      }
    }, 1000);
  }

  isAmbientPlaying() {
    return this.ambientGain !== null;
  }
}

export const calmSynth = new WardenCalmSynth();
