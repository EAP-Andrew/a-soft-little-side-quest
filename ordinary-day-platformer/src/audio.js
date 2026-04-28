let ctx;
let muted = false;
let currentMusic;

function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip(freq = 440, dur = 0.1, type = 'square', gain = 0.05) {
  if (muted) return;
  const c = ensureCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type; osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur);
}

export function setMuted(v) { muted = v; if (currentMusic) currentMusic.gain.value = muted ? 0 : 0.045; }
export function getMuted() { return muted; }

export function playSfx(name) {
  const map = {
    jump: () => blip(540, 0.09), collectible: () => blip(780, 0.08), defeat: () => blip(220, 0.12), damage: () => blip(150, 0.2, 'sawtooth'),
    checkpoint: () => blip(620, 0.16, 'triangle'), interact: () => blip(440, 0.06), letter: () => blip(310, 0.2, 'triangle'), rocket: () => blip(90, 0.4, 'sawtooth', 0.08),
    candle: () => blip(700, 0.05), blow: () => blip(180, 0.2), ending: () => blip(500, 0.3, 'triangle'), bark: () => blip(360, 0.08, 'square'), splash: () => blip(260, 0.08),
    bubble: () => blip(850, 0.05, 'sine'), seashell: () => blip(940, 0.07, 'triangle'),
  };
  (map[name] || (() => blip()))();
}

export function playMusic(preset = 'menu') {
  if (muted) return;
  const c = ensureCtx();
  if (currentMusic) currentMusic.oscs.forEach((o) => o.stop());
  const gain = c.createGain(); gain.gain.value = 0.045; gain.connect(c.destination);
  const sets = {
    menu: [261.63, 329.63, 392], gameplay: [293.66, 369.99, 440], sea: [220, 293.66, 329.63], sky: [246.94, 311.13, 392], ending: [196, 261.63, 329.63],
  };
  const seq = sets[preset] || sets.menu;
  const oscs = seq.map((f, i) => {
    const osc = c.createOscillator(); osc.type = i === 0 ? 'triangle' : 'square'; osc.frequency.value = f;
    osc.connect(gain); osc.start(); return osc;
  });
  currentMusic = { oscs, gain };
}
