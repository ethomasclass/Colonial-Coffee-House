/* ===========================================================================
   data.js — the shelf, the recipe book, the cast, the newspaper, the glossary.

   HISTORICAL NOTE: every drink here is non-alcoholic and every one of them was
   actually drunk in New England in the 1740s. Rum is discussed but never
   served — it’s the thing molasses *becomes* once it leaves this counter, and
   that’s precisely why the molasses on the shelf is a political object.

   Money is reckoned in pence (d) throughout, deliberately — see pence().
   Twelve pence made a shilling in 1741, but the game does not ask anybody to
   convert. Massachusetts
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
      note: 'From the garden. What you drink when you won’t pay for China tea.' },
    { id: 'water', name: 'Spring Water', cost: 0, tags: ['humble', 'plain', 'local'],
      note: 'Drawn this morning. Free, and there’s no duty on it yet.' }
  ];

  var SWEETENERS = [
    { id: 'none', name: 'Unsweetened', cost: 0, tags: ['plain'], legal: true,
      note: 'Nothing at all.' },
    { id: 'french', name: 'French Molasses', cost: 1, tags: ['sweet', 'dark'], legal: false,
      note: 'From the French islands. Cheap, dark, and the duty on it hasn’t been paid.' },
    { id: 'british', name: 'British Molasses', cost: 4, tags: ['sweet', 'dark'], legal: true,
      note: 'From Antigua and Barbados. Lawful, and three times the price.' },
    { id: 'sugar', name: 'Loaf Sugar', cost: 6, tags: ['sweet', 'genteel', 'dear'], legal: true,
      note: 'Broken from the cone with nippers. A luxury, and it looks like one.' },
    { id: 'honey', name: 'Honey', cost: 0, cost_note: 'from our own skeps', stock: 6,
      tags: ['sweet', 'local', 'gentle'], legal: true,
      note: 'Our own. Costs nothing but there’s only so much of it.' }
  ];

  var ADDITIONS = [
    { id: 'none', name: 'Nothing', cost: 0, tags: ['plain'], note: 'Leave it as it is.' },
    { id: 'cream', name: 'Cream', cost: 1, tags: ['smooth', 'rich'],
      note: 'From a cow kept on the Common, like half the cows in Boston.' },
    { id: 'nutmeg', name: 'Nutmeg', cost: 2, tags: ['spiced', 'warming', 'dear'],
      note: 'Grated fresh. Came a very long way to get here.' },
    { id: 'ginger', name: 'Ginger', cost: 1, tags: ['warming', 'sharp'],
      note: 'Dried root, pounded. Good against a cold harbor wind.' },
    { id: 'lemon', name: 'Lemon', cost: 2, tags: ['sharp', 'bright', 'dear'],
      note: 'Off a ship from the Madeiras. Will not keep, so use it or lose it.' },
    { id: 'vinegar', name: 'Cider Vinegar', cost: 0, tags: ['sharp', 'humble', 'local'],
      note: 'A splash. Sounds unpleasant; isn’t.' }
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
      desc: 'Softened with cream until the bitterness is only a rumor.' },
    { id: 'sweet_coffee', name: 'Sweet Coffee', base: 'coffee', sweet: ANY_SWEET, add: ['none'], price: 9,
      desc: 'Molasses stirred through black coffee. What most of Boston actually drinks.' },
    { id: 'black_coffee', name: 'Black Coffee', base: 'coffee', sweet: ['none'], add: ['none'], price: 8,
      desc: 'Nothing added and nothing hidden. Bracing enough to argue through.' },

    /* --- bohea -------------------------------------------------------- */
    { id: 'english_bohea', name: 'Bohea in the English Style', base: 'bohea', sweet: ['sugar'], add: ['cream'], price: 14,
      desc: 'Loaf sugar and cream, taken exactly as they take it in London. That’s the point of it.' },
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
      desc: 'Chocolate whipped with cream until it’s very nearly a meal.' },
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
      desc: 'Barely a drink. Still, it’s sweet, and sweetness costs somebody something.' },
    { id: 'cold_water', name: 'A Cup of Cold Water', base: 'water', sweet: ['none'], add: ['none'], price: 0,
      desc: 'Free. Refused by no one and paid for by nobody.' }
  ];

  var ODD_MIXTURE = {
    id: 'odd', name: 'An Odd Mixture', price: 3, dynamic: true,
    desc: 'Nothing in the book quite covers this. They drink it to be polite, and pay you about what it cost you to make.'
  };

  /* A recipe fetches its listed price. Anything not in the book fetches barely
     more than its ingredients — so experimenting is cheap rather than ruinous,
     and the profit lives in knowing what you’re doing. */
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

  /* A readable nudge for a recipe the player hasn’t stumbled on yet, built
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

  /* Nobody opens a coffee house without already knowing the trade. Thirteen
     recipes are in the book on the first night, at least two for every base,
     including what most of tonight’s patrons actually want — so a forty-minute
     session is spent reading people rather than hunting the shelf. The other
     nineteen are still there to be found. */
  var KNOWN_AT_START = [
    'black_coffee', 'sweet_coffee', 'coffee_cream',
    'plain_bohea', 'sweet_bohea', 'bohea_cream', 'english_bohea',
    'plain_hyson', 'sweet_hyson',
    'drinking_chocolate', 'rich_chocolate',
    'sage_tea', 'sage_honey',
    'switchel'
  ];

  var LEDGER = {
    startPurse: 36,     /* 36d, and it isn’t enough                       */
    rent: 66,           /* 66d, due to the landlord at close of business.  */
                        /* Tuned so that a perfect lawful night clears it by  */
                        /* a whisker and an ordinary lawful night doesn’t,   */
                        /* while smuggling clears it comfortably. That gap IS */
                        /* the lesson; it should be felt, not asserted.       */
    suspicionCap: 10,
    /* Using French molasses is cheap and unlawful. Each use isn’ticed a
       little; the Commissioner notices a great deal more. */
    frenchSuspicion: 1,
    frenchToOfficer: 4,
    /* Pouring a cup away costs you what went into it and nothing else. It is
       the cheapest way to let a student experiment without punishing them. */
    allowPourOut: true
  };

  /* Pence, and only pence. Shillings-and-pence is what they really used, and
     it made every number in the game a two-part conversion a fifteen-year-old
     has to do before they can compare anything. The whole mechanic is one
     subtraction — rent minus takings — so it is counted in a single unit and
     the period voice is left to the dialogue, where "sixpence the gallon"
     still gets said out loud. */
  function pence(d) {
    return (d < 0 ? '\u2212' : '') + Math.abs(d) + 'd';
  }

  /* =======================================================================
     THE CAST — six patrons, one evening, in order
     ======================================================================= */

  /* The evening’s running order. A teacher short on time can delete an entry
     here and nothing else breaks — the ledger, the journal and the closing
     screen all follow this list. */
  var CAST = [
    {
      id: 'convert', art: 'convert',
      name: 'Ezra Hale', title: 'a young barrel-maker, newly converted',
      thread: 'The Great Awakening',
      order: 'Something to keep me awake. Nothing fancy — I’m not in the mood for fancy tonight.',
      wants: ['bracing', 'plain', 'humble', 'local'],
      avoids: ['genteel', 'rich', 'dear'],
      ideal: 'black_coffee'
    },
    {
      id: 'minister', art: 'minister',
      name: 'Rev. Samuel Thorne', title: 'settled minister, and an Old Light',
      thread: 'The Great Awakening — the other half',
      order: 'As I always take it, if you please. Sugar and cream both. You can keep good order in small things as well as large ones.',
      wants: ['genteel', 'mild', 'smooth', 'imported'],
      avoids: ['humble', 'sharp', 'bitter'],
      ideal: 'english_bohea'
    },
    {
      id: 'reader', art: 'reader',
      name: 'Cato Bell', title: "a printer’s apprentice",
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
      name: 'Patience Marsh', title: "a shipping merchant’s daughter",
      thread: 'The Awakening and the trade, in one person',
      order: "Something that won’t keep me up — but won’t let me go soft and sleepy either. I have thinking to do.",
      wants: ['comforting', 'gentle', 'spiced', 'warming'],
      avoids: ['bracing', 'sharp'],
      ideal: 'spiced_chocolate'
    },
    {
      id: 'officer', art: 'officer',
      name: 'Mr. Aldis Pym', title: 'of His Majesty’s Customs',
      thread: 'The Navigation Acts — and your evening’s accounts',
      order: '{{bohea|Bohea}}. Sugar, cream. And I should be glad to know what you have been sweetening with tonight.',
      wants: ['genteel', 'imported', 'smooth'],
      avoids: ['humble', 'local'],
      ideal: 'english_bohea'
    }
  ];

  /* Two of the evening’s patrons come back before closing. They don’t order —
     they have already had their drink and they have come back to say something
     — which keeps the return beats short and makes them feel different from a
     first visit. */
  var RETURNS = [
    {
      id: 'convert_return', art: 'convert', noOrder: true,
      name: 'Ezra Hale', title: 'back again, and not any calmer',
      thread: 'What the Awakening cost him by Tuesday'
    },
    {
      id: 'officer_early', art: 'officer', noOrder: true,
      name: 'Mr. Aldis Pym', title: 'of His Majesty\u2019s Customs, before you have poured anything',
      thread: 'The rule, stated in advance'
    },
    {
      id: 'patience_return', art: 'patience', noOrder: true,
      name: 'Patience Marsh', title: 'returned, with her mind made up',
      thread: 'What she decided about Thursday'
    }
  ];

  /* Ezra opens the night and comes back near the end of it; Patience sits in
     the middle and returns after she has been home. Pym always closes. */
  /* Pym opens the night. He buys nothing and sets the rule out loud before a
     single cup is poured, so the sweetener shelf is a decision from the first
     drink rather than a menu that turns out to have been a decision. */
  var ORDER = ['officer_early', 'convert', 'reader', 'minister', 'patience',
               'captain', 'convert_return', 'patience_return', 'officer'];

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
          body: 'For as long as anyone can remember, a New England town has had ONE minister. The town chooses him, the town pays him, and he stays until he dies. He reads his sermon calmly from a written page, and everybody sits still.\n\nSomething else is now happening. Preachers have begun to TRAVEL — town to town, parish to parish, preaching in fields and barns when no pulpit will have them. They don’t read calmly. They shout, they weep, and they ask each person present a single question: not whether you attend church, but whether you KNOW, in your heart, that you’re saved.\n\nLast autumn Mr. George Whitefield preached on Boston Common and, it’s said, twenty thousand people came to hear him. There aren’t twenty thousand people living in Boston. They walked in from everywhere.',
          plain: 'A new kind of traveling preacher is drawing enormous crowds by making religion something you FEEL rather than something you attend.',
          gloss: ['itinerant', 'newbirth'] },

        { head: 'And the Quarrel It Has Started',
          art: 'press',
          body: 'Not everyone is pleased. The settled ministers have spent their lives studying, and they didn’t invite these men into their parishes.\n\nThose who welcome the revivals are called {{newlight|NEW LIGHT}}, as though a fresh flame had been found. Those who hold to the old order are called {{oldlight|OLD LIGHT}}, and they answer that the shouting and crying is chaos dressed up as real faith. They have a word for it: {{enthusiasm|ENTHUSIASM}} — someone claiming God spoke to him personally — with no training, no official position, and nobody’s permission.\n\nWhy does this alarm them so much? Because in a field there’s no pulpit to defend. Servants speak. Women speak. Black colonists speak. And nobody can stop them.\n\nWhole congregations have already split in half over it. Two in this county alone.',
          plain: 'The revivals are splitting churches, because they let people with no rank or education claim religious authority.',
          gloss: ['newlight', 'oldlight', 'enthusiasm', 'testify'] }
      ],
      [
        { head: 'How a Barrel of Molasses Reaches Boston',
          art: 'shipping',
          body: 'Sugar cane is grown on islands in the Caribbean, on plantations worked by {{triangle|enslaved people}} who didn’t choose the labor and aren’t paid for it. When the cane is boiled for sugar, a thick dark syrup is left over. That’s MOLASSES.\n\nNew England buys it by the shipload and distils most of it into rum. Rum is this colony’s largest manufacture — some sixty distilleries in Massachusetts — and the whole trade rests on molasses being CHEAP.\n\nBritain’s own islands can’t supply enough of it, and charge more for what they have. The FRENCH islands sell at half the price, because France forbids its colonies to distil rum and so has little use for the stuff.\n\nSo Boston buys French. Every captain in this harbor knows it. So does everyone who drinks anything sweet.',
          plain: 'Boston’s biggest industry runs on cheap French molasses — and on the labor of enslaved people in the Caribbean.',
          gloss: ['triangle', 'smuggling'] },

        { head: 'What the Law Says About It',
          art: 'customs',
          body: 'Parliament sits in London, three thousand miles away, and it has written a great deal of law about what colonists may buy and from whom.\n\nThe {{navigation|NAVIGATION ACTS}} require that colonial goods travel in English or colonial ships, and that certain listed products — {{enumerated|ENUMERATED GOODS}} — be carried to England FIRST, even when a better price waits somewhere nearer. England takes its cut on the way through. That’s the point of the detour.\n\nThen in 1733 came the {{molassesact|MOLASSES ACT}}: sixpence duty on every gallon of molasses from a non-British island. It wasn’t written to raise money. It was written because British sugar planters have friends in Parliament and couldn’t match the French price.\n\nThe Act has stood for eight years. It has almost never been collected.',
          plain: 'The law says buy British and pay the duty. Almost nobody does, and until now almost nobody has been made to.',
          gloss: ['navigation', 'enumerated', 'molassesact', 'neglect'] }
      ],
      [
        { head: 'Why There Is No Money',
          art: 'money',
          body: 'Massachusetts isn’t permitted to coin money. What silver reaches us is spent on English goods and sails straight back across the Atlantic, so there’s never enough of it here to buy and sell with.\n\nLast year a group of country men proposed a remedy: a LAND BANK, issuing paper notes backed by the value of their farms. Boston merchants disliked it, believing the notes would lose value. Country debtors welcomed it, because paper is easier to come by than silver.\n\nWord is now come from London that Parliament has voided the scheme entirely. Those holding its notes must answer for them, and there’s much bitterness in the country towns — where the want of good money was the whole occasion of the thing.',
          plain: 'The colony tried to solve a money shortage by printing its own, and Parliament simply cancelled it from London.',
          gloss: ['landbank'] },

        { head: 'Books Lately Come Over',
          art: 'goods',
          body: 'A new manner of thinking is arriving from Europe by every ship, and it’s argued over in rooms like this one.\n\nIts habit’s to trust REASON and OBSERVATION rather than authority — to ask how a thing may be shown to be true, instead of who said it. Mr. Newton has explained the motions of the heavens by a few plain rules. Mr. {{lockeref|Locke}} argues that we’re born knowing nothing at all, and gather every idea we have from what we see and hear.\n\nFollow that where it leads. If nothing is written in a man at birth, then no man is born knowing more than another, and none is born fit to rule another. Mr. Locke says as much: a government holds its power only by the agreement of the governed.\n\nWe have no university full of philosophers here. We have newspapers, almanacs, printers, and coffee houses. It’s turning out to be enough.',
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
      text: 'Everything hot in this house comes off this fire. There’s no stove; a stove is a thing for the next century. The kettle hangs on a crane that swings out over the coals, and the whole room is arranged around the fact that heat happens in exactly one place.' },
    window: { title: 'The casement',
      text: 'Small panes set in lead, because large sheets of glass are ruinously expensive and every one of these crossed the Atlantic in a crate of straw. The rain hasn’t stopped since Saturday. Beyond it, Union Street, and past that the wharves where the {{smuggling|the night’s business}} gets done.' },
    sign:   { title: 'The trade sign',
      text: 'A green dragon, painted by somebody who had plainly never seen one. Most people in Boston can’t read a shop’s name at forty paces but everyone can recognize a picture, which is why every house of business in this town is known by an animal or an object rather than a surname.' },
    shelf:  { title: 'The cupboard',
      text: 'Pewter tankards, stoneware jars, and four pieces of English china kept where they can be seen. The pewter is what people drink from. The china is what tells them what sort of house this is — and it’s on that shelf, not in a cupboard, for exactly that reason.' },
    candle: { title: 'The candle',
      text: 'Tallow, not beeswax. It smells of the animal it came from and it gutters, but a beeswax candle costs several times as much and is for churches and people with money. When this burns down the room gets darker, and that’s simply what the end of an evening is.' }
  };

  /* =======================================================================
     GLOSSARY — every term a student can click in dialogue or newspaper
     ======================================================================= */

  var GLOSSARY = {
    itinerant:   { term: 'Itinerant preacher', def: 'A preacher who travels from town to town instead of running one church. Think of a touring act versus the same band playing one bar forever. Settled ministers hated it — these guys showed up uninvited and preached to their congregations.' },
    newlight:    { term: 'New Light', def: 'People who were into the revivals. They believed real faith is something you FEEL happen to you, not something you inherit from your parents and go through the motions of.' },
    oldlight:    { term: 'Old Light', def: 'People who thought the revivals were a mess — mostly the trained, official ministers. Their argument: crying and shouting is not proof of anything, and letting anyone claim God spoke to them wrecks the church.' },
    enthusiasm:  { term: 'Enthusiasm', def: 'In the 1700s this was an insult, not a compliment. It meant claiming God talked to you personally — with no training, no job in the church, and nobody\u2019s permission. Roughly: "this person thinks they\u2019re special and they\u2019re going to get people hurt."' },
    newbirth:    { term: 'New Birth', def: 'The moment at the center of the Great Awakening: suddenly KNOWING you\u2019re saved instead of just hoping so. People described it like a switch flipping.' },
    testify:     { term: 'To testify', def: 'To stand up in front of people and describe your own conversion. This is the part that scared the authorities — in a field with no pulpit, servants, women, and Black colonists could stand up and speak, and no one could stop them.' },
    navigation:  { term: 'Navigation Acts', def: 'English laws saying colonial goods had to travel in English or colonial ships, and that a lot of it had to stop in England first. England took a cut on the way through. That was the whole point.' },
    enumerated:  { term: 'Enumerated goods', def: 'A specific list of colonial products — sugar, tobacco, indigo and others — that legally could only be shipped to England, even when someone closer was offering a better price.' },
    molassesact: { term: 'Molasses Act of 1733', def: 'A tax of sixpence per gallon on molasses from non-British islands. It was passed to protect British sugar planters who couldn\u2019t compete with French prices. Almost nobody ever paid it.' },
    neglect:     { term: 'Salutary neglect', def: 'Britain\u2019s habit of writing strict rules for the colonies and then not enforcing them. Colonists got used to the freedom. That\u2019s why later crackdowns felt like Britain taking something away, instead of Britain finally doing its job.' },
    smuggling:   { term: 'Smuggling', def: 'Here it mostly means landing French molasses and not paying the tax on it. So many people did it that Boston\u2019s rum business — and a big chunk of the local economy — depended on it.' },
    landbank:    { term: 'Land Bank', def: 'A 1740 Massachusetts plan to print paper money backed by farmland, because the colony had almost no actual coins. Parliament shut it down in 1741 from three thousand miles away, which made a lot of country farmers furious.' },
    customs:     { term: 'Customs officer', def: 'A royal official whose job was to inspect cargo and collect the taxes on it. Plenty of them took bribes instead, which is a big reason the trade laws went uncollected for decades.' },
    bohea:       { term: 'Bohea', def: 'A cheap black tea from China, pronounced "boh-HEE." In 1741 tea is just tea — totally normal, nothing political about it. The tea protests are still thirty years away.' },
    triangle:    { term: 'The trade', def: 'Sugar was grown on Caribbean plantations by enslaved people. The leftover molasses came to New England and was distilled into rum. Some of that rum was then traded for more enslaved people. New England\u2019s economy sat on top of that loop.' },
    lockeref:    { term: 'John Locke', def: 'An English philosopher whose books were being read all over the colonies. Two ideas that mattered most: you\u2019re born knowing nothing, so nobody is born better than anyone else — and a government only has power because the people agreed to give it, which means they can take it back.' },
    rights:      { term: 'Natural rights', def: 'The idea that certain rights — life, liberty, property — belong to you just because you\u2019re a person, not because a king handed them out. If a king didn\u2019t give them to you, he can\u2019t take them away either. That argument shows up again, word for word, in 1776.' },
    authority:   { term: 'Authority', def: 'Who gets to tell you what is true and what to do. This is the thread connecting everything tonight: the revivals let ordinary people claim religious authority without training, and the new philosophy said political authority only comes from the consent of the people. Same question, two subjects.' }
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
