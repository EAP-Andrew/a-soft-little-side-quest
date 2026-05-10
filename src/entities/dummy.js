// dummy.js — animated training dummy. Pure interaction target, no AI.

import { DUMMY } from '../config.js';
import { drawFlipped, drawFallback } from './_draw.js';

export class Dummy {
  constructor(x, groundY) {
    this.x = x;
    this.y = groundY;            // foot position
    this.w = DUMMY.W; this.h = DUMMY.H;
    this.frame = 0; this.t = 0;
    this.interactT = 0;
    this.facing = -1;            // looks toward player on left side approach
    this.active = true;
  }

  update(dt) {
    this.t += dt;
    if (this.interactT > 0) this.interactT -= dt;
    this.frame = Math.floor(this.t * DUMMY.IDLE_FPS) % DUMMY.IDLE_FRAMES;
  }

  draw(ctx, sprites) {
    const img = this.interactT > 0
      ? sprites.dummyInteract[0]
      : sprites.dummyIdle[this.frame];
    const x = this.x - this.w / 2, y = this.y - this.h;
    if (drawFallback(ctx, img, x, y, this.w, this.h, '#c8a878', 'Dummy')) return;
    drawFlipped(ctx, img, x, y, this.w, this.h, this.facing < 0);
  }
}
