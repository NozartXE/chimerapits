// almanac.js — the yard almanac: every graft in the catalogue drawn as its glyph with
// its numbers and its story, and every wild kind in the bestiary beside it. Parts and
// beasts you have not met yet show as silhouettes with a question — the rest is the
// game's whole content, browsable from the title screen.
(function () {
  if (globalThis.CP_Almanac) return;
  const C = globalThis.CP_Config;
  const P = C.PALETTE;
  const L = globalThis.CP_Layout;
  const Fit = globalThis.CP_Fit;
  const BV = globalThis.CP_BeastView;
  const Parts = globalThis.CP_Parts;
  const Enemies = globalThis.CP_Enemies;
  const Save = globalThis.CP_Save;

  function draw(ctx, view) {
    const save = Save.load();
    ctx.fillStyle = '#274156'; ctx.fillRect(0, 0, C.W, C.H);
    Fit.draw(ctx, 'THE YARD ALMANAC', 640, 44, 44, '#FFF6E9', 'center', true, 900, true);
    Fit.draw(ctx, 'EVERY GRAFT THE YARD CAN SEW · EVERY WILD THING IT CAN SEND', 640, 76, 16, '#B9CFC6', 'center', true);
    // grafts: six slot columns
    C.SLOTS.forEach((slot, si) => {
      const x = 36 + si * 206;
      Fit.draw(ctx, C.SLOT_NAMES[slot], x + 94, 108, 17, P.gold, 'center', true);
      Parts.bySlot[slot].forEach((part, i) => {
        const y = 128 + i * 106;
        const seen = !!save.seenParts[part.id] || part.base;
        L.panel(ctx, x, y, 188, 96, seen ? P.panel : '#3A4A5E');
        if (seen) {
          BV.drawPartGlyph(ctx, part, x + 44, y + 44, 0.52);
          Fit.draw(ctx, part.name, x + 80, y + 24, 14.5, P.ink, 'left', true, 104);
          const stat = part.attack ? part.attack.name + ' ' + part.attack.dmg : (part.organ ? 'passive' : 'trait');
          Fit.draw(ctx, stat, x + 80, y + 46, 12, P.inkSoft, 'left', false, 104);
          Fit.draw(ctx, (part.hp ? 'HP+' + part.hp + ' ' : '') + (part.atk ? 'ATK+' + part.atk : ''), x + 80, y + 66, 12, P.tealDeep, 'left', true, 104);
        } else {
          Fit.draw(ctx, '?', x + 44, y + 48, 34, '#7A8B99', 'center', true);
          Fit.draw(ctx, 'NOT YET GRAFTED', x + 80, y + 48, 12, '#7A8B99', 'left', true, 104);
        }
      });
    });
    // bestiary strip along the bottom
    L.panel(ctx, 36, 660, 1208, 96, '#FFFDF6');
    Fit.draw(ctx, 'THE WILD', 56, 684, 15, P.inkSoft, 'left', true);
    const all = Enemies.WILD.concat([Enemies.APEX]);
    all.forEach((w, i) => {
      const x = 66 + i * 128;
      const seen = !!save.seenWild[w.id];
      Fit.draw(ctx, seen ? w.name : '? ? ?', x + 52, 684 + 22, 13.5, seen ? P.ink : '#7A8B99', 'center', true, 120);
      Fit.draw(ctx, seen ? 'HP ' + w.hp + ' · ' + w.attack.name : 'unmet', x + 52, 684 + 44, 12, P.inkSoft, 'center', false, 120);
    });
    Fit.draw(ctx, 'ESC — TITLE', 640, 786, 15, '#B9CFC6', 'center', true);
  }

  globalThis.CP_Almanac = { draw };
})();
