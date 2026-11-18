// feats.js — the nine yard feats: run-based honours checked by the sim at bout end and
// run end, shown on the title screen, the results plaque and the almanac. Each feat is
// a small promise about a way the game can be played, not a participation sticker.
(function () {
  if (globalThis.CP_Feats) return;
  const FEATS = [
    { id: 'firstblood', name: 'FIRST BLOOD', short: 'FIRST', text: 'Win your first bout' },
    { id: 'fullhouse', name: 'FULL HOUSE', short: 'FULL', text: 'Wear a graft in all six slots at once' },
    { id: 'shapeshifter', name: 'SHAPESHIFTER', short: 'SHIFTER', text: 'Graft the same slot three times in one run' },
    { id: 'untouched', name: 'UNTOUCHED', short: 'CLEAN', text: 'Win a bout without taking a single hit' },
    { id: 'style', name: 'STYLE BY FIVE', short: 'STYLE', text: 'Chain five kills inside the style window' },
    { id: 'crowd', name: 'CROWD FAVOURITE', short: 'CROWD', text: 'End a bout with the applause meter full' },
    { id: 'handsoff', name: 'HANDS OFF', short: 'HANDS', text: 'Win five bouts in a run without one prod' },
    { id: 'apexslayer', name: 'APEX SLAYER', short: 'APEX', text: 'Bring down APEX, THE UNSPLICED' },
    { id: 'wildthing', name: 'WILD THING', short: 'WILD', text: 'Survive ten bouts of THE WILD (endless)' },
  ];
  const byId = {};
  for (const f of FEATS) byId[f.id] = f;
  globalThis.CP_Feats = { FEATS, byId };
})();
