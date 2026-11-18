// waves.js — the 9-bout card the yard runs every night: compositions, elite "bruiser"
// bouts at 3 and 6, first-appearance banners for each wild kind, and the stat scaling
// that keeps late bouts honest. Endless mode (THE WILD) generates bouts past the card.
(function () {
  if (globalThis.CP_Waves) return;

  const BOUTS = [
    { n: 1, name: 'FIRST TEETH', foes: ['mirepup', 'mirepup', 'mirepup'],
      intro: 'Three mire pups. A gentle first argument.' },
    { n: 2, name: 'THORN IN THE SIDE', foes: ['mirepup', 'mirepup', 'thornboar'], mood: 'rain',
      intro: 'NEW: THORN BOAR — charges in straight lines. Sidestep it.', newKind: 'thornboar' },
    { n: 3, name: 'BRUISER BOUT', foes: ['mauler', 'mirepup'], elite: 'mauler', mood: 'heat',
      intro: 'BRUISER: a mauler twice-fed. It hits in twos — keep moving.' },
    { n: 4, name: 'SKY TROUBLE', foes: ['gullbat', 'gullbat', 'gullbat', 'spithare'], mood: 'swarm',
      intro: 'NEW: GULL BATS dive fast; the SPIT HARE argues from range.', newKind: 'gullbat' },
    { n: 5, name: 'THE LONG GAME', foes: ['longneck', 'thornboar', 'mirepup', 'mirepup'], mood: 'mire',
      intro: 'NEW: LONGNECK — its spit reaches across the pit.', newKind: 'longneck' },
    { n: 6, name: 'THE GATE', foes: ['cragback', 'gullbat', 'gullbat'], elite: 'cragback', mood: 'dusk',
      intro: 'BRUISER: CRAGBACK THE GATE. Shell halves one hit in four — charges crack it.' },
    { n: 7, name: 'CUTLERY SEASON', foes: ['stag', 'stag', 'spithare', 'gullbat'], mood: 'rain',
      intro: 'NEW: RAZOR STAG — antlers open bleeding cuts.', newKind: 'stag' },
    { n: 8, name: 'THE WHOLE WILD', foes: ['mauler', 'stag', 'longneck', 'thornboar'], mood: 'heat',
      intro: 'Everything the wild has, at once. One bout from the APEX.' },
    { n: 9, name: 'THE APEX', foes: ['apex'],
      intro: 'APEX, THE UNSPLICED. Three tempers: Stalker, Caller, Frenzy.' },
  ];

  // Per-bout scaling for wild stats (the card's difficulty slope).
  function scaleFor(boutN) {
    return { hp: 1 + (boutN - 1) * 0.13, dmg: 1 + (boutN - 1) * 0.05, spd: 1 + (boutN - 1) * 0.012 };
  }

  // Endless bouts past 9: seeded mixes that keep growing teeth.
  function endlessBout(n, rng) {
    const pool = ['mirepup', 'thornboar', 'gullbat', 'spithare', 'stag', 'longneck', 'mauler', 'cragback'];
    const count = Math.min(3 + Math.floor((n - 10) / 2), 6);
    const foes = [];
    for (let i = 0; i < count; i++) foes.push(rng.pick(pool));
    if (n % 5 === 4) foes.push('apex');
    const mood = rng.pick(['clear', 'rain', 'heat', 'mire', 'swarm', 'dusk']);
    return { n, name: 'WILD BOUT ' + (n - 9), foes, mood, intro: 'The wild keeps coming. So does the applause.', endless: true };
  }

  globalThis.CP_Waves = { BOUTS, scaleFor, endlessBout };
})();
