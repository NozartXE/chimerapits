// fx.js — the juice layer, with the legibility discipline the earlier entries learned
// the hard way: floaters are CAPPED (never more than five on screen), queued by
// priority (score and prods first, damage last), set in big type with short texts,
// and everything else — sparks, splats, rings, shake — is shapes, not words. Damage
// under 12 draws as impact stars, not numbers, so the pit never grows a text wall.
(function () {
  if (globalThis.CP_Fx) return;
  const P = globalThis.CP_Config.PALETTE;
  const Fit = globalThis.CP_Fit;

  function makeFx() {
    return { parts: [], floaters: [], queue: [], rings: [], tongues: [], shake: 0, flash: 0, t: 0 };
  }

  function spawnParts(fx, x, y, n, colors, speed, life, size) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (0.3 + Math.random() * 0.7) * speed;
      fx.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, t: 0, life: life * (0.6 + Math.random() * 0.7),
        size: size * (0.6 + Math.random() * 0.8), color: colors[i % colors.length], grav: 260 });
    }
  }

  function pushFloater(fx, x, y, text, color, prio, big) {
    fx.queue.push({ x, y, text, color, prio, big: !!big, t: 0 });
    fx.queue.sort((a, b) => b.prio - a.prio);
  }

  function consume(fx, events) {
    for (const e of events) {
      if (e.t === 'hit') {
        if (e.crit) pushFloater(fx, e.x, e.y - 66, 'CRIT ' + e.dmg, '#E4572E', 2, false);
        else if (e.dmg >= 12) pushFloater(fx, e.x, e.y - 60, '' + e.dmg, e.team === 'wild' ? '#177E6C' : '#C62F3B', 1, false);
        spawnParts(fx, e.x, e.y - 30, e.crit ? 9 : 5, e.crit ? ['#FFAE00', '#E4572E', '#FFF6E9'] : ['#FFF6E9', '#D9A75C'], 190, 0.45, 5);
        if (e.kind === 'aoe' || e.kind === 'charge') fx.shake = Math.min(9, fx.shake + 2.5);
      } else if (e.t === 'kill') {
        spawnParts(fx, e.x, e.y - 30, e.boss ? 42 : 20, ['#FFAE00', '#E4572E', '#3E9B4F', '#FFF6E9', '#2E9BC6'], 300, 0.9, 6);
        if (e.boss) { fx.shake = 11; fx.flash = 0.5; }
        else fx.shake = Math.min(8, fx.shake + 3);
      } else if (e.t === 'floater') {
        pushFloater(fx, e.x, e.y, e.text, e.color, e.big ? 5 : 3, e.big);
      } else if (e.t === 'prod') {
        pushFloater(fx, e.x, e.y - 84, e.text, '#7C4DBD', 4, true);
        spawnParts(fx, e.x, e.y - 40, 12, ['#7C4DBD', '#B79CED', '#FFF6E9'], 200, 0.6, 5);
      } else if (e.t === 'mark') {
        pushFloater(fx, e.x, e.y - 96, 'MARKED', '#E4572E', 4, true);
        fx.rings.push({ x: e.x, y: e.y - 6, r: 8, max: 54, t: 0 });
      } else if (e.t === 'slam') {
        fx.rings.push({ x: e.x, y: e.y - 6, r: 12, max: e.r + 16, t: 0 });
        fx.shake = Math.min(9, fx.shake + 3.5);
      } else if (e.t === 'tongue') {
        fx.tongues.push({ x: e.x, y: e.y - 60, x2: e.x2, y2: e.y2 - 30, t: 0 });
      } else if (e.t === 'splat') {
        spawnParts(fx, e.x, e.y, 7, e.kind === 'zap' ? ['#FFE95E', '#FFF6E9'] : ['#5FA84F', '#3E9B4F'], 150, 0.4, 5);
      } else if (e.t === 'summon') {
        spawnParts(fx, e.x, e.y - 20, 14, ['#D9C7A7', '#FFF6E9'], 170, 0.6, 6);
      } else if (e.t === 'roar') {
        fx.rings.push({ x: e.x, y: e.y - 50, r: 20, max: 190, t: 0 });
        fx.shake = 8;
        pushFloater(fx, e.x, e.y - 130, e.text, '#C62F3B', 5, true);
      } else if (e.t === 'charge') {
        spawnParts(fx, e.x, e.y - 4, 6, ['#D9A75C', '#B98246'], 120, 0.4, 5);
      }
    }
  }

  function update(fx, dt) {
    fx.t += dt;
    fx.shake = Math.max(0, fx.shake - dt * 26);
    fx.flash = Math.max(0, fx.flash - dt * 1.4);
    for (const p of fx.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.grav * dt; }
    fx.parts = fx.parts.filter((p) => p.t < p.life);
    for (const r of fx.rings) { r.t += dt; r.r += (r.max - r.r) * dt * 7; }
    fx.rings = fx.rings.filter((r) => r.t < 0.45);
    for (const t of fx.tongues) t.t += dt;
    fx.tongues = fx.tongues.filter((t) => t.t < 0.22);
    for (const f of fx.floaters) { f.t += dt; f.y -= dt * 34; }
    fx.floaters = fx.floaters.filter((f) => f.t < 1.15);
    while (fx.floaters.length < 5 && fx.queue.length) fx.floaters.push(fx.queue.shift());
  }

  function drawWorld(ctx, fx, fight) {
    // projectiles (live from the sim)
    for (const p of fight.projectiles) {
      if (p.kind === 'zap') {
        ctx.strokeStyle = '#FFE95E'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
        ctx.lineTo(p.x - p.vx * 0.015, p.y - p.vy * 0.015 + 5); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.fillStyle = '#FFF6E9'; ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = '#5FA84F'; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3E9B4F'; ctx.beginPath(); ctx.arc(p.x - p.vx * 0.02, p.y - p.vy * 0.02, 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (const t of fx.tongues) {
      ctx.strokeStyle = '#FF7FA5'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.quadraticCurveTo((t.x + t.x2) / 2, Math.min(t.y, t.y2) - 22, t.x2, t.y2); ctx.stroke();
    }
    for (const r of fx.rings) {
      ctx.strokeStyle = 'rgba(228,87,46,' + (0.65 * (1 - r.t / 0.45)) + ')'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
    }
    for (const p of fx.parts) {
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawFloaters(ctx, fx) {
    for (const f of fx.floaters) {
      const a = f.t < 0.12 ? f.t / 0.12 : f.t > 0.9 ? Math.max(0, (1.15 - f.t) / 0.25) : 1;
      ctx.globalAlpha = a;
      const size = f.big ? 31 : 19;
      Fit.setFont(ctx, size, true, true);
      const w = ctx.measureText(f.text).width + 22;
      ctx.fillStyle = 'rgba(255,246,233,0.94)';
      globalThis.CP_Layout.rr(ctx, f.x - w / 2, f.y - size * 0.78, w, size * 1.5, 9); ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = '#1E2A24'; ctx.stroke();
      Fit.draw(ctx, f.text, f.x, f.y + 1, size, f.color, 'center', true, 0, true);
    }
    ctx.globalAlpha = 1;
  }

  globalThis.CP_Fx = { makeFx, consume, update, drawWorld, drawFloaters };
})();
