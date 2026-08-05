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
  function addRing(x) {
    seed++;
    rings.push({ kind: 'ring',
                 x: x + Math.round((rnd(seed * 5.3) - 0.5) * 26),
                 y: COUNTER_Y + 8 + Math.round(rnd(seed * 9.1) * 18),
                 r: 5 + Math.round(rnd(seed * 3.7) * 3) });
  }

  /* Pewter dulls as the evening goes on. Same cloth, different surface. */
  function addTarnish() {
    seed++;
    var row = Math.floor(rnd(seed * 2.9) * 3), col = Math.floor(rnd(seed * 6.1) * 5);
    rings.push({ kind: 'tarnish', x: 299 + col * 16 + 5, y: 28 + row * 38 + 21, r: 7 });
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
  function clearRings() { rings = []; }

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

    /* Hearth and cupboard stop short of the counter so there is a clear strip
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
    /* sparks, which stop once there is nothing left to throw them */
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
    /* dulled pewter, waiting for a cloth */
    rings.forEach(function (g) {
      if (g.kind !== 'tarnish') return;
      ell(g.x, g.y, g.r, g.r - 1, C.pewterDim);
      ell(g.x - 1, g.y - 1, g.r - 3, g.r - 3, C.shadow);
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
    /* rings and spills left behind by whoever has been drinking */
    rings.forEach(function (g) {
      if (g.kind !== 'ring') return;
      ell(g.x, g.y, g.r, Math.max(1, Math.round(g.r * 0.45)), C.woodDark);
      ell(g.x, g.y, g.r - 2, Math.max(1, Math.round(g.r * 0.28)), C.wood);
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
     THE CAST — one shared construction, six configurations
     ========================================================================= */

  /* Expressions are eyebrow + eye + mouth triples. Keeping them in one table
     means every character can wear every expression without extra art. */
  var EXPR = {
    neutral:   { brow: 0, eye: 'open',  mouth: 'flat' },
    warm:      { brow: 1, eye: 'soft',  mouth: 'smile' },
    worried:   { brow: -1, eye: 'open', mouth: 'small' },
    stern:     { brow: -2, eye: 'narrow', mouth: 'frown' },
    surprised: { brow: 2, eye: 'wide',  mouth: 'open' },
    thoughtful:{ brow: 0, eye: 'narrow', mouth: 'small' },
    downcast:  { brow: -1, eye: 'shut', mouth: 'small' },
    bright:    { brow: 2, eye: 'wide',  mouth: 'smile' }
  };

  /* cfg fields: skin, skinS, skinH, hair, style, coat, coatLit, collar,
     hat, accessory, build.

     Proportions are deliberately generous — a Coffee Talk customer is a bust
     that fills the frame, not a figure standing in a room. Head is 46x56 in a
     384x216 field, which puts the eyes at roughly a third of the way down. */
  function drawPerson(cfg, exprName, f) {
    var e = EXPR[exprName] || EXPR.neutral;
    var cx = 190;
    var bob = Math.round(Math.sin(f * 0.035));      /* slow breathing */
    var top = 34 + bob;

    var hw = 46, hh = 56;
    var chin = top + hh;                             /* ~90  */
    var shoulderY = chin + 16;                       /* ~106 */

    /* ---- torso ---- */
    var sw = cfg.build === 'broad' ? 122 : cfg.build === 'slight' ? 92 : 106;
    poly([[cx - sw / 2, COUNTER_Y + 6], [cx - sw / 2 + 10, shoulderY + 4],
          [cx - 24, shoulderY - 8], [cx + 24, shoulderY - 8],
          [cx + sw / 2 - 10, shoulderY + 4], [cx + sw / 2, COUNTER_Y + 6]], cfg.coat);
    /* the left shoulder faces the hearth and catches it */
    poly([[cx - sw / 2, COUNTER_Y + 6], [cx - sw / 2 + 10, shoulderY + 4],
          [cx - 22, shoulderY - 6], [cx - 16, COUNTER_Y + 6]], cfg.coatLit);

    /* ---- neck, in shadow under the jaw ---- */
    r(cx - 9, chin - 10, 18, 18, cfg.skinS);

    /* ---- neckcloth ---- */
    r(cx - 15, shoulderY - 10, 30, 9, cfg.collar);
    poly([[cx - 15, shoulderY - 2], [cx, shoulderY + 9], [cx + 15, shoulderY - 2]], cfg.collar);

    /* ---- waistcoat ---- */
    if (cfg.waistcoat) {
      r(cx - 14, shoulderY + 8, 28, COUNTER_Y - shoulderY, cfg.waistcoat);
      for (var bt = 0; bt < 5; bt++) p(cx, shoulderY + 16 + bt * 10, C.amberLit);
    }

    /* ---- head ---- */
    blob(cx - hw / 2, top, hw, hh, cfg.skin);
    ell(cx - 11, top + 32, 10, 13, cfg.skinH);       /* lit cheek   */
    ell(cx + 18, top + 32, 4, 13, cfg.skinS);        /* shaded side */
    ell(cx - 17, top + 30, 3, 5, cfg.skinS);         /* ears        */
    ell(cx + 21, top + 30, 3, 5, cfg.skinS);

    drawHair(cfg, cx, top, hw, hh, f);

    /* ---- brows ---- */
    var browY = top + 24 - e.brow * 2;
    r(cx - 17, browY, 12, 2, cfg.hair);
    r(cx + 6, browY, 12, 2, cfg.hair);
    if (e.brow <= -2) {                              /* drawn together */
      p(cx - 6, browY + 2, cfg.hair); p(cx + 5, browY + 2, cfg.hair);
    }
    if (e.brow >= 2) {                               /* raised at the inner edge */
      p(cx - 5, browY - 1, cfg.hair); p(cx + 4, browY - 1, cfg.hair);
    }

    /* ---- eyes ---- */
    var eyeY = top + 31;
    drawEye(cx - 11, eyeY, e.eye, cfg);
    drawEye(cx + 12, eyeY, e.eye, cfg);

    /* ---- nose ---- */
    r(cx, top + 34, 2, 8, cfg.skinS);
    r(cx - 2, top + 41, 5, 2, cfg.skinS);
    p(cx - 3, top + 40, cfg.skinH);

    /* ---- mouth ---- */
    var mY = top + 47;
    if (e.mouth === 'flat') r(cx - 6, mY, 13, 2, C.redDim);
    else if (e.mouth === 'small') r(cx - 4, mY, 9, 2, C.redDim);
    else if (e.mouth === 'smile') {
      r(cx - 6, mY, 13, 2, C.redDim);
      p(cx - 7, mY - 1, C.redDim); p(cx + 7, mY - 1, C.redDim);
      hl(cx - 5, mY + 2, 11, cfg.skinH);
    } else if (e.mouth === 'frown') {
      r(cx - 6, mY, 13, 2, C.redDim);
      p(cx - 7, mY + 1, C.redDim); p(cx + 7, mY + 1, C.redDim);
    } else if (e.mouth === 'open') {
      ell(cx, mY + 2, 5, 4, C.redDim);
      ell(cx, mY + 3, 3, 2, C.ink);
    }

    if (cfg.hat) drawHat(cfg, cx, top, f);
    if (cfg.accessory) drawAccessory(cfg, cx, top, shoulderY, f);
  }

  /* An eye is sclera, iris, pupil, a highlight, and — crucially — a lid line.
     Without the lid the whites read as a stare no matter the expression. */
  function drawEye(x, y, kind, cfg) {
    if (kind === 'shut') {
      r(x - 5, y + 3, 11, 2, cfg.hair);
      hl(x - 4, y + 5, 9, cfg.skinS);
      return;
    }
    var h = kind === 'wide' ? 8 : kind === 'narrow' ? 4 : 6;
    var w = kind === 'narrow' ? 9 : 11;
    var x0 = x - Math.floor(w / 2);
    r(x0, y, w, h, C.white);
    /* iris sits low so the character is looking at you, not through you */
    var iy = y + (kind === 'narrow' ? 0 : 1);
    r(x - 2, iy, 5, h - (kind === 'narrow' ? 0 : 1), cfg.eyes || C.brown);
    r(x - 1, iy + 1, 3, Math.max(1, h - 3), C.ink);
    p(x - 1, iy + 1, C.white);                        /* catchlight */
    hl(x0, y - 1, w, cfg.hair);                       /* lash line  */
    hl(x0, y + h, w, cfg.skinS);                      /* under-lid  */
    if (kind === 'narrow') hl(x0, y, w, cfg.skinS);   /* heavy lid  */
  }

  function drawHair(cfg, cx, top, hw, hh, f) {
    var s = cfg.style;
    if (s === 'tiedback') {                     /* men's queue, tied in black */
      blob(cx - hw / 2 - 2, top - 6, hw + 4, 36, cfg.hair);
      r(cx - 24, top + 14, 6, 28, cfg.hair);
      r(cx + 18, top + 14, 6, 28, cfg.hair);
      r(cx + 21, top + 40, 8, 20, cfg.hair);    /* queue over the shoulder   */
      r(cx + 21, top + 40, 8, 4, C.black);      /* the ribbon                */
    } else if (s === 'wig') {                   /* clergyman's short bob wig  */
      blob(cx - hw / 2 - 6, top - 9, hw + 12, 42, C.hairWhite);
      ell(cx - 27, top + 38, 9, 16, C.hairWhite);
      ell(cx + 27, top + 38, 9, 16, C.hairWhite);
      for (var i = 0; i < 7; i++) hl(cx - 27, top + 28 + i * 4, 54, C.linenDim);
    } else if (s === 'cap') {                   /* woman's linen cap          */
      blob(cx - hw / 2 - 1, top - 4, hw + 2, 30, cfg.hair);
      blob(cx - hw / 2 - 7, top - 12, hw + 14, 38, C.cream);
      ell(cx, top + 4, 27, 16, C.white);
      hl(cx - 26, top + 17, 52, C.linenDim);
      r(cx - 26, top + 14, 4, 12, C.cream);
      r(cx + 22, top + 14, 4, 12, C.cream);
    } else if (s === 'kerchief') {              /* head cloth, working dress  */
      blob(cx - hw / 2 - 1, top - 4, hw + 2, 28, cfg.hair);
      poly([[cx - 25, top + 12], [cx - 21, top - 9], [cx + 21, top - 9],
            [cx + 25, top + 12], [cx + 20, top + 6], [cx - 20, top + 6]],
           cfg.cloth || C.indigo);
      hl(cx - 21, top - 2, 42, cfg.clothLit || C.indigoLit);
    } else if (s === 'cropped') {               /* labourer, cut short        */
      blob(cx - hw / 2, top - 3, hw, 30, cfg.hair);
      hl(cx - 20, top + 3, 40, cfg.hair);
      ell(cx - 21, top + 22, 3, 7, cfg.hair);
      ell(cx + 21, top + 22, 3, 7, cfg.hair);
    } else {                                    /* loose, unfashionable       */
      blob(cx - hw / 2 - 3, top - 6, hw + 6, 38, cfg.hair);
      ell(cx - 25, top + 36, 8, 17, cfg.hair);
      ell(cx + 24, top + 36, 8, 17, cfg.hair);
    }
  }

  function drawHat(cfg, cx, top, f) {
    if (cfg.hat === 'tricorn') {
      poly([[cx - 42, top + 2], [cx - 20, top - 20], [cx + 20, top - 20], [cx + 42, top + 2],
            [cx + 22, top + 8], [cx - 22, top + 8]], C.black);
      poly([[cx - 22, top - 3], [cx - 11, top - 23], [cx + 11, top - 23], [cx + 22, top - 3]], C.blackLit);
      hl(cx - 37, top + 1, 74, C.pewterDim);
    } else if (cfg.hat === 'flat') {            /* a plain round hat, no lace */
      poly([[cx - 34, top + 2], [cx - 17, top - 15], [cx + 17, top - 15], [cx + 34, top + 2]], C.brown);
      hl(cx - 34, top + 2, 68, C.woodDark);
    }
  }

  function drawAccessory(cfg, cx, top, shoulderY, f) {
    if (cfg.accessory === 'bands') {            /* Geneva bands, Old Light    */
      r(cx - 10, shoulderY + 2, 7, 20, C.white);
      r(cx + 3, shoulderY + 2, 7, 20, C.white);
    } else if (cfg.accessory === 'spectacles') {
      var ey = top + 29;
      hl(cx - 19, ey - 2, 16, C.pewterLit); hl(cx - 19, ey + 9, 16, C.pewterLit);
      vl(cx - 19, ey - 2, 11, C.pewterLit);  vl(cx - 4, ey - 2, 11, C.pewterLit);
      hl(cx + 4, ey - 2, 16, C.pewterLit);  hl(cx + 4, ey + 9, 16, C.pewterLit);
      vl(cx + 4, ey - 2, 11, C.pewterLit);  vl(cx + 19, ey - 2, 11, C.pewterLit);
      hl(cx - 4, ey + 2, 8, C.pewterLit);
    } else if (cfg.accessory === 'gloves') {    /* Patience, not yet unlaced  */
      r(cx - 62, COUNTER_Y - 12, 20, 10, C.linen);
      r(cx - 62, COUNTER_Y - 12, 20, 3, C.cream);
      r(cx - 58, COUNTER_Y - 15, 12, 4, C.linen);
    } else if (cfg.accessory === 'ledger') {
      r(cx + 40, COUNTER_Y - 16, 26, 16, C.redDim);
      r(cx + 42, COUNTER_Y - 14, 22, 13, C.linen);
      for (var i = 0; i < 5; i++) hl(cx + 45, COUNTER_Y - 12 + i * 2, 16, C.linenDim);
    }
  }

  /* ---- the six configurations ------------------------------------------- */
  var CAST_ART = {
    patience: {
      skin: C.skin1, skinS: C.skin1s, skinH: C.skin1h, hair: C.hairAuburn,
      style: 'cap', coat: C.plum, coatLit: '#6f4263', collar: C.cream,
      eyes: C.brown, build: 'slight', accessory: 'gloves'
    },
    convert: {
      skin: C.skin2, skinS: C.skin2s, skinH: C.skin2h, hair: C.hairBrown,
      style: 'cropped', coat: C.brown, coatLit: C.brownLit, collar: C.linen,
      waistcoat: C.moss, eyes: C.brown, build: 'normal'
    },
    minister: {
      skin: C.skin1, skinS: C.skin1s, skinH: C.skin1h, hair: C.hairGrey,
      style: 'wig', coat: C.black, coatLit: C.blackLit, collar: C.white,
      eyes: C.slate, build: 'normal', accessory: 'bands'
    },
    captain: {
      skin: C.skin2, skinS: C.skin2s, skinH: C.skin2h, hair: C.hairBlack,
      style: 'tiedback', coat: C.indigo, coatLit: C.indigoLit, collar: C.linen,
      waistcoat: C.redDim, eyes: C.brown, build: 'broad', hat: 'tricorn'
    },
    reader: {
      skin: C.skin3, skinS: C.skin3s, skinH: C.skin3h, hair: C.hairBlack,
      style: 'tiedback', coat: C.moss, coatLit: C.mossLit, collar: C.cream,
      waistcoat: C.linenDim, eyes: C.brown, build: 'slight', accessory: 'spectacles'
    },
    officer: {
      skin: C.skin1, skinS: C.skin1s, skinH: C.skin1h, hair: C.hairFlax,
      style: 'tiedback', coat: C.redcoat, coatLit: '#a8463a', collar: C.white,
      waistcoat: C.linen, eyes: C.slate, build: 'normal', hat: 'tricorn',
      accessory: 'ledger'
    }
  };

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
    hitTest: hitTest, toLogical: toLogical,
    ctx: function () { return bctx; }
  };

})(window);
