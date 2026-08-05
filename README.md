# The Green Dragon — A Coffee House in Boston, 1741

A *Coffee Talk*–style visual novel for one class period. Students keep the
Green Dragon on Union Street for a single evening in September 1741, brewing
period drinks for six patrons whose conversations carry the Great Awakening,
the Enlightenment, and the Navigation and Molasses Acts.

No install, no accounts, no student data collected. It is a folder of static
files — open `index.html` and it runs.

---

## Running it

**Locally:** double-click `index.html`. It is deliberately built with plain
scripts rather than ES modules so it works straight off the filesystem, with no
web server and no build step.

**For a class:** push this repo and turn on GitHub Pages (Settings → Pages →
deploy from branch, root). Students get one URL. It works on Chromebooks,
iPads, and anything else with a browser.

---

## What's in the box

| | |
|---|---|
| **Setting** | Boston, Monday 14 September 1741 |
| **Length** | ~45–50 minutes: paper, six patrons, closing ledger |
| **Reading level** | High school US survey. Modernised spelling; period vocabulary is glossed in-game |
| **Drinks** | 32 recipes, all period-accurate, **none alcoholic** |
| **Fail state** | None. Every cup is accepted and paid for |

### The loop

1. **Read the morning *Boston Gazette*.** Five items. This is where the
   background history is planted, and one patron's order can only be worked out
   if the student actually read it.
2. **Six patrons, one at a time.** Each gives an order as a *mood*, not a menu
   item. The student picks a base, a sweetener, and one thing more.
3. **The conversation.** Every dialogue choice is a tone fork — no branch is
   wrong, they differ in how much the patron volunteers. Serving a cup that
   suits them opens them up; a cup that doesn't still gets drunk, just
   awkwardly.
4. **The closing ledger.** Every drink, what it cost, what it fetched, and
   whether rent got paid. Designed to be read off the screen while filling in a
   paper worksheet.

### The mechanic that does the teaching

The sweetener shelf is the entire Molasses Act:

| | Cost | Lawful? |
|---|---|---|
| French molasses | 1d | **No** — duty unpaid under the Act of 1733 |
| British molasses | 4d | Yes |
| Loaf sugar | 6d | Yes |
| Honey | free | Yes, but only six servings exist |

Rent is 5s 6d and the purse opens at 3s. A **flawless** lawful night clears
rent by one penny; an ordinary lawful night does not; smuggling clears it
comfortably. Students discover *salutary neglect* by running the numbers, not
by being told — and the closing screen only names the concept after they have
already lived it.

---

## The cast

| Patron | Carries |
|---|---|
| **Ezra Hale**, a cooper | The Awakening's emotional, levelling side — and who got to speak in the field |
| **Rev. Samuel Thorne**, Old Light | The case against the revivals, and for reason and order |
| **Cato Bell**, printer's apprentice | The Enlightenment, print culture, Locke — and one honest note on what "liberty" was sitting next to |
| **Capt. Jonas Bright** | The Molasses Act, smuggling, and whose labour is actually in the barrel |
| **Patience Marsh** | Both threads at once: awakened, asked to testify, and daughter to a merchant who cannot afford to be noticed |
| **Mr. Aldis Pym**, Customs | The convergence — his scene changes based on what the student did all evening |

---

## Historical notes

**Real, and named as such:** Whitefield preaching to a crowd on Boston Common
in autumn 1740; the Molasses Act of 1733 and its sixpence-a-gallon duty on
foreign molasses; the Navigation Acts and enumerated goods; Parliament
dissolving the Massachusetts Land Bank in 1741; the Old Light / New Light
split; Massachusetts' rum-distilling industry and its dependence on French
molasses.

**Invented:** every person in the game. This is deliberate. Patience hears a
fictional itinerant "in Mr. Whitefield's fashion" rather than Whitefield
himself, so no invented words are ever put in a real person's mouth. The
*Boston Gazette* was a real paper; the five items in it were written for this
game in the manner of the period press, and the game says so on the page.

**Deliberate simplifications worth knowing before students ask:**

- The Green Dragon was a real brick tavern on Union Street in 1741. It did not
  become the Masonic lodge and "headquarters of the Revolution" until the
  1760s. Nothing in the game claims otherwise, but students who have heard of
  it may expect Revere.
- Prices are in Massachusetts pence and are tuned for playability. Real 1741
  Old Tenor currency was badly inflated and the arithmetic would be a mess.
- Rum is discussed constantly and never served. Molasses is the thing on the
  shelf; what it becomes after it leaves the counter is the whole reason the
  shelf is political.
- Slavery is present and honest rather than central, by design. It is named
  plainly by Capt. Bright, noted by Cato Bell, and defined in the glossary — but
  it is not the subject of the evening, and the game does not pretend to teach
  it properly. That needs its own lesson.

---

## Files

```
index.html        markup and all the panels
css/style.css     candlelight, pewter, dark wood
js/art.js         pixel renderer, the room, the shared character sheet
js/data.js        shelf, 32 recipes, cast, newspaper, glossary, ledger economics
js/scenes.js      the six conversations
js/game.js        state, dialogue player, brewing, closing ledger
```

To change the writing, edit `js/scenes.js` — it needs no knowledge of the rest.
To change the economics, edit the `LEDGER` block in `js/data.js`.

---

## Not built yet

- The paper worksheet. The closing ledger is laid out to be filled in from,
  but the worksheet itself does not exist.
- Character art is procedural pixel art generated in code. It is consistent and
  readable but it is not hand-drawn; swapping in real sprites would mean
  replacing `drawPerson()` in `js/art.js`.
- No audio.
