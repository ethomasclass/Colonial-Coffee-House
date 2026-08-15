/* ===========================================================================
   game.js — state, the render loop, the dialogue player, brewing, the ledger.

   One evening. Eight scenes, six of which want a drink. No fail state: every
   cup is accepted and paid for. What a wrong cup costs you is the
   conversation — a well-matched cup earns a confession nobody else hears.
   =========================================================================== */

(function (global) {
  'use strict';

  var D = global.Data, S = global.Scenes, A = global.Art;
  var Snd = global.Sound, Chores = global.Chores, Ico = global.Icons;

  var ORDER = D.runningOrder();

  /* =======================================================================
     STATE
     ======================================================================= */

  var st = {
    phase: 'title',
    purse: D.LEDGER.startPurse,
    suspicion: 0,
    honeyLeft: D.byId(D.SWEETENERS, 'honey').stock,
    frenchUses: 0,
    britishUses: 0,
    wasted: 0,
    confessions: 0,
    opened: {},          /* who told you the thing, by id */
    seenWords: {},       /* every glossary term met on screen */
    patronIndex: -1,
    patron: null,
    expr: 'neutral',
    servedCup: null,
    chores: 0,
    log: [],
    discovered: {},
    journal: [],
    seenRoom: {},
    sel: { base: null, sweet: null, add: null }
  };

  D.KNOWN_AT_START.forEach(function (id) { st.discovered[id] = true; });

  var frame = 0, el = {}, SAVE = 'greendragon.save';
  var paperPage = 0, paperReturns = false;

  function $(id) { return document.getElementById(id); }

  /* =======================================================================
     RENDER LOOP
     ======================================================================= */

  function loop() {
    frame++;
    A.setPhase(Math.max(0, st.patronIndex) / Math.max(1, ORDER.length - 1));
    A.drawRoom(frame);
    if (st.patron) A.drawPerson(A.CAST_ART[st.patron.art], st.expr, frame, st.patron.art);
    else A.drawEmptySeat(frame);
    if (st.servedCup) A.drawServedCup(296, frame, st.servedCup.tint);
    A.applyNightWash();
    A.present();
    requestAnimationFrame(loop);
  }

  /* =======================================================================
     TEXT — glossary markup + typewriter
     ======================================================================= */

  function markup(text) {
    return String(text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\{\{(\w+)\|([^}]+)\}\}/g, function (_, k, words) {
        /* Meeting a word on screen is what puts it in the notebook — not
           clicking it. A student who read the line has encountered the term
           whether or not they stopped to check it. */
        if (st.seenWords) st.seenWords[k] = true;
        return '<button class="gloss" data-k="' + k + '">' + words + '</button>';
      })
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  var typing = null;
  var textSpeed = 12;          /* ms per tick; 0 means show it all at once */

  function showLine(who, text, isNarration, done, expr) {
    if (expr) st.expr = expr;
    if (!isNarration && who) A.nudgeSprite();   /* a small settle as they speak */
    el.dialogue.hidden = false;
    el.speaker.textContent = isNarration ? '' : (who ? who.name : '');
    el.speaker.hidden = isNarration || !who;
    el.line.className = isNarration ? 'line narration' : 'line';
    el.choices.innerHTML = '';

    var html = markup(text);
    el.line.innerHTML = html;
    var full = el.line.textContent;
    el.advance.hidden = true;
    clearInterval(typing);

    if (textSpeed === 0) { el.line.innerHTML = html; return finish(); }

    el.line.textContent = '';
    var i = 0;
    typing = setInterval(function () {
      i += 2;
      el.line.textContent = full.slice(0, i);
      if (i >= full.length) finish();
    }, textSpeed);

    function finish() {
      clearInterval(typing); typing = null;
      el.line.innerHTML = html;
      el.advance.hidden = false;
      el.dialogue.onclick = function (ev) {
        if (ev.target.classList.contains('gloss')) return;
        el.dialogue.onclick = null;
        done();
      };
    }

    el.dialogue.onclick = function (ev) {
      if (ev.target.classList.contains('gloss')) return;
      if (typing) finish();
    };
  }

  function renderChoices(options, pick) {
    el.advance.hidden = true;
    el.dialogue.onclick = null;
    el.choices.innerHTML = '';
    options.forEach(function (opt) {
      var b = document.createElement('button');
      b.className = 'choice';
      b.innerHTML = markup(opt.label);
      b.onclick = function (ev) {
        if (ev.target.classList.contains('gloss')) return;
        el.choices.innerHTML = '';
        pick(opt);
      };
      el.choices.appendChild(b);
    });
  }

  /* =======================================================================
     NODE PLAYER
     ======================================================================= */

  function evalFlag(name) {
    if (name === 'heavyFrench') return st.frenchUses >= 3;
    if (name === 'anyFrench') return st.frenchUses > 0;
    return false;
  }

  function playNodes(nodes, onDone) {
    if (!nodes || !nodes.length) return onDone();
    var queue = nodes.slice();
    step();
    function step() {
      if (!queue.length) return onDone();
      var n = queue.shift();
      if (n.if) {
        queue = (evalFlag(n.if) ? (n.then || []) : (n.else || [])).concat(queue);
        return step();
      }
      if (n.choose) return renderChoices(n.choose, function (opt) {
        queue = (opt.then || []).concat(queue);
        step();
      });
      if (n.narrate) return showLine(null, n.narrate, true, step);
      return showLine(st.patron, n.say, false, step, n.expr);
    }
  }

  /* =======================================================================
     THE SHIFT
     ======================================================================= */

  function startNight() {
    /* The room was in use before you opened tonight. Gives the first breath
       between patrons something to actually do. */
    A.addRing(); A.addRing(); A.addTarnish();
    st.phase = 'shift';
    el.broadsheet.hidden = true;
    el.title.hidden = true;
    nextPatron();
  }

  function nextPatron() {
    if (Snd && Snd.bell) Snd.bell();
    st.patronIndex++;
    st.servedCup = null;
    if (st.patronIndex >= ORDER.length) return endNight();
    st.patron = ORDER[st.patronIndex];
    st.expr = 'neutral';
    A.enterSprite(frame);          /* they walk in rather than appearing */
    updateHud();
    save();
    var sc = S[st.patron.id];
    playNodes(sc.enter, function () {
      if (st.patron.noOrder) return runConversation(null);
      showLine(st.patron, st.patron.order, false, openBrew, 'neutral');
    });
  }

  /* react → talk → (confession, only if the cup suited them) → exit */
  function runConversation(outcome) {
    var sc = S[st.patron.id];
    playNodes(outcome && sc.react ? sc.react[outcome] : null, function () {
      playNodes(sc.talk, function () {
        var earned = (outcome === 'matched') && sc.confession;
        if (earned) { st.confessions++; st.opened[st.patron.id] = true; }
        playNodes(earned ? sc.confession : null, function () {
          playNodes(sc.exit, function () {
            st.journal.push(sc.journal);
            st.patron = null;
            st.servedCup = null;
            if (st.patronIndex >= ORDER.length - 1) return nextPatron();
            openInterstitial();
          });
        });
      });
    });
  }

  /* =======================================================================
     BREWING
     ======================================================================= */

  function openBrew() {
    st.phase = 'brew';
    el.dialogue.hidden = true;
    el.brew.hidden = false;
    st.sel = { base: null, sweet: null, add: null };
    el.orderEcho.innerHTML = '“' + markup(st.patron.order) + '”';
    el.orderWho.textContent = st.patron.name + ', ' + st.patron.title;
    el.ingNote.textContent = '';
    showLawCardOnce();
    cup.pours = [];
    buildShelf();
    updateCup();
    if (!cup.raf) drawCup();
  }

  function shelfButton(ing, kind) {
    var b = document.createElement('button');
    b.className = 'ing';
    var out = st.honeyLeft <= 0 && ing.id === 'honey';
    if (out) { b.classList.add('out'); b.disabled = true; }

    var cv = document.createElement('canvas');
    b.appendChild(cv);
    var nm = document.createElement('span'); nm.className = 'ing-name';
    nm.textContent = ing.name; b.appendChild(nm);
    var ct = document.createElement('span'); ct.className = 'ing-cost';
    ct.textContent = ing.id === 'honey' ? (st.honeyLeft + ' left')
                                        : (ing.cost === 0 ? 'free' : ing.cost + 'd');
    b.appendChild(ct);
    /* Every sweetener states where it stands with the law, not just the
       unlawful one. A single odd label reads as a warning to avoid; four
       labels read as a choice being offered, which is the point. */
    if (kind === 'sweet' && ing.id !== 'none') {
      var duty = document.createElement('span');
      duty.className = 'ing-duty' + (ing.legal === false ? ' unpaid' : '');
      duty.textContent = ing.legal === false ? 'duty unpaid'
                       : ing.cost === 0      ? 'ours &middot; no duty'
                                             : 'duty paid';
      duty.innerHTML = duty.textContent;
      b.appendChild(duty);
    } else if (ing.legal === false) {
      var fl = document.createElement('span'); fl.className = 'ing-flag';
      fl.textContent = 'unlawful'; b.appendChild(fl);
    }

    function note() { el.ingNote.textContent = ing.note; }
    b.onmouseenter = note;
    b.onfocus = note;
    b.onclick = function () {
      st.sel[kind] = ing.id;
      note();
      pourInto(ing, kind);
      if (Snd) Snd.knock(240 + Math.random() * 140, 0.05);
      buildShelf();
      updateCup();
    };
    if (st.sel[kind] === ing.id) b.classList.add('on');
    Ico.bottleIcon(cv, ing.id);
    return b;
  }

  /* Shown the first time somebody opens the brewing bench, and never again.
     Without it a student can serve six drinks without ever noticing that the
     sweetener shelf is the lesson. */
  /* The opening is three short panels rather than one long one. Weary readers
     face a paragraph at a time, and the Next button is the only thing on
     screen asking to be pressed. */
  function setupSlides() {
    var slides = [].slice.call(document.querySelectorAll('.slide'));
    var back = $('slideBack'), next = $('slideNext'), dots = $('slideDots');
    var begin = $('beginBtn');
    if (!slides.length || !next || !begin) return;
    var at = 0;
    dots.innerHTML = slides.map(function () { return '<i></i>'; }).join('');
    function show() {
      slides.forEach(function (sl, i) { sl.hidden = i !== at; });
      [].forEach.call(dots.children, function (d, i) {
        d.className = i === at ? 'on' : '';
      });
      back.hidden = at === 0;
      var last = at === slides.length - 1;
      next.hidden = last;
      begin.hidden = !last;
    }
    next.onclick = function () { if (at < slides.length - 1) { at++; show(); } };
    back.onclick = function () { if (at > 0) { at--; show(); } };
    show();
  }

  /* The notebook. Grouped, because eighteen terms in one alphabetical list is
     a wall — and grouped this way it also shows a student that the evening had
     four subjects in it, which the dialogue never says outright. */
  var WORD_GROUPS = [
    ['The Great Awakening', ['awakening', 'itinerant', 'newbirth', 'newlight', 'oldlight', 'enthusiasm', 'testify']],
    ['The Enlightenment',   ['enlightenment', 'lockeref', 'rights', 'authority']],
    ['Trade, empire and the law', ['navigation', 'enumerated', 'molassesact', 'smuggling', 'neglect', 'customs', 'triangle']],
    ['Money and daily life', ['landbank', 'bohea']]
  ];

  function openWords() {
    var seen = st.seenWords || {}, total = 0, got = 0, html = '';
    WORD_GROUPS.forEach(function (grp) {
      var rows = '';
      grp[1].forEach(function (k) {
        var g = D.GLOSSARY[k];
        if (!g) return;
        total++;
        if (!seen[k]) return;
        got++;
        rows += '<div class="word-row"><b>' + g.term + '</b><p>' + g.def + '</p></div>';
      });
      if (rows) html += '<div class="words-group">' + grp[0] + '</div>' + rows;
    });
    if (!html) {
      html = '<p class="words-none">You haven\u2019t met any of tonight\u2019s words yet. ' +
             'They show up underlined in the newspaper and in what people say &mdash; ' +
             'click one and it lands here, so you can come back to it.</p>';
    }
    el.wordsBody.innerHTML = html;
    el.wordsCount.textContent = got + ' of ' + total + ' met so far';
    el.words.hidden = false;
  }

  function showLawCardOnce() {
    if (!el.lawCard) return;
    var seen = false;
    try { seen = localStorage.getItem('greendragon.lawSeen') === '1'; } catch (e) {}
    el.lawCard.hidden = seen;
  }

  function buildShelf() {
    [['baseShelf', D.BASES, 'base'],
     ['sweetShelf', D.SWEETENERS, 'sweet'],
     ['addShelf', D.ADDITIONS, 'add']].forEach(function (row) {
      var host = el[row[0]];
      host.innerHTML = '';
      row[1].forEach(function (ing) { host.appendChild(shelfButton(ing, row[2])); });
    });
    buildBrewBook();
  }

  /* The book lying open beside you while you work. Known drinks show their
     cup; unmade ones show what to try. */
  function buildBrewBook() {
    el.brewBookList.innerHTML = '';
    var here = complete() ? D.findRecipe(st.sel.base, st.sel.sweet, st.sel.add) : null;
    D.RECIPES.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'bb-item' + (st.discovered[r.id] ? '' : ' unknown') +
                      (here && here.id === r.id ? ' on' : '');
      var cv = document.createElement('canvas');
      row.appendChild(cv);
      var txt = document.createElement('div');
      txt.innerHTML = '<div class="bb-name">' +
        (st.discovered[r.id] ? r.name : 'Not yet made') +
        '<span class="p">' + D.pence(r.price) + '</span></div>' +
        '<div class="bb-hint">' + (st.discovered[r.id] ? r.desc : D.hintFor(r)) + '</div>';
      row.appendChild(txt);
      el.brewBookList.appendChild(row);
      Ico.drinkIcon(cv, r, { ghost: !st.discovered[r.id] });
    });
    el.bookCount.textContent = Object.keys(st.discovered).length + ' of ' + D.RECIPES.length + ' known';
  }

  function complete() { return st.sel.base && st.sel.sweet && st.sel.add; }

  /* Taste it yourself before you hand it over. Costs nothing and changes
     nothing — it only tells you whether you have read the person right. A
     student who is guessing gets to stop guessing, which matters because the
     confession is the payoff and missing it through bad luck rather than
     inattention teaches nobody anything. */
  function tasteCup() {
    if (!complete() || !st.patron) return;
    var verdict = D.judge(st.patron, D.drinkTags(st.sel.base, st.sel.sweet, st.sel.add));
    var says;
    if (verdict === 'matched') {
      says = 'You taste it. That is exactly what they asked for, even if they didn\u2019t say so in words.';
    } else if (verdict === 'near') {
      says = 'You taste it. Close. It is the right sort of thing, but something in it is fighting what they asked for.';
    } else {
      says = 'You taste it. This is not what they were describing at all. Read the order again \u2014 they told you a mood, not a drink.';
    }
    el.pourNote.textContent = says;
    el.pourNote.hidden = false;
    if (Snd) Snd.knock(520, 0.04);
  }

  /* The whole Molasses Act argument is an arithmetic problem, so the
     arithmetic is kept on screen while the choice is being made rather than
     revealed in the ledger once it is too late to matter. */
  function updateStrip() {
    if (!el.ledgerStrip) return;
    var gap = D.LEDGER.rent - st.purse;
    var bits = ['Purse <b>' + D.pence(st.purse) + '</b>',
                'rent <b>' + D.pence(D.LEDGER.rent) + '</b>'];
    bits.push(gap > 0 ? '<span class="short">' + D.pence(gap) + ' still to find</span>'
                      : '<span class="ok">rent covered</span>');
    if (complete()) {
      var rec = D.findRecipe(st.sel.base, st.sel.sweet, st.sel.add);
      var cost = D.drinkCost(st.sel.base, st.sel.sweet, st.sel.add);
      if (rec) bits.push('this cup earns <b>' + D.pence(D.priceOf(rec, cost) - cost) + '</b>');
    }
    if (st.sel.sweet) {
      var sw = D.byId(D.SWEETENERS, st.sel.sweet);
      if (sw.legal === false) {
        var lawful = D.SWEETENERS.filter(function (x) { return x.legal !== false && x.id !== 'none' && x.cost > 0; })
                                 .map(function (x) { return x.cost; }).sort(function (a, b) { return a - b; })[0];
        bits.push('<span class="short">saves ' + D.pence(lawful - sw.cost) + ' by not paying the duty</span>');
      }
    }
    el.ledgerStrip.innerHTML = bits.join(' &middot; ');
  }

  /* --- the cup, and things falling into it ------------------------------- */
  var cup = { pours: [], t: 0, raf: null };

  var POUR_COLOUR = {
    coffee: '#3b2416', bohea: '#7d5628', hyson: '#8a9455', chocolate: '#4f3020',
    sage: '#78834f', water: '#8fa3b5',
    french: '#2e1b10', british: '#3a2416', sugar: '#f4efe4', honey: '#c98a2a',
    cream: '#f0e6d2', nutmeg: '#7a4a24', ginger: '#c49a5e',
    lemon: '#d9c24a', vinegar: '#cfe0d0', none: null
  };

  function pourInto(ing, kind) {
    if (!POUR_COLOUR[ing.id]) return;          /* 'nothing' pours nothing */
    cup.pours.push({ color: POUR_COLOUR[ing.id], t: 30, solid: kind !== 'base' });
  }

  /* How full the cup looks, given how far through the recipe you are. */
  function cupFill() {
    if (!st.sel.base) return 0;
    var f = 0.55;
    if (st.sel.sweet && st.sel.sweet !== 'none') f = 0.68;
    else if (st.sel.sweet) f = 0.62;
    if (st.sel.add && st.sel.add !== 'none') f = 0.80;
    else if (st.sel.add) f = 0.74;
    return f;
  }

  function drawCup() {
    cup.t++;
    var s = Ico.surface(el.cupCanvas, 120, 150);
    var kind = Ico.vesselFor(st.sel.base || 'water');
    var liquid = st.sel.base ? Ico.LIQUID[st.sel.base] : null;

    /* the vessel is drawn at 48x56 in icon space; scale it up to fill here */
    s.c.save();
    s.c.imageSmoothingEnabled = false;
    s.c.translate(12, 44);
    s.c.scale(2, 2);
    var sub = {
      c: s.c, r: s.r, p: s.p, e: s.e, poly: s.poly
    };
    Ico.drawVessel(sub, 0, 0, kind, liquid, cupFill(),
      { sweet: st.sel.sweet, add: st.sel.add });
    s.c.restore();

    /* whatever is currently falling in */
    var surfaceY = 44 + 2 * (st.sel.base ? (kind === 'bowl' ? 18 : kind === 'pot' ? 8 : kind === 'mug' ? 12 : 14) : 14);
    for (var i = cup.pours.length - 1; i >= 0; i--) {
      var pr = cup.pours[i];
      pr.t--;
      if (pr.t <= 0) { cup.pours.splice(i, 1); continue; }
      var wob = Math.round(Math.sin((cup.t + i * 9) * 0.5) * 1);
      if (pr.solid) {
        /* a lump or a pinch, tumbling in */
        var fy = (30 - pr.t) * 3;
        if (fy < surfaceY + 20) {
          s.r(57 + wob, 8 + fy, 5, 5, pr.color);
          s.r(57 + wob, 8 + fy, 2, 2, 'rgba(255,255,255,0.25)');
          s.r(52 - wob, 4 + fy, 2, 2, pr.color);
          s.r(66 + wob, 12 + fy, 2, 2, pr.color);
        }
      } else {
        /* a proper stream, with a lit edge and a couple of stray drops */
        var len = Math.max(0, surfaceY + 18 - 4);
        s.r(57 + wob, 4, 5, len, pr.color);
        s.r(57 + wob, 4, 1, len, 'rgba(255,255,255,0.16)');
        s.r(56 + wob, 4, 1, Math.round(len * 0.4), pr.color);
        s.r(62 + wob, 4, 1, Math.round(len * 0.7), pr.color);
        s.r(54 + wob, 10 + ((cup.t * 3) % 26), 2, 3, pr.color);
        s.r(64 + wob, 6 + ((cup.t * 4) % 30), 2, 2, pr.color);
      }
      /* the splash where it lands */
      if (pr.t < 22) {
        var sp = (22 - pr.t) / 22;
        s.e(60, surfaceY + 18, Math.round(4 + sp * 12), Math.max(1, Math.round(3 - sp * 2)),
            'rgba(255,255,255,' + (0.30 * (1 - sp)).toFixed(2) + ')');
      }
    }

    /* steam, once there’s something hot in it */
    if (complete() && st.sel.base !== 'water') {
      for (var k = 0; k < 3; k++) {
        var sy = surfaceY + 6 - ((cup.t + k * 13) % 40);
        var sx = 50 + k * 9 + Math.round(Math.sin((cup.t + k * 20) * 0.11) * 3);
        if (sy > 0) { s.r(sx, sy, 2, 2, 'rgba(214,195,160,0.55)'); }
      }
    }
    cup.raf = requestAnimationFrame(drawCup);
  }

  function updateCup() {
    updateStrip();
    if (el.tasteBtn) el.tasteBtn.disabled = !complete() || !st.patron;
    var s = st.sel;
    if (!complete()) {
      el.cupName.textContent = st.sel.base ? 'Not finished yet' : 'An empty cup';
      el.cupDesc.textContent = 'Click a base, a sweetener, and one thing more. Anything you make goes into the book, whether you serve it or not.';
      el.cupCost.textContent = '';
      el.serveBtn.disabled = true;
      el.pourBtn.disabled = true;
      el.cupNew.hidden = true;
      return;
    }
    var rec = D.findRecipe(s.base, s.sweet, s.add);
    var cost = D.drinkCost(s.base, s.sweet, s.add);
    /* Composing it’s discovering it. You don’t have to serve a drink to
       learn that it exists — you only have to make it once and look at it. */
    var wasNew = rec.id !== 'odd' && !st.discovered[rec.id];
    if (rec.id !== 'odd') st.discovered[rec.id] = true;
    el.cupName.textContent = rec.name;
    el.cupDesc.textContent = rec.desc;
    el.cupCost.innerHTML = 'costs you <b>' + D.pence(cost) + '</b> &middot; fetches <b>' +
      D.pence(D.priceOf(rec, cost)) + '</b>' +
      (D.byId(D.SWEETENERS, s.sweet).legal === false ? ' &middot; <span class="warn">unlawful sweetening</span>' : '');
    el.cupNew.hidden = !wasNew;
    buildBrewBook();
    el.serveBtn.disabled = false;
    el.pourBtn.disabled = false;
  }

  /* Pour it away and start again. You lose what went into it, which is both
     true to the period and the cheapest possible lesson about waste. */
  function pourOut() {
    if (!complete()) return;
    var s = st.sel;
    var cost = D.drinkCost(s.base, s.sweet, s.add);
    st.purse -= cost;
    st.wasted += cost;
    if (s.sweet === 'honey') st.honeyLeft--;
    if (s.sweet === 'french') st.frenchUses++;
    st.sel = { base: null, sweet: null, add: null };
    if (Snd) Snd.knock(180, 0.07);
    el.pourNote.textContent = 'Poured away. ' + D.pence(cost) + ' of goods gone.';
    el.pourNote.hidden = false;
    setTimeout(function () { el.pourNote.hidden = true; }, 2600);
    buildShelf();
    updateCup();
    updateHud();
  }

  function serve() {
    var s = st.sel;
    var rec = D.findRecipe(s.base, s.sweet, s.add);
    var cost = D.drinkCost(s.base, s.sweet, s.add);
    var tags = D.drinkTags(s.base, s.sweet, s.add);
    var outcome = D.judge(st.patron, tags);
    var paid = D.priceOf(rec, cost);

    st.purse -= cost;
    st.purse += paid;
    if (Snd && Snd.coin) Snd.coin();
    if (outcome === 'matched') st.purse += 2;

    if (s.sweet === 'french') {
      st.frenchUses++;
      st.suspicion += (st.patron.id === 'officer')
        ? D.LEDGER.frenchToOfficer : D.LEDGER.frenchSuspicion;
    }
    if (s.sweet === 'british' || s.sweet === 'sugar') st.britishUses++;
    if (s.sweet === 'honey') st.honeyLeft--;
    st.suspicion = Math.min(st.suspicion, D.LEDGER.suspicionCap);

    if (rec.id !== 'odd') st.discovered[rec.id] = true;

    st.log.push({
      who: st.patron.name, drink: rec.name, sweet: D.byId(D.SWEETENERS, s.sweet).name,
      lawful: D.byId(D.SWEETENERS, s.sweet).legal !== false,
      cost: cost, paid: paid + (outcome === 'matched' ? 2 : 0), outcome: outcome
    });

    var tints = { coffee: '#3b2416', bohea: '#6b4a22', hyson: '#7d8a4a',
                  chocolate: '#4a2c1c', sage: '#6f7a4e', water: '#8fa3b5' };
    st.servedCup = { tint: tints[s.base] };
    A.addRing(); A.addRing();
    A.addTarnish(); A.addTarnish();
    if (Snd) Snd.knock(300, 0.07);

    el.brew.hidden = true;
    if (cup.raf) { cancelAnimationFrame(cup.raf); cup.raf = null; }
    st.phase = 'shift';
    updateHud();
    runConversation(outcome);
  }

  /* =======================================================================
     BETWEEN PATRONS — the breath, and the chores
     ======================================================================= */

  function openInterstitial() {
    st.phase = 'between';
    el.dialogue.hidden = true;
    el.between.hidden = false;
    updateBetween();
  }

  function updateBetween() {
    var bar = A.countKind('ring'), pew = A.countKind('tarnish');
    var bits = [];
    if (bar) bits.push(bar + (bar === 1 ? ' ring' : ' rings') + ' on the bar');
    if (pew) bits.push(pew + (pew === 1 ? ' piece' : ' pieces') + ' of pewter gone dull');
    el.choresNote.textContent = bits.length
      ? bits.join(', ') + '.'
      : 'Bar wiped, pewter bright. Nothing to do but wait.';
    el.wipeBtn.disabled = !bar;
    el.polishBtn.disabled = !pew;
  }

  /* Each chore opens its own scene. Finishing one clears the matching marks
     from the room, so when you come back the bar really is clean. */
  function openChore(which) {
    st.phase = 'chore';
    el.between.hidden = true;
    el.chore.hidden = false;
    el.choreTitle.textContent = which === 'pewter'
      ? 'A tankard, and a lot of tarnish'
      : 'The bar, from above';
    el.choreDone.textContent = 'Leave it for now';
    el.choreDone.classList.remove('finished');
    Chores.resize();
    Chores.open(which, function () { closeChore(which, true); }, function (pct, fin) {
      el.choreBar.style.width = Math.round(pct * 100) + '%';
      el.chorePct.textContent = Math.round(pct * 100) + '%';
      if (fin) {
        el.choreDone.textContent = 'Put the cloth down';
        el.choreDone.classList.add('finished');
      }
    });
  }

  function closeChore(which, finished) {
    Chores.close();
    el.chore.hidden = true;
    if (finished) {
      A.clearRings(which === 'pewter' ? 'tarnish' : 'ring');
      st.chores++;
    }
    st.phase = 'between';
    el.between.hidden = false;
    updateBetween();
  }

  var currentChore = null;

  function examine(ev) {
    if (st.phase !== 'between') return;
    var pt = A.toLogical(ev);
    var id = A.hitTest(pt.x, pt.y);
    if (!id || !D.ROOM[id]) return;
    st.seenRoom[id] = true;
    el.glossTerm.textContent = D.ROOM[id].title;
    el.glossDef.innerHTML = markup(D.ROOM[id].text);
    el.gloss.hidden = false;
  }

  /* =======================================================================
     HUD, BOOKS, GLOSSARY, SETTINGS
     ======================================================================= */

  function updateHud() {
    el.purse.textContent = D.pence(st.purse);
    el.purse.className = st.purse < D.LEDGER.rent ? 'short' : '';
    if (el.rentGap) {
      var behind = D.LEDGER.rent - st.purse;
      el.rentGap.textContent = behind > 0 ? ' \u2014 ' + D.pence(behind) + ' short' : ' \u2014 covered';
      el.rentGap.className = 'rent-gap' + (behind > 0 ? ' short' : ' ok');
    }
    el.suspicion.innerHTML = '';
    for (var i = 0; i < D.LEDGER.suspicionCap; i++) {
      var pip = document.createElement('span');
      pip.className = 'pip' + (i < st.suspicion ? ' lit' : '');
      el.suspicion.appendChild(pip);
    }
    el.progress.textContent = Math.max(0, st.patronIndex + 1) + ' of ' + ORDER.length;
  }

  function openBook() {
    el.bookBody.innerHTML = '';
    var head = document.createElement('h2'); head.textContent = 'The Recipe Book';
    el.bookBody.appendChild(head);
    var sub = document.createElement('p'); sub.className = 'sub';
    sub.textContent = Object.keys(st.discovered).length + ' of ' + D.RECIPES.length +
      ' known. Anything you put together on the brewing shelf is written in here.';
    el.bookBody.appendChild(sub);

    var byBase = {};
    D.RECIPES.forEach(function (r) { (byBase[r.base] = byBase[r.base] || []).push(r); });
    D.BASES.forEach(function (b) {
      var h = document.createElement('h3'); h.textContent = b.name;
      el.bookBody.appendChild(h);
      (byBase[b.id] || []).forEach(function (r) {
        var known = !!st.discovered[r.id];
        var row = document.createElement('div');
        row.className = 'rec' + (known ? '' : ' unknown');
        var cv = document.createElement('canvas'); row.appendChild(cv);
        var t = document.createElement('div');
        t.innerHTML = '<div class="rec-name">' + (known ? r.name : 'Not yet made') +
          '<span class="p">' + D.pence(r.price) + '</span></div>' +
          '<div class="rec-desc">' + (known ? r.desc : D.hintFor(r)) + '</div>';
        row.appendChild(t);
        el.bookBody.appendChild(row);
        Ico.drinkIcon(cv, r, { ghost: !known });
      });
    });

    if (st.journal.length) {
      var jh = document.createElement('h2');
      jh.className = 'journal-head'; jh.textContent = 'Notes on the Evening';
      el.bookBody.appendChild(jh);
      st.journal.forEach(function (j) {
        var n = document.createElement('div'); n.className = 'note';
        n.innerHTML = '<b>' + j.title + '</b><p>' + j.text + '</p>';
        el.bookBody.appendChild(n);
      });
    }
    el.book.hidden = false;
  }

  function showGloss(key) {
    var g = D.GLOSSARY[key];
    if (!g) return;
    el.glossTerm.textContent = g.term;
    el.glossDef.textContent = g.def;
    el.gloss.hidden = false;
  }

  function applyTextSize(px) {
    document.documentElement.style.setProperty('--line-size', px + 'px');
    try { localStorage.setItem('greendragon.size', px); } catch (e) {}
  }

  function applySpeed(v) {
    textSpeed = v;
    try { localStorage.setItem('greendragon.speed', v); } catch (e) {}
  }

  /* =======================================================================
     SAVE — so a fire drill or a short period doesn’t cost a student the night
     ======================================================================= */

  function save() {
    try {
      localStorage.setItem(SAVE, JSON.stringify({
        purse: st.purse, suspicion: st.suspicion, honeyLeft: st.honeyLeft,
        frenchUses: st.frenchUses, britishUses: st.britishUses, wasted: st.wasted,
        confessions: st.confessions, chores: st.chores, patronIndex: st.patronIndex,
        seenWords: st.seenWords, opened: st.opened,
        log: st.log, discovered: st.discovered, journal: st.journal
      }));
    } catch (e) {}
  }

  function loadSave() {
    try {
      var raw = localStorage.getItem(SAVE);
      if (!raw) return null;
      var d = JSON.parse(raw);
      return (d && d.patronIndex > 0 && d.patronIndex < ORDER.length) ? d : null;
    } catch (e) { return null; }
  }

  function resume(d) {
    Object.keys(d).forEach(function (k) { st[k] = d[k]; });
    st.patronIndex--;                       /* nextPatron will step forward */
    el.title.hidden = true;
    st.phase = 'shift';
    nextPatron();
  }

  function clearSave() { try { localStorage.removeItem(SAVE); } catch (e) {} }

  /* =======================================================================
     THE BROADSHEET
     ======================================================================= */

  function renderPaper() {
    var pages = D.BROADSHEET.pages;
    paperPage = Math.max(0, Math.min(pages.length - 1, paperPage));
    el.paperBody.innerHTML = '';
    el.paperBody.scrollTop = 0;
    pages[paperPage].forEach(function (it) {
      var art = document.createElement('article');
      var h = document.createElement('h3'); h.textContent = it.head; art.appendChild(h);
      var cv = document.createElement('canvas'); cv.className = 'cut'; art.appendChild(cv);
      it.body.split('\n\n').forEach(function (para) {
        var pe = document.createElement('p'); pe.innerHTML = markup(para); art.appendChild(pe);
      });
      var pl = document.createElement('div'); pl.className = 'plain-terms';
      pl.innerHTML = '<b>In plain terms</b>' + markup(it.plain);
      art.appendChild(pl);
      el.paperBody.appendChild(art);
      Ico.woodcut(cv, it.art);            /* after it’s in the document */
    });
    el.paperPageNum.textContent = 'Page ' + (paperPage + 1) + ' of ' + pages.length;
    el.paperPrev.disabled = paperPage === 0;
    el.paperNext.disabled = paperPage === pages.length - 1;
  }

  function turnPage(by) {
    paperPage += by;
    if (Snd) Snd.knock(420, 0.05);
    renderPaper();
  }

  function openBroadsheet(fromShift) {
    paperReturns = !!fromShift;
    paperPage = 0;
    renderPaper();
    el.broadsheet.hidden = false;
    el.title.hidden = true;
    $('openShopBtn').textContent = fromShift ? 'Put the paper down' : 'Open the shop';
  }

  /* =======================================================================
     CLOSING — the ledger the worksheet gets filled in from
     ======================================================================= */

  function endNight() {
    st.phase = 'closing';
    st.patron = null;
    clearSave();
    el.dialogue.hidden = true;
    el.between.hidden = true;

    var earned = 0, spent = 0;
    st.log.forEach(function (r) { earned += r.paid; spent += r.cost; });
    spent += st.wasted;
    var madeRent = st.purse >= D.LEDGER.rent;

    var html = '<h2>The Green Dragon &mdash; Accounts for the Night</h2>' +
      '<p class="sub">Monday, September 14th, 1741</p><table class="ledger"><thead><tr>' +
      '<th>Served</th><th>Drink</th><th>Sweetened with</th><th>Cost</th><th>Paid</th><th>Suited them</th>' +
      '</tr></thead><tbody>';
    st.log.forEach(function (r) {
      html += '<tr><td>' + r.who + '</td><td>' + r.drink + '</td>' +
        '<td>' + r.sweet + (r.lawful ? '' : ' <span class="warn">(unlawful)</span>') + '</td>' +
        '<td>' + D.pence(r.cost) + '</td><td>' + D.pence(r.paid) + '</td>' +
        '<td class="o-' + r.outcome + '">' + (r.outcome === 'matched' ? 'yes' : r.outcome === 'near' ? 'nearly' : 'no') + '</td></tr>';
    });
    html += '</tbody></table>';

    html += '<table class="totals">' +
      '<tr><td>Purse at opening</td><td>' + D.pence(D.LEDGER.startPurse) + '</td></tr>' +
      '<tr><td>Taken over the counter</td><td>' + D.pence(earned) + '</td></tr>' +
      '<tr><td>Spent on ingredients</td><td>&minus;' + D.pence(spent) + '</td></tr>' +
      (st.wasted ? '<tr><td class="quiet-row">&nbsp;&nbsp;of which poured away</td><td class="quiet-row">' + D.pence(st.wasted) + '</td></tr>' : '') +
      '<tr class="rule"><td>Purse at closing</td><td><b>' + D.pence(st.purse) + '</b></td></tr>' +
      '<tr><td>Rent due tonight</td><td>&minus;' + D.pence(D.LEDGER.rent) + '</td></tr>' +
      '<tr class="rule"><td><b>' + (madeRent ? 'Rent paid. Remaining' : 'Short by') + '</b></td>' +
      '<td class="' + (madeRent ? 'ok' : 'bad') + '"><b>' + D.pence(Math.abs(st.purse - D.LEDGER.rent)) + '</b></td></tr>' +
      '</table>';

    html += '<div class="tally"><div><span class="big">' + st.frenchUses + '</span>cups sweetened unlawfully</div>' +
      '<div><span class="big">' + st.britishUses + '</span>cups sweetened lawfully</div>' +
      '<div><span class="big">' + st.suspicion + '/' + D.LEDGER.suspicionCap + '</span>notice taken by the Customs</div>' +
      '<div><span class="big">' + st.confessions + '/6</span>told you something private</div>' +
      '<div><span class="big">' + Object.keys(st.discovered).length + '/' + D.RECIPES.length + '</span>recipes discovered</div>' +
      '<div><span class="big">' + Object.keys(st.seenRoom).length + '/' + Object.keys(D.ROOM).length + '</span>things looked at</div>' +
      '<div><span class="big">' + st.chores + '</span>times you cleaned up</div></div>';

    var verdict;
    if (madeRent && st.frenchUses === 0) {
      verdict = 'You kept the law all night and still made rent. Almost nobody managed that in 1741 &mdash; and if you look at your margins, you can see why. Every honest cup you poured earned less than the same cup would have earned across the street.';
    } else if (madeRent && st.frenchUses > 0) {
      verdict = 'You made rent, and you made it on French molasses that no duty was ever paid on. So did most of Boston. The Molasses Act of 1733 had been law for eight years by this night, and it had almost never been collected.';
    } else if (!madeRent && st.frenchUses === 0) {
      verdict = 'You kept the law and you couldn’t make rent. This is the squeeze exactly: obeying the Navigation Acts and the Molasses Act meant paying more for the same goods than every smuggler on the wharf. That’s why the law went unenforced &mdash; not because colonists were lawless, but because keeping it didn’t pay.';
    } else {
      verdict = 'You smuggled and you still fell short. The margins in this trade were thin even when you broke the law &mdash; which is why so many Boston merchants broke it every single day rather than occasionally.';
    }
    html += '<div class="verdict"><h3>What tonight was about</h3><p>' + verdict + '</p>' +
      '<p>Britain wrote strict trade laws and then, for decades, barely enforced them. Historians call that <b>salutary neglect</b>. Colonists grew used to running their own economy. When Britain finally began enforcing in earnest after 1763, colonists didn’t experience it as a government finally doing its job &mdash; they experienced it as a government taking something away.</p></div>';

    if (st.confessions < 6) {
      html += '<div class="verdict quiet-verdict"><h3>What you didn’t hear</h3><p>Six of tonight’s patrons had something they would only say over a drink that actually suited them. You earned <b>' +
        st.confessions + '</b> of those. Somebody else in this room heard different things than you did &mdash; that’s worth comparing.</p></div>';
    }

    /* One line each on what became of the people who trusted you. Only for the
       ones who did — a blank space where somebody's ending should be is the
       clearest possible statement of what a careless cup costs. */
    var epi = D.CAST.filter(function (c) { return c.epilogue; });
    html += '<div class="epi"><h3>What became of them</h3>';
    epi.forEach(function (c) {
      var got = st.opened[c.id];
      html += '<div class="epi-row' + (got ? '' : ' locked') + '"><b>' + c.name + '</b>' +
        '<p>' + (got ? c.epilogue :
          '&mdash; you never got him to say the thing he was afraid of, so this part of his night is closed to you.'
            .replace(' him ', c.id === 'patience' ? ' her ' : ' him ')
            .replace('his night', c.id === 'patience' ? 'her night' : 'his night')) + '</p></div>';
    });
    html += '</div>';

    /* A short line they can copy onto paper and hold up against a neighbour's.
       Two students who played the same eight scenes will not have the same
       one, which is the entire argument for playing it rather than reading
       about it. */
    var code = 'GD1741-' + st.confessions + '/6-' + (st.frenchUses ? 'F' + st.frenchUses : 'LAWFUL') +
               '-' + (madeRent ? 'RENT' : 'SHORT') + '-' + Object.keys(st.discovered).length + 'R';
    html += '<div class="nightcode"><h3>Your night, in one line</h3>' +
      '<p class="code">' + code + '</p>' +
      '<p class="quiet">Copy that onto your sheet. It says how many people opened up to you, ' +
      'how many cups you sweetened unlawfully, whether you made rent, and how many recipes ' +
      'you found. Compare it with somebody else&rsquo;s.</p></div>';

    html += '<div class="jrn"><h3>Notes from the Evening</h3>';
    st.journal.forEach(function (j) { html += '<div class="note"><b>' + j.title + '</b><p>' + j.text + '</p></div>'; });
    html += '</div><button id="againBtn" class="big-btn">Open again tomorrow night</button>';

    el.closeBody.innerHTML = html;
    el.closing.hidden = false;
    $('againBtn').onclick = function () { clearSave(); location.reload(); };
  }

  /* =======================================================================
     BOOT
     ======================================================================= */

  function init() {
    ['dialogue', 'speaker', 'line', 'choices', 'advance', 'brew', 'baseShelf',
     'sweetShelf', 'addShelf', 'cupName', 'cupDesc', 'cupCost', 'cupNew',
     'ledgerStrip', 'rentGap', 'lawCard', 'tasteBtn',
     'words', 'wordsBody', 'wordsCount',
     'serveBtn', 'pourBtn', 'pourNote', 'orderEcho', 'orderWho', 'purse',
     'suspicion', 'progress', 'book', 'bookBody', 'gloss', 'glossTerm',
     'glossDef', 'broadsheet', 'paperBody', 'closing', 'closeBody', 'title',
     'between', 'choresNote', 'wipeBtn', 'polishBtn', 'betweenHint', 'settings',
     'bookCount', 'chore', 'choreTitle', 'choreBar', 'chorePct', 'choreDone',
     'cupCanvas', 'brewBookList', 'ingNote', 'paperPrev', 'paperNext',
     'paperPageNum']
      .forEach(function (id) { el[id] = $(id); });

    A.init($('stage'));

    $('beginBtn').onclick = function () { openBroadsheet(false); };
    el.paperPrev.onclick = function () { turnPage(-1); };
    el.paperNext.onclick = function () { turnPage(1); };
    $('openShopBtn').onclick = function () {
      if (paperReturns) { el.broadsheet.hidden = true; return; }
      startNight();
    };
    $('bookBtn').onclick = openBook;
    $('bookClose').onclick = function () { el.book.hidden = true; };
    $('glossClose').onclick = function () { el.gloss.hidden = true; };
    el.tasteBtn.onclick = tasteCup;
    $('wordsBtn').onclick = openWords;
    $('wordsClose').onclick = function () { el.words.hidden = true; };
    setupSlides();
    if (global.TitleCard) TitleCard.draw($('titleArt'));
    var lawOk = $('lawCardOk');
    if (lawOk) lawOk.onclick = function () {
      el.lawCard.hidden = true;
      try { localStorage.setItem('greendragon.lawSeen', '1'); } catch (e) {}
    };
    el.serveBtn.onclick = serve;
    el.pourBtn.onclick = pourOut;

    /* between-patron panel */
    Chores.init($('choreCanvas'));
    el.wipeBtn.onclick = function () { currentChore = 'bar'; openChore('bar'); };
    el.polishBtn.onclick = function () { currentChore = 'pewter'; openChore('pewter'); };
    el.choreDone.onclick = function () { closeChore(currentChore, Chores.isDone()); };
    $('paperAgainBtn').onclick = function () { openBroadsheet(true); };
    $('nextPatronBtn').onclick = function () {
      el.between.hidden = true;
      nextPatron();
    };

    /* the room canvas is for looking at things; scrubbing has its own scene */
    $('stage').addEventListener('click', examine);

    /* sound, off until somebody asks for it */
    var soundBtn = $('soundBtn'), choreSoundBtn = $('choreSoundBtn');
    function paintSound() {
      var on = Snd && Snd.isOn();
      soundBtn.textContent = on ? 'Sound on' : 'Sound off';
      soundBtn.classList.toggle('on', !!on);
      choreSoundBtn.textContent = on ? '\u266a Sound on' : '\u266a Turn sound on';
      choreSoundBtn.classList.toggle('finished', !on);
      $('choreHint').textContent = on
        ? 'Press and drag the cloth. It takes a few passes.'
        : 'Press and drag the cloth. Turn the sound on to hear it.';
    }
    function toggleSound() { if (Snd) Snd.setEnabled(!Snd.isOn()); paintSound(); }
    soundBtn.onclick = toggleSound;
    choreSoundBtn.onclick = toggleSound;
    /* A remembered choice was being written and never read back. */
    if (Snd && Snd.preference()) Snd.setEnabled(true);
    paintSound();

    /* settings */
    $('settingsBtn').onclick = function () { el.settings.hidden = !el.settings.hidden; };
    $('settingsClose').onclick = function () { el.settings.hidden = true; };
    var sizeSel = $('sizeSel'), speedSel = $('speedSel');
    sizeSel.onchange = function () { applyTextSize(+sizeSel.value); };
    speedSel.onchange = function () { applySpeed(+speedSel.value); };
    try {
      var sz = localStorage.getItem('greendragon.size');
      if (sz) { sizeSel.value = sz; applyTextSize(+sz); }
      var sp = localStorage.getItem('greendragon.speed');
      if (sp !== null) { speedSel.value = sp; applySpeed(+sp); }
    } catch (e) {}

    /* offer to pick up where a previous session stopped */
    var saved = loadSave();
    if (saved) {
      var r = $('resumeRow');
      r.hidden = false;
      $('resumeBtn').onclick = function () { resume(saved); };
      $('freshBtn').onclick = function () { clearSave(); r.hidden = true; };
    }

    document.addEventListener('click', function (ev) {
      if (ev.target.classList && ev.target.classList.contains('gloss')) {
        ev.stopPropagation();
        showGloss(ev.target.getAttribute('data-k'));
      }
    }, true);

    document.addEventListener('keydown', function (ev) {
      if ((ev.key === ' ' || ev.key === 'Enter') && !el.dialogue.hidden && el.dialogue.onclick) {
        ev.preventDefault();
        el.dialogue.onclick({ target: el.line });
      }
      if (ev.key === 'Escape') {
        el.book.hidden = true; el.gloss.hidden = true; el.settings.hidden = true;
        el.words.hidden = true;
      }
    });

    updateHud();
    loop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  global.Game = st;

})(window);
