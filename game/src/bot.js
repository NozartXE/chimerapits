// bot.js — a simple honest player for the sim: prods when hurt or outnumbered, grafts
// by power and synergy. It exists so balance tests and screenshot staging can run real
// full runs headlessly — the bot plays the same rules a person does, no cheats, and
// its losses in the results history are real losses.
(function () {
  if (globalThis.CP_Bot) return;
  const Sim = globalThis.CP_Sim;
  const C = globalThis.CP_Config;

  function think(run) {
    const f = run.fight;
    if (!f || run.screen !== 'play' || f.over) return;
    const p = f.player;
    if (p.hp < p.maxHp * 0.35 && f.prodCds.treat <= 0 && run.applause >= 40) Sim.prod(run, 'treat');
    else if (f.wildAlive().length >= 2 && f.prodCds.shock <= 0 && run.applause >= 30) Sim.prod(run, 'shock');
    else if (f.wildAlive().length >= 2 && f.prodCds.rage <= 0 && run.applause >= 35 && p.hasteT <= 0) Sim.prod(run, 'rage');
  }

  function pickDraft(run) {
    let best = 0, bestScore = -1e9;
    run.offers.forEach((o, i) => {
      const s = o.powerDelta + o.newSynergies.length * 55 + (o.hpDelta > 0 ? o.hpDelta * 0.4 : 0);
      if (s > bestScore) { bestScore = s; best = i; }
    });
    return best;
  }

  // Play a whole run at fixed steps; returns a summary for tests and staging.
  function runFull(seed, diffIdx, endless, maxSeconds) {
    const run = Sim.createRun(seed, diffIdx, endless);
    Sim.startBout(run);
    const step = C.STEP;
    let t = 0, guard = 0;
    while (run.screen !== 'results' && t < (maxSeconds || 3600) && guard++ < 400000) {
      if (run.screen === 'play') { think(run); Sim.update(run, step); t += step; }
      else if (run.screen === 'draft') Sim.pickGraft(run, pickDraft(run));
      else break;
    }
    return {
      result: run.result, score: run.score, boutsWon: run.boutsWon,
      grafts: run.graftsPicked, time: Math.round(t), maxChain: run.maxChain,
      build: run.plan, screen: run.screen,
    };
  }

  globalThis.CP_Bot = { think, pickDraft, runFull };
})();
