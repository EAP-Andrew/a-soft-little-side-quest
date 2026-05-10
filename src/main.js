// main.js — entry point.
// Preloads assets, instantiates core systems, hands them to the Game.

import { preload } from './core/assets.js';
import { Audio }   from './core/audio.js';
import { Input }   from './core/input.js';
import { UI }      from './ui/ui.js';
import { Game }    from './game.js';

function detectTouch() {
  // Belt-and-suspenders detection. Brave's fingerprinting shield masks some
  // of these (like maxTouchPoints), so we OR many signals plus a size check.
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) <= 900;
  const isTouch =
    matchMedia('(hover: none) and (pointer: coarse)').matches ||
    matchMedia('(any-pointer: coarse)').matches ||
    'ontouchstart' in window ||
    (navigator.maxTouchPoints || 0) > 0 ||
    smallScreen; // last resort: small viewport ⇒ probably a phone
  if (isTouch) document.body.classList.add('touch');
  // Fallback: if anyone ever taps the screen, treat it as touch from now on.
  window.addEventListener('touchstart', () => {
    document.body.classList.add('touch');
  }, { once: true, passive: true });
}

function trackOrientation() {
  const update = () => {
    const portrait = window.innerHeight > window.innerWidth;
    document.body.classList.toggle('portrait', portrait);
    // Compact = phone-sized. Use the SHORT screen dimension because
    // phones always have a small short side (~320–500 in landscape),
    // while tablets are at least ~768. Width alone misses wide phones
    // that report viewports up to ~1180 in landscape.
    const minDim = Math.min(window.innerWidth, window.innerHeight);
    document.body.classList.toggle('compact', minDim <= 600);
  };
  update();
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', update);
}

async function boot() {
  detectTouch();
  trackOrientation();

  const fill   = document.getElementById('loader-fill');
  const loader = document.getElementById('loader');
  const fade   = document.getElementById('fade');

  const assets = await preload((p) => {
    fill.style.width = (p * 100).toFixed(1) + '%';
  });

  const audio = new Audio();
  const input = new Input();
  const ui    = new UI(audio);

  loader.classList.add('hidden');
  setTimeout(() => loader.style.display = 'none', 700);
  setTimeout(() => fade.classList.add('hidden'), 120);

  const game = new Game(assets, input, audio, ui);
  game.start();

  // Mute toggles (HUD button + pause-menu button)
  const muteBtn  = document.getElementById('mute-btn');
  const muteBtn2 = document.getElementById('mute-btn-2');
  const onMute = () => {
    const muted = audio.toggleMute();
    muteBtn.textContent = muted ? '🔇' : '🔊';
  };
  muteBtn.addEventListener('click', onMute);
  muteBtn2.addEventListener('click', onMute);
}

window.addEventListener('load', boot);
