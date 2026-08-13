# The Green Dragon — Teaching Guide

A single-period visual novel set in a Boston coffee house on **Monday 14
September 1741**. Students keep the house for one evening and serve six
patrons whose conversations carry the Great Awakening, the Enlightenment, and
the Navigation and Molasses Acts.

**Audience:** high-school US survey, written for 10th grade.
**Length:** 50–58 minutes of play. Read the timing note before committing a
period to it.
**Requirements:** a browser. Works on Chromebooks and tablets. No install, no
accounts, no student data leaves the machine.

---

## 1. What it is actually teaching

The design principle throughout: **students should reach the concept by acting,
and only then be given its name.** Nothing in the game announces a thesis.

### The Great Awakening — carried by three people, not one

The revival is deliberately not presented as a movement students observe from
outside. They meet it as a disagreement between people they have both served.

- **Ezra Hale**, a young barrel-maker, converted a week ago. He is exhilarated
  and he cannot stop talking. His confession, if earned, is that **he is
  frightened it will wear off** — that Tuesday's certainty was already thinner
  by Wednesday.
- **Rev. Samuel Thorne**, the settled Old Light minister, is sixty-one and
  exhausted. His confession is that **he thinks he is losing** — and not the
  argument, which he can still win in a room of educated men.
- **Patience Marsh**, a merchant's daughter of twenty-one, means to stand and
  testify on Thursday. Her confession is not the one students expect: it is not
  her father she fears, it is **standing up and feeling nothing.**

Concepts reached: itinerant preaching, the **New Light / Old Light** split,
*New Birth*, **enthusiasm** as an eighteenth-century insult, congregations
splitting, and the reason the revivals alarmed authority — in a field there is
no pulpit to defend, so **servants, women and Black colonists could speak.**

### The Enlightenment — as something ordinary people did in rooms like this

**Cato Bell**, a printer's apprentice, is reading at the bar. The game routes
the Enlightenment through cheap print and coffee-house argument rather than
through European philosophers, because that is how it actually reached
colonists.

Concepts reached: reason and observation against inherited authority; Newton;
**Locke** on the mind at birth and on government resting on the consent of the
governed; and the inference students can draw themselves — *if nothing is
written in a person at birth, no one is born fit to rule another.*

### Mercantilism, and why laws go unenforced

**Capt. Jonas Bright** of the sloop *Dolphin* comes in soaked. **Mr. Aldis
Pym** of His Majesty's Customs always closes the night.

Concepts reached: the **Navigation Acts**; **enumerated goods** routed through
England so English merchants take a cut; the **Molasses Act of 1733** and why
it was written (British West Indian planters had friends in Parliament, and
could not match the French price); **smuggling** as ordinary commercial
practice; and **salutary neglect** — strict law, barely enforced, for so long
that colonists came to experience enforcement as an outrage rather than a
correction.

Bright's confession is that **Pym has already tried to turn him informer.**
Pym's confession is that **he asked to be posted somewhere else before he even
sailed**, because he had read the Boston entry books and could see what the job
was going to be.

### Two threads that run underneath

- **The money problem.** The colony cannot coin money, silver sails back to
  England, and the 1740 **Land Bank** was voided from London in 1741. The
  newspaper carries it; the country/merchant split is visible in who resents
  it.
- **Slavery.** Present and honest, and not central. The molasses that Boston's
  entire rum industry depends on is grown and cut by **enslaved people on
  Caribbean plantations**, and some of that rum was traded for more of them.
  The newspaper states this plainly in the story about how a barrel reaches
  Boston. No enslaved character appears as a device, and no scene asks students
  to role-play enslavement. **Read that story before you assign the game so you
  are not surprised by it in front of a class.**

---

## 2. The mechanic that does the real teaching

The sweetener shelf **is** the Molasses Act. Students meet it as arithmetic.

| Sweetener | Cost | Lawful? |
|---|---|---|
| French molasses | **1d** | **No** — duty unpaid under the Act of 1733 |
| British molasses | 4d | Yes |
| Loaf sugar | 6d | Yes |
| Honey | free | Yes — but only six servings exist |

**The purse opens at 3 shillings (36d). Rent is 5 shillings 6 pence (66d),
due tonight.**

These numbers are tuned, not arbitrary:

- A **flawless lawful night** clears rent by roughly a penny.
- An **ordinary lawful night** — one or two drinks slightly wrong — does not.
- **Smuggling clears it comfortably.**

That gap is the lesson. A student who reaches for the French molasses has
performed salutary neglect rather than been told about it, and the closing
screen only names the concept *after* they have already lived it. Using French
molasses also raises a suspicion count that the customs officer's closing scene
reads back to them.

**Expect this to be the moment worth teaching into.** The most productive
classroom conversation is usually not *was smuggling wrong* but *what does it
do to a law when nearly everyone breaks it and nearly no one is punished.*

---

## 3. Running it

### Before the period

1. Play the first two patrons yourself — about ten minutes. You need to have
   felt the order-as-a-riddle mechanic to help a stuck student.
2. Decide whether you are cutting scenes (see timing below).
3. Read the molasses story in the newspaper, for the slavery content.

### The period

| Minutes | |
|---|---|
| 0–5 | Set the scene. *You are not a soldier or a founder. You run a shop.* |
| 5–12 | Newspaper. **Insist they read it.** Everything else depends on it |
| 12–50 | The eight scenes |
| 50–58 | Closing ledger, and the confession count |

