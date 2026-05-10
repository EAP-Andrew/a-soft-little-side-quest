// _draw.js — small drawing primitives shared by all sprite-based entities.

export function drawFlipped(ctx, img, x, y, w, h, flip) {
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

// If `img` is the 1×1 fallback (broken/missing sprite), draw a labelled rect
// instead and return true. Otherwise return false (caller should draw normally).
export function drawFallback(ctx, img, x, y, w, h, color, label) {
  if (img && (img.naturalWidth ?? img.width ?? 0) >= 2) return false;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText(label, x + 8, y + 16);
  return true;
}
