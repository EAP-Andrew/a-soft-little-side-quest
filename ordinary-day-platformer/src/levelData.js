const basePlatform = (x, y, w, h = 32) => ({ x, y, w, h, type: 'solid' });

export const MAIN_ZONES = [
  {
    id: 'quiet-castle', name: 'The Quiet Castle', act: 1, order: 1, width: 2600, theme: 'castle',
    objective: 'Leave the castle and begin the adventure.', checkpoint: { x: 160, y: 520 },
    platforms: [basePlatform(0, 620, 2600, 100), basePlatform(420, 540, 150), basePlatform(820, 500, 150)],
    temporaryPlatforms: [{ x: 1240, y: 480, w: 120, h: 20, timer: 2.3 }],
    interactions: [
      { id: 'sign-start', x: 220, y: 560, w: 40, h: 60, kind: 'sign', text: 'Use ZQSD or WASD to move. Space to jump.' },
      { id: 'sign-click', x: 1040, y: 560, w: 40, h: 60, kind: 'sign', text: 'Click nearby objects to interact.' },
      { id: 'block-1', x: 690, y: 460, w: 40, h: 40, kind: 'breakable' },
    ],
    collectibles: [], enemies: [],
    exit: { x: 2480, y: 540, w: 60, h: 80 }, nextZone: 'snack-garden',
  },
  {
    id: 'snack-garden', name: 'The Snack Garden', act: 1, order: 2, width: 2900, theme: 'snack',
    objective: 'Collect 10 yummy treats.', checkpoint: { x: 120, y: 520 },
    platforms: [basePlatform(0, 620, 2900, 100), basePlatform(470, 540, 130), basePlatform(930, 510, 130), basePlatform(1380, 470, 130), basePlatform(1780, 430, 120)],
    temporaryPlatforms: [{ x: 620, y: 560, w: 110, h: 18, timer: 1.8 }, { x: 1540, y: 520, w: 110, h: 18, timer: 1.8 }],
    collectibles: Array.from({ length: 10 }, (_, i) => ({ id: `treat-${i}`, x: 260 + i * 230, y: 450 - (i % 3) * 30, kind: 'treat' })),
    interactions: [{ id: 'bonus-snack', x: 1110, y: 430, w: 40, h: 40, kind: 'bonus' }],
    enemies: [{ type: 'jumper', x: 820, y: 580 }, { type: 'jumper', x: 1660, y: 580 }],
    exit: { x: 2800, y: 540, w: 60, h: 80 }, nextZone: 'rescue-shelter',
  },
  {
    id: 'rescue-shelter', name: 'The Rescue Shelter', act: 1, order: 3, width: 2600, theme: 'shelter',
    objective: 'Find 6 paw prints and rescue the puppy.', checkpoint: { x: 100, y: 520 },
    platforms: [basePlatform(0, 620, 2600, 100), basePlatform(530, 550, 140), basePlatform(950, 500, 140), basePlatform(1400, 460, 140)],
    collectibles: Array.from({ length: 6 }, (_, i) => ({ id: `paw-${i}`, x: 320 + i * 340, y: 520 - (i % 2) * 90, kind: 'paw' })),
    interactions: [{ id: 'puppy-door', x: 2150, y: 540, w: 70, h: 80, kind: 'door', text: 'The puppy joins you!' }],
    enemies: [{ type: 'walker', x: 760, y: 590 }, { type: 'walker', x: 1700, y: 590 }],
    exit: { x: 2480, y: 540, w: 60, h: 80 }, nextZone: 'flower-garden',
  },
  {
    id: 'flower-garden', name: 'The Flower Garden', act: 1, order: 4, width: 3000, theme: 'flower',
    objective: 'Grow the flowers to move forward.', checkpoint: { x: 120, y: 520 },
    platforms: [basePlatform(0, 620, 3000, 100), basePlatform(430, 550, 130), basePlatform(1220, 500, 130), basePlatform(2050, 470, 130)],
    collectibles: [{ id: 'seed-1', x: 700, y: 560, kind: 'seed' }, { id: 'seed-2', x: 1380, y: 450, kind: 'seed' }, { id: 'water-1', x: 1740, y: 420, kind: 'waterdrop' }],
    interactions: [{ id: 'pot-1', x: 980, y: 580, w: 30, h: 40, kind: 'pot' }, { id: 'pot-2', x: 1840, y: 580, w: 30, h: 40, kind: 'pot' }],
    enemies: [{ type: 'walker', x: 1500, y: 590 }],
    exit: { x: 2920, y: 540, w: 60, h: 80 }, nextZone: 'dream-clouds',
  },
  {
    id: 'dream-clouds', name: 'The Dream Clouds', act: 1, order: 5, width: 2700, theme: 'dream',
    objective: 'Pop 8 dream bubbles.', checkpoint: { x: 100, y: 520 },
    platforms: [basePlatform(0, 620, 2700, 100), basePlatform(430, 520, 120), basePlatform(800, 470, 120), basePlatform(1180, 420, 120), basePlatform(1650, 470, 120)],
    collectibles: Array.from({ length: 8 }, (_, i) => ({ id: `bubble-${i}`, x: 320 + i * 260, y: 430 - (i % 3) * 50, kind: 'bubble' })),
    enemies: [{ type: 'flyer', x: 990, y: 350 }, { type: 'flyer', x: 1770, y: 320 }],
    exit: { x: 2600, y: 540, w: 60, h: 80 }, nextZone: 'library-wonders',
  },
  {
    id: 'library-wonders', name: 'The Library of Wonders', act: 1, order: 6, width: 3300, theme: 'library',
    objective: 'Read 8 cute book notes.', checkpoint: { x: 120, y: 520 },
    platforms: [basePlatform(0, 620, 3300, 100), basePlatform(550, 550, 140), basePlatform(930, 480, 140), basePlatform(1280, 420, 140), basePlatform(1650, 360, 140), basePlatform(2180, 420, 140)],
    interactions: [
      'Some days are quiet, but they still matter.', 'A soft heart is not a weak heart.', 'Even little steps count as moving forward.', 'The moon keeps secrets for people who cannot sleep.',
      'Kindness leaves footprints.', 'You are allowed to be loved gently.', 'Not every gift needs a ribbon.', 'Some ordinary days become memories.'
    ].map((text, i) => ({ id: `note-${i}`, x: 260 + i * 360, y: 560 - (i % 3) * 90, w: 40, h: 60, kind: 'note', text })),
    movingPlatforms: [{ x: 2500, y: 470, w: 130, h: 18, dx: 0, dy: 110, period: 4.5 }],
    enemies: [{ type: 'flyer', x: 1420, y: 300 }],
    exit: { x: 3220, y: 540, w: 60, h: 80 }, nextZone: 'melody-hall',
  },
  {
    id: 'melody-hall', name: 'The Melody Hall', act: 1, order: 7, width: 2800, theme: 'melody',
    objective: 'Find the melody that opens the next path.', checkpoint: { x: 120, y: 520 },
    platforms: [basePlatform(0, 620, 2800, 100), basePlatform(490, 540, 120), basePlatform(940, 500, 120), basePlatform(1320, 470, 120), basePlatform(1920, 440, 120)],
    temporaryPlatforms: [{ x: 1620, y: 500, w: 120, h: 16, timer: 2.4 }],
    collectibles: Array.from({ length: 6 }, (_, i) => ({ id: `note-token-${i}`, x: 460 + i * 360, y: 460 - (i % 2) * 70, kind: 'music' })),
    enemies: [{ type: 'spark', x: 1200, y: 580 }, { type: 'spark', x: 2130, y: 580 }],
    exit: { x: 2720, y: 540, w: 60, h: 80 }, nextZone: 'animal-parade',
  },
  {
    id: 'animal-parade', name: 'The Little Animal Parade', act: 1, order: 8, width: 3000, theme: 'forest',
    objective: 'Cross the forest with your companion.', checkpoint: { x: 120, y: 520 },
    platforms: [basePlatform(0, 620, 3000, 100), basePlatform(640, 550, 130), basePlatform(1020, 500, 130), basePlatform(1540, 460, 130), basePlatform(2140, 440, 130)],
    interactions: [{ id: 'dog-switch', x: 1250, y: 580, w: 40, h: 40, kind: 'dogSwitch', text: 'The puppy found a hidden path!' }],
    enemies: [], collectibles: [],
    exit: { x: 2920, y: 540, w: 60, h: 80 }, nextZone: 'gentle-sea',
  },
  {
    id: 'gentle-sea', name: 'The Gentle Sea', act: 1, order: 9, width: 3400, theme: 'sea',
    objective: 'Collect 12 seashells and cross the gentle sea.', checkpoint: { x: 130, y: 520 },
    platforms: [basePlatform(0, 620, 3400, 100), basePlatform(530, 560, 140), basePlatform(980, 570, 140), basePlatform(1450, 530, 140), basePlatform(1990, 550, 140), basePlatform(2600, 510, 140)],
    waterAreas: [{ x: 300, y: 500, w: 2650, h: 220 }], waterGravityScale: 0.5, waterFriction: 0.72,
    bubbleLifts: [{ x: 1120, y: 590, w: 40, h: 130, lift: 420 }, { x: 2120, y: 600, w: 40, h: 120, lift: 450 }],
    wavePlatforms: [{ x: 760, y: 490, w: 120, h: 18, amp: 22, speed: 2.2 }, { x: 1750, y: 500, w: 120, h: 18, amp: 24, speed: 2.4 }],
    tidePlatforms: [{ x: 2380, y: 525, w: 120, h: 18, period: 4.5 }],
    collectibles: Array.from({ length: 12 }, (_, i) => ({ id: `shell-${i}`, x: 420 + i * 230, y: 520 - (i % 4) * 40, kind: 'seashell' })),
    interactions: [{ id: 'sea-note', x: 1710, y: 470, w: 40, h: 40, kind: 'sign', text: 'The sea carries quiet things too.' }],
    enemies: [{ type: 'jelly', x: 1250, y: 540 }, { type: 'crab', x: 1680, y: 590 }, { type: 'projectile', x: 2420, y: 560 }],
    exit: { x: 3320, y: 540, w: 60, h: 80 }, nextZone: 'firework-bridge',
  },
  {
    id: 'firework-bridge', name: 'The Firework Bridge', act: 1, order: 10, width: 2600, theme: 'firework',
    objective: 'Reach the rocket.', checkpoint: { x: 120, y: 520 },
    platforms: [basePlatform(0, 620, 2600, 100), basePlatform(560, 540, 120), basePlatform(980, 500, 120), basePlatform(1410, 470, 120), basePlatform(1980, 440, 120)],
    temporaryPlatforms: [{ x: 1760, y: 520, w: 110, h: 16, timer: 1.6 }],
    enemies: [{ type: 'spark', x: 1020, y: 580 }, { type: 'spark', x: 1900, y: 580 }], collectibles: [], interactions: [],
    exit: { x: 2520, y: 540, w: 60, h: 80 }, nextZone: 'rocket-goodbye',
  },
  {
    id: 'rocket-goodbye', name: 'The Rocket Goodbye', act: 1, order: 11, width: 2100, theme: 'rocket',
    objective: 'Launch the rocket and open The Sky Map.', checkpoint: { x: 100, y: 520 },
    platforms: [basePlatform(0, 620, 2100, 100), basePlatform(990, 540, 160)], collectibles: [], enemies: [],
    interactions: [
      { id: 'rocket-message', x: 860, y: 520, w: 40, h: 100, kind: 'sign', text: 'After a long journey, think about coming back. People are waiting for you. I am waiting for you.' },
      { id: 'rocket', x: 1250, y: 430, w: 110, h: 190, kind: 'rocket' },
    ],
    exit: null,
  }
];

