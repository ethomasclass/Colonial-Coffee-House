/* ===========================================================================
   titlecard.js — Boston at dusk, drawn for the title screen.

   The obvious model for this is Coffee Talk's Seattle skyline. Boston in 1741
   has no skyline to draw: the tallest things in town are church steeples and
   the masts in the harbour, and the whole place is two- and three-storey
   gable ends. So that is the silhouette — spires, roofs, a windmill on the
   hill, and a forest of rigging along the water, which is what a visitor
   actually remarked on when they came up the harbour.

   Same 384x216 grid as the room, scaled up with smoothing off.
   =========================================================================== */

(function (global) {
  'use strict';

  var W = 384, H = 216;

  var C = {
    skyTop:   '#2b2340',
    skyMid:   '#6d3f5c',
    skyWarm:  '#b35f5e',
    skyLow:   '#e0905f',
    skyGlow:  '#f6c07a',
    cloudDim: '#7a4560',
    cloudLit: '#c9756c',
    cloudHot: '#efa878',
    hill:     '#3a2c46',
    farTown:  '#2a2138',
    town:     '#1a1526',
    townLit:  '#241d33',
    ink:      '#120e1c',
    water:    '#241d38',
    waterLit: '#8a5566',
    lamp:     '#f0c070'
  };

  function px(c, x, y, w, h, col) {
    c.fillStyle = col;
    c.fillRect(x | 0, y | 0, w | 0, h | 0);
  }

  /* A soft-edged bank of cloud. Two tones and a scatter along the underside,
     so the edge breaks up instead of ending in a hard line. */
  function cloud(c, cx, cy, w, h, lit) {
    var n = Math.max(3, Math.round(w / 14));
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1) - 0.5;
      var bw = Math.round(w * (0.34 - Math.abs(t) * 0.22));
      var bh = Math.round(h * (1 - Math.abs(t) * 1.15));
      if (bw < 3 || bh < 2) continue;
      c.fillStyle = lit;
      c.beginPath();
      c.ellipse(cx + t * w, cy + Math.abs(t) * h * 0.5, bw, bh, 0, 0, Math.PI * 2);
      c.fill();
    }
  }

  /* A meeting-house steeple: tower, belfry, spire, weathervane. Two of these
     and the town reads as Boston rather than as a row of sheds. */
  function steeple(c, x, base, h, col) {
    var w = Math.max(5, Math.round(h * 0.17));
    px(c, x - w / 2, base - h * 0.55, w, h * 0.55, col);          /* tower   */
    px(c, x - w / 2 - 1, base - h * 0.62, w + 2, h * 0.08, col);  /* belfry  */
    var sh = h * 0.38, steps = Math.max(4, Math.round(sh / 3));
    for (var i = 0; i < steps; i++) {
      var t = i / steps;
      var sw = Math.max(1, Math.round(w * (1 - t) * 0.8));
      px(c, x - sw / 2, base - h * 0.62 - (i + 1) * (sh / steps), sw, sh / steps + 1, col);
    }
    px(c, x, base - h - 4, 1, 5, col);                            /* the vane */
    px(c, x, base - h - 3, 4, 1, col);
  }

  function gable(c, x, base, w, h, col) {
    px(c, x, base - h, w, h, col);
    for (var i = 0; i < w / 2; i++) {                             /* the roof */
      px(c, x + i, base - h - i, w - i * 2, 1, col);
    }
  }

  function windmill(c, x, base, col) {
    px(c, x - 4, base - 16, 8, 16, col);
    px(c, x - 5, base - 20, 10, 5, col);
    for (var a = 0; a < 4; a++) {                                 /* the sails */
      var ang = a * Math.PI / 2 + 0.4;
      for (var r = 3; r < 13; r++) {
        px(c, x + Math.cos(ang) * r, base - 18 + Math.sin(ang) * r, 1, 1, col);
      }
    }
  }

  /* Rigging. A ship at anchor is mostly vertical lines with a few spars
     across, and a dozen of them along a waterfront is the thing that told you
     at a glance that a town lived on the sea. */
  function ship(c, x, base, h, col) {
    /* hull: low and long, with the waterline cutting it off */
    px(c, x - 11, base - 3, 23, 3, col);
    px(c, x - 8,  base - 5, 17, 2, col);
    px(c, x + 11, base - 6, 7, 1, col);                           /* bowsprit */
    px(c, x + 16, base - 7, 3, 1, col);
    /* three masts, the middle one tallest, all of them thin */
    [[0, 1], [-7, 0.78], [7, 0.66]].forEach(function (m) {
      px(c, x + m[0], base - 4 - h * m[1], 1, h * m[1], col);
    });
    /* yards, shorter as they climb */
    [[0, 0.86, 7], [0, 0.62, 9], [0, 0.38, 10],
     [-7, 0.62, 5], [-7, 0.40, 6], [7, 0.52, 4], [7, 0.32, 5]].forEach(function (y) {
      px(c, x + y[0] - y[2], base - 4 - h * y[1], y[2] * 2, 1, col);
    });
  }

  function draw(canvas) {
    var c = canvas.getContext('2d');
    canvas.width = W; canvas.height = H;
    c.imageSmoothingEnabled = false;

    /* --- sky, banded rather than smooth so it sits with the pixel art --- */
    var g = c.createLinearGradient(0, 0, 0, 150);
    g.addColorStop(0, C.skyTop);
    g.addColorStop(0.42, C.skyMid);
    g.addColorStop(0.72, C.skyWarm);
    g.addColorStop(0.93, C.skyLow);
    g.addColorStop(1, C.skyGlow);
    c.fillStyle = g; c.fillRect(0, 0, W, 152);

    /* the sun already down, and still lighting the underside of everything */
    var s = c.createRadialGradient(268, 150, 2, 268, 150, 90);
    s.addColorStop(0, 'rgba(255,208,140,.85)');
    s.addColorStop(0.45, 'rgba(240,150,100,.32)');
    s.addColorStop(1, 'rgba(240,150,100,0)');
    c.fillStyle = s; c.fillRect(0, 60, W, 92);

    /* --- cloud banks ---------------------------------------------------- */
    cloud(c, 92, 44, 120, 13, C.cloudDim);
    cloud(c, 108, 40, 96, 10, C.cloudLit);
    cloud(c, 286, 30, 118, 12, C.cloudDim);
    cloud(c, 300, 27, 88, 9, C.cloudLit);
    cloud(c, 250, 70, 150, 9, C.cloudDim);
    cloud(c, 268, 68, 104, 6, C.cloudHot);
    cloud(c, 46, 84, 92, 6, C.cloudLit);

    /* --- the far shore -------------------------------------------------- */
    c.fillStyle = C.hill;
    c.beginPath();
    c.moveTo(0, 128);
    c.bezierCurveTo(60, 108, 130, 122, 200, 116);
    c.bezierCurveTo(270, 110, 330, 124, W, 118);
    c.lineTo(W, 152); c.lineTo(0, 152); c.closePath(); c.fill();
    windmill(c, 46, 122, C.farTown);

    /* --- the town ------------------------------------------------------- */
    var base = 152;
    px(c, 0, base - 10, W, 10, C.town);
    var roofs = [[6,22,9],[26,14,13],[40,20,8],[58,16,15],[74,26,11],[100,18,9],
                 [118,22,14],[140,15,10],[155,24,12],[179,17,9],[196,20,15],
                 [216,14,10],[230,26,12],[256,16,9],[272,22,14],[294,15,10],
                 [309,24,11],[333,18,9],[351,20,13],[371,13,10]];
    roofs.forEach(function (r, i) {
      var col = i % 3 === 1 ? C.townLit : C.town;
      if (i % 7 === 3) {
        /* a flat-topped brick merchant's house, taller than its neighbours */
        px(c, r[0], base - r[2] - 7, r[1], r[2] + 7, col);
        px(c, r[0] - 1, base - r[2] - 9, r[1] + 2, 2, col);        /* parapet */
        px(c, r[0] + 3, base - r[2] - 14, 2, 5, C.town);
        px(c, r[0] + r[1] - 5, base - r[2] - 13, 2, 4, C.town);
      } else {
        gable(c, r[0], base, r[1], r[2], col);
        px(c, r[0] + 2, base - r[2] - r[1] / 2 - 4, 2, 5, C.town);
        if (i % 4 === 2) px(c, r[0] + r[1] - 4, base - r[2] - r[1] / 2 - 3, 2, 4, C.town);
      }
    });
    steeple(c, 86, base, 62, C.town);        /* Old North, more or less      */
    steeple(c, 208, base, 74, C.town);       /* and the taller one, Old South */
    steeple(c, 318, base, 48, C.townLit);

    /* --- the harbour ---------------------------------------------------- */
    px(c, 0, base, W, H - base, C.water);
    for (var i = 0; i < 46; i++) {
      var wx = (i * 53) % W, wy = base + 4 + ((i * 29) % (H - base - 6));
      var ww = 4 + ((i * 7) % 16);
      c.globalAlpha = 0.10 + ((i * 13) % 20) / 100;
      px(c, wx, wy, ww, 1, C.waterLit);
    }
    c.globalAlpha = 1;
    /* The sun's road. Solid rungs read as a staircase, so it is broken into
       dashes that scatter wider and thinner the closer they come. */
    for (var k = 0; k < 30; k++) {
      var ry = base + 2 + k * 2.1;
      if (ry > H - 2) break;
      var spread = 5 + k * 1.9;
      var pieces = 1 + (k % 3);
      for (var q = 0; q < pieces; q++) {
        var jitter = ((k * 37 + q * 71) % 100) / 100 - 0.5;
        var dw = Math.max(1, Math.round(6 - k * 0.16 + (q % 2) * 3));
        c.globalAlpha = Math.max(0, 0.34 - k * 0.010) * (q ? 0.6 : 1);
        px(c, 268 + jitter * spread * 2 - dw / 2, ry, dw, 1, C.skyGlow);
      }
    }
    c.globalAlpha = 1;

    ship(c, 52, base + 6, 40, C.ink);
    ship(c, 128, base + 4, 32, C.ink);
    ship(c, 300, base + 7, 44, C.ink);
    ship(c, 356, base + 3, 26, C.ink);

    /* a few windows still lit along the shore */
    [[34,146],[62,148],[112,145],[147,147],[203,144],[241,148],[288,146],[344,147]]
      .forEach(function (p) { px(c, p[0], p[1], 1, 1, C.lamp); });

    /* --- vignette ------------------------------------------------------- */
    var v = c.createLinearGradient(0, H - 60, 0, H);
    v.addColorStop(0, 'rgba(18,14,28,0)');
    v.addColorStop(1, 'rgba(18,14,28,.75)');
    c.fillStyle = v; c.fillRect(0, H - 60, W, 60);
  }

  global.TitleCard = { draw: draw, W: W, H: H };

})(window);
