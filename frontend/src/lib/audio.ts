// Zero-asset neon-arcade SFX via Web Audio oscillators — nothing to download,
// no latency. The AudioContext is created lazily on the first user gesture
// (the start button) to satisfy browser autoplay policies.

type ToneOpts = {
  type?: OscillatorType;
  f0: number;
  f1?: number;
  dur: number;
  gain?: number;
  at?: number;
};

const SOUND_KEY = "ra_sound_enabled";

class Sfx {
  private ctx: AudioContext | null = null;
  enabled = true;

  constructor() {
    try {
      this.enabled = localStorage.getItem(SOUND_KEY) !== "0";
    } catch {
      // default to on
    }
  }

  setEnabled(value: boolean) {
    this.enabled = value;
    try {
      localStorage.setItem(SOUND_KEY, value ? "1" : "0");
    } catch {
      // ignore
    }
  }

  private ac(): AudioContext | null {
    try {
      if (!this.ctx) this.ctx = new AudioContext();
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private tone({ type = "sine", f0, f1, dur, gain = 0.1, at = 0 }: ToneOpts) {
    if (!this.enabled) return;
    const ctx = this.ac();
    if (!ctx) return;
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t0);
    if (f1) osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(env).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  start() {
    this.tone({ type: "triangle", f0: 440, f1: 880, dur: 0.12, gain: 0.08 });
  }

  correct() {
    this.tone({ f0: 880, f1: 1200, dur: 0.07, gain: 0.09 });
  }

  reverse() {
    this.tone({ f0: 700, f1: 1400, dur: 0.08, gain: 0.09 });
    this.tone({ f0: 1050, f1: 1700, dur: 0.07, gain: 0.06, at: 0.05 });
  }

  milestone() {
    [523, 659, 783].forEach((f, i) =>
      this.tone({ type: "triangle", f0: f, dur: 0.09, gain: 0.08, at: i * 0.06 }),
    );
  }

  gameOver() {
    this.tone({ type: "sawtooth", f0: 220, f1: 60, dur: 0.4, gain: 0.09 });
    this.tone({ type: "square", f0: 110, f1: 45, dur: 0.35, gain: 0.045 });
  }

  newRecord() {
    [523, 659, 783, 1046].forEach((f, i) =>
      this.tone({ type: "triangle", f0: f, dur: 0.16, gain: 0.08, at: 0.15 * i }),
    );
  }
}

export const sfx = new Sfx();
