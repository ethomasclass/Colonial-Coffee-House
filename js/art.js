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
  function rnd(seed) { var x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); }

  /* =========================================================================
     THE ROOM — Green Dragon Tavern & Coffee House, Union Street, night
     ========================================================================= */

  var COUNTER_Y = 172;

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
       so there’s visibly something to do and it isn’t all in one corner. */
    rings.push({ kind: 'ring',
                 x: 24 + Math.round(rnd(seed * 5.3) * (W - 48)),
                 /* kept high on the bar so the between-patron panel, which
                    sits along the bottom of the frame, never hides them */
                 y: COUNTER_Y + 4 + Math.round(rnd(seed * 9.1) * 12),
                 r: 8 + Math.round(rnd(seed * 3.7) * 4) });
  }

  /* Pewter dulls as the evening goes on. Same cloth, different surface. */
  function addTarnish() {
    seed++;
    var row = Math.floor(rnd(seed * 2.9) * 3), col = Math.floor(rnd(seed * 6.1) * 5);
    rings.push({ kind: 'tarnish', x: 299 + col * 16 + 5, y: 28 + row * 38 + 20, r: 9 });
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
  var HITS = [
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

  function drawRoom(f) {
    var flick = 0.6 + 0.4 * Math.sin(f * 0.09) * Math.sin(f * 0.031);

    clear(C.ink);

    /* --- back wall: lime plaster over lath, warmed unevenly by the fire --- */
    r(0, 14, W, COUNTER_Y - 14, C.plaster);
    for (var i = 0; i < 26; i++) {
      var wx = (i * 37) % W, wy = 16 + ((i * 53) % (COUNTER_Y - 30));
      p(wx, wy, C.plasterLit);
    }

    /* --- ceiling beam ----------------------------------------------------- */
    r(0, 0, W, 14, C.woodDark);
    r(0, 12, W, 2, C.ink);
    for (var b = 0; b < 6; b++) r(20 + b * 64, 2, 26, 8, C.wood);
    /* joists dropping down */
    r(96, 14, 6, 10, C.woodDark);
    r(288, 14, 6, 10, C.woodDark);

    /* --- wainscot panelling along the lower wall -------------------------- */
    r(0, 112, W, COUNTER_Y - 112, C.wood);
    hl(0, 112, W, C.woodHi);
    for (var q = 0; q < 12; q++) {
      r(6 + q * 32, 118, 22, 46, C.woodDark);
      r(7 + q * 32, 119, 20, 44, C.woodLit);
    }

    /* Hearth and cupboard stop short of the counter so there’s a clear strip
       of counter-top to stand a candle and a served cup on. */
    drawWindow(112, 22, f);
    drawHearth(6, 42, f, flick);
    drawShelf(292, 20);
    drawSign(196, 18);
    r(0, 152, W, 4, C.woodHi);            /* the shelf-edge above the bar */
    r(0, 156, W, COUNTER_Y - 156, C.wood);

    drawCounter(f);
  }

  /* --- leaded casement window with rain ---------------------------------- */
  function drawWindow(x, y, f) {
    var w = 58, h = 62;
    r(x - 3, y - 3, w + 6, h + 6, C.woodDark);
    r(x, y, w, h, phase > 0.66 ? C.ink : C.night);
    /* the street lantern outside gutters out toward the small hours */
    if (phase < 0.85) {
      ell(x + 40, y + 44, 16 - Math.round(phase * 6), 12 - Math.round(phase * 5), C.slate);
      if (phase < 0.6) ell(x + 40, y + 44, 8, 6, C.slateLit);
    }
    /* rain streaks */
    for (var i = 0; i < 30; i++) {
      var rx = x + 2 + Math.floor(rnd(i * 3.1) * (w - 4));
      var ry = y + 2 + ((Math.floor(rnd(i * 7.7) * h) + f * 2) % (h - 4));
      vl(rx, ry, 3, C.pewterDim);
    }
    /* leading: small diamond panes */
    for (var cx = 0; cx <= w; cx += 12) vl(x + cx, y, h, C.pewterDim);
    for (var cy = 0; cy <= h; cy += 14) hl(x, y + cy, w, C.pewterDim);
    /* sill */
    r(x - 5, y + h + 3, w + 10, 4, C.woodLit);
    /* a stoneware jug and a pipe on the sill */
    r(x + 6, y + h - 6, 7, 9, C.linenDim);
    r(x + 6, y + h - 8, 7, 3, C.linen);
    r(x + 22, y + h + 1, 14, 2, C.cream);
    r(x + 34, y + h - 1, 3, 4, C.cream);
  }

  /* --- open hearth, the light source of the whole room -------------------- */
  function drawHearth(x, y, f, flick) {
    var w = 74, h = 110;
    /* brick surround */
    r(x, y, w, h, C.redDim);
    for (var by = 0; by < h; by += 6) {
      hl(x, y + by, w, C.shadow);
      for (var bx = (by % 12 === 0 ? 0 : 8); bx < w; bx += 16) vl(x + bx, y + by, 6, C.shadow);
    }
    /* firebox */
    var fx = x + 10, fy = y + 34, fw = w - 20, fh = h - 44;
    r(fx, fy, fw, fh, C.ink);
    /* lintel */
    r(x - 2, y + 26, w + 4, 8, C.woodDark);
    r(x - 2, y + 26, w + 4, 2, C.woodLit);

    /* logs */
    r(fx + 6, fy + fh - 12, fw - 12, 6, C.woodDark);
    r(fx + 10, fy + fh - 18, fw - 24, 6, C.brown);

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
    /* sparks, which stop once there isn’thing left to throw them */
    if (burn > 0.5) {
      for (var s = 0; s < 5; s++) {
        var sy = fy + fh - 30 - ((f + s * 13) % 26);
        p(fx + 12 + ((s * 11 + Math.floor(f / 4)) % (fw - 24)), sy, C.amberLit);
      }
    }

    /* crane and hanging kettle */
    r(fx + 4, fy + 4, fw - 8, 2, C.pewterDim);
    vl(fx + fw - 22, fy + 6, 12, C.pewterDim);
    r(fx + fw - 30, fy + 18, 18, 13, C.pewter);
    r(fx + fw - 30, fy + 17, 18, 2, C.pewterLit);
    r(fx + fw - 34, fy + 22, 4, 3, C.pewter);

    /* mantel with candlestick and an almanac */
    r(x - 4, y + 20, w + 8, 6, C.woodLit);
    drawCandle(x + 12, y + 6, f);
    r(x + 44, y + 12, 12, 8, C.linen);
    r(x + 44, y + 12, 12, 2, C.linenDim);
  }

  function drawCandle(x, y, f) {
    /* A tallow candle burns down over the evening. The stub sinks toward the
       stick and the flame goes with it, so the room quietly gets darker. */
    var used = Math.round(phase * 6);
    var top = y + 8 + used, len = 8 - used;
    if (len > 0) r(x, top, 4, len, C.cream);
    if (used > 2) { p(x - 1, top + 1, C.linenDim); p(x + 4, top + 2, C.linenDim); }
    r(x - 2, y + 16, 8, 2, C.pewter);
    var w = (f % 24 < 12) ? 0 : 1;
    var fy = top - 3;
    p(x + 1 + w, fy + 2, C.amberLit);
    p(x + 1 + w, fy + 1, C.flame);
    if (phase < 0.8) p(x + 1 + w, fy, C.flameHot);
    p(x + 2 + w, fy + 2, C.amber);
  }

  /* --- cupboard of pewter and stoneware ----------------------------------- */
  function drawShelf(x, y) {
    var w = 86, h = 132;
    r(x, y, w, h, C.woodDark);
    r(x + 2, y + 2, w - 4, h - 4, C.shadow);
    for (var row = 0; row < 3; row++) {
      var sy = y + 8 + row * 38;
      r(x + 2, sy + 28, w - 4, 4, C.woodLit);
      for (var i = 0; i < 5; i++) {
        var ix = x + 7 + i * 16;
        if ((row + i) % 3 === 0) {          /* pewter tankard */
          r(ix, sy + 14, 10, 14, C.pewter);
          r(ix, sy + 13, 10, 2, C.pewterLit);
          r(ix + 10, sy + 18, 3, 6, C.pewterDim);
        } else if ((row + i) % 3 === 1) {   /* stoneware jar */
          r(ix + 1, sy + 12, 9, 16, C.linenDim);
          r(ix + 1, sy + 12, 9, 3, C.linen);
          r(ix + 2, sy + 20, 7, 2, C.brown);
        } else {                             /* china bowl, imported, dear */
          ell(ix + 5, sy + 24, 6, 5, C.white);
          r(ix + 1, sy + 22, 9, 2, C.indigoLit);
        }
      }
    }
    /* Dulled pewter, waiting for a cloth. Same rule: it has to be obvious. */
    rings.forEach(function (g) {
      if (g.kind !== 'tarnish') return;
      ell(g.x, g.y, g.r, g.r, C.shadow);
      ell(g.x, g.y, g.r - 2, g.r - 2, '#4a4238');
      ell(g.x - 2, g.y - 2, Math.max(1, g.r - 5), Math.max(1, g.r - 5), '#6b6154');
    });

    /* hanging bunches of dried herbs */
    for (var hb = 0; hb < 3; hb++) {
      var hx = x - 12, hy = y + 10 + hb * 34;
      vl(hx, hy, 6, C.brown);
      ell(hx, hy + 10, 4, 6, C.moss);
      ell(hx, hy + 9, 2, 4, C.mossLit);
    }
  }

  /* --- the painted trade sign, hung indoors over the bar ------------------ */
  function drawSign(x, y) {
    var w = 66, h = 26;
    r(x - 1, y - 1, w + 2, h + 2, C.woodDark);
    r(x, y, w, h, C.moss);
    r(x + 2, y + 2, w - 4, h - 4, C.mossLit);
    /* a crude dragon in profile, which is all the sign ever was */
    poly([[x + 12, y + 18], [x + 22, y + 9], [x + 34, y + 8], [x + 44, y + 13],
          [x + 52, y + 10], [x + 48, y + 18], [x + 30, y + 20]], C.moss);
    p(x + 30, y + 12, C.amberLit);
    poly([[x + 44, y + 13], [x + 56, y + 6], [x + 52, y + 15]], C.moss);
    /* chain */
    vl(x + 14, y - 6, 6, C.pewterDim);
    vl(x + w - 14, y - 6, 6, C.pewterDim);
  }

  /* --- the counter, foreground band the player works behind --------------- */
  function drawCounter(f) {
    r(0, COUNTER_Y, W, H - COUNTER_Y, C.woodDark);
    r(0, COUNTER_Y, W, 5, C.woodHi);
    r(0, COUNTER_Y + 5, W, 3, C.woodLit);
    /* grain */
    for (var i = 0; i < 40; i++) {
      var gx = (i * 29) % W, gy = COUNTER_Y + 12 + ((i * 17) % 40);
      hl(gx, gy, 10 + (i % 9), C.wood);
    }
    /* Rings and spills. Drawn with real contrast against the wood — a dark wet
       ring with a lit rim — because a stain the player can’t see isn’t a
       chore, it’s a bug. */
    rings.forEach(function (g) {
      if (g.kind !== 'ring') return;
      var ry = Math.max(2, Math.round(g.r * 0.5));
      ell(g.x, g.y, g.r + 1, ry + 1, C.ink);
      ell(g.x, g.y, g.r, ry, C.woodDark);
      ell(g.x, g.y, g.r - 3, Math.max(1, ry - 2), C.woodLit);
      /* the wet highlight that makes it read as a spill and not a hole */
      hl(g.x - Math.round(g.r * 0.5), g.y - ry + 1, Math.round(g.r * 0.9), C.linenDim);
      p(g.x + Math.round(g.r * 0.4), g.y + 1, C.linenDim);
    });

    /* front edge shadow so the band reads as foreground */
    r(0, H - 12, W, 12, C.shadow);
    /* candle at each end of the bar */
    drawCandle(36, COUNTER_Y - 20, f + 5);
    drawCandle(344, COUNTER_Y - 20, f + 17);
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
    for (var i = 0; i < chain.length; i++) if (set[chain[i]]) return set[chain[i]];
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

  var motion = { id: null, enter: -999, nudge: 0, expr: null, blinkAt: 0, blinkEnd: 0 };

  /* Called when somebody new sits down, so they arrive rather than appear. */
  function enterSprite(f) {
    motion.enter = f;
    motion.nudge = 0;
    motion.blinkAt = f + 90 + Math.floor(rnd(f) * 160);
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
    dy += Math.round(Math.sin(f * 0.035));          /* breath                */
    if (motion.nudge > 0.15) {
      dy -= Math.round(motion.nudge);
      motion.nudge *= 0.82;
    } else motion.nudge = 0;

    var dx = Math.round(Math.sin(f * 0.0115) * 1);  /* a slow shift of weight */

    /* Blink, if there is a frame for it — otherwise this costs nothing. */
    var blinking = false;
    if (f > motion.blinkAt) {
      motion.blinkEnd = f + 5;
      motion.blinkAt = f + 130 + Math.floor(rnd(f * 0.37) * 220);
    }
    if (f < motion.blinkEnd) blinking = true;

    return { dx: dx, dy: dy, alpha: Math.min(1, t * 1.5), blinking: blinking };
  }

  function drawSpriteImage(img, f, m) {
    var L = global.SPRITE_LAYOUT || { height: 0.70, centreX: 0.5, bottom: 0.84 };
    var h = Math.round(H * L.height);
    var w = Math.round(h * (img.naturalWidth / img.naturalHeight));
    var x = Math.round(W * L.centreX - w / 2) + m.dx;
    var y = Math.round(H * L.bottom - h) + m.dy;
    bctx.imageSmoothingEnabled = false;
    if (m.alpha < 1) bctx.globalAlpha = m.alpha;
    bctx.drawImage(img, x, y, w, h);
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

  function drawPerson(cfg, exprName, f, charId) {
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
