// sim.js — the run state machine: title to pit to graft table and back, nine bouts up
// the card (or endless in THE WILD), vigour that persists and partly mends between
// bouts, applause that pays for prods and rerolls, feats checked where they happen,
// and an honest results record — losses included — written to the save at the end.
(function () {
  if (globalThis.CP_Sim) return;
  const C = globalThis.CP_Config;
  const P = globalThis.CP_Parts;
  const B = globalThis.CP_Beasts;
  const W = globalThis.CP_Waves;
  const G = globalThis.CP_Grafts;
  const F = globalThis.CP_Feats;
  const Combat = globalThis.CP_Combat;
  const Save = globalThis.CP_Save;

  function createRun(seedStr, diffIdx, endless) {
    const rng = globalThis.CP_Rng.streams(seedStr);
    const beast = B.build(Object.assign({}, P.BASE_BUILD));
    return {
      seed: String(seedStr), diffIdx, endless: !!endless, rng,
      plan: Object.assign({}, P.BASE_BUILD),
      graftedSlots: {}, graftCounts: {}, graftsPicked: 0, offersSeen: 0,
      score: 0, applause: 30, vigour: beast.maxHp, stanceIdx: 0,
      boutIdx: 0, boutsWon: 0, screen: 'play', fight: null,
      offers: null, draftRerolls: 0, prodsUsed: 0, featFlags: {},
      boutResults: [], time: 0, result: null, grade: '', acc: 0,
      fx: [], newFeats: [], maxChain: 0, healed: 0,
    };
  }

  function currentBout(run) {
    if (run.boutIdx < W.BOUTS.length) return W.BOUTS[run.boutIdx];
    return W.endlessBout(run.boutIdx + 1, run.rng.stage);
  }

  function startBout(run) {
    const beast = B.build(run.plan);
    if (run.boutIdx === 0) run.vigour = beast.maxHp;
    run.vigour = Math.min(run.vigour, beast.maxHp);
    run.fight = new Combat.Fight(run, currentBout(run), beast);
    run.screen = 'play';
    run.boutDamageTaken = 0;
  }

  function earn(run, featId) {
    if (Save.earnFeat(featId)) run.newFeats.push(F.byId[featId].name);
    run.featFlags['earned_' + featId] = true;
  }

  function endBout(run) {
    const fight = run.fight;
    run.boutResults.push({
      n: fight.bout.n, name: fight.bout.name, won: fight.won,
      kills: fight.kills, time: Math.round(fight.time), score: run.score,
    });
    if (!fight.won) return finishRun(run, 'FELL');
    run.boutsWon++;
    run.vigour = Math.max(0, Math.round(fight.player.hp));
    if (run.boutsWon === 1) earn(run, 'firstblood');
    if (fight.damageTaken === 0) earn(run, 'untouched');
    if (run.applause >= 100) earn(run, 'crowd');
    if (run.maxChain >= 5) earn(run, 'style');
    if (run.endless && run.boutsWon >= 10) earn(run, 'wildthing');
    const lastCard = !run.endless && run.boutIdx >= W.BOUTS.length - 1;
    if (lastCard) return finishRun(run, 'CHAMPION');
    // mend between bouts: three-fifths of what the wild took, back
    const beast = B.build(run.plan);
    const mend = Math.round((beast.maxHp - run.vigour) * 0.6);
    run.vigour = Math.min(beast.maxHp, run.vigour + mend);
    run.healed += mend;
    run.draftRerolls = 0;
    run.offers = G.offersFor(run, 3);
    run.offersSeen += run.offers.length;
    run.screen = 'draft';
  }

  function pickGraft(run, idx) {
    const offer = run.offers && run.offers[idx];
    if (!offer) return false;
    run.plan[offer.part.slot] = offer.part.id;
    run.graftedSlots[offer.part.slot] = true;
    run.graftCounts[offer.part.slot] = (run.graftCounts[offer.part.slot] || 0) + 1;
    run.graftsPicked++;
    Save.seePart(offer.part.id);
    if (Object.keys(run.graftedSlots).length >= 6) earn(run, 'fullhouse');
    if (run.graftCounts[offer.part.slot] >= 3) earn(run, 'shapeshifter');
    run.boutIdx++;
    startBout(run);
    return true;
  }

  function reroll(run) {
    const cost = G.rerollCost(run);
    if (run.applause < cost || run.screen !== 'draft') return false;
    run.applause -= cost;
    run.draftRerolls++;
    run.offers = G.offersFor(run, 3);
    run.offersSeen += run.offers.length;
    return true;
  }

  function prod(run, id) {
    if (!run.fight || run.screen !== 'play') return false;
    const ok = run.fight.prod(id);
    if (ok) run.prodsUsed++;
    return ok;
  }

  // Marking: the player points at a wild beast (or presses Q for the strongest)
  // and their beast hunts that one until it falls.
  function markAt(run, x, y) {
    if (!run.fight || run.screen !== 'play' || run.fight.over) return false;
    let best = null, bd = 110;
    for (const f of run.fight.fighters) {
      if (!f.alive || f.team !== 'wild') continue;
      const d = Math.hypot(f.x - x, f.y - y);
      if (d < bd) { bd = d; best = f; }
    }
    return best ? run.fight.mark(best) : false;
  }

  function markStrongest(run) {
    if (!run.fight || run.screen !== 'play' || run.fight.over) return false;
    const wild = run.fight.wildAlive().sort((a, b) => b.hp - a.hp)[0];
    return wild ? run.fight.mark(wild) : false;
  }

  function finishRun(run, result) {
    run.result = result;
    run.screen = 'results';
    const grade = C.GRADES.find((g) => run.score >= g.min) || C.GRADES[C.GRADES.length - 1];
    run.grade = grade.grade;
    if (result === 'CHAMPION') earn(run, 'apexslayer');
    if (run.boutsWon >= 5 && run.prodsUsed === 0) earn(run, 'handsoff');
    const beast = B.build(run.plan);
    Save.recordRun({
      score: run.score, grade: run.grade, result,
      bouts: run.boutsWon, difficulty: C.DIFFICULTIES[run.diffIdx].name,
      build: B.buildLine(beast), endless: run.endless, seed: run.seed,
    });
  }

  // Advance the run by dt seconds of game time (fixed-stepped combat inside).
  function update(run, dt) {
    run.time += dt;
    if (run.screen !== 'play' || !run.fight) return;
    run.acc += dt;
    let steps = 0;
    while (run.acc >= C.STEP && steps < 8) {
      run.fight.update(C.STEP);
      run.acc -= C.STEP; steps++;
      for (const e of run.fight.drainEvents()) {
        run.fx.push(e);
        if (e.t === 'kill' && e.team === 'wild') run.maxChain = Math.max(run.maxChain, run.fight.chain);
      }
      if (run.fight.over) { run.overT = (run.overT || 0) + C.STEP; }
    }
    if (run.fx.length > 240) run.fx.splice(0, run.fx.length - 240);
    if (run.fight.over && run.overT > 0.9) { run.overT = 0; endBout(run); }
  }

  globalThis.CP_Sim = { createRun, startBout, update, pickGraft, reroll, prod, markAt, markStrongest, currentBout, finishRun };
})();
