// input.js — keyboard + mouse input with action mapping.

const KEYMAP = {
  left:     ['ArrowLeft', 'a', 'A', 'q', 'Q'],   // ZQSD + WASD
  right:    ['ArrowRight', 'd', 'D'],
  up:       ['ArrowUp', 'w', 'W', 'z', 'Z'],
  down:     ['ArrowDown', 's', 'S'],
  jump:     [' ', 'Spacebar'],
  sprint:   ['Control'],
  interact: ['e', 'E'],
  pause:    ['Escape'],
};

export class Input {
  constructor() {
    this.held = new Set();          // raw keys currently held
    this.actions = new Set();       // mapped action names currently active
    this.justPressed = new Set();   // actions pressed this frame (consume() to read)
    this.mouse = { x: 0, y: 0 };
    this._clicks = [];

    window.addEventListener('keydown', (e) => {
      // Avoid the page scrolling on Space / arrows
      if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
      // Some browsers report Control as 'Control' for both L/R variants
      const key = e.key === 'Spacebar' ? ' ' : e.key;
      if (this.held.has(key)) return; // ignore key auto-repeat for justPressed
      this.held.add(key);
      this._actionsFor(key).forEach(a => {
        if (!this.actions.has(a)) this.justPressed.add(a);
        this.actions.add(a);
      });
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key === 'Spacebar' ? ' ' : e.key;
      this.held.delete(key);
      // Rebuild action set from currently-held keys
      this.actions.clear();
      for (const k of this.held) this._actionsFor(k).forEach(a => this.actions.add(a));
    });

    // Lose focus → drop everything
    window.addEventListener('blur', () => {
      this.held.clear();
      this.actions.clear();
      this.justPressed.clear();
    });

    const canvas = document.getElementById('game');
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top)  * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', (e) => {
      const r = canvas.getBoundingClientRect();
      this._clicks.push({
        x: (e.clientX - r.left) * (canvas.width / r.width),
        y: (e.clientY - r.top)  * (canvas.height / r.height),
        button: e.button,
      });
    });

    // Touch taps on the canvas → register as clicks (cake minigame on mobile)
    canvas.addEventListener('touchstart', (e) => {
      const r = canvas.getBoundingClientRect();
      for (const t of e.changedTouches) {
        this._clicks.push({
          x: (t.clientX - r.left) * (canvas.width / r.width),
          y: (t.clientY - r.top)  * (canvas.height / r.height),
          button: 0,
        });
      }
      e.preventDefault();
    }, { passive: false });

    this._bindTouchControls();
  }

  // On-screen buttons (mobile). Each button injects directly into the
  // same actions / justPressed sets the keyboard uses.
  _bindTouchControls() {
    const root = document.getElementById('touch-controls');
    if (!root) return;

    const press = (act) => {
      if (!this.actions.has(act)) this.justPressed.add(act);
      this.actions.add(act);
    };
    const release = (act) => {
      this.actions.delete(act);
    };

    for (const btn of root.querySelectorAll('.tc-btn')) {
      const act = btn.dataset.action;
      if (!act) continue;

      const onDown = (e) => {
        press(act);
        btn.classList.add('pressed');
        if (e.pointerId != null) {
          try { btn.setPointerCapture(e.pointerId); } catch {}
        }
        e.preventDefault();
      };
      const onUp = (e) => {
        release(act);
        btn.classList.remove('pressed');
        e.preventDefault();
      };

      btn.addEventListener('pointerdown',   onDown);
      btn.addEventListener('pointerup',     onUp);
      btn.addEventListener('pointercancel', onUp);
      btn.addEventListener('pointerleave',  onUp);
      // Stop the browser from also firing a synthetic click that could
      // pause the game or hit some other element.
      btn.addEventListener('click', (e) => e.preventDefault());
    }
  }

  _actionsFor(key) {
    const out = [];
    for (const [act, keys] of Object.entries(KEYMAP)) {
      if (keys.includes(key)) out.push(act);
    }
    return out;
  }

  isHeld(act) { return this.actions.has(act); }
  consume(act) {
    if (this.justPressed.has(act)) {
      this.justPressed.delete(act);
      return true;
    }
    return false;
  }
  consumeClicks() {
    const c = this._clicks; this._clicks = []; return c;
  }
  endFrame() { this.justPressed.clear(); }
}
