import { Game } from './game.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

game.boot();

function resize() {
  const small = window.innerWidth < 980 || window.innerHeight < 560;
  document.getElementById('screenTooSmall').classList.toggle('hidden', !small);

  const appPadding = Math.min(window.innerWidth * 0.03, 22);
  const maxW = window.innerWidth - appPadding * 2;
  const maxH = window.innerHeight - appPadding * 2;
  const w = Math.min(1280, maxW, (maxH * 16) / 9);
  canvas.style.width = `${Math.max(320, w)}px`;
}

window.addEventListener('resize', resize);
resize();
