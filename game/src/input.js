// input.js — one input path for mouse and keys. Renderers register clickable rects on
// view.buttons every frame (and the draft screen registers its offer cards); input
// hit-tests against the last frame's registry, tracks the hover for both buttons and
// graft offers, and forwards everything to main.js as named actions.
(function () {
  if (globalThis.CP_Input) return;

  function attach(canvas, view, handlers) {
    function pos(ev) {
      const r = canvas.getBoundingClientRect();
      return { x: (ev.clientX - r.left) * (canvas.width / r.width), y: (ev.clientY - r.top) * (canvas.height / r.height) };
    }
    canvas.addEventListener('mousemove', (ev) => {
      const p = pos(ev);
      view.mouse = p;
      view.hover = null; view.hoverOffer = null;
      for (const id of Object.keys(view.buttons || {})) {
        const b = view.buttons[id];
        if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
          view.hover = id;
          if (id.startsWith('offer')) view.hoverOffer = parseInt(id.slice(5), 10);
        }
      }
      canvas.style.cursor = view.hover ? 'pointer' : 'default';
    });
    canvas.addEventListener('mousedown', (ev) => {
      const p = pos(ev);
      for (const id of Object.keys(view.buttons || {})) {
        const b = view.buttons[id];
        if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) { handlers.onButton(id); return; }
      }
      handlers.onClick && handlers.onClick(p);
    });
    window.addEventListener('keydown', (ev) => {
      if (ev.repeat) return;
      handlers.onKey(ev.key.length === 1 ? ev.key.toLowerCase() : ev.key);
    });
  }

  globalThis.CP_Input = { attach };
})();
