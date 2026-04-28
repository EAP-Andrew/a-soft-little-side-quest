import { Entity } from './entities.js';
import { PHYSICS } from './config.js';
import { isActionDown, wasActionPressed, wasActionReleased } from './input.js';

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
    this.animTime = 0;
  }

  update(dt, inWater = false, gravityScale = 1, waterFriction = 0.72) {
    this.savePrev();
    this.animTime += dt;

    const left = isActionDown('left');
    const right = isActionDown('right');
    const jumpHeld = isActionDown('jump');
    const jumpPressed = wasActionPressed('jump');
    const jumpReleased = wasActionReleased('jump');

    if (isActionDown('up')) this.state = 'interact';

    if (left && !right) {
      this.vx -= PHYSICS.accel * dt;
      this.facing = -1;
    }
    if (right && !left) {
      this.vx += PHYSICS.accel * dt;
      this.facing = 1;
    }

    const maxSpeed = inWater ? PHYSICS.maxSpeed * 0.65 : PHYSICS.maxSpeed;
    this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));

    const friction = inWater ? waterFriction : PHYSICS.friction;
    if (!left && !right) this.vx *= friction;

    this.coyote = this.onGround ? PHYSICS.coyoteTime : Math.max(0, this.coyote - dt);
    if (jumpPressed) this.jumpBuffer = PHYSICS.jumpBuffer;
    else this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);

    const canJump = this.coyote > 0 && this.jumpBuffer > 0;
    let jumped = false;
    if (canJump) {
      this.vy = -(inWater ? PHYSICS.jumpSpeed * 0.72 : PHYSICS.jumpSpeed);
      this.onGround = false;
      this.coyote = 0;
      this.jumpBuffer = 0;
      jumped = true;
    }

    if (jumpReleased && this.vy < 0) {
      this.vy *= inWater ? 0.82 : 0.55;
    }

    const fallingFast = this.vy > 0;
    const gravityMultiplier = inWater ? 1 : (fallingFast ? PHYSICS.fallGravityMultiplier : 1);
    this.vy += PHYSICS.gravity * gravityScale * gravityMultiplier * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.state = this.onGround
      ? (Math.abs(this.vx) > 80 ? 'run' : 'idle')
      : (this.vy < 0 ? 'jump' : 'fall');

    this.inv = Math.max(0, this.inv - dt);
    return { jumped, jumpHeld };
  }
}
