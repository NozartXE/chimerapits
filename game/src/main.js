// main.js — boots the game, owns the screen state (title / howto / almanac / the run's
// own play, draft and results), runs the fixed-step loop, routes every button and key
// the renderers and input.js produce, and paints each frame in a fixed order: board,
// beasts by depth, effects, HUD, banner. Sound starts on the first gesture, as
// browsers insist.
(function () {
  const C = globalThis.CP_Config;
  const Sim = globalThis.CP_Sim;
  const Save = globalThis.CP_Save;
  const Audio = globalThis.CP_Audio;

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const view = {
    screen: 'title', run: null, demo: null, buttons: {}, hover: null, hoverOffer: null,
    mouse: { x: 0, y: 0 }, diffIdx: 1, endless: false, muted: false, paused: false,
    fx: globalThis.CP_Fx.makeFx(), banner: globalThis.CP_Banner.makeBanner(),
    t: 0, frozen: false, staged: null, lastMusic: '',
  };
  view.demo = globalThis.CP_TitleDemo.make();

  function newRun() {
    const save = Save.load();
    const seed = 'night-' + (save.runs + 1) + '-' + Math.floor(Math.random() * 9000 + 1000);
    const run = Sim.createRun(seed, view.diffIdx, view.endless);
    Sim.startBout(run);
    view.run = run;
    view.screen = 'play';
    view.fx = globalThis.CP_Fx.makeFx();
    view.banner = globalThis.CP_Banner.makeBanner();
    view.paused = false;
  }

  function toTitle() {
    view.screen = 'title'; view.run = null;
    view.demo = globalThis.CP_TitleDemo.make();
  }

  function onButton(id) {
    Audio.ensure(); Audio.sfx('click');
    if (view.screen === 'title') {
      if (id === 'play') newRun();
      else if (id === 'howto') view.screen = 'howto';
      else if (id === 'almanac') view.screen = 'almanac';
      else if (id === 'wild') view.endless = !view.endless;
      else if (id.startsWith('diff')) view.diffIdx = parseInt(id.slice(4), 10);
      return;
    }
    if (!view.run) return;
    if (view.run.screen === 'play') {
      if (id.startsWith('prod_')) { if (Sim.prod(view.run, id.slice(5))) Audio.sfx('prod'); }
    } else if (view.run.screen === 'draft') {
      if (id.startsWith('offer')) {
        if (Sim.pickGraft(view.run, parseInt(id.slice(5), 10))) { Audio.sfx('graft'); view.hoverOffer = null; }
      } else if (id === 'reroll') { if (Sim.reroll(view.run)) Audio.sfx('click'); }
      else if (id.startsWith('stance')) view.run.stanceIdx = parseInt(id.slice(6), 10);
    } else if (view.run.screen === 'results') {
      if (id === 'again') newRun();
    }
  }

  function onKey(key) {
    Audio.ensure();
    const k = key.toLowerCase();
    if (k === 'm') { view.muted = !view.muted; Audio.setMuted(view.muted); return; }
    if (view.screen === 'howto' || view.screen === 'almanac') {
      if (k === 'Escape' || k === 'Enter') view.screen = 'title';
      return;
    }
    if (view.screen === 'title') {
      if (k === 'Enter' || k === ' ') newRun();
      return;
    }
    if (!view.run) return;
    if (view.run.screen === 'play') {
      if (k === '1') Sim.prod(view.run, 'shock');
      else if (k === '2') Sim.prod(view.run, 'treat');
      else if (k === '3') Sim.prod(view.run, 'rage');
      else if (k === 'q') { if (Sim.markStrongest(view.run)) Audio.sfx('prod'); }
      else if (k === 'z') view.run.stanceIdx = (view.run.stanceIdx + 2) % 3;
      else if (k === 'c') view.run.stanceIdx = (view.run.stanceIdx + 1) % 3;
      else if (k === 'p') view.paused = !view.paused;
    } else if (view.run.screen === 'draft') {
      if (k === '1' || k === '2' || k === '3') { if (Sim.pickGraft(view.run, parseInt(k, 10) - 1)) Audio.sfx('graft'); }
      else if (k === 'x') Sim.reroll(view.run);
      else if (k === 'z') view.run.stanceIdx = (view.run.stanceIdx + 2) % 3;
      else if (k === 'c') view.run.stanceIdx = (view.run.stanceIdx + 1) % 3;
    } else if (view.run.screen === 'results') {
      if (k === 'r') newRun();
      else if (k === 'Escape') toTitle();
    }
  }

  function onClick(p) {
    if (!view.run || view.run.screen !== 'play' || view.frozen || view.paused) return;
    if (Sim.markAt(view.run, p.x, p.y)) Audio.sfx('prod');
  }

  globalThis.CP_Input.attach(canvas, view, { onButton, onKey, onClick });

  // ---- frame construction ------------------------------------------------------
  function drawFight(ctx, fight, fx) {
    globalThis.CP_Board.draw(ctx, view.t, fight.mood ? fight.mood.id : 'clear');
    globalThis.CP_Fx.drawWorld(ctx, fx, fight);
    const sorted = fight.fighters.filter((f) => f.alive).slice().sort((a, b) => a.y - b.y);
    for (const f of sorted) {
      if (f.team === 'you') globalThis.CP_BeastView.drawBeast(ctx, f.beast.plan, f, 1.12, {});
      else globalThis.CP_WildView.drawWild(ctx, f.kind, f, (f.kind.size || 1) * 0.98);
    }
    globalThis.CP_Hud.drawBars(ctx, fight);
    // the mark: coral corner brackets on the beast the player has ordered hunted
    if (fight.markedId) {
      const m = fight.fighters.find((f) => f.id === fight.markedId && f.alive);
      if (m) {
        const r = m.radius + 16, cx = m.x, cy = m.y - 14, L = 15;
        ctx.strokeStyle = '#E4572E'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          ctx.beginPath();
          ctx.moveTo(cx + sx * r - sx * L, cy + sy * r); ctx.lineTo(cx + sx * r, cy + sy * r); ctx.lineTo(cx + sx * r, cy + sy * r - sy * L);
          ctx.stroke();
        }
        globalThis.CP_Fit.draw(ctx, 'MARKED', cx, cy - r - 12, 14.5, '#E4572E', 'center', true);
      }
    }
    globalThis.CP_Fx.drawFloaters(ctx, fx);
  }

  function draw() {
    ctx.save();
    if (view.fx.shake > 0.2) ctx.translate((Math.random() - 0.5) * view.fx.shake, (Math.random() - 0.5) * view.fx.shake);
    view.buttons = {};
    if (view.screen === 'title') {
      if (view.demo && view.demo.fight) drawFight(ctx, view.demo.fight, view.fx);
      else globalThis.CP_Board.draw(ctx, view.t);
      ctx.fillStyle = 'rgba(255,246,233,0.16)'; ctx.fillRect(0, 0, C.W, C.H);
      globalThis.CP_Title.draw(ctx, view);
    } else if (view.screen === 'howto') {
      globalThis.CP_Howto.draw(ctx, view);
    } else if (view.screen === 'almanac') {
      globalThis.CP_Almanac.draw(ctx, view);
    } else if (view.run) {
      if (view.run.screen === 'play') {
        drawFight(ctx, view.run.fight, view.fx);
        globalThis.CP_Hud.draw(ctx, view, view.run);
        globalThis.CP_Banner.draw(ctx, view.banner);
        if (view.paused) {
          ctx.fillStyle = 'rgba(30,42,36,0.55)'; ctx.fillRect(0, 0, C.W, C.H);
          globalThis.CP_Fit.draw(ctx, 'PAUSED', 640, 400, 54, '#FFF6E9', 'center', true, 0, true);
        }
      } else if (view.run.screen === 'draft') {
        globalThis.CP_Board.draw(ctx, view.t);
        globalThis.CP_DraftScreen.draw(ctx, view, view.run);
      } else if (view.run.screen === 'results') {
        globalThis.CP_Board.draw(ctx, view.t);
        globalThis.CP_Results.draw(ctx, view, view.run);
      }
    }
    ctx.restore();
    if (view.fx.flash > 0) { ctx.fillStyle = 'rgba(255,246,233,' + view.fx.flash * 0.5 + ')'; ctx.fillRect(0, 0, C.W, C.H); }
  }

  // ---- the loop ------------------------------------------------------------------
  let last = performance.now(), musicMode = '';
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    view.t += dt;
    if (!view.frozen) {
      if (view.screen === 'title' && view.demo) {
        const before = view.demo;
        view.demo = globalThis.CP_TitleDemo.update(view.demo, dt) || before;
        if (view.demo.events) { globalThis.CP_Fx.consume(view.fx, view.demo.events); view.demo.events = null; }
      } else if (view.run && view.run.screen === 'play' && !view.paused) {
        Sim.update(view.run, dt);
        const evs = view.run.fx.splice(0, view.run.fx.length);
        globalThis.CP_Fx.consume(view.fx, evs);
        globalThis.CP_Banner.consume(view.banner, evs, view.run.fight);
        for (const e of evs) {
          if (e.t === 'hit') Audio.sfx(e.crit ? 'crit' : 'hit');
          else if (e.t === 'kill') Audio.sfx(e.boss ? 'roar' : 'kill');
          else if (e.t === 'roar') Audio.sfx('roar');
          else if (e.t === 'slam') Audio.sfx('slam');
          else if (e.t === 'charge') Audio.sfx('charge');
          else if (e.t === 'spit') Audio.sfx('spit');
        }
        if (view.run.screen === 'results') Audio.sfx(view.run.result === 'CHAMPION' ? 'win' : 'lose');
        view.screen = view.run.screen === 'play' ? 'play' : view.run.screen;
      } else if (view.run) {
        view.screen = view.run.screen;
      }
      globalThis.CP_Fx.update(view.fx, dt);
      globalThis.CP_Banner.update(view.banner, dt);
    } else if (view.fxFrozen) {
      // staged frame: floaters hold still, but the crowd and previews keep breathing
      globalThis.CP_Banner.update(view.banner, dt);
    }
    const wantMusic = view.screen === 'play' ? 'fast' : 'calm';
    if (wantMusic !== musicMode && !view.staged) { musicMode = wantMusic; Audio.startMusic(wantMusic === 'fast'); }
    draw();
  }

  if (!globalThis.CP_Testhook.apply(view)) {
    // plain boot: title screen, demo running
  } else if (view.screen === 'play' && view.run) {
    // staged play: pump the staged events into fx once, advance them a beat, then
    // hold them — the frozen frame keeps its floaters and sparks at capture time.
    globalThis.CP_Fx.consume(view.fx, view.run.fx.splice(0, view.run.fx.length));
    globalThis.CP_Fx.update(view.fx, 0.3);
    view.fxFrozen = true;
  }
  requestAnimationFrame(frame);
})();
