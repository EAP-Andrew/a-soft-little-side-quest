export class Camera {
  constructor(w, h) { this.x = 0; this.y = 0; this.w = w; this.h = h; }
  follow(target, levelWidth) {
    const desired = target.x - this.w * 0.35;
    this.x += (desired - this.x) * 0.08;
    this.x = Math.max(0, Math.min(levelWidth - this.w, this.x));
  }
}
