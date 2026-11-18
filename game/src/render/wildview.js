// wildview.js — draws the wild roster: the beasts that were never grafted, each with a
// silhouette a player can read across the pit — dome for the tank, wings for the diver,
// a neck like a crane for the spitter, and for APEX a bulk that fills its side of the
// frame, with a mane and ember eyes that redden as the Frenzy takes it.
(function () {
  if (globalThis.CP_WildView) return;

  function ell(ctx, x, y, rx, ry, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
  function limb(ctx, x, y, len, ang, w, fill) {
    ctx.strokeStyle = fill; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); ctx.stroke();
  }
  function eye(ctx, x, y, r, color) { ell(ctx, x, y, r, r, color || '#FFD23E'); ell(ctx, x, y, r * 0.5, r * 0.5, '#1E2A24'); }
  function legs(ctx, c, ph, moving, n) {
    const sw = moving ? Math.sin(ph) * 8 : 0;
    for (let i = 0; i < (n || 2); i++) {
      const bx = 18 - i * 34;
      limb(ctx, bx, -24, 23, 1.5 + (i ? -sw : sw) * 0.02, 7, c.dark);
    }
  }

  function drawWild(ctx, kind, f, scale) {
    const c = kind.colors;
    const moving = Math.abs(f.vx || 0) + Math.abs(f.vy || 0) > 14;
    const ph = f.walkPhase || 0;
    ctx.save(); ctx.translate(f.x, f.y);
    ctx.fillStyle = 'rgba(90,60,20,0.25)';
    ctx.beginPath(); ctx.ellipse(0, 4, 56 * scale, 10 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.scale((f.facing || 1) * scale, scale);
    const id = kind.id;
    if (id === 'gullbat') ctx.translate(0, -64 - Math.sin((f.animT || 0) * 5) * 7);
    if (id === 'mirepup') {
      legs(ctx, c, ph, moving);
      ell(ctx, -2, -46, 42, 26, c.main);
      ell(ctx, 34, -56, 16, 12, c.main); ell(ctx, 47, -50, 6, 5, c.dark);
      ell(ctx, 24, -68, 6, 9, c.dark); eye(ctx, 36, -58, 4);
      limb(ctx, -42, -52, 16, 2.8, 6, c.dark);
    } else if (id === 'thornboar') {
      legs(ctx, c, ph, moving);
      ell(ctx, -2, -48, 48, 29, c.main);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) limb(ctx, -34 + i * 15, -72, 14, -1.4, 4, c.accent);
      ell(ctx, 40, -52, 17, 13, c.main); ell(ctx, 54, -46, 6, 5.5, '#FF9DB0');
      ctx.strokeStyle = '#F3E9D2'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.arc(48, -38, 7, -2.2, -0.5); ctx.stroke();
      eye(ctx, 36, -56, 4.5);
    } else if (id === 'gullbat') {
      const flap = Math.sin((f.animT || 0) * 9) * 14;
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.moveTo(-4, -10); ctx.quadraticCurveTo(-34, -34 - flap, -58, -26 - flap);
      ctx.quadraticCurveTo(-36, -12, -28, 0); ctx.quadraticCurveTo(-12, -8, -4, -10); ctx.fill();
      ctx.beginPath(); ctx.moveTo(6, -10); ctx.quadraticCurveTo(30, -36 - flap, 52, -28 - flap);
      ctx.quadraticCurveTo(32, -12, 24, 0); ctx.quadraticCurveTo(12, -8, 6, -10); ctx.fill();
      ell(ctx, 0, -6, 17, 13, c.main);
      ell(ctx, 14, -10, 9, 7, c.main);
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.moveTo(21, -11); ctx.lineTo(30, -8); ctx.lineTo(21, -5); ctx.closePath(); ctx.fill();
      eye(ctx, 13, -12, 3.6);
    } else if (id === 'cragback') {
      legs(ctx, c, ph, moving);
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(-2, -48, 56, 36, 0, Math.PI, 0); ctx.fill();
      ctx.fillRect(-58, -48, 112, 18);
      ctx.strokeStyle = c.dark; ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(-2 + i * 30, -50, 15, 30, 0, Math.PI, 0); ctx.stroke(); }
      ell(ctx, 46, -38, 13, 10, c.main); eye(ctx, 48, -41, 4);
    } else if (id === 'spithare') {
      legs(ctx, c, ph, moving);
      ell(ctx, -2, -42, 34, 23, c.main);
      ell(ctx, 26, -54, 13, 11, c.main);
      limb(ctx, 20, -62, 24, -1.2, 6, c.main); limb(ctx, 30, -62, 24, -1.7, 6, c.main);
      ell(ctx, 22, -40, 8, 6, c.accent); eye(ctx, 29, -56, 4);
    } else if (id === 'stag') {
      legs(ctx, c, ph, moving);
      ell(ctx, -2, -50, 44, 26, c.main);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
      for (const bx of [30, 40]) {
        ctx.beginPath(); ctx.moveTo(bx, -78); ctx.lineTo(bx + 4, -98); ctx.moveTo(bx + 2, -88); ctx.lineTo(bx + 12, -92); ctx.moveTo(bx + 3, -90); ctx.lineTo(bx - 4, -96); ctx.stroke();
      }
      ell(ctx, 36, -64, 15, 11, c.main); ell(ctx, 49, -58, 6, 5, c.dark); eye(ctx, 38, -66, 4.5);
    } else if (id === 'mauler') {
      legs(ctx, c, ph, moving);
      ell(ctx, -2, -50, 50, 32, c.main);
      ell(ctx, -2, -34, 40, 20, c.dark); ell(ctx, -2, -38, 36, 17, c.main);
      ell(ctx, 40, -60, 17, 14, c.main);
      ell(ctx, 30, -74, 6.5, 6.5, c.main); ell(ctx, 48, -74, 6.5, 6.5, c.main);
      ell(ctx, 52, -52, 6, 5, c.dark); eye(ctx, 40, -62, 4.5, c.accent);
      ctx.fillStyle = '#FFF6E9'; ctx.fillRect(44, -46, 4, 5); ctx.fillRect(51, -46, 4, 5);
    } else if (id === 'longneck') {
      legs(ctx, c, ph, moving);
      ell(ctx, -8, -42, 38, 23, c.main);
      ctx.strokeStyle = c.main; ctx.lineWidth = 13; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(18, -52); ctx.quadraticCurveTo(34, -84, 30, -108); ctx.stroke();
      ell(ctx, 32, -112, 12, 9, c.main); eye(ctx, 35, -114, 3.8, c.accent);
      ell(ctx, 42, -106, 5, 4, c.dark);
    } else if (id === 'apex') {
      const frenzy = f.phase === 3;
      legs(ctx, c, ph, moving, 2);
      // mane of spikes
      ctx.fillStyle = c.dark;
      for (let i = 0; i < 6; i++) {
        const x = -52 + i * 17;
        ctx.beginPath(); ctx.moveTo(x, -86); ctx.lineTo(x + 8, -112 - (i % 2) * 8); ctx.lineTo(x + 16, -84); ctx.closePath(); ctx.fill();
      }
      ell(ctx, -2, -56, 64, 42, c.main);
      ell(ctx, -2, -38, 52, 24, c.dark); ell(ctx, -2, -42, 46, 20, c.main);
      // head: darker than the body so it reads across the pit, ember eye, jaw of teeth
      ell(ctx, 54, -68, 30, 22, c.dark);
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(50, -82, 26, 10, -0.25, 0, Math.PI * 2); ctx.fill();
      ell(ctx, 76, -58, 11, 9, c.dark);
      eye(ctx, 58, -72, 7, frenzy ? '#FF5E3A' : '#FFAE00');
      ctx.fillStyle = '#FFF6E9';
      for (let i = 0; i < 4; i++) ctx.fillRect(60 + i * 8, -48, 6, 10);
      for (let i = 0; i < 3; i++) ctx.fillRect(63 + i * 8, -88, 5, 7);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(44, -84, 12, 2.6, 5.4); ctx.stroke();
      limb(ctx, -64, -58, 22, 2.7, 9, c.dark);
    }
    if ((f.statuses || []).some((s) => s.kind === 'poison')) { ell(ctx, 4, -92, 4.5, 4.5, 'rgba(95,168,79,0.85)'); }
    if (f.stun > 0) globalThis.CP_Fit.draw(ctx, '✦ ✦', 0, -104, 14, '#FFAE00', 'center', true);
    if (f.hitFlash > 0) { ctx.globalAlpha = Math.min(0.5, f.hitFlash * 3.6); ell(ctx, 0, -50, 58, 38, '#FFFFFF'); ctx.globalAlpha = 1; }
    ctx.restore();
  }

  globalThis.CP_WildView = { drawWild };
})();
