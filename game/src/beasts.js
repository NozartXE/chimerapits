// beasts.js — turns a body plan (one part id per slot) into a fighting beast: derived
// stats, the attack list the combat sim cycles, movement and defence traits, organ
// passive, and the synergy list. Pure functions of the plan — the draft screen previews
// a graft by rebuilding the beast with it and diffing the numbers.
(function () {
  if (globalThis.CP_Beasts) return;
  const P = globalThis.CP_Parts;

  const BASE = { hp: 132, spd: 126, crit: 0.05 };

  function build(plan) {
    const parts = {};
    let hp = BASE.hp, atkAdd = 0, spd = BASE.spd, armor = 0, crit = BASE.crit, evade = 0;
    let knockRes = 0, haste = 0, wag = 0, charm = 0, stylePlus = 0;
    let move = 'none', defense = 'none', organ = null;
    const tags = [];
    for (const slot of Object.keys(plan)) {
      const part = P.byId[plan[slot]];
      parts[slot] = part;
      hp += part.hp || 0; atkAdd += part.atk || 0; spd += part.spd || 0; armor += part.armor || 0;
      knockRes = Math.max(knockRes, part.knockRes || 0);
      evade += part.evade || 0; haste += part.haste || 0; wag += part.wag || 0;
      charm += part.charm || 0; stylePlus += part.stylePlus || 0;
      if (part.move) move = part.move;
      if (part.defense) defense = part.defense;
      if (part.organ) organ = part.organ;
      for (const t of part.tags) tags.push(t);
    }
    // Synergies: count tags across the whole body, match each recipe's needs.
    const synergies = [];
    for (const syn of P.SYNERGIES) {
      const need = {};
      for (const t of syn.tags) need[t] = (need[t] || 0) + 1;
      const have = {};
      for (const t of tags) have[t] = (have[t] || 0) + 1;
      if (Object.keys(need).every((t) => (have[t] || 0) >= need[t])) synergies.push(syn);
    }
    const synIds = synergies.map((s) => s.id);
    if (synIds.includes('beastblood')) atkAdd += 3;
    if (synIds.includes('stonehide')) { armor += 3; knockRes = Math.max(knockRes, 0.5); }
    if (synIds.includes('skyborn')) { crit += 0.15; evade += 0.05; }
    if (synIds.includes('pondluck')) evade += 0.10;
    if (synIds.includes('gardenparty')) { haste += 0.10; crit += 0.06; }
    if (organ === 'brain') crit += 0.08;

    // The attack list: head, forearms, tail — each with its final damage.
    const attacks = [];
    for (const slot of ['head', 'front', 'tail']) {
      const part = parts[slot];
      if (part && part.attack) {
        const a = Object.assign({}, part.attack);
        a.slot = slot; a.partId = part.id; a.partName = part.name;
        a.dmg += atkAdd;
        if (synIds.includes('wildheart') && (a.kind === 'charge' || a.status === 'bleed')) a.dmg = Math.round(a.dmg * 1.3);
        attacks.push(a);
      }
    }
    return {
      plan: Object.assign({}, plan), parts, maxHp: hp, atkAdd, spd, armor, crit,
      evade: Math.min(evade, 0.45), knockRes, haste, wag, charm, stylePlus,
      move, defense, organ, synergies, attacks,
      poisonBonus: synIds.includes('venomweb') ? 1 : 0,
      poisonMul: synIds.includes('venomweb') ? 1.4 : 1.0,
    };
  }

  // A single power number for bots, draft hints and the results plaque.
  function power(b) {
    let dps = 0;
    for (const a of b.attacks) dps += (a.dmg * (a.hits || 1)) / a.cd;
    return Math.round(b.maxHp * 0.9 + dps * 22 + b.armor * 14 + b.spd * 0.35 + b.synergies.length * 60);
  }

  // "HOUND HEAD · GOAT TORSO · ..." — the build line the results screen prints.
  function buildLine(b) {
    return ['head', 'torso', 'front', 'rear', 'tail', 'organ']
      .map((s) => b.parts[s].name.toUpperCase()).join(' · ');
  }

  // Short name for the beast as a whole, from its rarest-looking part: used by banners.
  function beastTitle(b) {
    const fancy = ['head', 'tail', 'front', 'rear', 'torso'].find((s) => !b.parts[s].base);
    if (!fancy) return 'THE PUP';
    return 'THE ' + b.parts[fancy].name.split(' ')[0].toUpperCase() + '-THING';
  }

  globalThis.CP_Beasts = { build, power, buildLine, beastTitle, BASE };
})();
