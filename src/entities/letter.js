// letter.js — feather-falling letter with 5-frame animation while in air,
// freezes on the dedicated land sprite once it touches down.

import { LETTER, SPAWN } from '../config.js';

export class Letter {
  constructor(startX, startY, groundY) {
    this.startX = startX;
    this.x = startX; this.y = startY;
    this.vy = LETTER.START_VY;
    this.t = 0;
    this.rot = 0;
    this.groundY = groundY + SPAWN.LETTER_GROUND_OFFSET;
    this.landed = false;
    this.opened = false;
    this.spawned = true;
    this.active = true;
    this.h = LETTER.H;
    this.w = LETTER.H;       // square fall sprite by default
    this.frame = 0;
    this.frameT = 0;
  }

  update(dt) {
    if (this.landed) return;
    this.t += dt;
    this.vy = Math.min(LETTER.MAX_VY, this.vy + LETTER.ACCEL_VY * dt);
    this.y += this.vy * dt;
    this.x = this.startX + Math.sin(this.t * 1.1) * LETTER.DRIFT_AMP;
    this.rot = Math.sin(this.t * 1.3) * LETTER.ROT_AMP;
    this.frameT += dt;
    this.frame = Math.floor(this.frameT * LETTER.FRAME_FPS) % 5;
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.landed = true;
      this.rot = 0;
    }
  }

  // sprites: { fall: [Img×5], land: Img }
  // Width is derived from each sprite's natural aspect so nothing stretches.
  draw(ctx, sprites) {
    const img = this.landed ? sprites.land : sprites.fall[this.frame];
    if (!img || !img.naturalWidth) return;
    const h = this.h;
    const w = h * (img.naturalWidth / img.naturalHeight);
    ctx.save();
    ctx.translate(this.x, this.y - h / 2);
    ctx.rotate(this.rot);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

