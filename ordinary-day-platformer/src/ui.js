import { GAME_TITLE, GAME_SUBTITLE, SKY_CARD_ORDER } from './config.js';

export function setupUI(game) {
  const $ = (id) => document.getElementById(id);
  const menu = $('menuScreen');
  const controls = $('controlsScreen');
  const credits = $('creditsScreen');
  const pause = $('pauseScreen');
  const skyMap = $('skyMapScreen');
  const letter = $('letterScreen');

  $('playBtn').onclick = () => game.startNew();
  $('continueBtn').onclick = () => game.continueGame();
  $('controlsBtn').onclick = () => showControls(controls);
  $('creditsBtn').onclick = () => showCredits(credits);
  $('muteBtn').onclick = () => game.toggleMute();
  $('particlesBtn').onclick = () => game.toggleParticles();

  game.ui = {
    showMenu() { menu.classList.remove('hidden'); game.showHud(false); },
    hideMenu() { menu.classList.add('hidden'); },
    showPause() {
      if (!pause.classList.contains('hidden')) return;
      game.paused = true;
      pause.innerHTML = `<div class="panel-shell"><h2>Paused</h2><p>Take a breath, princess. The quest waits for you.</p><div class="panel-actions"><button id="resumeBtn">Resume</button><button id="menuBtn" class="soft">Main Menu</button></div></div>`;
      pause.classList.remove('hidden');
      document.getElementById('resumeBtn').onclick = () => {
        game.paused = false;
        pause.classList.add('hidden');
      };
      document.getElementById('menuBtn').onclick = () => {
        pause.classList.add('hidden');
        game.goToMenu();
      };
    },
    openSkyMap() {
      const cards = SKY_CARD_ORDER.map((id) => {
        const unlocked = game.saveState.unlockedSkyCards[id];
        const done = game.saveState.completedSkyCards[id];
        return `<button class="card ${done ? 'done' : ''}" data-card="${id}" ${!unlocked ? 'disabled' : ''}>
          <h3>${game.skyCards[id].name}</h3>
          <p>${unlocked ? game.skyCards[id].description : 'This place is still sleeping.'}</p>
          <small>${done ? 'Completed' : unlocked ? 'Unlocked' : 'Locked'}</small>
        </button>`;
      }).join('');
      skyMap.innerHTML = `<div class="panel-shell"><h2>The Sky Map</h2><p>Choose where the rocket carried your heart.</p><div class="cards">${cards}</div><button id="backMenu" class="soft">Back to Menu</button></div>`;
      skyMap.classList.remove('hidden');
      skyMap.querySelectorAll('.card').forEach((node) => {
        node.onclick = () => game.tryEnterSkyCard(node.dataset.card);
      });
      document.getElementById('backMenu').onclick = () => game.goToMenu();
    },
    closeSkyMap() { skyMap.classList.add('hidden'); },
    openLetter(text) {
      letter.classList.remove('hidden');
      letter.innerHTML = `<div class="paper"><h2>Final Letter</h2><pre>${text}</pre><button id="closeLetter">Close</button></div>`;
      document.getElementById('closeLetter').onclick = () => letter.classList.add('hidden');
    },
    toast(msg) {
      const t = $('hudToast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 1200);
    },
    updateHud(text) {
      $('hudTop').textContent = text.top;
      $('hudObjective').textContent = text.obj;
      $('hudPrompt').textContent = text.prompt || '';
      $('hudProgressFill').style.width = `${text.progress}%`;
    },
  };

  controls.innerHTML = `<div class="panel-shell"><h2>Controls</h2><ul class="controls-list"><li><strong>Move:</strong> Arrow Left/Right, A/D, or Q/D</li><li><strong>Jump:</strong> Space, Arrow Up, W, or Z</li><li><strong>Interact:</strong> Mouse click</li><li><strong>Pause:</strong> Escape</li><li><strong>Respawn:</strong> R</li><li><strong>Debug:</strong> F3</li></ul><button class="soft">Back</button></div>`;
  controls.querySelector('button').onclick = () => controls.classList.add('hidden');
  credits.innerHTML = `<div class="panel-shell"><h2>${GAME_TITLE}</h2><p>${GAME_SUBTITLE}</p><p>Original code art, audio, and game design crafted in vanilla HTML/CSS/JS.</p><button class="soft">Back</button></div>`;
  credits.querySelector('button').onclick = () => credits.classList.add('hidden');
}

function showControls(el) { el.classList.remove('hidden'); }
function showCredits(el) { el.classList.remove('hidden'); }
