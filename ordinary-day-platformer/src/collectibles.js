import { aabb } from './collision.js';

export function collect(collectibles, player, saveState, zoneId) {
  let gained = 0;
  saveState.collectedItems[zoneId] ||= {};
  collectibles.forEach((c) => {
    if (c.got) return;
    const r = { x: c.x - 10, y: c.y - 10, w: 20, h: 20 };
    if (aabb(player, r)) {
      c.got = true;
      saveState.collectedItems[zoneId][c.id] = true;
      gained += 1;
      if (c.kind === 'candle') saveState.candlesCollected += 1;
      if (c.kind === 'seashell') saveState.objectives[zoneId] = (saveState.objectives[zoneId] || 0) + 1;
    }
  });
  return gained;
}
