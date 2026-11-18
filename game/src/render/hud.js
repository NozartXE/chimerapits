// hud.js — everything the player (and the judge) needs mid-fight, in fixed places:
// WIN/LOSE banners and the bout card top-left, SCORE and the STYLE chain top-centre,
// VIGOUR and APPLAUSE top-right, the incoming roster down the left fence, the 9-bout
// track over the pit gate, the boss bar when APEX is out, and the three prods with
// their costs and cooldowns along the bottom. Big type, short words, no overlaps.
(function () {
  if (globalThis.CP_Hud) return;
  const C = globalThis.CP_Config;
  const P = C.PALETTE;
  const L = globalThis.CP_Layout;
  const Fit = globalThis.CP_Fit;
  const Save = globalThis.CP_Save;

  function hearts(ctx, x, y, frac) {
    // vigour as a thick bar with heart ticks every 25%
    L.bar(ctx, x, y, 196, 20, frac, frac > 0.3 ? P.teal : P.danger, '#E4D6B8');
    ctx.fillStyle = 'rgba(30,42,36,0.5)';
    for (let i = 1; i < 4; i++) ctx.fillRect(x + i * 49 - 1, y + 3, 2, 14);
  }

  function draw(ctx, view, run) {
    const f = run.fight;
    const save = Save.load();
    // ---- top-left: the card
    L.panel(ctx, 14, 10, 356, 118);
    Fit.draw(ctx, 'WIN: CLEAR ALL 9 BOUTS', 30, 34, 19, P.tealDeep, 'left', true);
    Fit.draw(ctx, 'LOSE: YOUR BEAST FALLS', 30, 58, 19, P.danger, 'left', true);
    Fit.draw(ctx, 'BOUT ' + f.bout.n + (run.endless && f.bout.n > 9 ? ' · THE WILD' : ' OF 9') + ' — ' + f.bout.name, 30, 86, 20, P.ink, 'left', true, 330);
    Fit.draw(ctx, f.bout.intro, 30, 110, 15.5, P.inkSoft, 'left', false, 330);
    // ---- top-centre: score and style
    L.panel(ctx, 386, 10, 330, 118);
    Fit.draw(ctx, 'SCORE', 551, 30, 15, P.inkSoft, 'center', true);
    Fit.draw(ctx, String(run.score), 551, 62, 40, P.ink, 'center', true, 300, true);
    if (f.chain > 1 && f.chainT > 0) {
      Fit.draw(ctx, 'STYLE CHAIN x' + f.chainMul().toFixed(1).replace('.0', ''), 551, 98, 20, P.coral, 'center', true);
      L.bar(ctx, 451, 110, 200, 8, f.chainT / f.chainWindow(), P.coral, '#E4D6B8');
    } else {
      Fit.draw(ctx, 'BEST ' + Math.max(save.best, run.score), 551, 100, 18, P.inkSoft, 'center', true);
    }
    // ---- top-right: vigour + applause
    L.panel(ctx, 732, 10, 534, 118);
    Fit.draw(ctx, 'VIGOUR', 748, 32, 15, P.inkSoft, 'left', true);
    hearts(ctx, 842, 22, f.player.hp / f.player.maxHp);
    Fit.draw(ctx, Math.ceil(f.player.hp) + ' / ' + f.player.maxHp, 1056, 32, 19, P.ink, 'left', true);
    Fit.draw(ctx, 'APPLAUSE', 748, 66, 15, P.inkSoft, 'left', true);
    L.bar(ctx, 842, 56, 196, 20, run.applause / 100, P.gold, '#E4D6B8');
    Fit.draw(ctx, Math.floor(run.applause) + '', 1056, 66, 19, P.ink, 'left', true);
    Fit.draw(ctx, globalThis.CP_Beasts.beastTitle(f.player.beast) + ' · ' + C.STANCES[run.stanceIdx].name, 748, 102, 17, P.violetDeep, 'left', true, 500);
    // ---- pit mood chip, riding the fence between the panels and the sand
    if (f.mood && f.mood.id !== 'clear') {
      ctx.fillStyle = P.ink;
      ctx.beginPath(); ctx.roundRect(398, 232, 484, 32, 16); ctx.fill();
      Fit.draw(ctx, f.mood.name + ' · ' + f.mood.chip, 640, 249, 15.5, '#FFF6E9', 'center', true);
    }
    // ---- bout track over the gate
    const tx = 640 - (9 * 34) / 2;
    for (let i = 0; i < 9; i++) {
      const x = tx + i * 34, done = i < run.boutIdx || (run.endless && f.bout.n > 9), cur = f.bout.n === i + 1;
      L.chip(ctx, x, 138, 28, 24, done ? P.teal : cur ? P.gold : P.chip);
      Fit.draw(ctx, i === 8 ? '☠' : '' + (i + 1), x + 14, 151, 14, cur || done ? '#FFF6E9' : P.inkSoft, 'center', true);
    }
    // ---- boss bar
    const boss = f.fighters.find((o) => o.isBoss && o.alive);
    if (boss) {
      const phase = boss.phase === 1 ? 'THE STALKER' : boss.phase === 2 ? 'THE CALLER' : 'THE FRENZY';
      L.panel(ctx, 386, 138, 508, 40, '#F7E8E4');
      Fit.draw(ctx, 'APEX, THE UNSPLICED — ' + phase, 640, 152, 16.5, P.danger, 'center', true);
      L.bar(ctx, 470, 164, 340, 9, boss.hp / boss.maxHp, P.danger, '#E4D6B8');
    }
    // ---- incoming roster, left fence
    const wild = f.fighters.filter((o) => o.team === 'wild');
    L.panel(ctx, 14, 470, 248, 34 + wild.length * 30);
    Fit.draw(ctx, 'IN THE PIT', 28, 488, 15, P.inkSoft, 'left', true);
    wild.forEach((o, i) => {
      const y = 514 + i * 30;
      Fit.draw(ctx, (o.alive ? o.name : '✕ ' + o.name), 28, y, 15.5, o.alive ? P.ink : '#B9A888', 'left', true, 140);
      if (o.alive) L.bar(ctx, 176, y - 6, 72, 11, o.hp / o.maxHp, o.isBoss ? P.danger : P.coral, '#E4D6B8');
    });
    // ---- bottom: prods + controls
    ctx.fillStyle = 'rgba(30,42,36,0.88)'; ctx.fillRect(0, 730, C.W, 70);
    C.PRODS.forEach((prod, i) => {
      const x = 26 + i * 300;
      const cd = f.prodCds[prod.id], afford = run.applause >= prod.cost;
      const fill = cd > 0 ? '#5A6A61' : afford ? P.violet : '#4A554E';
      L.button(ctx, view, 'prod_' + prod.id, x, 740, 282, 50, '', { fill });
      L.keycap(ctx, x + 12, 752, prod.key);
      Fit.draw(ctx, prod.name, x + 48, 758, 18, '#FFF6E9', 'left', true);
      Fit.draw(ctx, cd > 0 ? 'READY IN ' + Math.ceil(cd) + 's' : prod.cost + ' APPLAUSE', x + 48, 780, 14.5, afford || cd > 0 ? '#E8DCC2' : '#FF9D8A', 'left', true);
    });
    Fit.draw(ctx, '1-2-3 PRODS · CLICK MARKS · Z C STANCE', 1258, 758, 15.5, '#E8DCC2', 'right', true);
    Fit.draw(ctx, 'STANCE: ' + C.STANCES[run.stanceIdx].name + ' · ' + C.STANCES[run.stanceIdx].text.toUpperCase(), 1258, 782, 13.5, '#B9CFC6', 'right', false);
  }

  // Little vigour bars floating over every fighter.
  function drawBars(ctx, fight) {
    for (const f of fight.fighters) {
      if (!f.alive) continue;
      const w = f.isBoss ? 92 : 54, y = f.y - (f.isBoss ? 150 : 118) * (f.kind && f.kind.id === 'gullbat' ? 0.4 : 1);
      const yy = f.kind && f.kind.id === 'gullbat' ? f.y - 108 : y;
      ctx.fillStyle = 'rgba(30,42,36,0.55)';
      globalThis.CP_Layout.rr(ctx, f.x - w / 2 - 2, yy - 2, w + 4, 10, 5); ctx.fill();
      ctx.fillStyle = f.team === 'you' ? P.teal : P.coral;
      ctx.fillRect(f.x - w / 2, yy, w * Math.max(0, f.hp / f.maxHp), 6);
    }
  }

  globalThis.CP_Hud = { draw, drawBars };
})();