export const SKY_CARDS = {
  cloud: { id: 'cloud', name: 'Cloud', order: 1, description: 'Collect soft cloud wisps.', levelId: 'sky-cloud' },
  ciel: { id: 'ciel', name: 'Ciel', order: 2, description: 'Cross the open sky.', levelId: 'sky-ciel' },
  moonlit: { id: 'moonlit', name: 'Moonlit Dream', order: 3, description: 'Use starlight to cross the dream.', levelId: 'sky-moonlit' },
  lune: { id: 'lune', name: 'Lune', order: 4, description: 'Gather moon shards.', levelId: 'sky-lune' },
  etoiles: { id: 'etoiles', name: 'Étoiles', order: 5, description: 'Gather 10 twinkling stars.', levelId: 'sky-etoiles' },
};

export const SKY_LEVELS = [
  { id: 'sky-cloud', cardId: 'cloud', name: 'Cloud', act: 2, order: 1, width: 2300, objective: 'Collect soft cloud wisps.', checkpoint: { x: 90, y: 520 },
    platforms: [basePlatform(0, 620, 2300, 100), basePlatform(510, 530, 120), basePlatform(980, 500, 120), basePlatform(1360, 460, 120)],
    temporaryPlatforms: [{ x: 1680, y: 430, w: 120, h: 18, timer: 2.4 }], collectibles: Array.from({ length: 8 }, (_, i) => ({ id: `wisp-${i}`, x: 320 + i * 230, y: 460, kind: 'wisp' })), enemies: [],
    exit: { x: 2200, y: 530, w: 60, h: 90, kind: 'skyPortal' }, returnToSkyMap: true },
  { id: 'sky-ciel', cardId: 'ciel', name: 'Ciel', act: 2, order: 2, width: 2500, objective: 'Cross the open sky.', checkpoint: { x: 90, y: 520 },
    platforms: [basePlatform(0, 620, 2500, 100), basePlatform(540, 520, 110), basePlatform(990, 430, 120), basePlatform(1470, 350, 120), basePlatform(2010, 420, 120)],
    interactions: [{ id: 'wind', x: 1140, y: 260, w: 70, h: 300, kind: 'wind' }], enemies: [{ type: 'flyer', x: 1260, y: 330 }], collectibles: [],
    exit: { x: 2410, y: 530, w: 60, h: 90, kind: 'skyPortal' }, returnToSkyMap: true },
  { id: 'sky-moonlit', cardId: 'moonlit', name: 'Moonlit Dream', act: 2, order: 3, width: 2600, objective: 'Use starlight to cross the dream.', checkpoint: { x: 90, y: 520 },
    platforms: [basePlatform(0, 620, 2600, 100), basePlatform(610, 530, 120), basePlatform(1210, 470, 120), basePlatform(1800, 430, 120)],
    temporaryPlatforms: [{ x: 920, y: 510, w: 120, h: 18, timer: 2.2 }, { x: 1520, y: 450, w: 120, h: 18, timer: 2.2 }],
    collectibles: Array.from({ length: 8 }, (_, i) => ({ id: `starlight-${i}`, x: 350 + i * 260, y: 460 - (i % 2) * 60, kind: 'starlight' })), enemies: [{ type: 'walker', x: 1940, y: 590 }],
    exit: { x: 2510, y: 530, w: 60, h: 90, kind: 'skyPortal' }, returnToSkyMap: true },
  { id: 'sky-lune', cardId: 'lune', name: 'Lune', act: 2, order: 4, width: 2500, objective: 'Gather moon shards.', checkpoint: { x: 90, y: 520 },
    gravityScale: 0.6,
    platforms: [basePlatform(0, 620, 2500, 100), basePlatform(580, 540, 120), basePlatform(1060, 460, 120), basePlatform(1460, 390, 120), basePlatform(1990, 330, 120)],
    collectibles: Array.from({ length: 8 }, (_, i) => ({ id: `moon-${i}`, x: 400 + i * 250, y: 420 - (i % 3) * 70, kind: 'moon' })),
    enemies: [{ type: 'comet', x: 1320, y: 300 }],
    exit: { x: 2420, y: 530, w: 60, h: 90, kind: 'skyPortal' }, returnToSkyMap: true },
  { id: 'sky-etoiles', cardId: 'etoiles', name: 'Étoiles', act: 2, order: 5, width: 2800, objective: 'Gather 10 twinkling stars.', checkpoint: { x: 90, y: 520 },
    platforms: [basePlatform(0, 620, 2800, 100), basePlatform(620, 530, 120), basePlatform(1100, 470, 120), basePlatform(1590, 420, 120), basePlatform(2140, 360, 120)],
    movingPlatforms: [{ x: 1840, y: 520, w: 120, h: 18, dx: 130, dy: 0, period: 4.3 }],
    collectibles: Array.from({ length: 10 }, (_, i) => ({ id: `star-${i}`, x: 340 + i * 230, y: 460 - (i % 4) * 50, kind: 'star' })),
    enemies: [{ type: 'comet', x: 1700, y: 330 }, { type: 'comet', x: 2360, y: 300 }],
    exit: { x: 2700, y: 530, w: 60, h: 90, kind: 'finalPortal' }, returnToFinalCastle: true },
];

export const FINAL_ZONE = {
  id: 'birthday-castle', name: 'The Birthday Cake', act: 3, order: 1, width: 2600, theme: 'birthday',
  objective: 'Collect 27 birthday candles and see the surprise.', checkpoint: { x: 100, y: 520 },
  platforms: [basePlatform(0, 620, 2600, 100), basePlatform(720, 550, 180), basePlatform(1080, 520, 180), basePlatform(1560, 550, 180)],
  collectibles: Array.from({ length: 27 }, (_, i) => ({ id: `candle-${i}`, x: 240 + i * 80, y: 520 - (i % 3) * 60, kind: 'candle' })),
  interactions: [{ id: 'cake-button', x: 1240, y: 570, w: 45, h: 40, kind: 'button' }, { id: 'letter', x: 1420, y: 580, w: 50, h: 32, kind: 'letter' }],
  enemies: [],
};

export const ALL_LEVELS = [...MAIN_ZONES, ...SKY_LEVELS, FINAL_ZONE];

export function getLevelById(id) { return ALL_LEVELS.find((z) => z.id === id); }
