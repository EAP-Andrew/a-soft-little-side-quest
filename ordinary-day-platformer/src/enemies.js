import { aabb } from './collision.js';

export function updateEnemies(enemies, dt) {
  enemies.forEach((e) => {
    e.t = (e.t || 0) + dt;
    if (e.type === 'walker' || e.type === 'crab' || e.type === 'spark') e.x += Math.sin(e.t * 1.5) * 40 * dt;
    if (e.type === 'jumper') { e.y += Math.sin(e.t * 4) * 50 * dt; }
    if (e.type === 'flyer' || e.type === 'jelly') { e.y += Math.sin(e.t * 2) * 25 * dt; }
    if (e.type === 'comet') { e.x += Math.sin(e.t * 1.3) * 70 * dt; }
    if (e.type === 'projectile') { e.x -= 40 * dt; if (e.x < 0) e.x += 500; }
  });
}

export function handleEnemyVsPlayer(player, enemies) {
  for (const e of enemies) {
    const hit = { x: e.x - 14, y: e.y - 20, w: 28, h: 28 };
    if (!aabb(player, hit) || e.dead) continue;
    const stomp = player.prev.y + player.h <= hit.y + 8 && player.vy > 0;
    if (stomp) { e.dead = true; player.vy = -300; return 'defeat'; }
    if (player.inv <= 0) { player.inv = 1; player.hp -= 1; return 'damage'; }
  }
  return null;
}
