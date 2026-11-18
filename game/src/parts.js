// parts.js — the graft catalogue: 36 body parts across 6 slots (head, torso, forearms,
// hind, tail, organ). Every part is a real mechanical choice — its own attack, trait or
// passive, its own colours for the renderer, and synergy tags the graft draft reasons
// about. The starting Pup is assembled from the six base parts at the top of each slot.
(function () {
  if (globalThis.CP_Parts) return;

  // attack: { name, kind: melee|proj|charge|aoe|multi|tongue, dmg, cd (s), range (px),
  //           status: poison|bleed, statusN, crit bonus, note }
  const PARTS = [
    // ---- HEAD: the primary attack -------------------------------------------
    { id: 'hound', slot: 'head', name: 'Hound Head', base: true, hp: 6, atk: 1, spd: 4, armor: 0,
      attack: { name: 'Snap Bite', kind: 'melee', dmg: 9, cd: 0.9, range: 48 },
      tags: ['beast'], colors: { main: '#C98A4B', dark: '#8A5A33', accent: '#FFF6E9' },
      blurb: 'Loyal teeth. The bite every Pup starts with.' },
    { id: 'ramhorn', slot: 'head', name: 'Ram Horns', hp: 10, atk: 2, spd: 0, armor: 1,
      attack: { name: 'Headlong Charge', kind: 'charge', dmg: 17, cd: 3.4, range: 210 },
      tags: ['wild'], colors: { main: '#D9C7A7', dark: '#9A8560', accent: '#7C4DBD' },
      blurb: 'Lowers its head and the whole pit hears it land.' },
    { id: 'serpent', slot: 'head', name: 'Serpent Head', hp: 0, atk: 1, spd: 2, armor: 0,
      attack: { name: 'Venom Spit', kind: 'proj', dmg: 7, cd: 1.6, range: 320, status: 'poison', statusN: 2 },
      tags: ['venom'], colors: { main: '#3E9B4F', dark: '#256B34', accent: '#FFAE00' },
      blurb: 'Fights from across the pit, one green glob at a time.' },
    { id: 'hawk', slot: 'head', name: 'Hawk Head', hp: 0, atk: 2, spd: 8, armor: 0,
      attack: { name: 'Dive Peck', kind: 'melee', dmg: 7, cd: 0.65, range: 48, crit: 0.25 },
      tags: ['sky'], colors: { main: '#E8E3D5', dark: '#8E887A', accent: '#E4572E' },
      blurb: 'Fast, mean, and always pecking at the eyes.' },
    { id: 'boartusk', slot: 'head', name: 'Tusked Boar Head', hp: 12, atk: 2, spd: -2, armor: 1,
      attack: { name: 'Gore', kind: 'melee', dmg: 13, cd: 1.35, range: 50, status: 'bleed', statusN: 2 },
      tags: ['wild'], colors: { main: '#7A6A58', dark: '#4E4237', accent: '#F3E9D2' },
      blurb: 'Tusks that open wounds the fight keeps paying for.' },
    { id: 'frog', slot: 'head', name: 'Frog Head', hp: 2, atk: 0, spd: 2, armor: 0,
      attack: { name: 'Tongue Yank', kind: 'tongue', dmg: 5, cd: 2.4, range: 200 },
      tags: ['pond'], colors: { main: '#7FC24F', dark: '#4E8A2E', accent: '#FF7FA5' },
      blurb: 'Drags ranged pests into biting range. Rude, effective.' },

    // ---- TORSO: the frame — health, armour, defensive traits ------------------
    { id: 'goat', slot: 'torso', name: 'Goat Torso', base: true, hp: 10, atk: 0, spd: 2, armor: 1,
      tags: ['beast'], colors: { main: '#D9C7A7', dark: '#A08B64', accent: '#8A5A33' },
      blurb: 'Scruffy, stubborn, standard issue.' },
    { id: 'bear', slot: 'torso', name: 'Bear Torso', hp: 58, atk: 1, spd: -6, armor: 3,
      tags: ['beast'], colors: { main: '#8A5A33', dark: '#5E3C20', accent: '#D9A75C' },
      blurb: 'A wall of winter fat and opinions.' },
    { id: 'shell', slot: 'torso', name: 'Cragback Shell', hp: 38, atk: 0, spd: -10, armor: 6, defense: 'shell',
      tags: ['stone'], colors: { main: '#6E8B6A', dark: '#47603F', accent: '#D9C7A7' },
      blurb: 'One hit in four glances off the shell for half.' },
    { id: 'tiger', slot: 'torso', name: 'Tiger Torso', hp: 18, atk: 4, spd: 6, armor: 1,
      tags: ['beast'], colors: { main: '#E8862E', dark: '#B35A14', accent: '#1E2A24' },
      blurb: 'Stripes the crowd can spot from the back row.' },
    { id: 'rhino', slot: 'torso', name: 'Rhino Torso', hp: 72, atk: 1, spd: -8, armor: 3, knockRes: 0.7,
      tags: ['wild', 'stone'], colors: { main: '#9AA3A8', dark: '#6B747A', accent: '#E8E3D5' },
      blurb: 'Hide like a gate. Barely notices being shoved.' },
    { id: 'quill', slot: 'torso', name: 'Quill Torso', hp: 24, atk: 1, spd: 0, armor: 2, defense: 'spikes',
      tags: ['wild'], colors: { main: '#5E4A38', dark: '#3A2C20', accent: '#F3E9D2' },
      blurb: 'Everything that bites it leaves bleeding.' },

    // ---- FOREARMS: the secondary attack ---------------------------------------
    { id: 'paws', slot: 'front', name: 'Pup Paws', base: true, hp: 0, atk: 0, spd: 2, armor: 0,
      attack: { name: 'Paw Swipe', kind: 'melee', dmg: 5, cd: 0.8, range: 44 },
      tags: ['beast'], colors: { main: '#C98A4B', dark: '#8A5A33', accent: '#FFF6E9' },
      blurb: 'Honest paws. They try their best.' },
    { id: 'pincers', slot: 'front', name: 'Crab Pincers', hp: 6, atk: 1, spd: -2, armor: 2,
      attack: { name: 'Double Snap', kind: 'multi', dmg: 5, hits: 2, cd: 1.4, range: 46 },
      tags: ['pond'], colors: { main: '#E4572E', dark: '#B93A18', accent: '#FFD9A0' },
      blurb: 'Two snaps for the price of one, plus shell.' },
    { id: 'mantis', slot: 'front', name: 'Mantis Blades', hp: 0, atk: 3, spd: 4, armor: 0,
      attack: { name: 'Scythe Cut', kind: 'melee', dmg: 12, cd: 1.5, range: 52, crit: 0.2 },
      tags: ['garden'], colors: { main: '#5FA84F', dark: '#3A7030', accent: '#E8FFD9' },
      blurb: 'Folded green knives. Surgeons of the pit.' },
    { id: 'mole', slot: 'front', name: 'Mole Claws', hp: 4, atk: 2, spd: 0, armor: 1,
      attack: { name: 'Digging Rake', kind: 'melee', dmg: 8, cd: 1.05, range: 44, dig: true },
      tags: ['stone'], colors: { main: '#6B5A6E', dark: '#463A49', accent: '#D9C7A7' },
      blurb: 'Every fourth rake digs twice as deep.' },
    { id: 'spiderarms', slot: 'front', name: 'Spider Arms', hp: 0, atk: 1, spd: 6, armor: 0,
      attack: { name: 'Flurry Taps', kind: 'multi', dmg: 3, hits: 3, cd: 1.55, range: 46 },
      tags: ['garden'], colors: { main: '#4A3A5E', dark: '#2E2440', accent: '#B79CED' },
      blurb: 'Three taps, three chances to crit and poison.' },
    { id: 'stomper', slot: 'front', name: 'Stomper Foreleg', hp: 14, atk: 2, spd: -4, armor: 2,
      attack: { name: 'Ground Stomp', kind: 'aoe', dmg: 9, cd: 2.3, range: 74 },
      tags: ['stone'], colors: { main: '#A89A86', dark: '#776A58', accent: '#F3E9D2' },
      blurb: 'One leg like a fence post. The pit shakes.' },

    // ---- HIND: how the beast moves — dashes, kicks, evasions -------------------
    { id: 'hooves', slot: 'rear', name: 'Kid Hooves', base: true, hp: 0, atk: 0, spd: 4, armor: 0, move: 'none',
      tags: ['beast'], colors: { main: '#A08B64', dark: '#77653F', accent: '#F3E9D2' },
      blurb: 'Clip-clop. Perfectly adequate hooves.' },
    { id: 'wings', slot: 'rear', name: 'Gull Wings', hp: 0, atk: 1, spd: 10, armor: 0, move: 'wings', evade: 0.15,
      tags: ['sky'], colors: { main: '#E8F1F5', dark: '#A9C3CE', accent: '#2E9BC6' },
      blurb: 'Short hops that read as flight to a kind crowd.' },
    { id: 'roolegs', slot: 'rear', name: 'Roo Legs', hp: 8, atk: 2, spd: 6, armor: 0, move: 'kick',
      tags: ['wild'], colors: { main: '#C98A4B', dark: '#96622F', accent: '#F3E9D2' },
      blurb: 'Every head attack lands with a kick behind it.' },
    { id: 'springs', slot: 'rear', name: 'Spring Coils', hp: 0, atk: 1, spd: 8, armor: 0, move: 'springs',
      tags: ['gadget'], colors: { main: '#B9C0C7', dark: '#7E8891', accent: '#E4572E' },
      blurb: 'Boing. Attacks right after a pounce come out faster.' },
    { id: 'fins', slot: 'rear', name: 'Eel Fins', hp: 2, atk: 0, spd: 2, armor: 0, move: 'fins', evade: 0.2,
      tags: ['pond'], colors: { main: '#3E7C8B', dark: '#26505C', accent: '#FFAE00' },
      blurb: 'Impossibly slippery. One hit in five finds water.' },
    { id: 'spiderhind', slot: 'rear', name: 'Spider Hind', hp: 0, atk: 2, spd: 6, armor: 0, move: 'skitter', haste: 0.12,
      tags: ['garden'], colors: { main: '#4A3A5E', dark: '#2E2440', accent: '#B79CED' },
      blurb: 'Eight-legged hustle: everything swings 12% faster.' },

    // ---- TAIL: the tertiary attack, or a trick --------------------------------
    { id: 'stub', slot: 'tail', name: 'Stub Tail', base: true, hp: 0, atk: 0, spd: 0, armor: 0, wag: 0.1,
      tags: ['beast'], colors: { main: '#C98A4B', dark: '#8A5A33', accent: '#FFF6E9' },
      blurb: 'Wags when happy. The crowd pays for wagging.' },
    { id: 'scorpion', slot: 'tail', name: 'Scorpion Tail', hp: 2, atk: 2, spd: 0, armor: 1,
      attack: { name: 'Venom Sting', kind: 'melee', dmg: 6, cd: 1.8, range: 52, status: 'poison', statusN: 2 },
      tags: ['venom'], colors: { main: '#8A5A33', dark: '#5E3C20', accent: '#C62F3B' },
      blurb: 'The argument ends over the shoulder.' },
    { id: 'club', slot: 'tail', name: 'Club Tail', hp: 10, atk: 2, spd: -2, armor: 1,
      attack: { name: 'Tail Sweep', kind: 'aoe', dmg: 10, cd: 2.6, range: 80 },
      tags: ['stone'], colors: { main: '#7A7264', dark: '#544C40', accent: '#E8E3D5' },
      blurb: 'A wrecking ball with a pulse.' },
    { id: 'peacock', slot: 'tail', name: 'Peacock Fan', hp: 0, atk: 0, spd: 0, armor: 0, charm: 0.15,
      tags: ['sky'], colors: { main: '#2E9BC6', dark: '#1B6B8C', accent: '#3ED97E' },
      blurb: 'So beautiful that attackers keep pausing to look.' },
    { id: 'fox', slot: 'tail', name: 'Fox Tail', hp: 0, atk: 1, spd: 6, armor: 0, stylePlus: 1.0,
      tags: ['wild'], colors: { main: '#E8862E', dark: '#B35A14', accent: '#FFF6E9' },
      blurb: 'Style chains forgive an extra second of mercy.' },
    { id: 'eel', slot: 'tail', name: 'Eel Tail', hp: 0, atk: 1, spd: 2, armor: 0,
      attack: { name: 'Static Lash', kind: 'proj', dmg: 6, cd: 2.0, range: 260, chain: true },
      tags: ['pond', 'gadget'], colors: { main: '#3E7C8B', dark: '#26505C', accent: '#FFE95E' },
      blurb: 'A living wire. The zap jumps to a second target.' },

    // ---- ORGAN: the passive heart of the build ---------------------------------
    { id: 'heart', slot: 'organ', name: 'Stout Heart', base: true, hp: 8, atk: 0, spd: 0, armor: 0, organ: 'regen',
      tags: ['beast'], colors: { main: '#C62F3B', dark: '#8E1F29', accent: '#FF9DB0' },
      blurb: 'Mends 0.7 vigour a second, beat by beat.' },
    { id: 'venomsac', slot: 'organ', name: 'Venom Sac', hp: 0, atk: 1, spd: 0, armor: 0, organ: 'venom',
      tags: ['venom'], colors: { main: '#5FA84F', dark: '#3A7030', accent: '#D6FF5E' },
      blurb: 'Every solid hit leaves a little poison behind.' },
    { id: 'ragegland', slot: 'organ', name: 'Rage Gland', hp: 4, atk: 2, spd: 0, armor: 0, organ: 'rage',
      tags: ['wild'], colors: { main: '#E4572E', dark: '#B93A18', accent: '#FFD9A0' },
      blurb: 'Below half vigour, hits land 25% harder.' },
    { id: 'twinbrain', slot: 'organ', name: 'Twin Brain', hp: 0, atk: 0, spd: 2, armor: 0, organ: 'brain',
      tags: ['gadget'], colors: { main: '#B79CED', dark: '#7C4DBD', accent: '#FFF6E9' },
      blurb: 'Two brains: prods recharge 35% faster, crits +8%.' },
    { id: 'irongut', slot: 'organ', name: 'Iron Gut', hp: 16, atk: 0, spd: -2, armor: 4, organ: 'gut', knockRes: 0.5,
      tags: ['stone', 'gadget'], colors: { main: '#9AA3A8', dark: '#6B747A', accent: '#FFAE00' },
      blurb: 'Swallowed a horseshoe once. It stayed to help.' },
    { id: 'honeygut', slot: 'organ', name: 'Honey Gut', hp: 4, atk: 0, spd: 0, armor: 0, organ: 'honey',
      tags: ['garden'], colors: { main: '#FFAE00', dark: '#C07F00', accent: '#FFF3C4' },
      blurb: 'Sweet through and through: applause flows 40% faster.' },
  ];

  const byId = {};
  for (const p of PARTS) byId[p.id] = p;
  const bySlot = {};
  for (const p of PARTS) { (bySlot[p.slot] = bySlot[p.slot] || []).push(p); }

  // The Pup: the beast every run starts as, before the grafting begins.
  const BASE_BUILD = { head: 'hound', torso: 'goat', front: 'paws', rear: 'hooves', tail: 'stub', organ: 'heart' };

  // Named tag synergies the draft can complete; checked by beasts.js.
  const SYNERGIES = [
    { id: 'venomweb', name: 'VENOM WEB', tags: ['venom', 'venom'], text: 'Poison stacks +1 and bites 40% harder' },
    { id: 'skyborn', name: 'SKYBORN', tags: ['sky', 'sky'], text: 'Crit chance +15%, evade +5%' },
    { id: 'wildheart', name: 'WILD HEART', tags: ['wild', 'wild', 'wild'], text: 'Charge and bleed damage +30%' },
    { id: 'pondluck', name: 'POND LUCK', tags: ['pond', 'pond'], text: 'Evade +10%, tongue yanks farther' },
    { id: 'beastblood', name: 'BEAST BLOOD', tags: ['beast', 'beast', 'beast'], text: 'All attacks +3 damage' },
    { id: 'stonehide', name: 'STONEHIDE', tags: ['stone', 'stone'], text: 'Armour +3, knockback halved' },
    { id: 'gardenparty', name: 'GARDEN PARTY', tags: ['garden', 'garden'], text: 'Attack speed +10%, crit +6%' },
  ];

  globalThis.CP_Parts = { PARTS, byId, bySlot, BASE_BUILD, SYNERGIES };
})();
