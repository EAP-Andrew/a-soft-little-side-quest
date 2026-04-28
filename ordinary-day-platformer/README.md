# A SOFT LITTLE SIDE QUEST

**Because you live for the adventure and the thrill of it**

A fully original, browser-playable, pastel 2D side-scrolling platformer built with **HTML5 Canvas + CSS + vanilla JavaScript + Web Audio API**.

## Three-Act Structure

1. **Main Adventure (Act 1)**
   - 11 zones from **The Quiet Castle** to **The Rocket Goodbye**.
   - Includes collectibles, breakable blocks, enemies, companion rescue, checkpointing, and a rocket transition.
2. **Sky Map & Celestial Stages (Act 2)**
   - The Sky Map unlocks after rocket launch.
   - Play five sky cards: **Cloud**, **Ciel**, **Moonlit Dream**, **Lune**, **Étoiles**.
3. **Final Castle / Birthday Ending (Act 3)**
   - Return to transformed castle.
   - Collect/light 27 candles, then open the final interactive letter.

## Sea Level: The Gentle Sea

Includes water areas, buoyancy-like physics, wave platforms, tide platforms, bubble lifts, seashell guidance collectibles, and sea-themed enemies.

## How to Run Locally

### Option 1
Open `index.html` directly if the browser allows it.

### Option 2
Run a local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Controls

- `Space` / `ArrowUp` / `W` / `Z`: jump and up interactions
- `ArrowLeft` / `A` / `Q`: move left (Q for AZERTY)
- `ArrowRight` / `D`: move right
- `ArrowDown` / `S`: crouch / down
- `Mouse click`: interact
- `Escape`: pause
- `R`: respawn at checkpoint
- `F3`: debug overlay

## Features

- Main menu, controls, credits, pause
- Continue via `localStorage`
- Data-driven zones
- Player physics (gravity, acceleration, friction, coyote time, jump buffer, variable jump, fall tuning)
- AABB collisions
- Enemy stomp + damage + invincibility windows
- Checkpoints + save system
- Dog companion logic
- Rocket transition + Sky Map progression
- Final birthday interaction flow
- Web Audio API generated music + SFX
- Reduced particles toggle

## Project Structure

```text
ordinary-day-platformer/
  index.html
  README.md
  LICENSE
  src/
    main.js
    game.js
    config.js
    input.js
    audio.js
    save.js
    ui.js
    camera.js
    collision.js
    level.js
    levelData.js
    entities.js
    player.js
    dog.js
    enemies.js
    particles.js
    collectibles.js
    interactions.js
    renderer.js
  styles/
    style.css
    menu.css
    hud.css
  assets/
    sprites/README.md
    audio/README.md
    fonts/README.md
```

## Original Assets Note

All visuals are generated from canvas shapes, gradients, and particles. No external copyrighted sprites are required.

## Original Music Note

All music/sound effects are generated with Web Audio API oscillators and envelopes in runtime.

## GitHub Pages Deployment

1. Create a GitHub repository.
2. Push all project files.
3. Go to **Settings**.
4. Open **Pages**.
5. Select the **main** branch.
6. Select the **/root** folder.
7. Save.
8. Open the generated GitHub Pages URL.

## TODO Ideas

- More bespoke enemy patterns per zone
- Richer NPC animation in castle scenes
- More elaborate rocket cinematic
- Accessibility toggles (font scaling / high contrast)
- Optional gamepad support
