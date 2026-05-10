// interactions.js — small helpers shared by the game state machine.

// Returns the closest interactable object whose `x` is within `range` of player.
// Each candidate must expose { x, kind, active }.
export function findInteractable(player, candidates, range = 90) {
  let best = null;
  let bestD = Infinity;
  for (const c of candidates) {
    if (!c || c.active === false) continue;
    const d = Math.abs(c.x - player.x);
    if (d <= range && d < bestD) { best = c; bestD = d; }
  }
  return best;
}
