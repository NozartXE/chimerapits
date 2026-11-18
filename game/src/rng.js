// rng.js — one seeded generator (mulberry32) plus named independent streams, so a run's
// combat, draft offers and staging never steal randomness from each other and the same
// seed always replays the same run, tick for tick.
(function () {
  if (globalThis.CP_Rng) return;

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // A stream: next() float, range(a,b), int(a,b) inclusive, pick(arr), chance(p), shuffle(arr).
  function stream(seed) {
    const next = mulberry32(seed);
    return {
      next,
      range: (a, b) => a + next() * (b - a),
      int: (a, b) => a + Math.floor(next() * (b - a + 1)),
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      chance: (p) => next() < p,
      shuffle: (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
        return a;
      },
    };
  }

  // Named streams derived from one run seed: combat / draft / stage / fx (visual only).
  function streams(seedStr) {
    const base = hashStr(String(seedStr));
    return {
      combat: stream(base ^ 0xC0B47),
      draft: stream(base ^ 0xD9A17),
      stage: stream(base ^ 0x57A6E),
      fx: stream(base ^ 0xF00D5),
    };
  }

  globalThis.CP_Rng = { mulberry32, hashStr, stream, streams };
})();
