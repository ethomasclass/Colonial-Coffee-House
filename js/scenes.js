/* ===========================================================================
   scenes.js — the evening's six conversations.

   Rules, held to throughout:
     1. Every choice is a TONE FORK. No branch is wrong; branches differ in
        how fast a patron opens up and how much they volunteer.
     2. Teaching arrives because the PLAYER asked. No patron recites facts at
        an unprompted student.
     3. Real events are named; invented people say the words. Whitefield's
        1740 sermon on the Common is history. Everyone in this room is not.

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
     1 — EZRA HALE, a young cooper, lately awakened
     Thread: the Great Awakening's emotional, levelling side.
     ===================================================================== */
  convert: {
    enter: [
      { narrate: 'The door bangs. A young man comes in out of the rain, hat in hand, and does not sit so much as land.' },
      { say: "Evening. Evening. Is it — am I too late? I saw the light.", expr: 'surprised' },
      { choose: [
        { label: '"Never too late. Sit down before you fall down."',
          then: [ { say: "Thank you. I have walked from Roxbury and I did not much notice doing it.", expr: 'bright' } ] },
        { label: '"You are soaked through, friend."',
          then: [ { say: "Am I? — So I am. I had not noticed that either.", expr: 'surprised' } ] },
        { label: '"You look like a man who has had news."',
          then: [ { say: "News. Yes. Not news of the world, though. News of myself, if that makes any sense at all.", expr: 'bright' } ] }
      ]}
    ],
    react: {
      matched: [ { say: "That is the thing exactly. Plain and strong and no fuss about it.", expr: 'bright' } ],
      near: [ { say: "It will serve. My thanks.", expr: 'warm' } ],
      mismatched: [ { say: "That is — very fine. Finer than I asked for.", expr: 'worried' },
                    { narrate: 'He drinks it anyway, a little embarrassed by the cup.' } ]
    },
    talk: [
      { say: "I have been three days at meetings. Three. My master will have my hide for the barrels I have not made.", expr: 'neutral' },
      { choose: [
        { label: '"What sort of meetings?"',
          then: [ { say: "A preacher come through — not our settled minister, mind, but a travelling man. An {{itinerant|itinerant}}. He preaches wherever a field or a borrowed pulpit will have him.", expr: 'warm' } ] },
        { label: '"Three days is a long while to sit and listen."',
          then: [ { say: "You do not sit. That is the whole of it. Our own minister reads calm from a paper of a Sunday and you sit. This man shouted. He wept. Nobody sat.", expr: 'bright' } ] },
        { label: '"Your master will forgive you or he will not."',
          then: [ { say: "He will not. But I find I mind it less than I did a week ago, which frightens me somewhat.", expr: 'thoughtful' } ] }
      ]},
      { say: "He asked us — each of us, one by one, near enough — whether we knew we were saved. Not hoped. Not reckoned. {{newbirth|Knew}}. And I could not answer him. Then in his second hour I found I could.", expr: 'warm' },
      { choose: [
        { label: '"And what does your minister say to that?"',
          then: [
            { say: "He says it is {{enthusiasm|enthusiasm}}. He means it badly — he means a man claiming God spoke to him direct, with no learning and no ordination and no leave from anybody.", expr: 'worried' },
            { say: "Perhaps he is right to worry. I am a cooper. I have no Latin. And yet I stood in a field last Tuesday and I was certain of something he has studied forty years to be careful about.", expr: 'thoughtful' } ] },
        { label: '"Who else was standing in that field?"',
          then: [
            { say: "Everybody. That is what I cannot get past. Servants. Women speaking out loud, and not quietly either. A Black man from the Neck who prayed as well as any minister I ever heard, and I do not say that lightly.", expr: 'surprised' },
            { say: "And nobody stopped him. In a field, with nobody's pulpit to defend, nobody stopped him.", expr: 'thoughtful' } ] },
        { label: '"Careful who you say that to."',
          then: [ { say: "I know it. Whole congregations have broke in half over less — the one part calling themselves {{newlight|New Light}}, the other holding to the old order. Ours has not broke yet. Give it a month.", expr: 'worried' } ] }
      ]},
      { say: "Mr. Whitefield stood on the Common last autumn and twenty thousand people came. Twenty thousand. There are not twenty thousand people in Boston.", expr: 'bright' },
      { say: "They came in from everywhere. That is what the ministers have not reckoned with, I think. Not the shouting. The walking.", expr: 'thoughtful' }
    ],
    exit: [
      { say: "I must go before I am missed worse than I am already. Thank you for the cup, and for not laughing at me.", expr: 'warm' },
      { narrate: 'He puts his wet hat back on and goes out into it.' }
    ],
    journal: { title: 'Ezra Hale, cooper',
      text: 'Walked in from Roxbury after three days of revival meetings. Heard an itinerant preacher; describes a sudden "new birth." Notes that in the field, servants, women, and a Black man all spoke — and no one stopped them. His own minister calls it "enthusiasm."' }
  },

  /* =====================================================================
     2 — REV. SAMUEL THORNE, settled minister, an Old Light
     Thread: the revival's opposition, and the case for reason and order.
     ===================================================================== */
  minister: {
    enter: [
      { narrate: 'An older man in black comes in without hurry, shakes out his cloak, and takes the same seat he always takes.' },
      { say: "Good evening. A foul night, and it will be a fouler week.", expr: 'stern' },
      { choose: [
        { label: '"Trouble in the parish, Reverend?"',
          then: [ { say: "Trouble in every parish between here and Connecticut. Mine is merely the one I am answerable for.", expr: 'stern' } ] },
        { label: '"The usual, sir?"',
          then: [ { say: "The usual. It is a comfort to have one thing this month go as it always has.", expr: 'thoughtful' } ] },
        { label: '"You look tired."',
          then: [ { say: "I am sixty-one and I have spent the day writing a letter I did not wish to write. Yes. I look tired.", expr: 'downcast' } ] }
      ]}
    ],
    react: {
      matched: [ { say: "Thank you. Precisely so. There is a great deal to be said for a thing done the way it is properly done.", expr: 'warm' } ],
      near: [ { say: "Near enough. I shall not make a sermon of it.", expr: 'neutral' } ],
      mismatched: [ { say: "This is not what I asked for.", expr: 'stern' },
                    { narrate: 'He looks at the cup for a moment, then drinks it without further comment, which is somehow worse.' } ]
    },
    talk: [
      { say: "You will have had the young ones in here, I expect. Fresh from the fields, full of fire, wanting to tell you about it.", expr: 'thoughtful' },
      { choose: [
        { label: '"One or two. Is that so bad a thing?"',
          then: [ { say: "Bad? No. Not in itself. A man moved to seriousness about his soul is not a bad thing. It is what comes after that I have to sweep up.", expr: 'neutral' } ] },
        { label: '"You don\'t care for the revivals."',
          then: [ { say: "I do not care for what they leave behind. Let me be fair to them first, since nobody else will be.", expr: 'stern' } ] },
        { label: '"They seem sincere enough."',
          then: [ { say: "Sincerity is not the question. A man may be entirely sincere and entirely wrong, and be the more dangerous for the sincerity.", expr: 'stern' } ] }
      ]},
      { say: "Here is my objection, and it is not the one they say I have. I do not object to feeling. I object to feeling made the *proof* of a thing.", expr: 'neutral' },
      { choose: [
        { label: '"Explain that to a man who pours coffee."',
          then: [
            { say: "Gladly. If a man weeps, he knows he is saved. If he does not weep, he fears he is damned. Now — what has he learned? Nothing. He has only measured his own weather.", expr: 'thoughtful' },
            { say: "God gave us reason as well as hearts. A faith that cannot survive a cool morning is not a faith, it is a mood.", expr: 'neutral' } ] },
        { label: '"So you\'d have them think it through instead."',
          then: [
            { say: "I would have them *read*. There is a whole world of careful thinking come across the water in this last age — men reasoning out the order of the heavens, the working of the mind, the just powers of a government.", expr: 'warm' },
            { say: "It is a good age to be a thinking Christian. It is a poor age to be a shouting one.", expr: 'stern' } ] },
        { label: '"What did the letter say? The one you didn\'t want to write."',
          then: [
            { say: "That a travelling preacher is not to have my pulpit. He asked. I refused. Fourteen of my congregation have written to say they will hear him regardless, in a field, like Israelites.", expr: 'downcast' },
            { say: "They are not wicked people. That is the difficulty. I have baptised most of them.", expr: 'downcast' } ] }
      ]},
      { say: "They call us {{oldlight|Old Lights}}, as though we had let a lamp go out. What we have is order. A settled minister, a settled congregation, a covenant that holds.", expr: 'stern' },
      { say: "Take that away and what is left? Every man his own church. Every woman her own preacher. Every apprentice certain that God has told him something his master has not heard.", expr: 'worried' },
      { narrate: 'He turns the cup around on the counter without drinking from it.' },
      { say: "I may be wrong. I have written a great deal in my life about how carefully a man ought to hold that possibility. It is harder to practise than to write.", expr: 'thoughtful' }
    ],
    exit: [
      { say: "Good night. Keep the fire up — you will have more of them in before you close, and they will all want to talk.", expr: 'warm' }
    ],
    journal: { title: 'Rev. Samuel Thorne, Old Light',
      text: 'Objects to the revivals not for their feeling but for treating feeling as proof. Wants reason held alongside faith, and points to the new philosophy coming across the Atlantic. Fears that if every person becomes their own authority, the settled church cannot hold. Refused an itinerant his pulpit; fourteen of his congregation will go hear him anyway.' }
  },

  /* =====================================================================
     3 — CATO BELL, printer's apprentice
     Thread: the Enlightenment, print culture, and one honest beat about
     what the word "liberty" was sitting next to in 1741.
     ===================================================================== */
  reader: {
    enter: [
      { narrate: 'A young man in a green coat takes the corner seat, sets down a book with a scrap of paper marking his place, and does not open it immediately.' },
      { say: "Evening. I will not be any trouble — I only want somewhere with a candle that is not the shop.", expr: 'warm' },
      { choose: [
        { label: '"Stay as long as you like."',
          then: [ { say: "That is generous. I will hold you to a good hour of it.", expr: 'warm' } ] },
        { label: '"What have you got there?"',
          then: [ { say: "Something I ought to have shelved this afternoon and did not. I will confess that much and no more.", expr: 'bright' } ] },
        { label: '"Long day at the press?"',
          then: [ { say: "Every day is a long day at the press. Ink does not care what hour it is.", expr: 'neutral' } ] }
      ]}
    ],
    react: {
      matched: [ { say: "That is well done. It will still be drinkable in an hour, which is the whole of what I wanted.", expr: 'warm' } ],
      near: [ { say: "Thank you kindly.", expr: 'neutral' } ],
      mismatched: [ { say: "Ah — that will want drinking quickly.", expr: 'worried' },
                    { narrate: 'He glances at his book, then at the cup, plainly calculating.' } ]
    },
    talk: [
      { choose: [
        { label: '"Go on then. What is it?"',
          then: [ { say: "{{lockeref|Locke}}. An essay on the understanding — on how a mind comes to know anything at all. It came off a ship from London and Mr. Fleet has not sold it yet, so it is mine at night.", expr: 'bright' } ] },
        { label: '"Does your master know you read the stock?"',
          then: [ { say: "My master taught me my letters so I could set type. He did not think through what else letters are good for. I have not raised it with him.", expr: 'bright' } ] },
        { label: '"Sounds like heavy going."',
          then: [ { say: "It is. I have read the same twelve pages four times. But it is heavy the way a load is heavy, not the way a stone is.", expr: 'thoughtful' } ] }
      ]},
      { say: "His argument is that we come into the world knowing nothing whatever. No ideas set in us beforehand. Everything we have, we got — from what we saw, and heard, and were told.", expr: 'warm' },
      { choose: [
        { label: '"That seems obvious enough."',
          then: [
            { say: "It is not obvious at all, and I will tell you why. If nothing is written in us at birth, then no man is born knowing more than another. And no man is born fit to rule another.", expr: 'bright' },
            { say: "That is not a small thing to print. That is a very large thing to print.", expr: 'thoughtful' } ] },
        { label: '"Who else is reading this?"',
          then: [
            { say: "In Boston? More than you would think. That is what the press is for. A thing printed in London in the spring is argued over in a Boston coffee house by autumn.", expr: 'warm' },
            { say: "We do not have a university full of philosophers. We have newspapers, almanacs, and rooms like this one. It turns out that is enough.", expr: 'bright' } ] },
        { label: '"What do you make of it yourself?"',
          then: [
            { say: "I make of it that a man ought to be able to say what follows from a thing, and have the saying of it count for something.", expr: 'thoughtful' } ] }
      ]},
      { narrate: 'He turns the book over, considering whether to say the next part.' },
      { say: "I will tell you what I keep catching on. These gentlemen write a great deal about liberty. Natural rights. Consent. Government by agreement of the governed.", expr: 'neutral' },
      { choose: [
        { label: '"And?"',
          then: [ { say: "And several of them own shares in the {{triangle|trade}}. There are men in this town who will quote you Locke on the rights of man before dinner and sign for a cargo after it. I am free. Not everyone I know is.", expr: 'stern' } ] },
        { label: '"You sound like you have an objection."',
          then: [ { say: "Not an objection. A note. I set type for a living — I notice when a word is used carefully and when it is used loosely. Liberty gets used both ways in the same paragraph, sometimes.", expr: 'stern' } ] }
      ]},
      { say: "Still. It is a better argument than they mean it to be. That is the useful thing about printing something. Once it is set, anyone at all can read it.", expr: 'thoughtful' }
    ],
    exit: [
      { say: "The candle is going. I had better go with it. Good night — and thank you for the corner.", expr: 'warm' }
    ],
    journal: { title: 'Cato Bell, apprentice printer',
      text: "Reading Locke after hours. Follows the argument to its edge: if nothing is written in us at birth, no one is born fit to rule another. Notes that men in Boston quote liberty and sign for cargoes in the same day. Sees the press — newspapers, almanacs, coffee houses — as how ideas cross the ocean and get argued." }
  },

  /* =====================================================================
     4 — CAPT. JONAS BRIGHT, master of the sloop Dolphin
     Thread: the Molasses Act, smuggling, salutary neglect — and the one
     honest line about whose labour is in the barrel.
     ===================================================================== */
  captain: {
    enter: [
      { narrate: 'A broad man in a wet tricorn drops onto the stool hard enough to move it, and sighs like a man setting down something heavy.' },
      { say: "You are open. Good. I would have knocked otherwise, and I would not have knocked politely.", expr: 'neutral' },
      { choose: [
        { label: '"Rough crossing?"',
          then: [ { say: "Rough enough. Four days from the Islands and every one of them wet.", expr: 'stern' } ] },
        { label: '"The Dolphin came in today, I saw."',
          then: [ { say: "You and everyone else with eyes. That is rather the trouble with a harbour.", expr: 'thoughtful' } ] },
        { label: '"Sit. You look like the sea chewed you."',
          then: [ { say: "Ha. It did, and it spat me out on Long Wharf at four this afternoon.", expr: 'warm' } ] }
      ]}
    ],
    react: {
      matched: [ { say: "*That* is a drink. None of your London manners in that cup. My thanks.", expr: 'bright' } ],
      near: [ { say: "Aye, that will do me.", expr: 'warm' } ],
      mismatched: [ { say: "What is this, a christening?", expr: 'surprised' },
                    { narrate: 'He drinks it in three swallows, apparently to get it over with.' } ]
    },
    talk: [
      { say: "You will have read the paper. Entered in — the sloop Dolphin, Bright master, from the Islands, with molasses and salt.", expr: 'neutral' },
      { choose: [
        { label: '"Which islands?"',
          then: [ { say: "Now that is the question, is it not. That is *the* question.", expr: 'thoughtful' },
                  { say: "The paper says the Islands. The paper is a very restful thing to read.", expr: 'warm' } ] },
        { label: '"Good cargo?"',
          then: [ { say: "Cheap cargo. Which is the same as a good one, if you are the man buying.", expr: 'warm' } ] },
        { label: '"You don\'t look like a man who just made money."',
          then: [ { say: "I made money. I am wondering how long I shall be let keep making it. There is a new man at the Customs.", expr: 'worried' } ] }
      ]},
      { say: "Here is the law, since you are pouring and I am talking. There is an {{molassesact|Act of 1733}}. Sixpence the gallon on any molasses not grown in a British island. Sixpence.", expr: 'neutral' },
      { choose: [
        { label: '"And do you pay it?"',
          then: [
            { say: "Does the tide pay it? Nobody pays it. If we paid it there would be no rum made in Massachusetts, and if there is no rum made in Massachusetts there is no Massachusetts worth the name.", expr: 'stern' },
            { say: "Sixty distilleries in this colony. Sixty. Not one of them could stand a sixpence.", expr: 'stern' } ] },
        { label: '"Why is the law there at all?"',
          then: [
            { say: "To please the sugar planters in Barbados and Antigua, who have friends in Parliament and cannot sell their molasses so cheap as the French can. It was never about revenue. It was about *them*.", expr: 'stern' },
            { say: "So Parliament wrote it, and then Parliament looked out the window for eight years. That suits me down to the deck.", expr: 'thoughtful' } ] },
        { label: '"So the French sell cheaper."',
          then: [
            { say: "Half the price and better besides. The French will not let their islands distil rum — it would spoil their brandy trade at home — so their molasses is near worthless to them and gold to us.", expr: 'warm' } ] }
      ]},
      { say: "Eight years that Act has stood and it has never once been kept. That is not an accident. That is a bargain nobody wrote down. They leave us be, and we stay loyal, and everybody eats.", expr: 'neutral' },
      { choose: [
        { label: '"What happens if they stop leaving you be?"',
          then: [ { say: "Then we find out what the bargain was actually worth. I would rather not. I have a daughter in Charlestown and a sloop with a bad mast.", expr: 'worried' } ] },
        { label: '"Doesn\'t it trouble you? Breaking a law that plainly?"',
          then: [ { say: "It troubles me the way weather troubles me. It is there, it is not reasonable, and I sail in it.", expr: 'thoughtful' } ] }
      ]},
      { narrate: 'He looks into the cup for longer than the answer needs.' },
      { say: "I will say one thing more and then I will stop, because it is not a thing I care to dwell on. That molasses is boiled off sugar cane. Somebody cut that cane. They did not choose the work and they are not paid for it, and I have seen the fields, and I know what I am carrying.", expr: 'downcast' },
      { say: "The whole of it runs on that. The rum, the profit, this argument about sixpence — all of it sits on top of that, and everybody in this town knows, and nobody says.", expr: 'downcast' },
      { say: "Well. I have said it. Now I shall go to bed.", expr: 'neutral' }
    ],
    exit: [
      { say: "If a customs man comes in asking questions, you never met me and the Dolphin sails on Thursday. Good night to you.", expr: 'warm' }
    ],
    journal: { title: 'Capt. Jonas Bright, sloop Dolphin',
      text: 'Landed molasses from the French islands and reported it vaguely. Explains the Molasses Act of 1733 — sixpence a gallon on foreign molasses — and says flatly that nobody pays it, because sixty Massachusetts distilleries could not survive it. Calls the eight years of non-enforcement "a bargain nobody wrote down." Says plainly that the whole trade rests on the labour of enslaved people cutting cane.' }
  },

  /* =====================================================================
     5 — PATIENCE MARSH
     Thread: the Awakening and the trade, carried by one person.
     ===================================================================== */
  patience: {
    enter: [
      { narrate: 'A young woman comes in near closing, sits at the counter, and does not take her gloves off right away.' },
      { say: "Good evening. Forgive me — I don't usually call so late.", expr: 'neutral' },
      { choose: [
        { label: '"You\'re welcome any hour. Rough day?"',
          then: [ { say: "Rough is one word for it. I've had rather a lot of days like that, of late.", expr: 'downcast' } ] },
        { label: '"No trouble at all. What can I make you?"',
          then: [ { say: "Something to settle me, if you please. I've had rather a lot of days like that, of late.", expr: 'neutral' } ] },
        { label: '"You look like a woman with something on her mind."',
          then: [ { narrate: 'She notices that you noticed.' },
                  { say: "...I suppose I do. I had hoped I was carrying it better than that.", expr: 'worried' } ] }
      ]}
    ],
    react: {
      matched: [ { narrate: 'She wraps both hands around it before she drinks, and something in her shoulders comes down an inch.' },
                 { say: "Oh — that is exactly right. Thank you.", expr: 'warm' } ],
      near: [ { say: "Thank you. That is kind.", expr: 'warm' } ],
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
      { say: "Do you think the Lord minds *who* speaks His truth? Or only *that* it's spoken?", expr: 'thoughtful' },
      { choose: [
        { label: '"That depends. What\'s happened?"',
          then: [ { say: "A great deal, in three weeks. I hardly know where it starts.", expr: 'worried' } ] },
        { label: '"That sounds like a question for your minister."',
          then: [ { say: "It is. That is rather the difficulty with asking it.", expr: 'downcast' } ] },
        { label: '"Start from the beginning — what happened at this meeting of yours?"',
          then: [ { say: "You have heard something, then. Boston is a small town wearing a large hat.", expr: 'surprised' } ] }
      ]},
      { say: "Three weeks past I went — half out of curiosity, half because my cousin near begged me — to hear a preacher passing through. Not settled here, mind, but {{itinerant|itinerant}}. He travels, and preaches wherever a pulpit or a field will have him.", expr: 'neutral' },
      { say: "Much in the fashion of Mr. Whitefield, who stood upon the Common last year and, they say, was heard by near twenty thousand souls at once. I did not go for him. I went for one of the men who follow after him now, carrying the same fire to smaller congregations.", expr: 'neutral' },
      { say: "He did not read calmly from a page as our own Reverend does of a Sunday. He *shouted*. He wept. He asked each of us, plainly, whether we knew — truly knew, in our hearts, not merely recited — that we were saved.", expr: 'warm' },
      { say: "And I found I could not answer him. And then, somewhere in his second hour, I found that I could. That is what they call being awakened. A {{newbirth|New Birth}}, they say — sudden and complete, and not the slow quiet faith my father's generation was raised on.", expr: 'bright' },
      { choose: [
        { label: '"That doesn\'t sound like something you\'d apologise for."',
          then: [ { say: "I hadn't thought of it as needing an apology — until I imagined saying it aloud to him.", expr: 'downcast' } ] },
        { label: '"Your father\'s generation. He doesn\'t approve, then?"',
          then: [ { say: "He does not. He has been very clear, and very quiet about it, which is worse.", expr: 'worried' } ] },
        { label: '"Is that why you were asked to speak on Thursday?"',
          then: [ { say: "You *have* heard something. Yes. That is exactly why.", expr: 'surprised' } ] }
      ]},
      { say: "Ministers who welcome men like the one I heard, he calls {{newlight|New Light}} — as though they had found some fresh flame the rest of us lack. His own minister, and most of the settled clergy in this city, are what they call {{oldlight|Old Light}}. They think the shouting and the weeping is disorder dressed as piety, and dangerous besides.", expr: 'neutral' },
      { say: "Whole congregations have split over less. And now I have been asked to {{testify|testify}} — to stand and speak of what happened in me, before a room of women. Part of me wonders whether the Old Lights are not a little right to be uneasy. I mean to do it anyway.", expr: 'thoughtful' },
      { choose: [
        { label: '"Why would that frighten your father particularly?"',
          then: [
            { say: "Because my father is a merchant, and a merchant is only as good as what people are willing to assume about him.", expr: 'worried' },
            { say: "He deals with English houses and with customs men both. He cannot afford to be thought careless in *anything* just now — least of all in his own household.", expr: 'worried' } ] },
        { label: '"It\'s only a prayer meeting. Surely that\'s no risk to him."',
          then: [
            { say: "You would think so. But a daughter's name spoken of as an enthusiast travels further than a daughter does.", expr: 'downcast' },
            { say: "And my father has other reasons to want quiet just now, which have nothing to do with God at all.", expr: 'worried' } ] }
      ]},
      { choose: [
        { label: '"What other reasons?"',
          then: [
            { say: "Our molasses and sugar are what they call {{enumerated|enumerated goods}}. By law they may go nowhere by ship but through England first, and pay a duty besides, for the privilege of the detour.", expr: 'neutral' },
            { say: "Half the captains in this harbour find a friendly customs officer and a quiet cove instead, and call it simply good business.", expr: 'thoughtful' } ] },
        { label: '"Trouble with the business?"',
          then: [
            { say: "Not trouble. *Arrangement*. There is a great deal of arrangement in the shipping of sugar.", expr: 'thoughtful' },
            { say: "What the law says and what the harbour does have not been on speaking terms for some years now.", expr: 'neutral' } ] }
      ]},
      { choose: [
        { label: '"And your father — which is he? Law, or harbour?"',
          then: [
            { say: "My father is very careful never to ask his partners too many questions about where their molasses truly came from.", expr: 'downcast' },
            { narrate: 'She says this flatly, the way you say a thing you have decided not to think about.' },
            { say: "That is its own kind of answer, I suppose. I had not thought of it as one until just now.", expr: 'worried' } ] },
        { label: '"That sounds like it could fall on him hard one day."',
          then: [
            { say: "It could. And the way it would fall is not by his being caught — it is by his being *noticed*. A man is safe in that harbour until somebody has a reason to look at him.", expr: 'worried' },
            { say: "And I have been asked to stand up in a room and speak.", expr: 'downcast' } ] }
      ]},
      { choose: [
        { label: '"Then it sounds like you already know what you\'re going to do."',
          then: [ { say: "...I think I might. I have been hoping somebody would tell me not to, and nobody has, and I find I am relieved.", expr: 'warm' } ] },
        { label: '"You don\'t owe anyone an apology for what you felt."',
          then: [ { say: "No. I don't. It is a strange thing to be told, and I think I needed telling.", expr: 'warm' } ] },
        { label: '"What will you say to them, on Thursday?"',
          then: [
            { narrate: 'She looks at the counter and half-rehearses it, quietly, as if to herself.' },
            { say: "\"I went out of curiosity. I came back not able to say I was the same. I do not have learning and I do not have authority, and I was not asked whether I had either. I was only asked whether I knew.\"", expr: 'thoughtful' },
            { say: "...Something like that. It sounds thinner out loud than it does in my head.", expr: 'warm' } ] }
      ]}
    ],
    exit: [
      { say: "I don't know entirely what Thursday will bring. But I am glad to have said it aloud somewhere first, before I say it there.", expr: 'warm' },
      { say: "Good night — and thank you, truly.", expr: 'warm' },
      { narrate: 'She pulls her gloves back on at the door, which she had forgotten she was still holding.' }
    ],
    journal: { title: 'Patience Marsh, merchant\'s daughter',
      text: 'Awakened three weeks ago by a travelling preacher; asked to testify before a women\'s prayer meeting on Thursday. Her father forbids it — not on doctrine, but because his shipping business depends on English houses and customs men not looking too closely at him. Says he is "careful never to ask his partners where their molasses truly came from." Both threads of the evening run through this one household.' }
  },

  /* =====================================================================
     6 — MR. ALDIS PYM, of His Majesty's Customs
     The convergence. What he says depends on what you have been doing.
     ===================================================================== */
  officer: {
    enter: [
      { narrate: 'The last customer of the night is a neat man in a red coat with a small ledger under his arm. He does not shake the rain off. He looks at the room first, and at you second.' },
      { say: "You keep late hours.", expr: 'neutral' },
      { choose: [
        { label: '"Boston keeps them for me, sir."',
          then: [ { say: "Boston keeps a great many things. Some of them I am here about.", expr: 'thoughtful' } ] },
        { label: '"We\'re just closing, sir."',
          then: [ { say: "Then I am fortunate, and you are unfortunate, and we shall both be brief.", expr: 'neutral' } ] },
        { label: '"You\'re the new man at the Customs."',
          then: [ { say: "Aldis Pym. You are quicker than most of this street has been.", expr: 'warm' } ] }
      ]},
      { narrate: 'He sets the ledger on the counter, open, and does not look at it.' }
    ],
    react: {
      matched: [ { say: "Correctly made. Thank you. It is a small mercy to be served a thing properly in this town.", expr: 'warm' } ],
      near: [ { say: "Adequate.", expr: 'neutral' } ],
      mismatched: [ { say: "This is not what I asked for.", expr: 'stern' },
                    { narrate: 'He sets it down after one sip and does not touch it again.' } ]
    },
    talk: [
      { say: "I have been eleven days in this port. In eleven days I have read the entry books for the last two years.", expr: 'neutral' },
      { say: "Do you know what I found? Molasses. A very great deal of molasses, all of it, without exception, from British islands. Antigua. Barbados. St. Kitts.", expr: 'thoughtful' },
      { choose: [
        { label: '"That sounds lawful enough."',
          then: [ { say: "It is *perfectly* lawful. It is also impossible. Those islands do not produce so much molasses as this one port claims to have bought from them.", expr: 'stern' } ] },
        { label: '"You sound as though that\'s a problem."',
          then: [ { say: "The numbers do not add. Not by a little. By a multiple.", expr: 'stern' } ] },
        { label: '"What did you expect to find?"',
          then: [ { say: "Exactly what I found. I had merely hoped to be wrong.", expr: 'downcast' } ] }
      ]},
      { say: "So either the British islands have performed a miracle, or every entry in that book is a polite fiction that everyone — the master, the merchant, the officer who signed it, and the Crown — has agreed to accept.", expr: 'neutral' },
      { choose: [
        { label: '"Why has nobody minded before now?"',
          then: [
            { say: "Because minding is expensive and not minding is profitable, and London is six weeks away by sea.", expr: 'thoughtful' },
            { say: "There is a word for it that nobody uses to my face. They leave you be, you stay loyal, the ships keep moving. {{neglect|It has worked}}, in its way, for a very long time.", expr: 'neutral' } ] },
        { label: '"And you intend to mind."',
          then: [
            { say: "I intend to do the work I was sent to do. I am aware that makes me the villain of every table in this room.", expr: 'stern' },
            { say: "I did not write the {{molassesact|Act}}. I am merely the first man in eight years impolite enough to read it.", expr: 'neutral' } ] }
      ]},
      { narrate: 'He turns the ledger a quarter turn, so that it faces you.' },
      { say: "Which brings me to my question, and I would like a plain answer. What have you been sweetening with tonight?", expr: 'stern' },

      /* --- the convergence: what he finds depends on the whole evening --- */
      { if: 'heavyFrench', then: [
        { choose: [
          { label: '"French. All night. You know it and I know it."',
            then: [ { say: "I do know it. Thank you for not insulting me.", expr: 'neutral' },
                    { say: "I shall write down that this house was candid. It is worth less than you would like and more than nothing.", expr: 'thoughtful' } ] },
          { label: '"British, sir. All of it British."',
            then: [ { narrate: 'He looks at the price you have been charging, and then at the room, and then at you.' },
                    { say: "At your prices. On British molasses. In this port.", expr: 'stern' },
                    { say: "I will write down that you said so.", expr: 'stern' } ] },
          { label: '"Whatever I could afford, sir."',
            then: [ { say: "Yes. That is the true answer, and it is the answer I have had from every honest person in this town.", expr: 'downcast' },
                    { say: "It is also not a defence. That is the difficulty with all of this.", expr: 'neutral' } ] }
        ]},
        { say: "Understand my position. If I enforce this Act as written, I close the distilleries. If I close the distilleries, I close the port. If I close the port, I have ruined a loyal colony in the name of a law nobody has kept since it was written.", expr: 'worried' },
        { say: "And if I do not enforce it, then the law is a decoration, and every man here learns that a law from London is a thing you may look at and step over.", expr: 'stern' },
        { say: "I do not know which of those is worse. I have not slept well since I arrived.", expr: 'downcast' }
      ], else: [
        { choose: [
          { label: '"British molasses and loaf sugar, sir. Every cup."',
            then: [ { say: "So your books say. So, remarkably, does your shelf.", expr: 'surprised' },
                    { say: "You are the fourth house I have asked tonight and the first whose answer I believe.", expr: 'warm' } ] },
          { label: '"Whatever was lawful and whatever I could afford."',
            then: [ { say: "Those two things are at war in this town, and you seem to have let the first one win. That is rarer than it should be.", expr: 'warm' } ] }
        ]},
        { say: "You will not thank me for saying it, but I can see what it has cost you. Your prices are honest and your purse is thin, and every house on this street that lies to me is doing better than you tonight.", expr: 'thoughtful' },
        { say: "That is precisely the difficulty. A law that punishes the men who keep it is not yet a law. It is a wager on how long people will stay patient.", expr: 'worried' }
      ]},

      { say: "I shall be here some years, I expect. You will see a good deal of me.", expr: 'neutral' }
    ],
    exit: [
      { narrate: 'He closes the ledger, tucks it under his arm, and puts his hat back on at the door.' },
      { say: "Good night. Keep better books than your neighbours. It will matter sooner than you think.", expr: 'neutral' }
    ],
    journal: { title: "Mr. Aldis Pym, His Majesty's Customs",
      text: 'Read two years of entry books and found that Boston claims to import more British molasses than the British islands produce. Understands that enforcing the Molasses Act would close the port, and that not enforcing it teaches colonists that laws from London are optional. Cannot see a way through, and says so.' }
  }

  };

  global.Scenes = SCENES;

})(window);
