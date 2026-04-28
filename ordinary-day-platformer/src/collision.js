export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function resolveRect(entity, platform) {
  const prev = entity.prev;
  const hitFromTop = prev.y + entity.h <= platform.y;
  const hitFromBottom = prev.y >= platform.y + platform.h;
  const hitFromLeft = prev.x + entity.w <= platform.x;
  const hitFromRight = prev.x >= platform.x + platform.w;

  if (hitFromTop) {
    entity.y = platform.y - entity.h;
    entity.vy = 0;
    entity.onGround = true;
  } else if (hitFromBottom) {
    entity.y = platform.y + platform.h;
    entity.vy = 0;
  } else if (hitFromLeft) {
    entity.x = platform.x - entity.w;
    entity.vx = 0;
  } else if (hitFromRight) {
    entity.x = platform.x + platform.w;
    entity.vx = 0;
  }
}
