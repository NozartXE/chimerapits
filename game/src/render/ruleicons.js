// ruleicons.js — the little pictograms for the title screen's rules digest: a pit, a
// graft needle, a prod, a chain link, a skull and a heart, drawn in one stroke weight
// so the digest reads as a single set.
(function () {
  if (globalThis.CP_RuleIcons) return;
  const P = globalThis.CP_Config.PALETTE;

  function draw(ctx, id, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 34, s / 34);
    ctx.strokeStyle = P.ink; ctx.fillStyle = P.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
    if (id === 'fight') { // crossed teeth
      ctx.beginPath(); ctx.moveTo(-11, -11); ctx.lineTo(11, 11); ctx.moveTo(11, -11); ctx.lineTo(-11, 11); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
    } else if (id === 'graft') { // needle and thread
      ctx.beginPath(); ctx.moveTo(-12, 12); ctx.quadraticCurveTo(2, -2, 12, -12); ctx.stroke();
      ctx.beginPath(); ctx.arc(13, -13, 3.4, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = P.coral; ctx.beginPath(); ctx.moveTo(-12, 12); ctx.quadraticCurveTo(-14, -6, -4, -10); ctx.stroke();
    } else if (id === 'prod') { // lightning prod
      ctx.fillStyle = P.violet;
      ctx.beginPath(); ctx.moveTo(2, -15); ctx.lineTo(-8, 2); ctx.lineTo(-1, 2); ctx.lineTo(-3, 15); ctx.lineTo(9, -3); ctx.lineTo(1, -3); ctx.closePath(); ctx.fill();
    } else if (id === 'chain') { // style chain links
      ctx.beginPath(); ctx.arc(-6, 0, 7.5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(7, 0, 7.5, 0, Math.PI * 2); ctx.stroke();
    } else if (id === 'apex') { // skull
      ctx.beginPath(); ctx.arc(0, -3, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.fillRect(-6, 6, 12, 6);
      ctx.fillStyle = P.paper; ctx.beginPath(); ctx.arc(-4.5, -4, 2.6, 0, Math.PI * 2); ctx.arc(4.5, -4, 2.6, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'heart') { // vigour heart
      ctx.fillStyle = P.danger;
      ctx.beginPath(); ctx.moveTo(0, 13); ctx.bezierCurveTo(-16, 2, -13, -11, -5, -11);
      ctx.bezierCurveTo(-1, -11, 0, -7, 0, -5); ctx.bezierCurveTo(0, -7, 1, -11, 5, -11);
      ctx.bezierCurveTo(13, -11, 16, 2, 0, 13); ctx.fill();
    } else if (id === 'reroll') { // two arrows circling
      ctx.beginPath(); ctx.arc(0, 0, 11, 0.6, 4.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(13, -1); ctx.lineTo(6, -2); ctx.closePath(); ctx.fill();
    } else { // star
      ctx.fillStyle = P.gold;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6.5 : 14; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  globalThis.CP_RuleIcons = { draw };
})();
