// ui.js — DOM-backed HUD, quest panel, prompt, countdown, toast, letter.

const LETTER_TEXT =
`I know your birthday has never felt special. Like a day that slips through your fingers before it has the chance to become something warm.

I won't tell you I will make it feel special from now. I won't pretend I can do that. But I can be there in the quiet of it, in the in-between moments, making sure it doesn't feel so empty.

You didn't want any gift, you never really do. But still, I couldn't let this day pass without giving you something. So here it is — no ribbon, no box, nothing shiny. Just this, something made of time, something that costs nothing, yet carries a part of me, my stupid thoughts, and my feelings. Not something you can unwrap, but something that was made for you, quietly, with care.

Because even if this day feels ordinary to you, it isn't to me. There is something rare in the way you exist in the world — in the softness, the kindness, the feelings you try to hide, in the strength you carry, in the way you make even silence feel less empty.

So thank you. Thank you for existing. The day you were born matters more than you think. At least, it does to me. I hope that somewhere between one breath and the next, you smiled. Even a small one.

Have a great ordinary day.`;

export class UI {
  constructor(audio) {
    this.audio = audio;

    // HUD (avatar PNG already includes name + level baked in)
    this.hudExp    = document.getElementById('hud-exp-fill');
    this.hudAvatar = document.getElementById('hud-avatar');

    // Quest (quest.png already lists the 4 objectives; we overlay checkmarks)
    this.questPanel  = document.getElementById('quest-panel');
    this.questChecks = Array.from(document.querySelectorAll('.quest-check'));

    // Prompt + toast
    this.prompt = document.getElementById('prompt');
    this.toast  = document.getElementById('toast');
    this._toastTimer = null;

    // Countdown
    this.countdown    = document.getElementById('countdown');
    this.countdownImg = document.getElementById('countdown-img');
    this.candlesLeft  = document.getElementById('candles-left');

    // Level up burst
    this.levelup = document.getElementById('levelup');

    // Pause
    this.pause = document.getElementById('pause');
    this._onResume = null;
    document.getElementById('resume-btn').addEventListener('click', () => {
      if (this._onResume) this._onResume();
    });

    // Letter overlay
    this.letterOverlay = document.getElementById('letter-overlay');
    document.getElementById('letter-close').addEventListener('click', () => this.closeLetter());
    this.letterIcon = document.getElementById('letter-icon');
    this._onLetterIcon = null;
    this.letterIcon.addEventListener('click', () => {
      if (this._onLetterIcon) this._onLetterIcon();
      else this.openLetter();
    });

    this.objectives = [];
  }

  // ----- Quest -----
  setObjectives(list) {
    // The labels themselves live in the quest.png artwork; we only track done-ness.
    this.objectives = list.map(t => ({ text: t, done: false }));
    this._refreshQuest();
  }
  completeObjective(idx) {
    if (this.objectives[idx] && !this.objectives[idx].done) {
      this.objectives[idx].done = true;
      this._refreshQuest();
    }
  }
  _refreshQuest() {
    this.objectives.forEach((o, i) => {
      const el = this.questChecks[i];
      if (!el) return;
      el.classList.toggle('done', !!o.done);
    });
  }
  hideQuest() { this.questPanel.classList.add('hidden'); }
  showQuest() { this.questPanel.classList.remove('hidden'); }

  // ----- HUD -----
  // Level is baked into avatar PNGs (avatar_1 = lv 26, avatar_2 = lv 27).
  // setLevel just animates the avatar; setAvatar swaps the image source.
  setLevel(_lv, animate = false) {
    if (animate) {
      this.hudAvatar.classList.remove('bump');
      void this.hudAvatar.offsetWidth;
      this.hudAvatar.classList.add('bump');
    }
  }
  setAvatar(src) { this.hudAvatar.src = src; }
  setExp(v, max = 100) {
    const pct = Math.max(0, Math.min(100, (v / max) * 100));
    this.hudExp.style.width = pct + '%';
  }

  // ----- Prompt -----
  showPrompt(html) {
    this.prompt.innerHTML = html;
    this.prompt.classList.add('show');
  }
  hidePrompt() { this.prompt.classList.remove('show'); }

  // ----- Toast -----
  toastMsg(msg, dur = 2400) {
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toast.classList.remove('show'), dur);
  }

  // ----- Countdown -----
  showCountdown() { this.countdown.classList.add('show'); }
  hideCountdown() { this.countdown.classList.remove('show'); }
  setCountdown(seconds, candlesLeft) {
    const i = Math.max(0, Math.min(10, Math.ceil(seconds)));
    this.countdownImg.src = `assets/ui/counter_${i}.png`;
    this.candlesLeft.textContent = `${candlesLeft} candles left`;
  }

  // ----- Level up flash -----
  showLevelUp() {
    this.levelup.classList.add('show');
    setTimeout(() => this.levelup.classList.remove('show'), 1900);
  }

  // ----- Letter -----
  openLetter() {
    this.audio.uiOpen();
    this.letterOverlay.classList.add('show');
  }
  closeLetter() {
    if (!this.isLetterOpen()) return;
    this.audio.uiClose();
    this.letterOverlay.classList.remove('show');
  }
  isLetterOpen() { return this.letterOverlay.classList.contains('show'); }
  showLetterIcon(handler) {
    this._onLetterIcon = handler;
    this.letterIcon.classList.add('show');
  }

  // ----- Pause -----
  showPause(onResume) {
    this._onResume = onResume;
    this.pause.classList.add('show');
  }
  hidePause() { this.pause.classList.remove('show'); }
  isPaused()  { return this.pause.classList.contains('show'); }
}
