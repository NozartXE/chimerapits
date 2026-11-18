// save.js — the yard's memory in localStorage: best score, the last runs (wins and losses,
// honestly kept), feats earned, and which parts and wild beasts the almanac has met.
// Falls back to plain memory when storage is unavailable (headless tests, file:// quirks).
(function () {
  if (globalThis.CP_Save) return;
  const KEY = 'chimerapits-save-v1';
  let mem = null;

  function blank() {
    return { best: 0, bestGrade: '', runs: 0, wins: 0, feats: {}, history: [], seenParts: {}, seenWild: {}, endlessBest: 0 };
  }
  function load() {
    if (mem) return mem;
    try {
      const raw = localStorage.getItem(KEY);
      mem = raw ? Object.assign(blank(), JSON.parse(raw)) : blank();
    } catch (e) { mem = blank(); }
    return mem;
  }
  function store() {
    try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* memory-only mode */ }
  }
  function recordRun(entry) {
    const s = load();
    s.runs += 1;
    if (entry.result === 'CHAMPION') s.wins += 1;
    if (entry.score > s.best) { s.best = entry.score; s.bestGrade = entry.grade; }
    if (entry.endless && entry.bouts > (s.endlessBest || 0)) s.endlessBest = entry.bouts;
    s.history.unshift(entry);
    s.history = s.history.slice(0, 6);
    store();
    return s;
  }
  function earnFeat(id) { const s = load(); if (!s.feats[id]) { s.feats[id] = 1; store(); return true; } return false; }
  function seePart(id) { const s = load(); if (!s.seenParts[id]) { s.seenParts[id] = 1; store(); } }
  function seeWild(id) { const s = load(); if (!s.seenWild[id]) { s.seenWild[id] = 1; store(); } }

  globalThis.CP_Save = { load, store, recordRun, earnFeat, seePart, seeWild, blank };
})();
