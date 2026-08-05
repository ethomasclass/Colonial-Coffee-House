/* ===========================================================================
   icons.js — small pixel drawings, rendered straight onto little canvases.

   Three families:
     drinkIcon()   a cup of a given recipe, for the recipe book
     bottleIcon()  the vessel an ingredient lives in, for the brewing shelf
     woodcut()     a newspaper illustration, in the manner of a cheap cut

   Each canvas is sized in logical pixels and blown up by CSS with
   image-rendering: pixelated, so everything stays crisp and nothing is ever
   fetched from anywhere.
   =========================================================================== */

(function (global) {
  'use strict';

  var P = {
    ink: '#140d12', shadow: '#241823', wood: '#4d3225', woodLit: '#6b4630',
    woodHi: '#8a5c3c', brown: '#5e4126', brownLit: '#7d5a35',
    cream: '#efe0c2', linen: '#d6c3a0', linenDim: '#b09b7c', white: '#f6efe0',
    pewter: '#8a9099', pewterLit: '#c3c9d0', pewterDim: '#5e646c',
    amber: '#d99038', amberLit: '#f0bb63', flame: '#ffd97e',
    red: '#8c3529', redDim: '#6a271e', moss: '#46583a', mossLit: '#5f7550',
    indigo: '#39456e', indigoLit: '#4f5d8c', slate: '#3c5570', night: '#141d2b',
    paper: '#e8dcc0', paperDim: '#c8b894', paperInk: '#2a1c12',
    sugar: '#f4efe4', molasses: '#2e1b10', honey: '#c98a2a',
    lemon: '#d9c24a', ginger: '#c49a5e', green: '#5f7550'
  };

  var LIQUID = {
    coffee: '#3b2416', bohea: '#7d5628', hyson: '#8a9455',
    chocolate: '#4f3020', sage: '#78834f', water: '#8fa3b5'
  };

  /* --- a drawing surface, in logical pixels ------------------------------- */
  function surface(cv, w, h) {
    cv.width = w; cv.height = h;
    var c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, w, h);
    return {
      c: c,
      r: function (x, y, w2, h2, col) { if (!col) return; c.fillStyle = col; c.fillRect(x | 0, y | 0, w2 | 0, h2 | 0); },
      p: function (x, y, col) { if (!col) return; c.fillStyle = col; c.fillRect(x | 0, y | 0, 1, 1); },
      e: function (cx, cy, rx, ry, col) {
        if (!col) return; c.fillStyle = col;
        for (var yy = -ry; yy <= ry; yy++) {
          var t = 1 - (yy * yy) / (ry * ry); if (t < 0) continue;
          var half = Math.round(rx * Math.sqrt(t)); if (half <= 0) continue;
          c.fillRect((cx - half) | 0, (cy + yy) | 0, half * 2, 1);
        }
      },
      poly: function (pts, col) {
        if (!col) return; c.fillStyle = col;
        c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
        c.closePath(); c.fill();
      }
    };
  }

  /* =======================================================================
     VESSELS — shared between the recipe book and the brewing cup
     ======================================================================= */

  /* A recipe's matching rule may accept several ingredients; for a picture we
     just need one that is representative. */
  function specimen(spec, fallback) {
    if (!spec || spec === 'any') return fallback;
    if (spec === 'anySweet') return 'french';
    return spec[0];
  }

  function iconSpec(rec) {
    return {
      base: rec.base,
      sweet: specimen(rec.sweet, 'none'),
      add: specimen(rec.add, 'none')
    };
  }

  /* vessel kinds: 'mug' stoneware with a handle, 'bowl' china tea bowl,
     'pot' tall chocolate pot, 'cup' plain turned cup */
  function vesselFor(base) {
    if (base === 'chocolate') return 'pot';
    if (base === 'bohea' || base === 'hyson') return 'bowl';
    if (base === 'coffee') return 'mug';
    return 'cup';
  }

  /* Draws the vessel and its contents. fill 0..1 lets the brewing cup rise. */
  function drawVessel(s, x, y, kind, liquid, fill, extras) {
    fill = fill === undefined ? 1 : fill;
    extras = extras || {};
    var body, top, h;

    if (kind === 'bowl') {
      body = { x: x + 4, y: y + 18, w: 34, h: 20 };
      s.e(x + 21, y + 18, 18, 7, P.white);
      s.poly([[x + 3, y + 18], [x + 39, y + 18], [x + 33, y + 38], [x + 9, y + 38]], P.white);
      s.poly([[x + 3, y + 18], [x + 12, y + 18], [x + 14, y + 38], [x + 9, y + 38]], '#dcd3c2');
      s.e(x + 21, y + 18, 15, 5, P.shadow);
      top = y + 18; h = 18;
    } else if (kind === 'pot') {
      s.r(x + 8, y + 8, 26, 34, P.linenDim);
      s.r(x + 8, y + 8, 8, 34, P.linen);
      s.r(x + 28, y + 8, 6, 34, '#8f7d62');
      s.e(x + 21, y + 8, 14, 5, P.linen);
      s.e(x + 21, y + 8, 11, 3, P.shadow);
      s.r(x + 34, y + 16, 5, 12, P.linenDim);          /* handle */
      s.r(x + 36, y + 18, 2, 8, P.shadow);
      s.r(x + 6, y + 42, 30, 4, P.linen);
      s.r(x + 16, y + 2, 12, 4, P.linenDim);           /* lid knob */
      top = y + 8; h = 30;
    } else if (kind === 'mug') {
      s.r(x + 6, y + 12, 28, 32, '#9c7a52');
      s.r(x + 6, y + 12, 9, 32, '#b8956a');
      s.r(x + 28, y + 12, 6, 32, '#7a5c3c');
      s.r(x + 6, y + 24, 28, 3, '#7a5c3c');            /* a band of slip */
      s.e(x + 20, y + 12, 15, 5, '#b8956a');
      s.e(x + 20, y + 12, 12, 3, P.shadow);
      s.r(x + 34, y + 20, 6, 14, '#9c7a52');
      s.r(x + 36, y + 23, 2, 9, P.shadow);
      s.r(x + 4, y + 44, 32, 3, '#7a5c3c');
      top = y + 12; h = 30;
    } else {
      s.r(x + 8, y + 14, 26, 30, P.pewter);
      s.r(x + 8, y + 14, 8, 30, P.pewterLit);
      s.r(x + 28, y + 14, 6, 30, P.pewterDim);
      s.e(x + 21, y + 14, 14, 5, P.pewterLit);
      s.e(x + 21, y + 14, 11, 3, P.shadow);
      s.r(x + 6, y + 44, 30, 3, P.pewterLit);
      top = y + 14; h = 28;
    }

    /* the liquid, rising from the bottom of the bowl */
    if (liquid && fill > 0) {
      var lh = Math.max(1, Math.round(h * fill));
      var ly = top + (h - lh) + 2;
      var inset = kind === 'bowl' ? 6 : 4;
      var lx = (kind === 'bowl' ? x + 8 : kind === 'pot' ? x + 10 : x + 8) + 0;
      var lw = (kind === 'bowl' ? 26 : kind === 'pot' ? 22 : 26);
      if (kind === 'bowl') {
        s.poly([[lx - 2, ly], [lx + lw + 2, ly], [lx + lw - 2, top + h + 2], [lx + 2, top + h + 2]], liquid);
      } else {
        s.r(lx, ly, lw, lh, liquid);
      }
      /* surface, catching the light */
      s.e(x + 21, ly, kind === 'bowl' ? 13 : 11, 3, liquid);
      s.e(x + 21, ly - 1, kind === 'bowl' ? 9 : 7, 2, 'rgba(255,255,255,0.18)');
      inset = inset; /* (kept for clarity) */

      /* what is stirred through it */
      if (extras.sweet === 'french' || extras.sweet === 'british') {
        s.p(x + 15, ly + 4, P.molasses); s.p(x + 24, ly + 7, P.molasses);
        s.p(x + 19, ly + 10, P.molasses); s.p(x + 27, ly + 3, P.molasses);
      } else if (extras.sweet === 'sugar') {
        s.r(x + 24, ly + 3, 3, 3, P.sugar); s.p(x + 17, ly + 8, P.sugar);
      } else if (extras.sweet === 'honey') {
        s.p(x + 18, ly + 5, P.honey); s.p(x + 25, ly + 9, P.honey); s.p(x + 21, ly + 12, P.honey);
      }

      if (extras.add === 'cream') {
        s.e(x + 19, ly, 8, 2, '#f0e6d2');
        s.e(x + 25, ly + 1, 4, 1, '#f0e6d2');
      } else if (extras.add === 'nutmeg') {
        for (var n = 0; n < 7; n++) s.p(x + 13 + (n * 3) % 16, ly + (n % 3), '#7a4a24');
      } else if (extras.add === 'ginger') {
        for (var g = 0; g < 5; g++) s.p(x + 15 + g * 3, ly + 2 + (g % 2), P.ginger);
      } else if (extras.add === 'lemon') {
        s.e(x + 32, ly - 1, 5, 4, P.lemon);
        s.e(x + 32, ly - 1, 3, 2, '#efe08a');
      } else if (extras.add === 'vinegar') {
        s.p(x + 16, ly + 3, P.white); s.p(x + 26, ly + 6, P.white); s.p(x + 21, ly + 2, P.white);
      }
    }
    return { top: top, h: h };
  }

  function drinkIcon(cv, rec, opts) {
    opts = opts || {};
    var s = surface(cv, 48, 56);
    var spec = iconSpec(rec);
    var kind = vesselFor(spec.base);
    var liquid = LIQUID[spec.base];
    if (opts.ghost) {
      /* an unmade recipe: the shape only, no contents */
      var g = surface(cv, 48, 56);
      g.c.globalAlpha = 0.22;
      drawVessel(g, 4, 4, kind, null, 0, {});
      g.c.globalAlpha = 1;
      /* a question mark, so an unmade recipe reads as "what is this?"
         rather than as a warning */
      var q = '#8a7a63';
      g.r(17, 18, 10, 3, q);
      g.r(25, 20, 3, 5, q);
      g.r(21, 24, 5, 3, q);
      g.r(21, 27, 3, 5, q);
      g.r(21, 35, 3, 3, q);
      return;
    }
    drawVessel(s, 4, 4, kind, liquid, 1, spec);
    /* steam, for anything served hot */
    if (spec.base !== 'water') {
      s.p(16, 8, P.linenDim); s.p(15, 5, P.linenDim); s.p(17, 2, P.linenDim);
      s.p(27, 7, P.linenDim); s.p(28, 4, P.linenDim);
    }
  }

  /* =======================================================================
     THE SHELF — what each ingredient is kept in
     ======================================================================= */

  function bottleIcon(cv, id) {
    var s = surface(cv, 40, 44);
    var f = {
      /* --- bases --- */
      coffee: function () {                       /* a canister of beans */
        s.r(8, 12, 24, 28, '#5a3a24'); s.r(8, 12, 8, 28, '#7a5230');
        s.r(6, 10, 28, 4, '#8a5c3c'); s.r(10, 20, 20, 9, '#3b2416');
        s.e(15, 25, 3, 2, '#6b4a2c'); s.e(22, 24, 3, 2, '#6b4a2c'); s.e(19, 27, 3, 2, '#6b4a2c');
      },
      bohea: function () {                        /* a tea chest */
        s.r(6, 16, 28, 22, '#6b4630'); s.r(6, 16, 28, 4, '#8a5c3c');
        s.r(6, 24, 28, 2, '#4d3225'); s.r(18, 16, 3, 22, '#4d3225');
        s.r(10, 28, 8, 6, '#2e1b10'); s.r(22, 28, 8, 6, '#2e1b10');
      },
      hyson: function () {                        /* a painted caddy */
        s.r(8, 14, 24, 24, '#3f5a50'); s.r(8, 14, 8, 24, '#537367');
        s.r(6, 10, 28, 5, '#8a9099'); s.r(16, 6, 8, 5, '#8a9099');
        s.e(20, 26, 6, 6, '#c3c9d0'); s.e(20, 26, 3, 3, '#3f5a50');
      },
      chocolate: function () {                    /* a milled cake */
        s.r(8, 18, 24, 18, '#4f3020'); s.r(8, 18, 24, 3, '#6b4630');
        s.r(11, 22, 18, 2, '#3a2216'); s.r(11, 27, 18, 2, '#3a2216');
        s.r(19, 18, 2, 18, '#3a2216');
        s.r(6, 36, 28, 3, '#8a5c3c');
      },
      sage: function () {                         /* a bunch off the garden */
        s.r(19, 20, 2, 18, '#5e4126');
        s.e(14, 20, 6, 9, P.moss); s.e(26, 22, 6, 9, P.moss);
        s.e(20, 12, 6, 10, P.mossLit); s.e(14, 20, 3, 5, P.mossLit);
        s.r(15, 34, 10, 3, P.linenDim);
      },
      water: function () {                        /* a stoneware jug */
        s.e(20, 26, 12, 12, P.linenDim); s.r(8, 18, 24, 10, P.linenDim);
        s.r(8, 18, 8, 10, P.linen); s.e(20, 18, 12, 4, P.linen);
        s.r(16, 10, 8, 8, P.linenDim); s.r(16, 8, 8, 3, P.linen);
        s.r(30, 20, 5, 8, P.linenDim); s.r(11, 30, 6, 2, P.linen);
      },
      /* --- sweeteners --- */
      none: function () {                         /* an empty dish */
        s.e(20, 28, 14, 6, P.pewterDim); s.e(20, 26, 13, 5, P.pewter);
        s.e(20, 26, 9, 3, P.shadow);
      },
      french: function () {                       /* an unmarked jug */
        s.r(10, 14, 20, 24, '#4a3626'); s.r(10, 14, 7, 24, '#634c36');
        s.r(14, 8, 12, 7, '#4a3626'); s.r(14, 6, 12, 3, '#634c36');
        s.r(12, 22, 16, 10, P.molasses);
        s.r(13, 24, 3, 1, '#5a4030');             /* no maker's mark at all */
      },
      british: function () {                      /* the same jug, stamped */
        s.r(10, 14, 20, 24, '#4a3626'); s.r(10, 14, 7, 24, '#634c36');
        s.r(14, 8, 12, 7, '#4a3626'); s.r(14, 6, 12, 3, '#634c36');
        s.r(12, 22, 16, 10, P.molasses);
        s.poly([[16, 20], [20, 16], [24, 20]], P.amber);   /* a crown stamp */
        s.r(16, 20, 9, 2, P.amber);
      },
      sugar: function () {                        /* a loaf and nippers */
        s.poly([[20, 6], [30, 38], [10, 38]], P.sugar);
        s.poly([[20, 6], [25, 22], [16, 22]], P.white);
        s.r(8, 38, 24, 3, '#3f5a70');
        s.r(6, 30, 6, 2, P.pewter); s.r(6, 34, 6, 2, P.pewter);
      },
      honey: function () {                        /* a straw skep */
        s.e(20, 30, 14, 12, '#c99a4a');
        for (var i = 0; i < 4; i++) s.e(20, 22 + i * 4, 14 - i * 2, 3, '#b8862f');
        s.e(20, 18, 6, 3, '#c99a4a');
        s.r(18, 36, 5, 4, '#3a2a12');
        s.p(28, 22, P.amberLit); s.p(30, 26, P.amberLit);
      },
      /* --- additions --- */
      cream: function () {                        /* a little pitcher */
        s.r(10, 18, 20, 20, P.linen); s.r(10, 18, 7, 20, P.cream);
        s.e(20, 18, 10, 4, P.cream);
        s.poly([[8, 18], [14, 14], [14, 20]], P.linen);
        s.r(30, 22, 5, 9, P.linen); s.r(31, 24, 3, 5, P.shadow);
        s.r(12, 22, 16, 6, P.white);
      },
      nutmeg: function () {                       /* a nut and a grater */
        s.e(14, 24, 7, 9, '#7a4a24'); s.e(13, 22, 4, 5, '#96603a');
        s.r(24, 12, 8, 26, P.pewter); s.r(24, 12, 3, 26, P.pewterLit);
        for (var n = 0; n < 7; n++) { s.p(26, 16 + n * 3, P.shadow); s.p(29, 17 + n * 3, P.shadow); }
      },
      ginger: function () {                       /* a dried root */
        s.e(18, 26, 10, 6, P.ginger); s.e(26, 22, 6, 4, P.ginger);
        s.e(11, 22, 5, 4, P.ginger); s.e(22, 32, 5, 3, P.ginger);
        s.e(17, 24, 5, 3, '#dbb684');
        s.p(14, 28, '#9a743f'); s.p(23, 27, '#9a743f');
      },
      lemon: function () {                        /* off a ship, and perishing */
        s.e(20, 26, 12, 10, P.lemon); s.e(17, 23, 6, 4, '#efe08a');
        s.e(30, 26, 3, 2, P.lemon); s.e(10, 26, 3, 2, P.lemon);
        s.r(19, 14, 2, 4, P.moss); s.e(24, 15, 4, 3, P.mossLit);
      },
      vinegar: function () {                      /* a small dark bottle */
        s.r(13, 16, 14, 22, '#3f5a3c'); s.r(13, 16, 5, 22, '#557548');
        s.r(17, 8, 6, 9, '#3f5a3c'); s.r(16, 6, 8, 3, '#8a5c3c');
        s.r(15, 24, 10, 10, '#2c3f2a');
        s.r(15, 20, 10, 3, P.linen);
      }
    }[id];
    if (f) f(); else { s.r(12, 16, 16, 20, P.pewterDim); }
  }

  /* =======================================================================
     WOODCUTS — newspaper illustrations
     ======================================================================= */

  var CUTS = {
    /* a preacher on a rise, and a great many hats */
    preaching: function (s) {
      s.r(0, 0, 96, 64, P.paper);
      s.e(48, 66, 54, 16, P.paperDim);                 /* the rise           */
      s.r(40, 24, 5, 16, P.paperInk);                  /* the preacher       */
      s.e(42, 21, 4, 4, P.paperInk);
      s.poly([[34, 30], [42, 24], [42, 28]], P.paperInk);   /* arm thrown up */
      s.poly([[50, 30], [43, 24], [43, 28]], P.paperInk);
      s.r(36, 40, 14, 6, P.paperInk);                  /* a stand           */
      /* The crowd, in three ranks on a shared baseline. Scattered dots read
         as noise; heads and shoulders in rows read as people. */
      for (var row = 0; row < 3; row++) {
        var by = 44 + row * 6;
        for (var i = 0; i < 15 - row * 2; i++) {
          var x = 5 + i * (row === 0 ? 6 : row === 1 ? 7 : 8) + row * 3;
          if (x > 91) continue;
          s.r(x - 2, by + 2, 5, 5, P.paperInk);        /* shoulders         */
          s.r(x - 1, by - 1, 3, 3, P.paperInk);        /* head              */
          s.r(x - 3, by - 2, 7, 1, P.paperInk);        /* everyone in a hat */
        }
      }
      s.r(0, 0, 96, 1, P.paperInk); s.r(0, 63, 96, 1, P.paperInk);
      s.r(0, 0, 1, 64, P.paperInk); s.r(95, 0, 1, 64, P.paperInk);
    },
    /* a bill of credit, torn across */
    money: function (s) {
      s.r(0, 0, 96, 64, P.paper);
      s.poly([[16, 14], [48, 12], [46, 52], [14, 50]], '#d8caa8');
      s.poly([[50, 12], [80, 14], [82, 50], [48, 52]], '#d8caa8');
      s.r(14, 50, 34, 1, P.paperInk); s.r(48, 50, 34, 1, P.paperInk);
      for (var i = 0; i < 6; i++) {
        s.r(20, 20 + i * 5, 22 - (i % 2) * 6, 1, P.paperInk);
        s.r(54, 20 + i * 5, 22 - (i % 3) * 5, 1, P.paperInk);
      }
      s.r(18, 16, 26, 2, P.paperInk); s.r(54, 16, 26, 2, P.paperInk);
      /* the tear */
      s.poly([[47, 10], [50, 20], [46, 30], [51, 40], [47, 54]], P.paper);
      s.r(0, 0, 96, 1, P.paperInk); s.r(0, 63, 96, 1, P.paperInk);
      s.r(0, 0, 1, 64, P.paperInk); s.r(95, 0, 1, 64, P.paperInk);
    },
    /* a sloop, and barrels on the wharf */
    shipping: function (s) {
      s.r(0, 0, 96, 64, P.paper);
      s.r(0, 46, 96, 18, '#d8caa8');
      for (var w = 0; w < 8; w++) s.r(4 + w * 12, 50 + (w % 3) * 4, 8, 1, P.paperInk);
      s.poly([[26, 40], [74, 40], [68, 48], [32, 48]], P.paperInk);   /* hull */
      s.r(48, 12, 2, 28, P.paperInk);                                 /* mast */
      s.poly([[50, 14], [68, 38], [50, 38]], '#c8b894');              /* sail */
      s.poly([[46, 18], [32, 38], [46, 38]], '#c8b894');
      s.r(50, 14, 18, 1, P.paperInk); s.r(32, 38, 36, 1, P.paperInk);
      for (var b = 0; b < 3; b++) {                                   /* casks */
        var bx = 8 + b * 11;
        s.e(bx, 54, 5, 7, '#b8a887');
        s.r(bx - 5, 51, 10, 1, P.paperInk); s.r(bx - 5, 57, 10, 1, P.paperInk);
      }
      s.r(0, 0, 96, 1, P.paperInk); s.r(0, 63, 96, 1, P.paperInk);
      s.r(0, 0, 1, 64, P.paperInk); s.r(95, 0, 1, 64, P.paperInk);
    },
    /* a sugar loaf, a tea chest, a lemon: the advertisement */
    goods: function (s) {
      s.r(0, 0, 96, 64, P.paper);
      s.poly([[24, 10], [34, 46], [14, 46]], '#d8caa8');
      s.poly([[24, 10], [28, 28], [20, 28]], P.paper);
      s.r(12, 46, 24, 2, P.paperInk);
      s.r(44, 24, 26, 22, '#d8caa8');
      s.r(44, 24, 26, 1, P.paperInk); s.r(44, 45, 26, 1, P.paperInk);
      s.r(56, 24, 1, 22, P.paperInk); s.r(44, 33, 26, 1, P.paperInk);
      s.e(80, 40, 8, 6, '#d8caa8');
      s.e(80, 40, 8, 6, null); s.r(72, 40, 16, 1, P.paperInk);
      s.r(79, 32, 1, 3, P.paperInk);
      s.r(0, 0, 96, 1, P.paperInk); s.r(0, 63, 96, 1, P.paperInk);
      s.r(0, 0, 1, 64, P.paperInk); s.r(95, 0, 1, 64, P.paperInk);
    },
    /* a press, and a sheet coming off it */
    press: function (s) {
      s.r(0, 0, 96, 64, P.paper);
      s.r(18, 8, 6, 48, P.paperInk); s.r(66, 8, 6, 48, P.paperInk);
      s.r(18, 8, 54, 5, P.paperInk);
      s.r(30, 14, 30, 5, P.paperInk);                 /* the platen         */
      s.r(43, 19, 4, 10, P.paperInk);
      s.r(24, 30, 42, 4, '#d8caa8');                  /* the bed            */
      s.r(24, 34, 42, 2, P.paperInk);
      s.poly([[32, 36], [62, 36], [58, 56], [28, 56]], '#d8caa8');   /* sheet */
      for (var i = 0; i < 5; i++) s.r(34, 40 + i * 3, 22 - (i % 2) * 7, 1, P.paperInk);
      s.r(70, 22, 14, 3, P.paperInk);                 /* the bar            */
      s.r(0, 0, 96, 1, P.paperInk); s.r(0, 63, 96, 1, P.paperInk);
      s.r(0, 0, 1, 64, P.paperInk); s.r(95, 0, 1, 64, P.paperInk);
    },
    /* the King's seal on a customs paper */
    customs: function (s) {
      s.r(0, 0, 96, 64, P.paper);
      s.r(22, 8, 52, 48, '#d8caa8');
      s.r(22, 8, 52, 1, P.paperInk); s.r(22, 55, 52, 1, P.paperInk);
      s.r(22, 8, 1, 48, P.paperInk); s.r(73, 8, 1, 48, P.paperInk);
      for (var i = 0; i < 6; i++) s.r(28, 16 + i * 5, 38 - (i % 3) * 9, 1, P.paperInk);
      s.e(58, 46, 9, 9, P.redDim);                    /* the wax seal        */
      s.e(58, 46, 6, 6, P.red);
      s.poly([[54, 46], [58, 41], [62, 46]], P.paper);
      s.r(54, 46, 9, 2, P.paper);
      s.r(0, 0, 96, 1, P.paperInk); s.r(0, 63, 96, 1, P.paperInk);
      s.r(0, 0, 1, 64, P.paperInk); s.r(95, 0, 1, 64, P.paperInk);
    }
  };

  function woodcut(cv, kind) {
    var s = surface(cv, 96, 64);
    (CUTS[kind] || CUTS.goods)(s);
  }

  global.Icons = {
    drinkIcon: drinkIcon, bottleIcon: bottleIcon, woodcut: woodcut,
    LIQUID: LIQUID, vesselFor: vesselFor, drawVessel: drawVessel,
    surface: surface, iconSpec: iconSpec, P: P
  };

})(window);
