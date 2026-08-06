/* ===========================================================================
   chores.js — the cleaning game.

   Its own scene and its own canvas, because scrubbing a counter you are
   looking at edge-on never felt like anything. Two views:

     'bar'     the bar top, seen from directly above
     'pewter'  a single tankard, close enough to see the tarnish

   Dirt is a grid, not a list of objects. Every cell holds a grime level, the
   rag knocks it down by one per pass, and the cell is redrawn at a lower
   opacity — so a heavy ring takes four sweeps and you watch it fade rather
   than blink out. Cleaning is metered by distance traveled, so it’s the
   movement that does the work.
   =========================================================================== */

(function (global) {
  'use strict';

  var W = 384, H = 216, CS = 4;
  var GW = W / CS, GH = H / CS;          /* 96 x 54 cells */
  var MAX = 4;                            /* passes to clear the worst of it */
  var BRUSH = 13;                         /* logical px, about the rag’s width */
  var STEP = 6;                           /* px of travel between passes      */

  var view, vctx, buf, bctx;
  var bg, bgx;                            /* the clean surface, drawn once     */
  var dirtCv, dctx, dirtImg;              /* one pixel per cell, blitted big   */

  var dirt, mask;
  var scene = 'bar', total = 0, remaining = 0, dirtDirty = true;
  var running = false, done = false, doneAt = 0, frame = 0;
  var travel = 0, last = null;
  var rag = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, ang: 0, down: false, seen: false };
  var trail = [];
  var onFinish = null, onProgress = null;

  function rnd(s) { var x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); }

  /* Smooth blotchy noise, roughly 0..1. Per-cell randomness gives you
     television static; layered sines give you something that looks like dirt
     actually settled there. */
  function blotch(x, y, scale) {
    var s = scale || 1;
    var v = Math.sin(x * 0.29 * s + Math.cos(y * 0.19 * s) * 2.1)
          + Math.sin(y * 0.23 * s + Math.cos(x * 0.15 * s) * 1.7) * 0.8
          + Math.sin((x + y) * 0.11 * s) * 0.6;
    return Math.max(0, Math.min(1, (v / 2.4 + 1) / 2));
  }

  /* =======================================================================
     SETUP
     ======================================================================= */

  function init(canvas) {
    view = canvas;
    buf = document.createElement('canvas'); buf.width = W; buf.height = H;
    bctx = buf.getContext('2d'); bctx.imageSmoothingEnabled = false;
    bg = document.createElement('canvas'); bg.width = W; bg.height = H;
    bgx = bg.getContext('2d'); bgx.imageSmoothingEnabled = false;
    dirtCv = document.createElement('canvas'); dirtCv.width = GW; dirtCv.height = GH;
    dctx = dirtCv.getContext('2d');
    dirtImg = dctx.createImageData(GW, GH);
    resize();
    global.addEventListener('resize', resize);
    bind();
  }

  function resize() {
    if (!view) return;
    var host = view.parentElement;
    if (!host) return;
    var s = Math.min(host.clientWidth / W, host.clientHeight / H);
    if (s > 1) s = Math.floor(s);
    view.width = Math.max(1, Math.round(W * s));
    view.height = Math.max(1, Math.round(H * s));
    vctx = view.getContext('2d');
    vctx.imageSmoothingEnabled = false;
  }

  /* --- little drawing helpers, for the background only -------------------- */
  function R(x, y, w, h, c) { bgx.fillStyle = c; bgx.fillRect(x | 0, y | 0, w | 0, h | 0); }
  function E(cx, cy, rx, ry, c) {
    bgx.fillStyle = c;
    for (var y = -ry; y <= ry; y++) {
      var t = 1 - (y * y) / (ry * ry); if (t < 0) continue;
      var half = Math.round(rx * Math.sqrt(t)); if (half <= 0) continue;
      bgx.fillRect((cx - half) | 0, (cy + y) | 0, half * 2, 1);
    }
  }

  /* =======================================================================
     SCENE: THE BAR FROM ABOVE
     ======================================================================= */

  function buildBar() {
    R(0, 0, W, H, '#2a1a12');
    /* six boards running the length of the bar */
    var boards = 6, bh = Math.floor((H - 24) / boards);
    for (var i = 0; i < boards; i++) {
      var y = 12 + i * bh;
      R(0, y, W, bh - 1, i % 2 ? '#5a3a27' : '#6b4630');
      R(0, y + bh - 1, W, 1, '#33211a');
      /* grain */
      for (var g = 0; g < 26; g++) {
        var gx = Math.round(rnd(i * 40 + g) * W);
        var gy = y + 2 + Math.round(rnd(i * 91 + g * 3) * (bh - 5));
        R(gx, gy, 6 + Math.round(rnd(g * 7.7) * 22), 1, i % 2 ? '#4a2f20' : '#5a3a27');
      }
      /* nail heads at the ends */
      R(9, y + Math.floor(bh / 2), 2, 2, '#8a8f96');
      R(W - 11, y + Math.floor(bh / 2), 2, 2, '#8a8f96');
    }
    /* the front and back edges of the bar, rounded over */
    R(0, 0, W, 12, '#3d2618'); R(0, 10, W, 2, '#8a5c3c');
    R(0, H - 12, W, 12, '#3d2618'); R(0, H - 12, W, 2, '#8a5c3c');

    mask = new Uint8Array(GW * GH);
    for (var cy = 0; cy < GH; cy++)
      for (var cx = 0; cx < GW; cx++)
        mask[cy * GW + cx] = (cy * CS > 12 && cy * CS < H - 14) ? 1 : 0;

    dirt = new Uint8Array(GW * GH);
    /* drink rings — the worst of it, and the most satisfying to lift */
    for (var r = 0; r < 5; r++) {
      var rx = 40 + rnd(r * 3.3) * (W - 80), ry = 40 + rnd(r * 8.1) * (H - 90);
      var rad = 13 + rnd(r * 5.5) * 7;
      stamp(rx, ry, rad + 4, function (d) {
        return (d > rad - 5 && d < rad + 3) ? MAX : (d < rad - 5 ? 1 : 0);
      });
    }
    /* spills */
    for (var sp = 0; sp < 3; sp++) {
      var sx = 30 + rnd(sp * 17.3) * (W - 60), sy = 34 + rnd(sp * 4.9) * (H - 80);
      stamp(sx, sy, 18, function (d) { return d < 11 ? 3 : (d < 18 ? 2 : 0); });
    }
    /* a general film of grime, patchy rather than speckled */
    for (var cy2 = 0; cy2 < GH; cy2++) {
      for (var cx2 = 0; cx2 < GW; cx2++) {
        var i2 = cy2 * GW + cx2;
        if (!mask[i2]) continue;
        var n = blotch(cx2, cy2, 1);
        var lvl = n > 0.74 ? 2 : (n > 0.46 ? 1 : 0);
        if (lvl > dirt[i2]) dirt[i2] = lvl;
      }
    }
    finishSetup();
  }

  /* =======================================================================
     SCENE: A PEWTER TANKARD, CLOSE UP
     ======================================================================= */

  var TANK = { x: 118, y: 34, w: 132, h: 150 };

  function inTankard(px, py) {
    var t = TANK;
    /* body, with the corners taken off */
    if (px >= t.x && px <= t.x + t.w && py >= t.y && py <= t.y + t.h) {
      var dx = Math.min(px - t.x, t.x + t.w - px);
      var dy = Math.min(py - t.y, t.y + t.h - py);
      if (dx > 6 || dy > 6 || (dx * dx + dy * dy) > 12) return true;
    }
    /* the handle, a ring off the right-hand side */
    var hx = px - (t.x + t.w + 16), hy = py - (t.y + t.h * 0.55);
    var d = Math.sqrt(hx * hx + hy * hy * 1.4);
    if (d > 14 && d < 27 && px > t.x + t.w - 4) return true;
    return false;
  }

  function buildPewter() {
    /* a dim tavern backdrop so the metal is the brightest thing here */
    R(0, 0, W, H, '#241823');
    for (var i = 0; i < 40; i++) {
      var bx = Math.round(rnd(i * 2.1) * W), by = Math.round(rnd(i * 6.3) * H);
      R(bx, by, 2, 2, '#2e2029');
    }
    R(0, H - 30, W, 30, '#3d2618'); R(0, H - 30, W, 2, '#6b4630');

    var t = TANK;
    /* handle behind the body */
    E(t.x + t.w + 16, t.y + t.h * 0.55, 27, 32, '#6b7078');
    E(t.x + t.w + 16, t.y + t.h * 0.55, 14, 17, '#241823');

    /* body */
    R(t.x, t.y + 6, t.w, t.h - 12, '#8a9099');
    R(t.x + 6, t.y, t.w - 12, t.h, '#8a9099');
    /* the light comes from the left, as it does in the room */
    R(t.x + 8, t.y + 8, 26, t.h - 16, '#b9c0c8');
    R(t.x + 14, t.y + 12, 10, t.h - 24, '#dfe4e9');
    R(t.x + t.w - 26, t.y + 8, 18, t.h - 16, '#5e646c');
    /* rim and foot, the parts that catch a cloth first */
    E(t.x + t.w / 2, t.y + 8, t.w / 2, 12, '#aeb4bb');
    E(t.x + t.w / 2, t.y + 8, t.w / 2 - 8, 8, '#3d434a');
    R(t.x - 3, t.y + t.h - 16, t.w + 6, 12, '#9aa1a9');
    R(t.x - 3, t.y + t.h - 16, t.w + 6, 3, '#cfd5db');
    /* hammer marks, because it was beaten not cast */
    for (var m = 0; m < 34; m++) {
      var mx = t.x + 10 + rnd(m * 3.9) * (t.w - 20);
      var my = t.y + 20 + rnd(m * 7.1) * (t.h - 44);
      R(mx, my, 2, 1, '#79808a');
    }
    /* an owner’s mark, which only shows once it’s polished */
    R(t.x + 52, t.y + 74, 3, 18, '#6e757e');
    R(t.x + 52, t.y + 74, 16, 3, '#6e757e');
    R(t.x + 64, t.y + 74, 3, 18, '#6e757e');

    mask = new Uint8Array(GW * GH);
    dirt = new Uint8Array(GW * GH);
    for (var cy = 0; cy < GH; cy++) {
      for (var cx = 0; cx < GW; cx++) {
        var px = cx * CS + CS / 2, py = cy * CS + CS / 2;
        var idx = cy * GW + cx;
        if (!inTankard(px, py)) continue;
        mask[idx] = 1;
        /* Tarnish in soft patches, heavier low down where it collects and
           lighter along the left where the metal gets handled and rubbed. */
        var n = blotch(cx, cy, 1.15);
        var low = (py - TANK.y) / TANK.h;              /* 0 at rim, 1 at foot */
        var lit = Math.max(0, 1 - Math.abs(px - (TANK.x + 20)) / 46);
        var v = n * 2.6 + low * 1.5 - lit * 1.1 + 1.1;
        dirt[idx] = Math.max(1, Math.min(MAX, Math.round(v)));
      }
    }
    finishSetup();
  }

  /* --- shared -------------------------------------------------------------- */
  function stamp(cxp, cyp, radius, fn) {
    var c0 = Math.max(0, Math.floor((cxp - radius) / CS)), c1 = Math.min(GW - 1, Math.ceil((cxp + radius) / CS));
    var r0 = Math.max(0, Math.floor((cyp - radius) / CS)), r1 = Math.min(GH - 1, Math.ceil((cyp + radius) / CS));
    for (var cy = r0; cy <= r1; cy++) {
      for (var cx = c0; cx <= c1; cx++) {
        var idx = cy * GW + cx;
        if (!mask[idx]) continue;
        var dx = (cx * CS + CS / 2) - cxp, dy = (cy * CS + CS / 2) - cyp;
        var v = fn(Math.sqrt(dx * dx + dy * dy));
        if (v > dirt[idx]) dirt[idx] = Math.min(MAX, v);
      }
    }
  }

  function finishSetup() {
    total = 0;
    for (var i = 0; i < dirt.length; i++) total += dirt[i];
    remaining = total;
    dirtDirty = true;
    done = false; doneAt = 0; travel = 0; last = null; trail = [];
    rag.x = rag.tx = W / 2; rag.y = rag.ty = H + 40; rag.seen = false;
  }

  function open(which, finishCb, progressCb) {
    scene = which; onFinish = finishCb; onProgress = progressCb;
    if (which === 'pewter') buildPewter(); else buildBar();
    running = true;
    resize();
    report();
    requestAnimationFrame(tick);
  }

  function close() { running = false; }

  function progress() { return total ? 1 - remaining / total : 1; }
  function report() { if (onProgress) onProgress(progress(), done); }

  /* =======================================================================
     WIPING
     ======================================================================= */

  function pass(cxp, cyp) {
    var c0 = Math.max(0, Math.floor((cxp - BRUSH) / CS)), c1 = Math.min(GW - 1, Math.ceil((cxp + BRUSH) / CS));
    var r0 = Math.max(0, Math.floor((cyp - BRUSH) / CS)), r1 = Math.min(GH - 1, Math.ceil((cyp + BRUSH) / CS));
    var lifted = 0;
    for (var cy = r0; cy <= r1; cy++) {
      for (var cx = c0; cx <= c1; cx++) {
        var idx = cy * GW + cx;
        if (!dirt[idx]) continue;
        var dx = (cx * CS + CS / 2) - cxp, dy = (cy * CS + CS / 2) - cyp;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > BRUSH) continue;
        /* the middle of the cloth does more work than the edge */
        var bite = d < BRUSH * 0.55 ? 1 : (Math.random() < 0.5 ? 1 : 0);
        if (!bite) continue;
        dirt[idx]--; remaining--; lifted++;
      }
    }
    if (lifted) { dirtDirty = true; report(); }
    return lifted;
  }

  /* Cleaning is metered by how far the cloth has actually traveled, so
     holding still doesn’thing and it’s the scrubbing that lifts it. */
  function moveTo(pt) {
    rag.tx = pt.x; rag.ty = pt.y; rag.seen = true;
    if (!rag.down || done) { last = pt; return; }
    if (!last) { last = pt; return; }
    var dx = pt.x - last.x, dy = pt.y - last.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    travel += dist;
    var lifted = 0;
    while (travel >= STEP && dist > 0) {
      travel -= STEP;
      var t = 1 - (travel / Math.max(dist, 0.001));
      lifted += pass(last.x + dx * Math.min(1, Math.max(0, t)), last.y + dy * Math.min(1, Math.max(0, t)));
    }
    last = pt;
    if (lifted && global.Sound) global.Sound.scrub(Math.min(1, dist / 14));
    if (!done && progress() >= 0.92) finish();
  }

  function finish() {
    done = true; doneAt = frame;
    for (var i = 0; i < dirt.length; i++) dirt[i] = 0;
    remaining = 0; dirtDirty = true;
    report();
    if (global.Sound) global.Sound.chime();
    /* long enough to enjoy the shine before it hands you back */
    if (onFinish) setTimeout(onFinish, 1800);
  }

  /* =======================================================================
     RENDER
     ======================================================================= */

  function paintDirt() {
    var d = dirtImg.data;
    var col = scene === 'pewter' ? [44, 38, 30] : [38, 22, 13];
    for (var i = 0; i < GW * GH; i++) {
      var lvl = dirt[i], o = i * 4;
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2];
      d[o + 3] = lvl ? Math.round((scene === 'pewter' ? 52 : 58) * lvl) : 0;
    }
    dctx.putImageData(dirtImg, 0, 0);
    dirtDirty = false;
  }

  function drawRag() {
    if (!rag.seen) return;
    var ctx = bctx;
    ctx.save();
    ctx.translate(Math.round(rag.x), Math.round(rag.y));
    ctx.rotate(rag.ang);
    /* damp shadow beneath */
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(-14, -8, 28, 20);
    /* folded linen */
    ctx.fillStyle = '#b09b7c'; ctx.fillRect(-15, -11, 30, 21);
    ctx.fillStyle = '#d6c3a0'; ctx.fillRect(-15, -11, 30, 7);
    ctx.fillStyle = '#efe0c2'; ctx.fillRect(-13, -9, 26, 4);
    ctx.fillStyle = '#9c8a72'; ctx.fillRect(-15, 8, 30, 2);
    /* creases, and a corner that lifts as it moves */
    ctx.fillStyle = '#9c8a72';
    ctx.fillRect(-10, -1, 9, 1); ctx.fillRect(1, 3, 9, 1);
    var lift = (frame % 26 < 13) ? 0 : 1;
    ctx.fillStyle = '#efe0c2';
    ctx.fillRect(9, -15 - lift, 7, 5);
    ctx.restore();
  }

  function drawTrail() {
    for (var i = 0; i < trail.length; i++) {
      var t = trail[i], a = (i / trail.length) * 0.13;
      bctx.fillStyle = 'rgba(255,246,220,' + a.toFixed(3) + ')';
      bctx.fillRect(t.x - 11, t.y - 6, 22, 12);
    }
  }

  function drawSparkle() {
    if (!done) return;
    var age = frame - doneAt;
    if (age > 70) return;
    var pts = scene === 'pewter'
      ? [[150, 60], [196, 44], [232, 96], [168, 140], [214, 168]]
      : [[70, 60], [180, 44], [280, 96], [120, 150], [300, 160]];
    for (var i = 0; i < pts.length; i++) {
      var t = age - i * 7;
      if (t < 0 || t > 34) continue;
      var s = t < 17 ? t / 17 : (34 - t) / 17;
      var r = Math.round(1 + s * 5);
      var x = pts[i][0], y = pts[i][1];
      bctx.fillStyle = 'rgba(255,250,225,' + (0.35 + s * 0.6).toFixed(2) + ')';
      bctx.fillRect(x - r, y, r * 2, 1);
      bctx.fillRect(x, y - r, 1, r * 2);
      if (s > 0.6) bctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }

  function tick() {
    if (!running) return;
    frame++;

    /* the cloth follows the hand rather than being nailed to it */
    var px = rag.x, py = rag.y;
    rag.x += (rag.tx - rag.x) * 0.32;
    rag.y += (rag.ty - rag.y) * 0.32;
    var vx = rag.x - px, vy = rag.y - py;
    var want = Math.max(-0.45, Math.min(0.45, vx * 0.05));
    rag.ang += (want - rag.ang) * 0.22;

    if (rag.down && !done && (Math.abs(vx) + Math.abs(vy)) > 0.6) {
      trail.push({ x: rag.x, y: rag.y });
      if (trail.length > 9) trail.shift();
    } else if (trail.length && frame % 3 === 0) trail.shift();

    if (dirtDirty) paintDirt();

    bctx.clearRect(0, 0, W, H);
    bctx.drawImage(bg, 0, 0);
    bctx.imageSmoothingEnabled = false;
    bctx.drawImage(dirtCv, 0, 0, GW, GH, 0, 0, W, H);
    drawTrail();
    drawSparkle();
    drawRag();

    vctx.imageSmoothingEnabled = false;
    vctx.clearRect(0, 0, view.width, view.height);
    vctx.drawImage(buf, 0, 0, W, H, 0, 0, view.width, view.height);
    requestAnimationFrame(tick);
  }

  /* =======================================================================
     INPUT
     ======================================================================= */

  function toLogical(ev) {
    var b = view.getBoundingClientRect();
    var t = ev.touches && ev.touches[0] ? ev.touches[0] : ev;
    return { x: (t.clientX - b.left) / b.width * W, y: (t.clientY - b.top) / b.height * H };
  }

  function bind() {
    view.addEventListener('mousedown', function (e) { rag.down = true; last = toLogical(e); moveTo(last); });
    view.addEventListener('mousemove', function (e) { moveTo(toLogical(e)); });
    global.addEventListener('mouseup', function () { rag.down = false; last = null; travel = 0; });
    view.addEventListener('mouseleave', function () { rag.seen = false; });
    view.addEventListener('mouseenter', function () { rag.seen = true; });
    view.addEventListener('touchstart', function (e) {
      rag.down = true; last = toLogical(e); rag.x = last.x; rag.y = last.y; moveTo(last); e.preventDefault();
    }, { passive: false });
    view.addEventListener('touchmove', function (e) { moveTo(toLogical(e)); e.preventDefault(); }, { passive: false });
    global.addEventListener('touchend', function () { rag.down = false; last = null; travel = 0; });
  }

  global.Chores = {
    init: init, open: open, close: close, progress: progress,
    isDone: function () { return done; }, resize: resize
  };

})(window);
