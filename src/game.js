// game.js — orchestrates state machine, world, update + render loops.

import { Renderer }          from './core/renderer.js';
import { findInteractable }  from './core/interactions.js';
import { Player, Dog, Platform, Dummy, Cake, Letter }
  from './entities/index.js';
import { WORLD, SPAWN, CAMERA, MINIGAME, FLOW } from './config.js';

const STATES = {
  INTRO:            'intro',
  TUTORIAL:         'tutorial',
  CAKE_SPAWNED:     'cake_spawned',
  CAKE_MINIGAME:    'cake_minigame',
  CELEBRATION:      'celebration',
  LETTER_FALLING:   'letter_falling',
  LETTER_OPEN:      'letter_open',
  ENDING_FREE_ROAM: 'ending_free_roam',
};

export class Game {
  constructor(assets, input, audio, ui) {
    this.assets  = assets;
    this.sprites = assets.groups;
    this.input   = input;
    this.audio   = audio;
    this.ui      = ui;

    this.canvas   = document.getElementById('game');
    this.renderer = new Renderer(this.canvas);

    // World matches background image; camera locked dead-centre.
    this.worldW  = WORLD.W;
    this.worldH  = WORLD.H;
    this.groundY = WORLD.GROUND_Y;

    this.platforms = [
      new Platform(0, this.groundY, this.worldW, 200), // invisible ground
    ];

    this.player = new Player(SPAWN.PLAYER_X, this.groundY);
    this.dog    = new Dog(SPAWN.DOG_X,       this.groundY);
    this.dummy  = new Dummy(SPAWN.DUMMY_X,   this.groundY);

    this.cake   = null;  // spawned after tutorial
    this.letter = null;  // spawned after celebration

    // Tutorial state
    this.objectives = [
      { id: 'move',   text: 'Move with A/D (or Q/D)', done: false },
      { id: 'jump',   text: 'Jump with Space',        done: false },
      { id: 'sprint', text: 'Sprint with Ctrl',       done: false },
      { id: 'dummy',  text: 'Talk to the dummy (E)',  done: false },
    ];
    this.ui.setObjectives(this.objectives.map(o => o.text));
    this.exp = 0;
    this.ui.setExp(0);
    this.ui.setLevel(26);
    this.ui.setAvatar('assets/ui/avatar_1.png');

    // Locked camera: always centered on world, zoom covers the bg.
    this.zoomBase = this._chooseZoom();
    this._updatePlayerBounds();
    this.renderer.snapCamera(this.worldW / 2, this.worldH / 2, this.zoomBase);

    this.state = STATES.INTRO;
    this.timer = 0;
    this.celebrationT = 0;
    this.minigame = { time: MINIGAME.TIME, total: 27, retried: false };
    this._ambientT = 0;
    this.paused = false;

    // Click-anywhere on letter icon should reopen (handled by UI)
    this.ui.showLetterIcon = this.ui.showLetterIcon.bind(this.ui);

    window.addEventListener('resize', () => {
      this.zoomBase = this._chooseZoom();
      this._updatePlayerBounds();
    });

    // Seed ambient particles around player
    for (let i = 0; i < 20; i++) this._spawnAmbient(true);
  }

  _chooseZoom() {
    // CSS-"cover" semantics: scale the bg up so it fills the canvas, even if
    // a bit of the image gets cropped on one axis. No letterbox bars.
    return Math.max(
      this.canvas.width  / this.worldW,
      this.canvas.height / this.worldH,
    );
  }

  // Player can walk to the visible bg edges (cropped portion is excluded).
  _updatePlayerBounds() {
    const halfVisX = (this.canvas.width / 2) / this.zoomBase;
    const minX = Math.max(50, this.worldW / 2 - halfVisX + 40);
    const maxX = Math.min(this.worldW - 50, this.worldW / 2 + halfVisX - 40);
    if (this.player) this.player.setWorldBounds(minX, maxX);
    if (this.dog)    this.dog.setWorldBounds(minX, maxX);
  }

