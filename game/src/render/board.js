// board.js — the pit itself: raked sand with grafting-yard banners, a fence the crowd
// leans on, and two rows of spectators whose heads and flags are placed by a fixed
// visual seed (never the run's streams — the backdrop must not eat gameplay luck).
// Bright, warm and busy at the edges so the fight in the middle reads at a glance.
(function () {
  if (globalThis.CP_Board) return;
  const C = globalThis.CP_Config;
  const P = C.PALETTE;

  // A tiny private visual random, fixed seed: crowd placement is scenery, not simulation.
  const vis = globalThis.CP_Rng.stream(20261118);
  const crowd = [];
  for (let row = 0; row < 2; row++) {
    for (let x = 26; x < C.W; x += 34) {
      crowd.push({ x: x + vis.range(-6, 6), y: 196 + row * 30 + vis.range(-3, 3), r: vis.range(8, 11),
        skin: vis.pick(['#E8B98A', '#C98A5A', '#8A5A3A', '#F0D0A8', '#6E4526']),
        shirt: vis.pick(['#E4572E', '#2E9BC6', '#3E9B4F', '#FFAE00', '#7C4DBD', '#FFF6E9']) });
    }
  }
  const flags = [];
  for (let x = 70; x < C.W; x += 172) flags.push({ x, c: vis.pick(['#E4572E', '#FFAE00', '#2E9BC6', '#3E9B4F']) });
  // Sand texture, also fixed at load: pebbles, straw tufts and old bones inside the pit.
  const pitRect = C.PIT;
  const pebbles = [], straws = [], bones = [];
  for (let i = 0; i < 130; i++) {
    const px = pitRect.x + vis.range(6, pitRect.w - 6), py = pitRect.y + vis.range(8, pitRect.h - 8);
    const dx = (px - (pitRect.x + pitRect.w / 2)) / (pitRect.w / 2 + 26), dy = (py - (pitRect.y + pitRect.h / 2)) / (pitRect.h / 2 + 20);
    if (dx * dx + dy * dy > 0.96) continue;
    pebbles.push({ x: px, y: py, rx: vis.range(2, 5.5), ry: vis.range(1.4, 3.4), rot: vis.range(0, 3),
      c: vis.pick(['rgba(160,116,52,0.5)', 'rgba(120,84,36,0.45)', 'rgba(255,240,200,0.5)', 'rgba(146,104,48,0.4)']) });
  }
  for (let i = 0; i < 16; i++) {
    const px = pitRect.x + vis.range(30, pitRect.w - 30), py = pitRect.y + vis.range(26, pitRect.h - 26);
    const lines = [];
    for (let j = 0; j < 3; j++) lines.push([vis.range(-13, 13), vis.range(-9, 4)]);
    straws.push({ x: px, y: py, lines });
  }
  for (let i = 0; i < 5; i++) {
    bones.push({ x: pitRect.x + vis.range(50, pitRect.w - 50), y: pitRect.y + vis.range(40, pitRect.h - 40), rot: vis.range(0, 3) });
  }
  // Weather dressing, also fixed at load: rain streaks and swarm flies.
  const streaks = [], flies = [];
  for (let i = 0; i < 44; i++) streaks.push({ x: pitRect.x + vis.range(10, pitRect.w - 10), y: pitRect.y + vis.range(6, pitRect.h - 22) });
  for (let i = 0; i < 26; i++) flies.push({ x: pitRect.x + vis.range(16, pitRect.w - 16), y: pitRect.y + vis.range(14, pitRect.h - 14) });

  function draw(ctx, t, moodId) {
    // sky band and yard wall
    const sky = ctx.createLinearGradient(0, 0, 0, 250);
    sky.addColorStop(0, '#BFE6F2'); sky.addColorStop(1, '#F7ECD4');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, C.W, 252);
    // crowd stands
    ctx.fillStyle = '#D9A75C'; ctx.fillRect(0, 168, C.W, 84);
    ctx.fillStyle = 'rgba(142,90,40,0.35)'; ctx.fillRect(0, 222, C.W, 4);
    for (const m of crowd) {
      const bounce = Math.sin(t * 2.4 + m.x * 0.35) > 0.86 ? -3 : 0;
      ctx.fillStyle = m.shirt; ctx.beginPath(); ctx.ellipse(m.x, m.y + 13 + bounce, m.r + 3, 8, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = m.skin; ctx.beginPath(); ctx.arc(m.x, m.y + bounce, m.r, 0, Math.PI * 2); ctx.fill();
    }
    // banner string with pennant flags
    ctx.strokeStyle = P.fence; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 158); ctx.quadraticCurveTo(C.W / 2, 178, C.W, 158); ctx.stroke();
    for (const f of flags) {
      const dip = Math.sin((f.x / C.W) * Math.PI) * 12;
      ctx.fillStyle = f.c;
      ctx.beginPath(); ctx.moveTo(f.x, 160 + dip); ctx.lineTo(f.x + 30, 163 + dip); ctx.lineTo(f.x + 15, 182 + dip); ctx.closePath(); ctx.fill();
    }
    // fence
    ctx.fillStyle = P.fence; ctx.fillRect(0, 246, C.W, 10);
    for (let x = 18; x < C.W; x += 52) ctx.fillRect(x, 226, 9, 30);
    // the pit: raked sand ellipse in a dirt apron
    ctx.fillStyle = '#B98246'; ctx.fillRect(0, 256, C.W, C.H - 256);
    const pit = C.PIT;
    ctx.fillStyle = P.pit;
    ctx.beginPath(); ctx.ellipse(pit.x + pit.w / 2, pit.y + pit.h / 2, pit.w / 2 + 26, pit.h / 2 + 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P.pitDark; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(pit.x + pit.w / 2, pit.y + pit.h / 2, pit.w / 2 + 26, pit.h / 2 + 20, 0, 0, Math.PI * 2); ctx.stroke();
    // rake lines and scuffs (fixed pattern, drawn from the visual seed's leftovers)
    ctx.strokeStyle = 'rgba(160,116,52,0.35)'; ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const yy = pit.y + 40 + i * 58;
      ctx.beginPath(); ctx.moveTo(pit.x + 30, yy); ctx.quadraticCurveTo(pit.x + pit.w / 2, yy + 12, pit.x + pit.w - 30, yy); ctx.stroke();
    }
    // sand texture: pebbles, straw and old bones the rake missed (precomputed above)
    for (const p of pebbles) {
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, p.rot, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(146,104,48,0.55)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (const s of straws) {
      for (const ln of s.lines) {
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + ln[0], s.y + ln[1]); ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(243,233,210,0.75)';
    for (const b of bones) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
      ctx.beginPath(); ctx.ellipse(0, 0, 11, 4.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-10, 0, 4, 0, Math.PI * 2); ctx.arc(10, 0, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // weather wash: the bout's mood tints the sand — rain streaks it, dusk darkens it
    if (moodId && moodId !== 'clear') {
      const washes = { rain: 'rgba(70,100,140,0.12)', heat: 'rgba(255,110,30,0.07)', mire: 'rgba(96,64,24,0.14)', swarm: 'rgba(60,50,20,0.05)', dusk: 'rgba(52,36,96,0.13)' };
      ctx.save();
      ctx.beginPath(); ctx.ellipse(pit.x + pit.w / 2, pit.y + pit.h / 2, pit.w / 2 + 26, pit.h / 2 + 20, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = washes[moodId] || 'rgba(0,0,0,0)';
      ctx.fillRect(pit.x - 30, pit.y - 24, pit.w + 60, pit.h + 48);
      if (moodId === 'rain') {
        ctx.strokeStyle = 'rgba(240,248,255,0.35)'; ctx.lineWidth = 2;
        for (const s of streaks) { ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - 7, s.y + 16); ctx.stroke(); }
      }
      if (moodId === 'swarm') {
        ctx.fillStyle = 'rgba(40,32,16,0.55)';
        for (const fp of flies) { ctx.beginPath(); ctx.arc(fp.x, fp.y, 2.2, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore();
    }
    // gate shadows at both ends
    ctx.fillStyle = 'rgba(90,60,20,0.13)';
    ctx.fillRect(pit.x - 8, pit.y + 26, 60, pit.h - 52);
    ctx.fillRect(pit.x + pit.w - 52, pit.y + 26, 60, pit.h - 52);
  }

  globalThis.CP_Board = { draw };
})();
