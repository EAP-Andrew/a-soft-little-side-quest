// config.js — single source of truth for tunable constants. Keep numbers
// out of the gameplay/render code so you can tweak feel without hunting.

// ----- Asset paths -----
export const ASSET_BASE = 'assets/';

// ----- World layout -----
export const WORLD = {
  W: 1916,         // matches background image width
  H: 821,          // matches background image height
  GROUND_Y: 640,   // y where character feet land on the grass band
};

// ----- Entity placements (world coords) -----
export const SPAWN = {
  PLAYER_X: 560,
  DOG_X:    420,
  DUMMY_X:  1100,
  CAKE_X:   958,
  CAKE_Y_OFFSET:    -26,   // relative to GROUND_Y
  // Letter drops on the LEFT side, mirrored from the dummy then offset.
  LETTER_DROP_OFFSET: -25, // px shifted further left on top of mirror
  LETTER_START_Y:    -120,
  LETTER_GROUND_OFFSET: +10, // letter lands this many px below ground line
};

// ----- Camera -----
export const CAMERA = {
  MINIGAME_ZOOM_MUL: 3.2,
  MINIGAME_Y_OFFSET: -30,  // relative to cake.y
  LERP_POS:  4,            // lerp/sec
  LERP_ZOOM: 2.4,
};

// ----- Player physics -----
export const PLAYER = {
  W: 64, H: 64,
  GRAVITY:      1500,
  MOVE_SPEED:   200,
  SPRINT_SPEED: 340,
  JUMP_VEL:     540,
  ACCEL:        1900,
  FRICTION:     1300,
  WORLD_MARGIN: 50,     // px from world edges player can't cross
  INTERACT_T:   0.45,   // seconds of "interact" pose
  STEP_INTERVAL: 0.16,  // seconds between sprint footstep SFX
  ANIM: { idle: 7, walk: 7, sprint: 3, jump: 1, interact: 1, celebrate: 5 },
};

// ----- Dog physics / behaviour -----
export const DOG = {
  W: 48, H: 48,
  // The dog content inside each 64×64 sprite frame sits roughly between
  // image-y 5 and 47 — there's ~17 px of empty space below it. We anchor the
  // draw on the content's bottom (≈ 73% down the frame) so the feet land on
  // groundY instead of floating above it.
  FOOT_FRAME_FRACTION: 0.73,
  GRAVITY: 1500,
  HOP_VEL: -360,
  HOP_COOLDOWN: { MIN: 4, MAX: 9 }, // seconds between random hops
  FOLLOW_OFFSET: 82,    // stays this many px behind player
  WALK_SPEED: 150,
  RUN_SPEED:  320,
  CHASE_DIST: 220,      // distance at which to start running
  ANIM: { idle: 6, walk: 6, run: 6, jump: 1, celebrate: 6, interact: 6 },
};

// ----- Dummy -----
export const DUMMY = {
  W: 74, H: 74,
  IDLE_FPS: 6,
  IDLE_FRAMES: 5,
  INTERACT_T: 0.5,
};

// ----- Cake -----
export const CAKE = {
  W: 65, H: 60,
  SPAWN_RATE: 1.4,    // 1/sec for spawn anim
  CANDLE_COUNT: 27,
};

// ----- Letter -----
export const LETTER = {
  H: 42,                // base height (width derived per-sprite for no stretch)
  START_VY: 50,
  ACCEL_VY: 22,
  MAX_VY: 140,
  DRIFT_AMP: 38,
  ROT_AMP: 0.32,
  FRAME_FPS: 8,
};

// ----- Mini-game -----
export const MINIGAME = {
  TIME: 10,                 // seconds
  CANDLE_HIT_RADIUS: 14,    // world units
};

// ----- Tutorial / flow -----
export const FLOW = {
  INTRO_T: 0.7,
  CELEBRATION_LETTER_T: 0.8,  // seconds into celebration before letter spawns
  CELEBRATION_TOTAL_T: 2.4,
  COMPLETE_TOAST_DELAY: 800,   // ms
  CAKE_SPAWN_DELAY: 1400,      // ms after "Tutorial complete." toast
  EXP_PER_OBJECTIVE: 22,
};

// ----- Audio mix -----
export const AUDIO = {
  MASTER: 0.7,
  MUSIC:  0.08,
  SFX:    0.55,
};