Students who finish early should be sent back into the shelf to find recipes —
32 exist and 14 are known at the start — or to click the objects in the room.

### Timing, honestly

The build runs **longer than one 50-minute period for a slow reader.** I have
not timed it with real students; do that before you commit a class to it.

To shorten, edit the `ORDER` array near the bottom of `js/data.js`:

```js
var ORDER = ['convert', 'reader', 'minister', 'patience', 'captain',
             'convert_return', 'patience_return', 'officer'];
```

Delete any entry and nothing breaks — ledger, journal, closing screen and
progress counter all follow this list. Dropping `'convert_return'` and
`'reader'` gets you to roughly 40 minutes. **Keep `'officer'` last.** His scene
reads back what the student did all evening; it is the payoff.

### Accessibility

- Text size in four steps, and text speed including *all at once*, under `Aa`.
  Both remembered between sessions.
- **Sound is off until a student turns it on.**
- The night saves automatically. A dead tab or a fire drill does not lose it.
- Advance with click, space, or enter. `Esc` closes any panel.
- No network calls at all after the page loads.

---

## 4. Answer key

Each patron's confession unlocks only on the drink that suits them.

| Patron | Wants | The drink |
|---|---|---|
| Ezra Hale | Bracing, plain, nothing fancy | **Black Coffee** |
| Cato Bell | Mild, won't go bitter over a long read | **Sweetened Bohea** |
| Rev. Thorne | As he always takes it — sugar and cream | **Bohea in the English Style** |
| Patience Marsh | Rich, warming, a little daring | **Spiced Chocolate** |
| Capt. Bright | Warm, sweet, honest, no London manners | **Switchel** |
| Mr. Pym | Bohea, sugar, cream | **Bohea in the English Style** |

Patience's Spiced Chocolate is deliberately **not** in the starting fourteen —
her scene is the centre of the evening, and the discovery is meant to be
earned. Every other answer is already in the book on page one.

**Do not hand this list out.** The whole design depends on students reading a
person and inferring a drink. It is here so you can rescue a student who has
stalled, and so you can tell at a glance whose confession a student missed.

---

## 5. Discussion and assessment

### Immediately after play — five minutes, whole class

1. **Who did you believe?** Ezra or Thorne? (Almost nobody picks Thorne, and
   the reasons why are worth pulling on.)
2. **Did you make rent? What did you have to do?** Take a show of hands on who
   used French molasses. Then ask what it would take to make an honest keeper
   go under.
3. **Whose confession did you miss?** Different tables missed different ones.
   This is the fastest route into *what did that person actually want.*

### Written prompts

- Thorne says he is losing "the thing underneath" the argument. **What is the
  thing underneath?** Use the newspaper's account of why the revivals alarmed
  the settled clergy.
- Pym asked to be posted anywhere else before he ever reached Boston. **What
  had he read in the entry books that told him what the job would be?** What
  does that say about how the trade laws actually functioned?
- The Molasses Act stood for eight years and was almost never collected.
  **Explain salutary neglect using your own evening's ledger as the evidence.**
- Cato reaches an argument about who is fit to rule from a claim about what is
  written in a person at birth. **Reconstruct the steps.**
- Patience is afraid of standing up and feeling nothing. **Why does the
  Awakening give a young woman a chance to stand up at all**, and why did that
  alarm people?

### What a good answer looks like

Students who have played well will reach for **the specific** — a price, a
sentence somebody said, the state of their own purse — rather than for
abstractions. Reward that. The game is built so that "I couldn't make rent
without the French molasses" is available as evidence.

---

## 6. Standards

Content maps to the **colonial society and culture** and **transatlantic
trade** portions of the pre-1754 period in most US survey sequences — in APUSH
terms, Period 2. Specifically: the Great Awakening, the Enlightenment in the
colonies, mercantilism and the Navigation Acts, the Atlantic economy, and
slavery's role in Caribbean sugar production.

For inquiry frameworks, the game is a **source-and-inference** activity rather
than a lecture substitute: students take evidence from a period newspaper and
from testimony, and use it to explain an economic and religious situation.

State frameworks vary and change. Map the content above to your own codes
rather than trusting a list here.

---

## 7. What this does *not* cover

Worth knowing before you plan around it:

- **No Revolution.** Deliberately. It is 1741; the boycotts are a generation
  away and no character anticipates them. Tea is uncontroversial here, which
  is itself worth pointing out to students who arrive expecting Boston Tea
  Party.
- **No Native American history.** The threads chosen do not touch it, and
  gesturing at it in one line would be worse than leaving it out.
- **Slavery is present but not examined in depth.** The Caribbean sugar
  economy is stated plainly and repeatedly; the lived experience of enslaved
  people is not portrayed. Do not use this as your slavery lesson.
- **No assessment is built in.** The closing ledger is laid out to be copied
  onto paper, but the worksheet itself does not exist yet.

---

## 8. Content notes

- **No alcohol is served.** Rum is discussed constantly as the colony's
  industry — it is the whole reason molasses matters — but nothing alcoholic
  can be made or served in the game.
- **No fail state, no scoring, no timer.** A student cannot be embarrassed by
  it in front of the class.
- Slavery is named as the foundation of the sugar trade, in the newspaper and
  in the glossary term *the trade*.
- Religious disagreement is portrayed with sympathy on both sides. Thorne is
  not a villain and the game does not let him be one.
