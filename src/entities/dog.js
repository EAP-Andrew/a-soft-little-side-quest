// dog.js — companion that follows Annie with smooth lerp + cute reactions.

import { DOG } from '../config.js';
import { drawFlipped, drawFallback } from './_draw.js';

const randCooldown = () =>
  DOG.HOP_COOLDOWN.MIN + Math.random() * (DOG.HOP_COOLDOWN.MAX - DOG.HOP_COOLDOWN.MIN);

export class Dog {
  constructor(x, groundY) {
    this.x = x; this.y = groundY;
    this.vx = 0; this.vy = 0;
    this.w = DOG.W; this.h = DOG.H;
    this.facing = 1;
    this.grounded = true;
    this.state = 'idle';
    this.frame = 0; this.frameT = 0;
    this.celebrating = false;
    this.lookAt = null;     // { x, y } when staring at letter
    this.interactT = 0;     // > 0 → play interact anim
    this.worldMin = 32;
    this.worldMax = 9999;
    this.hopCooldown = randCooldown();
  }

  setWorldBounds(min, max) { this.worldMin = min; this.worldMax = max; }
  startCelebrate() { this.celebrating = true; this.state = 'celebrate'; this.frame = 0; this.frameT = 0; }
  stopCelebrate()  { this.celebrating = false; this.frame = 0; this.frameT = 0; }
  setLookAt(t) {
    if (!this.lookAt) { this.state = 'interact'; this.frame = 0; this.frameT = 0; }
    this.lookAt = t;
  }
  clearLookAt() { this.lookAt = null; }
  // Plays the interact sprite for a short burst (e.g. when Annie hits E).
  playInteract(duration = 0.8) {
    this.interactT = duration;
    this.state = 'interact';
    this.frame = 0; this.frameT = 0;
    // Face whoever Annie is interacting with (or just match her facing).
    if (this._lastTarget) this.facing = this._lastTarget > this.x ? 1 : -1;
  }

  update(dt, player, platforms) {
    if (this.celebrating) {
      this.vx *= Math.exp(-dt * 6);
      this.state = 'celebrate';
    } else if (this.lookAt) {
      this.vx *= Math.exp(-dt * 6);
      this.facing = this.lookAt.x > this.x ? 1 : -1;
    } else {
      // Stay slightly behind player based on player facing.
      const offset  = player.facing > 0 ? -DOG.FOLLOW_OFFSET : DOG.FOLLOW_OFFSET;
      const targetX = player.x + offset;
      const dx      = targetX - this.x;
      const dist    = Math.abs(dx);
      let speed = DOG.WALK_SPEED;
      if (dist > DOG.CHASE_DIST) speed = DOG.RUN_SPEED;
      else if (dist > 110)        speed = (DOG.WALK_SPEED + DOG.RUN_SPEED) * 0.5;
      let want = 0;
      if (dist > 14) {
        want = Math.sign(dx) * speed;
        this.facing = Math.sign(dx);
      }
      const lerp = 1 - Math.exp(-dt * 7);
      this.vx += (want - this.vx) * lerp;
    }

    // Random spontaneous hop every few seconds.
    this.hopCooldown -= dt;
    if (this.hopCooldown <= 0) {
      if (this.grounded && !this.celebrating && !this.lookAt) {
        this.vy = DOG.HOP_VEL;
        this.grounded = false;
      }
      this.hopCooldown = randCooldown();
    }

    // Gravity + integration
    this.vy += DOG.GRAVITY * dt;
    if (this.vy > 1200) this.vy = 1200;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Ground collision. Same forgiving snap as the player — guarantees we
    // can never end up below the platform regardless of how we got there.
    this.grounded = false;
    for (const p of platforms) {
      const left  = this.x - this.w / 2;
      const right = this.x + this.w / 2;
      if (right > p.x && left < p.x + p.w) {
        if (this.vy >= 0 && this.y >= p.y) {
          this.y = p.y; this.vy = 0; this.grounded = true;
        }
      }
    }

    if (this.x < this.worldMin) this.x = this.worldMin;
    if (this.x > this.worldMax) this.x = this.worldMax;

    // Tick the timed interact pose.
    if (this.interactT > 0) this.interactT -= dt;

    // State machine driven by airborne / speed.
    // celebrate, lookAt, and interactT all override the speed-based default.
    if (!this.celebrating && !this.lookAt && this.interactT <= 0) {
      const sp = Math.abs(this.vx);
      let next;
      if (!this.grounded) next = 'jump';
      else if (sp > 240)  next = 'run';
      else if (sp > 30)   next = 'walk';
      else                 next = 'idle';
      if (next !== this.state) { this.state = next; this.frame = 0; this.frameT = 0; }
    }

    this.frameT += dt;
    const fps = this.state === 'run' ? 13 : (this.state === 'walk' ? 10 : 8);
    const frames = DOG.ANIM[this.state] || 1;
    this.frame = Math.floor(this.frameT * fps) % frames;
  }

  draw(ctx, sprites) {
    let img;
    switch (this.state) {
      // Walk and run share the same sprite set (no dedicated walk anim).
      case 'walk':      img = sprites.dogRun[this.frame % sprites.dogRun.length]; break;
      case 'run':       img = sprites.dogRun[this.frame % sprites.dogRun.length]; break;
      case 'jump':      img = sprites.dogRun[Math.min(2, sprites.dogRun.length - 1)]; break;
      case 'celebrate': img = sprites.dogCelebrate[this.frame % 6]; break;
      case 'interact':  img = sprites.dogInteract[this.frame % 6]; break;
      default:          img = sprites.dogIdle[this.frame % 6];
    }
    // Sprites have empty space below the dog body (FOOT_FRAME_FRACTION).
    // Anchor on that point so the visible feet land on groundY.
    const x = this.x - this.w / 2;
    const y = this.y - this.h * DOG.FOOT_FRAME_FRACTION;
    if (drawFallback(ctx, img, x, y, this.w, this.h, '#7ad27a', 'Dog')) return;
    drawFlipped(ctx, img, x, y, this.w, this.h, this.facing < 0);
  }
}
