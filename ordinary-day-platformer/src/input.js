const keys = new Set();
let mouse = { x: 0, y: 0, clicked: false };

export function setupInput(canvas) {
  window.addEventListener('keydown', (e) => {
    keys.add(e.key.toLowerCase());
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * canvas.width;
    mouse.y = ((e.clientY - r.top) / r.height) * canvas.height;
  });
  canvas.addEventListener('click', () => { mouse.clicked = true; });
}

export function consumeClick() { const c = mouse.clicked; mouse.clicked = false; return c; }
export function getMouse() { return mouse; }
export function isDown(...k) { return k.some((i) => keys.has(i)); }
