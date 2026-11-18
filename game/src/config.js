// config.js — every tuning number, the palette, the type scale and the name tables for
// CHIMERA PITS: splice a beast from grafted body parts, watch it fight a 9-bout card,
// graft it stranger after every bout. One file to balance the whole game from.
(function () {
  if (globalThis.CP_Config) return;

  const PALETTE = {
    paper: '#FFF6E9', ink: '#1E2A24', inkSoft: '#42544A',
    sand: '#EFC987', sandDeep: '#D9A75C', pit: '#E4B96E', pitDark: '#C79A4E',
    teal: '#177E6C', tealDeep: '#0E5A4C', coral: '#E4572E', coralDeep: '#B93A18',
    gold: '#FFAE00', violet: '#7C4DBD', violetDeep: '#5A34A0', sky: '#2E9BC6',
    leaf: '#3E9B4F', blood: '#C62F3B', bone: '#F3E9D2', fence: '#8A5A33',
    night: '#274156', panel: '#FFFDF6', chip: '#F7ECD4', danger: '#C62F3B',
  };

  // Type scale (fixed steps, never random sizes): wordmark down to footnote.
  const TYPE = { wordmark: 92, huge: 64, xxl: 46, xl: 34, l: 27, m: 22, s: 17, xs: 13 };

  const W = 1280, H = 800, STEP = 1 / 60;
  // The pit floor: beasts fight inside this rect; HUD lives above it, controls below.
  const PIT = { x: 90, y: 268, w: 1100, h: 452 };

  const DIFFICULTIES = [
    { id: 'gentle', name: 'GENTLE', enemyHp: 0.8, enemyDmg: 0.75, prodCd: 0.8, scoreMul: 0.8, text: 'Wild beasts tire sooner' },
    { id: 'normal', name: 'NORMAL', enemyHp: 1.0, enemyDmg: 1.0, prodCd: 1.0, scoreMul: 1.0, text: 'The card as the yard intends' },
    { id: 'brutal', name: 'BRUTAL', enemyHp: 1.25, enemyDmg: 1.3, prodCd: 1.15, scoreMul: 1.4, text: 'The wild fights back hard' },
  ];

  const STANCES = [
    { id: 'feral', name: 'FERAL', text: 'ATK +15%, armour -2', atkMul: 1.15, armor: -2, crit: 0, applauseMul: 1 },
    { id: 'guarded', name: 'GUARDED', text: 'Armour +4, ATK -10%', atkMul: 0.9, armor: 4, crit: 0, applauseMul: 1 },
    { id: 'cunning', name: 'CUNNING', text: 'Crit +12%, applause +50%', atkMul: 1.0, armor: 0, crit: 0.12, applauseMul: 1.5 },
  ];

  // Score grades for the results plaque.
  const GRADES = [
    { grade: 'S', min: 24000 }, { grade: 'A', min: 17000 }, { grade: 'B', min: 11500 },
    { grade: 'C', min: 6500 }, { grade: 'D', min: 0 },
  ];

  const SLOTS = ['head', 'torso', 'front', 'rear', 'tail', 'organ'];
  const SLOT_NAMES = { head: 'HEAD', torso: 'TORSO', front: 'FOREARMS', rear: 'HIND', tail: 'TAIL', organ: 'ORGAN' };

  const PRODS = [
    { id: 'shock', key: '1', name: 'SHOCK PROD', cost: 30, cd: 9, text: 'Stun the strongest wild beast 1.6 s' },
    { id: 'treat', key: '2', name: 'TREAT BUCKET', cost: 40, cd: 12, text: 'Your beast heals 25% of its vigour' },
    { id: 'rage', key: '3', name: 'RAGEBERRY', cost: 35, cd: 14, text: 'Attack speed +45% for 5 s' },
  ];

  // Pit moods: the yard itself reconfigures between bouts. Each mood bends the
  // fight's physics — projectile speed, chain window, knockback, cooldowns,
  // applause, venom — for BOTH sides. Bouts 1 and 9 always fight clear.
  const MOODS = [
    { id: 'clear', name: 'CLEAR SKIES', chip: '', text: 'the yard as it should be',
      move: 1, proj: 1, chainWin: 1, cd: 1, applause: 1, venomTick: 0, sting: 0, knock: 1, chargeDmg: 1 },
    { id: 'rain', name: 'DOWNPOUR', chip: 'SLOW SHOTS · LONG CHAINS · BIG SLIDES', text: 'shots fly slow, chains run long, everything slides',
      move: 1, proj: 0.72, chainWin: 1.35, cd: 1, applause: 1, venomTick: 0, sting: 0, knock: 1.3, chargeDmg: 1 },
    { id: 'heat', name: 'WHITE HEAT', chip: 'FAST CLAWS · HAPPY CROWD', text: 'fast tempers, faster claws, a generous crowd',
      move: 1.06, proj: 1, chainWin: 1, cd: 0.88, applause: 1.25, venomTick: 0, sting: 0, knock: 1, chargeDmg: 1 },
    { id: 'mire', name: 'DEEP MIRE', chip: 'SLOW BOOTS · HEAVY CHARGES', text: 'boots stick, charges land like carts',
      move: 0.85, proj: 0.9, chainWin: 1, cd: 1, applause: 1, venomTick: 0, sting: 0, knock: 1.15, chargeDmg: 1.2 },
    { id: 'swarm', name: 'BITING SWARM', chip: 'THE MIDGES PICK NO SIDE', text: 'the midges pick no side — something stings every few seconds',
      move: 1, proj: 1, chainWin: 1, cd: 1, applause: 1.1, venomTick: 0, sting: 4.5, knock: 1, chargeDmg: 1 },
    { id: 'dusk', name: 'LONG SHADOWS', chip: 'VENOM BITES DEEPER', text: 'venom and cuts bite deeper in the long light',
      move: 1, proj: 1, chainWin: 1, cd: 1, applause: 1, venomTick: 1, sting: 0, knock: 1, chargeDmg: 1 },
  ];

  globalThis.CP_Config = { PALETTE, TYPE, W, H, STEP, PIT, DIFFICULTIES, STANCES, GRADES, SLOTS, SLOT_NAMES, PRODS, MOODS };
})();
