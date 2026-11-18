// titledemo.js — the sparring match behind the title screen: a real combat-sim fight
// between a showily grafted beast (serpent head, tiger torso, mantis forearms, gull
// wings, scorpion tail, venom sac) and the bout-1 wild, rebuilt fresh whenever it
// ends. It is the game's own engine showing off, not an animation of it.
(function () {
  if (globalThis.CP_TitleDemo) return;
  const Sim = globalThis.CP_Sim;
  const Combat = globalThis.CP_Combat;
  const Beasts = globalThis.CP_Beasts;

  const SHOW_BUILD = { head: 'serpent', torso: 'tiger', front: 'mantis', rear: 'wings', tail: 'scorpion', organ: 'venomsac' };

  function make() {
    const run = Sim.createRun('title-demo', 0, false);
    run.plan = Object.assign({}, SHOW_BUILD);
    run.graftedSlots = { head: 1, torso: 1, front: 1, rear: 1, tail: 1, organ: 1 };
    const beast = Beasts.build(run.plan);
    run.vigour = beast.maxHp;
    run.fight = new Combat.Fight(run, globalThis.CP_Waves.BOUTS[3], beast);
    run.screen = 'play';
    return run;
  }

  function update(demo, dt) {
    if (!demo || !demo.fight) return null;
    demo.fight.update(dt);
    const evs = demo.fight.drainEvents();
    if (demo.fight.over) {
      demo.overT = (demo.overT || 0) + dt;
      if (demo.overT > 1.6) return make();
    }
    demo.events = evs;
    return demo;
  }

  globalThis.CP_TitleDemo = { make, update, SHOW_BUILD };
})();
