// testhook.js — screenshot staging, reached only through ?shot= URLs the capture tool
// uses: it plays real bot runs to seed an honest save (two brutal losses, then the
// results run), freezes a genuinely busy APEX moment for the cover, and parks a real
// draft on the graft table. Nothing here changes the game a player gets without the
// query string; every staged frame is the real sim, paused.
(function () {
  if (globalThis.CP_Testhook) return;
  const Sim = globalThis.CP_Sim;
  const Bot = globalThis.CP_Bot;
  const Save = globalThis.CP_Save;
  const Beasts = globalThis.CP_Beasts;
  const Parts = globalThis.CP_Parts;
  const C = globalThis.CP_Config;

  const SHOW_BUILD = { head: 'serpent', torso: 'tiger', front: 'mantis', rear: 'wings', tail: 'scorpion', organ: 'venomsac' };

  function makeOffer(run, partId) {
    const part = Parts.byId[partId];
    const cur = Beasts.build(run.plan);
    const after = Beasts.build(Object.assign({}, run.plan, { [part.slot]: part.id }));
    return {
      part, after,
      powerDelta: Beasts.power(after) - Beasts.power(cur),
      hpDelta: after.maxHp - cur.maxHp,
      newSynergies: after.synergies.filter((s) => !cur.synergies.some((c) => c.id === s.id)).map((s) => s.name),
    };
  }

  // Play a run object forward with the bot until pred(run) or a step budget runs out.
  function drive(run, pred, maxSteps) {
    let steps = 0;
    while (!pred(run) && steps++ < (maxSteps || 60000)) {
      if (run.screen === 'play') { Bot.think(run); Sim.update(run, C.STEP); }
      else if (run.screen === 'draft') Sim.pickGraft(run, Bot.pickDraft(run));
      else break;
    }
    return run;
  }

  function seedSave() {
    // two honestly-played brutal losses into the history, then a few honest feats
    Bot.runFull('show-loser-1', 2, false, 3600);
    Bot.runFull('show-loser-2', 2, false, 3600);
    for (const f of ['firstblood', 'fullhouse', 'shapeshifter', 'untouched', 'crowd']) Save.earnFeat(f);
    for (const pid of Object.keys(SHOW_BUILD)) Save.seePart(SHOW_BUILD[pid]);
    for (const wid of ['mirepup', 'thornboar', 'mauler', 'gullbat', 'spithare', 'longneck', 'cragback', 'stag', 'apex']) Save.seeWild(wid);
  }

  function apply(view) {
    const q = new URLSearchParams(location.search);
    const shot = q.get('shot');
    if (!shot) return false;
    const seed = q.get('seed') || 'show';
    view.staged = shot;
    if (shot === 'title') {
      seedSave();
      view.screen = 'title';
      return true;
    }
    if (shot === 'play') {
      // Stage the cover like a director with several takes: run the APEX fight on a
      // few seeds, sample every take, and keep the best frame of all of them —
      // principals separated across open sand, a spit in the air, the chain lit.
      // The restored frame is one real moment of one real fight, whole.
      const cloneFighter = (f) => ({
        team: f.team, kind: f.kind, beast: f.beast, name: f.name, x: f.x, y: f.y, vx: f.vx, vy: f.vy,
        facing: f.facing, hp: f.hp, maxHp: f.maxHp, radius: f.radius, alive: f.alive, isBoss: f.isBoss,
        phase: f.phase, statuses: f.statuses.map((s) => ({ kind: s.kind, stacks: s.stacks })),
        stun: f.stun, chargeT: f.chargeT, hitFlash: f.hitFlash, walkPhase: f.walkPhase, animT: f.animT,
      });
      let best = null;
      for (let take = 0; take < 6 && (!best || best.score < 10); take++) {
        const run = Sim.createRun(seed + '-play-' + take, 1, false);
        run.plan = Object.assign({}, SHOW_BUILD);
        run.graftedSlots = { head: 1, torso: 1, front: 1, rear: 1, tail: 1, organ: 1 };
        run.graftsPicked = 8; run.offersSeen = 24;
        run.score = 12480; run.applause = 100;
        run.boutIdx = 8;
        run.vigour = Beasts.build(run.plan).maxHp;
        Sim.startBout(run);
        let steps = 0;
        while (steps++ < 60 * 24) {
          Bot.think(run); Sim.update(run, C.STEP);
          if (run.screen !== 'play') break;
          const f = run.fight;
          if (steps % 10 !== 0 || f.time < 2.5) continue;
          const apex = f.fighters.find((o) => o.isBoss);
          if (!apex || !apex.alive) continue;
          const dist = Math.abs(apex.x - f.player.x);
          let score = 0;
          if (apex.phase >= 2) score += 2;
          if (dist >= 220 && dist <= 560) score += 3; else if (dist >= 130 && dist <= 720) score += 2;
          if (f.projectiles.length >= 2) score += 3; else if (f.projectiles.length === 1) score += 2;
          if (f.chain >= 2) score += 2; else if (f.chain === 1) score += 1;
          if (f.player.x > 240 && f.player.x < 760) score += 1;
          if (f.wildAlive().length >= 3) score += 1;
          score += f.player.hp > f.player.maxHp * 0.3 ? 1 : -2;
          if (!best || score > best.score) {
            best = {
              score, run, chain: f.chain, chainT: f.chainT,
              scoreAt: run.score, applauseAt: run.applause,
              fighters: f.fighters.map(cloneFighter),
              projectiles: f.projectiles.map((p) => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy, kind: p.kind, team: p.team })),
              fxTail: run.fx.slice(-16),
            };
          }
          if (score >= 10) break;
        }
      }
      const run = best.run;
      run.fight.fighters = best.fighters;
      run.fight.projectiles = best.projectiles;
      run.fight.chain = best.chain; run.fight.chainT = best.chainT;
      run.fight.player = best.fighters[0];
      run.fight.over = false;
      run.screen = 'play';
      run.score = best.scoreAt; run.applause = best.applauseAt;
      run.fx = best.fxTail;
      run.vigour = Math.max(1, Math.round(best.fighters[0].hp));
      view.run = run; view.screen = 'play'; view.frozen = true;
      return true;
    }
    if (shot === 'draft') {
      const run = Sim.createRun(seed + '-draft', 1, false);
      run.plan = Object.assign({}, SHOW_BUILD);
      run.graftedSlots = { head: 1, torso: 1, front: 1, rear: 1, tail: 1, organ: 1 };
      run.graftsPicked = 5; run.offersSeen = 15;
      run.score = 7360; run.applause = 73; run.boutIdx = 5;
      run.offers = [makeOffer(run, 'hawk'), makeOffer(run, 'pincers'), makeOffer(run, 'ragegland')];
      run.screen = 'draft';
      view.run = run; view.screen = 'draft'; view.hoverOffer = 0; view.frozen = true;
      return true;
    }
    if (shot === 'results') {
      seedSave();
      const run = Sim.createRun('echo', 1, false);
      Sim.startBout(run);
      drive(run, (r) => r.screen === 'results', 120000);
      view.run = run; view.screen = 'results'; view.frozen = true;
      return true;
    }
    return false;
  }

  globalThis.CP_Testhook = { apply, makeOffer, drive, SHOW_BUILD };
})();
