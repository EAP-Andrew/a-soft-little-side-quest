import { aabb } from './collision.js';

export function nearestInteraction(player, interactions) {
  for (const i of interactions || []) {
    if (aabb(player, { x: i.x - 18, y: i.y - 18, w: i.w + 36, h: i.h + 36 })) return i;
  }
  return null;
}
