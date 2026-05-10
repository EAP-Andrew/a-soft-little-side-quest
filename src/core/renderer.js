// renderer.js — canvas, smooth camera, parallax background, particles.

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = {
      cx: 0, cy: 0, zoom: 1,
      targetCx: 0, targetCy: 0, targetZoom: 1,
    };
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  // Camera
  setCameraTarget(cx, cy, zoom = 1) {
    this.camera.targetCx = cx;
    this.camera.targetCy = cy;
    this.camera.targetZoom = zoom;
  }
  snapCamera(cx, cy, zoom = 1) {
    this.camera.cx = this.camera.targetCx = cx;
    this.camera.cy = this.camera.targetCy = cy;
    this.camera.zoom = this.camera.targetZoom = zoom;
  }
  updateCamera(dt) {
    const lerp = 1 - Math.exp(-dt * 4);
    this.camera.cx += (this.camera.targetCx - this.camera.cx) * lerp;
    this.camera.cy += (this.camera.targetCy - this.camera.cy) * lerp;
    const zlerp = 1 - Math.exp(-dt * 2.4);
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * zlerp;
  }

  worldToScreen(wx, wy) {
    const z = this.camera.zoom;
    return {
      x: (wx - this.camera.cx) * z + this.canvas.width / 2,
      y: (wy - this.camera.cy) * z + this.canvas.height / 2,
    };
  }
  screenToWorld(sx, sy) {
    const z = this.camera.zoom;
    return {
      x: (sx - this.canvas.width / 2) / z + this.camera.cx,
      y: (sy - this.canvas.height / 2) / z + this.camera.cy,
    };
  }

  beginWorld() {
    const { ctx, canvas, camera } = this;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.cx, -camera.cy);
  }
  endWorld() { this.ctx.restore(); }

  clear() {
    // Letterbox color around the bg image. Sky-tinted so bars don't clash.
    const ctx = this.ctx;
    const cw = this.canvas.width, ch = this.canvas.height;
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0,    '#1d2360');
    grad.addColorStop(0.5,  '#5b3870');
    grad.addColorStop(0.85, '#2d4a32');
    grad.addColorStop(1,    '#1a2e20');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
  }

  // Background drawn in WORLD SPACE inside beginWorld(). The bg fills the
  // entire world rectangle (worldW × worldH) so it scales with the camera
  // and the player walks "on" the bg image.
  drawBackgroundWorld(img, worldW, worldH) {
    this.ctx.drawImage(img, 0, 0, worldW, worldH);
  }

  drawSpriteFlipped(img, x, y, w, h, flip = false) {
    const ctx = this.ctx;
    if (flip) {
      ctx.save();
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
  }

  // True if the image looks like a usable bitmap (not the 1x1 fallback or
  // an undefined entry).
  static spriteOk(img) {
    return !!img && (img.naturalWidth ? img.naturalWidth > 1 : (img.width || 0) > 1);
  }

  // ===== Particles (world-space) =====
  spawnParticle(p) {
    if (this.particles.length > 240) return; // simple cap
    p.maxLife = p.maxLife ?? p.life ?? 1;
    p.life = p.life ?? p.maxLife;
    this.particles.push(p);
  }
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vx = (p.vx || 0) + (p.ax || 0) * dt;
      p.vy = (p.vy || 0) + (p.ay || 0) * dt;
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      if (p.rot != null) p.rot += (p.vrot || 0) * dt;
    }
  }
  drawParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const t = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.save();
      ctx.globalAlpha = (p.alpha ?? 1) * t;
      ctx.translate(p.x, p.y);
      if (p.rot != null) ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      switch (p.shape) {
        case 'circle':
          ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
          break;
        case 'sparkle': {
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.3, -s * 0.3);
          ctx.lineTo(s, 0);
          ctx.lineTo(s * 0.3, s * 0.3);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.3, s * 0.3);
          ctx.lineTo(-s, 0);
          ctx.lineTo(-s * 0.3, -s * 0.3);
          ctx.closePath(); ctx.fill();
          break;
        }
        case 'smoke': {
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'rgba(200,200,200,0)');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
          break;
        }
        default:
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
  }
}
