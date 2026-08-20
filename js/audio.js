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

     Drop mp3s into audio/ and list them here; they play in order and the
     list loops. Anything that 404s or refuses to decode is skipped, and if
     nothing at all plays the synthesised tune above just keeps going.

     Deliberately a plain <audio> element rather than a MediaElementSource
     through the graph above: element audio needs no AudioContext, survives
     being opened straight off the disk as a file:// page, and cannot taint
     the context if a file is served oddly. It costs the shared master fade,
     so the fade is done by hand on .volume instead.
     ----------------------------------------------------------------------- */

  var TRACKS = ['audio/theme.mp3'];
  var MUSIC_VOL = 0.30;              /* under the rain, never over dialogue */

  var track = null, trackIx = 0, fadeTimer = null, recorded = false;

  function nextTrack() {
    if (!TRACKS.length) return;
    trackIx = (trackIx + 1) % TRACKS.length;
    track.src = TRACKS[trackIx];
    track.play().catch(function () {});
  }

  function buildMusic() {
    if (!TRACKS.length) return;
    track = new Audio();
    track.preload = 'auto';
    track.volume = 0;
    /* One track loops itself; several run as a playlist that wraps. */
    track.loop = TRACKS.length === 1;
    track.addEventListener('ended', nextTrack);

    track.addEventListener('canplay', function () {
      if (recorded) return;
      recorded = true;
      clearInterval(stepTimer);       /* the synth tune stands down */
      stepTimer = null;
      if (on) fadeTrack(MUSIC_VOL);
    });

    /* Missing or unplayable: leave the synth tune running and say so once,
       quietly, so a teacher who expected music knows where to look. */
    track.addEventListener('error', function () {
      if (recorded) return;
      track = null;
      if (global.console && console.info) {
        console.info('No music file at ' + TRACKS[trackIx] +
                     ' — using the built-in tune instead.');
      }
    });

    track.src = TRACKS[0];
  }

  function fadeTrack(to) {
    if (!track) return;
    clearInterval(fadeTimer);
    if (to > 0 && track.paused) track.play().catch(function () {});
    fadeTimer = setInterval(function () {
      var d = to - track.volume;
      if (Math.abs(d) < 0.012) {
        track.volume = to;
        clearInterval(fadeTimer);
        if (to === 0) track.pause();
        return;
      }
      track.volume = Math.max(0, Math.min(1, track.volume + (d > 0 ? 0.012 : -0.012)));
    }, 40);
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

  global.Sound = {
    setEnabled: setEnabled, isOn: isOn, preference: preference,
    knock: knock, scrub: scrub, chime: chime, bell: bell, coin: coin
  };

})(window);
