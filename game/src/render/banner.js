// banner.js — the yard announcer: a centre banner for bout names, new-beast warnings
// and boss phases that arrives, holds, and leaves on a fixed beat, plus a two-line
// event log under the card. One message at a time — announcements queue, never stack.
(function () {
  if (globalThis.CP_Banner) return;
  const P = globalThis.CP_Config.PALETTE;
  const Fit = globalThis.CP_Fit;
  const L = globalThis.CP_Layout;

  function makeBanner() { return { current: null, queue: [], log: [] }; }

  function say(b, text, sub, color) {
    b.queue.push({ text, sub: sub || '', color: color || P.ink, t: 0 });
  }
  function log(b, text) { b.log.unshift(text); b.log = b.log.slice(0, 2); }

  function consume(b, events, fight) {
    for (const e of events) {
      if (e.t === 'bout') say(b, 'BOUT ' + e.name, e.mood ? e.intro + '  ·  ' + e.mood : e.intro, P.tealDeep);
      else if (e.t === 'roar') say(b, e.text, e.phase === 2 ? 'APEX calls the wild to its side' : 'It stops holding back', P.danger);
      else if (e.t === 'kill' && e.team === 'wild') log(b, e.name + ' is down');
      else if (e.t === 'kill' && e.team === 'you') log(b, 'Your beast is down!');
    }
  }

  function update(b, dt) {
    if (!b.current && b.queue.length) b.current = b.queue.shift();
    if (b.current) { b.current.t += dt; if (b.current.t > 2.3) b.current = null; }
  }

  function draw(ctx, b) {
    if (!b.current) return;
    const c = b.current;
    const a = c.t < 0.25 ? c.t / 0.25 : c.t > 1.95 ? Math.max(0, (2.3 - c.t) / 0.35) : 1;
    ctx.globalAlpha = a;
    const w = 640;
    L.panel(ctx, 640 - w / 2, 196, w, c.sub ? 84 : 62, '#FFFDF6');
    Fit.draw(ctx, c.text, 640, c.sub ? 226 : 228, 30, c.color, 'center', true, w - 40, true);
    if (c.sub) Fit.draw(ctx, c.sub, 640, 258, 16.5, P.inkSoft, 'center', false, w - 48);
    ctx.globalAlpha = 1;
  }

  globalThis.CP_Banner = { makeBanner, say, log, consume, update, draw };
})();
