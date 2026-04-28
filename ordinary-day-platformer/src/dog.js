import { Entity } from './entities.js';

export class DogCompanion extends Entity {
  constructor(x, y) {
    super(x, y, 28, 22);
    this.tail = 0;
    this.barkTimer = 2;
  }
  update(dt, player, active) {
    if (!active) return;
    const tx = player.x - 62;
    this.x += (tx - this.x) * 0.09;
    this.y += ((player.y + 30) - this.y) * 0.1;
    this.tail += dt * 12;
    this.barkTimer -= dt;
  }
}
