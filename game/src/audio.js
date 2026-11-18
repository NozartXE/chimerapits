// audio.js — all sound is synthesised WebAudio, no files: short shaped tones and
// filtered noise for bites, spits, charges, slams, roars and cheers, and a generative
// pentatonic pluck tune that walks a little faster in a fight than on the title
// screen. Everything is guarded — a browser that refuses audio simply gets silence.
(function () {
  if (globalThis.CP_Audio) return;
  let ac = null, master = null, musicGain = null, muted = false, musicTimer = null, step = 0;

  function ensure() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ac.destination);
      musicGain = ac.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
      return true;
    } catch (e) { return false; }
  }
  function tone(freq, dur, type, gain, slideTo, dest) {
    if (!ac || muted) return;
    const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, gain, freq) {
    if (!ac || muted) return;
    const t = ac.currentTime, len = Math.max(1, (dur * ac.sampleRate) | 0);
    const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 1200;
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t);
  }
  const SFX = {
    click: () => tone(660, 0.06, 'square', 0.12),
    bite: () => { tone(180, 0.09, 'square', 0.16, 70); noise(0.05, 0.10, 2400); },
    hit: () => noise(0.06, 0.14, 1600),
    crit: () => { tone(880, 0.12, 'square', 0.16, 320); noise(0.08, 0.12, 3000); },
    spit: () => tone(420, 0.14, 'sine', 0.14, 130),
    charge: () => tone(120, 0.28, 'sawtooth', 0.12, 340),
    slam: () => { noise(0.22, 0.26, 500); tone(70, 0.22, 'sine', 0.24, 40); },
    kill: () => { tone(392, 0.09, 'square', 0.13); setTimeout(() => tone(523, 0.09, 'square', 0.13), 70); setTimeout(() => tone(659, 0.14, 'square', 0.13), 140); },
    roar: () => { tone(82, 0.7, 'sawtooth', 0.3, 55); noise(0.6, 0.16, 700); },
    prod: () => tone(1180, 0.16, 'square', 0.14, 240),
    graft: () => { noise(0.05, 0.12, 3200); setTimeout(() => noise(0.05, 0.12, 3200), 90); setTimeout(() => tone(784, 0.16, 'sine', 0.16), 170); },
    cheer: () => noise(0.5, 0.10, 2600),
    lose: () => { tone(330, 0.25, 'triangle', 0.18, 262); setTimeout(() => tone(262, 0.4, 'triangle', 0.18, 196), 220); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'square', 0.14), i * 120)); },
  };
  function sfx(name) { if (ensure() && SFX[name]) SFX[name](); }

  // Generative music: a walking bass and sparse pentatonic plucks, seeded pattern.
  const SCALE = [0, 3, 5, 7, 10, 12, 15];
  const BASS = [0, 0, -4, -2];
  function musicTick(fast) {
    if (!ac || muted) return;
    const root = 196;
    const bar = Math.floor(step / 8);
    if (step % 8 === 0) tone(root / 2 * Math.pow(2, BASS[bar % 4] / 12), 0.5, 'triangle', 0.20, 0, musicGain);
    if (step % 2 === 0 && Math.random() < (fast ? 0.75 : 0.5)) {
      const n = SCALE[(Math.random() * SCALE.length) | 0];
      tone(root * Math.pow(2, n / 12), 0.24, 'triangle', 0.12, 0, musicGain);
    }
    step++;
  }
  function startMusic(fast) {
    if (!ensure()) return;
    stopMusic();
    musicTimer = setInterval(() => musicTick(fast), fast ? 168 : 210);
  }
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }
  function setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.5; }

  globalThis.CP_Audio = { sfx, startMusic, stopMusic, setMuted, ensure, isMuted: () => muted };
})();
