// howto.js — the rules, on one screen, in the order a new player needs them: what
// fights, what you do during it, what happens between bouts, and how a run is won,
// lost and scored. Every claim here is a rule the sim actually keeps.
(function () {
  if (globalThis.CP_Howto) return;
  const C = globalThis.CP_Config;
  const P = C.PALETTE;
  const L = globalThis.CP_Layout;
  const Fit = globalThis.CP_Fit;
  const Icons = globalThis.CP_RuleIcons;

  const ROWS = [
    ['fight', 'THE FIGHT', 'Your beast battles on its own: it seeks the nearest wild beast and cycles the attacks its head, forearms and tail give it. Charges, venom, tongues and stomps all fire by themselves — your build is your strategy.'],
    ['prod', 'YOUR HAND', 'You are the hand on the fence. Kills earn APPLAUSE: spend it mid-fight on the SHOCK PROD (1), the TREAT BUCKET (2) or a RAGEBERRY (3). Pick a STANCE between bouts (Z X C): FERAL hits harder, GUARDED endures, CUNNING crits and charms the crowd.'],
    ['graft', 'THE GRAFT', 'After every won bout the yard offers 3 grafts. One replaces the body part in its slot — new silhouette, new attacks, new numbers. Reroll for applause (X). Parts sharing tags complete SYNERGIES: two venom parts weave a VENOM WEB, three wild parts wake the WILD HEART.'],
    ['chain', 'STYLE', 'Kills within six seconds of each other chain: x1.5, x2, x2.5 … up to x8 score. Clearing a bout mends three-fifths of the vigour you lost. Your vigour is the run: when it reaches zero, the beast falls and the run is over.'],
    ['apex', 'THE CARD', 'Nine bouts: bruisers at 3 and 6, something new almost every bout, and at 9 the APEX, THE UNSPLICED — Stalker, then Caller (it summons pups and its roar stuns), then Frenzy. Clear it and the yard is yours. THE WILD mode never ends: how many bouts can your beast survive? And the yard has MOODS: a DOWNPOUR slows every shot and stretches chains, DEEP MIRE swallows boots, a BITING SWARM stings at random — the pit reconfigures with the beast.'],
  ];

  function draw(ctx, view) {
    ctx.fillStyle = '#274156'; ctx.fillRect(0, 0, C.W, C.H);
    Fit.draw(ctx, 'HOW TO PLAY', 640, 48, 44, '#FFF6E9', 'center', true, 800, true);
    ROWS.forEach((row, i) => {
      const y = 108 + i * 128;
      L.panel(ctx, 90, y, 1100, 112);
      Icons.draw(ctx, row[0], 150, y + 56, 52);
      Fit.draw(ctx, row[1], 196, y + 30, 21, P.tealDeep, 'left', true);
      Fit.wrap(ctx, row[2], 196, y + 62, 16.5, P.ink, 950, 22, 'left');
    });
    Fit.draw(ctx, 'ESC — TITLE · ENTER — INTO THE PIT', 640, 772, 16, '#B9CFC6', 'center', true);
  }

  globalThis.CP_Howto = { draw };
})();
