export class Entity {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.vx = 0; this.vy = 0;
    this.prev = { x, y };
    this.dead = false;
  }
  savePrev() { this.prev.x = this.x; this.prev.y = this.y; }
}
