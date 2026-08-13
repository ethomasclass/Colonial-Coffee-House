/* ===========================================================================
   art.js — pixel renderer, the Green Dragon interior, and the cast sprites.

   Everything is drawn onto a small 384x216 offscreen buffer and then blitted
   to the visible canvas with smoothing off, so the result is honest pixel art
   rather than a filtered photograph. Characters are built from a shared
   drawPerson() "character sheet" so that six faces stay stylistically
   consistent and every one of them can wear any expression.
   =========================================================================== */

(function (global) {
  'use strict';

  var W = 384, H = 216;

  /* --- period palette: candlelight, pewter, wet slate, wool ---------------- */
  var C = {
    none:        null,
    ink:         '#140d12',
    shadow:      '#241823',
    woodDark:    '#33211a',
    wood:        '#4d3225',
    woodLit:     '#6b4630',
    woodHi:      '#8a5c3c',
    plaster:     '#6d5c4a',
    plasterLit:  '#8a7660',
    amber:       '#d99038',
    amberLit:    '#f0bb63',
    flame:       '#ffd97e',
    flameHot:    '#fff4cd',
    ember:       '#b2451f',
    cream:       '#efe0c2',
    linen:       '#d6c3a0',
    linenDim:    '#b09b7c',
    night:       '#141d2b',
    nightLit:    '#24334a',
    slate:       '#25344a',
    slateLit:    '#3c5570',
    pewter:      '#7f858d',
    pewterLit:   '#aeb4bb',
    pewterDim:   '#565c64',
    redcoat:     '#8c3529',
    redDim:      '#6a271e',
    moss:        '#46583a',
    mossLit:     '#5f7550',
    indigo:      '#39456e',
    indigoLit:   '#4f5d8c',
    plum:        '#5a3450',
    brown:       '#5e4126',
    brownLit:    '#7d5a35',
    black:       '#1b1620',
    blackLit:    '#2e2733',
    white:       '#f6efe0',
    skin1:       '#e0b08a', skin1s: '#bd8a68', skin1h: '#f2cba7',
    skin2:       '#c98d63', skin2s: '#a06e4b', skin2h: '#e0aa80',
    skin3:       '#8a5a3c', skin3s: '#6b4229', skin3h: '#a8734f',
    skin4:       '#5d3a26', skin4s: '#452a1b', skin4h: '#7a5136',
    hairBlack:   '#2a2028', hairBrown: '#4a3020', hairGrey: '#9a9288',
    hairAuburn:  '#6d3520', hairFlax:  '#b99456', hairWhite: '#ded4c2'
  };

  var buf, bctx, view, vctx;

  function init(viewCanvas) {
    view = viewCanvas;
    vctx = view.getContext('2d');
    buf = document.createElement('canvas');
    buf.width = W; buf.height = H;
    bctx = buf.getContext('2d');
    bctx.imageSmoothingEnabled = false;
    preloadAll();
    resize();
    global.addEventListener('resize', resize);
  }

  function resize() {
    if (!view) return;
    var host = view.parentElement;
    var aw = host.clientWidth, ah = host.clientHeight;
    var s = Math.max(1, Math.min(Math.floor(aw / W), Math.floor(ah / H)));
    if (aw / W < 1 || ah / H < 1) s = Math.min(aw / W, ah / H);
    view.width = Math.round(W * s);
    view.height = Math.round(H * s);
    view.style.width = view.width + 'px';
    view.style.height = view.height + 'px';
    vctx = view.getContext('2d');
    vctx.imageSmoothingEnabled = false;
  }

  function present() {
    vctx.imageSmoothingEnabled = false;
    vctx.clearRect(0, 0, view.width, view.height);
    vctx.drawImage(buf, 0, 0, W, H, 0, 0, view.width, view.height);
  }

  /* --- primitives --------------------------------------------------------- */
  function clear(c) { bctx.fillStyle = c || C.ink; bctx.fillRect(0, 0, W, H); }
  function r(x, y, w, h, c) { if (!c) return; bctx.fillStyle = c; bctx.fillRect(x | 0, y | 0, w | 0, h | 0); }
  function p(x, y, c) { r(x, y, 1, 1, c); }
  function hl(x, y, w, c) { r(x, y, w, 1, c); }
  function vl(x, y, h, c) { r(x, y, 1, h, c); }

  function ell(cx, cy, rx, ry, c) {
    if (!c) return;
    bctx.fillStyle = c;
    for (var yy = -ry; yy <= ry; yy++) {
      var t = 1 - (yy * yy) / (ry * ry);
      if (t < 0) continue;
      var half = Math.round(rx * Math.sqrt(t));
      if (half <= 0) continue;
      bctx.fillRect((cx - half) | 0, (cy + yy) | 0, half * 2, 1);
    }
  }

  /* rounded-ish blob used for heads and shoulders */
  function blob(x, y, w, h, c) { ell(x + w / 2, y + h / 2, w / 2, h / 2, c); }

  /* checkerboard dither between two colours — cheap texture, very 8-bit */
  function dither(x, y, w, h, c1, c2, phase) {
    phase = phase || 0;
    for (var yy = 0; yy < h; yy++) {
      for (var xx = 0; xx < w; xx++) {
        p(x + xx, y + yy, ((xx + yy + phase) % 2 === 0) ? c1 : c2);
      }
    }
  }

  function poly(pts, c) {
    if (!c) return;
    bctx.fillStyle = c;
    bctx.beginPath();
    bctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) bctx.lineTo(pts[i][0], pts[i][1]);
    bctx.closePath();
    bctx.fill();
  }

  /* deterministic pseudo-random so rain/flicker never reshuffles on resize */
  /* A soft oval of light. Rings of flat colour read as a target; a shaped
     falloff reads as a lamp. Only ever used while painting the cached room,
     so it costs nothing per frame. */
  function pool(cx, cy, rx, ry, stops) {
    bctx.save();
    bctx.translate(cx, cy);
    bctx.scale(1, ry / rx);
    var g = bctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    stops.forEach(function (st) { g.addColorStop(st[0], st[1]); });
    bctx.fillStyle = g;
    bctx.beginPath();
    bctx.arc(0, 0, rx, 0, Math.PI * 2);
    bctx.fill();
    bctx.restore();
  }

  function rnd(seed) { var x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); }

  /* =========================================================================
     THE ROOM — Green Dragon Tavern & Coffee House, Union Street, night
     ========================================================================= */

  /* An optional painted room, if js/backdrop.js points at one that exists.
     Everything below falls back to the built-in room when it doesn’t. */
  var B = global.BACKDROP || {};
  var COUNTER_Y = B.counterY || 172;

  /* How far through the evening we are, 0 at opening and 1 at closing. The
     candles burn down, the fire sinks, and the window darkens against it. */
  var phase = 0;
  function setPhase(p) { phase = Math.max(0, Math.min(1, p)); }
  function getPhase() { return phase; }

  /* Rings and spills the patrons leave. Wiped away by hand, and they stay
     wiped until somebody else puts a cup down. */
  var rings = [];
  var seed = 0;
  function addRing() {
    seed++;
    /* Spread across the whole bar rather than clustering where the cup was,
       so there’s visibly something to do and it isn’t all in one corner. A
       painted room whose bar stops short says so, and spills stay on wood. */
    var bar = B.bar || { x: 24, w: W - 48 };
    rings.push({ kind: 'ring',
                 x: bar.x + Math.round(rnd(seed * 5.3) * bar.w),
                 /* kept high on the bar so the between-patron panel, which
                    sits along the bottom of the frame, never hides them */
                 y: COUNTER_Y + 5 + Math.round(rnd(seed * 9.1) * 10),
                 r: 8 + Math.round(rnd(seed * 3.7) * 4) });
  }

  /* Pewter dulls as the evening goes on. Same cloth, different surface. */
  function addTarnish() {
    seed++;
    var s = B.shelf || { x: 299, y: 28, cols: 5, rows: 3, dx: 16, dy: 38 };
    var row = Math.floor(rnd(seed * 2.9) * s.rows), col = Math.floor(rnd(seed * 6.1) * s.cols);
    rings.push({ kind: 'tarnish', x: s.x + col * s.dx + 5, y: s.y + row * s.dy + 20, r: 9 });
  }
  function ringCount() { return rings.length; }
  function wipeAt(lx, ly, radius) {
    var before = rings.length;
    rings = rings.filter(function (g) {
      var dx = g.x - lx, dy = g.y - ly;
      return Math.sqrt(dx * dx + dy * dy) > (radius + g.r);
    });
    return before - rings.length;
  }
  /* Cleared wholesale when the corresponding chore is finished, so the room
     visibly reflects the work you just did in the close-up. */
  function clearRings(kind) {
    if (!kind) { rings = []; return; }
    rings = rings.filter(function (g) { return g.kind !== kind; });
  }
  function countKind(kind) {
    return rings.filter(function (g) { return g.kind === kind; }).length;
  }

  /* Things in the room worth looking at. Logical-space rectangles. */
  var HITS = B.hits || [
    { id: 'hearth', x: 6,   y: 42,  w: 74, h: 110 },
    { id: 'window', x: 109, y: 19,  w: 64, h: 74  },
    { id: 'sign',   x: 196, y: 18,  w: 66, h: 26  },
    { id: 'shelf',  x: 292, y: 20,  w: 86, h: 132 },
    { id: 'candle', x: 30,  y: 148, w: 14, h: 26  }
  ];
  function hitTest(lx, ly) {
    for (var i = 0; i < HITS.length; i++) {
      var h = HITS[i];
      if (lx >= h.x && lx <= h.x + h.w && ly >= h.y && ly <= h.y + h.h) return h.id;
    }
    return null;
  }

  /* Turn a browser event into buffer coordinates, so clicking and wiping
     line up with the pixels regardless of how far the canvas is scaled. */
  function toLogical(ev) {
    var b = view.getBoundingClientRect();
    var cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - b.left;
    var cy = (ev.touches ? ev.touches[0].clientY : ev.clientY) - b.top;
    return { x: cx / b.width * W, y: cy / b.height * H };
  }

  /* Laid over everything once the room and the people are drawn, so the whole
     scene sinks together rather than the customer floating in a dark room. */
  function applyNightWash() {
    var a = 0.34 * phase;
    if (a <= 0.002) return;
    bctx.fillStyle = 'rgba(14,9,16,' + a.toFixed(3) + ')';
    bctx.fillRect(0, 0, W, H);
  }

  /* --- the painted room, if there is one ---------------------------------- */
  var backdrop = null;          /* the finished 384x216 canvas, once ready    */
  if (B.image) {
    (function () {
      var img = new Image();
      img.onload = function () {
        /* Painted at 2x or 4x? Step it down by halves so the pixels stay
           square and sharp instead of being resampled into mush. */
        var c = document.createElement('canvas'), cx;
        c.width = img.width; c.height = img.height;
        cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        cx.drawImage(img, 0, 0);
        while (c.width >= W * 2 && c.height >= H * 2) {
          var half = document.createElement('canvas');
          half.width = Math.round(c.width / 2); half.height = Math.round(c.height / 2);
          var hx = half.getContext('2d');
          hx.imageSmoothingEnabled = true;   /* averaging, only on exact halves */
          hx.drawImage(c, 0, 0, half.width, half.height);
          c = half;
        }
        if (c.width !== W || c.height !== H) {
          var fit = document.createElement('canvas');
          fit.width = W; fit.height = H;
          var fx2 = fit.getContext('2d');
          fx2.imageSmoothingEnabled = (c.width > W);
          fx2.drawImage(c, 0, 0, W, H);
          c = fit;
        }
        backdrop = c;
      };
      /* Missing file: the console notes it and the built-in room carries on. */
      img.onerror = function () { backdrop = null; };
      img.src = B.image;
    })();
  }

  /* Warm firelight breathing over a painted room, since a painting can’t. */
  function hearthGlow(flick, g) {
    if (!g) return;
    var strength = (0.16 + 0.06 * flick) * (1 - phase * 0.7);
    if (strength <= 0.01) return;
    bctx.save();
    bctx.globalCompositeOperation = 'lighter';
    for (var i = 3; i >= 1; i--) {
      bctx.globalAlpha = strength / (i * 2.2);
      ell(g.x, g.y, g.r * i / 3, g.r * i / 3 * 0.8, C.ember);
    }
    bctx.restore();
  }

  /* =========================================================================
     THE DRAWN TAVERN

     The same room as the painting, built a rectangle at a time. It is drawn to
     the measurements in backdrop.js rather than to its own, so the fire, the
     rain, the spills and the click regions all land in the same places
     whichever room is on screen.

     Nothing in here moves, so it is painted once into a cached canvas and
     blitted after that. Everything that does move — flame, rain, candles,
     rings — is drawn over the top of it by drawRoom, exactly as it is over
     the painting.
     ========================================================================= */

  /* Sampled off the painting, so the two rooms are lit by the same fire. */
  var RC = {
    ceil:        '#482118',
    beam:        '#1f1010',
    beamLit:     '#602918',
    beamDark:    '#0f070b',
    wood:        '#4e2318',
    woodLit:     '#602918',
    woodHi:      '#7a3a20',
    woodDark:    '#2f1513',
    woodDeep:    '#1f1010',
    woodBlack:   '#14070a',
    wallOlive:   '#7b672c',
    wallOliveHi: '#93803a',
    wallOliveDim:'#585039',
    wallWarmDim: '#9e7e32',
    wallWarm:    '#c18435',
    wallWarmHi:  '#e19d45',
    wallCore:    '#ffbe58',
    wallCool:    '#2e3138',
    brick:       '#632618',
    brickLit:    '#923e1f',
    brickDim:    '#461a12',
    mortar:      '#2b1210',
    glass:       '#1d304e',
    glassLit:    '#2a4570',
    glassDark:   '#141f36',
    lead:        '#17253c',
    signField:   '#8a7550',
    signHi:      '#a68f66',
    signDark:    '#5f4f34',
    dragon:      '#4a6b34',
    dragonDim:   '#33502a',
    pewter:      '#7d8288',
    pewterLit:   '#a8adb4',
    pewterDim:   '#4e5257',
    stone:       '#7a4c31',
    stoneDim:    '#55301d',
    china:       '#c9cdd4',
    chinaBlue:   '#5a6b8e',
    herb:        '#5e6b33',
    herbDim:     '#3f4a24',
    iron:        '#3a3438',
    ironLit:     '#5a545a',
    paper:       '#d6c3a0'
  };

  /* Where the drawn room keeps the things that move. Same shape as BACKDROP,
     and it borrows that file's geometry so both rooms agree. The candles are
     listed rather than drawn into the room, because they burn down. */
  var GEO = {
    window: B.window || { x: 122, y: 53, w: 50, h: 64 },
    fire:   B.fire   || { x: 6, y: 100, w: 76, h: 88 },
    shelf:  B.shelf  || { x: 298, y: 18, cols: 4, rows: 4, dx: 15, dy: 30 }
  };
  var DRAWN = {
    window:  { x: GEO.window.x, y: GEO.window.y, w: GEO.window.w, h: GEO.window.h },
    fire:    { x: GEO.fire.x, y: GEO.fire.y, w: GEO.fire.w, h: GEO.fire.h, style: 'tips' },
    glow:    { x: 44, y: 128, r: 104 },
    candles: [ { x: 14, y: 72 }, { x: 40, y: 170 }, { x: 344, y: 170 } ]
  };

  var tavernCache = null;
  function tavern() {
    if (!tavernCache) {
      tavernCache = document.createElement('canvas');
      tavernCache.width = W; tavernCache.height = H;
      var keep = bctx;
      bctx = tavernCache.getContext('2d');
      bctx.imageSmoothingEnabled = false;
      paintTavern();
      bctx = keep;
    }
    return tavernCache;
  }

  function paintTavern() {
    var win = GEO.window, fire = GEO.fire, shelf = GEO.shelf;
    var wsTop = 126;                       /* top of the wainscot panelling */

    clear(RC.woodBlack);

    /* --- the wall, in three pools of light ------------------------------- */
    r(0, 16, W, COUNTER_Y - 16, RC.wallOliveDim);
    r(272, 16, W - 272, COUNTER_Y - 16, RC.wallCool);     /* away from the fire */
    pool(202, 78, 118, 76, [[0, RC.wallOliveHi], [0.45, RC.wallOlive],
                            [1, 'rgba(123,103,44,0)']]);
    /* candlelight climbing the chimney breast */
    pool(20, 52, 88, 68, [[0, RC.wallCore], [0.16, RC.wallWarmHi], [0.38, RC.wallWarm],
                          [0.66, 'rgba(158,126,50,0.8)'], [1, 'rgba(158,126,50,0)']]);

    /* --- ceiling boards and the beam under them -------------------------- */
    r(0, 0, W, 8, RC.ceil);
    for (var cb = 0; cb < W; cb += 46) r(cb, 0, 43, 7, RC.woodDark);
    r(0, 7, W, 11, RC.beam);
    hl(0, 7, W, RC.beamLit);
    hl(0, 17, W, RC.beamDark);

    /* --- the post that divides the warm end from the cold one ------------ */
    r(272, 16, 16, COUNTER_Y - 16, RC.woodDark);
    vl(272, 16, COUNTER_Y - 16, RC.woodLit);
    vl(287, 16, COUNTER_Y - 16, RC.beamDark);
    r(374, 16, 10, COUNTER_Y - 16, RC.woodDark);
    vl(374, 16, COUNTER_Y - 16, RC.woodLit);

    /* --- wainscot: vertical beading, as it is in the painting ------------ */
    r(96, wsTop, 176, COUNTER_Y - wsTop, RC.woodDark);
    hl(96, wsTop, 176, RC.woodHi);
    hl(96, wsTop + 1, 176, RC.woodLit);
    for (var bx = 100; bx < 272; bx += 7) {
      vl(bx, wsTop + 3, COUNTER_Y - wsTop - 3, RC.woodDeep);
      vl(bx + 1, wsTop + 3, COUNTER_Y - wsTop - 3, RC.wood);
    }

    paintHearth(fire);
    paintWindow(win);
    paintSign();
    paintCupboard(shelf);
    paintBar();
  }

  /* --- the hearth: brick, mantel, crane, and an empty firebox -------------
     It stands against the back wall now, with the bar running past in front
     of it, so its base is hidden rather than sharing the foreground. */
  function paintHearth(fire) {
    var top = 80;                          /* where the brickwork starts */
    r(0, top, 96, COUNTER_Y - top, RC.brick);
    for (var by = top; by < COUNTER_Y; by += 5) {
      hl(0, by, 96, RC.mortar);
      for (var bx = (((by - top) / 5) % 2 ? 8 : 0); bx < 96; bx += 16) vl(bx, by, 5, RC.mortar);
    }
    /* the courses nearest the fire catch it */
    for (var lb = 0; lb < 12; lb++) {
      var lx = (lb * 23) % 88, ly = 96 + ((lb * 29) % 62);
      if (lx > 6 && lx < 82 && ly > 88 && ly < 158) continue;   /* not over the opening */
      r(lx, ly, 13, 4, RC.brickLit);
    }

    /* mantel shelf, with an almanac left on it */
    r(0, 72, 102, 8, RC.woodLit);
    hl(0, 72, 102, RC.woodHi);
    r(0, 80, 102, 2, RC.woodDeep);
    r(44, 58, 13, 14, RC.paper);
    r(44, 58, 13, 3, '#b09b7c');
    hl(46, 64, 9, RC.woodDark);
    hl(46, 67, 7, RC.woodDark);

    /* lintel over the opening */
    r(fire.x - 5, fire.y - 9, fire.w + 10, 9, RC.woodDark);
    hl(fire.x - 5, fire.y - 9, fire.w + 10, RC.woodHi);

    /* the opening itself, and the sooty brick at the back of it */
    r(fire.x, fire.y, fire.w, fire.h, RC.woodBlack);
    r(fire.x + 3, fire.y + 3, fire.w - 6, fire.h - 14, '#20100e');
    for (var sy = fire.y + 6; sy < fire.y + fire.h - 14; sy += 5) {
      hl(fire.x + 5, sy, fire.w - 10, '#1c0e0c');
    }

    /* crane and kettle */
    r(fire.x + 5, fire.y + 14, fire.w - 30, 2, RC.iron);
    r(fire.x + 5, fire.y + 14, 2, 12, RC.iron);
    vl(fire.x + fire.w - 28, fire.y + 16, 11, RC.iron);
    r(fire.x + fire.w - 36, fire.y + 27, 17, 12, RC.pewterDim);
    hl(fire.x + fire.w - 36, fire.y + 26, 17, RC.pewter);
    r(fire.x + fire.w - 40, fire.y + 31, 4, 3, RC.pewterDim);
    r(fire.x + fire.w - 30, fire.y + 24, 5, 3, RC.ironLit);

    /* andirons and the logs the fire is drawn on top of */
    r(fire.x + 6, fire.y + fire.h - 22, 3, 20, RC.iron);
    r(fire.x + fire.w - 12, fire.y + fire.h - 22, 3, 20, RC.iron);
    r(fire.x + 10, fire.y + fire.h - 14, fire.w - 24, 7, RC.woodDark);
    r(fire.x + 15, fire.y + fire.h - 19, fire.w - 34, 6, '#3d2216');
    hl(fire.x + 16, fire.y + fire.h - 19, fire.w - 36, RC.wood);
    /* the bed of embers under them, which the drawn flames rise out of */
    pool(fire.x + fire.w / 2, fire.y + fire.h - 12, 34, 15,
         [[0, '#d4632a'], [0.35, '#a3411b'], [0.7, 'rgba(138,52,22,0.55)'],
          [1, 'rgba(138,52,22,0)']]);

  }

  /* --- leaded casement, with the night behind it -------------------------- */
  function paintWindow(win) {
    var x = win.x, y = win.y, w = win.w, h = win.h;
    r(x - 7, y - 7, w + 14, h + 14, RC.woodDark);
    r(x - 4, y - 4, w + 8, h + 8, RC.wood);
    hl(x - 4, y - 4, w + 8, RC.woodHi);
    r(x, y, w, h, RC.glass);

    /* a little depth in the dark outside */
    ell(x + w * 0.6, y + h * 0.35, 14, 11, RC.glassLit);
    ell(x + w * 0.25, y + h * 0.75, 10, 8, RC.glassDark);

    /* diamond leading */
    for (var gy = 0; gy < h; gy++) {
      for (var gx = 0; gx < w; gx++) {
        if ((gx + gy) % 13 === 0 || (gx - gy + 1300) % 13 === 0) p(x + gx, y + gy, RC.lead);
      }
    }
    /* the two casements, and the catch between them */
    r(x + Math.floor(w / 2) - 1, y - 4, 3, h + 8, RC.wood);
    vl(x + Math.floor(w / 2) - 1, y - 4, h + 8, RC.woodHi);
    r(x + Math.floor(w / 2) - 2, y + Math.floor(h / 2), 5, 4, RC.iron);

    /* sill, with a stoneware jug and a clay pipe on it */
    r(x - 11, y + h + 5, w + 22, 6, RC.woodLit);
    hl(x - 11, y + h + 5, w + 22, RC.woodHi);
    r(x - 11, y + h + 11, w + 22, 2, RC.woodDeep);
    r(x + 3, y + h - 5, 9, 10, RC.stoneDim);
    r(x + 3, y + h - 7, 9, 3, RC.stone);
    r(x + 12, y + h - 2, 3, 4, RC.stoneDim);
    r(x + 22, y + h + 2, 15, 2, RC.paper);
    r(x + 36, y + h, 3, 4, RC.paper);
  }

  /* --- the trade sign the house is named for ----------------------------- */
  function paintSign() {
    for (var cy = 18; cy < 26; cy += 2) { p(210, cy, RC.ironLit); p(240, cy, RC.ironLit); }
    r(197, 25, 56, 32, RC.woodDark);
    hl(197, 25, 56, RC.woodHi);
    r(199, 27, 52, 28, RC.signDark);
    r(200, 28, 50, 26, RC.signField);
    hl(200, 28, 50, RC.signHi);
    /* a crude dragon in profile, which is all the sign ever was */
    poly([[208, 45], [214, 39], [224, 37], [234, 41], [241, 39],
          [239, 46], [226, 49], [214, 48]], RC.dragon);
    poly([[222, 39], [229, 31], [235, 42]], RC.dragonDim);
    poly([[208, 45], [201, 50], [206, 43]], RC.dragon);
    poly([[234, 41], [244, 36], [247, 41], [238, 46]], RC.dragon);
    r(216, 48, 2, 5, RC.dragonDim);
    r(230, 49, 2, 4, RC.dragonDim);
    p(244, 38, RC.beamDark);
  }

  /* --- cupboard of pewter, stoneware and a little china ------------------ */
  function paintCupboard(shelf) {
    r(288, 22, 88, 126, RC.woodDeep);
    r(291, 27, 82, 118, '#1a0d0c');
    r(285, 19, 94, 6, RC.woodLit);
    hl(285, 19, 94, RC.woodHi);
    vl(289, 25, 123, RC.woodDark);
    vl(374, 25, 123, RC.woodDark);

    for (var row = 0; row < shelf.rows; row++) {
      var sy = shelf.y + row * shelf.dy + 28;
      for (var col = 0; col < shelf.cols; col++) {
        paintVessel(shelf.x + col * shelf.dx + 5, sy, (row * 2 + col) % 3);
      }
      r(290, sy, 84, 3, RC.wood);
      hl(290, sy, 84, RC.woodHi);
      r(290, sy + 3, 84, 1, RC.woodBlack);
    }

    /* the closed cupboard under the shelves */
    r(288, 148, 88, COUNTER_Y - 148, RC.woodDark);
    hl(288, 148, 88, RC.woodHi);
    r(293, 153, 36, 14, RC.woodDeep);
    r(294, 154, 34, 12, '#3a1b15');
    r(335, 153, 36, 14, RC.woodDeep);
    r(336, 154, 34, 12, '#3a1b15');

    /* bunches of herbs hung up to dry, either side */
    paintHerbs(283, 34); paintHerbs(283, 92); paintHerbs(379, 40); paintHerbs(379, 98);
  }

  function paintVessel(cx, baseY, kind) {
    if (kind === 0) {                          /* pewter tankard */
      r(cx - 5, baseY - 14, 10, 14, RC.pewterDim);
      r(cx - 5, baseY - 14, 8, 13, RC.pewter);
      hl(cx - 5, baseY - 15, 10, RC.pewterLit);
      vl(cx - 4, baseY - 13, 11, RC.pewterLit);
      r(cx + 5, baseY - 10, 3, 6, RC.pewterDim);
    } else if (kind === 1) {                   /* stoneware jar */
      r(cx - 4, baseY - 15, 9, 15, RC.stoneDim);
      r(cx - 4, baseY - 15, 9, 4, RC.stone);
      vl(cx - 3, baseY - 11, 11, RC.stone);
      hl(cx - 4, baseY - 8, 9, '#3f2417');
    } else {                                   /* china, imported and dear */
      ell(cx, baseY - 4, 6, 5, RC.china);
      r(cx - 6, baseY - 8, 13, 2, RC.chinaBlue);
      hl(cx - 5, baseY - 9, 11, RC.china);
    }
  }

  function paintHerbs(x, y) {
    vl(x, y, 5, RC.woodDark);
    for (var i = 0; i < 9; i++) {
      var lean = ((i % 3) - 1);
      var sx = x + lean, sy = y + 5 + i * 2;
      vl(sx, sy, 3, i % 2 ? RC.herbDim : RC.herb);
      p(sx + lean, sy + 2, RC.herbDim);
    }
    p(x, y + 24, RC.herbDim);
  }

  /* --- the bar, running the whole width of the room ----------------------- */
  function paintBar() {
    r(0, COUNTER_Y, W, H - COUNTER_Y, RC.woodDeep);

    /* the top the player works on */
    r(0, COUNTER_Y, W, 18, RC.wood);
    hl(0, COUNTER_Y, W, RC.woodHi);
    hl(0, COUNTER_Y + 1, W, RC.woodLit);
    for (var i = 0; i < 34; i++) {
      var gx = (i * 41) % W, gy = COUNTER_Y + 5 + ((i * 17) % 12);
      hl(gx, gy, 8 + (i % 11), i % 3 ? RC.woodLit : RC.woodDark);
    }
    /* front edge, then the panelled face below it */
    r(0, COUNTER_Y + 18, W, 3, RC.woodBlack);
    r(0, COUNTER_Y + 21, W, H - COUNTER_Y - 21, RC.woodDeep);
    for (var px = 8; px < W - 12; px += 60) {
      r(px, COUNTER_Y + 27, 48, 22, RC.woodDark);
      r(px + 1, COUNTER_Y + 28, 46, 20, '#241110');
      hl(px + 1, COUNTER_Y + 28, 46, RC.woodDark);
    }
  }

  function drawRoom(f) {
    var flick = 0.6 + 0.4 * Math.sin(f * 0.09) * Math.sin(f * 0.031);
    var fx = backdrop ? B : DRAWN;

    /* The room itself is a still picture either way — painted, or drawn once
       and cached. Only the things that move are drawn per frame. */
    bctx.drawImage(backdrop || tavern(), 0, 0);

    if (fx.window) drawRainPane(fx.window.x, fx.window.y, fx.window.w, fx.window.h, f, fx.window.lantern);
    if (fx.fire) {
      if (fx.fire.style === 'tips') drawFireTips(fx.fire.x, fx.fire.y, fx.fire.w, fx.fire.h, f);
      else drawFire(fx.fire.x, fx.fire.y, fx.fire.w, fx.fire.h, f, flick);
    }
    (fx.candles || []).forEach(function (c, i) {
      if (c.flameOnly) drawFlame(c.x, c.y, f + i * 7);
      else drawCandle(c.x, c.y - 16, f + i * 7);
    });
    hearthGlow(flick, fx.glow);
    drawTarnish();
    drawRings();
  }

  /* Weather behind the glass. Kept on its own so a painted window can have
     rain running down it too. */
  function drawRainPane(x, y, w, h, f, lantern) {
    /* the street lantern outside gutters out toward the small hours. A
       painted window usually has its own depth already, so this can be
       switched off with `window.lantern: false`. */
    if (lantern !== false && phase < 0.85) {
      ell(x + 40, y + 44, 16 - Math.round(phase * 6), 12 - Math.round(phase * 5), C.slate);
      if (phase < 0.6) ell(x + 40, y + 44, 8, 6, C.slateLit);
    }
    for (var i = 0; i < 30; i++) {
      var rx = x + 2 + Math.floor(rnd(i * 3.1) * (w - 4));
      var ry = y + 2 + ((Math.floor(rnd(i * 7.7) * h) + f * 2) % (h - 4));
      vl(rx, ry, 3, C.pewterDim);
    }
  }

  /* Flame, coals and sparks in a firebox. Separate from the brickwork so a
     painted hearth can still have a fire burning down in it. */
  function drawFire(fx, fy, fw, fh, f, flick) {
    /* flame, flickering, and sinking toward embers as the evening wears on */
    var burn = 1 - phase * 0.72;
    var fl = Math.round(flick * 7 * burn);
    ell(fx + fw / 2, fy + fh - 20, Math.round(16 * burn) + 4, Math.round((12 + fl) * burn) + 2, C.ember);
    if (burn > 0.45) {
      ell(fx + fw / 2, fy + fh - 22, Math.round(11 * burn), Math.round((9 + fl) * burn), C.amber);
      ell(fx + fw / 2, fy + fh - 24, Math.round(6 * burn), Math.round((6 + fl) * burn), C.flame);
    }
    if (burn > 0.7) ell(fx + fw / 2, fy + fh - 25, 3, 3 + Math.round(fl / 2), C.flameHot);
    /* a few coals still glowing even once the flame is gone */
    for (var cg = 0; cg < 4; cg++) {
      p(fx + 10 + cg * 9, fy + fh - 10, (cg + Math.floor(f / 20)) % 3 === 0 ? C.amber : C.ember);
    }
    /* sparks, which stop once there’s nothing left to throw them */
    if (burn > 0.5) {
      for (var s = 0; s < 5; s++) {
        var sy = fy + fh - 30 - ((f + s * 13) % 26);
        p(fx + 12 + ((s * 11 + Math.floor(f / 4)) % (fw - 24)), sy, C.amberLit);
      }
    }
  }

  /* A quieter fire, for a hearth that is already painted. Solid ellipses of
     flame would hide the logs somebody drew, so this only adds the parts that
     actually move: tongues licking up off the log line, coals breathing, and
     the odd spark. */
  function drawFireTips(fx, fy, fw, fh, f) {
    var burn = 1 - phase * 0.72;
    var base = fy + fh - 10;
    /* the fire has a body as well as tongues, or the hearth reads as a hole */
    if (burn > 0.2) {
      var bw = Math.round(fw * 0.34 * burn), bh = Math.round(7 * burn) + 2;
      ell(fx + fw / 2, base - bh + 2, bw, bh, C.ember);
      if (burn > 0.45) ell(fx + fw / 2, base - bh + 1, Math.round(bw * 0.6), Math.max(2, bh - 2), C.amber);
    }
    for (var i = 0; i < 5; i++) {
      var t = 0.5 + 0.5 * Math.sin(f * (0.11 + i * 0.037) + i * 2.3);
      var h = Math.round((5 + t * 13) * burn);
      if (h < 2) continue;
      var cx = fx + Math.round(fw * (0.22 + i * 0.14));
      vl(cx, base - h, h, C.ember);
      if (burn > 0.4) vl(cx, base - h + 2, Math.max(1, h - 3), C.amber);
      if (burn > 0.6 && h > 5) p(cx, base - h + 1, C.flame);
      if (h > 7) p(cx + (i % 2 ? 1 : -1), base - h + 3, C.ember);
    }
    /* coals, which keep breathing after the flame has gone */
    for (var cg = 0; cg < 5; cg++) {
      var gx = fx + 8 + cg * Math.round((fw - 16) / 5);
      p(gx, base + 2, (cg + Math.floor(f / 22)) % 3 === 0 ? C.amber : C.ember);
    }
    if (burn > 0.5) {
      for (var s = 0; s < 4; s++) {
        var sy = base - 14 - ((f + s * 17) % 30);
        p(fx + 10 + ((s * 13 + Math.floor(f / 5)) % (fw - 20)), sy, C.amberLit);
      }
    }
  }

  /* Just the flame on a wick, sinking as the candle under it burns down. */
  function drawFlame(x, y, f) {
    var fy = y - 3 + Math.round(phase * 6);
    var w = (f % 24 < 12) ? 0 : 1;
    p(x + 1 + w, fy + 2, C.amberLit);
    p(x + 1 + w, fy + 1, C.flame);
    if (phase < 0.8) p(x + 1 + w, fy, C.flameHot);
    p(x + 2 + w, fy + 2, C.amber);
  }

  function drawCandle(x, y, f) {
    /* A tallow candle burns down over the evening. The stub sinks toward the
       stick and the flame goes with it, so the room quietly gets darker. */
    var used = Math.round(phase * 6);
    var top = y + 8 + used, len = 8 - used;
    if (len > 0) r(x, top, 4, len, C.cream);
    if (used > 2) { p(x - 1, top + 1, C.linenDim); p(x + 4, top + 2, C.linenDim); }
    r(x - 2, y + 16, 8, 2, C.pewter);
    drawFlame(x, y + 8, f);
  }

  /* Dulled pewter, waiting for a cloth. Same rule as the rings: it has to be
     obvious, so it is drawn over the shelf rather than painted into it. */
  function drawTarnish() {
    rings.forEach(function (g) {
      if (g.kind !== 'tarnish') return;
      ell(g.x, g.y, g.r, g.r, C.shadow);
      ell(g.x, g.y, g.r - 2, g.r - 2, '#4a4238');
      ell(g.x - 2, g.y - 2, Math.max(1, g.r - 5), Math.max(1, g.r - 5), '#6b6154');
    });
  }

  /* Rings and spills. Drawn with real contrast against the wood — a dark wet
     ring with a lit rim — because a stain the player can’t see isn’t a chore,
     it’s a bug. Kept separate so a painted bar can be dirtied too. */
  function drawRings() {
    rings.forEach(function (g) {
      if (g.kind !== 'ring') return;
      var ry = Math.max(2, Math.round(g.r * 0.5));
      bctx.save();
      /* Darken whatever is underneath rather than painting a fixed brown over
         it, so a ring reads as a wet stain on any bar — drawn or painted. */
      bctx.globalCompositeOperation = 'multiply';
      bctx.globalAlpha = 0.62;
      ell(g.x, g.y, g.r, ry, C.brown);
      /* the middle lifts again, so it’s a ring a cup left and not a hole */
      bctx.globalCompositeOperation = 'lighter';
      bctx.globalAlpha = 0.14;
      ell(g.x, g.y, g.r - 3, Math.max(1, ry - 2), C.linenDim);
      bctx.restore();
      /* the highlight along the top that says it hasn’t dried yet */
      bctx.save();
      bctx.globalAlpha = 0.75;
      hl(g.x - Math.round(g.r * 0.5), g.y - ry, Math.round(g.r * 0.9), C.linenDim);
      p(g.x + Math.round(g.r * 0.4), g.y + 1, C.linen);
      bctx.restore();
    });
  }

  /* a served cup steaming on the counter in front of the customer */
  function drawServedCup(cx, f, tint) {
    var y = COUNTER_Y - 20;
    r(cx - 10, y, 20, 18, C.linenDim);
    r(cx - 10, y, 20, 4, C.linen);
    r(cx - 8, y + 4, 16, 4, tint || C.brown);
    r(cx + 10, y + 5, 5, 9, C.linenDim);
    r(cx + 11, y + 6, 3, 7, C.wood);
    r(cx - 13, y + 18, 26, 3, C.linen);
    for (var s = 0; s < 4; s++) {
      var sy = y - 5 - ((f + s * 8) % 20);
      var sx = cx - 6 + s * 4 + Math.round(Math.sin((f + s * 20) * 0.14) * 2);
      p(sx, sy, C.plasterLit);
    }
  }

  /* =========================================================================
     THE CAST

     Drawn in the manner of a modern pixel-art visual novel rather than
     assembled from parts:

       - every figure carries a hard dark outline, which is the single thing
         that makes a sprite read as *drawn* instead of stacked
       - three tones per material, hard-edged, no blending
       - hair is a few big graphic shapes with one bright band across it
       - hands rest on the counter, so the figure belongs to the room

     The outline is found rather than drawn: the figure is painted onto its own
     transparent layer, then any empty pixel touching a filled one is inked.
     That way it wraps whatever silhouette a character happens to have.

     Each finished pose is cached, so all of this happens once per expression
     rather than sixty times a second. The idle breath is a one-pixel
     translation at blit time.
     ========================================================================= */

  /* Expression = brow angle and lift, eye opening, mouth. One table, so every
     character can wear every mood without extra art. */
  var EXPR = {
    neutral:    { lift: 0,  tilt: 0,  open: 1.0, mouth: 'flat' },
    warm:       { lift: 1,  tilt: 1,  open: 0.85, mouth: 'smile' },
    bright:     { lift: 2,  tilt: 1,  open: 1.15, mouth: 'grin' },
    worried:    { lift: 1,  tilt: -1, open: 1.0, mouth: 'small' },
    downcast:   { lift: -1, tilt: -1, open: 0.45, mouth: 'small' },
    stern:      { lift: -2, tilt: 2,  open: 0.7, mouth: 'frown' },
    thoughtful: { lift: 0,  tilt: 1,  open: 0.7, mouth: 'small' },
    surprised:  { lift: 3,  tilt: 0,  open: 1.35, mouth: 'open' }
  };

  /* --- the layer a figure is painted on, and its outline ------------------ */
  var pbuf = null, pctx = null, poseCache = {};

  function personLayer() {
    if (!pbuf) {
      pbuf = document.createElement('canvas');
      pbuf.width = W; pbuf.height = H;
      pctx = pbuf.getContext('2d');
      pctx.imageSmoothingEnabled = false;
    }
    return pctx;
  }

  /* Ink every empty pixel that touches a filled one. */
  function inkEdges(ctx, colour) {
    var img = ctx.getImageData(0, 0, W, H), d = img.data;
    var alpha = new Uint8Array(W * H);
    for (var i = 0; i < W * H; i++) alpha[i] = d[i * 4 + 3] > 8 ? 1 : 0;
    var cr = parseInt(colour.slice(1, 3), 16),
        cg = parseInt(colour.slice(3, 5), 16),
        cb = parseInt(colour.slice(5, 7), 16);
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var k = y * W + x;
        if (alpha[k]) continue;
        if ((x > 0 && alpha[k - 1]) || (x < W - 1 && alpha[k + 1]) ||
            (y > 0 && alpha[k - W]) || (y < H - 1 && alpha[k + W])) {
          var o = k * 4;
          d[o] = cr; d[o + 1] = cg; d[o + 2] = cb; d[o + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /* --- drawing helpers bound to whichever context we are painting on ------ */
  function pen(ctx) {
    return {
      r: function (x, y, w, h, c) {
        if (!c) return; ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
      },
      e: function (cx, cy, rx, ry, c) {
        if (!c) return; ctx.fillStyle = c;
        for (var yy = -ry; yy <= ry; yy++) {
          var t = 1 - (yy * yy) / (ry * ry); if (t < 0) continue;
          var half = Math.round(rx * Math.sqrt(t)); if (half <= 0) continue;
          ctx.fillRect((cx - half) | 0, (cy + yy) | 0, half * 2, 1);
        }
      },
      poly: function (pts, c) {
        if (!c) return; ctx.fillStyle = c;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath(); ctx.fill();
      }
    };
  }

  /* =======================================================================
     THE FIGURE
     ======================================================================= */

  var CX = 190;                 /* everyone sits here                        */
  var TOP = 30;                 /* crown of the head                         */
  var HW = 23, HH = 29;         /* head half-width, half-height              */
  var CHIN = TOP + HH * 2;      /* 88                                        */
  var SHOULDER = CHIN + 26;     /* 114 — a longer neck reads older and calmer */

  function paintFigure(ctx, cfg, e) {
    var g = pen(ctx);
    var sw = cfg.build === 'broad' ? 148 : cfg.build === 'slight' ? 112 : 130;
    var half = sw / 2;

    /* ---- torso, with shoulders that slope ------------------------------- */
    g.poly([[CX - half, COUNTER_Y + 8], [CX - half + 6, SHOULDER + 6],
            [CX - 30, SHOULDER - 8], [CX - 14, SHOULDER - 14],
            [CX + 14, SHOULDER - 14], [CX + 30, SHOULDER - 8],
            [CX + half - 6, SHOULDER + 6], [CX + half, COUNTER_Y + 8]], cfg.coat.b);
    /* the fire is on the left, so the light is too */
    g.poly([[CX - half, COUNTER_Y + 8], [CX - half + 6, SHOULDER + 6],
            [CX - 30, SHOULDER - 8], [CX - 22, SHOULDER - 4],
            [CX - 26, COUNTER_Y + 8]], cfg.coat.l);
    g.poly([[CX + half, COUNTER_Y + 8], [CX + half - 6, SHOULDER + 6],
            [CX + 30, SHOULDER - 8], [CX + 24, SHOULDER - 2],
            [CX + 28, COUNTER_Y + 8]], cfg.coat.s);
    /* seams where the arms meet the body, so the sleeves read as separate */
    g.poly([[CX - 30, SHOULDER - 6], [CX - 26, SHOULDER - 6],
            [CX - 32, COUNTER_Y + 8], [CX - 36, COUNTER_Y + 8]], cfg.coat.s);
    g.poly([[CX + 30, SHOULDER - 6], [CX + 26, SHOULDER - 6],
            [CX + 32, COUNTER_Y + 8], [CX + 36, COUNTER_Y + 8]], cfg.coat.s);

    /* ---- shirt and waistcoat, a wedge down the middle ------------------- */
    g.poly([[CX - 18, SHOULDER - 12], [CX + 18, SHOULDER - 12],
            [CX + 15, COUNTER_Y + 8], [CX - 15, COUNTER_Y + 8]], cfg.vest);
    g.poly([[CX - 18, SHOULDER - 12], [CX - 5, SHOULDER - 12],
            [CX - 7, COUNTER_Y + 8], [CX - 15, COUNTER_Y + 8]], cfg.vestL);
    if (cfg.buttons) {
      for (var bt = 0; bt < 4; bt++) {
        g.e(CX + 8, SHOULDER + 14 + bt * 14, 2, 2, cfg.button || C.linenDim);
      }
    }

    /* ---- lapels: the shape that says "eighteenth century" --------------- */
    g.poly([[CX - 26, SHOULDER - 12], [CX - 6, SHOULDER - 6],
            [CX - 14, SHOULDER + 34], [CX - 34, SHOULDER + 16]], cfg.coat.l);
    g.poly([[CX + 26, SHOULDER - 12], [CX + 6, SHOULDER - 6],
            [CX + 14, SHOULDER + 34], [CX + 34, SHOULDER + 16]], cfg.coat.s);
    g.poly([[CX - 26, SHOULDER - 12], [CX - 12, SHOULDER - 8],
            [CX - 18, SHOULDER + 22], [CX - 30, SHOULDER + 10]], cfg.coat.b);
    g.poly([[CX + 26, SHOULDER - 12], [CX + 12, SHOULDER - 8],
            [CX + 18, SHOULDER + 22], [CX + 30, SHOULDER + 10]], cfg.coat.b);

    /* ---- neck ----------------------------------------------------------- */
    g.r(CX - 11, CHIN - 12, 22, 24, cfg.skin.s);
    g.r(CX - 11, CHIN - 12, 7, 24, cfg.skin.b);

    /* ---- what is at the throat ------------------------------------------ */
    if (cfg.collar === 'bands') {                 /* clergyman's linen bands */
      g.poly([[CX - 22, SHOULDER - 12], [CX + 22, SHOULDER - 12],
              [CX + 14, SHOULDER + 2], [CX - 14, SHOULDER + 2]], C.white);
      g.r(CX - 9, SHOULDER + 2, 7, 22, C.white);
      g.r(CX + 2, SHOULDER + 2, 7, 22, C.white);
      g.r(CX - 9, SHOULDER + 2, 3, 22, '#dcd6c6');
    } else if (cfg.collar === 'kerchief') {       /* a woman's neckerchief   */
      g.poly([[CX - 30, SHOULDER - 10], [CX, SHOULDER + 4], [CX + 30, SHOULDER - 10],
              [CX + 24, SHOULDER + 30], [CX - 24, SHOULDER + 30]], C.cream);
      g.poly([[CX - 30, SHOULDER - 10], [CX - 6, SHOULDER + 2],
              [CX - 12, SHOULDER + 30], [CX - 24, SHOULDER + 30]], C.white);
      g.poly([[CX + 30, SHOULDER - 10], [CX + 6, SHOULDER + 2],
              [CX + 12, SHOULDER + 30], [CX + 24, SHOULDER + 30]], C.linenDim);
    } else {                                      /* a wound linen neckcloth */
      g.e(CX, SHOULDER - 8, 13, 8, C.cream);
      g.e(CX - 4, SHOULDER - 10, 8, 5, C.white);
      g.e(CX + 6, SHOULDER - 7, 6, 4, C.linen);
      g.poly([[CX - 5, SHOULDER - 4], [CX + 5, SHOULDER - 4],
              [CX + 3, SHOULDER + 12], [CX - 3, SHOULDER + 11]], C.cream);
      g.r(CX - 3, SHOULDER - 2, 2, 9, C.white);
    }

    /* ---- the mass of the hair sits behind the skull --------------------- */
    paintHair(g, cfg, 'back');

    /* ---- head ----------------------------------------------------------- */
    g.e(CX, TOP + HH, HW, HH, cfg.skin.b);
    /* jaw, a touch squarer than the cranium */
    g.poly([[CX - HW + 3, TOP + HH + 4], [CX + HW - 3, TOP + HH + 4],
            [CX + 13, CHIN - 1], [CX - 13, CHIN - 1]], cfg.skin.b);
    /* cel shadow down the right, light down the left */
    g.poly([[CX + 13, TOP + 10], [CX + HW, TOP + HH - 8], [CX + HW - 3, TOP + HH + 10],
            [CX + 12, CHIN - 3], [CX + 14, CHIN - 10]], cfg.skin.s);
    g.poly([[CX - 12, TOP + 12], [CX - HW + 2, TOP + HH - 6], [CX - HW + 5, TOP + HH + 6],
            [CX - 13, TOP + HH + 10]], cfg.skin.l);
    /* under the jaw */
    g.poly([[CX - 12, CHIN - 6], [CX + 12, CHIN - 6], [CX + 10, CHIN], [CX - 10, CHIN]], cfg.skin.s);
    /* ears */
    g.e(CX - HW + 1, TOP + HH + 3, 3, 6, cfg.skin.s);
    g.e(CX + HW - 1, TOP + HH + 3, 3, 6, cfg.skin.s);

    /* ---- brows ---------------------------------------------------------- */
    var browY = TOP + 24 - e.lift;
    var t = e.tilt;
    g.poly([[CX - 19, browY + 3 + t], [CX - 6, browY - t], [CX - 6, browY + 3 - t],
            [CX - 19, browY + 6 + t]], cfg.hair.s);
    g.poly([[CX + 6, browY - t], [CX + 19, browY + 3 + t], [CX + 19, browY + 6 + t],
            [CX + 6, browY + 3 - t]], cfg.hair.s);

    /* ---- eyes ----------------------------------------------------------- */
    paintEye(g, CX - 12, TOP + 33, cfg, e, 1);
    paintEye(g, CX + 12, TOP + 33, cfg, e, -1);

    /* ---- nose: a shadow, not a line ------------------------------------- */
    g.poly([[CX + 1, TOP + 36], [CX + 4, TOP + 45], [CX - 3, TOP + 45]], cfg.skin.s);
    g.r(CX - 3, TOP + 44, 6, 2, cfg.skin.s);
    g.r(CX - 2, TOP + 43, 3, 1, cfg.skin.l);

    /* ---- mouth ---------------------------------------------------------- */
    var mY = TOP + 51;
    if (e.mouth === 'flat') g.r(CX - 6, mY, 13, 2, cfg.lip);
    else if (e.mouth === 'small') g.r(CX - 4, mY, 9, 2, cfg.lip);
    else if (e.mouth === 'smile') {
      g.r(CX - 6, mY, 13, 2, cfg.lip);
      g.r(CX - 8, mY - 2, 2, 2, cfg.lip); g.r(CX + 7, mY - 2, 2, 2, cfg.lip);
      g.r(CX - 5, mY + 2, 11, 1, cfg.skin.l);
    } else if (e.mouth === 'grin') {
      g.poly([[CX - 9, mY - 1], [CX + 9, mY - 1], [CX + 6, mY + 5], [CX - 6, mY + 5]], cfg.lip);
      g.r(CX - 6, mY, 12, 2, C.white);
    } else if (e.mouth === 'frown') {
      g.r(CX - 6, mY + 1, 13, 2, cfg.lip);
      g.r(CX - 8, mY + 3, 2, 2, cfg.lip); g.r(CX + 7, mY + 3, 2, 2, cfg.lip);
    } else if (e.mouth === 'open') {
      g.e(CX, mY + 3, 6, 5, cfg.lip);
      g.e(CX, mY + 4, 4, 3, '#3a1a18');
    }

    paintHair(g, cfg, 'front');
    if (cfg.spectacles) paintSpectacles(g, cfg);
    if (cfg.hands) paintHands(g, cfg);
    if (cfg.ledger) {
      g.r(CX + 40, COUNTER_Y - 20, 30, 18, C.redDim);
      g.r(CX + 42, COUNTER_Y - 18, 26, 15, C.linen);
      for (var ln = 0; ln < 5; ln++) g.r(CX + 46, COUNTER_Y - 15 + ln * 3, 18, 1, C.linenDim);
    }
  }

  /* --- eyes: sclera, iris, pupil, catchlight, and a heavy lash line ------ */
  function paintEye(g, x, y, cfg, e, side) {
    var w = 13, h = Math.max(2, Math.round(9 * e.open));
    if (e.open < 0.5) {
      g.r(x - 6, y + 3, 13, 2, cfg.hair.s);
      g.r(x - 5, y + 5, 11, 1, cfg.skin.s);
      return;
    }
    g.e(x, y + h / 2, w / 2, h / 2, C.white);
    g.e(x, y + h / 2 + 1, w / 2 - 1, h / 2 - 1, '#e2dccd');
    /* iris sits low and slightly inward, so they are looking at you */
    var ix = x - side * 1;
    g.e(ix, y + h / 2 + 1, 4, Math.max(2, h / 2), cfg.eye.b);
    g.e(ix, y + h / 2 + 2, 3, Math.max(1, h / 2 - 1), cfg.eye.s);
    g.e(ix, y + h / 2 + 1, 2, Math.max(1, h / 2 - 2), C.ink);
    g.r(ix - 3, y + 1, 2, 2, C.white);            /* catchlight */
    /* lashes and lid */
    g.r(x - 7, y - 1, 15, 2, cfg.hair.s);
    g.r(x - 7 + (side > 0 ? 0 : 12), y + 1, 3, 2, cfg.hair.s);
    g.r(x - 6, y + h, 13, 1, cfg.skin.s);
  }

  function paintSpectacles(g, cfg) {
    var y = TOP + 33;
    var m = C.pewterLit;
    [-12, 12].forEach(function (dx) {
      g.r(CX + dx - 9, y - 2, 18, 1, m);
      g.r(CX + dx - 9, y + 10, 18, 1, m);
      g.r(CX + dx - 9, y - 2, 1, 12, m);
      g.r(CX + dx + 8, y - 2, 1, 12, m);
    });
    g.r(CX - 4, y + 2, 8, 1, m);
    g.r(CX - 22, y, 3, 1, m); g.r(CX + 20, y, 3, 1, m);
  }

  /* --- hands on the counter, which is what puts them in the room --------- */
  function paintHands(g, cfg) {
    var y = COUNTER_Y - 14;
    /* Placed at the ends of the sleeves rather than anywhere on the counter,
       with a turned-back cuff and a strip of shirt between — otherwise they
       read as two objects lying on the bar rather than as this person's hands. */
    [[-44, 1], [18, -1]].forEach(function (h) {
      var x = CX + h[0], lit = h[1] > 0;
      /* the sleeve coming down to the wrist */
      g.poly([[x - 2, y - 24], [x + 28, y - 24], [x + 26, y - 4], [x, y - 4]], cfg.coat.b);
      g.poly([[x - 2, y - 24], [x + 9, y - 24], [x + 8, y - 4], [x, y - 4]],
             lit ? cfg.coat.l : cfg.coat.s);
      /* the turned-back cuff */
      g.r(x - 3, y - 9, 32, 7, lit ? cfg.coat.l : cfg.coat.b);
      g.r(x - 3, y - 9, 32, 2, cfg.coat.l);
      g.r(x - 3, y - 3, 32, 2, cfg.coat.s);
      /* a strip of shirt at the wrist */
      g.r(x + 1, y - 2, 26, 3, C.cream);
      /* the hand itself */
      g.poly([[x + 1, y + 1], [x + 27, y + 1], [x + 25, y + 12], [x + 3, y + 12]], cfg.skin.b);
      g.e(x + 25, y + 6, 5, 6, cfg.skin.b);
      g.e(x + 3, y + 6, 4, 6, cfg.skin.b);
      g.poly([[x + 1, y + 1], [x + 10, y + 1], [x + 9, y + 8], [x + 2, y + 8]],
             lit ? cfg.skin.l : cfg.skin.b);
      g.r(x + 2, y + 10, 24, 2, cfg.skin.s);
      /* knuckles and fingers */
      for (var fgr = 0; fgr < 3; fgr++) g.r(x + 8 + fgr * 6, y + 3, 1, 9, cfg.skin.s);
      g.r(x + 3, y + 2, 22, 1, cfg.skin.l);
      if (cfg.inkStains) {
        g.r(x + 7, y + 5, 2, 2, '#3a3550');
        g.r(x + 16, y + 4, 2, 1, '#3a3550');
        g.r(x + 21, y + 8, 1, 2, '#3a3550');
      }
    });
  }

  /* =======================================================================
     HAIR — big shapes, one bright band. Two passes so a fringe can fall in
     front of the brow while the mass sits behind the head.
     ======================================================================= */
  function paintHair(g, cfg, pass) {
    var s = cfg.style;

    if (s === 'cap') {                            /* a woman's linen cap     */
      if (pass === 'back') {
        g.e(CX, TOP + HH - 4, HW + 2, HH - 4, cfg.hair.b);
        g.e(CX - 11, TOP + HH - 6, 9, 14, cfg.hair.l);
        g.e(CX - HW - 1, TOP + HH + 14, 5, 10, cfg.hair.b);
        g.e(CX + HW + 1, TOP + HH + 14, 5, 10, cfg.hair.s);
      } else {
        g.e(CX, TOP + 11, HW + 4, 13, C.cream);
        g.e(CX, TOP + 9, HW, 10, C.white);
        g.e(CX - 9, TOP + 8, 9, 5, '#fffaf0');
        g.r(CX - HW - 4, TOP + 13, 5, 14, C.cream);
        g.r(CX + HW - 1, TOP + 13, 5, 14, C.linenDim);
        g.poly([[CX - HW - 4, TOP + 18], [CX + HW + 4, TOP + 18],
                [CX + HW, TOP + 22], [CX - HW, TOP + 22]], C.linenDim);
        /* a little auburn showing at the temples */
        g.poly([[CX - 20, TOP + 20], [CX - 8, TOP + 17], [CX - 9, TOP + 24], [CX - 19, TOP + 26]], cfg.hair.b);
        g.poly([[CX + 20, TOP + 20], [CX + 8, TOP + 17], [CX + 9, TOP + 24], [CX + 19, TOP + 26]], cfg.hair.s);
      }
      return;
    }

    if (s === 'wig') {                            /* a clergyman's bob wig   */
      if (pass === 'back') {
        g.e(CX, TOP + HH - 2, HW + 9, HH + 4, cfg.hair.b);
        g.e(CX - HW - 6, TOP + HH + 16, 10, 15, cfg.hair.b);
        g.e(CX + HW + 6, TOP + HH + 16, 10, 15, cfg.hair.s);
        g.e(CX - HW - 6, TOP + HH + 13, 7, 9, cfg.hair.l);
      } else {
        g.e(CX, TOP + 12, HW + 6, 15, cfg.hair.b);
        g.e(CX - 9, TOP + 9, 13, 8, cfg.hair.l);
        /* rows of curls, which is what a bob wig actually is */
        for (var row = 0; row < 3; row++) {
          for (var i = -3; i <= 3; i++) {
            g.e(CX + i * 10, TOP + 8 + row * 9, 5, 4,
                (i + row) % 2 ? cfg.hair.s : cfg.hair.b);
          }
        }
        g.e(CX - 14, TOP + 8, 5, 4, cfg.hair.l);
        g.e(CX + 4, TOP + 8, 5, 4, cfg.hair.l);
      }
      return;
    }

    /* --- everything else is real hair, with the bright band -------------- */
    if (pass === 'back') {
      g.e(CX, TOP + HH - 5, HW + 4, HH, cfg.hair.b);
      if (s === 'queue') {                        /* tied back at the nape   */
        g.e(CX - HW - 3, TOP + HH + 12, 6, 15, cfg.hair.b);
        g.e(CX + HW + 3, TOP + HH + 12, 6, 15, cfg.hair.s);
        g.r(CX + HW + 2, CHIN - 4, 9, 26, cfg.hair.b);
        g.r(CX + HW + 2, CHIN - 4, 9, 5, C.black);
        g.e(CX + HW + 6, CHIN + 22, 5, 6, cfg.hair.s);
      } else if (s === 'crop') {
        g.e(CX - HW - 1, TOP + HH + 8, 5, 9, cfg.hair.b);
        g.e(CX + HW + 1, TOP + HH + 8, 5, 9, cfg.hair.s);
      } else {                                    /* full, brushed up        */
        g.e(CX, TOP + HH - 10, HW + 8, HH - 4, cfg.hair.b);
        g.e(CX - HW - 3, TOP + HH + 6, 6, 11, cfg.hair.b);
        g.e(CX + HW + 3, TOP + HH + 6, 6, 11, cfg.hair.s);
      }
      return;
    }

    /* fringe over the forehead */
    var browTop = TOP + 14;
    if (s === 'crop') {
      g.poly([[CX - HW - 1, browTop + 6], [CX - HW + 2, TOP + 1], [CX + HW - 2, TOP + 1],
              [CX + HW + 1, browTop + 6], [CX + 14, browTop + 2],
              [CX - 2, browTop + 7], [CX - 15, browTop + 1]], cfg.hair.b);
    } else if (s === 'queue') {
      g.poly([[CX - HW - 1, browTop + 5], [CX - HW + 1, TOP - 1], [CX + HW - 1, TOP - 1],
              [CX + HW + 1, browTop + 5], [CX + 18, browTop - 1],
              [CX + 2, browTop + 6], [CX - 16, browTop + 2]], cfg.hair.b);
    } else {
      g.poly([[CX - HW - 3, browTop + 4], [CX - HW, TOP - 5], [CX + HW, TOP - 5],
              [CX + HW + 3, browTop + 4], [CX + 16, browTop - 2],
              [CX - 4, browTop + 6], [CX - 18, browTop]], cfg.hair.b);
    }
    /* shaded side */
    g.poly([[CX + 8, TOP + 2], [CX + HW, TOP + 6], [CX + HW + 2, browTop + 4],
            [CX + 14, browTop + 1]], cfg.hair.s);

    /* the bright band — the signature of the style */
    var y0 = TOP + 5;
    g.poly([[CX - 20, y0 + 7], [CX - 13, y0], [CX - 6, y0 + 7], [CX + 1, y0],
            [CX + 9, y0 + 6], [CX + 9, y0 + 9], [CX + 1, y0 + 3],
            [CX - 6, y0 + 10], [CX - 13, y0 + 3], [CX - 20, y0 + 10]], cfg.hair.l);
  }

  /* =======================================================================
     OPTIONAL HAND-MADE SPRITES

     If js/sprites.js names an image for this character and expression, that is
     drawn instead of the figure above. Loading is lazy and failure is silent —
     a missing or broken file just falls back to the drawn version, so
     half-finished art never breaks the game.
     ======================================================================= */

  var spriteCache = {};                 /* url -> Image | 'failed'           */

  var EXPR_FALLBACK = {
    bright: ['warm', 'neutral'],
    downcast: ['worried', 'neutral'],
    stern: ['worried', 'neutral'],
    worried: ['neutral'],
    warm: ['neutral'],
    thoughtful: ['neutral'],
    surprised: ['neutral'],
    neutral: [],
    blink: []            /* no blink art simply means no blinking */
  };

  function spriteUrl(charId, expr) {
    var table = global.SPRITES;
    if (!table || !table[charId]) return null;
    var set = table[charId];
    var chain = [expr].concat(EXPR_FALLBACK[expr] || ['neutral']);
    for (var i = 0; i < chain.length; i++) {
      var url = set[chain[i]];
      /* Every path is declared here whether or not the file exists, so a
         declared path is not proof of a picture. Step over the ones we have
         already tried and failed to load, or a character missing a single
         expression drops to the built-in figure instead of falling back to
         their own face. */
      if (url && spriteCache[url] !== 'failed') return url;
    }
    return null;
  }

  function getSprite(url) {
    var got = spriteCache[url];
    if (got === 'failed') return null;
    if (got) return got.complete && got.naturalWidth ? got : null;
    var img = new Image();
    img.onerror = function () { spriteCache[url] = 'failed'; };
    img.src = url;
    spriteCache[url] = img;
    return null;
  }

  /* =======================================================================
     MOTION

     A still portrait sits there; a moving one is in the room. All of this
     works off a single image, and every displacement is a whole number of
     pixels so the art never falls off its grid — no scaling, no rotation,
     no resampling.
     ======================================================================= */

  /* Blink timing, in frames, at the 60fps the loop actually runs at.

     A five-frame blink is 83ms — roughly half the shortest a real one lasts,
     and it reads as a flicker or a dropped frame rather than as an eye
     closing. Nine frames is 150ms, the middle of the natural range.

     The gap is left a little longer than a resting person's fifteen-a-minute.
     These are people sitting still in a warm room talking to somebody, which
     is the low end of how often anyone blinks, and a patron who blinks on the
     human average looks anxious when there is nothing else moving. */
  var BLINK_HOLD  = 9;     /* 150ms  */
  var BLINK_GAP   = 170;   /* 2.8s minimum between blinks */
  var BLINK_VARY  = 220;   /* up to 6.5s */
  var BLINK_FIRST = 110;   /* the first one after sitting down comes sooner */

  var motion = { id: null, enter: -999, nudge: 0, expr: null, blinkAt: 0, blinkEnd: 0 };

  /* Called when somebody new sits down, so they arrive rather than appear. */
  function enterSprite(f) {
    motion.enter = f;
    motion.nudge = 0;
    motion.blinkAt = f + BLINK_FIRST + Math.floor(rnd(f) * 150);
    motion.blinkEnd = 0;
  }

  /* Called on each new line of dialogue: a small settle, as if they spoke. */
  function nudgeSprite() { motion.nudge = 3.2; }

  function motionOffsets(f, charId, exprName) {
    if (motion.id !== charId) { motion.id = charId; motion.expr = exprName; }
    if (motion.expr !== exprName) {
      motion.expr = exprName;
      motion.nudge = Math.max(motion.nudge, 2.4);   /* a beat on a mood change */
    }

    var age = f - motion.enter;
    var t = Math.max(0, Math.min(1, age / 20));
    var ease = 1 - Math.pow(1 - t, 3);

    var dy = Math.round((1 - ease) * 30);           /* rises into the seat   */
    /* Breath. One cycle every five seconds or so, which is a person sitting
       quietly — the old rate was a three-second cycle, closer to someone who
       has just climbed the stairs. */
    dy += Math.round(Math.sin(f * 0.021));
    if (motion.nudge > 0.15) {
      dy -= Math.round(motion.nudge);
      motion.nudge *= 0.82;
    } else motion.nudge = 0;

    /* No sideways drift. On a drawn figure it read as a shift of weight; on a
       painted one it reads as the whole person sliding along the bar. */
    var dx = 0;

    /* Blink, if there is a frame for it — otherwise this costs nothing. */
    var blinking = false;
    if (f > motion.blinkAt) {
      motion.blinkEnd = f + BLINK_HOLD;
      motion.blinkAt = f + BLINK_GAP + Math.floor(rnd(f * 0.37) * BLINK_VARY);
    }
    if (f < motion.blinkEnd) blinking = true;

    return { dx: dx, dy: dy, alpha: Math.min(1, t * 1.5), blinking: blinking, charId: charId };
  }

  /* The room is lit by one fire on the left and a couple of candles. Art
     arrives lit flat and bright, which puts a character on top of the room
     rather than in it. So each sprite is relit once when it loads: knocked
     down and warmed to the room's key, then given the hearth on one side and
     the cold end of the room on the other. Cached on the image, so a character
     is relit once and never again. */
  var KEY = {
    dim:  'rgba(206,162,116,0.44)',   /* multiplied over the whole figure */
    warm: 'rgba(255,148,56,0.26)',    /* firelight, hearth side           */
    cool: 'rgba(56,72,116,0.20)'      /* away from it                     */
  };
  function relight(img) {
    if (img.__lit) return img.__lit;
    var w = img.naturalWidth, h = img.naturalHeight;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(img, 0, 0);
    /* multiply floods the transparent parts too, so the original goes back
       over it as a stencil to cut the figure out again */
    x.globalCompositeOperation = 'multiply';
    x.fillStyle = KEY.dim; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'destination-in';
    x.drawImage(img, 0, 0);
    /* then which way the light is coming from */
    x.globalCompositeOperation = 'source-atop';
    var g = x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, KEY.warm);
    g.addColorStop(0.55, 'rgba(0,0,0,0)');
    g.addColorStop(1, KEY.cool);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    img.__lit = c;
    return c;
  }

  function drawSpriteImage(img, f, m) {
    var L = global.SPRITE_LAYOUT || { height: 0.70, centreX: 0.5, bottom: 0.84 };
    var lit = relight(img);
    var h = Math.round(H * L.height);
    var w = Math.round(h * (lit.width / lit.height));
    var x = Math.round(W * L.centreX - w / 2) + m.dx;
    var adj = (global.SPRITE_ADJUST || {})[m.charId] || {};
    var y = Math.round(H * L.bottom - h) + m.dy + (adj.dy || 0);
    bctx.imageSmoothingEnabled = false;
    if (m.alpha < 1) bctx.globalAlpha = m.alpha;
    bctx.drawImage(lit, x, y, w, h);
    bctx.globalAlpha = 1;
  }

  /* =======================================================================
     THE SIX
     ======================================================================= */

  function tone(b, s, l) { return { b: b, s: s, l: l }; }

  var SKIN = {
    fair:  tone('#e3b48d', '#bd8a68', '#f4cfa9'),
    olive: tone('#c98d63', '#a06e4b', '#e2ad83'),
    brown: tone('#9a6440', '#734730', '#b8814f'),
    deep:  tone('#6d452c', '#4f301e', '#8a5b39')
  };

  var CAST_ART = {
    convert: {                                    /* Ezra — the barrel-maker */
      skin: SKIN.fair, hair: tone('#4a3020', '#33200f', '#7a5230'), style: 'crop',
      coat: tone('#6b4a2c', '#4a3119', '#8a6238'), vest: '#5f7550', vestL: '#7a8f66',
      collar: 'neckcloth', eye: tone('#6b4a2c', '#3d2a18'), lip: '#8a4a3c',
      build: 'normal', buttons: true, hands: true
    },
    minister: {                                   /* Rev. Thorne             */
      skin: SKIN.fair, hair: tone('#d7d0c0', '#aca596', '#f2ece0'), style: 'wig',
      coat: tone('#2b2630', '#1b1620', '#413a48'), vest: '#2b2630', vestL: '#413a48',
      collar: 'bands', eye: tone('#5a6b78', '#33414c'), lip: '#8a5a52',
      build: 'normal', hands: true
    },
    reader: {                                     /* Cato Bell               */
      skin: SKIN.brown, hair: tone('#3a2418', '#241309', '#5e4028'), style: 'crop',
      coat: tone('#5f7550', '#42553a', '#7d9268'), vest: '#cfc6ad', vestL: '#e4dcc6',
      collar: 'neckcloth', eye: tone('#4a3020', '#2a180e'), lip: '#8a5044',
      build: 'slight', buttons: true, button: '#8a8f96',
      spectacles: true, inkStains: true, hands: true
    },
    captain: {                                    /* Capt. Bright            */
      skin: SKIN.olive, hair: tone('#2a2028', '#171219', '#4a3f48'), style: 'queue',
      coat: tone('#39456e', '#252e4d', '#4f5d8c'), vest: '#8c3529', vestL: '#a8463a',
      collar: 'neckcloth', eye: tone('#4a3020', '#2a180e'), lip: '#8a4a3c',
      build: 'broad', buttons: true, button: '#d9b45a', hands: true
    },
    patience: {                                   /* Patience Marsh          */
      skin: SKIN.fair, hair: tone('#7a3a1e', '#54250f', '#a35a2c'), style: 'cap',
      coat: tone('#6b4060', '#4a2942', '#8a5a7e'), vest: '#6b4060', vestL: '#8a5a7e',
      collar: 'kerchief', eye: tone('#4f7060', '#2f4a3c'), lip: '#a05a56',
      build: 'slight', hands: true
    },
    officer: {                                    /* Mr. Pym                 */
      skin: SKIN.fair, hair: tone('#b99456', '#8c6c37', '#dcbc7e'), style: 'queue',
      coat: tone('#8c3529', '#66231a', '#a8463a'), vest: '#d6c3a0', vestL: '#efe0c2',
      collar: 'neckcloth', eye: tone('#5a6b78', '#33414c'), lip: '#8a4a44',
      build: 'normal', buttons: true, button: '#d9b45a', ledger: true, hands: true
    }
  };

  /* =======================================================================
     DRAW
     ======================================================================= */

  function posePixels(charId, cfg, exprName) {
    var key = charId + '|' + exprName;
    if (poseCache[key]) return poseCache[key];
    var ctx = personLayer();
    ctx.clearRect(0, 0, W, H);
    paintFigure(ctx, cfg, EXPR[exprName] || EXPR.neutral);
    inkEdges(ctx, C.ink);
    var out = document.createElement('canvas');
    out.width = W; out.height = H;
    var oc = out.getContext('2d');
    oc.imageSmoothingEnabled = false;
    oc.drawImage(pbuf, 0, 0);
    poseCache[key] = out;
    return out;
  }

  /* Fetch every face a character owns the moment they are first drawn. The
     loader is lazy, so without this the first line that changes their mood
     asks for an image that hasn’t started downloading, and the character
     flashes to the built-in figure for a frame or two while it arrives. */
  var preloaded = {};

  /* Fetch the whole cast up front. Loading a character's faces when they walk
     in is too late: the images arrive a few frames after the figure does, and
     for those frames the room shows the built-in drawn figure instead — which
     looks like the wrong person flashing on screen before the right one. */
  function preloadAll() {
    var table = global.SPRITES || {};
    Object.keys(table).forEach(preloadSprites);
  }

  function preloadSprites(charId) {
    if (!charId || preloaded[charId]) return;
    preloaded[charId] = true;
    var set = (global.SPRITES || {})[charId] || {};
    Object.keys(set).forEach(function (k) { if (set[k]) getSprite(set[k]); });
  }

  function drawPerson(cfg, exprName, f, charId) {
    preloadSprites(charId);
    var m = motionOffsets(f, charId || 'anon', exprName);

    /* hand-made art wins, when there is any */
    if (charId) {
      var img = null;
      /* A blink frame is used only while the eyes are shut, and only if it has
         actually loaded. Reaching for one that isn't there must not cost the
         character their portrait for those few frames. */
      if (m.blinking) {
        var burl = spriteUrl(charId, 'blink');
        if (burl) img = getSprite(burl);
      }
      if (!img) {
        var url = spriteUrl(charId, exprName);
        if (url) img = getSprite(url);
      }
      if (img) return drawSpriteImage(img, f, m);
      /* Art is declared for this character and is still on its way. Draw
         nothing rather than the built-in figure — an empty stool for two
         frames is invisible; the wrong face is not. */
      if (spriteUrl(charId, 'neutral')) return;
    }

    var pose = posePixels(charId || 'anon', cfg, exprName);
    bctx.imageSmoothingEnabled = false;
    if (m.alpha < 1) bctx.globalAlpha = m.alpha;
    bctx.drawImage(pose, m.dx, m.dy);
    bctx.globalAlpha = 1;
  }

  /* the empty room between customers — a stool where somebody was */
  function drawEmptySeat(f) {
    r(174, COUNTER_Y - 8, 32, 8, C.woodLit);
    r(177, COUNTER_Y - 5, 26, 4, C.wood);
  }

  global.Art = {
    W: W, H: H, C: C, COUNTER_Y: COUNTER_Y,
    init: init, resize: resize, present: present,
    drawRoom: drawRoom, drawPerson: drawPerson, drawServedCup: drawServedCup,
    drawEmptySeat: drawEmptySeat, CAST_ART: CAST_ART, EXPR: EXPR,
    setPhase: setPhase, getPhase: getPhase, applyNightWash: applyNightWash,
    addRing: addRing, addTarnish: addTarnish, wipeAt: wipeAt, clearRings: clearRings, ringCount: ringCount,
    hitTest: hitTest, toLogical: toLogical, countKind: countKind,
    enterSprite: enterSprite, nudgeSprite: nudgeSprite,
    hasSprite: function (id, expr) { return !!spriteUrl(id, expr); },
    ctx: function () { return bctx; }
  };

})(window);
