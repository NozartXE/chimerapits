// results.js — the plaque the run is remembered by: grade and score, the hero beast
// in its final grafted shape beside it, stat tiles, the grade ladder with its ticks,
// the last three runs with their losses kept honestly in red, the build the run was
// made of, the feats it holds, the next goal, and a per-bout graph of the climb.
(function () {
  if (globalThis.CP_Results) return;
  const C = globalThis.CP_Config;
  const P = C.PALETTE;
  const L = globalThis.CP_Layout;
  const Fit = globalThis.CP_Fit;
  const BV = globalThis.CP_BeastView;
  const B = globalThis.CP_Beasts;
  const Save = globalThis.CP_Save;
  const Feats = globalThis.CP_Feats;

  function draw(ctx, view, run) {
    const save = Save.load();
    const beast = B.build(run.plan);
    const won = run.result === 'CHAMPION';
    const headline = won ? (run.endless ? 'THE WILD GOES ON' : 'CHAMPION OF THE PIT') : 'YOUR BEAST FELL';
    const isBest = run.score >= save.best && run.score > 0;
    L.panel(ctx, 40, 30, 730, 700);
    Fit.draw(ctx, headline, 68, 76, 42, won ? P.tealDeep : P.danger, 'left', true, 560, true);
    if (isBest) { L.chip(ctx, 596, 52, 150, 40, P.gold); Fit.draw(ctx, 'NEW BEST', 671, 73, 18, P.ink, 'center', true); }
    L.chip(ctx, 68, 108, 108, 108, P.gold);
    Fit.draw(ctx, run.grade, 122, 164, 76, P.ink, 'center', true, 0, true);
    Fit.draw(ctx, 'SCORE', 196, 132, 15, P.inkSoft, 'left', true);
    Fit.draw(ctx, String(run.score), 196, 168, 54, P.ink, 'left', true, 340, true);
    const mins = Math.floor(run.time / 60), secs = Math.floor(run.time % 60);
    Fit.draw(ctx, C.DIFFICULTIES[run.diffIdx].name + ' · SEED ' + run.seed.toUpperCase() + ' · ' + mins + ':' + String(secs).padStart(2, '0') +
      (run.endless ? ' · THE WILD' : ' · THE CARD'), 196, 202, 15.5, P.inkSoft, 'left', false);
    const kills = run.boutResults.reduce((a, b) => a + b.kills, 0);
    const tiles = [
      ['BOUTS WON', run.boutsWon + (run.endless ? '' : ' / 9')],
      ['WILD FELLED', String(kills)],
      ['GRAFTS', run.graftsPicked + ' / ' + run.offersSeen + ' SEEN'],
      ['BEST CHAIN', 'x' + (1 + 0.5 * Math.max(0, run.maxChain - 1)).toFixed(1).replace('.0', '')],
    ];
    tiles.forEach((t, i) => {
      const x = 68 + i * 172;
      L.chip(ctx, x, 238, 158, 74, P.chip);
      Fit.draw(ctx, t[0], x + 79, 262, 13.5, P.inkSoft, 'center', true);
      Fit.draw(ctx, t[1], x + 79, 292, 24, P.ink, 'center', true, 150);
    });
    const ladder = C.GRADES.map((g) => g.grade + ' ' + g.min + (run.score >= g.min ? ' ✓' : ' ✗')).join('    ');
    Fit.draw(ctx, ladder, 68, 340, 17, P.ink, 'left', true, 660);
    Fit.draw(ctx, 'LAST RUNS', 68, 374, 14.5, P.inkSoft, 'left', true);
    const hist = save.history.length ? save.history : [{ score: run.score, grade: run.grade, result: run.result, bouts: run.boutsWon, difficulty: C.DIFFICULTIES[run.diffIdx].name }];
    hist.slice(0, 3).forEach((h, i) => {
      const y = 402 + i * 34;
      const champ = h.result === 'CHAMPION';
      L.chip(ctx, 68, y - 13, 118, 27, champ ? '#DFF5E3' : '#FFE9E4');
      Fit.draw(ctx, champ ? 'CHAMPION' : 'FELL', 127, y + 1, 13.5, champ ? P.ink : P.danger, 'center', true, 112);
      Fit.draw(ctx, h.score + ' pts · grade ' + h.grade + ' · ' + h.bouts + ' bouts · ' + h.difficulty, 202, y + 1, 15, P.ink, 'left', false, 520);
    });
    Fit.draw(ctx, 'YOUR BUILD — ' + run.graftsPicked + ' GRAFTS PICKED FROM ' + run.offersSeen + ' OFFERS', 68, 516, 14.5, P.inkSoft, 'left', true);
    Fit.wrap(ctx, B.buildLine(beast), 68, 542, 16.5, P.ink, 660, 22, 'left');
    if (beast.synergies.length) Fit.draw(ctx, 'SYNERGIES: ' + beast.synergies.map((s) => s.name).join(' · '), 68, 592, 15, P.violetDeep, 'left', true, 660);
    Feats.FEATS.forEach((ft, i) => {
      const x = 68 + i * 76;
      const got = !!save.feats[ft.id];
      L.chip(ctx, x, 622, 68, 34, got ? P.gold : '#E4EBEF');
      Fit.draw(ctx, ft.short || ft.name.split(' ')[0], x + 34, 640, 11.5, got ? P.ink : '#7A8B99', 'center', true, 64);
    });
    const nextFeat = Feats.FEATS.find((ft) => !save.feats[ft.id]);
    Fit.draw(ctx, nextFeat ? 'NEXT GOAL: ' + nextFeat.name + ' — ' + nextFeat.text : 'NEXT GOAL: DEFEND THE CROWN ON BRUTAL',
      68, 690, 15.5, P.ink, 'left', true, 470);
    // per-bout climb graph along the plaque's bottom-right, clear of the goal line
    if (run.boutResults.length > 1) {
      Fit.draw(ctx, 'PER BOUT', 752, 690, 12.5, P.inkSoft, 'right', true);
      const max = Math.max.apply(null, run.boutResults.map((b) => b.score).concat([1]));
      run.boutResults.forEach((b, i) => {
        const bh = Math.max(3, 3 + Math.sqrt(b.score / max) * 19);
        const x = 566 + i * 20;
        ctx.fillStyle = b.won ? P.teal : P.danger;
        ctx.fillRect(x, 724 - bh, 15, bh);
        ctx.lineWidth = 1.5; ctx.strokeStyle = P.ink; ctx.strokeRect(x, 724 - bh, 15, bh);
      });
    }
    // hero beast + the way back in
    const fake = { x: 1020, y: 560, facing: -1, walkPhase: view.t * 2.4, vx: 18, vy: 0, statuses: [], hitFlash: 0, animT: view.t, stun: 0, chargeT: 0 };
    BV.drawBeast(ctx, run.plan, fake, 1.5, {});
    Fit.draw(ctx, B.beastTitle(beast), 1020, 620, 22, P.ink, 'center', true, 420);
    Fit.draw(ctx, 'POWER ' + B.power(beast), 1020, 648, 16, P.inkSoft, 'center', true);
    L.button(ctx, view, 'again', 800, 662, 440, 60, 'R — RUN AGAIN', { size: 26, fill: P.coral, color: '#FFF6E9' });
    Fit.draw(ctx, 'ESC — BACK TO TITLE', 1020, 756, 16, '#FFF6E9', 'center', true);
  }

  globalThis.CP_Results = { draw };
})();
