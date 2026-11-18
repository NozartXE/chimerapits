// title.js — the title screen: the wordmark over a live sparring pit (the demo fight
// is the real combat sim, not a picture of it), a quantified scope strip, a six-row
// rules digest with the win and the loss spelled out, and the way in — PLAY, three
// difficulties, the endless WILD, and the side doors to the almanac and the rules.
(function () {
  if (globalThis.CP_Title) return;
  const C = globalThis.CP_Config;
  const P = C.PALETTE;
  const L = globalThis.CP_Layout;
  const Fit = globalThis.CP_Fit;
  const Icons = globalThis.CP_RuleIcons;
  const Save = globalThis.CP_Save;
  const Feats = globalThis.CP_Feats;

  const RULES = [
    ['fight', 'Your beast fights the wild on its own — you prod, it bites'],
    ['graft', 'Win a bout, graft 1 of 3 new body parts onto it'],
    ['chain', 'Fast kills chain STYLE: the score multiplier climbs to x8'],
    ['prod', 'Spend APPLAUSE on prods: shock, treats, rageberry'],
    ['apex', 'Bout 9 is APEX, THE UNSPLICED — three tempers, one hide'],
    ['heart', 'WIN: clear all 9 bouts · LOSE: your beast falls'],
  ];

  function draw(ctx, view) {
    const save = Save.load();
    // wordmark
    L.panel(ctx, 150, 14, 980, 118, P.gold);
    Fit.draw(ctx, 'CHIMERA PITS', 640, 62, 84, P.ink, 'center', true, 940, true);
    Fit.draw(ctx, 'SPLICE IT · FIGHT IT · GRAFT IT STRANGER', 640, 112, 21, P.ink, 'center', true);
    // quantified scope strip
    L.panel(ctx, 150, 142, 980, 42);
    Fit.draw(ctx, '36 GRAFTS · 7 SYNERGIES · 9 WILD KINDS + THE APEX · 9 BOUTS · 3 DIFFICULTIES · ENDLESS WILD', 640, 164, 19, P.ink, 'center', true, 950);
    // rules digest, left
    L.panel(ctx, 40, 206, 430, 330);
    Fit.draw(ctx, 'HOW THE YARD WORKS', 64, 234, 19, P.tealDeep, 'left', true);
    RULES.forEach((row, i) => {
      const y = 272 + i * 43;
      Icons.draw(ctx, row[0], 88, y, 30);
      Fit.wrap(ctx, row[1], 116, y - 9, 16.5, P.ink, 336, 20, 'left');
    });
    // the way in, right
    L.panel(ctx, 810, 206, 430, 330);
    L.button(ctx, view, 'play', 838, 224, 374, 74, '▶  ENTER THE PIT', { size: 30, fill: P.coral, color: '#FFF6E9' });
    const featsGot = Feats.FEATS.filter((f) => save.feats[f.id]).length;
    Fit.draw(ctx, 'BEST ' + save.best + (save.bestGrade ? ' · GRADE ' + save.bestGrade : '') + ' · FEATS ' + featsGot + '/9' +
      (save.endlessBest ? ' · WILD BEST ' + save.endlessBest : ''), 1025, 322, 17.5, P.ink, 'center', true, 400);
    C.DIFFICULTIES.forEach((d, i) => {
      const x = 838 + i * 128;
      const sel = view.diffIdx === i;
      L.button(ctx, view, 'diff' + i, x, 344, 118, 50, d.name, { size: 17, fill: sel ? P.gold : P.panel });
    });
    Fit.draw(ctx, C.DIFFICULTIES[view.diffIdx].text, 1025, 412, 15.5, P.inkSoft, 'center', false);
    const wildSel = view.endless;
    L.button(ctx, view, 'wild', 838, 430, 374, 48, wildSel ? 'MODE: THE WILD — ENDLESS' : 'MODE: THE CARD — 9 BOUTS', { size: 17, fill: wildSel ? P.sky : P.panel });
    L.button(ctx, view, 'howto', 838, 488, 178, 38, 'HOW TO PLAY', { size: 15.5 });
    L.button(ctx, view, 'almanac', 1034, 488, 178, 38, 'ALMANAC', { size: 15.5 });
    // controls footer
    ctx.fillStyle = P.ink; ctx.fillRect(0, 752, C.W, 48);
    Fit.draw(ctx, 'MOUSE OR KEYS · 1 2 3 PRODS AND GRAFTS · X REROLL AT THE TABLE · Z C STANCE · R RUN AGAIN · M SOUND', 640, 777, 17, '#FFFFFF', 'center', true);
  }

  globalThis.CP_Title = { draw };
})();
