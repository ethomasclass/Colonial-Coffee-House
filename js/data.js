/* ===========================================================================
   data.js — the shelf, the recipe book, the cast, the newspaper, the glossary.

   HISTORICAL NOTE: every drink here is non-alcoholic and every one of them was
   actually drunk in New England in the 1740s. Rum is discussed but never
   served — it is the thing molasses *becomes* once it leaves this counter, and
   that is precisely why the molasses on the shelf is a political object.

   Money is reckoned in pence (d). Twelve pence to the shilling. Massachusetts
   paper money in 1741 was badly inflated, which is why the rent hurts.
   =========================================================================== */

(function (global) {
  'use strict';

  /* =======================================================================
     THE SHELF
     ======================================================================= */

  var BASES = [
    { id: 'coffee', name: 'Coffee', cost: 3, tags: ['bracing', 'bitter', 'imported'],
      note: 'Roasted and ground here. The reason half of Boston argues in this room.' },
    { id: 'bohea', name: 'Bohea Tea', cost: 3, tags: ['genteel', 'mild', 'imported'],
      note: 'Cheap black tea from China, by way of England — as the law requires.' },
    { id: 'hyson', name: 'Hyson Tea', cost: 5, tags: ['genteel', 'mild', 'imported', 'dear'],
      note: 'Green tea. Dearer than Bohea, and a small way of showing you can afford it.' },
    { id: 'chocolate', name: 'Chocolate', cost: 4, tags: ['rich', 'comforting', 'genteel'],
      note: 'Grated from a cake milled in Dorchester. Drunk hot, never eaten.' },
    { id: 'sage', name: 'Sage', cost: 0, tags: ['humble', 'gentle', 'local', 'homely'],
      note: 'From the garden. What you drink when you will not pay for China tea.' },
    { id: 'water', name: 'Spring Water', cost: 0, tags: ['humble', 'plain', 'local'],
      note: 'Drawn this morning. Free, and there is no duty on it yet.' }
  ];

  var SWEETENERS = [
    { id: 'none', name: 'Unsweetened', cost: 0, tags: ['plain'], legal: true,
      note: 'Nothing at all.' },
    { id: 'french', name: 'French Molasses', cost: 1, tags: ['sweet', 'dark'], legal: false,
      note: 'From the French islands. Cheap, dark, and the duty on it has not been paid.' },
    { id: 'british', name: 'British Molasses', cost: 4, tags: ['sweet', 'dark'], legal: true,
      note: 'From Antigua and Barbados. Lawful, and three times the price.' },
    { id: 'sugar', name: 'Loaf Sugar', cost: 6, tags: ['sweet', 'genteel', 'dear'], legal: true,
      note: 'Broken from the cone with nippers. A luxury, and it looks like one.' },
    { id: 'honey', name: 'Honey', cost: 0, cost_note: 'from our own skeps', stock: 6,
      tags: ['sweet', 'local', 'gentle'], legal: true,
      note: 'Our own. Costs nothing but there is only so much of it.' }
  ];

  var ADDITIONS = [
    { id: 'none', name: 'Nothing', cost: 0, tags: ['plain'], note: 'Leave it as it is.' },
    { id: 'cream', name: 'Cream', cost: 1, tags: ['smooth', 'rich'],
      note: 'From a cow kept on the Common, like half the cows in Boston.' },
    { id: 'nutmeg', name: 'Nutmeg', cost: 2, tags: ['spiced', 'warming', 'dear'],
      note: 'Grated fresh. Came a very long way to get here.' },
    { id: 'ginger', name: 'Ginger', cost: 1, tags: ['warming', 'sharp'],
      note: 'Dried root, pounded. Good against a cold harbour wind.' },
    { id: 'lemon', name: 'Lemon', cost: 2, tags: ['sharp', 'bright', 'dear'],
      note: 'Off a ship from the Madeiras. Will not keep, so use it or lose it.' },
    { id: 'vinegar', name: 'Cider Vinegar', cost: 0, tags: ['sharp', 'humble', 'local'],
      note: 'A splash. Sounds unpleasant; is not.' }
  ];

  /* =======================================================================
     THE RECIPE BOOK — 32 drinks, matched most specific first
     'anySweet' means any sweetener other than none.
     ======================================================================= */

  var ANY_SWEET = ['french', 'british', 'sugar', 'honey'];
  var MOLASSES  = ['french', 'british'];

  var RECIPES = [
    /* --- coffee ------------------------------------------------------- */
    { id: 'spiced_coffee', name: 'Spiced Coffee', base: 'coffee', sweet: 'any', add: ['nutmeg'], price: 12,
      desc: 'Sweetened and dusted with nutmeg. A small extravagance in a plain cup.' },
    { id: 'coffee_cream', name: 'Coffee with Cream', base: 'coffee', sweet: 'any', add: ['cream'], price: 11,
      desc: 'Softened with cream until the bitterness is only a rumour.' },
    { id: 'sweet_coffee', name: 'Sweet Coffee', base: 'coffee', sweet: ANY_SWEET, add: ['none'], price: 9,
      desc: 'Molasses stirred through black coffee. What most of Boston actually drinks.' },
    { id: 'black_coffee', name: 'Black Coffee', base: 'coffee', sweet: ['none'], add: ['none'], price: 8,
      desc: 'Nothing added and nothing hidden. Bracing enough to argue through.' },

    /* --- bohea -------------------------------------------------------- */
    { id: 'english_bohea', name: 'Bohea in the English Style', base: 'bohea', sweet: ['sugar'], add: ['cream'], price: 14,
      desc: 'Loaf sugar and cream, taken exactly as they take it in London. That is the point of it.' },
    { id: 'bohea_cream', name: 'Bohea with Cream', base: 'bohea', sweet: 'any', add: ['cream'], price: 10,
      desc: 'Clouded pale with cream. Comfortable, unremarkable, and lawful.' },
    { id: 'sweet_bohea', name: 'Sweetened Bohea', base: 'bohea', sweet: ANY_SWEET, add: ['none'], price: 9,
      desc: 'Black tea and something sweet. The cup you can nurse for an hour.' },
    { id: 'plain_bohea', name: 'Bohea, Plain', base: 'bohea', sweet: ['none'], add: ['none'], price: 8,
      desc: 'Tea and hot water. It came round the world through England to reach this table.' },

    { id: 'bohea_lemon', name: 'Bohea with Lemon', base: 'bohea', sweet: 'any', add: ['lemon'], price: 12,
      desc: 'Tea and lemon, both landed at this wharf within the month.' },
    { id: 'spiced_bohea', name: 'Spiced Bohea', base: 'bohea', sweet: 'any', add: ['nutmeg', 'ginger'], price: 11,
      desc: 'Warmed with spice. Taken against the damp more than for the taste.' },

    /* --- hyson -------------------------------------------------------- */
    { id: 'hyson_lemon', name: 'Hyson with Lemon', base: 'hyson', sweet: 'any', add: ['lemon'], price: 15,
      desc: 'Green tea cut with lemon. Nearly everything in the cup crossed an ocean.' },
    { id: 'sweet_hyson', name: 'Sweetened Hyson', base: 'hyson', sweet: ANY_SWEET, add: ['none'], price: 12,
      desc: 'Green tea, sweetened. Dearer than Bohea and meant to be noticed.' },
    { id: 'plain_hyson', name: 'Hyson, Plain', base: 'hyson', sweet: ['none'], add: ['none'], price: 11,
      desc: 'Taken plain, the way a person does who wants you to know they know how.' },

    { id: 'hyson_cream', name: 'Hyson with Cream', base: 'hyson', sweet: 'any', add: ['cream'], price: 13,
      desc: 'Green tea softened with cream. Dear, and quietly announcing it.' },

    /* --- chocolate ---------------------------------------------------- */
    { id: 'spiced_chocolate', name: 'Spiced Chocolate', base: 'chocolate', sweet: 'any', add: ['nutmeg'], price: 16,
      desc: 'Sweet, thick, and warm with nutmeg. Steadying without being dulling.' },
    { id: 'rich_chocolate', name: 'Rich Chocolate', base: 'chocolate', sweet: 'any', add: ['cream'], price: 15,
      desc: 'Chocolate whipped with cream until it is very nearly a meal.' },
    { id: 'drinking_chocolate', name: 'Drinking Chocolate', base: 'chocolate', sweet: ANY_SWEET, add: ['none'], price: 13,
      desc: 'Sweetened and frothed with the mill. Genteel, indulgent, and quiet.' },
    { id: 'bitter_chocolate', name: 'Bitter Chocolate', base: 'chocolate', sweet: ['none'], add: ['none'], price: 11,
      desc: 'Unsweetened. Heavier and stranger than anyone expects the first time.' },

    { id: 'ginger_chocolate', name: 'Chocolate with Ginger', base: 'chocolate', sweet: 'any', add: ['ginger'], price: 14,
      desc: 'Thick chocolate cut with ginger. Warming twice over.' },

    /* --- sage --------------------------------------------------------- */
    { id: 'sage_lemon', name: 'Sage Tea with Lemon', base: 'sage', sweet: 'any', add: ['lemon'], price: 7,
      desc: 'Garden sage brightened with lemon. Homely, but not without ambition.' },
    { id: 'sage_ginger', name: 'Sage and Ginger', base: 'sage', sweet: 'any', add: ['ginger'], price: 6,
      desc: 'A household remedy more than a pleasure. Given to anyone coughing.' },
    { id: 'sage_honey', name: 'Sage and Honey', base: 'sage', sweet: ['honey'], add: ['none'], price: 5,
      desc: 'Both from within a mile of this room. Costs the house almost nothing.' },
    { id: 'sweet_sage', name: 'Sweetened Sage Tea', base: 'sage', sweet: ANY_SWEET, add: ['none'], price: 5,
      desc: 'What you drink when China tea is beyond your purse this month.' },
    { id: 'sage_tea', name: 'Sage Tea', base: 'sage', sweet: ['none'], add: ['none'], price: 4,
      desc: 'Leaves and hot water. No duty was ever paid on any part of it.' },

    /* --- water -------------------------------------------------------- */
    { id: 'switchel', name: 'Switchel', base: 'water', sweet: MOLASSES, add: ['ginger'], price: 5,
      desc: 'Water, molasses and ginger. What men drink in a hayfield to keep working.' },
    { id: 'sharp_switchel', name: 'Sharp Switchel', base: 'water', sweet: MOLASSES, add: ['vinegar'], price: 5,
      desc: 'Molasses and vinegar in cold water. Cuts a thirst better than anything sweet.' },
    { id: 'shrub', name: 'Shrub', base: 'water', sweet: ['sugar', 'honey', 'none'], add: ['vinegar'], price: 6,
      desc: 'A drinking vinegar, sweetened. Sharp, refreshing, and older than the colony.' },
    { id: 'ginger_water', name: 'Ginger Water', base: 'water', sweet: 'any', add: ['ginger'], price: 4,
      desc: 'Warming without heating. Given to the ill and the very tired.' },
    { id: 'lemon_water', name: 'Lemon Water', base: 'water', sweet: 'any', add: ['lemon'], price: 6,
      desc: 'Sweetened lemon and water. A small luxury pretending to be a plain one.' },
    { id: 'honey_water', name: 'Honey Water', base: 'water', sweet: ['honey'], add: ['none'], price: 3,
      desc: 'Two things from this parish and nothing else. Quiet, and free of politics.' },
    { id: 'sweet_water', name: 'Sweetened Water', base: 'water', sweet: ANY_SWEET, add: ['none'], price: 3,
      desc: 'Barely a drink. Still, it is sweet, and sweetness costs somebody something.' },
    { id: 'cold_water', name: 'A Cup of Cold Water', base: 'water', sweet: ['none'], add: ['none'], price: 0,
      desc: 'Free. Refused by no one and paid for by nobody.' }
  ];

  var ODD_MIXTURE = {
    id: 'odd', name: 'An Odd Mixture', price: 3, dynamic: true,
    desc: 'Nothing in the book quite covers this. They drink it to be polite, and pay you about what it cost you to make.'
  };

  /* A recipe fetches its listed price. Anything not in the book fetches barely
     more than its ingredients — so experimenting is cheap rather than ruinous,
     and the profit lives in knowing what you are doing. */
  function priceOf(rec, cost) { return rec.dynamic ? cost + 1 : rec.price; }

  /* =======================================================================
     MATCHING
     ======================================================================= */

  function listMatch(spec, id) {
    if (spec === 'any') return true;
    if (spec === 'anySweet') return id !== 'none';
    return spec.indexOf(id) !== -1;
  }

  function findRecipe(baseId, sweetId, addId) {
    for (var i = 0; i < RECIPES.length; i++) {
      var r = RECIPES[i];
      if (r.base === baseId && listMatch(r.sweet, sweetId) && listMatch(r.add, addId)) return r;
    }
    return ODD_MIXTURE;
  }

  /* A readable nudge for a recipe the player has not stumbled on yet, built
     from its own matching rule. Turns the recipe book from a wall of ??? into
     something a student can actually go and hunt down. */
  function describeSweet(spec) {
    if (spec === 'any') return 'sweetened or not';
    if (spec.length === 1 && spec[0] === 'none') return 'unsweetened';
    if (spec.length === 4) return 'sweetened, any way you like';
    if (spec.length === 2 && spec.indexOf('french') !== -1) return 'sweetened with molasses';
    if (spec.indexOf('sugar') !== -1 && spec.indexOf('honey') !== -1) return 'sweetened with sugar or honey';
    if (spec.length === 1 && spec[0] === 'sugar') return 'sweetened with loaf sugar';
    if (spec.length === 1 && spec[0] === 'honey') return 'sweetened with honey';
    return 'sweetened';
  }

  function describeAdd(spec) {
    var names = { none: 'nothing more', cream: 'cream', nutmeg: 'nutmeg',
                  ginger: 'ginger', lemon: 'lemon', vinegar: 'cider vinegar' };
    var parts = spec.map(function (a) { return names[a] || a; });
    if (parts.length === 1) return 'and ' + parts[0];
    return 'and ' + parts.slice(0, -1).join(', ') + ' or ' + parts[parts.length - 1];
  }

  function hintFor(rec) {
    var base = byId(BASES, rec.base);
    return base.name + ', ' + describeSweet(rec.sweet) + ', ' + describeAdd(rec.add) + '.';
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* The tags a finished cup carries, gathered from all three ingredients. */
  function drinkTags(baseId, sweetId, addId) {
    var t = [];
    [byId(BASES, baseId), byId(SWEETENERS, sweetId), byId(ADDITIONS, addId)].forEach(function (ing) {
      if (ing) ing.tags.forEach(function (x) { if (t.indexOf(x) === -1) t.push(x); });
    });
    /* sweetening a bitter base takes the edge off it */
    if (sweetId !== 'none') {
      var b = t.indexOf('bitter'); if (b !== -1) t.splice(b, 1);
    }
    return t;
  }

  function drinkCost(baseId, sweetId, addId) {
    return byId(BASES, baseId).cost + byId(SWEETENERS, sweetId).cost + byId(ADDITIONS, addId).cost;
  }

  /* =======================================================================
     THE LEDGER — the squeeze, in numbers
     ======================================================================= */

  /* Nobody opens a coffee house without already knowing how to make the
     ordinary things. These start in the book so it is never empty. */
  var KNOWN_AT_START = ['black_coffee', 'plain_bohea', 'sweet_coffee',
                        'drinking_chocolate', 'sage_tea'];

  var LEDGER = {
    startPurse: 36,     /* three shillings, and it is not enough           */
    rent: 66,           /* due to the landlord at close of business.       */
                        /* Tuned so that a perfect lawful night clears it by  */
                        /* a whisker and an ordinary lawful night does not,   */
                        /* while smuggling clears it comfortably. That gap IS */
                        /* the lesson; it should be felt, not asserted.       */
    suspicionCap: 10,
    /* Using French molasses is cheap and unlawful. Each use is noticed a
       little; the Commissioner notices a great deal more. */
    frenchSuspicion: 1,
    frenchToOfficer: 4,
    /* Pouring a cup away costs you what went into it and nothing else. It is
       the cheapest way to let a student experiment without punishing them. */
    allowPourOut: true
  };

  function pence(d) {
    if (d === 0) return '0d';
    var neg = d < 0; d = Math.abs(d);
    var s = Math.floor(d / 12), rem = d % 12;
    var out = s > 0 ? (s + 's ' + (rem > 0 ? rem + 'd' : '')) : (rem + 'd');
    return (neg ? '−' : '') + out.trim();
  }

  /* =======================================================================
     THE CAST — six patrons, one evening, in order
     ======================================================================= */

  /* The evening's running order. A teacher short on time can delete an entry
     here and nothing else breaks — the ledger, the journal and the closing
     screen all follow this list. */
  var CAST = [
    {
      id: 'convert', art: 'convert',
      name: 'Ezra Hale', title: 'a young cooper, lately awakened',
      thread: 'The Great Awakening',
      order: 'Something to keep me wakeful. Nothing dainty — I have not the stomach for dainty tonight.',
      wants: ['bracing', 'plain', 'humble', 'local'],
      avoids: ['genteel', 'rich', 'dear'],
      ideal: 'black_coffee'
    },
    {
      id: 'minister', art: 'minister',
      name: 'Rev. Samuel Thorne', title: 'settled minister, and an Old Light',
      thread: 'The Great Awakening — the other half',
      order: 'As I always take it, if you please. Sugar and cream both. One may keep good order in small things as well as large.',
      wants: ['genteel', 'mild', 'smooth', 'imported'],
      avoids: ['humble', 'sharp', 'bitter'],
      ideal: 'english_bohea'
    },
    {
      id: 'reader', art: 'reader',
      name: 'Cato Bell', title: "a printer's apprentice",
      thread: 'The Enlightenment',
      order: 'Something I can sit with a long while without it going bitter on me. I mean to finish this before the candle does.',
      wants: ['mild', 'comforting', 'smooth'],
      avoids: ['sharp', 'bitter'],
      ideal: 'sweet_bohea'
    },
    {
      id: 'captain', art: 'captain',
      name: 'Capt. Jonas Bright', title: 'master of the sloop Dolphin',
      thread: 'The Molasses Act',
      order: 'Something warm and sweet and honest. I have been on the water since Tuesday and I want none of your London manners.',
      wants: ['warming', 'sweet', 'humble', 'local'],
      avoids: ['genteel', 'dear'],
      ideal: 'switchel'
    },
    {
      id: 'patience', art: 'patience',
      name: 'Patience Marsh', title: "a shipping merchant's daughter",
      thread: 'The Awakening and the trade, in one person',
      order: "Something that won't keep me up — but won't let me go soft and sleepy either. I have thinking to do.",
      wants: ['comforting', 'gentle', 'spiced', 'warming'],
      avoids: ['bracing', 'sharp'],
      ideal: 'spiced_chocolate'
    },
    {
      id: 'officer', art: 'officer',
      name: 'Mr. Aldis Pym', title: 'of His Majesty’s Customs',
      thread: 'The Navigation Acts — and your evening’s accounts',
      order: 'Bohea. Sugar, cream. And I should be glad to know what you have been sweetening with tonight.',
      wants: ['genteel', 'imported', 'smooth'],
      avoids: ['humble', 'local'],
      ideal: 'english_bohea'
    }
  ];

  /* Two of the evening's patrons come back before closing. They do not order —
     they have already had their drink and they have come back to say something
     — which keeps the return beats short and makes them feel different from a
     first visit. */
  var RETURNS = [
    {
      id: 'convert_return', art: 'convert', noOrder: true,
      name: 'Ezra Hale', title: 'returned, and not calmer',
      thread: 'What the Awakening cost him by Tuesday'
    },
    {
      id: 'patience_return', art: 'patience', noOrder: true,
      name: 'Patience Marsh', title: 'returned, with her mind made up',
      thread: 'What she decided about Thursday'
    }
  ];

  /* Ezra opens the night and comes back near the end of it; Patience sits in
     the middle and returns after she has been home. Pym always closes. */
  var ORDER = ['convert', 'reader', 'minister', 'patience', 'captain',
               'convert_return', 'patience_return', 'officer'];

  function runningOrder() {
    var all = CAST.concat(RETURNS);
    return ORDER.map(function (id) {
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return null;
    }).filter(Boolean);
  }

  /* How well the cup answers what they asked for. No cup is ever refused. */
  function judge(patron, tags) {
    var hit = 0, miss = 0;
    patron.wants.forEach(function (w) { if (tags.indexOf(w) !== -1) hit++; });
    patron.avoids.forEach(function (a) { if (tags.indexOf(a) !== -1) miss++; });
    var score = hit - miss * 1.5;
    if (score >= 2) return 'matched';
    if (score >= 0.5) return 'near';
    return 'mismatched';
  }

  /* =======================================================================
     THE BOSTON GAZETTE — read before opening. Written for this game in the
     manner of the period press; not a transcription of a real issue.
     ======================================================================= */

  var BROADSHEET = {
    masthead: 'The Boston Gazette',
    dateline: 'MONDAY, September 14, 1741',
    /* Two stories a page, three pages. Every one is written for somebody who
       has never heard of any of this before: what the thing is, why it is
       happening, and what it means for an ordinary person. The `plain` line
       is the whole story in one sentence, for anyone who skims. */
    pages: [
      [
        { head: 'The Preachers Who Travel',
          art: 'preaching',
          body: 'For as long as anyone can remember, a New England town has had ONE minister. The town chooses him, the town pays him, and he stays until he dies. He reads his sermon calmly from a written page, and everybody sits still.\n\nSomething else is now happening. Preachers have begun to TRAVEL — town to town, parish to parish, preaching in fields and barns when no pulpit will have them. They do not read calmly. They shout, they weep, and they ask each person present a single question: not whether you attend church, but whether you KNOW, in your heart, that you are saved.\n\nLast autumn Mr. George Whitefield preached on Boston Common and, it is said, twenty thousand people came to hear him. There are not twenty thousand people living in Boston. They walked in from everywhere.',
          plain: 'A new kind of travelling preacher is drawing enormous crowds by making religion something you FEEL rather than something you attend.',
          gloss: ['itinerant', 'newbirth'] },

        { head: 'And the Quarrel It Has Started',
          art: 'press',
          body: 'Not everyone is pleased. The settled ministers have spent their lives studying, and they did not invite these men into their parishes.\n\nThose who welcome the revivals are called {{newlight|NEW LIGHT}}, as though a fresh flame had been found. Those who hold to the old order are called {{oldlight|OLD LIGHT}}, and they answer that shouting and weeping is disorder dressed up as piety. They have a word for it: {{enthusiasm|ENTHUSIASM}} — a man claiming God has spoken to him directly, with no learning, no ordination, and nobody\'s permission.\n\nWhy does this alarm them so much? Because in a field there is no pulpit to defend. Servants speak. Women speak. Black colonists speak. And nobody can stop them.\n\nWhole congregations have already split in half over it. Two in this county alone.',
          plain: 'The revivals are splitting churches, because they let people with no rank or education claim religious authority.',
          gloss: ['newlight', 'oldlight', 'enthusiasm', 'testify'] }
      ],
      [
        { head: 'How a Barrel of Molasses Reaches Boston',
          art: 'shipping',
          body: 'Sugar cane is grown on islands in the Caribbean, on plantations worked by {{triangle|enslaved people}} who did not choose the labour and are not paid for it. When the cane is boiled for sugar, a thick dark syrup is left over. That is MOLASSES.\n\nNew England buys it by the shipload and distils most of it into rum. Rum is this colony\'s largest manufacture — some sixty distilleries in Massachusetts — and the whole trade rests on molasses being CHEAP.\n\nBritain\'s own islands cannot supply enough of it, and charge more for what they have. The FRENCH islands sell at half the price, because France forbids its colonies to distil rum and so has little use for the stuff.\n\nSo Boston buys French. Every captain in this harbour knows it. So does everyone who drinks anything sweet.',
          plain: 'Boston\'s biggest industry runs on cheap French molasses — and on the labour of enslaved people in the Caribbean.',
          gloss: ['triangle', 'smuggling'] },

        { head: 'What the Law Says About It',
          art: 'customs',
          body: 'Parliament sits in London, three thousand miles away, and it has written a great deal of law about what colonists may buy and from whom.\n\nThe {{navigation|NAVIGATION ACTS}} require that colonial goods travel in English or colonial ships, and that certain listed products — {{enumerated|ENUMERATED GOODS}} — be carried to England FIRST, even when a better price waits somewhere nearer. England takes its cut on the way through. That is the point of the detour.\n\nThen in 1733 came the {{molassesact|MOLASSES ACT}}: sixpence duty on every gallon of molasses from a non-British island. It was not written to raise money. It was written because British sugar planters have friends in Parliament and could not match the French price.\n\nThe Act has stood for eight years. It has almost never been collected.',
          plain: 'The law says buy British and pay the duty. Almost nobody does, and until now almost nobody has been made to.',
          gloss: ['navigation', 'enumerated', 'molassesact', 'neglect'] }
      ],
      [
        { head: 'Why There Is No Money',
          art: 'money',
          body: 'Massachusetts is not permitted to coin money. What silver reaches us is spent on English goods and sails straight back across the Atlantic, so there is never enough of it here to buy and sell with.\n\nLast year a group of country men proposed a remedy: a LAND BANK, issuing paper notes backed by the value of their farms. Boston merchants disliked it, believing the notes would lose value. Country debtors welcomed it, because paper is easier to come by than silver.\n\nWord is now come from London that Parliament has voided the scheme entirely. Those holding its notes must answer for them, and there is much bitterness in the country towns — where the want of good money was the whole occasion of the thing.',
          plain: 'The colony tried to solve a money shortage by printing its own, and Parliament simply cancelled it from London.',
          gloss: ['landbank'] },

        { head: 'Books Lately Come Over',
          art: 'goods',
          body: 'A new manner of thinking is arriving from Europe by every ship, and it is argued over in rooms like this one.\n\nIts habit is to trust REASON and OBSERVATION rather than authority — to ask how a thing may be shown to be true, instead of who said it. Mr. Newton has explained the motions of the heavens by a few plain rules. Mr. {{lockeref|Locke}} argues that we are born knowing nothing at all, and gather every idea we have from what we see and hear.\n\nFollow that where it leads. If nothing is written in a man at birth, then no man is born knowing more than another, and none is born fit to rule another. Mr. Locke says as much: a government holds its power only by the agreement of the governed.\n\nWe have no university full of philosophers here. We have newspapers, almanacs, printers, and coffee houses. It is turning out to be enough.',
          plain: 'European ideas about reason, evidence, and government by consent are reaching ordinary colonists through cheap print and coffee-house argument.',
          gloss: ['lockeref'] }
      ]
    ]
  };

  /* =======================================================================
     THE ROOM — clicked between patrons, while the shop is empty
     ======================================================================= */

  var ROOM = {
    hearth: { title: 'The hearth',
      text: 'Everything hot in this house comes off this fire. There is no stove; a stove is a thing for the next century. The kettle hangs on a crane that swings out over the coals, and the whole room is arranged around the fact that heat happens in exactly one place.' },
    window: { title: 'The casement',
      text: 'Small panes set in lead, because large sheets of glass are ruinously expensive and every one of these crossed the Atlantic in a crate of straw. The rain has not stopped since Saturday. Beyond it, Union Street, and past that the wharves where the {{smuggling|the night’s business}} gets done.' },
    sign:   { title: 'The trade sign',
      text: 'A green dragon, painted by somebody who had plainly never seen one. Most people in Boston cannot read a shop’s name at forty paces but everyone can recognise a picture, which is why every house of business in this town is known by an animal or an object rather than a surname.' },
    shelf:  { title: 'The cupboard',
      text: 'Pewter tankards, stoneware jars, and four pieces of English china kept where they can be seen. The pewter is what people drink from. The china is what tells them what sort of house this is — and it is on that shelf, not in a cupboard, for exactly that reason.' },
    candle: { title: 'The candle',
      text: 'Tallow, not beeswax. It smells of the animal it came from and it gutters, but a beeswax candle costs several times as much and is for churches and people with money. When this burns down the room gets darker, and that is simply what the end of an evening is.' }
  };

  /* =======================================================================
     GLOSSARY — every term a student can click in dialogue or newspaper
     ======================================================================= */

  var GLOSSARY = {
    itinerant:   { term: 'Itinerant preacher', def: 'A preacher who travels from town to town rather than serving one settled congregation. Settled ministers often resented them for preaching to their people without invitation.' },
    newlight:    { term: 'New Light', def: 'Colonists who welcomed the revivals — who believed faith should be felt as a sudden, personal "new birth," not simply inherited and practiced quietly.' },
    oldlight:    { term: 'Old Light', def: 'Colonists, usually the established clergy, who thought the revivals were disorderly emotional excess and a threat to church authority.' },
    enthusiasm:  { term: 'Enthusiasm', def: 'In the 1700s this was an insult. It meant claiming direct inspiration from God — wild, irrational, and dangerous to public order.' },
    newbirth:    { term: 'New Birth', def: 'The sudden conversion experience at the heart of the Great Awakening: knowing yourself saved, rather than hoping so.' },
    testify:     { term: 'To testify', def: 'To stand and speak aloud about your own conversion. Revivals let women, the poor, and Black colonists testify — which is exactly what alarmed the Old Lights.' },
    navigation:  { term: 'Navigation Acts', def: 'A series of English laws requiring colonial trade to move in English or colonial ships, and routing many colonial goods through England so English merchants and the Crown took a cut.' },
    enumerated:  { term: 'Enumerated goods', def: 'Listed colonial products — sugar, tobacco, indigo and others — that by law could only be shipped to England, even if a better price waited elsewhere.' },
    molassesact: { term: 'Molasses Act of 1733', def: 'Put a tax of sixpence a gallon on molasses imported from non-British colonies. It was meant to protect British West Indian planters. It was evaded almost universally.' },
    neglect:     { term: 'Salutary neglect', def: 'Britain’s long habit of writing strict trade laws and then barely enforcing them. Colonists got used to the freedom — which made later enforcement feel like an outrage rather than a correction.' },
    smuggling:   { term: 'Smuggling', def: 'Here it mostly meant landing French molasses without paying the duty. So many people did it that Boston’s rum industry — and much of its economy — depended on it.' },
    landbank:    { term: 'Land Bank', def: 'A 1740 Massachusetts scheme to issue paper money backed by land, meant to relieve a shortage of coin. Parliament dissolved it in 1741, angering many country colonists.' },
    customs:     { term: 'Customs officer', def: 'A Crown official who inspected cargo and collected duties. Many were bribable, which is a large part of why the trade laws went unenforced.' },
    bohea:       { term: 'Bohea', def: 'A cheap black tea from China. In 1741 tea is ordinary and uncontroversial — the boycotts are still a generation away.' },
    triangle:    { term: 'The trade', def: 'Molasses from Caribbean sugar plantations came to New England and was distilled into rum. That sugar was grown and cut by enslaved people, and some of that rum was traded for more of them.' },
    lockeref:    { term: 'John Locke', def: 'English philosopher whose writing on natural rights, consent, and government by agreement circulated widely in the colonies and shaped how colonists argued about liberty.' }
  };

  global.Data = {
    BASES: BASES, SWEETENERS: SWEETENERS, ADDITIONS: ADDITIONS,
    RECIPES: RECIPES, ODD_MIXTURE: ODD_MIXTURE, CAST: CAST,
    BROADSHEET: BROADSHEET, GLOSSARY: GLOSSARY, LEDGER: LEDGER,
    ROOM: ROOM, RETURNS: RETURNS, ORDER: ORDER, runningOrder: runningOrder,
    KNOWN_AT_START: KNOWN_AT_START,
    findRecipe: findRecipe, drinkTags: drinkTags, drinkCost: drinkCost,
    judge: judge, byId: byId, pence: pence, priceOf: priceOf, hintFor: hintFor
  };

})(window);
