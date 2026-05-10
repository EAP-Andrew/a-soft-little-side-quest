// cake.js — birthday cake. The mini-game just asks the player to click the
// cake CAKE.CANDLE_COUNT times; we don't track per-candle state any more.

import { CAKE } from '../config.js';

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export class Cake {
  constructor(x, groundY) {
    this.x = x;
    this.y = groundY;
    this.w = CAKE.W; this.h = CAKE.H;
    this.spawnT = 0;
    this.spawned = false;
    this.active = false;
    this.glow = 0;
    this.clicksRemaining = CAKE.CANDLE_COUNT;
  }

  // Shape used to detect cake clicks.
  hits(wx, wy) {
    const cx = this.x;
    const cy = this.y - this.h / 2;
    return Math.abs(wx - cx) <= this.w / 2 && Math.abs(wy - cy) <= this.h / 2;
  }

  get allBlown() { return this.clicksRemaining <= 0; }
  resetClicks()  { this.clicksRemaining = CAKE.CANDLE_COUNT; }

  update(dt) {
    if (!this.spawned) return;
    if (this.spawnT < 1) this.spawnT = Math.min(1, this.spawnT + dt * CAKE.SPAWN_RATE);
    this.glow += dt;
  }

  // sprites: array of 28 frames (cake_0 = full, cake_27 = empty).
  // Frame index = clicks already made = CANDLE_COUNT - clicksRemaining.
  draw(ctx, sprites) {
    if (!this.spawned) return;
    const idx    = Math.min(sprites.length - 1, CAKE.CANDLE_COUNT - this.clicksRemaining);
    const sprite = sprites[idx];
    const s      = easeOut(this.spawnT);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);
    if (sprite) ctx.drawImage(sprite, -this.w / 2, -this.h, this.w, this.h);
    ctx.restore();
  }
}
