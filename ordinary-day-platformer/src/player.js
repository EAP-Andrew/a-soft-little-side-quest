import { Entity } from './entities.js';
import { PHYSICS } from './config.js';
import { isDown } from './input.js';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 34, 56);
    this.onGround = false;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.state = 'idle';
    this.facing = 1;
    this.hp = 3;
    this.inv = 0;
  }

  update(dt, inWater = false, gravityScale = 1, waterFriction = 0.72) {
    this.savePrev();
    const left = isDown('a', 'q', 'arrowleft');
    const right = isDown('d', 'arrowright');
    const jumpHeld = isDown(' ');
    if (isDown('w', 'z', 'arrowup')) this.state = 'interact';

    if (left) { this.vx -= PHYSICS.accel * dt; this.facing = -1; }
    if (right) { this.vx += PHYSICS.accel * dt; this.facing = 1; }

    const maxSpeed = inWater ? PHYSICS.maxSpeed * 0.65 : PHYSICS.maxSpeed;
    this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));
    this.vx *= inWater ? waterFriction : PHYSICS.friction;

    this.coyote = this.onGround ? PHYSICS.coyoteTime : Math.max(0, this.coyote - dt);
    if (jumpHeld) this.jumpBuffer = PHYSICS.jumpBuffer;
    else this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);

    const canJump = this.coyote > 0 && this.jumpBuffer > 0;
    if (canJump) {
      this.vy = -(inWater ? PHYSICS.jumpSpeed * 0.72 : PHYSICS.jumpSpeed);
      this.onGround = false;
      this.coyote = 0;
      this.jumpBuffer = 0;
    }
    if (!jumpHeld && this.vy < 0) this.vy *= 0.95;

    this.vy += PHYSICS.gravity * gravityScale * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.state = this.onGround ? (Math.abs(this.vx) > 100 ? 'run' : 'idle') : (this.vy < 0 ? 'jump' : 'fall');
    this.inv = Math.max(0, this.inv - dt);
  }
}
