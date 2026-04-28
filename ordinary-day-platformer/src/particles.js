export class ParticleSystem {
  constructor() { this.items = []; }
  burst(x, y, color = '#fff', count = 8) {
    for (let i = 0; i < count; i++) this.items.push({ x, y, vx: (Math.random() - 0.5) * 180, vy: -Math.random() * 140, life: 0.8, color });
  }
  update(dt) {
    this.items.forEach((p) => { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 320 * dt; });
    this.items = this.items.filter((p) => p.life > 0);
  }
}
