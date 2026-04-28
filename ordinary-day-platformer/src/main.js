import { Game } from './game.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

game.boot();

function resize() {
  const small = window.innerWidth < 980 || window.innerHeight < 560;
  document.getElementById('screenTooSmall').classList.toggle('hidden', !small);
}
window.addEventListener('resize', resize);
resize();
