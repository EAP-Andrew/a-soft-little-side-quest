const ACTION_BINDINGS = {
  left: ['ArrowLeft', 'KeyA', 'KeyQ'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW', 'KeyZ'],
  down: ['ArrowDown', 'KeyS'],
  jump: ['Space', 'ArrowUp', 'KeyW', 'KeyZ'],
  interact: ['Enter', 'KeyE'],
  pause: ['Escape'],
  respawn: ['KeyR'],
  debug: ['F3'],
};

const BLOCK_BROWSER_SCROLL = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const downCodes = new Set();
const pressedCodes = new Set();
const releasedCodes = new Set();
let mouse = { x: 0, y: 0, clicked: false };

function normalizeCode(e) {
  if (e.code) return e.code;
  if (!e.key) return '';
  const key = e.key.toLowerCase();
  if (key === ' ') return 'Space';
  if (key.length === 1 && key >= 'a' && key <= 'z') return `Key${key.toUpperCase()}`;
  if (key.startsWith('arrow')) return `Arrow${key.slice(5, 6).toUpperCase()}${key.slice(6)}`;
  return e.key;
}

function getBindings(actionOrCode) {
  return ACTION_BINDINGS[actionOrCode] || [actionOrCode];
}

export function setupInput(canvas) {
  const handleKeyDown = (e) => {
    const code = normalizeCode(e);
    if (!code) return;
    if (!downCodes.has(code)) pressedCodes.add(code);
    downCodes.add(code);
    if (BLOCK_BROWSER_SCROLL.has(code)) e.preventDefault();
  };

  const handleKeyUp = (e) => {
    const code = normalizeCode(e);
    if (!code) return;
    downCodes.delete(code);
    releasedCodes.add(code);
    if (BLOCK_BROWSER_SCROLL.has(code)) e.preventDefault();
  };

  window.addEventListener('keydown', handleKeyDown, { passive: false });
  window.addEventListener('keyup', handleKeyUp, { passive: false });
  window.addEventListener('blur', clearInputState);

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * canvas.width;
    mouse.y = ((e.clientY - r.top) / r.height) * canvas.height;
  });
  const registerPointerClick = () => {
    mouse.clicked = true;
  };

  // Support mouse, touch and pen interactions reliably across browsers/devices.
  canvas.addEventListener('pointerdown', registerPointerClick);
  canvas.addEventListener('click', registerPointerClick);
}

export function clearInputState() {
  downCodes.clear();
  pressedCodes.clear();
  releasedCodes.clear();
}

export function endInputFrame() {
  pressedCodes.clear();
  releasedCodes.clear();
}

export function consumeClick() {
  const c = mouse.clicked;
  mouse.clicked = false;
  return c;
}

export function getMouse() {
  return mouse;
}

export function isActionDown(actionOrCode) {
  return getBindings(actionOrCode).some((code) => downCodes.has(code));
}

export function wasActionPressed(actionOrCode) {
  return getBindings(actionOrCode).some((code) => pressedCodes.has(code));
}

export function wasActionReleased(actionOrCode) {
  return getBindings(actionOrCode).some((code) => releasedCodes.has(code));
}

// Backward compatibility for existing callers.
export function isDown(...actionOrCodes) {
  return actionOrCodes.some((actionOrCode) => isActionDown(actionOrCode));
}