  start() {
    this.audio.startMusic();
    // First frame uses dt=0 so the physics integrator doesn't apply a stale
    // delta from before rAF was even scheduled (which on a cached refresh
    // could be large enough to launch the player off-screen).
    let last = null;
    const loop = (now) => {
      const dt = last == null ? 0 : Math.max(0, Math.min(1 / 30, (now - last) / 1000));
      last = now;
      this.tick(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  tick(dt) {
    // Pause / Esc
    if (this.input.consume('pause')) {
      if (this.ui.isLetterOpen()) {
        this.ui.closeLetter();
        if (this.state === STATES.LETTER_OPEN) {
          this.state = STATES.ENDING_FREE_ROAM;
          this.ui.showLetterIcon(() => this.ui.openLetter());
        }
      } else if (this.paused) {
        this._unpause();
      } else {
        this._pause();
      }
    }

    if (!this.paused) this.update(dt);
    this.render();
    this.input.endFrame();
  }

  _pause()   { this.paused = true;  this.ui.showPause(() => this._unpause()); }
  _unpause() { this.paused = false; this.ui.hidePause(); }

  update(dt) {
    // Lock player when overlay is open
    this.player.lockMovement = this.ui.isLetterOpen();

    // Updates
    this.player.update(dt, this.input, this.platforms, this.audio);
    this.dog.update(dt, this.player, this.platforms);
    this.dummy.update(dt);
    if (this.cake)   this.cake.update(dt);
    if (this.letter) this.letter.update(dt);

    this._tickAmbient(dt);
    this.renderer.updateParticles(dt);

    // While the letter overlay is open from anywhere, the only input we
    // accept is "close" — don't run the regular state machine that would
    // otherwise eat the E keypress on a nearby interactable.
    if (this.ui.isLetterOpen()) {
      if (this.input.consume('interact')) this.ui.closeLetter();
      this.ui.hidePrompt();
      if (!this.ui.isLetterOpen() && this.state === STATES.LETTER_OPEN) {
        this.state = STATES.ENDING_FREE_ROAM;
        this.ui.showLetterIcon(() => this.ui.openLetter());
      }
      this._followCamera(dt);
      this.ui.setExp(this.exp);
      return;
    }

    // State machine
    switch (this.state) {
      case STATES.INTRO:
        this.timer += dt;
        if (this.timer > FLOW.INTRO_T) { this.state = STATES.TUTORIAL; this.timer = 0; }
        break;

      case STATES.TUTORIAL:
        // Objectives can be completed in any order.
        if (!this.objectives[0].done && Math.abs(this.player.vx) > 60) {
          this._completeObj(0);
        }
        if (!this.objectives[1].done && !this.player.grounded && this.player.vy < 0) {
          this._completeObj(1);
        }
        if (!this.objectives[2].done &&
            this.input.isHeld('sprint') && Math.abs(this.player.vx) > 280) {
          this._completeObj(2);
        }
        this._handleInteract();
        break;

      case STATES.CAKE_SPAWNED:
        this._handleInteract();
        break;

      case STATES.CAKE_MINIGAME:
        this._updateMinigame(dt);
        break;

      case STATES.CELEBRATION:
        this.celebrationT += dt;
        // sparkle burst trickle
        if (Math.random() < 0.6) this._sparkleBurst(this.player.x, this.player.y - 32, 1);
        if (this.celebrationT > FLOW.CELEBRATION_LETTER_T && !this.letter) {
          // Annie keeps celebrating through the fall — stops only when the
          // letter lands (handled below in LETTER_FALLING).
          const center = this.worldW / 2;
          const dropX  = center - (this.dummy.x - center) + SPAWN.LETTER_DROP_OFFSET;
          this.letter = new Letter(dropX, SPAWN.LETTER_START_Y, this.groundY);
          this.audio.letterFall();
          this.state = STATES.LETTER_FALLING;
        }
        break;

      case STATES.LETTER_FALLING:
        if (this.letter && !this.letter.landed) {
          this.dog.setLookAt({ x: this.letter.x, y: this.letter.y });
          // sparkle particles trailing the letter
          if (Math.random() < 0.7) {
            this.renderer.spawnParticle({
              x: this.letter.x + (Math.random() - 0.5) * 30,
              y: this.letter.y + (Math.random() - 0.5) * 16,
              vx: (Math.random() - 0.5) * 8,
              vy: -4 + Math.random() * 4,
              ax: 0, ay: 6,
              life: 1.0, maxLife: 1.0,
              size: 2 + Math.random() * 2,
              color: '#fff6c0', shape: 'sparkle',
              rot: 0, vrot: (Math.random() - 0.5) * 6,
            });
          }
        } else if (this.letter && this.letter.landed) {
          // Only fire these state transitions ONCE — calling them every frame
          // resets the animation timers, freezing both characters on frame 0.
          if (this.dog.lookAt)    this.dog.clearLookAt();
          if (this.dog.celebrating)    this.dog.stopCelebrate();
          if (this.player.celebrating) this.player.stopCelebrate();
        }
        this._handleInteract();
        break;

      case STATES.LETTER_OPEN:
        // E to close
        if (this.input.consume('interact')) this.ui.closeLetter();
        if (!this.ui.isLetterOpen()) {
          this.state = STATES.ENDING_FREE_ROAM;
          this.ui.showLetterIcon(() => this.ui.openLetter());
        }
        break;

      case STATES.ENDING_FREE_ROAM:
        this._handleInteract();
        break;
    }

    this._followCamera(dt);

    // Smooth EXP HUD
    this.ui.setExp(this.exp);
  }

  _followCamera(dt) {
    if (this.state === STATES.CAKE_MINIGAME && this.cake) {
      // Only the cake minigame zooms in; otherwise camera is locked.
      this.renderer.setCameraTarget(
        this.cake.x,
        this.cake.y + CAMERA.MINIGAME_Y_OFFSET,
        this.zoomBase * CAMERA.MINIGAME_ZOOM_MUL,
      );
    } else {
      // Locked camera centered on the bg.
      this.renderer.setCameraTarget(this.worldW / 2, this.worldH / 2, this.zoomBase);
    }
    this.renderer.updateCamera(dt);
  }

  _completeObj(idx) {
    this.objectives[idx].done = true;
    this.ui.completeObjective(idx);
    this.exp = Math.min(100, this.exp + FLOW.EXP_PER_OBJECTIVE);
    this.audio.interact();
    const labels = ['Move ✓', 'Jump ✓', 'Sprint ✓', 'Talked to dummy ✓'];
    this.ui.toastMsg(labels[idx]);
    // Only celebrate "Tutorial complete." once every objective is done.
    if (this.objectives.every(o => o.done)) {
      setTimeout(() => {
        this.ui.toastMsg('Tutorial complete.');
        setTimeout(() => this._spawnCake(), FLOW.CAKE_SPAWN_DELAY);
      }, FLOW.COMPLETE_TOAST_DELAY);
    }
  }

  _spawnCake() {
    // Cake spawns on the picnic table at center of bg.
    // Bottom of the cake sits on the table top, ~25 px above the ground line.
    this.cake = new Cake(SPAWN.CAKE_X, this.groundY + SPAWN.CAKE_Y_OFFSET);
    this.cake.spawned = true;
    this.cake.active = true;
    this.audio.cakeAppear();
    this._sparkleBurst(this.cake.x, this.cake.y - 60, 28);
    setTimeout(() => this.ui.toastMsg('A birthday cake appeared… ✨', 2800), 500);
    this.ui.hideQuest();
    this.state = STATES.CAKE_SPAWNED;
  }

  _handleInteract() {
    const cands = this._currentInteractables();
    const t = findInteractable(this.player, cands, 90);
    if (t) this.ui.showPrompt(`Press <kbd>E</kbd> to ${t.label || 'interact'}`);
    else this.ui.hidePrompt();

    if (this.input.consume('interact')) {
      if (t) this._interactWith(t);
    }
  }

  _currentInteractables() {
    const arr = [];
    if (this.dummy && this.dummy.active) {
      arr.push({ kind: 'dummy', x: this.dummy.x, label: 'talk', active: true });
    }
    if (this.cake && this.cake.active) {
      const allBlown = this.cake.allBlown;
      arr.push({
        kind: 'cake', x: this.cake.x,
        label: allBlown ? 'check the cake' : 'blow the candles',
        active: true,
      });
    }
    if (this.letter && this.letter.landed && this.letter.active !== false) {
      arr.push({
        kind: 'letter', x: this.letter.x,
        label: this.letter.opened ? 'read again' : 'open',
        active: true,
      });
    }
    return arr;
  }

  _interactWith(t) {
    this.player.triggerInteract();
    // Make the dog react too — face the target and play its interact anim.
    this.dog._lastTarget = t.x;
    this.dog.playInteract();
    this.player.facing = t.x > this.player.x ? 1 : -1;
    this.audio.interact();

    if (t.kind === 'dummy') {
      this.dummy.interactT = 0.5;
      this.audio.dummyHit();

      const allDone      = this.objectives.every(o => o.done);
      const cakeBlown    = this.cake && this.cake.allBlown;
      const letterOpened = this.letter && this.letter.opened;

      if (letterOpened) {
        // After the letter has been read — gentle "stay if you want" line.
        this.ui.toastMsg("Stay as long as you'd like. I don't mind.");
      } else if (cakeBlown) {
        // Candles are out, letter has fallen — point them to it.
        this.ui.toastMsg("Look — a letter just dropped for you. Go read it.");
      } else if (!this.objectives[3].done) {
        // Marks the dummy objective; if this completes the set, _completeObj
        // will follow up with the "Tutorial complete." toast.
        this._completeObj(3);
      } else if (!allDone) {
        this.ui.toastMsg('Complete the tutorial first');
      } else {
        // Tutorial is done — nudge the player toward the cake.
        this.ui.toastMsg('All done! Go blow the candles.');
      }
      return;
    }

    if (t.kind === 'cake') {
      const allBlown = this.cake.allBlown;
      if (allBlown) {
        this.ui.toastMsg('Candles have already been blown. Wait next year.');
      } else if (this.state === STATES.CAKE_SPAWNED) {
        this._enterMinigame();
      }
      return;
    }

    if (t.kind === 'letter') {
      this.letter.opened = true;
      this.audio.uiOpen();
      this.ui.openLetter();
      this.state = STATES.LETTER_OPEN;
      return;
    }
  }

  _enterMinigame() {
    this.state = STATES.CAKE_MINIGAME;
    this.cake.resetClicks();
    this.minigame = { time: MINIGAME.TIME, total: this.cake.clicksRemaining, retried: false };
    this.ui.showCountdown();
    this.ui.setCountdown(MINIGAME.TIME, this.minigame.total);
    this.ui.hidePrompt();
    // Lock the dog into its interact pose facing the cake — also disables
    // its random hop while the mini-game is running.
    this.dog.setLookAt({ x: this.cake.x, y: this.cake.y });
  }

  _updateMinigame(dt) {
    this.minigame.time -= dt;
    this.ui.setCountdown(this.minigame.time, this.cake.clicksRemaining);

    // Each click on the cake counts as one candle blown out.
    const clicks = this.input.consumeClicks();
    for (const click of clicks) {
      const wp = this.renderer.screenToWorld(click.x, click.y);
      if (this.cake.hits(wp.x, wp.y) && this.cake.clicksRemaining > 0) {
        this.cake.clicksRemaining--;
        this.audio.candleBlow();
        this._cakeClickParticles(wp.x, wp.y);
      }
    }

    if (this.cake.allBlown) {
      this._exitMinigameSuccess();
    } else if (this.minigame.time <= 0) {
      this._retryMinigame();
    }
  }

  _cakeClickParticles(x, y) {
    // Smoke
    for (let i = 0; i < 5; i++) {
      this.renderer.spawnParticle({
        x: x + (Math.random() - 0.5) * 4,
        y: y + 2,
        vx: (Math.random() - 0.5) * 12,
        vy: -22 - Math.random() * 18,
        ax: 0, ay: -8,
        life: 0.9, maxLife: 0.9,
        size: 4 + Math.random() * 3,
        color: 'rgba(220,220,225,0.7)',
        shape: 'smoke',
      });
    }
    // Sparkles
    for (let i = 0; i < 4; i++) {
      this.renderer.spawnParticle({
        x, y,
        vx: (Math.random() - 0.5) * 60,
        vy: -30 - Math.random() * 30,
        ax: 0, ay: 30,
        life: 0.6, maxLife: 0.6,
        size: 1.5 + Math.random() * 1.5,
        color: '#fff6c0', shape: 'sparkle',
        rot: 0, vrot: (Math.random() - 0.5) * 8,
      });
    }
  }

  _exitMinigameSuccess() {
    this.audio.celebration();
    setTimeout(() => this.audio.levelUp(), 350);

    this.ui.hideCountdown();
    this.state = STATES.CELEBRATION;
    this.celebrationT = 0;

    // Free the dog from the cake-stare and let it celebrate.
    this.dog.clearLookAt();
    this.player.startCelebrate();
    this.dog.startCelebrate();

    this.ui.setLevel(27, true);
    this.ui.setAvatar('assets/ui/avatar_2.png');
    this.exp = 100;
    this.ui.setExp(100);
    this.ui.showLevelUp();

    this._sparkleBurst(this.player.x, this.player.y - 40, 60);
    this._sparkleBurst(this.dog.x,    this.dog.y    - 30, 30);
    this._sparkleBurst(this.cake.x,   this.cake.y   - 60, 36);
  }

  _retryMinigame() {
    this.minigame.time = MINIGAME.TIME;
    this.minigame.retried = true;
    // Re-light every candle so the player has to blow them all again.
    this.cake.resetClicks();
    this.ui.toastMsg('Take a breath… try again!', 1800);
  }

  // ----- Particles -----
  _sparkleBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 12 + Math.random() * 60;
      this.renderer.spawnParticle({
        x: x + Math.cos(a) * (r * 0.4),
        y: y + Math.sin(a) * (r * 0.3),
        vx: Math.cos(a) * (40 + Math.random() * 80),
        vy: Math.sin(a) * (40 + Math.random() * 80) - 40,
        ax: 0, ay: 80,
        life: 1.2 + Math.random() * 0.8, maxLife: 2.0,
        size: 2 + Math.random() * 3,
        color: ['#ffd86e', '#ff8aa1', '#ffe7b0', '#aaffff', '#ffc0e0'][i % 5],
        shape: 'sparkle',
        rot: 0, vrot: (Math.random() - 0.5) * 6,
      });
    }
  }

  _spawnAmbient(seedSpread = false) {
    const baseX = seedSpread
      ? Math.random() * this.worldW
      : (this.player ? this.player.x - 600 + Math.random() * 1200 : Math.random() * this.worldW);
    this.renderer.spawnParticle({
      x: baseX,
      y: 50 + Math.random() * 380,
      vx: 5 + Math.random() * 12, vy: 4 + Math.random() * 8,
      ax: 0, ay: 0,
      life: 8 + Math.random() * 4, maxLife: 12,
      size: 1.5 + Math.random() * 2,
      color: ['#ffd0a8', '#ffd6e8', '#fff0c0', '#ffe7b0'][Math.floor(Math.random() * 4)],
      shape: 'circle',
      alpha: 0.5,
    });
  }
  _tickAmbient(dt) {
    this._ambientT += dt;
    if (this._ambientT > 0.55) { this._ambientT = 0; this._spawnAmbient(); }
  }

  // ----- Render -----
  render() {
    const r = this.renderer;
    r.clear();

    r.beginWorld();
    const ctx = r.ctx;

    // Bg drawn in world space — sized to the world rect, scales with camera
    r.drawBackgroundWorld(this.assets.groups.background[0], this.worldW, this.worldH);

    r.drawParticles();

    // Dummy (always rendered while active)
    if (this.dummy.active) this.dummy.draw(ctx, this.assets.groups);

    // Cake
    if (this.cake && this.cake.spawned) {
      this.cake.draw(ctx, this.assets.groups.cake);
    }

    // Letter
    if (this.letter) this.letter.draw(ctx, {
      fall: this.assets.groups.letterFall,
      land: this.assets.groups.letterLand[0],
    });

    // Dog + Player draw order based on x
    const dogFirst = this.dog.x < this.player.x;
    if (dogFirst) this.dog.draw(ctx, this.assets.groups);
    this.player.draw(ctx, this.assets.groups);
    if (!dogFirst) this.dog.draw(ctx, this.assets.groups);

    // Glow halos for nearby interactables
    this._drawGlows(ctx);

    r.endWorld();
  }

  _drawGlows(ctx) {
    if (this.state === STATES.CAKE_MINIGAME) return;
    const t = performance.now() / 1000;

    const pulse = (x, y, base = 36, color = 'rgba(255,210,127,') => {
      const r = base + Math.sin(t * 2.4) * 4;
      const g = ctx.createRadialGradient(x, y, 4, x, y, r);
      g.addColorStop(0, color + '0.45)');
      g.addColorStop(1, color + '0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };

    if (this.cake && this.cake.active && !this.cake.allBlown) {
      pulse(this.cake.x, this.cake.y - 50, 44);
    }
    if (this.letter && this.letter.landed) {
      pulse(this.letter.x, this.letter.y - 30, 32, 'rgba(255,180,200,');
    }
    if (this.dummy && this.dummy.active) {
      const showDummyGlow =
        this.state === STATES.TUTORIAL && this.objectives[2].done && !this.objectives[3].done;
      if (showDummyGlow) pulse(this.dummy.x, this.dummy.y - 32, 30);
    }
  }
}
