// grafts.js — the between-bouts draft: three graft offers drawn from the parts the beast
// does not currently wear, weighted toward finishing a synergy or opening a fresh slot.
// Each offer is previewed honestly — the beast is rebuilt with the graft and the power
// difference and any new synergy are computed from the real builder, never scripted.
(function () {
  if (globalThis.CP_Grafts) return;
  const P = globalThis.CP_Parts;
  const B = globalThis.CP_Beasts;

  function offersFor(run, count) {
    const rng = run.rng.draft;
    const cur = B.build(run.plan);
    const pool = [];
    for (const part of P.PARTS) {
      if (run.plan[part.slot] === part.id) continue;         // already wearing it
      let w = 1;
      const trial = Object.assign({}, run.plan, { [part.slot]: part.id });
      const after = B.build(trial);
      const gained = after.synergies.filter((s) => !cur.synergies.some((c) => c.id === s.id));
      if (gained.length) w *= 1.7;                            // finishes a synergy
      if (run.graftedSlots && !run.graftedSlots[part.slot]) w *= 1.25; // opens a fresh slot
      if (part.base) w *= 0.4;                                // base parts are dull offers
      pool.push({ part, w, after, gained });
    }
    const offers = [];
    const usedSlots = new Set();
    const bag = pool.slice();
    while (offers.length < count && bag.length) {
      let total = 0;
      for (const o of bag) total += o.w;
      let roll = rng.next() * total, pick = bag[0];
      for (const o of bag) { roll -= o.w; if (roll <= 0) { pick = o; break; } }
      bag.splice(bag.indexOf(pick), 1);
      if (usedSlots.has(pick.part.slot) && bag.some((o) => !usedSlots.has(o.part.slot))) continue;
      usedSlots.add(pick.part.slot);
      offers.push({
        part: pick.part,
        powerDelta: B.power(pick.after) - B.power(cur),
        hpDelta: pick.after.maxHp - cur.maxHp,
        newSynergies: pick.gained.map((s) => s.name),
        after: pick.after,
      });
    }
    return offers;
  }

  function rerollCost(run) { return 25 + 12 * (run.draftRerolls || 0); }

  globalThis.CP_Grafts = { offersFor, rerollCost };
})();
