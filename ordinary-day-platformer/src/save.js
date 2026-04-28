import { SAVE_KEY, SKY_CARD_ORDER } from './config.js';

const initial = {
  currentAct: 1,
  currentZone: 'quiet-castle',
  checkpoint: { x: 140, y: 520 },
  player: { x: 140, y: 520 },
  collectedItems: {},
  objectives: {},
  dogRescued: false,
  completedZones: {},
  unlockedSkyCards: { cloud: true },
  completedSkyCards: {},
  candlesCollected: 0,
  candlesLit: 0,
  notesRead: 0,
  finalLetterOpened: false,
  reducedParticles: false,
  muted: false,
  finalCastleUnlocked: false,
};

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : { ...initial };
  } catch {
    return { ...initial };
  }
}

export function hasSave() { return !!localStorage.getItem(SAVE_KEY); }
export function clearSave() { localStorage.removeItem(SAVE_KEY); }

export function persist(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function unlockSkyMap(state) {
  state.currentAct = 2;
  state.unlockedSkyCards.cloud = true;
  persist(state);
}

export function openSkyMap(state) {
  state.currentAct = 2;
  persist(state);
}

export function enterSkyCard(state, cardId) {
  state.currentZone = cardId;
  persist(state);
}

export function completeSkyCard(state, cardId) {
  state.completedSkyCards[cardId] = true;
  const idx = SKY_CARD_ORDER.indexOf(cardId);
  const next = SKY_CARD_ORDER[idx + 1];
  if (next) state.unlockedSkyCards[next] = true;
  persist(state);
}

export function areAllSkyCardsCompleted(state) {
  return SKY_CARD_ORDER.every((id) => state.completedSkyCards[id]);
}

export function unlockFinalCastle(state) {
  state.finalCastleUnlocked = true;
  state.currentAct = 3;
  state.currentZone = 'birthday-castle';
  persist(state);
}

export function returnToFinalCastle(state) {
  state.currentAct = 3;
  state.currentZone = 'birthday-castle';
  persist(state);
}
