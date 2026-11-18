// draftscreen.js — the graft table, the screen the whole game turns on: three graft
// offers as big cards (glyph, slot, stat deltas, the attack it brings, synergy
// callouts), your beast redrawn live with the hovered graft already on its body,
// the build you own along the bottom, a priced reroll, and the stance you will
// carry into the next bout. What you pick is what the next fight looks like.
(function () {
  if (globalThis.CP_DraftScreen) return;
  const C = globalThis.CP_Config;
  const P = C.PALETTE;
  const L = globalThis.CP_Layout;
  const Fit = globalThis.CP_Fit;
  const BV = globalThis.CP_BeastView;
  const B = globalThis.CP_Beasts;
  const G = globalThis.CP_Grafts;

  function deltaText(offer) {
    const bits = [];
    if (offer.hpDelta) bits.push('VIGOUR ' + (offer.hpDelta > 0 ? '+' : '') + offer.hpDelta);
    bits.push('POWER ' + (offer.powerDelta >= 0 ? '+' : '') + offer.powerDelta);
    return bits.join(' · ');
  }

  function draw(ctx, view, run) {
    const hover = view.hoverOffer != null ? run.offers[view.hoverOffer] : null;
    const shownPlan = hover ? Object.assign({}, run.plan, { [hover.part.slot]: hover.part.id }) : run.plan;
    // heading
    L.panel(ctx, 190, 12, 900, 76, P.gold);
    Fit.draw(ctx, 'IT LIVES — GRAFT 1 OF 3', 640, 44, 40, P.ink, 'center', true, 860, true);
    Fit.draw(ctx, 'BOUT ' + (run.boutIdx + 1) + ' CLEARED · THE YARD OFFERS THREE GRAFTS · YOUR BEAST, REBUILT BEFORE YOUR EYES', 640, 74, 15.5, P.ink, 'center', true, 860);
    // beast preview stage
    L.panel(ctx, 330, 104, 620, 218, '#F3E9D2');
    const fake = { x: 640, y: 268, facing: 1, walkPhase: view.t * 3.2, vx: 20, vy: 0, statuses: [], hitFlash: 0, animT: view.t, stun: 0, chargeT: 0 };
    BV.drawBeast(ctx, shownPlan, fake, 1.12, { ghost: false });
    Fit.draw(ctx, hover ? 'PREVIEW: WITH ' + hover.part.name.toUpperCase() : B.beastTitle(B.build(run.plan)) + ' — AS IT STANDS',
      640, 306, 16, P.violetDeep, 'center', true, 600);
    if (hover && hover.newSynergies.length) {
      Fit.draw(ctx, 'COMPLETES: ' + hover.newSynergies.join(' + '), 640, 126, 18, P.coral, 'center', true, 600);
    }
    // the three cards
    run.offers.forEach((offer, i) => {
      const x = 56 + i * 404, y = 340, w = 372, h = 252;
      const isHover = view.hoverOffer === i;
      L.panel(ctx, x, y, w, h, isHover ? '#FFF3D6' : P.panel);
      L.chip(ctx, x + 16, y + 14, 108, 26, P.violet);
      Fit.draw(ctx, C.SLOT_NAMES[offer.part.slot], x + 70, y + 28, 15, '#FFF6E9', 'center', true);
      Fit.draw(ctx, '' + (i + 1), x + w - 34, y + 28, 22, P.inkSoft, 'center', true);
      BV.drawPartGlyph(ctx, offer.part, x + 76, y + 108, 0.92);
      Fit.draw(ctx, offer.part.name, x + 140, y + 66, 23, P.ink, 'left', true, 224);
      Fit.draw(ctx, deltaText(offer), x + 140, y + 94, 16.5, offer.powerDelta >= 0 ? P.tealDeep : P.danger, 'left', true, 224);
      if (offer.part.attack) {
        Fit.draw(ctx, offer.part.attack.name + ' — ' + offer.part.attack.dmg + ' dmg' +
          (offer.part.attack.status ? ' + ' + offer.part.attack.status : ''), x + 140, y + 120, 15.5, P.ink, 'left', false, 224);
      } else {
        Fit.draw(ctx, offer.part.blurb, x + 140, y + 118, 15, P.inkSoft, 'left', false, 224);
      }
      if (offer.newSynergies.length) {
        L.chip(ctx, x + 140, y + 140, 216, 28, P.gold);
        Fit.draw(ctx, '✦ ' + offer.newSynergies.join(' + '), x + 248, y + 155, 15, P.ink, 'center', true, 210);
      }
      Fit.wrap(ctx, offer.part.blurb, x + 18, y + 190, 15.5, P.inkSoft, w - 36, 19, 'left');
      view.buttons['offer' + i] = { x, y, w, h };
    });
    // owned build strip + reroll + stance
    L.panel(ctx, 56, 612, 800, 118);
    Fit.draw(ctx, 'YOUR BUILD — ' + run.graftsPicked + ' GRAFTS PICKED FROM ' + run.offersSeen + ' OFFERS', 76, 636, 16, P.inkSoft, 'left', true);
    C.SLOTS.forEach((slot, i) => {
      const x = 76 + i * 128;
      const part = globalThis.CP_Parts.byId[run.plan[slot]];
      L.chip(ctx, x, 652, 120, 30, run.graftedSlots[slot] ? P.gold : P.chip);
      Fit.draw(ctx, C.SLOT_NAMES[slot], x + 60, 668, 12.5, P.inkSoft, 'center', true);
      Fit.draw(ctx, part.name, x + 60, 700, 14.5, P.ink, 'center', true, 116);
    });
    Fit.draw(ctx, 'SYNERGIES: ' + (B.build(run.plan).synergies.map((s) => s.name).join(' · ') || 'NONE YET'), 76, 716, 14.5, P.violetDeep, 'left', true, 760);
    // reroll + applause
    L.panel(ctx, 872, 612, 352, 118);
    const cost = G.rerollCost(run);
    L.button(ctx, view, 'reroll', 888, 626, 320, 44, 'X — REROLL · ' + cost + ' APPLAUSE', { size: 17, fill: run.applause >= cost ? P.sky : '#C9CFD2' });
    Fit.draw(ctx, 'APPLAUSE ' + Math.floor(run.applause), 1048, 692, 16, P.ink, 'center', true);
    C.STANCES.forEach((s, i) => {
      const x = 888 + i * 108;
      L.button(ctx, view, 'stance' + i, x, 700, 100, 24, s.name, { size: 12.5, fill: run.stanceIdx === i ? P.gold : P.panel });
    });
  }

  globalThis.CP_DraftScreen = { draw };
})();
