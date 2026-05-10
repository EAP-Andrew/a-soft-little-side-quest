// audio.js — Web Audio API powered SFX and a soft looping music bed.
// All sounds are generated; nothing external is loaded.

import { AUDIO } from '../config.js';

export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicRunning = false;
    this._wantMusic = false;

    // Web Audio contexts must be unlocked by a user gesture.
    const unlock = () => {
      if (!this.ctx) this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          if (this._wantMusic && !this.musicRunning) this._startMusicTicker();
        });
      } else if (this._wantMusic && !this.musicRunning) {
        this._startMusicTicker();
      }
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : AUDIO.MASTER;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = AUDIO.MUSIC;
    this.musicGain.connect(this.master);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = AUDIO.SFX;
    this.sfxGain.connect(this.master);
  }

  toggleMute() {
    if (!this.ctx) this.init();
    this.muted = !this.muted;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(
      this.muted ? 0 : AUDIO.MASTER,
      this.ctx.currentTime + 0.15
    );
    return this.muted;
  }

  // ----- low-level synth helpers -----
  _envelope(g, t, attack, decay, sustain, release, peak) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.linearRampToValueAtTime(peak * sustain, t + attack + decay);
    g.gain.linearRampToValueAtTime(0, t + attack + decay + release);
  }

  _tone({
    freq = 440, type = 'sine', duration = 0.2,
    attack = 0.005, decay = 0.05, sustain = 0.5, release = 0.1,
    peak = 0.4, freqEnd = null, when = 0,
  }) {
    if (!this.ctx) this.init();
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (freqEnd != null) {
      o.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t + duration);
    }
    o.connect(g); g.connect(this.sfxGain);
    this._envelope(g, t, attack, decay, sustain, release, peak);
    o.start(t);
    o.stop(t + duration + release + 0.05);
  }

  _noise(duration, peak = 0.2, filterFreq = 1000) {
    if (!this.ctx) this.init();
    const t = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * duration), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const filt = this.ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    src.connect(filt); filt.connect(g); g.connect(this.sfxGain);
    this._envelope(g, t, 0.005, 0.04, 0.4, duration, peak);
    src.start(t); src.stop(t + duration + 0.05);
  }

  // ----- SFX vocabulary -----
  jump()        { this._tone({ freq: 380, freqEnd: 720, type: 'square',   duration: 0.18, peak: 0.18 }); }
  sprintStep()  { this._noise(0.06, 0.10, 1500); }
  interact()    { this._tone({ freq: 540, freqEnd: 760, type: 'triangle', duration: 0.16, peak: 0.20 }); }
  dummyHit() {
    this._tone({ freq: 220, freqEnd: 160, type: 'square', duration: 0.18, peak: 0.18 });
    this._noise(0.08, 0.14, 800);
  }
  cakeAppear() {
    this._tone({ freq: 523, type: 'sine',     duration: 0.22, peak: 0.30, when: 0.00 });
    this._tone({ freq: 659, type: 'sine',     duration: 0.22, peak: 0.30, when: 0.12 });
    this._tone({ freq: 784, type: 'sine',     duration: 0.40, peak: 0.30, when: 0.24 });
    this._tone({ freq: 1046, type: 'triangle', duration: 0.55, peak: 0.18, when: 0.40 });
  }
  candleBlow() {
    this._noise(0.18, 0.26, 600);
    this._tone({ freq: 220, freqEnd: 80, type: 'sine', duration: 0.18, peak: 0.10 });
  }
  letterFall() {
    this._tone({ freq: 700, freqEnd: 1300, type: 'sine', duration: 0.6, peak: 0.16 });
    this._tone({ freq: 1100, freqEnd: 1600, type: 'sine', duration: 0.45, peak: 0.10, when: 0.15 });
  }
  uiOpen()  { this._tone({ freq: 600, freqEnd: 900, type: 'triangle', duration: 0.18, peak: 0.18 }); }
  uiClose() { this._tone({ freq: 700, freqEnd: 400, type: 'triangle', duration: 0.18, peak: 0.18 }); }
  celebration() {
    [523, 659, 784, 1046, 1318].forEach((f, i) =>
      this._tone({ freq: f, type: 'triangle', duration: 0.22, peak: 0.22, when: i * 0.08 })
    );
  }
  levelUp() {
    [392, 523, 659, 784, 1046].forEach((f, i) =>
      this._tone({ freq: f, type: 'square', duration: 0.16, peak: 0.18, when: i * 0.07 })
    );
    this._tone({ freq: 1568, type: 'triangle', duration: 0.6, peak: 0.16, when: 0.40 });
  }

  // ----- Music: gentle 4-chord arpeggio + sub-bass -----
  startMusic() {
    this._wantMusic = true;
    if (!this.ctx) this.init();
    if (this.ctx.state === 'running' && !this.musicRunning) this._startMusicTicker();
  }
  stopMusic() {
    this._wantMusic = false;
    this.musicRunning = false;
    if (this.musicTimer) clearTimeout(this.musicTimer);
  }

  _startMusicTicker() {
    if (this.musicRunning) return;
    this.musicRunning = true;
    // C — Am — F — G   (warm pop progression)
    const chords = [
      [262, 330, 392], // C
      [220, 262, 330], // Am
      [175, 220, 262], // F
      [196, 247, 294], // G
    ];
    let chordIdx = 0;
    let stepIdx = 0;
    const stepTime = 0.42; // seconds per arpeggio step

    const tick = () => {
      if (!this.musicRunning || !this.ctx) return;
      const ch = chords[chordIdx];
      const note = ch[stepIdx % ch.length];
      const t = this.ctx.currentTime;

      // Sweet sine arp (one octave up)
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.value = note * 2;
      o.connect(g); g.connect(this.musicGain);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.45, t + 0.04);
      g.gain.linearRampToValueAtTime(0.0,  t + stepTime * 1.4);
      o.start(t); o.stop(t + stepTime * 1.5);

      // Soft pad on first step of chord
      if (stepIdx === 0) {
        ch.forEach((f) => {
          const po = this.ctx.createOscillator();
          const pg = this.ctx.createGain();
          po.type = 'triangle';
          po.frequency.value = f;
          po.connect(pg); pg.connect(this.musicGain);
          pg.gain.setValueAtTime(0, t);
          pg.gain.linearRampToValueAtTime(0.05, t + 0.20);
          pg.gain.linearRampToValueAtTime(0.0,  t + stepTime * 4);
          po.start(t); po.stop(t + stepTime * 4.1);
        });
        // Sub bass
        const b = this.ctx.createOscillator();
        const bg = this.ctx.createGain();
        b.type = 'sine';
        b.frequency.value = ch[0] / 2;
        b.connect(bg); bg.connect(this.musicGain);
        bg.gain.setValueAtTime(0, t);
        bg.gain.linearRampToValueAtTime(0.40, t + 0.10);
        bg.gain.linearRampToValueAtTime(0.0,  t + stepTime * 4);
        b.start(t); b.stop(t + stepTime * 4.1);
      }

      stepIdx++;
      if (stepIdx >= 4) {
        stepIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }
      this.musicTimer = setTimeout(tick, stepTime * 1000);
    };
    tick();
  }
}
