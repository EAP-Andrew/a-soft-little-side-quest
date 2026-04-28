import { WIDTH, HEIGHT } from './config.js';
import { setupInput, endInputFrame, wasActionPressed, consumeClick } from './input.js';
import { loadSave, persist, hasSave, clearSave, unlockSkyMap, openSkyMap, enterSkyCard, completeSkyCard, areAllSkyCardsCompleted, unlockFinalCastle, returnToFinalCastle } from './save.js';
import { setupUI } from './ui.js';
import { Player } from './player.js';
import { DogCompanion } from './dog.js';
import { Camera } from './camera.js';
import { getZone, nextMainZone, getSkyLevelByCard, getFinalZone } from './level.js';
import { SKY_CARDS } from './levelData.js';
import { aabb, resolveRect } from './collision.js';
import { updateEnemies, handleEnemyVsPlayer } from './enemies.js';
import { collect } from './collectibles.js';
import { nearestInteraction } from './interactions.js';
import { ParticleSystem } from './particles.js';
import { playMusic, playSfx, setMuted } from './audio.js';
import { render } from './renderer.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = WIDTH; this.canvas.height = HEIGHT;
    setupInput(canvas);
    this.saveState = loadSave();
    this.player = new Player(120, 520);
    this.dog = new DogCompanion(70, 560);
    this.camera = new Camera(WIDTH, HEIGHT);
    this.particles = new ParticleSystem();
    this.ui = null;
    this.skyCards = SKY_CARDS;
    this.zone = getZone(this.saveState.currentZone) || getZone('quiet-castle');
    this.debug = false;
    this.running = false;
    this.paused = false;
    this.last = 0;
    this.checkpoint = { ...(this.zone.checkpoint || { x: 120, y: 520 }) };
    this.toastTime = 0;
  }

  boot() {
    setupUI(this);
    this.ui.showMenu();
    this.updateContinueBtn();
    playMusic('menu');
    requestAnimationFrame((t) => this.loop(t));
  }

  showHud(v) { document.getElementById('hud').classList.toggle('hidden', !v); }
  updateContinueBtn() { document.getElementById('continueBtn').style.display = hasSave() ? 'block' : 'none'; }
  toggleMute() { this.saveState.muted = !this.saveState.muted; setMuted(this.saveState.muted); persist(this.saveState); }
  toggleParticles() { this.saveState.reducedParticles = !this.saveState.reducedParticles; persist(this.saveState); document.getElementById('particlesBtn').textContent = `Reduced Particles: ${this.saveState.reducedParticles ? 'On' : 'Off'}`; }
  goToMenu() { this.running = false; this.paused = false; this.ui.showMenu(); playMusic('menu'); }

  startNew() { clearSave(); this.saveState = loadSave(); this.loadZone('quiet-castle'); this.running = true; this.paused = false; this.ui.hideMenu(); this.showHud(true); playMusic('gameplay'); }
  continueGame() { this.saveState = loadSave(); if (this.saveState.currentAct === 2 && this.saveState.currentZone === 'sky-map') return this.ui.openSkyMap(); this.loadZone(this.saveState.currentZone || 'quiet-castle'); this.running = true; this.paused = false; this.ui.hideMenu(); this.showHud(true); playMusic('gameplay'); }

  loadZone(id) {
    this.zone = getZone(id) || getFinalZone();
    this.player.x = this.zone.checkpoint?.x || 120;
    this.player.y = this.zone.checkpoint?.y || 520;
    this.player.vx = this.player.vy = 0;
    this.checkpoint = { ...(this.zone.checkpoint || { x: 120, y: 520 }) };
    this.saveState.currentZone = this.zone.id;
    this.saveState.currentAct = this.zone.act;
    this.saveState.player = { x: this.player.x, y: this.player.y };
    persist(this.saveState);
  }

  tryEnterSkyCard(cardId) {
    if (!this.saveState.unlockedSkyCards[cardId]) return;
    enterSkyCard(this.saveState, cardId);
    this.ui.closeSkyMap();
    const lvl = getSkyLevelByCard(cardId);
    this.loadZone(lvl.id);
    this.running = true;
    this.paused = false;
    this.showHud(true);
    playMusic('sky');
  }

  processInteraction(i) {
    if (!i) return;
    playSfx('interact');
    if (i.kind === 'sign' || i.kind === 'note') this.ui.toast(i.text);
    if (i.kind === 'door' && this.saveState.objectives['rescue-shelter'] >= 6) { this.saveState.dogRescued = true; this.ui.toast('The puppy joins you!'); playSfx('bark'); }
    if (i.kind === 'rocket') {
      this.ui.toast('Launching...'); playSfx('rocket');
      unlockSkyMap(this.saveState); openSkyMap(this.saveState);
      this.running = false;
      this.ui.openSkyMap();
    }
    if (i.kind === 'button' && this.saveState.candlesLit >= 27) { this.ui.toast('Candles blown out!'); playSfx('blow'); }
    if (i.kind === 'letter' && this.saveState.candlesLit >= 27) {
      this.saveState.finalLetterOpened = true;
      this.ui.openLetter(`I know your birthday has never felt special. Like a day that slips through your fingers before it has the chance to become something warm.\n\nI won't tell you I will make it feel special from now. I won't pretend I can do that. But I can be there in the quiet of it, in the in-between moments, making sure it doesn't feel so empty.\n\nYou didn't want any gift, you never really do. But still, I couldn't let this day pass without giving you something. So here it is — no ribbon, no box, nothing shiny. Just this, something made of time, something that costs nothing, yet carries a part of me, my stupid thoughts, and my feelings. Not something you can unwrap, but something that was made for you, quietly, with care.\n\nBecause even if this day feels ordinary to you, it isn't to me. There is something rare in the way you exist in the world — in the softness, the kindness, the feelings you try to hide, in the strength you carry, in the way you make even silence feel less empty.\n\nSo thank you. Thank you for existing. The day you were born matters more than you think. At least, it does to me. I hope that somewhere between one breath and the next, you smiled. Even a small one.\n\nHave a great ordinary day.`);
      this.ui.toast('Thank you for playing.');
      playSfx('letter');
    }
    if (i.kind === 'dogSwitch' && this.saveState.dogRescued) this.ui.toast(i.text);
    persist(this.saveState);
  }

  handleTransitions() {
    if (!this.zone.exit) return;
    if (aabb(this.player, this.zone.exit)) {
      if (this.zone.returnToSkyMap) {
        completeSkyCard(this.saveState, this.zone.cardId);
        if (areAllSkyCardsCompleted(this.saveState)) unlockFinalCastle(this.saveState);
        this.running = false;
        if (this.saveState.finalCastleUnlocked) {
          returnToFinalCastle(this.saveState);
          this.loadZone('birthday-castle');
          this.running = true;
          playMusic('ending');
        } else {
          this.ui.openSkyMap();
        }
      } else if (this.zone.returnToFinalCastle) {
        unlockFinalCastle(this.saveState);
        this.loadZone('birthday-castle');
        playMusic('ending');
      } else {
        const n = nextMainZone(this.zone.id);
        if (n) this.loadZone(n.id);
      }
    }
  }

  update(dt) {
    if (wasActionPressed('debug')) this.debug = !this.debug;
    if (wasActionPressed('pause')) this.ui.showPause();
    if (wasActionPressed('respawn')) { this.player.x = this.checkpoint.x; this.player.y = this.checkpoint.y; this.player.vx = this.player.vy = 0; }

    const inWater = (this.zone.waterAreas || []).some((w) => aabb(this.player, w));
    const gravityScale = inWater ? (this.zone.waterGravityScale || 0.52) : (this.zone.gravityScale || 1);
    const wasGrounded = this.player.onGround;
    this.player.onGround = false;
    const playerFrame = this.player.update(dt, inWater, gravityScale, this.zone.waterFriction || 0.72);
    if (playerFrame.jumped) {
      playSfx('jump');
      this.particles.burst(this.player.x + this.player.w / 2, this.player.y + this.player.h * 0.65, inWater ? '#cbeeff' : '#ffe8ff', this.saveState.reducedParticles ? 3 : 7);
    }

    (this.zone.wavePlatforms || []).forEach((p) => { p.t = (p.t || 0) + dt; p.y += Math.sin(p.t * p.speed) * p.amp * dt; });
    (this.zone.tidePlatforms || []).forEach((p) => { p.t = (p.t || 0) + dt; p.active = Math.sin(p.t * (Math.PI / p.period)) > 0; });

    const solids = [...(this.zone.platforms || []), ...(this.zone.temporaryPlatforms || []), ...(this.zone.wavePlatforms || []), ...((this.zone.tidePlatforms || []).filter((p) => p.active))];
    const impactVy = this.player.vy;
    solids.forEach((p) => { if (aabb(this.player, p)) resolveRect(this.player, p); });
    (this.zone.bubbleLifts || []).forEach((b) => { if (aabb(this.player, b)) { this.player.vy -= (b.lift || 320) * dt; if (Math.random() < 0.12) playSfx('bubble'); } });

    if (this.player.onGround && !wasGrounded) {
      this.particles.burst(this.player.x + this.player.w / 2, this.player.y + this.player.h, '#ffe2f7', this.saveState.reducedParticles ? 2 : 5);
      if (Math.abs(impactVy) > 280) playSfx('splash');
    }

    updateEnemies(this.zone.enemies || [], dt);
    const enemyEvent = handleEnemyVsPlayer(this.player, this.zone.enemies || []);
    if (enemyEvent === 'defeat') playSfx('defeat');
    if (enemyEvent === 'damage') { playSfx('damage'); if (this.player.hp <= 0) { this.player.x = this.checkpoint.x; this.player.y = this.checkpoint.y; this.player.hp = 3; } }

    const got = collect(this.zone.collectibles || [], this.player, this.saveState, this.zone.id);
    if (got) { playSfx(this.zone.id === 'gentle-sea' ? 'seashell' : 'collectible'); this.particles.burst(this.player.x + 10, this.player.y, '#fff', this.saveState.reducedParticles ? 4 : 10); }

    this.dog.update(dt, this.player, this.saveState.dogRescued);
    if (this.dog.barkTimer <= 0 && this.saveState.dogRescued) { playSfx('bark'); this.dog.barkTimer = 6 + Math.random() * 4; }

    const inter = nearestInteraction(this.player, this.zone.interactions || []);
    if (consumeClick() && inter) this.processInteraction(inter);

    if (this.player.y > HEIGHT + 260) { this.player.x = this.checkpoint.x; this.player.y = this.checkpoint.y; }

    this.camera.follow(this.player, this.zone.width || WIDTH);
    this.handleTransitions();
    this.particles.update(dt);

    const totalCollect = (this.zone.collectibles || []).length;
    const currCollect = (this.zone.collectibles || []).filter((c) => c.got).length;
    if (this.zone.id === 'birthday-castle') this.saveState.candlesLit = currCollect;
    const progress = Math.min(100, Math.floor((Object.keys(this.saveState.completedSkyCards).length * 10) + (this.zone.order * 4)));

    this.ui.updateHud({ top: `Act ${this.zone.act} • ${this.zone.name} ${this.saveState.dogRescued ? '🐶' : ''}`, obj: `${this.zone.objective} (${currCollect}/${totalCollect})`, prompt: inter ? 'Click to interact' : '', progress });
    persist(this.saveState);
  }

  loop(ts) {
    const dt = Math.min(0.033, (ts - this.last) / 1000 || 0.016);
    this.last = ts;
    if (this.running && !this.paused) this.update(dt);
    render(this.ctx, this);
    endInputFrame();
    requestAnimationFrame((t) => this.loop(t));
  }
}
