/* ===========================================================================
   scenes.js — the evening’s six conversations.

   Rules, held to throughout:
     1. Every choice is a TONE FORK. No branch is wrong; branches differ in
        how fast a patron opens up and how much they volunteer.
     2. Teaching arrives because the PLAYER asked. No patron recites facts at
        an unprompted student.
     3. Real events are named; invented people say the words. Whitefield’s
        1740 sermon on the Common is history. Everyone in this room isn’t.

   Markup: {{glossaryKey|words on screen}} renders as a clickable term.

   Node kinds:
     { say, expr }                  patron speaks
     { narrate }                    stage direction, italic
     { choose: [ {label, then} ] }  player picks a line
     { if, then, else }             branches on ledger state
   =========================================================================== */

(function (global) {
  'use strict';

  var SCENES = {

  /* =====================================================================
     1 — EZRA HALE, a young barrel-maker, newly converted
     Thread: the Great Awakening’s emotional, levelling side.
     ===================================================================== */
  convert: {
    enter: [
      { narrate: 'The door bangs. A young man comes in out of the rain, hat in hand, and doesn’t so much sit down as crash-land.' },
      { say: "Evening. Evening. Is it — am I too late? I saw the light.", expr: 'surprised' },
      { choose: [
        { label: '"Never too late. Sit down before you fall down."',
          then: [ { say: "Thank you. I walked here from Roxbury and barely noticed doing it.", expr: 'bright' } ] },
        { label: '"You’re soaked through, friend."',
          then: [ { say: "Am I? — So I am. I hadn’t noticed that either.", expr: 'surprised' } ] },
        { label: '"You look like a man who has had news."',
          then: [ { say: "News. Yes. Not news about the world, though. News about me, if that makes any sense.", expr: 'bright' } ] }
      ]}
    ],
    react: {
      matched: [ { say: "That’s the thing exactly. Plain and strong and no fuss about it.", expr: 'bright' } ],
      near: [ { say: "That works. Thank you.", expr: 'warm' } ],
      mismatched: [ { say: "That’s — very nice. Nicer than I asked for.", expr: 'worried' },
                    { narrate: 'He drinks it anyway, a little embarrassed by the cup.' } ]
    },
    talk: [
      { say: "I have been three days at meetings. Three. My boss is going to kill me for the barrels I haven’t made.", expr: 'neutral' },
      { choose: [
        { label: '"What sort of meetings?"',
          then: [ { say: "A preacher come through — not our settled minister, mind, but a traveling man. An {{itinerant|itinerant}}. He preaches anywhere that will have him — a field, a barn, somebody else’s church.", expr: 'warm' } ] },
        { label: '"Three days is a long while to sit and listen."',
          then: [ { say: "You don’t sit. That’s the whole of it. Our own minister reads quietly off a page on Sundays and you sit there. This man shouted. He wept. Nobody sat.", expr: 'bright' } ] },
        { label: '"Your master will forgive you or he won’t."',
          then: [ { say: "He won’t. But I mind it less than I did a week ago, which honestly scares me.", expr: 'thoughtful' } ] }
      ]},
      { say: "They’re calling it {{awakening|a great awakening}}, and I didn’t believe a word of that phrase until Tuesday.", expr: 'bright' },
      { say: "He asked us — each of us, one by one, close enough — whether we knew we were saved. Not hoped. Not reckoned. {{newbirth|Knew}}. And I couldn’t answer him. Then in his second hour I found I could.", expr: 'warm' },
      { choose: [
        { label: '"And what does your minister say to that?"',
          then: [
            { say: "He says it’s {{enthusiasm|enthusiasm}}. He means it badly — he means a man claiming God spoke to him direct, with no learning and no ordination and no leave from anybody.", expr: 'worried' },
            { say: "Maybe he’s right to worry. I make barrels. I never learned Latin. And yet I stood in a field last Tuesday certain of something he has spent forty years learning to be careful about.", expr: 'thoughtful' } ] },
        { label: '"Who else was standing in that field?"',
          then: [
            { say: "Everybody. That’s what I can’t get past. Servants. Women speaking out loud, and not quietly either. A Black man from the Neck who prayed as well as any minister I ever heard, and I don’t say that lightly.", expr: 'surprised' },
            { say: "And nobody stopped him. In a field, with nobody’s pulpit to defend, nobody stopped him.", expr: 'thoughtful' } ] },
        { label: '"Careful who you say that to."',
          then: [ { say: "I know it. Whole congregations have split in half over less — the one part calling themselves {{newlight|New Light}}, the other holding to the old order. Ours hasn’t broke yet. Give it a month.", expr: 'worried' } ] }
      ]},
      { say: "Mr. Whitefield stood on the Common last autumn and twenty thousand people came. Twenty thousand. There aren’t even twenty thousand people living in Boston.", expr: 'bright' },
      { say: "They came in from everywhere. That’s what the ministers haven’t reckoned with, I think. Not the shouting. The walking.", expr: 'thoughtful' }
    ],
    confession: [
      { narrate: 'He turns the cup in his hands. When he speaks again it’s much quieter.' },
      { say: "May I tell you the thing I haven’t told anybody?", expr: 'worried' },
      { say: "I’m frightened it will wear off.", expr: 'downcast' },
      { say: "On Tuesday I knew. I knew the way you know your own name. And this morning I woke and it was — thinner. Still there. Thinner.", expr: 'downcast' },
      { choose: [
        { label: '"Perhaps that’s just what a Wednesday feels like."',
          then: [ { say: "That’s nearly a comfort. Nearly.", expr: 'thoughtful' } ] },
        { label: '"So you go back and hear him again."',
          then: [ { say: "That’s what I mean to do. And I have begun to wonder whether that’s faith or whether it’s only wanting the feeling back.", expr: 'worried' } ] },
        { label: '"Nobody stays certain of anything."',
          then: [ { say: "Our minister would say the same and I would have hated him for it. From you it goes down easier.", expr: 'thoughtful' } ] }
      ]},
      { say: "That’s the trouble with a thing that comes on you all at once. You have no idea how to keep it.", expr: 'downcast' }
    ],
    exit: [
      { say: "I should go before I’m missed any worse than I already am. Thank you for the cup, and for not laughing at me.", expr: 'warm' },
      { narrate: 'He puts his wet hat back on and goes out into it.' }
    ],
    journal: { title: 'Ezra Hale, cooper',
      text: 'Walked in from Roxbury after three days of revival meetings. Heard an itinerant preacher; describes a sudden "new birth." Notes that in the field, servants, women, and a Black man all spoke — and no one stopped them. His own minister calls it "enthusiasm."' }
  },

  /* =====================================================================
     2 — REV. SAMUEL THORNE, settled minister, an Old Light
     Thread: the revival’s opposition, and the case for reason and order.
     ===================================================================== */
  minister: {
    enter: [
      { narrate: 'An older man in black comes in slowly, shakes the rain off his cloak, and takes the seat he always takes.' },
      { say: "Good evening. A miserable night, and it’s going to be a worse week.", expr: 'stern' },
      { choose: [
        { label: '"Trouble in the parish, Reverend?"',
          then: [ { say: "Trouble in every parish between here and Connecticut. Mine is just the one I’m responsible for.", expr: 'stern' } ] },
        { label: '"The usual, sir?"',
          then: [ { say: "The usual. It’s a relief to have one thing this month go the way it always has.", expr: 'thoughtful' } ] },
        { label: '"You look tired."',
          then: [ { say: "I’m sixty-one and I spent all day writing a letter I didn’t want to write. Yes. I look tired.", expr: 'downcast' } ] }
      ]}
    ],
    react: {
      matched: [ { say: "Thank you. Precisely so. There’s a great deal to be said for a thing done the way it’s properly done.", expr: 'warm' } ],
      near: [ { say: "Close enough. I won’t make a sermon out of it.", expr: 'neutral' } ],
      mismatched: [ { say: "This isn’t what I asked for.", expr: 'stern' },
                    { narrate: 'He looks at the cup for a moment, then drinks it without further comment, which is somehow worse.' } ]
    },
    talk: [
      { say: "You have had the young ones in here, I’m sure. Fresh from the fields, full of fire, wanting to tell you about it.", expr: 'thoughtful' },
      { choose: [
        { label: '"One or two. Is that so bad a thing?"',
          then: [ { say: "Bad? No. Not in itself. A man moved to seriousness about his soul isn’t a bad thing. It’s what comes afterward that I have to clean up.", expr: 'neutral' } ] },
        { label: '"You don’t care for the revivals."',
          then: [ { say: "I don’t care for what they leave behind. Let me be fair to them first, since nobody else will be.", expr: 'stern' } ] },
        { label: '"They seem sincere enough."',
          then: [ { say: "Sincerity isn’t the question. A person can be completely sincere and completely wrong, and be more dangerous because of the sincerity.", expr: 'stern' } ] }
      ]},
      { say: "Here is my objection, and it isn’t the one they say I have. I don’t object to feeling. I object to feeling being treated as *proof* of something.", expr: 'neutral' },
      { choose: [
        { label: '"Explain that to a man who pours coffee."',
          then: [
            { say: "Gladly. If a man cries, he knows he’s saved. If he doesn’t cry, he’s afraid he’s damned. So — what has he actually learned? Nothing. He has only measured his own mood.", expr: 'thoughtful' },
            { say: "God gave us reason as well as hearts. A faith that can’t survive a cool morning isn’t a faith, it’s a mood.", expr: 'neutral' } ] },
        { label: '"So you’d have them think it through instead."',
          then: [
            { say: "I’d rather they *read*. There’s a whole world of careful thinking come across the water in this last age — people working out how the sky moves, how the mind works, what powers a government is actually allowed.", expr: 'warm' },
            { say: "It’s a good time to be a thinking Christian. It’s a bad time to be a shouting one.", expr: 'stern' } ] },
        { label: '"What did the letter say? The one you didn’t want to write."',
          then: [
            { say: "That an {{itinerant|itinerant}} isn’t to have my pulpit. He asked. I refused. Fourteen of my congregation have written to say they will go hear him anyway, out in a field.", expr: 'downcast' },
            { say: "They aren’t wicked people. That’s the difficulty. I have baptised most of them.", expr: 'downcast' } ] }
      ]},
      { say: "They call us {{oldlight|Old Lights}}, as though we had let a lamp go out. What we have is order. A settled minister, a settled congregation, a covenant that holds.", expr: 'stern' },
      { say: "And I will tell you what troubles me more than any of the shouting. There are books coming off the ships now that say a man is born knowing nothing, and that no man is set above another by birth.", expr: 'worried' },
      { say: "Put that beside a farmhand in a field announcing that God has spoken to him personally, and you have the same idea twice. That {{authority|nobody above you has any claim on what you believe}}.", expr: 'worried' },
      { say: "A man who decides his own faith this year will decide his own government soon enough. I may be the only person in Boston who finds that a frightening sentence. I expect I shan’t be, in thirty years.", expr: 'downcast' },
      { say: "Take that away and what’s left? Everybody their own church. Every woman her own preacher. Every apprentice certain God told him something his boss didn’t hear.", expr: 'worried' },
      { narrate: 'He turns the cup around on the counter without drinking from it.' },
      { say: "I may be wrong. I have written a great deal in my life about how carefully a man ought to hold that possibility. It’s harder to practice than to write.", expr: 'thoughtful' }
    ],
    confession: [
      { narrate: 'He drinks, sets the cup down precisely, and doesn’t pick it up again.' },
      { say: "I’m going to say something to you that I wouldn’t say in my own house.", expr: 'thoughtful' },
      { say: "I think we’re losing. Not the argument — the argument I can win in a room of educated men any afternoon. I mean the thing underneath it.", expr: 'downcast' },
      { choose: [
        { label: '"What thing underneath it?"',
          then: [
            { say: "That people would rather be *moved* than instructed. And I have spent forty years instructing.", expr: 'downcast' },
            { say: "I have written sermons I was proud of that emptied a room. That boy in the field made a farmhand weep and walk fifteen miles. I don’t think he’s right. I’m no longer certain that matters as much as I was taught it did.", expr: 'worried' } ] },
        { label: '"You don’t sound like a man who thinks he’s right."',
          then: [
            { say: "I think I’m right. I’m not certain I’m *useful*, which is a different and worse thing to lie awake about.", expr: 'downcast' } ] }
      ]},
      { say: "If they’re wrong and they carry the country, then order was never as solid as we said it was. And if they’re right — ", expr: 'worried' },
      { narrate: 'He doesn’t finish it.' },
      { say: "Well. There’s no comfortable end to that sentence.", expr: 'downcast' }
    ],
    exit: [
      { say: "Good night. Keep the fire going — you will get more of them before you close, and they will all want to talk.", expr: 'warm' }
    ],
    journal: { title: 'Rev. Samuel Thorne, Old Light',
      text: 'Objects to the revivals not for their feeling but for treating feeling as proof. Wants reason held alongside faith, and points to the new philosophy coming across the Atlantic. Fears that if every person becomes their own authority, the settled church can’t hold. Refused an itinerant his pulpit; fourteen of his congregation will go hear him anyway.' }
  },

  /* =====================================================================
     3 — CATO BELL, printer’s apprentice
     Thread: the Enlightenment, print culture, and one honest beat about
     what the word "liberty" was sitting next to in 1741.
     ===================================================================== */
  reader: {
    enter: [
      { narrate: 'A young man in a green coat takes the corner seat, sets down a book with a scrap of paper marking his place, and doesn’t open it immediately.' },
      { say: "Evening. I won’t be any trouble — I just want somewhere with a candle that isn’t the shop.", expr: 'warm' },
      { choose: [
        { label: '"Stay as long as you like."',
          then: [ { say: "That’s generous. I’m going to take a full hour of it.", expr: 'warm' } ] },
        { label: '"What have you got there?"',
          then: [ { say: "Something I was supposed to shelve this afternoon and didn’t. I will confess that much and no more.", expr: 'bright' } ] },
        { label: '"Long day at the press?"',
          then: [ { say: "Every day is a long day at the press. Ink doesn’t care what hour it is.", expr: 'neutral' } ] }
      ]}
    ],
    react: {
      matched: [ { say: "That’s well done. It will still be drinkable in an hour, which is all I wanted.", expr: 'warm' } ],
      near: [ { say: "Thank you kindly.", expr: 'neutral' } ],
      mismatched: [ { say: "Ah — that one needs drinking fast.", expr: 'worried' },
                    { narrate: 'He glances at his book, then at the cup, plainly calculating.' } ]
    },
    talk: [
      { choose: [
        { label: '"Go on then. What’s it?"',
          then: [ { say: "{{lockeref|Locke}}. An essay on human understanding — on how a mind comes to know anything at all. It came off a ship from London and Mr. Fleet hasn’t sold it yet, so it’s mine at night.", expr: 'bright' } ] },
        { label: '"Does your master know you read the stock?"',
          then: [ { say: "My master taught me my letters so I could set type. He didn’t think through what else letters are good for. I haven’t raised it with him.", expr: 'bright' } ] },
        { label: '"Sounds like heavy going."',
          then: [ { say: "It is. I have read the same twelve pages four times. But it’s heavy the way a load is heavy, not the way a stone is.", expr: 'thoughtful' } ] }
      ]},
      { say: "There’s a name going about for this way of thinking — {{enlightenment|enlightened}}, they say, as though everyone before us had been sitting in the dark. I don’t love the word. I do rather love the books.", expr: 'thoughtful' },
      { say: "His argument is that we come into the world knowing nothing at all. No ideas built in ahead of time. Everything we have, we got — from what we saw, and heard, and were told.", expr: 'warm' },
      { choose: [
        { label: '"That seems obvious enough."',
          then: [
            { say: "It isn’t obvious at all, and here is why. If nothing is written in us at birth, then no man is born knowing more than another. And nobody is born fit to rule anybody else.", expr: 'bright' },
            { say: "That isn’t a small thing to print. That’s a very large thing to print.", expr: 'thoughtful' },
            { say: "He goes further. He says there are {{rights|natural rights}} — that being alive, being free, and keeping what you’ve worked for belong to you because you’re a person. Not because a king handed them down. And a thing no king gave you is a thing no king can take back.", expr: 'bright' },
            { say: "Which means a government holds its power on loan. From the people it governs. On their say-so, and no other.", expr: 'bright' } ] },
        { label: '"Who else is reading this?"',
          then: [
            { say: "In Boston? More people than you would think. That’s what the press is for. A thing printed in London in the spring is argued over in a Boston coffee house by fall.", expr: 'warm' },
            { say: "We don’t have a university full of philosophers. We have newspapers, almanacs, and rooms like this one. It turns out that’s enough.", expr: 'bright' } ] },
        { label: '"What do you make of it yourself?"',
          then: [
            { say: "I make of it that a man ought to be able to say what follows from a thing, and have the saying of it count for something.", expr: 'thoughtful' } ] }
      ]},
      { say: "You learn a good deal about a colony from what it needs printed. I set a notice last spring for the {{landbank|Land Bank}} — paper money backed on farmland, got up by country men because there is no silver in this colony to trade with. Word came over in the summer that Parliament had voided the whole scheme from London. I set that notice too.", expr: 'neutral' },
      { narrate: 'He turns the book over, considering whether to say the next part.' },
      { say: "I will tell you what I keep catching on. These gentlemen write a great deal about liberty. {{rights|Natural rights}}. Consent. Government by agreement of the governed.", expr: 'neutral' },
      { choose: [
        { label: '"And?"',
          then: [ { say: "And several of them own shares in the {{triangle|trade}}. There are men in this town who will quote you Locke on the rights of man before dinner and sign for a cargo after it. I’m free. Not everyone I know is.", expr: 'stern' } ] },
        { label: '"You sound like you have an objection."',
          then: [ { say: "Not an objection. Just something I notice. I set type for a living — I notice when a word is used carefully and when it’s used loosely. Liberty gets used both ways in the same paragraph, sometimes.", expr: 'stern' } ] }
      ]},
      { say: "Still. It’s a better argument than they mean it to be. That’s the useful thing about printing something. Once it’s set, anyone at all can read it.", expr: 'thoughtful' },
      { narrate: 'He glances at the door, where somebody came in earlier soaked and talking about a preacher.' },
      { say: "And here’s the thing nobody in this town has said out loud yet. The man shouting in a field that God spoke to him direct, and the man in this book saying no one is born fit to rule — they’re asking the *same question*.", expr: 'bright' },
      { say: "{{authority|Who told you so, and why should that settle it?}} One of them asks it about the church. The other asks it about the king. I don’t think they can be kept apart for long.", expr: 'bright' }
    ],
    confession: [
      { say: "Can I tell you what I would set, if it were my press and not his?", expr: 'thoughtful' },
      { choose: [
        { label: '"Go on."', then: [] },
        { label: '"I won’t repeat it."',
          then: [ { say: "I know you won’t. That’s rather why I’m still sitting here.", expr: 'warm' } ] }
      ]},
      { say: "Nothing grand. No pamphlet. I would set a plain page with the argument laid out in order, the way he lays out his — premise, premise, conclusion — and I wouldn’t put a name to it, and I wouldn’t soften the last line.", expr: 'bright' },
      { say: "And the last line would be that a man who can’t consent can’t be said to have agreed. That isn’t my idea. It’s *his*. I just followed it one step further than the gentlemen quoting him want to go.", expr: 'stern' },
      { choose: [
        { label: '"That would get printed one day."',
          then: [ { say: "It will. Not by me and not this year. But the type exists, and the argument exists, and somebody is going to put the two together.", expr: 'thoughtful' } ] },
        { label: '"That would get you in a great deal of trouble."',
          then: [ { say: "Yes. That’s the other reason it’s still in my head and not in a forme.", expr: 'downcast' } ] }
      ]},
      { say: "Anyway. I set type for lost-horse ads. That’s the job.", expr: 'warm' }
    ],
    exit: [
      { say: "The candle is almost out. I should go with it. Good night — and thank you for the corner.", expr: 'warm' }
    ],
    journal: { title: 'Cato Bell, apprentice printer',
      text: "Reading Locke after hours. Follows the argument to its edge: if nothing is written in us at birth, no one is born fit to rule another. Notes that men in Boston quote liberty and sign for cargoes in the same day. Sees the press — newspapers, almanacs, coffee houses — as how ideas cross the ocean and get argued." }
  },

  /* =====================================================================
     4 — CAPT. JONAS BRIGHT, master of the sloop Dolphin
     Thread: the Molasses Act, smuggling, salutary neglect — and the one
     honest line about whose labor is in the barrel.
     ===================================================================== */
  captain: {
    enter: [
      { narrate: 'A broad man in a soaked three-cornered hat drops onto the stool hard enough to move it, and sighs like a man setting down something heavy.' },
      { say: "You’re open. Good. Otherwise I would have knocked, and not politely.", expr: 'neutral' },
      { choose: [
        { label: '"Rough crossing?"',
          then: [ { say: "Rough enough. Four days from the Islands and every one of them wet.", expr: 'stern' } ] },
        { label: '"The Dolphin came in today, I saw."',
          then: [ { say: "You and everyone else with eyes. That’s the problem with a harbor.", expr: 'thoughtful' } ] },
        { label: '"Sit. You look like the sea chewed you."',
          then: [ { say: "Ha. It did, and it spat me out on Long Wharf at four this afternoon.", expr: 'warm' } ] }
      ]}
    ],
    react: {
      matched: [ { say: "*That* is a drink. None of your London manners in that cup. Thank you.", expr: 'bright' } ],
      near: [ { say: "Aye, that will do.", expr: 'warm' } ],
      mismatched: [ { say: "What’s this, a christening?", expr: 'surprised' },
                    { narrate: 'He drinks it in three swallows, apparently to get it over with.' } ]
    },
    talk: [
      { say: "You will have read the paper. Entered in — the sloop Dolphin, Bright master, from the Islands, with molasses and salt.", expr: 'neutral' },
      { choose: [
        { label: '"Which islands?"',
          then: [ { say: "Now that’s the question, is it not? That’s *the* question.", expr: 'thoughtful' },
                  { say: "The paper says the Islands. The paper is a very relaxing thing to read.", expr: 'warm' } ] },
        { label: '"Good cargo?"',
          then: [ { say: "Cheap cargo. Which is the same as a good one, if you’re the man buying.", expr: 'warm' } ] },
        { label: '"You don’t look like a man who just made money."',
          then: [ { say: "I made money. I’m wondering how long I’ll be let keep making it. There’s a new man at the {{customs|Customs}}.", expr: 'worried' } ] }
      ]},
      { say: "Here is the law, since you’re pouring and I’m talking. There’s an {{molassesact|Act of 1733}}. Sixpence the gallon on any molasses not grown in a British island. Sixpence.", expr: 'neutral' },
      { say: "And it sits on top of a whole stack of older ones — the {{navigation|Navigation Acts}}. English or colonial ships only. English ports on the way. And a list of goods that must touch England first even when the buyer is nearer. Sugar and molasses are on that list; {{enumerated|enumerated}}, they call it.", expr: 'neutral' },
      { choose: [
        { label: '"And do you pay it?"',
          then: [
            { say: "Does the tide pay it? Nobody pays it. If we paid it there would be no rum made in Massachusetts, and if there’s no rum made in Massachusetts there’s no Massachusetts worth the name.", expr: 'stern' },
            { say: "Call it by its name, if you like. {{smuggling|Smuggling}}. I land French and I write British in the book, and the officer who signs it knows the pen is lying.", expr: 'stern' },
            { say: "Sixty distilleries in this colony. Sixty. Not one of them could survive a sixpence.", expr: 'stern' },
            { say: "And I’ll say the rest of it, since you poured me an honest cup. The cane that syrup comes off is cut by {{triangle|people carried there in chains}}, who are not paid and did not choose it. That’s in the barrel as much as the molasses is. I carry it. I don’t pretend otherwise.", expr: 'downcast' } ] },
        { label: '"Why is the law there at all?"',
          then: [
            { say: "To please the sugar planters in Barbados and Antigua, who have friends in Parliament and can’t sell their molasses so cheap as the French can. It was never about the money. It was about *them*.", expr: 'stern' },
            { say: "So Parliament wrote it, and then Parliament looked the other way for eight years. That suits me fine.", expr: 'thoughtful' } ] },
        { label: '"So the French sell cheaper."',
          then: [
            { say: "Half the price and better besides. The French won’t let their islands distil rum — it would hurt their brandy business back home — so their molasses is near worthless to them and worth a fortune to us.", expr: 'warm' } ] }
      ]},
      { say: "Eight years that Act has stood and it has never once been kept. That isn’t an accident. That’s a deal nobody ever wrote down. They leave us alone, we stay loyal, and everybody eats.", expr: 'neutral' },
      { choose: [
        { label: '"What happens if they stop leaving you be?"',
          then: [ { say: "Then we find out what that deal was actually worth. I would rather not. I have a daughter in Charlestown and a sloop with a bad mast.", expr: 'worried' } ] },
        { label: '"Doesn’t it trouble you? Breaking a law that plainly?"',
          then: [ { say: "It bothers me the way weather bothers me. It’s there, it makes no sense, and I sail in it anyway.", expr: 'thoughtful' } ] }
      ]},
      { narrate: 'He looks into the cup for longer than the answer needs.' },
      { say: "I will say one thing more and then I will stop, because it isn’t a thing I care to dwell on. That molasses is boiled off sugar cane. Somebody cut that cane by hand. They didn’t choose the work and they aren’t paid for it, and I have seen the fields, and I know what I’m carrying.", expr: 'downcast' },
      { say: "The whole of it runs on that. The rum, the profit, this argument about sixpence — all of it sits on top of that. Everybody in this town knows it, and nobody says it.", expr: 'downcast' },
      { say: "There. I said it. Now I’m going to bed.", expr: 'neutral' }
    ],
    confession: [
      { narrate: 'He looks at the door for a moment before he says it.' },
      { say: "The new {{customs|Customs}} man came to me on Friday.", expr: 'worried' },
      { say: "Not to seize anything. To *talk*. Very civil. Said he understood how the trade worked and had no wish to ruin honest men, and that a master who told him which coves were busy would find his own entries went very smooth indeed.", expr: 'downcast' },
      { choose: [
        { label: '"What did you tell him?"',
          then: [
            { say: "I told him I would think on it. Which isn’t no.", expr: 'downcast' },
            { say: "And I have thought on it every hour since, which is worse than being seized would have been.", expr: 'worried' } ] },
        { label: '"He’s offering to make you an informer."',
          then: [
            { say: "He is offering to make me *safe*. That’s how it’s put, and that’s why it works.", expr: 'stern' } ] },
        { label: '"Every captain in the harbor would know."',
          then: [
            { say: "Every captain in the harbor would know by the end of the month and I would never load a cargo in this town again. He knows that too. He isn’t a fool.", expr: 'worried' } ] }
      ]},
      { say: "That’s how the law finally gets kept, if it ever does. Not by catching us. By making it worth one of us to hand over the rest.", expr: 'downcast' },
      { say: "I have a daughter in Charlestown and a mast that needs replacing. Ask me again in a month.", expr: 'downcast' }
    ],
    exit: [
      { say: "If a customs man comes in asking questions, you never met me and the Dolphin sails Thursday. Good night to you.", expr: 'warm' }
    ],
    journal: { title: 'Capt. Jonas Bright, sloop Dolphin',
      text: 'Landed molasses from the French islands and reported it vaguely. Explains the Molasses Act of 1733 — sixpence a gallon on foreign molasses — and says flatly that nobody pays it, because sixty Massachusetts distilleries couldn’t survive it. Calls the eight years of non-enforcement "a bargain nobody wrote down." Says plainly that the whole trade rests on the labor of enslaved people cutting cane.' }
  },

  /* =====================================================================
     5 — PATIENCE MARSH
     Thread: the Awakening and the trade, carried by one person.
     ===================================================================== */
  patience: {
    enter: [
      { narrate: 'A young woman comes in near closing, sits at the counter, and doesn’t take her gloves off right away.' },
      { say: "Good evening. Forgive me — I don’t usually come by this late.", expr: 'neutral' },
      { choose: [
        { label: '"You’re welcome any hour. Rough day?"',
          then: [ { say: "Rough is one word for it. I’ve had a lot of days like that lately.", expr: 'downcast' } ] },
        { label: '"No trouble at all. What can I make you?"',
          then: [ { say: "Something to settle me, if you please. I’ve had a lot of days like that lately.", expr: 'neutral' } ] },
        { label: '"You look like a woman with something on her mind."',
          then: [ { narrate: 'She notices that you noticed.' },
                  { say: "...I suppose I do. I had hoped I was carrying it better than that.", expr: 'worried' } ] }
      ]}
    ],
    react: {
      matched: [ { narrate: 'She wraps both hands around it before she drinks, and something in her shoulders comes down an inch.' },
                 { say: "Oh — that’s exactly right. Thank you.", expr: 'warm' } ],
      near: [ { say: "Thank you. That’s kind.", expr: 'warm' } ],
      mismatched: [ { say: "Oh — thank you.", expr: 'surprised' },
                    { narrate: 'She drinks it too fast, and talks a little faster afterwards.' } ]
    },
    talk: [
      { say: "May I ask you something odd?", expr: 'neutral' },
      { choose: [
        { label: '"Ask away."', then: [] },
        { label: '"Only if I can ask you one back."',
          then: [ { say: "That seems fair enough.", expr: 'warm' } ] },
        { label: '(Say nothing. Nod.)',
          then: [ { narrate: 'She takes the silence as permission, which it was.' } ] }
      ]},
      { say: "Do you think God cares *who* speaks His truth? Or only *that* somebody speaks it?", expr: 'thoughtful' },
      { choose: [
        { label: '"That depends. What’s happened?"',
          then: [ { say: "A great deal, in three weeks. I hardly know where it starts.", expr: 'worried' } ] },
        { label: '"That sounds like a question for your minister."',
          then: [ { say: "It is. That’s rather the difficulty with asking it.", expr: 'downcast' } ] },
        { label: '"Start from the beginning — what happened at this meeting of yours?"',
          then: [ { say: "You have heard something, then. Boston is a small town that thinks it’s a big one.", expr: 'surprised' } ] }
      ]},
      { say: "Three weeks past I went — half out of curiosity, half because my cousin practically begged me — to hear a preacher passing through. Not settled here, mind, but {{itinerant|itinerant}}. He travels, and preaches wherever a pulpit or a field will have him.", expr: 'neutral' },
      { say: "Much in the fashion of Mr. Whitefield, who stood upon the Common last year and, they say, was heard by almost twenty thousand people at once. I didn’t go for him. I went for one of the men who follow after him now, carrying the same fire to smaller congregations.", expr: 'neutral' },
      { say: "He didn’t read calmly off a page the way our own minister does on Sundays. He *shouted*. He wept. He asked each of us, plainly, whether we knew — truly knew, in our hearts, not just repeated — that we were saved.", expr: 'warm' },
      { say: "And I found I couldn’t answer him. And then, somewhere in his second hour, I found that I could. That’s what they call being awakened. A {{newbirth|New Birth}}, they say — sudden and complete, not the slow, quiet faith my father’s generation grew up with.", expr: 'bright' },
      { choose: [
        { label: '"That doesn’t sound like something you’d apologize for."',
          then: [ { say: "I hadn’t thought of it as something to apologize for — until I imagined saying it out loud to him.", expr: 'downcast' } ] },
        { label: '"Your father’s generation. He doesn’t approve, then?"',
          then: [ { say: "He doesn’t. He has been very clear, and very quiet about it, which is worse.", expr: 'worried' } ] },
        { label: '"Is that why you were asked to speak on Thursday?"',
          then: [ { say: "You *have* heard something. Yes. That’s exactly why.", expr: 'surprised' } ] }
      ]},
      { say: "Ministers who welcome men like the one I heard, he calls {{newlight|New Light}} — as though they had found some fresh flame the rest of us lack. His own minister, and most of the settled clergy in this city, are what they call {{oldlight|Old Light}}. They think the shouting and the crying is chaos dressed up as faith, and dangerous on top of that.", expr: 'neutral' },
      { say: "Whole congregations have split over less. And now I have been asked to {{testify|testify}} — to stand and speak of what happened in me, before a room of women. Part of me wonders whether the Old Lights aren’t a little right to be uneasy. I mean to do it anyway.", expr: 'thoughtful' },
      { choose: [
        { label: '"Why would that frighten your father particularly?"',
          then: [
            { say: "Because my father is a merchant, and a merchant is only worth what people are willing to assume about him.", expr: 'worried' },
            { say: "He deals with English houses and with customs men both. He can’t afford to be thought careless in *anything* just now — least of all in his own household.", expr: 'worried' } ] },
        { label: '"It’s only a prayer meeting. Surely that’s no risk to him."',
          then: [
            { say: "You would think so. But a daughter’s name travels a lot further than the daughter does.", expr: 'downcast' },
            { say: "And my father has other reasons to want quiet just now, which haven’thing to do with God at all.", expr: 'worried' } ] }
      ]},
      { choose: [
        { label: '"What other reasons?"',
          then: [
            { say: "Our molasses and sugar are what they call {{enumerated|enumerated goods}}. By law they may go nowhere by ship but through England first, and pay a duty besides, just for the privilege of the detour.", expr: 'neutral' },
            { say: "Half the captains in this harbor find a friendly customs officer and a quiet cove instead, and call it simply good business.", expr: 'thoughtful' } ] },
        { label: '"Trouble with the business?"',
          then: [
            { say: "Not trouble. *Arrangements*. There’s a great deal of arrangement in the shipping of sugar.", expr: 'thoughtful' },
            { say: "What the law says and what the harbor does haven’t been on speaking terms for years.", expr: 'neutral' } ] }
      ]},
      { choose: [
        { label: '"And your father — which is he? Law, or harbor?"',
          then: [
            { say: "My father is very careful never to ask his partners too many questions about where their molasses truly came from.", expr: 'downcast' },
            { narrate: 'She says this flatly, the way you say a thing you have decided not to think about.' },
            { say: "That’s its own kind of answer, I suppose. I hadn’t thought of it as one until just now.", expr: 'worried' } ] },
        { label: '"That sounds like it could fall on him hard one day."',
          then: [
            { say: "It could. And the way it would fall isn’t by his being caught — it’s by getting *noticed*. A man is safe in that harbor right up until somebody has a reason to look at him.", expr: 'worried' },
            { say: "And I have been asked to stand up in a room and speak.", expr: 'downcast' } ] }
      ]},
      { choose: [
        { label: '"Then it sounds like you already know what you’re going to do."',
          then: [ { say: "...I think I might. I kept hoping somebody would tell me not to, and nobody has, and I’m relieved.", expr: 'warm' } ] },
        { label: '"You don’t owe anyone an apology for what you felt."',
          then: [ { say: "No. I don’t. It’s a strange thing to be told, and I think I needed telling.", expr: 'warm' } ] },
        { label: '"What will you say to them, on Thursday?"',
          then: [
            { narrate: 'She looks at the counter and half-rehearses it, quietly, as if to herself.' },
            { say: "\"I went out of curiosity. I came back not able to say I was the same. I don’t have learning and I don’t have authority, and I wasn’t asked whether I had either. I was only asked whether I knew.\"", expr: 'thoughtful' },
            { say: "...Something like that. It sounds weaker out loud than it does in my head.", expr: 'warm' } ] }
      ]}
    ],
    confession: [
      { narrate: 'She has been holding the cup with both hands for some time.' },
      { say: "It isn’t my father. I want to be honest with you, because I haven’t been quite honest with myself.", expr: 'thoughtful' },
      { say: "I could bear my father. I have borne my father about a lot of things.", expr: 'neutral' },
      { choose: [
        { label: '"Then what’s it?"',
          then: [ { say: "I’m afraid I’ll stand up on Thursday and feel *nothing*.", expr: 'downcast' } ] },
        { label: '"Something else frightens you more."',
          then: [ { say: "Yes. I’m afraid I’ll stand up on Thursday and feel nothing at all.", expr: 'downcast' } ] }
      ]},
      { say: "That I’ll open my mouth in front of those women and hear my own voice saying the words, and know, standing there, that whatever came into me in that field has gone out again — and that I’m simply a merchant’s daughter making a scene.", expr: 'downcast' },
      { choose: [
        { label: '"Feeling it once was still real."',
          then: [ { say: "Was it? I have no way to check. That’s the difficulty with a thing that happens entirely inside you.", expr: 'worried' } ] },
        { label: '"Then say that. Say you aren’t sure."',
          then: [ { narrate: 'She looks up sharply, and then, slowly, stops looking frightened.' },
                  { say: "...I hadn’t thought I was allowed to.", expr: 'surprised' } ] }
      ]},
      { say: "Nobody warns you that the worst part isn’t the disapproval. It’s the wondering whether you made it up.", expr: 'downcast' }
    ],
    exit: [
      { say: "I don’t know entirely what Thursday will bring. But I’m glad to have said it aloud somewhere first, before I say it there.", expr: 'warm' },
      { say: "Good night — and thank you, truly.", expr: 'warm' },
      { narrate: 'She pulls her gloves back on at the door. She had forgotten she was still holding them.' }
    ],
    journal: { title: 'Patience Marsh, merchant’s daughter',
      text: 'Awakened three weeks ago by a traveling preacher; asked to testify before a women’s prayer meeting on Thursday. Her father forbids it — not on doctrine, but because his shipping business depends on English houses and customs men not looking too closely at him. Says he’s "careful never to ask his partners where their molasses truly came from." Both threads of the evening run through this one household.' }
  },

  /* =====================================================================
     6 — MR. ALDIS PYM, of His Majesty’s Customs
     The convergence. What he says depends on what you have been doing.
     ===================================================================== */
  officer: {
    enter: [
      { narrate: 'The last customer of the night is a neat man in a red coat with a small ledger under his arm. He doesn’t shake the rain off. He looks at the room first, and at you second.' },
      { say: "You keep late hours.", expr: 'neutral' },
      { choose: [
        { label: '"Boston keeps them for me, sir."',
          then: [ { say: "Boston keeps a lot of things. Some of them I’m here about.", expr: 'thoughtful' } ] },
        { label: '"We’re just closing, sir."',
          then: [ { say: "Then I’m lucky, you’re unlucky, and we will both be quick.", expr: 'neutral' } ] },
        { label: '"You’re the new man at the Customs."',
          then: [ { say: "Aldis Pym. You’re quicker than most people on this street.", expr: 'warm' } ] }
      ]},
      { narrate: 'He sets the ledger on the counter, open, and doesn’t look at it.' }
    ],
    react: {
      matched: [ { say: "Correctly made. Thank you. It’s a small mercy to have something done properly in this town.", expr: 'warm' } ],
      near: [ { say: "Adequate.", expr: 'neutral' } ],
      mismatched: [ { say: "This isn’t what I asked for.", expr: 'stern' },
                    { narrate: 'He sets it down after one sip and doesn’t touch it again.' } ]
    },
    talk: [
      { say: "I have been in this port eleven days. In eleven days I have read the shipping records for the last two years.", expr: 'neutral' },
      { say: "That is my office in one sentence. The {{navigation|Navigation Acts}} say where a cargo may go and in whose ship. The {{molassesact|Act of 1733}} says what is owed on it. My work is the distance between what those books say and what actually came off the wharves.", expr: 'neutral' },
      { say: "Do you know what I found? Molasses. A very great deal of molasses, all of it, without exception, from British islands. Antigua. Barbados. St. Kitts.", expr: 'thoughtful' },
      { choose: [
        { label: '"That sounds lawful enough."',
          then: [ { say: "It’s *perfectly* lawful. It’s also impossible. Those islands don’t produce so much molasses as this one port claims to have bought from them.", expr: 'stern' } ] },
        { label: '"You sound as though that’s a problem."',
          then: [ { say: "The numbers don’t add. Not by a little. They’re off by a mile.", expr: 'stern' } ] },
        { label: '"What did you expect to find?"',
          then: [ { say: "Exactly what I found. I was just hoping to be wrong.", expr: 'downcast' } ] }
      ]},
      { say: "So either the British islands have performed a miracle, or every entry in that book is a polite lie that everyone — the master, the merchant, the officer who signed it, and the Crown — has agreed to accept.", expr: 'neutral' },
      { choose: [
        { label: '"Why has nobody minded before now?"',
          then: [
            { say: "Because caring is expensive, not caring is profitable, and London is six weeks away by ship.", expr: 'thoughtful' },
            { say: "There’s a word for it that nobody uses to my face. They leave you be, you stay loyal, the ships keep moving. {{neglect|It has worked}}, in its way, for a very long time.", expr: 'neutral' } ] },
        { label: '"And you intend to mind."',
          then: [
            { say: "I intend to do the work I was sent to do. I’m aware that makes me the villain of every table in this room.", expr: 'stern' },
            { say: "I didn’t write the {{molassesact|Act}}. I’m just the first person in eight years rude enough to actually read it.", expr: 'neutral' } ] }
      ]},
      { narrate: 'He turns the ledger a quarter turn, so that it faces you.' },
      { say: "Which brings me to my question, and I would like a plain answer. What have you been sweetening with tonight?", expr: 'stern' },

      /* --- the convergence: what he finds depends on the whole evening --- */
      { if: 'heavyFrench', then: [
        { choose: [
          { label: '"French. All night. You know it and I know it."',
            then: [ { say: "I do know it. Thank you for not insulting me.", expr: 'neutral' },
                    { say: "I’ll write down that this house was candid. That’s worth less than you would like and more than nothing.", expr: 'thoughtful' } ] },
          { label: '"British, sir. All of it British."',
            then: [ { narrate: 'He looks at the price you have been charging, and then at the room, and then at you.' },
                    { say: "At your prices. On British molasses. In this port.", expr: 'stern' },
                    { say: "I will write down that you said so.", expr: 'stern' } ] },
          { label: '"Whatever I could afford, sir."',
            then: [ { say: "Yes. That’s the true answer, and it’s the answer I have had from every honest person in this town.", expr: 'downcast' },
                    { say: "It’s also not a defense. That’s the difficulty with all of this.", expr: 'neutral' } ] }
        ]},
        { say: "Understand my position. If I enforce this Act as written, I close the distilleries. If I close the distilleries, I close the port. If I close the port, I have ruined a loyal colony in the name of a law nobody has kept since it was written.", expr: 'worried' },
        { say: "And if I don’t enforce it, then the law is decoration, and everybody here learns that a law from London is something you can look at and step over.", expr: 'stern' },
        { say: "I don’t know which of those is worse. I haven’t slept well since I arrived.", expr: 'downcast' }
      ], else: [
        { choose: [
          { label: '"British molasses and loaf sugar, sir. Every cup."',
            then: [ { say: "So your books say. And amazingly, so does your shelf.", expr: 'surprised' },
                    { say: "You’re the fourth house I have asked tonight and the first whose answer I believe.", expr: 'warm' } ] },
          { label: '"Whatever was lawful and whatever I could afford."',
            then: [ { say: "Those two things are at war in this town, and you seem to have let the first one win. That’s rarer than it should be.", expr: 'warm' } ] }
        ]},
        { say: "You won’t thank me for saying it, but I can see what it has cost you. Your prices are honest and your purse is thin, and every house on this street that lies to me is doing better than you tonight.", expr: 'thoughtful' },
        { say: "That’s precisely the difficulty. A law that punishes the men who keep it isn’t yet a law. It’s a bet on how long people will stay patient.", expr: 'worried' }
      ]},

      { say: "I will be here for years, I expect. You will be seeing a lot of me.", expr: 'neutral' }
    ],
    confession: [
      { narrate: 'He looks at the closed ledger for a while.' },
      { say: "I wrote to the Board in June and asked to be posted somewhere else. Anywhere. I said Antigua.", expr: 'downcast' },
      { choose: [
        { label: '"Why?"',
          then: [ { say: "Because I had read the Boston entry books before I sailed, and I could already see what the job was going to be.", expr: 'downcast' } ] },
        { label: '"They said no."',
          then: [ { say: "They said the post was mine and the ship left on the tide. Yes.", expr: 'stern' } ] }
      ]},
      { say: "Every man I meet here is decent and every man I meet here is breaking the law, and those two facts don’t cancel. They simply sit next to each other and I’m expected to do something about it.", expr: 'worried' },
      { say: "I have a number in that book that I haven’t sent to London. If I send it, somebody will act on it, and the response won’t be gentle, and it won’t come from me — it will come from a warship.", expr: 'downcast' },
      { choose: [
        { label: '"Then don’t send it."',
          then: [ { say: "Then I’m the fifth officer in a row who didn’t, and the next officer inherits a worse number than I did.", expr: 'stern' } ] },
        { label: '"You will send it."',
          then: [ { say: "I expect I’ll. Not tonight. But I have never once failed to do the job I was sent to do, and I have no reason to think this is where I begin.", expr: 'downcast' } ] }
      ]},
      { say: "Somebody will send it eventually. That’s the only part I’m sure of.", expr: 'neutral' }
    ],
    exit: [
      { narrate: 'He closes the ledger, tucks it under his arm, and puts his hat back on at the door.' },
      { say: "Good night. Keep better books than your neighbours. It will matter sooner than you think.", expr: 'neutral' }
    ],
    journal: { title: "Mr. Aldis Pym, His Majesty’s Customs",
      text: 'Read two years of entry books and found that Boston claims to import more British molasses than the British islands produce. Understands that enforcing the Molasses Act would close the port, and that not enforcing it teaches colonists that laws from London are optional. Cannot see a way through, and says so.' }
  }

  ,

  /* =====================================================================
     RETURN — EZRA HALE, later the same evening
     Short. No order; he isn’t here for a drink.
     ===================================================================== */
  convert_return: {
    enter: [
      { narrate: 'The door goes again. It’s the cooper, without his hat this time, and wetter than before.' },
      { say: "He put me out.", expr: 'surprised' },
      { choose: [
        { label: '"Your master?"',
          then: [ { say: "My master. Three days of meetings and a fourth of arguing about them. He said he runs a workshop, not a church.", expr: 'downcast' } ] },
        { label: '"Sit down. You’re soaked again."',
          then: [ { say: "I have been walking about. I didn’t want to stop walking about, and then I saw your light again.", expr: 'worried' } ] },
        { label: '"You knew that was coming."',
          then: [ { say: "I knew. Knowing something is coming turns out not to help when it actually happens.", expr: 'downcast' } ] }
      ]}
    ],
    talk: [
      { say: "Here is what I can’t get straight. I’m ruined — I have no place, and a cooper with no place is a labourer, and a labourer is nobody.", expr: 'downcast' },
      { say: "And I’m not sorry. I keep waiting to be sorry and it doesn’t come.", expr: 'surprised' },
      { choose: [
        { label: '"Then you’re not ruined. You’re just poorer."',
          then: [ { say: "That’s a harsh way to put it, and I think it might be true.", expr: 'thoughtful' } ] },
        { label: '"Was it worth a trade?"',
          then: [ { say: "Ask me in the winter. Tonight I would say yes, and tonight I’m not a reliable judge of anything.", expr: 'worried' } ] },
        { label: '"Where will you sleep?"',
          then: [ { say: "There are men from the meeting who will take me in. That’s the odd part — three weeks ago I didn’t know one of them, and now I have thirty who would open a door.", expr: 'thoughtful' } ] }
      ]},
      { say: "That’s what nobody says about it. They talk of the shouting and the weeping. Nobody mentions that afterwards you have somewhere to go, and that the somewhere isn’t your master’s house and doesn’t answer to him.", expr: 'neutral' },
      { say: "I think that frightens them more than the weeping does.", expr: 'thoughtful' }
    ],
    exit: [
      { say: "I only wanted to say it out loud to somebody who wouldn’t tell me what it meant. Good night.", expr: 'warm' }
    ],
    journal: { title: 'Ezra Hale, again',
      text: 'Dismissed by his master over the revival meetings. Not sorry — and notes that the movement gave him thirty households that would take him in, none of which answer to his master. Suggests the Awakening’s real threat to the social order wasn’t the emotion but the new networks of authority it created outside existing ones.' }
  },

  /* =====================================================================
     RETURN — PATIENCE MARSH, before closing
     ===================================================================== */
  /* =====================================================================
     PYM, EARLY — a two-minute visit that exists to make the sweetener shelf
     feel like a decision rather than a menu. He buys nothing. He looks.
     ===================================================================== */
  officer_early: {
    enter: [
      { narrate: 'You have not been open five minutes. The door opens on a neat man in a red coat with a small ledger under his arm. He does not sit down.' },
      { say: "Don\u2019t get up. I\u2019m not stopping, and I don\u2019t want anything.", expr: 'neutral' },
      { say: "Aldis Pym. His Majesty\u2019s {{customs|Customs}}. I\u2019ve been in this port eleven days and I\u2019m calling on every house on Union Street before they get busy, so don\u2019t take it personally.", expr: 'neutral' }
    ],
    talk: [
      { narrate: 'He opens the ledger, looks at a page, and turns it so you can see a column of figures you did not write.' },
      { say: "Every keeper on this street buys sweetening. Sugar, honey, molasses. Molasses is what interests me, because there is a duty on the French sort and I cannot find one person in Boston who has paid it.", expr: 'thoughtful' },
      { choose: [
        { label: '"I keep an honest house, sir."',
          then: [
            { say: "Everyone says so. The books say so too — every barrel in this port is sworn to have come from a British island, which would be remarkable, since those islands do not grow that much cane.", expr: 'stern' } ] },
        { label: '"What are you accusing me of?"',
          then: [
            { say: "Nothing whatever. Tonight I am only introducing myself. That is the courtesy. The uncourteous version comes later and involves a warrant.", expr: 'neutral' } ] },
        { label: '"Nobody has ever asked me that before."',
          then: [
            { say: "No. They haven\u2019t. That is precisely the thing I was sent here to change.", expr: 'stern' } ] }
      ]},
      { say: "So. I\u2019ll come back at closing and ask you plainly what you\u2019ve been sweetening with tonight, and you will tell me, and I will write it in this book.", expr: 'neutral' },
      { say: "You haven\u2019t poured a cup yet. That means every one you pour from here is a thing you chose knowing I would ask. I find people appreciate the warning. They don\u2019t always thank me for it.", expr: 'thoughtful' }
    ],
    exit: [
      { narrate: 'He closes the ledger, tucks it under his arm, and goes back out into the rain without ordering anything.' }
    ],
    journal: { title: 'Mr. Aldis Pym \u2014 first visit',
      text: 'Came in only to introduce himself and to say he will ask at closing what we have been sweetening with. Notes that every barrel in the port is sworn to be British when the British islands do not grow that much cane. Gave us the rest of the evening to decide what to say.' }
  },

  patience_return: {
    enter: [
      { narrate: 'She comes back in with her gloves already off, which she didn’t manage the first time.' },
      { say: "I have been home. I have spoken to my father.", expr: 'neutral' },
      { choose: [
        { label: '"How did it go?"',
          then: [ { say: "Badly, and then not as badly as I expected, and then badly again at the end.", expr: 'thoughtful' } ] },
        { label: '"You told him."',
          then: [ { say: "I told him. I had got all the way to the door twice before I managed it.", expr: 'worried' } ] },
        { label: '"You look different."',
          then: [ { say: "Do I? I have been told tonight that I look a lot of things.", expr: 'warm' } ] }
      ]}
    ],
    talk: [
      { say: "He didn’t forbid me. I had my whole answer ready for being forbidden and he wouldn’t do it.", expr: 'surprised' },
      { say: "He said: do as you think right, and understand what it will cost this house, and don’t pretend afterwards that you didn’t know.", expr: 'downcast' },
      { choose: [
        { label: '"That’s worse than forbidding you."',
          then: [ { say: "It’s *much* worse. He handed me the whole weight of it and went to bed.", expr: 'downcast' } ] },
        { label: '"He gave you the choice."',
          then: [ { say: "He gave me the choice and the bill for it in the same breath. My father is a merchant to his bones.", expr: 'thoughtful' } ] }
      ]},
      { say: "So I sat in the hall and thought about the sugar, and the customs men, and what a name gets worth in this town, and how quickly it stops being worth it.", expr: 'neutral' },
      { say: "And I’m going on Thursday.", expr: 'bright' },
      { choose: [
        { label: '"You’re certain?"',
          then: [ { say: "No. But I have stopped waiting to be, and that turns out to be a different thing and quite enough.", expr: 'warm' } ] },
        { label: '"Good."',
          then: [ { say: "You’re the first person to say so without adding a condition to it. Thank you.", expr: 'warm' } ] }
      ]},
      { say: "I came here first because there was nowhere else where I could say it and not be argued with. I’m not sure what that makes this room, but I’m glad it exists.", expr: 'warm' }
    ],
    exit: [
      { narrate: 'She pauses at the door.' },
      { say: "If it goes badly, I’ll come and tell you that too. Good night.", expr: 'warm' }
    ],
    journal: { title: 'Patience Marsh, again',
      text: 'Told her father. He refused to forbid her, and instead handed her the decision along with an itemized account of what it would cost the family business — a merchant’s way of applying pressure. She’s going anyway. The Awakening and the trade collide inside one household, and she’s the one standing where they meet.' }
  }

  };

  global.Scenes = SCENES;

})(window);
