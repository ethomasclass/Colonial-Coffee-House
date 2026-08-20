/* ===========================================================================
   audio.js — rain, hearth, and a slow tune, all synthesised in the browser.

   Rain, hearth and every effect are built from noise buffers and oscillators
   through the Web Audio API — no files, nothing fetched, works offline.

   Music is the one exception. If mp3s are present in audio/ they are used for
   the background track; if they are missing, or fail to load, the synthesised
   tune below plays instead and nothing else changes. The game therefore still
   runs as a bare folder with no audio files in it at all.

   It defaults to OFF. Thirty Chromebooks all playing rain is not a mood, it
   is a fire alarm. One toggle in the corner turns it on for whoever has
   headphones, and the choice is remembered.
   =========================================================================== */

(function (global) {
  'use strict';

  var ctx = null, master = null, on = false, started = false;
  var rainGain = null, fireGain = null, musicGain = null;
  var noiseBuf = null, crackleTimer = null, stepTimer = null, step = 0;

  var KEY = 'greendragon.sound';

  /* --- a couple of seconds of white noise, looped for rain and fire ------- */
  function makeNoise() {
    var len = ctx.sampleRate * 2;
    var b = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  function noiseSource(loop) {
    var s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = !!loop;
    return s;
  }

  /* --- steady rain on the leaded glass ----------------------------------- */
  function buildRain() {
    var src = noiseSource(true);
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1050; bp.Q.value = 0.45;
    var hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 340;
    /* Rain heard through glass, not rain hitting you. The extra lowpass takes
       the hiss off it so it sits under everything instead of on top. */
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1900;
    rainGain = ctx.createGain();
    rainGain.gain.value = 0.022;
    src.connect(bp); bp.connect(hp); hp.connect(lp); lp.connect(rainGain);
    rainGain.connect(master);
    src.start();

    /* the shower swells and eases rather than sitting flat */
    var lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05; lfoGain.gain.value = 0.007;
    lfo.connect(lfoGain); lfoGain.connect(rainGain.gain);
    lfo.start();
  }

  /* --- the hearth: a low roar, plus the occasional crack of a log -------- */
  function buildFire() {
    var src = noiseSource(true);
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 380;
    fireGain = ctx.createGain();
    fireGain.gain.value = 0.05;
    src.connect(lp); lp.connect(fireGain); fireGain.connect(master);
    src.start();
    scheduleCrackle();
  }

  function scheduleCrackle() {
    clearTimeout(crackleTimer);
    crackleTimer = setTimeout(function () {
      if (on && ctx) {
        var s = noiseSource(false);
        var bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 700 + Math.random() * 1800;
        bp.Q.value = 3;
        var g = ctx.createGain();
        var t = ctx.currentTime;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07 + Math.random() * 0.08);
        s.connect(bp); bp.connect(g); g.connect(master);
        s.start(t); s.stop(t + 0.3);
      }
      scheduleCrackle();
    }, 350 + Math.random() * 2600);
  }

  /* --- the tune ----------------------------------------------------------
     A slow ground bass with a plucked line over it, in A minor. Deliberately
     not a transcription of any real 18th-century piece — it is period in
     shape (a repeating ground, plain intervals) and modern in that it is just
     meant to sit under the room without asking for attention. */

  var A3 = 220.00, B3 = 246.94, Cs4 = 277.18, C4 = 261.63, D4 = 293.66,
      E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Gs3 = 207.65;

  var GROUND = [110.00, 98.00, 87.31, 82.41];        /* A2 G2 F2 E2         */
  var LINE = [
    A4, C4, E4, C4,
    G4, B3, D4, B3,
    F4, A3, C4, A3,
    E4, Gs3, B3, Gs3
  ];

  function pluck(freq, when, level) {
    var o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2600, when);
    lp.frequency.exponentialRampToValueAtTime(700, when + 0.5);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(level, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 1.5);
    o.connect(lp); lp.connect(g); g.connect(musicGain);
    o.start(when); o.stop(when + 1.6);
  }

  function bow(freq, when, level) {
    var o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 420;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(level, when + 0.5);
    g.gain.linearRampToValueAtTime(0.0001, when + 4.0);
    o.connect(lp); lp.connect(g); g.connect(musicGain);
    o.start(when); o.stop(when + 4.1);
  }

  function tick() {
    if (!on || !ctx) return;
    var t = ctx.currentTime + 0.05;
    if (step % 4 === 0) bow(GROUND[(step / 4) % GROUND.length], t, 0.05);
    /* leave gaps — a note on every beat would be relentless */
    if (step % 2 === 0 || Math.random() < 0.35) {
      pluck(LINE[step % LINE.length], t, 0.055 + Math.random() * 0.02);
    }
    step = (step + 1) % 16;
  }

  /* --- recorded music, if any has been added -----------------------------

     Drop mp3s into audio/ and list them here. Anything that 404s or refuses
     to decode is skipped, and if nothing at all plays the synthesised tune
     above just keeps going.

     Deliberately plain <audio> elements rather than MediaElementSources
     through the graph above: element audio needs no AudioContext, survives
     being opened straight off the disk as a file:// page, and cannot taint
     the context if a file is served oddly. It costs the shared master fade,
     so the fade is done by hand on .volume instead.

     TWO elements, not one, because almost no music file loops cleanly. A
     track written as a piece of music ends: it fades, or it stops, and often
     there is a half-second of digital silence sitting after the last note.
     Loop that and the room hears the song die and restart every few minutes.
     So the two decks hand off — as one comes within XFADE of its end, the
     other starts from the top and the pair cross-fade, which lays the head of
     the track over its own tail and buries the seam. With several tracks
     listed it cross-fades into the next one instead of back into itself.
     ----------------------------------------------------------------------- */

  var TRACKS = ['audio/theme.mp3'];
  var MUSIC_VOL = 0.30;              /* under the rain, never over dialogue */
  var XFADE = 4.0;                   /* seconds of overlap at the hand-off */

  var decks = [], live = 0, trackIx = 0, recorded = false;
  var musicNow = 0, musicWant = 0, mixTimer = null, handing = false;

  function makeDeck() {
    var a = new Audio();
    a.preload = 'auto';
    a.volume = 0;
    a.gain = 0;                      /* our own cross-fade gain, 0..1 */
    return a;
  }

  function buildMusic() {
    if (!TRACKS.length) return;
    decks = [makeDeck(), makeDeck()];

    decks[0].addEventListener('canplay', function () {
      if (recorded) return;
      recorded = true;
      clearInterval(stepTimer);       /* the synth tune stands down */
      stepTimer = null;
      decks[0].gain = 1;
      startMix();
      if (on) { musicWant = MUSIC_VOL; decks[0].play().catch(function () {}); }
    });

    /* Missing or unplayable: leave the synth tune running and say so once,
       quietly, so a teacher who expected music knows where to look. */
    decks[0].addEventListener('error', function () {
      if (recorded) return;
      decks = [];
      if (global.console && console.info) {
        console.info('No music file at ' + TRACKS[0] +
                     ' — using the built-in tune instead.');
      }
    });

    decks[0].addEventListener('timeupdate', watchForEnd);
    decks[1].addEventListener('timeupdate', watchForEnd);
    decks[0].src = TRACKS[0];
  }

  /* The hand-off. Fires off whichever deck is currently the live one. */
  function watchForEnd(ev) {
    if (handing || !recorded || ev.target !== decks[live]) return;
    var a = decks[live];
    if (!isFinite(a.duration) || a.duration <= XFADE * 2) return;
    if (a.duration - a.currentTime > XFADE) return;

    handing = true;
    var other = decks[1 - live];
    trackIx = (trackIx + 1) % TRACKS.length;
    /* Re-assigning the same src re-fetches from cache; a different one moves
       the playlist along. Either way the incoming deck starts from the top. */
    other.src = TRACKS[trackIx];
    other.currentTime = 0;
    other.gain = 0;
    other.play().catch(function () {});
    live = 1 - live;
  }

  /* One ticker drives both the on/off fade and the cross-fade, so the two
     never fight over .volume. */
  function startMix() {
    clearInterval(mixTimer);
    mixTimer = setInterval(function () {
      var d = musicWant - musicNow;
      if (Math.abs(d) < 0.006) musicNow = musicWant;
      else musicNow += d > 0 ? 0.006 : -0.006;

      var stepG = 1 / (XFADE * 25);          /* 40ms ticks → XFADE seconds */
      decks.forEach(function (a, i) {
        var want = (i === live) ? 1 : 0;
        if (Math.abs(want - a.gain) <= stepG) a.gain = want;
        else a.gain += a.gain < want ? stepG : -stepG;
        a.volume = Math.max(0, Math.min(1, musicNow * a.gain));
        /* Stop anything that has gone fully silent: the faded-out deck after
           a hand-off, and both of them when the sound is switched off. */
        if (a.volume === 0 && !a.paused) a.pause();
      });
      if (handing && decks[1 - live].gain === 0) handing = false;
    }, 40);
  }

  function fadeTrack(to) {
    if (!recorded) return;
    musicWant = to;
    if (to > 0) {
      var a = decks[live];
      if (a && a.paused) a.play().catch(function () {});
    }
  }

  /* --- control ----------------------------------------------------------- */
  function start() {
    if (started) return;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    noiseBuf = makeNoise();
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.9;
    musicGain.connect(master);
    buildRain();
    buildFire();
    stepTimer = setInterval(tick, 1050);          /* ~57 to the minute */
    buildMusic();                                 /* may replace the tune */
    started = true;
  }

  function setEnabled(want) {
    on = !!want;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    if (on) {
      start();
      if (!ctx) return false;
      if (ctx.state === 'suspended') ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 0.8);
      if (recorded) fadeTrack(MUSIC_VOL);
    } else if (ctx) {
      if (recorded) fadeTrack(0);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    }
    return on;
  }

  function isOn() { return on; }

  /* Remembered between sessions, but never on for a first-time visitor. */
  function preference() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }

  /* A soft wooden knock for wiping and setting cups down. Cheap, and it makes
     the chores feel like they connect with something. */
  function knock(pitch, level) {
    if (!on || !ctx) return;
    var t = ctx.currentTime;
    var s = noiseSource(false);
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = pitch || 320; bp.Q.value = 1.6;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level || 0.06, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    s.connect(bp); bp.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.2);
  }

  /* Cloth on wood or on metal. Rate-limited, because a pointermove storm
     would otherwise stack a hundred voices and turn into a buzz. */
  var lastScrub = 0;
  function scrub(intensity) {
    if (!on || !ctx) return;
    var t = ctx.currentTime;
    if (t - lastScrub < 0.04) return;
    lastScrub = t;
    var s = noiseSource(false);
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 700 + Math.random() * 800 + intensity * 900;
    bp.Q.value = 0.7;
    var g = ctx.createGain();
    /* Audible over a classroom, but still cloth rather than sandpaper. */
    var lvl = 0.05 + intensity * 0.10;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(lvl, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
    s.connect(bp); bp.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.2);
  }

  /* Two notes for a job finished. Small, not a fanfare. */
  /* The door, and the money. Two more shapes out of the same oscillators —
     no files, nothing to load. */
  function bell() {
    if (!on || !ctx) return;
    [1180, 1760].forEach(function (fq, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = fq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05 / (i + 1), ctx.currentTime + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
      o.connect(g); g.connect(master);
      o.start(); o.stop(ctx.currentTime + 0.95);
    });
  }

  function coin() {
    if (!on || !ctx) return;
    [2400, 3100].forEach(function (fq, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square'; o.frequency.value = fq;
      var t = ctx.currentTime + i * 0.045;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.028, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.18);
    });
  }

  function chime() {
    if (!on || !ctx) return;
    var t = ctx.currentTime;
    [659.25, 987.77].forEach(function (f, i) {
      var o = ctx.createOscillator();
      o.type = 'triangle'; o.frequency.value = f;
      var g = ctx.createGain();
      var when = t + i * 0.13;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.08, when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 1.1);
      o.connect(g); g.connect(master);
      o.start(when); o.stop(when + 1.2);
    });
  }

  /* `Sound.musicInfo()` in the browser console says whether the mp3 was
     found and what it is doing. Handy when music does not come on and you
     want to know if it is the file, the toggle, or the browser. */
  function musicInfo() {
    if (!recorded) {
      return { source: 'synthesised tune', file: TRACKS[0] || '(none listed)',
               loaded: false };
    }
    var a = decks[live];
    return {
      source: 'file', file: TRACKS[trackIx],
      loaded: true,
      playing: !a.paused,
      seconds: Math.round(a.currentTime) + ' / ' + Math.round(a.duration || 0),
      volume: Math.round(a.volume * 100) / 100,
      crossFading: handing,
      deckGains: decks.map(function (d) { return Math.round(d.gain * 100) / 100; })
    };
  }

  /* Jump the live deck to a given time. Exists so the cross-fade can be
     exercised without sitting through the whole track — the hand-off is
     otherwise untestable in under three minutes. Not used by the game. */
  function _seek(t) {
    if (recorded && decks[live]) decks[live].currentTime = t;
  }

  global.Sound = {
    setEnabled: setEnabled, isOn: isOn, preference: preference,
    musicInfo: musicInfo, _seek: _seek,
    knock: knock, scrub: scrub, chime: chime, bell: bell, coin: coin
  };

})(window);
