// layout.js — the yard's carpentry: paper panels, ink chips, buttons and keycaps drawn
// the same way on every screen, on the fixed spacing scale from the design tokens.
// Every button registers its rect on view.buttons so input.js can hit-test one way.
(function () {
  if (globalThis.CP_Layout) return;
  const P = globalThis.CP_Config.PALETTE;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function panel(ctx, x, y, w, h, fill) {
    ctx.fillStyle = 'rgba(30,42,36,0.18)';
    rr(ctx, x + 4, y + 6, w, h, 14); ctx.fill();
    ctx.fillStyle = fill || P.panel;
    rr(ctx, x, y, w, h, 14); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
  }
  function chip(ctx, x, y, w, h, fill) {
    ctx.fillStyle = fill; rr(ctx, x, y, w, h, 10); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = P.ink; ctx.stroke();
  }
  function button(ctx, view, id, x, y, w, h, label, opts) {
    opts = opts || {};
    const hover = view.hover === id;
    ctx.fillStyle = 'rgba(30,42,36,0.25)';
    rr(ctx, x + 3, y + (hover ? 2 : 5), w, h, 12); ctx.fill();
    ctx.fillStyle = opts.fill || (hover ? P.gold : P.paper);
    rr(ctx, x, y, w, h, 12); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
    const Fit = globalThis.CP_Fit;
    Fit.draw(ctx, label, x + w / 2, y + h / 2 + 1, opts.size || 22, opts.color || P.ink, 'center', true, w - 16);
    view.buttons[id] = { x, y, w, h };
    return view.buttons[id];
  }
  function keycap(ctx, x, y, label) {
    ctx.fillStyle = P.ink; rr(ctx, x, y, 26, 26, 6); ctx.fill();
    globalThis.CP_Fit.draw(ctx, label, x + 13, y + 14, 15, '#FFFFFF', 'center', true);
  }
  function bar(ctx, x, y, w, h, frac, fill, back) {
    ctx.fillStyle = back || '#E4D6B8'; rr(ctx, x, y, w, h, h / 2); ctx.fill();
    if (frac > 0) { ctx.fillStyle = fill; rr(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2); ctx.fill(); }
    ctx.lineWidth = 2; ctx.strokeStyle = P.ink; rr(ctx, x, y, w, h, h / 2); ctx.stroke();
  }

  globalThis.CP_Layout = { rr, panel, chip, button, keycap, bar };
})();
