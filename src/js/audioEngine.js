export class AudioEngine {
  constructor() {
    this.muted = false;
    this._ctx = null;
  }
  _ensureContext() {
    if (!this._ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) this._ctx = new Ctx();
    }
    return this._ctx;
  }

  /**
   * @param {number} freq 
   * @param {number} duration 
   * @param {OscillatorType} type -
   * @param {number} gainStart 
   * @param {number} delay
   */
  _tone(freq, duration, type = 'sine', gainStart = 0.15, delay = 0) {
    if (this.muted) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainStart, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playAdd() {
    this._tone(520, 0.12, 'triangle', 0.13);
  }
  
  playRemove() {
    this._tone(320, 0.12, 'triangle', 0.11);
  }

  playCorrect() {
    this._tone(523.25, 0.16, 'sine', 0.16, 0);
    this._tone(659.25, 0.16, 'sine', 0.16, 0.09);
    this._tone(783.99, 0.24, 'sine', 0.18, 0.18);
  }

  playWrong() {
    this._tone(220, 0.18, 'sawtooth', 0.10, 0);
    this._tone(180, 0.22, 'sawtooth', 0.10, 0.05);
  }

  playLevelComplete() {
    this._tone(392.0, 0.12, 'sine', 0.15, 0);
    this._tone(523.25, 0.12, 'sine', 0.15, 0.10);
    this._tone(659.25, 0.12, 'sine', 0.15, 0.20);
    this._tone(783.99, 0.28, 'sine', 0.18, 0.30);
  }


  playHint() {
    this._tone(440, 0.14, 'sine', 0.10);
  }

  
  playAchievement() {
    this._tone(880, 0.14, 'triangle', 0.15, 0);
    this._tone(1108.73, 0.22, 'triangle', 0.16, 0.1);
  }
}
