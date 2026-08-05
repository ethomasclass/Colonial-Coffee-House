/* ===========================================================================
   game.js — state, the render loop, the dialogue player, brewing, the ledger.

   One evening. Six patrons. No fail state: every cup is accepted and paid for.
   What a wrong cup costs you is the conversation, not the game.
   =========================================================================== */

(function (global) {
  'use strict';

  var D = global.Data, S = global.Scenes, A = global.Art;

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
    patronIndex: -1,
    patron: null,
    expr: 'neutral',
    servedCup: null,
    log: [],
    discovered: {},
    journal: [],
    sel: { base: null, sweet: null, add: null }
  };

  var frame = 0, el = {};

  function $(id) { return document.getElementById(id); }

  /* =======================================================================
     RENDER LOOP
     ======================================================================= */

  function loop() {
    frame++;
    A.drawRoom(frame);
    if (st.patron) A.drawPerson(A.CAST_ART[st.patron.art], st.expr, frame);
    else A.drawEmptySeat(frame);
    if (st.servedCup) A.drawServedCup(296, frame, st.servedCup.tint);
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
        return '<button class="gloss" data-k="' + k + '">' + words + '</button>';
      })
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  var typing = null;

  function showLine(who, text, isNarration, done, expr) {
    if (expr) st.expr = expr;
    el.dialogue.hidden = false;
    el.speaker.textContent = isNarration ? '' : (who ? who.name : '');
    el.speaker.hidden = isNarration || !who;
    el.line.className = isNarration ? 'line narration' : 'line';
    el.choices.innerHTML = '';

    var html = markup(text);
    el.line.innerHTML = html;

    /* typewriter over the rendered text, so glossary buttons survive */
    var full = el.line.textContent;
    el.line.textContent = '';
    var i = 0;
    el.advance.hidden = true;
    clearInterval(typing);
    typing = setInterval(function () {
      i += 2;
      el.line.textContent = full.slice(0, i);
      if (i >= full.length) finish();
    }, 12);

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

    /* click once to skip the typewriter, again to advance */
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
    st.phase = 'shift';
    el.broadsheet.hidden = true;
    el.title.hidden = true;
    nextPatron();
  }

  function nextPatron() {
    st.patronIndex++;
    st.servedCup = null;
    if (st.patronIndex >= D.CAST.length) return endNight();
    st.patron = D.CAST[st.patronIndex];
    st.expr = 'neutral';
    updateHud();
    var sc = S[st.patron.id];
    playNodes(sc.enter, askOrder);
  }

  function askOrder() {
    showLine(st.patron, st.patron.order, false, openBrew, 'neutral');
  }

  /* =======================================================================
     BREWING
     ======================================================================= */

  function openBrew() {
    st.phase = 'brew';
    el.dialogue.hidden = true;
    el.brew.hidden = false;
    st.sel = { base: null, sweet: null, add: null };
    el.orderEcho.textContent = '“' + st.patron.order + '”';
    el.orderWho.textContent = st.patron.name + ', ' + st.patron.title;
    buildShelf();
    updateCup();
  }

  function shelfButton(ing, kind) {
    var b = document.createElement('button');
    b.className = 'ing';
    var out = st.honeyLeft <= 0 && ing.id === 'honey';
    if (out) b.classList.add('out');
    var costTxt = ing.id === 'honey' ? (st.honeyLeft + ' left') : (ing.cost === 0 ? 'free' : ing.cost + 'd');
    b.innerHTML = '<span class="ing-name">' + ing.name + '</span>' +
      '<span class="ing-cost">' + costTxt + '</span>' +
      (ing.legal === false ? '<span class="ing-flag">unlawful</span>' : '') +
      '<span class="ing-note">' + ing.note + '</span>';
    b.disabled = out;
    b.onclick = function () {
      st.sel[kind] = ing.id;
      buildShelf();
      updateCup();
    };
    if (st.sel[kind] === ing.id) b.classList.add('on');
    return b;
  }

  function buildShelf() {
    [['baseShelf', D.BASES, 'base'],
     ['sweetShelf', D.SWEETENERS, 'sweet'],
     ['addShelf', D.ADDITIONS, 'add']].forEach(function (row) {
      var host = el[row[0]];
      host.innerHTML = '';
      row[1].forEach(function (ing) { host.appendChild(shelfButton(ing, row[2])); });
    });
  }

  function updateCup() {
    var s = st.sel;
    if (!s.base || !s.sweet || !s.add) {
      el.cupName.textContent = '—';
      el.cupDesc.textContent = 'Choose a base, a sweetener, and one thing more.';
      el.cupCost.textContent = '';
      el.serveBtn.disabled = true;
      el.cupNew.hidden = true;
      return;
    }
    var rec = D.findRecipe(s.base, s.sweet, s.add);
    var cost = D.drinkCost(s.base, s.sweet, s.add);
    el.cupName.textContent = rec.name;
    el.cupDesc.textContent = rec.desc;
    el.cupCost.innerHTML = 'costs you <b>' + D.pence(cost) + '</b> &middot; fetches <b>' + D.pence(D.priceOf(rec, cost)) + '</b>' +
      (D.byId(D.SWEETENERS, s.sweet).legal === false ? ' &middot; <span class="warn">unlawful sweetening</span>' : '');
    el.cupNew.hidden = !!st.discovered[rec.id] || rec.id === 'odd';
    el.serveBtn.disabled = false;
  }

  function serve() {
    var s = st.sel;
    var rec = D.findRecipe(s.base, s.sweet, s.add);
    var cost = D.drinkCost(s.base, s.sweet, s.add);
    var tags = D.drinkTags(s.base, s.sweet, s.add);
    var outcome = D.judge(st.patron, tags);

    /* money */
    var paid = D.priceOf(rec, cost);
    st.purse -= cost;
    st.purse += paid;
    if (outcome === 'matched') st.purse += 2;   /* they leave something extra */

    /* the political consequence of the sweetener */
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

    el.brew.hidden = true;
    st.phase = 'shift';
    updateHud();

    var sc = S[st.patron.id];
    playNodes(sc.react[outcome], function () {
      playNodes(sc.talk, function () {
        playNodes(sc.exit, function () {
          st.journal.push(sc.journal);
          nextPatron();
        });
      });
    });
  }

  /* =======================================================================
     HUD, BOOKS, GLOSSARY
     ======================================================================= */

  function updateHud() {
    el.purse.textContent = D.pence(st.purse);
    el.purse.className = st.purse < D.LEDGER.rent ? 'short' : '';
    el.suspicion.innerHTML = '';
    for (var i = 0; i < D.LEDGER.suspicionCap; i++) {
      var pip = document.createElement('span');
      pip.className = 'pip' + (i < st.suspicion ? ' lit' : '');
      el.suspicion.appendChild(pip);
    }
    el.progress.textContent = Math.max(0, st.patronIndex + 1) + ' of ' + D.CAST.length;
  }

  function openBook() {
    var html = '<h2>The Recipe Book</h2><p class="sub">' +
      Object.keys(st.discovered).length + ' of ' + D.RECIPES.length + ' discovered.</p>';
    var byBase = {};
    D.RECIPES.forEach(function (r) { (byBase[r.base] = byBase[r.base] || []).push(r); });
    D.BASES.forEach(function (b) {
      html += '<h3>' + b.name + '</h3><ul class="recs">';
      (byBase[b.id] || []).forEach(function (r) {
        html += st.discovered[r.id]
          ? '<li><b>' + r.name + '</b> <span class="p">' + D.pence(r.price) + '</span><br><span class="d">' + r.desc + '</span></li>'
          : '<li class="unk">? ? ?</li>';
      });
      html += '</ul>';
    });
    if (st.journal.length) {
      html += '<h2>Notes on the Evening</h2>';
      st.journal.forEach(function (j) {
        html += '<div class="note"><b>' + j.title + '</b><p>' + j.text + '</p></div>';
      });
    }
    el.bookBody.innerHTML = html;
    el.book.hidden = false;
  }

  function showGloss(key) {
    var g = D.GLOSSARY[key];
    if (!g) return;
    el.glossTerm.textContent = g.term;
    el.glossDef.textContent = g.def;
    el.gloss.hidden = false;
  }

  /* =======================================================================
     THE BROADSHEET
     ======================================================================= */

  function openBroadsheet() {
    var b = D.BROADSHEET;
    var html = '<div class="masthead">' + b.masthead + '</div><div class="dateline">' + b.dateline + '</div>';
    b.items.forEach(function (it) {
      html += '<article><h3>' + it.head + '</h3><p>' + markup(it.body) + '</p></article>';
    });
    el.paperBody.innerHTML = html;
    el.broadsheet.hidden = false;
    el.title.hidden = true;
  }

  /* =======================================================================
     CLOSING — the ledger the worksheet gets filled in from
     ======================================================================= */

  function endNight() {
    st.phase = 'closing';
    st.patron = null;
    el.dialogue.hidden = true;

    var earned = 0, spent = 0;
    st.log.forEach(function (r) { earned += r.paid; spent += r.cost; });
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
      '<tr class="rule"><td>Purse at closing</td><td><b>' + D.pence(st.purse) + '</b></td></tr>' +
      '<tr><td>Rent due tonight</td><td>&minus;' + D.pence(D.LEDGER.rent) + '</td></tr>' +
      '<tr class="rule"><td><b>' + (madeRent ? 'Rent paid. Remaining' : 'Short by') + '</b></td>' +
      '<td class="' + (madeRent ? 'ok' : 'bad') + '"><b>' + D.pence(Math.abs(st.purse - D.LEDGER.rent)) + '</b></td></tr>' +
      '</table>';

    html += '<div class="tally"><div><span class="big">' + st.frenchUses + '</span>cups sweetened unlawfully</div>' +
      '<div><span class="big">' + st.britishUses + '</span>cups sweetened lawfully</div>' +
      '<div><span class="big">' + st.suspicion + '/' + D.LEDGER.suspicionCap + '</span>notice taken by the Customs</div>' +
      '<div><span class="big">' + Object.keys(st.discovered).length + '/' + D.RECIPES.length + '</span>recipes discovered</div></div>';

    /* the verdict — the whole lesson, stated once, after they have lived it */
    var verdict;
    if (madeRent && st.frenchUses === 0) {
      verdict = 'You kept the law all night and still made rent. Almost nobody managed that in 1741 &mdash; and if you look at your margins, you can see why. Every honest cup you poured earned less than the same cup would have earned across the street.';
    } else if (madeRent && st.frenchUses > 0) {
      verdict = 'You made rent, and you made it on French molasses that no duty was ever paid on. So did most of Boston. The Molasses Act of 1733 had been law for eight years by this night, and it had almost never been collected.';
    } else if (!madeRent && st.frenchUses === 0) {
      verdict = 'You kept the law and you could not make rent. This is the squeeze exactly: obeying the Navigation Acts and the Molasses Act meant paying more for the same goods than every smuggler on the wharf. That is why the law went unenforced &mdash; not because colonists were lawless, but because keeping it did not pay.';
    } else {
      verdict = 'You smuggled and you still fell short. The margins in this trade were thin even when you broke the law &mdash; which is why so many Boston merchants broke it every single day rather than occasionally.';
    }
    html += '<div class="verdict"><h3>What tonight was about</h3><p>' + verdict + '</p>' +
      '<p>Britain wrote strict trade laws and then, for decades, barely enforced them. Historians call that <b>salutary neglect</b>. Colonists grew used to running their own economy. When Britain finally began enforcing in earnest after 1763, colonists did not experience it as a government finally doing its job &mdash; they experienced it as a government taking something away.</p></div>';

    html += '<div class="jrn"><h3>Notes from the Evening</h3>';
    st.journal.forEach(function (j) { html += '<div class="note"><b>' + j.title + '</b><p>' + j.text + '</p></div>'; });
    html += '</div><button id="againBtn" class="big-btn">Open again tomorrow night</button>';

    el.closeBody.innerHTML = html;
    el.closing.hidden = false;
    $('againBtn').onclick = function () { location.reload(); };
  }

  /* =======================================================================
     BOOT
     ======================================================================= */

  function init() {
    ['dialogue', 'speaker', 'line', 'choices', 'advance', 'brew', 'baseShelf',
     'sweetShelf', 'addShelf', 'cupName', 'cupDesc', 'cupCost', 'cupNew',
     'serveBtn', 'orderEcho', 'orderWho', 'purse', 'suspicion', 'progress',
     'book', 'bookBody', 'gloss', 'glossTerm', 'glossDef', 'broadsheet',
     'paperBody', 'closing', 'closeBody', 'title'].forEach(function (id) { el[id] = $(id); });

    A.init($('stage'));

    $('beginBtn').onclick = openBroadsheet;
    $('openShopBtn').onclick = startNight;
    $('bookBtn').onclick = openBook;
    $('bookClose').onclick = function () { el.book.hidden = true; };
    $('glossClose').onclick = function () { el.gloss.hidden = true; };
    el.serveBtn.onclick = serve;

    /* any glossary term, anywhere */
    document.addEventListener('click', function (ev) {
      if (ev.target.classList && ev.target.classList.contains('gloss')) {
        ev.stopPropagation();
        showGloss(ev.target.getAttribute('data-k'));
      }
    }, true);

    /* space / enter advances dialogue too */
    document.addEventListener('keydown', function (ev) {
      if ((ev.key === ' ' || ev.key === 'Enter') && !el.dialogue.hidden && el.dialogue.onclick) {
        ev.preventDefault();
        el.dialogue.onclick({ target: el.line });
      }
      if (ev.key === 'Escape') { el.book.hidden = true; el.gloss.hidden = true; }
    });

    updateHud();
    loop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  global.Game = st;

})(window);
