import { COLORS } from './config.js';

export function render(ctx, game) {
  const { camera, zone, player, dog, particles, debug } = game;
  const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  grad.addColorStop(0, zone.theme === 'sea' ? '#7bc6ff' : '#9fceff');
  grad.addColorStop(1, zone.theme === 'moon' ? '#5d6ba5' : '#f9d9ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  const drawRect = (p, c) => { ctx.fillStyle = c; ctx.fillRect(p.x, p.y, p.w, p.h); };
  (zone.platforms || []).forEach((p) => drawRect(p, '#5cc18a'));
  (zone.temporaryPlatforms || []).forEach((p) => drawRect(p, '#f8c7a0'));
  (zone.wavePlatforms || []).forEach((p) => drawRect(p, '#8fc7ff'));
  (zone.tidePlatforms || []).forEach((p) => { if (p.active) drawRect(p, '#6bc3ff'); });

  (zone.waterAreas || []).forEach((w) => drawRect(w, COLORS.water));
  (zone.bubbleLifts || []).forEach((b) => drawRect(b, 'rgba(200,240,255,.25)'));

  (zone.collectibles || []).forEach((c) => {
    if (c.got) return;
    ctx.fillStyle = c.kind === 'candle' ? '#ffd86a' : c.kind === 'seashell' ? '#f7c6f7' : '#fff58a';
    ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2); ctx.fill();
  });

  (zone.enemies || []).forEach((e) => {
    if (e.dead) return;
    ctx.fillStyle = '#8c5cff';
    ctx.fillRect(e.x - 14, e.y - 20, 28, 28);
  });

  (zone.interactions || []).forEach((i) => {
    ctx.fillStyle = i.kind === 'rocket' ? '#f88' : i.kind === 'letter' ? '#fef4e5' : '#ffd8f1';
    ctx.fillRect(i.x, i.y, i.w, i.h);
  });

  drawPlayer(ctx, player);
  if (game.saveState.dogRescued) drawDog(ctx, dog);

  particles.items.forEach((p) => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4);
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
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.scale(p.facing, 1);
  ctx.fillStyle = '#2f2f2f'; ctx.beginPath(); ctx.arc(0, -18, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd57b'; ctx.beginPath(); ctx.arc(0, -16, 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d6aa29'; ctx.lineWidth = 2; ctx.strokeRect(-6, -19, 12, 8);
  ctx.fillStyle = '#5890ff'; ctx.fillRect(-11, -8, 22, 30);
  ctx.fillStyle = '#e2f'; ctx.fillRect(-12, 20, 10, 16); ctx.fillRect(2, 20, 10, 16);
  ctx.restore();
}

function drawDog(ctx, d) {
  ctx.fillStyle = '#ffe1b0'; ctx.fillRect(d.x, d.y, d.w, d.h);
  ctx.fillStyle = '#6d4a30'; ctx.fillRect(d.x + d.w - 6, d.y + 4, 10, 6 + Math.sin(d.tail) * 2);
}
