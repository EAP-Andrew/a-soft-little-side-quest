import { getLevelById, MAIN_ZONES, SKY_LEVELS, FINAL_ZONE } from './levelData.js';

export function getZone(id) { return getLevelById(id); }

export function nextMainZone(currentId) {
  const idx = MAIN_ZONES.findIndex((z) => z.id === currentId);
  return idx >= 0 ? MAIN_ZONES[idx + 1] : null;
}

export function getSkyLevelByCard(cardId) {
  return SKY_LEVELS.find((z) => z.cardId === cardId);
}

export function getFinalZone() { return FINAL_ZONE; }
