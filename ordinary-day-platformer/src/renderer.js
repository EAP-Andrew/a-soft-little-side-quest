import { COLORS } from './config.js';

export function render(ctx, game) {
  const { camera, zone, player, dog, particles, debug } = game;

  const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  if (zone.theme === 'moon') {
    grad.addColorStop(0, '#8ea0d8');
    grad.addColorStop(1, '#c9b4ef');
  } else if (zone.theme === 'sea') {
    grad.addColorStop(0, '#8ed7ff');
    grad.addColorStop(1, '#b7ecff');
  } else {
    grad.addColorStop(0, '#a9ccff');
    grad.addColorStop(1, '#ffd6f2');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawSparkleBackdrop(ctx, zone.theme);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  const drawRounded = (p, c, radius = 10) => {
    ctx.fillStyle = c;
    roundRect(ctx, p.x, p.y, p.w, p.h, radius);
    ctx.fill();
  };

  (zone.platforms || []).forEach((p) => drawRounded(p, '#7fd1a9', 12));
  (zone.temporaryPlatforms || []).forEach((p) => drawRounded(p, '#ffd0ba', 12));
  (zone.wavePlatforms || []).forEach((p) => drawRounded(p, '#98dcff', 10));
  (zone.tidePlatforms || []).forEach((p) => { if (p.active) drawRounded(p, '#8ed7ff', 10); });

  (zone.waterAreas || []).forEach((w) => {
    ctx.fillStyle = COLORS.water;
    ctx.fillRect(w.x, w.y, w.w, w.h);
  });

  (zone.bubbleLifts || []).forEach((b) => {
    const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
    g.addColorStop(0, 'rgba(222,248,255,0.32)');
    g.addColorStop(1, 'rgba(186,229,255,0.12)');
    ctx.fillStyle = g;
    roundRect(ctx, b.x, b.y, b.w, b.h, 14);
    ctx.fill();
  });

  (zone.collectibles || []).forEach((c) => {
    if (c.got) return;
    const color = c.kind === 'candle' ? '#ffe08a' : c.kind === 'seashell' ? '#ffc9f3' : '#fff6b0';
    drawStar(ctx, c.x, c.y, 5, 10, color);
  });

  (zone.enemies || []).forEach((e) => {
    if (e.dead) return;
    drawRounded({ x: e.x - 14, y: e.y - 20, w: 28, h: 28 }, '#9c7dff', 9);
    ctx.fillStyle = '#fff'; ctx.fillRect(e.x - 6, e.y - 8, 4, 4); ctx.fillRect(e.x + 2, e.y - 8, 4, 4);
  });

  (zone.interactions || []).forEach((i) => {
    ctx.fillStyle = i.kind === 'rocket' ? '#ff9dbf' : i.kind === 'letter' ? '#fff3db' : '#ffd9f3';
    roundRect(ctx, i.x, i.y, i.w, i.h, 8);
    ctx.fill();
  });

  drawPlayer(ctx, player);
  if (game.saveState.dogRescued) drawDog(ctx, dog);

  particles.items.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    drawStar(ctx, p.x, p.y, 2, 4, p.color);
    ctx.globalAlpha = 1;
  });

  if (debug) {
    ctx.strokeStyle = 'lime';
    ctx.strokeRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#fff';
    ctx.fillText(`pos ${player.x.toFixed(1)} ${player.y.toFixed(1)}`, camera.x + 20, 24);
  }
  ctx.restore();
}

function drawPlayer(ctx, p) {
  const t = p.animTime || 0;
  const bob = p.state === 'run' ? Math.sin(t * 16) * 1.6 : Math.sin(t * 4) * 0.8;
  const skirtSwing = p.state === 'run' ? Math.sin(t * 14) * 1.4 : 0;

  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2 + bob);
  ctx.scale(p.facing, 1);

  // Hair back
  ctx.fillStyle = '#ffd973';
  ctx.beginPath();
  ctx.ellipse(-1, -7, 13, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dress
  const dressTop = p.state === 'jump' ? 2 : 0;
  ctx.fillStyle = '#ff9fcf';
  ctx.beginPath();
  ctx.moveTo(-10, -4 + dressTop);
  ctx.quadraticCurveTo(-17, 17 + skirtSwing, -13, 32);
  ctx.lineTo(13, 32);
  ctx.quadraticCurveTo(17, 17 - skirtSwing, 10, -4 + dressTop);
  ctx.closePath();
  ctx.fill();

  // Body bodice & gem
  ctx.fillStyle = '#ffd5eb';
  roundRect(ctx, -8, -4 + dressTop, 16, 15, 6);
  ctx.fill();
  ctx.fillStyle = '#8ee8b0';
  ctx.beginPath(); ctx.arc(0, 4 + dressTop, 3, 0, Math.PI * 2); ctx.fill();

  // Face
  ctx.fillStyle = '#ffe8c6';
  ctx.beginPath(); ctx.arc(0, -17, 9.2, 0, Math.PI * 2); ctx.fill();

  // Hair front
  ctx.fillStyle = '#ffc94f';
  ctx.beginPath();
  ctx.moveTo(-9, -23);
  ctx.quadraticCurveTo(-2, -32, 7, -24);
  ctx.quadraticCurveTo(2, -17, -9, -18);
  ctx.closePath();
  ctx.fill();

  // Crown
  ctx.fillStyle = '#ffd86f';
  ctx.beginPath();
  ctx.moveTo(-7, -27);
  ctx.lineTo(-4, -33);
  ctx.lineTo(0, -28);
  ctx.lineTo(4, -34);
  ctx.lineTo(7, -27);
  ctx.closePath();
  ctx.fill();

  // Face details
  ctx.fillStyle = '#5f4a7a';
  ctx.fillRect(-4, -18, 2, 2);
  ctx.fillRect(2, -18, 2, 2);
  ctx.fillStyle = '#e26ea8';
  ctx.fillRect(-1, -13, 2, 1);

  // Feet
  const feetY = p.state === 'jump' ? 29 : 30;
  ctx.fillStyle = '#fff0fa';
  ctx.fillRect(-10, feetY, 7, 5);
  ctx.fillRect(3, feetY, 7, 5);

  ctx.restore();
}

function drawDog(ctx, d) {
  ctx.fillStyle = '#ffe4b8';
  roundRect(ctx, d.x, d.y, d.w, d.h, 7);
  ctx.fill();
  ctx.fillStyle = '#7d593a';
  ctx.fillRect(d.x + d.w - 5, d.y + 5, 9, 5 + Math.sin(d.tail) * 2);
}

function drawSparkleBackdrop(ctx, theme) {
  const color = theme === 'moon' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.33)';
  ctx.fillStyle = color;
  for (let i = 0; i < 22; i++) {
    const x = (i * 177) % ctx.canvas.width;
    const y = (i * 91) % ctx.canvas.height;
    ctx.fillRect(x, y, 2, 2);
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawStar(ctx, x, y, inner, outer, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const sx = Math.cos(angle) * radius;
    const sy = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
