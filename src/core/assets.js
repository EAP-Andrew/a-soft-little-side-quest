// assets.js — sprite manifest + image preloader.
//
// Every asset path is built from ASSET_BASE (config.js), so moving the
// assets folder later is a one-line change.

import { ASSET_BASE } from '../config.js';

const range = (prefix, n) => {
  const arr = [];
  for (let i = 1; i <= n; i++) arr.push(`${prefix}${i}.png`);
  return arr;
};
const counters = () => {
  const arr = [];
  for (let i = 0; i <= 10; i++) arr.push(`ui/counter_${i}.png`);
  return arr;
};
const asset = (list) => list.map(p => ASSET_BASE + p);

export const MANIFEST = {
  background:    asset(['background/background.png']),
  // 28 frames: cake_0 (full) → cake_27 (all candles blown). One frame per click.
  cake:          asset(Array.from({ length: 28 }, (_, i) => `cake/cake_${i}.png`)),
  letterFall:    asset(range('letter/fall/fall_', 5)),
  letterLand:    asset(['letter/land/land_1.png']),
  charIdle:      asset(range('character/idle/idle_',          7)),
  charWalk:      asset(range('character/walk/walk_',          7)),
  charSprint:    asset(range('character/sprint/sprint_',      3)),
  charInteract:  asset(['character/interact/interact_1.png']),
  charCelebrate: asset(range('character/celebrate/celebrate_', 5)),
  dogIdle:       asset(range('dog/idle/idle_',                6)),
  dogRun:        asset(range('dog/run/run_',                  6)),
  dogInteract:   asset(range('dog/interact/interact_',        6)),
  dogCelebrate:  asset(range('dog/celebrate/celebrate_',      6)),
  dummyIdle:     asset(range('dummy/idle/idle_',              5)),
  dummyInteract: asset(['dummy/interact/interact_1.png']),
  uiAvatar1:     asset(['ui/avatar_1.png']),
  uiAvatar2:     asset(['ui/avatar_2.png']),
  uiCheck:       asset(['ui/check.png']),
  uiQuest:       asset(['ui/quest.png']),
  uiLetter:      asset(['letter/ui/letter.png']),
  uiCounters:    asset(counters()),
};

// Loads one image. On error returns a 1×1 transparent canvas so render code
// doesn't crash; entity draw helpers detect this and show a labelled fallback.
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => {
      console.warn('[asset] failed to load', src);
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      resolve(c);
    };
    img.src = src;
  });
}

/**
 * Preload every sprite in MANIFEST.
 * @param {(progress:number) => void} onProgress 0..1
 * @returns {Promise<{ sprites: Record<string,HTMLImageElement>, groups: Record<string,Array> }>}
 */
export async function preload(onProgress) {
  const flat = [];
  for (const list of Object.values(MANIFEST)) for (const p of list) flat.push(p);

  const loaded = {};
  let done = 0;
  await Promise.all(flat.map(async (path) => {
    loaded[path] = await loadImage(path);
    done++;
    onProgress(done / flat.length);
  }));

  let real = 0; const broken = [];
  for (const [path, img] of Object.entries(loaded)) {
    const ok = (img instanceof HTMLImageElement) && img.naturalWidth > 1;
    if (ok) real++; else broken.push(path);
  }
  console.log(`[asset] loaded ${real}/${flat.length} sprites`);
  if (broken.length) console.warn('[asset] broken/empty:', broken);

  const groups = {};
  for (const [key, list] of Object.entries(MANIFEST)) {
    groups[key] = list.map(p => loaded[p]);
  }
  return { sprites: loaded, groups };
}
