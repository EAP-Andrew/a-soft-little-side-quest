# A Soft Little Side Quest

A short, pixel-art birthday game played in the browser. You walk a
small character named **Annie** with her dog companion through a single sunset
meadow, complete a tiny tutorial, blow out 27 candles on a cake, and read a
letter that has been waiting for you.

No frameworks. No build step. No external dependencies. Pure HTML, CSS, vanilla
JavaScript modules, and a Web Audio API soundtrack synthesised at runtime.

---

## Running the game

The game uses native ES modules (`<script type="module">`), which browsers
refuse to load over `file://`. You need any local HTTP server. From the project
root:

```bash
# Python 3 (Windows)
py -m http.server 8000

# or POSIX
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

> The first user input (any keypress or click) unlocks Web Audio — the
> background music and SFX kick in from there.

---

## How to play

| Action      | Keys                                |
|-------------|-------------------------------------|
| Move        | `A` / `D`, `Q` / `D`, `←` / `→`     |
| Jump        | `Space`                             |
| Sprint      | `Ctrl` (hold)                       |
| Interact    | `E`                                 |
| Pause       | `Esc`                               |
| Click cake  | Mouse — once the mini-game starts   |

### The flow

1. **Tutorial** — quest panel on the right tracks four objectives (move, jump,
   sprint, talk to the dummy). Complete them in any order.
2. **Cake** — a birthday cake spawns on the picnic table. Press `E` near it.
3. **Mini-game** — camera zooms in. Click the cake **27 times** within
   10 seconds to blow out every candle. Each click swaps the cake to the next
   sprite frame (`cake_0` → `cake_27`). If the timer hits zero, the cake
   re-lights and you retry.
4. **Celebration** — Annie levels up to 27, the avatar swaps to `avatar_2.png`,
   and a letter falls slowly from the sky.
5. **Read the letter** — press `E` near the landed letter to open it big on
   screen. Close with `Esc`, the red ✕ in the corner, or `E`.
6. **Free roam** — the world stays warm and quiet. Talk to the dummy, re-open
   the letter from the floating icon (bottom-right), or just stand with the
   dog.

---

## Project structure

```
a-soft-little-side-quest/
├── index.html              # canvas + HUD + overlays
├── styles/style.css
├── assets/                 # all art (PNG)
│   ├── background/         #   meadow scene
│   ├── cake/               #   cake_0…cake_27 (one frame per click)
│   ├── character/          #   Annie: idle / walk / sprint / interact / celebrate
│   ├── dog/                #   companion: idle / run / interact / celebrate
│   ├── dummy/              #   training dummy: idle / interact
│   ├── letter/             #   fall / land / ui (overlay)
│   └── ui/                 #   avatars, counters, check, quest panel
├── src/
│   ├── main.js             # bootstrap (preload → instantiate → start loop)
│   ├── config.js           # ★ all tunable constants live here
│   ├── game.js             # state machine + orchestration
│   ├── core/
│   │   ├── assets.js       #   manifest + image preloader
│   │   ├── audio.js        #   Web Audio synths + soft music bed
│   │   ├── input.js        #   keyboard + mouse → action map
│   │   ├── renderer.js     #   canvas, locked camera, particles
│   │   └── interactions.js #   nearest-interactable helper
│   ├── entities/
│   │   ├── _draw.js        #   shared drawFlipped / drawFallback
│   │   ├── platform.js
│   │   ├── dummy.js
│   │   ├── cake.js
│   │   ├── letter.js
│   │   ├── player.js
│   │   ├── dog.js
│   │   └── index.js        #   barrel export
│   └── ui/ui.js            # HUD, quest, prompt, countdown, toast, letter
└── tools/strip_bg.py       # asset chroma-key / bg-removal helper
```

---

## Tweaking the game

Every gameplay number lives in [`src/config.js`](src/config.js). Open it and
edit a value — no other files need to change. Highlights:

| Constant                          | What it controls                                |
|-----------------------------------|--------------------------------------------------|
| `WORLD.GROUND_Y`                  | Y-line where character feet land                 |
| `SPAWN.PLAYER_X` / `DOG_X` / …   | Starting positions across the screen             |
| `SPAWN.CAKE_Y_OFFSET`             | How high the cake sits above ground              |
| `PLAYER.JUMP_VEL` / `MOVE_SPEED` | Player feel                                      |
| `DOG.HOP_COOLDOWN`                | How often the dog spontaneously hops             |
| `DOG.FOOT_FRAME_FRACTION`         | Where the dog sprite's feet sit inside its frame |
| `CAMERA.MINIGAME_ZOOM_MUL`        | How far the camera zooms when blowing candles    |
| `MINIGAME.TIME`                   | Seconds to blow all candles                      |
| `LETTER.START_VY` / `MAX_VY`     | Feather-like fall speed                          |
| `AUDIO.MASTER` / `MUSIC` / `SFX` | Volume mix (0–1)                                 |
| `FLOW.*`                          | Tutorial / celebration / cake-spawn timing       |

All asset paths are built from `ASSET_BASE = 'assets/'` — change it once and
the whole game follows.

---

## Game state machine

```
INTRO → TUTORIAL → CAKE_SPAWNED → CAKE_MINIGAME → CELEBRATION
                                                       ↓
                                                LETTER_FALLING
                                                       ↓
                                                LETTER_OPEN
                                                       ↓
                                              ENDING_FREE_ROAM ⟲
```

`ENDING_FREE_ROAM` is the post-credits state — the player can wander, re-open
the letter, and chat with the dummy again. The cake stays interactable and
acknowledges with: *"Candles have already been blown. Wait next year."*

---

## Asset pipeline

The art was authored on solid backgrounds (white, black, or chroma-green). The
`tools/strip_bg.py` script removes those backgrounds in-place using a magic-wand
flood-fill from the corners.

```bash
# Single file
py tools/strip_bg.py assets/cake/cake_3.png

# Whole folder (recursive)
py tools/strip_bg.py assets/cake

# Custom erosion + tolerance
py tools/strip_bg.py assets/dog 0 30
#                              ^   ^
#                              |   tolerance ±RGB
#                              erode radius (px) — seals thin leaks
```

Files that already have a transparent corner are auto-skipped, so re-running
on a partly-cleaned folder is safe.

---

## Audio

There are no audio files — every sound is generated at runtime through the
Web Audio API:

- **SFX**: jump, sprint footstep, interact, dummy thud, cake-appear chime,
  candle blow, letter fall, UI open/close, celebration, level-up.
- **Music**: a calm 4-chord progression (C — Am — F — G) with a sine
  arpeggio, triangle pad and sub-bass, looping forever. Mute toggle is in the
  HUD.

---

## Credits

A personal birthday gift — code and design hand-rolled. Sprites are
hand-authored pixel art that lives in `assets/`. The letter text is the heart
of the project and is preserved verbatim inside the `ui/letter.png` artwork.
