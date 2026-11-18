// combat.js — the pit fight itself: a DOM-free, fixed-step arena simulation. Your beast
// and the wild fighters seek, circle, lunge, spit, charge and sting under one seeded
// stream; every hit, kill, stun and charm is emitted as an event the renderer turns
// into floaters, flashes and shake. Runs identically in the browser and in Node tests.
(function () {
  if (globalThis.CP_Combat) return;
  const C = globalThis.CP_Config;
  const E = globalThis.CP_Enemies;
  const W = globalThis.CP_Waves;

  let nextId = 1;

  function makeFighter(team, x, y) {
    return {
      id: nextId++, team, x, y, vx: 0, vy: 0, facing: team === 'you' ? 1 : -1,
      hp: 1, maxHp: 1, armor: 0, spd: 100, radius: 28, alive: true,
      attacks: [], statuses: [], stun: 0, hasteT: 0, hasteMul: 1, dmgMul: 1,
      evade: 0, charm: 0, knockRes: 0, defense: 'none', move: 'none', organ: null,
      digCount: 0, hitFlash: 0, animT: (nextId * 0.37) % 1, // render phase only; never feeds a sim decision
      walkPhase: 0, chargeT: 0, chargeHitDone: false, pendingHits: [], target: null,
      phase: 1, summoned: false, isBoss: false, kind: null, beast: null, name: '',
      scoreValue: 0, poisonMul: 1, poisonBonus: 0, wag: 0, stylePlus: 0, crit: 0.05,
    };
  }

  function playerFighter(run, beast) {
    const f = makeFighter('you', C.PIT.x + 240, C.PIT.y + C.PIT.h / 2);
    f.beast = beast; f.name = 'YOUR BEAST';
    f.maxHp = beast.maxHp; f.hp = run.vigour;
    f.armor = beast.armor; f.spd = beast.spd; f.evade = beast.evade; f.crit = beast.crit;
    f.knockRes = beast.knockRes; f.defense = beast.defense; f.move = beast.move; f.organ = beast.organ;
    f.charm = beast.charm; f.wag = beast.wag; f.stylePlus = beast.stylePlus;
    f.poisonMul = beast.poisonMul; f.poisonBonus = beast.poisonBonus;
    f.attacks = beast.attacks.map((a) => ({ def: a, t: 0.3 + beast.attacks.indexOf(a) * 0.35 }));
    const st = C.STANCES[run.stanceIdx];
    f.dmgMul = 1.25 * st.atkMul; f.armor += st.armor; f.crit += st.crit; // yard-trained: hits a quarter harder
    f.radius = 32;
    return f;
  }

  function wildFighter(run, kindId, boutN, x, y, elite) {
    const def = E.byId[kindId];
    const sc = W.scaleFor(boutN);
    const diff = C.DIFFICULTIES[run.diffIdx];
    const f = makeFighter('wild', x, y);
    f.kind = def; f.name = def.name; f.isBoss = !!def.boss;
    // The boss carries its own weight: it takes only a whisper of the card's scaling.
    const hpScale = def.boss ? (1 + (boutN - 1) * 0.04) * diff.enemyHp : sc.hp * diff.enemyHp;
    const dmgScale = def.boss ? (1 + (boutN - 1) * 0.02) * diff.enemyDmg : sc.dmg * diff.enemyDmg;
    f.maxHp = Math.round(def.hp * hpScale * (elite ? 2.3 : 1));
    f.hp = f.maxHp;
    f.armor = def.armor + (elite && def.id === 'cragback' ? 2 : 0);
    f.spd = def.spd * sc.spd; f.defense = def.defense || 'none';
    f.scoreValue = Math.round(def.score * 2.5 * (elite ? 2.5 : 1));
    f.radius = Math.round(27 * (def.size || 1));
    const atk = Object.assign({}, def.attack);
    atk.dmg = Math.round(atk.dmg * dmgScale);
    f.attacks = [{ def: atk, t: 0.8 }];
    if (def.charge) {
      const ch = Object.assign({}, def.charge);
      ch.dmg = Math.round(ch.dmg * dmgScale);
      f.attacks.push({ def: ch, t: 3 });
    }
    f.dmgMul = 1;
    return f;
  }

  class Fight {
    constructor(run, bout, beast) {
      this.run = run; this.bout = bout; this.rng = run.rng.combat;
      this.mood = C.MOODS.find((m) => m.id === (bout.mood || 'clear')) || C.MOODS[0];
      this.stingT = this.mood.sting ? this.mood.sting * 0.6 : 0;
      this.diff = C.DIFFICULTIES[run.diffIdx];
      this.fighters = []; this.projectiles = []; this.events = [];
      this.time = 0; this.over = false; this.won = false; this.overT = 0;
      this.chain = 0; this.chainT = 0; this.kills = 0; this.damageDealt = 0; this.damageTaken = 0;
      this.prodCds = { shock: 0, treat: 0, rage: 0 };
      this.player = playerFighter(run, beast);
      this.fighters.push(this.player);
      const stage = run.rng.stage;
      bout.foes.forEach((kindId, i) => {
        const elite = bout.elite === kindId && i === 0;
        const x = C.PIT.x + C.PIT.w - 190 - (i % 2) * 115;
        const y = C.PIT.y + C.PIT.h / 2 + (i - (bout.foes.length - 1) / 2) * 108 + stage.range(-14, 14);
        const wf = wildFighter(run, kindId, bout.n, x, Math.min(y, C.PIT.y + C.PIT.h - 70), elite);
        wf.attacks.forEach((a) => { a.t += i * 0.35; }); // stagger the first bites
        this.fighters.push(wf);
      });
      if (bout.foes.length === 0) { this.over = true; this.won = true; } // an empty card is a won card
      this.emit({ t: 'bout', name: bout.name, intro: bout.intro, mood: this.mood.id === 'clear' ? '' : this.mood.name + ' — ' + this.mood.text });
    }

    emit(e) { this.events.push(e); }
    drainEvents() { const e = this.events; this.events = []; return e; }
    wildAlive() { return this.fighters.filter((f) => f.team === 'wild' && f.alive); }

    chainWindow() { return (6 + this.player.stylePlus) * this.mood.chainWin; }
    chainMul() { return Math.min(1 + 0.5 * Math.max(0, this.chain - 1), 8); }

    addStatus(target, kind, stacks, source) {
      const ex = target.statuses.find((s) => s.kind === kind);
      const bonus = source && source.team === 'you' ? this.player.poisonBonus : 0;
      if (ex) { ex.stacks = Math.min(ex.stacks + stacks + (kind === 'poison' ? bonus : 0), 8); ex.tick = 0; }
      else target.statuses.push({ kind, stacks: stacks + (kind === 'poison' ? bonus : 0), tick: 0, fromYou: source && source.team === 'you' });
    }

    dealDamage(src, dst, dmg, opts) {
      opts = opts || {};
      if (!dst.alive || this.over) return 0;
      if (!opts.noEvade && dst.evade > 0 && this.rng.chance(dst.evade)) {
        this.emit({ t: 'floater', x: dst.x, y: dst.y - 44, text: 'MISS', color: '#2E9BC6', small: true });
        return 0;
      }
      let final = Math.max(1, Math.round(dmg - dst.armor));
      if (dst.defense === 'shell' && this.rng.chance(0.25)) {
        final = Math.max(1, Math.round(final / 2));
        this.emit({ t: 'floater', x: dst.x, y: dst.y - 44, text: 'GLANCED', color: '#D9C7A7', small: true });
      }
      const crit = !opts.noCrit && src.crit > 0 && this.rng.chance(src.crit + (opts.critBonus || 0));
      if (crit) final = Math.round(final * 1.7);
      dst.hp -= final; dst.hitFlash = 0.12;
      if (src.team === 'you') this.damageDealt += final; else this.damageTaken += final;
      this.emit({ t: 'hit', x: dst.x, y: dst.y, dmg: final, crit, kind: opts.kind || 'melee', team: dst.team });
      if (opts.status) this.addStatus(dst, opts.status, opts.statusN || 1, src);
      if (opts.knock && dst.knockRes < 1) {
        const kb = opts.knock * (1 - dst.knockRes) * this.mood.knock;
        const dx = dst.x - src.x, dy = dst.y - src.y, d = Math.hypot(dx, dy) || 1;
        dst.vx += (dx / d) * kb; dst.vy += (dy / d) * kb * 0.5;
      }
      if (dst.defense === 'spikes' && src.alive && opts.kind !== 'dot') {
        src.hp -= 4;
        this.emit({ t: 'hit', x: src.x, y: src.y, dmg: 4, crit: false, kind: 'spike', team: src.team });
        if (src.hp <= 0) this.kill(src, dst);
      }
      if (dst.hp <= 0) this.kill(dst, src);
      return final;
    }

    kill(dead, killer) {
      if (!dead.alive) return;
      dead.alive = false; dead.hp = 0;
      this.emit({ t: 'kill', x: dead.x, y: dead.y, name: dead.name, team: dead.team, boss: dead.isBoss });
      if (dead.team === 'wild' && killer && killer.team === 'you') {
        this.kills++;
        this.chain++; this.chainT = this.chainWindow();
        const gained = Math.round(dead.scoreValue * this.chainMul() * this.diff.scoreMul);
        this.run.score += gained;
        const applause = (5 + this.chain * 1.5) * (1 + this.player.wag) * (this.player.organ === 'honey' ? 1.4 : 1) * C.STANCES[this.run.stanceIdx].applauseMul * this.mood.applause;
        this.run.applause = Math.min(100, this.run.applause + applause);
        this.emit({ t: 'floater', x: dead.x, y: dead.y - 60, text: '+' + gained + (this.chain > 1 ? ' STYLE x' + this.chainMul().toFixed(1).replace('.0', '') : ''), color: '#FFAE00', big: this.chain >= 3 });
        if (this.chain >= 4) this.run.featFlags.styleChain = true;
        if (dead.isBoss) this.run.featFlags.apexSlain = true;
      }
      if (dead.team === 'you') { this.over = true; this.won = false; }
      if (this.wildAlive().length === 0 && this.player.alive) { this.over = true; this.won = true; }
    }

    prod(id) {
      const def = C.PRODS.find((p) => p.id === id);
      if (!def || this.over || this.prodCds[id] > 0 || this.run.applause < def.cost) return false;
      this.run.applause -= def.cost;
      const cdMul = this.diff.prodCd * (this.player.organ === 'brain' ? 0.65 : 1);
      this.prodCds[id] = def.cd * cdMul;
      if (id === 'shock') {
        const wild = this.wildAlive().sort((a, b) => b.hp - a.hp)[0];
        if (wild) { wild.stun = Math.max(wild.stun, 1.6); this.emit({ t: 'prod', id, x: wild.x, y: wild.y, text: 'SHOCKED' }); }
      } else if (id === 'treat') {
        const heal = Math.round(this.player.maxHp * 0.25);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
        this.emit({ t: 'prod', id, x: this.player.x, y: this.player.y, text: '+' + heal + ' VIGOUR' });
      } else if (id === 'rage') {
        this.player.hasteT = 5; this.player.hasteMul = 1.45;
        this.emit({ t: 'prod', id, x: this.player.x, y: this.player.y, text: 'RAGEBERRY!' });
      }
      return true;
    }

    fireAttack(f, atk, target) {
      const def = atk.def;
      const dx = target.x - f.x, dy = target.y - f.y, d = Math.hypot(dx, dy) || 1;
      f.facing = dx >= 0 ? 1 : -1;
      if (def.kind === 'proj') {
        this.projectiles.push({
          x: f.x + f.facing * 20, y: f.y - 16, vx: (dx / d) * 430 * this.mood.proj, vy: (dy / d) * 430 * this.mood.proj,
          team: f.team, src: f, dmg: def.dmg * f.dmgMul, status: def.status, statusN: def.statusN,
          chain: def.chain, kind: def.partId === 'eel' || def.name === 'Static Lash' ? 'zap' : 'glob', life: 1.4,
        });
        this.emit({ t: 'spit', x: f.x, y: f.y - 16, team: f.team });
        return;
      }
      if (def.kind === 'charge') {
        f.chargeT = 0.3; f.chargeAtk = def; f.chargeHitDone = false;
        f.vx = (dx / d) * f.spd * 3.4; f.vy = (dy / d) * f.spd * 1.7;
        this.emit({ t: 'charge', x: f.x, y: f.y, team: f.team });
        return;
      }
      if (def.kind === 'tongue') {
        target.x -= dx * 0.55; target.y -= dy * 0.55;
        this.dealDamage(f, target, def.dmg * f.dmgMul, { kind: 'tongue' });
        this.emit({ t: 'tongue', x: f.x, y: f.y, x2: target.x, y2: target.y });
        return;
      }
      if (def.kind === 'aoe') {
        const foes = this.fighters.filter((o) => o.alive && o.team !== f.team && Math.hypot(o.x - f.x, o.y - f.y) <= def.range + o.radius);
        for (const o of foes) this.dealDamage(f, o, def.dmg * f.dmgMul, { kind: 'aoe', knock: 130 });
        this.emit({ t: 'slam', x: f.x, y: f.y, r: def.range });
        return;
      }
      // melee / multi
      const hits = def.kind === 'multi' ? (def.hits || 2) : 1;
      for (let i = 0; i < hits; i++) f.pendingHits.push({ t: i * 0.13, def, target });
    }

    resolveHit(f, def, target) {
      if (!target.alive) return;
      let dmg = def.dmg * f.dmgMul;
      if (def.kind === 'charge') dmg *= this.mood.chargeDmg;
      if (f.organ === 'rage' && f.hp < f.maxHp * 0.5) dmg *= 1.25;
      if (def.dig) { f.digCount++; if (f.digCount % 4 === 0) dmg *= 2; }
      const opts = { kind: 'melee', status: def.status, statusN: def.statusN, critBonus: def.crit || 0 };
      if (f.move === 'kick' && def.slot === 'head') opts.knock = 150;
      if (def.kind === 'charge') opts.knock = 190;
      this.dealDamage(f, target, dmg, opts);
      if (f.organ === 'venom' && !def.status) this.addStatus(target, 'poison', 1, f);
    }

    update(dt) {
      if (this.over) { this.overT += dt; return; }
      this.time += dt;
      const rng = this.rng;
      if (this.chainT > 0) { this.chainT -= dt; if (this.chainT <= 0) this.chain = 0; }
      for (const k of Object.keys(this.prodCds)) this.prodCds[k] = Math.max(0, this.prodCds[k] - dt);

      // BITING SWARM: the midges pick a victim on their own schedule
      if (this.mood.sting) {
        this.stingT -= dt;
        if (this.stingT <= 0) {
          this.stingT = this.mood.sting;
          const alive = this.fighters.filter((f) => f.alive);
          if (alive.length) {
            const victim = alive[Math.floor(rng.next() * alive.length)];
            victim.hp -= 3; victim.hitFlash = 0.12;
            this.emit({ t: 'hit', x: victim.x, y: victim.y, dmg: 3, crit: false, kind: 'sting', team: victim.team });
            this.emit({ t: 'floater', x: victim.x, y: victim.y - 44, text: 'STUNG', color: '#7C4DBD', small: true });
            if (victim.hp <= 0) this.kill(victim, null);
          }
        }
      }

      // APEX phase changes
      const apex = this.fighters.find((f) => f.isBoss && f.alive);
      if (apex) {
        const frac = apex.hp / apex.maxHp;
        const phase = frac > 0.6 ? 1 : frac > 0.3 ? 2 : 3;
        if (phase !== apex.phase) {
          apex.phase = phase;
          this.emit({ t: 'roar', x: apex.x, y: apex.y, phase, text: phase === 2 ? 'THE CALLER WAKES' : 'FRENZY!' });
          if (this.player.alive) this.player.stun = Math.max(this.player.stun, 0.9);
          if (phase === 2 && !apex.summoned) {
            apex.summoned = true;
            for (let i = 0; i < 2; i++) {
              const pup = wildFighter(this.run, 'mirepup', this.bout.n, apex.x + (i ? 90 : -90), apex.y + 60, false);
              this.fighters.push(pup);
              this.emit({ t: 'summon', x: pup.x, y: pup.y });
            }
          }
          if (phase === 3) { apex.spd *= 1.3; apex.dmgMul = 1.25; apex.attacks.forEach((a) => { if (a.def.kind === 'charge') a.t = Math.min(a.t, 1); }); }
        }
      }

      for (const f of this.fighters) {
        if (!f.alive) continue;
        f.animT += dt; f.hitFlash = Math.max(0, f.hitFlash - dt);
        // status ticks
        for (const s of f.statuses) {
          s.tick += dt;
          if (s.tick >= 1) {
            s.tick -= 1;
            const mul = s.fromYou ? this.player.poisonMul : 1;
            this.dealDamage({ team: s.fromYou ? 'you' : 'wild', crit: 0 }, f, (s.kind === 'poison' ? 2.2 : 2) * s.stacks * mul + this.mood.venomTick * s.stacks, { kind: 'dot', noEvade: true, noCrit: true });
          }
        }
        f.statuses = f.statuses.filter((s) => f.alive);
        if (!f.alive) continue;
        // regen organ
        if (f.organ === 'regen') f.hp = Math.min(f.maxHp, f.hp + 0.7 * dt);
        // haste buff expiry
        if (f.hasteT > 0) { f.hasteT -= dt; if (f.hasteT <= 0) f.hasteMul = 1; }
        const haste = f.hasteMul * (1 + (f.beast ? f.beast.haste : 0));
        for (const a of f.attacks) a.t -= dt * haste;
        // pending multi-hits
        for (const ph of f.pendingHits) { ph.t -= dt; if (ph.t <= 0 && f.alive) this.resolveHit(f, ph.def, ph.target); }
        f.pendingHits = f.pendingHits.filter((ph) => ph.t > 0);
        // charge contact
        if (f.chargeT > 0) {
          f.chargeT -= dt;
          if (!f.chargeHitDone) {
            const foe = this.fighters.find((o) => o.alive && o.team !== f.team && Math.hypot(o.x - f.x, o.y - f.y) < f.radius + o.radius + 8);
            if (foe) { f.chargeHitDone = true; this.resolveHit(f, f.chargeAtk, foe); }
          }
        }
        if (f.stun > 0) { f.stun -= dt; f.vx *= 0.8; f.vy *= 0.8; }
        else {
          // choose target: nearest living foe
          let best = null, bd = 1e9;
          for (const o of this.fighters) {
            if (!o.alive || o.team === f.team) continue;
            const d = Math.hypot(o.x - f.x, o.y - f.y);
            if (d < bd) { bd = d; best = o; }
          }
          f.target = best;
          if (best) {
            // fire any ready attack in range (highest damage first)
            const ready = f.attacks.filter((a) => a.t <= 0)
              .sort((a, b) => (b.def.dmg * (b.def.hits || 1)) - (a.def.dmg * (a.def.hits || 1)));
            let fired = false;
            for (const a of ready) {
              const inRange = a.def.kind === 'charge' ? (bd > 70 && bd < a.def.range + best.radius)
                : bd <= a.def.range + best.radius;
              if (inRange) {
                if (f.team === 'wild' && this.player.charm > 0 && rng.chance(this.player.charm)) {
                  a.t = 0.8; this.emit({ t: 'floater', x: f.x, y: f.y - 44, text: 'DAZZLED', color: '#2E9BC6', small: true });
                } else {
                  this.fireAttack(f, a, best);
                  a.t = a.def.cd * (f.move === 'springs' && f.chargeT > 0 ? 0.6 : 1) * this.mood.cd;
                }
                fired = true; break;
              }
            }
            // movement: approach to primary range; spitters keep their distance
            const primary = f.attacks[0].def;
            const want = primary.kind === 'proj' ? 250 : primary.range * 0.85;
            const dx = best.x - f.x, dy = best.y - f.y, d = Math.hypot(dx, dy) || 1;
            let mx = 0, my = 0;
            if (f.chargeT <= 0) {
              if (d > want + 6) { mx = dx / d; my = dy / d; }
              else if (primary.kind === 'proj' && d < 170) { mx = -dx / d; my = -dy / d; }
              f.vx += (mx * f.spd * this.mood.move - f.vx) * Math.min(1, dt * 7);
              f.vy += (my * f.spd * 0.72 * this.mood.move - f.vy) * Math.min(1, dt * 7);
              if (mx !== 0) f.facing = mx > 0 ? 1 : -1;
              f.walkPhase += dt * (Math.abs(f.vx) + Math.abs(f.vy)) * 0.045;
            }
          }
        }
        // integrate + separation + pit bounds
        f.x += f.vx * dt; f.y += f.vy * dt;
        if (f.chargeT <= 0) { f.vx *= Math.pow(0.0015, dt); f.vy *= Math.pow(0.0015, dt); }
        for (const o of this.fighters) {
          if (o === f || !o.alive) continue;
          const dx = f.x - o.x, dy = f.y - o.y, d = Math.hypot(dx, dy);
          const min = f.radius + o.radius - 6;
          if (d > 0 && d < min) { f.x += (dx / d) * (min - d) * 0.4; f.y += (dy / d) * (min - d) * 0.4; }
        }
        f.x = Math.max(C.PIT.x + f.radius, Math.min(C.PIT.x + C.PIT.w - f.radius, f.x));
        f.y = Math.max(C.PIT.y + f.radius * 0.7, Math.min(C.PIT.y + C.PIT.h - f.radius * 0.5, f.y));
      }

      // projectiles
      for (const p of this.projectiles) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        const foe = this.fighters.find((o) => o.alive && o.team !== p.team && Math.hypot(o.x - p.x, (o.y - 14) - p.y) < o.radius + 8);
        if (foe) {
          p.life = 0;
          this.dealDamage(p.src, foe, p.dmg, { kind: 'proj', status: p.status, statusN: p.statusN });
          if (p.chain) {
            const second = this.fighters.find((o) => o.alive && o.team !== p.team && o !== foe && Math.hypot(o.x - foe.x, o.y - foe.y) < 190);
            if (second) this.dealDamage(p.src, second, p.dmg * 0.6, { kind: 'proj' });
          }
          this.emit({ t: 'splat', x: foe.x, y: foe.y - 14, kind: p.kind });
        }
      }
      this.projectiles = this.projectiles.filter((p) => p.life > 0);
      // sync the player's persistent vigour
      if (this.player) this.run.vigour = Math.max(0, Math.round(this.player.hp));
    }
  }

  globalThis.CP_Combat = { Fight, playerFighter, wildFighter };
})();
