// beastsview.js — draws YOUR beast from its body plan, part by part: the tail it was
// grafted, the hind it runs on, the torso that carries it, the forearms it fights with,
// the head it bites with, and the organ glowing through. Swap one part in the plan and
// the animal on screen is a different animal — that is the whole game, drawn honestly.
// Also draws the single-part glyphs the graft cards and the almanac use.
(function () {
  if (globalThis.CP_BeastView) return;
  const P = globalThis.CP_Config.PALETTE;

  function ell(ctx, x, y, rx, ry, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
  function limb(ctx, x, y, len, ang, w, fill) {
    ctx.strokeStyle = fill; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); ctx.stroke();
  }
  function eye(ctx, x, y, r, angry) {
    ell(ctx, x, y, r, r, '#FFF6E9');
    ell(ctx, x + (angry ? 1 : 0), y, r * 0.55, r * 0.55, '#1E2A24');
  }

  // ---- tail (drawn first, behind the body) -----------------------------------
  function tail(ctx, id, c, ph) {
    const wag = Math.sin(ph * 2) * 4;
    if (id === 'stub') { ell(ctx, -58, -58 + wag * 0.3, 10, 7, c.main); }
    else if (id === 'scorpion') {
      ctx.strokeStyle = c.main; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-56, -52); ctx.quadraticCurveTo(-84, -66, -78, -96 + wag * 0.4); ctx.stroke();
      ell(ctx, -78, -100 + wag * 0.4, 8, 11, c.accent);
    } else if (id === 'club') {
      limb(ctx, -56, -50, 30, 2.6, 10, c.main);
      ell(ctx, -82, -38, 11.5, 10, c.main);
      ctx.strokeStyle = c.dark; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(-82, -38, 11.5, 10, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (id === 'peacock') {
      for (let i = -2; i <= 2; i++) {
        const a = 2.6 + i * 0.32;
        limb(ctx, -54, -56, 44, a, 5, c.main);
        ell(ctx, -54 + Math.cos(a) * 46, -56 + Math.sin(a) * 46, 6, 8, i === 0 ? c.accent : c.dark);
      }
    } else if (id === 'fox') {
      ctx.strokeStyle = c.main; ctx.lineWidth = 13;
      ctx.beginPath(); ctx.moveTo(-56, -52); ctx.quadraticCurveTo(-84, -58 + wag, -92, -40 + wag); ctx.stroke();
      ell(ctx, -92, -40 + wag, 7, 6, c.accent);
    } else if (id === 'eel') {
      ctx.strokeStyle = c.main; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(-56, -50);
      ctx.quadraticCurveTo(-80, -44 + wag, -88, -62 + wag); ctx.quadraticCurveTo(-94, -76, -84, -84); ctx.stroke();
      ell(ctx, -84, -85, 5, 5, c.accent);
    }
  }

  // ---- hind (legs / wings / coils under and behind the torso) -----------------
  function hind(ctx, id, c, ph, moving) {
    const sw = moving ? Math.sin(ph) * 9 : 0;
    if (id === 'wings') {
      const flap = Math.sin(ph * 1.6) * 10;
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.moveTo(-6, -84); ctx.quadraticCurveTo(-34, -128 - flap, -66, -118 - flap);
      ctx.quadraticCurveTo(-40, -96, -30, -78); ctx.quadraticCurveTo(-14, -92, -6, -84); ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = c.dark; ctx.stroke();
      limb(ctx, 22, -26, 24, 1.5 + sw * 0.02, 7, c.dark); limb(ctx, -30, -26, 24, 1.5 - sw * 0.02, 7, c.dark);
    } else if (id === 'springs') {
      for (const bx of [22, -30]) {
        ctx.strokeStyle = c.main; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(bx, -30);
        for (let i = 1; i <= 4; i++) ctx.lineTo(bx + (i % 2 ? 6 : -6), -30 + i * 6);
        ctx.stroke();
        ell(ctx, bx, -2, 9, 4, c.accent);
      }
    } else if (id === 'fins') {
      ctx.fillStyle = c.main;
      ctx.beginPath(); ctx.moveTo(-38, -34); ctx.quadraticCurveTo(-58, -12, -34, -4); ctx.quadraticCurveTo(-24, -20, -38, -34); ctx.fill();
      limb(ctx, 22, -26, 22, 1.6, 7, c.dark);
    } else if (id === 'spiderhind') {
      for (let i = 0; i < 3; i++) {
        const bx = -36 + i * 16, s = moving ? Math.sin(ph + i * 1.1) * 6 : 0;
        limb(ctx, bx, -30, 20, 2.2, 4.5, c.main); limb(ctx, bx - 12, -12 + s * 0.3, 14, 1.4, 4, c.dark);
      }
      limb(ctx, 24, -26, 24, 1.5, 6, c.dark);
    } else if (id === 'roolegs') {
      limb(ctx, -28, -28, 17, 1.9, 11, c.main); limb(ctx, -38, -12, 20, 0.5, 8, c.main);
      ell(ctx, -16, -4, 10, 5, c.dark);
      limb(ctx, 24, -26, 24, 1.5, 7, c.dark);
    } else { // hooves and friends
      limb(ctx, 24, -26, 25, 1.5 + sw * 0.02, 7.5, c.main); ell(ctx, 26 + sw * 0.4, -2, 6, 4, c.dark);
      limb(ctx, -30, -26, 25, 1.5 - sw * 0.02, 7.5, c.main); ell(ctx, -28 - sw * 0.4, -2, 6, 4, c.dark);
    }
  }

  // ---- torso ------------------------------------------------------------------
  function torso(ctx, id, c, organ) {
    if (id === 'shell') {
      ctx.fillStyle = c.main; ctx.beginPath(); ctx.ellipse(-4, -56, 62, 40, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = c.main; ctx.fillRect(-66, -56, 124, 22);
      ctx.strokeStyle = c.dark; ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(-4 + i * 34, -58, 17, 34, 0, Math.PI, 0); ctx.stroke(); }
    } else if (id === 'quill') {
      ell(ctx, -4, -52, 60, 36, c.main);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) { const x = -52 + i * 16; limb(ctx, x, -78, 15, -1.35 + (i % 3) * 0.2, 3.5, c.accent); }
    } else {
      ell(ctx, -4, -52, id === 'bear' || id === 'rhino' ? 62 : 56, id === 'bear' ? 40 : 34, c.main);
      if (id === 'tiger') {
        ctx.strokeStyle = c.accent; ctx.lineWidth = 5; ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) { const x = -40 + i * 22; ctx.beginPath(); ctx.moveTo(x, -80); ctx.quadraticCurveTo(x + 5, -58, x, -38); ctx.stroke(); }
      }
      if (id === 'rhino') { ell(ctx, 30, -74, 22, 16, c.dark); }
      if (id === 'goat') {
        ctx.strokeStyle = c.dark; ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-48 + i * 22, -34); ctx.lineTo(-44 + i * 22, -24); ctx.stroke(); }
      }
      if (id === 'bear') { ell(ctx, -4, -40, 50, 24, c.dark); ell(ctx, -4, -44, 46, 20, c.main); }
    }
    // the organ, glowing through the ribs
    if (organ) {
      const oc = organ.colors;
      const pulse = 5 + Math.sin(performance.now() / 300) * 1.2;
      ell(ctx, -2, -52, 11 + pulse * 0.4, 10 + pulse * 0.4, oc.main);
      ell(ctx, -2, -52, 5.5, 5, oc.accent);
    }
  }

  // ---- forearms -----------------------------------------------------------------
  function front(ctx, id, c, ph, moving) {
    const sw = moving ? Math.sin(ph + 2) * 8 : 0;
    if (id === 'pincers') {
      limb(ctx, 34, -46, 22, 0.5, 9, c.main);
      ell(ctx, 56, -34, 13, 10, c.main); ell(ctx, 60, -44, 8, 6, c.dark);
      limb(ctx, 8, -30, 22, 1.4, 7, c.dark);
    } else if (id === 'mantis') {
      limb(ctx, 36, -52, 20, -0.4, 6, c.main); limb(ctx, 52, -62, 24, 0.9, 5, c.accent);
      limb(ctx, 10, -28, 22, 1.5, 6, c.dark);
    } else if (id === 'mole') {
      limb(ctx, 34, -34, 20, 1.1, 10, c.main);
      for (let i = -1; i <= 1; i++) limb(ctx, 50, -18, 13, 1.2 + i * 0.35, 3.5, c.accent);
      limb(ctx, 4, -28, 22, 1.5, 7, c.dark);
    } else if (id === 'spiderarms') {
      for (let i = 0; i < 3; i++) limb(ctx, 30 - i * 8, -44 + i * 6, 20, 0.4 + i * 0.3, 4, c.main);
      limb(ctx, 4, -28, 22, 1.5, 6, c.dark);
    } else if (id === 'stomper') {
      limb(ctx, 30, -40, 34, 1.55, 15, c.main); ell(ctx, 32, -3, 13, 6, c.dark);
      limb(ctx, -6, -28, 22, 1.5, 7, c.dark);
    } else { // paws
      limb(ctx, 30, -28, 25, 1.5 + sw * 0.02, 7.5, c.main); ell(ctx, 32 + sw * 0.4, -2, 7, 4.5, c.accent);
      limb(ctx, 2, -28, 24, 1.5 - sw * 0.02, 7, c.dark);
    }
  }

  // ---- head ----------------------------------------------------------------------
  function head(ctx, id, c, ph) {
    const bob = Math.sin(ph * 0.7) * 1.6;
    ctx.save(); ctx.translate(52, -76 + bob);
    if (id === 'serpent') {
      ctx.strokeStyle = c.main; ctx.lineWidth = 13; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-24, 16); ctx.quadraticCurveTo(2, 4, 10, -14); ctx.stroke();
      ell(ctx, 14, -18, 15, 11, c.main);
      ell(ctx, 20, -22, 4.5, 4.5, c.accent);
      eye(ctx, 16, -20, 4, true);
      ctx.strokeStyle = '#FF7FA5'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(28, -16); ctx.lineTo(37, -19); ctx.moveTo(28, -14); ctx.lineTo(36, -11); ctx.stroke();
    } else if (id === 'ramhorn') {
      ell(ctx, 4, 0, 19, 15, c.main);
      ctx.strokeStyle = c.dark; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(-6, -8, 13, 2.4, 5.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(-6, -8, 8, 2.4, 5.2); ctx.stroke();
      ell(ctx, 16, 6, 9, 7, c.dark); eye(ctx, 8, -4, 4.5, true);
    } else if (id === 'hawk') {
      ell(ctx, 2, -2, 16, 13, c.main);
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.moveTo(14, -4); ctx.lineTo(30, 1); ctx.lineTo(13, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.moveTo(-8, -12); ctx.lineTo(2, -22); ctx.lineTo(6, -11); ctx.closePath(); ctx.fill();
      eye(ctx, 6, -4, 5, true);
    } else if (id === 'boartusk') {
      ell(ctx, 4, 1, 20, 15, c.main);
      ell(ctx, 18, 5, 9, 7, c.dark);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(16, 12, 8, -2.4, -0.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(6, 13, 7, -2.4, -0.8); ctx.stroke();
      eye(ctx, 4, -4, 4.5, true);
      limb(ctx, -8, -12, 10, -1.9, 5, c.dark);
    } else if (id === 'frog') {
      ell(ctx, 4, 0, 21, 14, c.main);
      ell(ctx, -4, -13, 7, 7, c.main); ell(ctx, 12, -13, 7, 7, c.main);
      eye(ctx, -4, -14, 4.5, false); eye(ctx, 12, -14, 4.5, false);
      ctx.strokeStyle = c.dark; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(6, 3, 12, 0.3, 2.6); ctx.stroke();
    } else { // hound
      ell(ctx, 2, 0, 18, 14, c.main);
      ell(ctx, 17, 5, 11, 7.5, c.main); ell(ctx, 26, 3, 4.5, 4, c.dark);
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.ellipse(-8, -8, 6, 12, 0.5, 0, Math.PI * 2); ctx.fill();
      eye(ctx, 6, -4, 4.5, true);
      ctx.fillStyle = '#FFF6E9'; ctx.fillRect(16, 9, 5, 5); ctx.fillRect(23, 9, 4, 4);
    }
    ctx.restore();
  }

  // Draw a whole beast. f: fighter-like {x, y, facing, walkPhase, hitFlash, statuses, stun}
  // plan: body plan; scale: overall size; opts {ghost} for draft previews.
  function drawBeast(ctx, plan, f, scale, opts) {
    opts = opts || {};
    const B = globalThis.CP_Beasts.build(plan);
    const moving = Math.abs(f.vx || 0) + Math.abs(f.vy || 0) > 14;
    const ph = f.walkPhase || 0;
    ctx.save();
    ctx.translate(f.x, f.y);
    // ground shadow
    ctx.fillStyle = 'rgba(90,60,20,0.25)';
    ctx.beginPath(); ctx.ellipse(0, 4, 62 * scale, 11 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.scale((f.facing || 1) * scale, scale);
    if (f.chargeT > 0) ctx.rotate(-0.06);
    const bobY = moving ? Math.abs(Math.sin(ph)) * -3 : Math.sin((f.animT || 0) * 2.2) * 1.4;
    ctx.translate(0, bobY);
    if (opts.ghost) ctx.globalAlpha = 0.55;
    tail(ctx, plan.tail, B.parts.tail.colors, ph);
    hind(ctx, plan.rear, B.parts.rear.colors, ph, moving);
    torso(ctx, plan.torso, B.parts.torso.colors, B.parts.organ);
    front(ctx, plan.front, B.parts.front.colors, ph, moving);
    head(ctx, plan.head, B.parts.head.colors, ph);
    // status dressing: poison bubbles, stun stars
    const sts = f.statuses || [];
    if (sts.some((s) => s.kind === 'poison')) {
      ell(ctx, 6, -96, 5, 5, 'rgba(95,168,79,0.85)'); ell(ctx, 20, -88, 3.6, 3.6, 'rgba(95,168,79,0.85)');
    }
    if (sts.some((s) => s.kind === 'bleed')) {
      ctx.fillStyle = '#C62F3B'; ctx.fillRect(-16, -38, 4, 9); ctx.fillRect(12, -30, 4, 7);
    }
    if (f.stun > 0) {
      const Fit = globalThis.CP_Fit;
      for (let i = 0; i < 3; i++) {
        const a = (f.animT || 0) * 2.4 + i * 2.1;
        Fit.draw(ctx, '✦', Math.cos(a) * 20, -108 + Math.sin(a) * 5, 15, '#FFAE00', 'center', true);
      }
    }
    if (f.hitFlash > 0) {
      ctx.globalAlpha = Math.min(0.55, f.hitFlash * 4);
      ell(ctx, -2, -54, 62, 40, '#FFFFFF');
      ctx.globalAlpha = opts.ghost ? 0.55 : 1;
    }
    ctx.restore();
  }

  // A single part, drawn big on a graft card / almanac cell.
  function drawPartGlyph(ctx, part, x, y, s) {
    const c = part.colors;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (part.slot === 'head') { ctx.translate(-52, 76); head(ctx, part.id, c, 0.6); }
    else if (part.slot === 'torso') { ctx.translate(2, 52); torso(ctx, part.id, c, null); }
    else if (part.slot === 'front') { ctx.translate(-24, 30); front(ctx, part.id, c, 0.6, false); }
    else if (part.slot === 'rear') { ctx.translate(4, 30); hind(ctx, part.id, c, 0.6, false); }
    else if (part.slot === 'tail') { ctx.translate(52, 52); tail(ctx, part.id, c, 0.6); }
    else { // organ: a glowing core in a rib ring
      ctx.strokeStyle = c.dark; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke();
      ell(ctx, 0, 0, 19, 17, c.main); ell(ctx, 0, 0, 9, 8, c.accent);
    }
    ctx.restore();
  }

  globalThis.CP_BeastView = { drawBeast, drawPartGlyph };
})();
