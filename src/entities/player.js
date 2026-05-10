// player.js — Annie: movement, animation, simple AABB ground collision.

import { PLAYER } from '../config.js';
import { drawFlipped, drawFallback } from './_draw.js';

export class Player {
  constructor(x, groundY) {
    this.x = x;
    this.y = groundY;
    this.vx = 0; this.vy = 0;
    this.w = PLAYER.W; this.h = PLAYER.H;
    this.facing = 1;
    this.grounded = true;
    this.state = 'idle';
    this.frame = 0; this.frameT = 0;
    this.interactT = 0;
    this.celebrating = false;
    this.lockMovement = false;
    this._stepT = 0;
    this.worldMin = 32;
    this.worldMax = 9999;
  }

  setWorldBounds(min, max) {
    this.worldMin = min; this.worldMax = max;
  }

  triggerInteract() { this.interactT = PLAYER.INTERACT_T; this.vx = 0; }
  startCelebrate()  { this.celebrating = true; this.vx = 0; this.frame = 0; this.frameT = 0; }
  stopCelebrate()   { this.celebrating = false; this.frame = 0; this.frameT = 0; }

  update(dt, input, platforms, audio) {
    const canControl = !this.lockMovement && !this.celebrating && this.interactT <= 0;

    let dir = 0;
    let sprinting = false;
    if (canControl) {
      if (input.isHeld('left'))  dir -= 1;
      if (input.isHeld('right')) dir += 1;
      sprinting = input.isHeld('sprint');
    }
    const cap = sprinting ? PLAYER.SPRINT_SPEED : PLAYER.MOVE_SPEED;

    if (dir !== 0) {
      this.vx += dir * PLAYER.ACCEL * dt;
      if (this.vx >  cap) this.vx =  cap;
      if (this.vx < -cap) this.vx = -cap;
      this.facing = dir;
    } else {
      const sgn = Math.sign(this.vx);
      const mag = Math.max(0, Math.abs(this.vx) - PLAYER.FRICTION * dt);
      this.vx = sgn * mag;
    }

    if (canControl && this.grounded) {
      if (input.consume('jump')) {
        this.vy = -PLAYER.JUMP_VEL;
        this.grounded = false;
        audio.jump();
      }
    } else {
      input.consume('jump');           // discard so it doesn't queue
    }

    // Gravity
    this.vy += PLAYER.GRAVITY * dt;
    if (this.vy > 1200) this.vy = 1200;

    // Move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Ground collision. Snap any time we're descending and at/below the
    // platform top — no swept "previous frame must be above" check, which
    // could fail on the first post-refresh frame and let us fall through.
    this.grounded = false;
    for (const p of platforms) {
      const left  = this.x - this.w / 2;
      const right = this.x + this.w / 2;
      if (right > p.x && left < p.x + p.w) {
        if (this.vy >= 0 && this.y >= p.y) {
          this.y = p.y;
          this.vy = 0;
          this.grounded = true;
        }
      }
    }

    // World bounds
    if (this.x < this.worldMin) { this.x = this.worldMin; if (this.vx < 0) this.vx = 0; }
    if (this.x > this.worldMax) { this.x = this.worldMax; if (this.vx > 0) this.vx = 0; }

    // State transition
    let next;
    if (this.celebrating)              next = 'celebrate';
    else if (this.interactT > 0)       next = 'interact';
    else if (!this.grounded)           next = 'jump';
    else if (Math.abs(this.vx) > 220)  next = 'sprint';
    else if (Math.abs(this.vx) > 12)   next = 'walk';
    else                                next = 'idle';

    if (next !== this.state) {
      this.state = next;
      this.frame = 0;
      this.frameT = 0;
    }
    this.frameT += dt;
    const fps = next === 'sprint' ? 14 : (next === 'walk' ? 10 : 8);
    const frames = PLAYER.ANIM[next] || 1;
    this.frame = Math.floor(this.frameT * fps) % frames;

    // Sprint footstep tick
    if (next === 'sprint' && this.grounded) {
      this._stepT += dt;
      if (this._stepT > PLAYER.STEP_INTERVAL) {
        audio.sprintStep();
        this._stepT = 0;
      }
    } else {
      this._stepT = 0;
    }

    if (this.interactT > 0) this.interactT -= dt;
  }

  draw(ctx, sprites) {
    let img;
    switch (this.state) {
      case 'walk':      img = sprites.charWalk[this.frame]; break;
      case 'sprint':    img = sprites.charSprint[this.frame]; break;
      case 'jump':      img = sprites.charSprint[2] || sprites.charWalk[3]; break;
      case 'interact':  img = sprites.charInteract[0]; break;
      case 'celebrate': img = sprites.charCelebrate[this.frame]; break;
      default:          img = sprites.charIdle[this.frame];
    }
    const x = this.x - this.w / 2, y = this.y - this.h;
    if (drawFallback(ctx, img, x, y, this.w, this.h, '#ff6aa1', 'Annie')) return;
    drawFlipped(ctx, img, x, y, this.w, this.h, this.facing < 0);
  }
}
