// enemies.js — the wild roster: eight beast kinds that were never grafted and resent
// yours for it, two elite "bruiser" variants, and APEX, THE UNSPLICED, the three-phase
// boss of bout 9. Stats here are bout-1 values; waves.js scales them up the card.
(function () {
  if (globalThis.CP_Enemies) return;

  // attack: same shape as parts.js. trait: charger|spitter|tank|swarm|skittish|mauler.
  const WILD = [
    { id: 'mirepup', name: 'Mire Pup', hp: 34, spd: 104, armor: 0, score: 60,
      attack: { name: 'Mud Bite', kind: 'melee', dmg: 6, cd: 1.1, range: 42 },
      colors: { main: '#8FA35A', dark: '#61703C', accent: '#E8E3D5' }, size: 0.82,
      blurb: 'A pond puppy with more teeth than sense.' },
    { id: 'thornboar', name: 'Thorn Boar', hp: 58, spd: 96, armor: 1, score: 110, trait: 'charger',
      attack: { name: 'Thorn Rush', kind: 'charge', dmg: 11, cd: 3.0, range: 190, status: 'bleed', statusN: 1 },
      colors: { main: '#7A6A58', dark: '#4E4237', accent: '#5FA84F' }, size: 1.0,
      blurb: 'Charges first, identifies the target later.' },
    { id: 'gullbat', name: 'Gull Bat', hp: 26, spd: 148, armor: 0, score: 90, trait: 'skittish',
      attack: { name: 'Swoop Peck', kind: 'melee', dmg: 5, cd: 0.8, range: 40, crit: 0.2 },
      colors: { main: '#DDE8EC', dark: '#93AAB5', accent: '#E4572E' }, size: 0.7,
      blurb: 'Half seagull, half bat, entirely a nuisance.' },
    { id: 'cragback', name: 'Cragback', hp: 120, spd: 62, armor: 5, score: 200, trait: 'tank', defense: 'shell',
      attack: { name: 'Boulder Nudge', kind: 'melee', dmg: 12, cd: 1.7, range: 48 },
      colors: { main: '#6E8B6A', dark: '#47603F', accent: '#D9C7A7' }, size: 1.3,
      blurb: 'A boulder that learned to walk and to hold grudges.' },
    { id: 'spithare', name: 'Spit Hare', hp: 30, spd: 122, armor: 0, score: 130, trait: 'spitter',
      attack: { name: 'Acid Glob', kind: 'proj', dmg: 6, cd: 1.9, range: 300, status: 'poison', statusN: 1 },
      colors: { main: '#C9B458', dark: '#94802F', accent: '#5FA84F' }, size: 0.78,
      blurb: 'Keeps its distance and lets its spit argue.' },
    { id: 'stag', name: 'Razor Stag', hp: 66, spd: 118, armor: 1, score: 170, trait: 'charger',
      attack: { name: 'Antler Slash', kind: 'melee', dmg: 10, cd: 1.2, range: 52, status: 'bleed', statusN: 2 },
      colors: { main: '#B07B4F', dark: '#7A4E2A', accent: '#F3E9D2' }, size: 1.1,
      blurb: 'Its antlers are less horns, more cutlery.' },
    { id: 'mauler', name: 'Mauler', hp: 92, spd: 92, armor: 2, score: 220, trait: 'mauler',
      attack: { name: 'Twin Maul', kind: 'multi', dmg: 6, hits: 2, cd: 1.6, range: 50 },
      colors: { main: '#6E4A2F', dark: '#452C1A', accent: '#FFAE00' }, size: 1.15,
      blurb: 'A bear that skipped the grafting queue and the manners.' },
    { id: 'longneck', name: 'Longneck', hp: 48, spd: 100, armor: 0, score: 160, trait: 'spitter',
      attack: { name: 'Sweeping Spit', kind: 'proj', dmg: 8, cd: 2.3, range: 330, status: 'poison', statusN: 2 },
      colors: { main: '#4F8A6B', dark: '#2F5C46', accent: '#FFE95E' }, size: 1.05,
      blurb: 'All neck, all reach, no apologies.' },
  ];

  // APEX, THE UNSPLICED — bout 9. Phases by vigour: 100–60% the Stalker (bites, charges);
  // 60–30% the Caller (roars a stun, summons mire pups); under 30% the Frenzy (faster,
  // harder, triple charge). The yard's whole argument in one animal: never grafted,
  // never beaten — yet.
  const APEX = { id: 'apex', name: 'APEX, THE UNSPLICED', hp: 470, spd: 96, armor: 3, score: 3000, boss: true,
    attack: { name: 'Primeval Bite', kind: 'melee', dmg: 13, cd: 1.15, range: 62 },
    charge: { name: 'World Rush', kind: 'charge', dmg: 19, cd: 4.2, range: 260 },
    colors: { main: '#5E4A68', dark: '#3A2C44', accent: '#FF5E3A' }, size: 1.9,
    blurb: 'The wild thing every graft is measured against.' };

  const byId = {};
  for (const w of WILD) byId[w.id] = w;
  byId.apex = APEX;

  globalThis.CP_Enemies = { WILD, APEX, byId };
})();
