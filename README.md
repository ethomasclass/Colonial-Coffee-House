# Colonial Coffee House

*Boston, 1741. The house is the Green Dragon, on Union Street.*

A *Coffee Talk*–style visual novel for one class period. Students keep the
Green Dragon on Union Street for a single evening in September 1741, brewing
period drinks for six patrons whose conversations carry the Great Awakening,
the Enlightenment, and the Navigation and Molasses Acts.

No install, no accounts, no student data collected. It is a folder of static
files — open `index.html` and it runs.

---

## Documentation

- **[docs/HOW-TO-PLAY.md](docs/HOW-TO-PLAY.md)** — student directions. Printable,
  or project it while they start.
- **[docs/STUDENT-HANDOUT.md](docs/STUDENT-HANDOUT.md)** — one double-sided
  sheet. Filled in while playing, answered after closing.
- **[docs/TEACHING-GUIDE.md](docs/TEACHING-GUIDE.md)** — what the game teaches,
  the answer key, timing, discussion prompts, and what it deliberately leaves
  out.

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
| **Length** | ~50–58 minutes: paper, eight scenes, closing ledger. **See the timing note below** |
| **Reading level** | Written for 10th grade. Contemporary American English and spelling, contractions throughout; only the period terms that *are* the content (New Light, enumerated goods, enthusiasm) are kept, and every one is glossed in-game |
| **Drinks** | 32 recipes, all period-accurate, **none alcoholic**. Composing one in the brew panel discovers it — no need to serve it |
| **Sound** | Synthesised in-browser, **off by default**, one toggle |
| **Fail state** | None. Every cup is accepted and paid for |

### The loop

1. **Read the morning *Boston Gazette*.** Landscape, two columns, a pixel
   woodcut on every story, and three pages you turn. Six stories, each written
   for somebody who has never heard of any of it — what the thing is, why it is
   happening, what it means for an ordinary person — and each ending with an
   **In plain terms** box that puts the whole story in one sentence.
2. **Eight scenes, six of which want a drink.** Each patron gives an order as a
   *mood*, not a menu item. The brewing bench has the **recipe book open on the
   left** and **the cup on the right**: click a jar on the shelf and you watch
   it pour in, the level rise, and the drink take its colour. Or pour the cup
   away and start again, losing the ingredients.
3. **The conversation.** Every dialogue choice is a tone fork — no branch is
   wrong, they differ in how much the patron volunteers.
4. **The confession.** Each of the six ordering patrons has **one thing they
   will only say over a cup that actually suited them.** Ezra admits he is
   frightened it will wear off. Thorne admits he thinks he is losing. Bright
   admits the customs officer has already tried to turn him informer. A student
   who brews carelessly never hears any of it, and the closing screen tells them
   how many they missed. This is what makes two students' notes different.
5. **Between patrons**, the room is empty, and there are chores. You can also
   re-read the paper, or click anything in the room — hearth, window, trade
   sign, cupboard, candle — for a short note on what it was and why.
6. **Two patrons come back** before closing. Ezra has been dismissed by his
   master over the meetings and is not sorry. Patience has told her father and
   made up her mind.
7. **The closing ledger.** Every drink, what it cost, what it fetched, what got
   poured away, and whether rent got paid. Designed to be read off the screen
   while filling in a paper worksheet.

### The cleaning game

Two scenes of its own, because scrubbing a counter you are looking at edge-on
never felt like anything:

- **The bar, from above** — plank grain, nail heads, drink rings, spills and a
  general film of grime.
- **A pewter tankard, close up** — tarnished all over, with an owner's mark
  that only surfaces once you have polished down to it.

Dirt is a grid, not a list of stains. Each cell holds a grime level and the
cloth knocks it down by one per pass, so a heavy ring takes about four sweeps
and **you watch it fade rather than blink out**. Cleaning is metered by
distance travelled — holding still does nothing; it is the scrubbing that
lifts it. The rag eases after the cursor and leans into the direction of
travel, with a damp trail behind it and a corner that lifts as it moves.

A progress meter fills as you go, it finishes itself at 92% so nobody has to
hunt the last few pixels, and the surface throws off a few sparkles when it is
done. Then it hands you back to the room — where the bar you just wiped is
visibly clean and its button has greyed out.

It is entirely optional and rewards nothing. The counter only tracks how many
times you bothered.

### The night visibly passes

The candles burn down, the hearth sinks to embers, the street lantern outside
gutters out, and the whole room darkens as the eight scenes go by. It teaches
nothing. It is there so the game feels like a place.

### The recipe book

It looks like a book — leather boards, a spine, two printed pages — and every
drink has its own pixel cup drawn from its actual ingredients, so a tea bowl,
a stoneware mug, a chocolate pot and a pewter cup all read differently and the
cream, nutmeg, lemon and molasses show in the liquid.

**Fourteen recipes are known at the start** — at least two for every base, and
all but one of what tonight's patrons actually want. In a forty-minute session
the time should go on reading people, not hunting the shelf. The one exception
is Patience's Spiced Chocolate, which stays a discovery on purpose: her scene
is the centre of the evening and her confession is worth earning.

The other eighteen are still there to be found. Anything you put together on
the shelf goes into the book, served or not, so a student can stand there and
explore. Unmade entries show a question-mark cup and a hint built from the
recipe's own rule (*"Bohea Tea, sweetened with loaf sugar, and cream"*), so the
book is a hunting list rather than a wall of blanks. It stays open beside you
the whole time you brew.

### The mechanic that does the teaching

The sweetener shelf is the entire Molasses Act:

| | Cost | Lawful? |
|---|---|---|
| French molasses | 1d | **No** — duty unpaid under the Act of 1733 |
| British molasses | 4d | Yes |
| Loaf sugar | 6d | Yes |
| Honey | free | Yes, but only six servings exist |

Rent is 66d and the purse opens at 36d. A **flawless** lawful night clears
rent by one penny; an ordinary lawful night does not; smuggling clears it
comfortably. Students discover *salutary neglect* by running the numbers, not
by being told — and the closing screen only names the concept after they have
already lived it.

### Timing note — read this before you run it

The build now runs **longer than one 50-minute period** for a slow reader: eight
scenes plus the confessions is realistically 50–58 minutes before discussion.

If you need it shorter, edit the `ORDER` array near the bottom of `js/data.js`:

```js
var ORDER = ['officer_early', 'convert', 'reader', 'minister', 'patience',
             'captain', 'convert_return', 'patience_return', 'officer'];
```

Delete any entry and nothing breaks — the ledger, journal, closing screen and
progress counter all follow this list. Dropping `'convert_return'` and
`'reader'` gets you back to roughly 40 minutes. **Keep `'officer'` last**; his
scene is the payoff and it reads what the student did all evening.

I have not timed this with real students. Do that before you commit a class to
it, and cut from `ORDER` accordingly.

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
| **Ezra, returning** | What the Awakening actually cost him — and the thirty households that took him in, none of which answer to his master |
| **Patience, returning** | Her father refused to forbid her and handed her the bill instead. She is going anyway |

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
js/art.js         pixel renderer, the room, the shared character sheet,
                  the night phase, the chore marks, click regions
js/sprites.js     which character art file is which — already wired
js/backdrop.js    an optional painted room, and where the fire, rain and
                  candles sit in it — already wired
js/audio.js       rain, hearth, a slow tune, scrubbing and a chime —
                  all synthesised, no sound files
js/chores.js      the cleaning game: both scenes, the dirt grid, the rag
js/icons.js       every small drawing — drink cups, shelf jars, newspaper
                  woodcuts — rendered onto their own little canvases
js/data.js        shelf, 32 recipes, cast, running order, newspaper,
                  glossary, room notes, ledger economics
js/scenes.js      the eight conversations and the six confessions
js/game.js        state, dialogue player, brewing, chores, closing ledger
```

To change the writing, edit `js/scenes.js` — it needs no knowledge of the rest.
To change the economics, edit the `LEDGER` block in `js/data.js`.
To cut the game short, edit `ORDER` in `js/data.js`.

### Accessibility and classroom practicalities

- **Text size** (four steps) and **text speed** (including "all at once")
  under the `Aa` button. Both remembered between sessions.
- **Sound is off until somebody turns it on**, and the choice is remembered.
- **The night is saved** to the browser as you go. If a student's tab dies or
  the period ends, the title screen offers to carry on where they stopped.
- Dialogue advances with click, space, or enter. `Esc` closes any panel.
- Nothing is sent anywhere. No accounts, no analytics, no network calls at all.

---

## Not built yet

- **The paper worksheet.** The closing ledger is laid out to be filled in from,
  but the worksheet itself does not exist.
- **Real timing data.** See the timing note above.
- **Per-character epilogues** on the closing screen ("Patience testified on
  Thursday") — designed but not built.
- **The room is painted.** `art/room/tavern-night.png` is the Green Dragon at
  384×216, so it lands on the pixel grid with nothing resampled. Everything
  that moves is still drawn over the top of it — rain on the glass, flames
  licking off the logs, sparks, coals breathing, the candle on the bar burning
  down, firelight flickering, and every ring and tarnish mark the player has
  to wipe away. `js/backdrop.js` says where each of those sits in the picture.
  Take the PNG away and the game draws its own tavern instead; the full-size
  original is kept beside it so the small one can be remade.
- **Character art is drawn in code**, in the manner of a modern pixel-art
  visual novel: a hard dark outline found from the silhouette, three hard-edged
  tones per material, hair as big shapes with one bright band, and hands
  resting on the counter. Each pose is cached, so the whole figure is composed
  once per expression rather than sixty times a second. To replace it, drop a PNG into
  `art/characters/` using the names listed in `js/sprites.js` — every path is
  already wired, so there is nothing to edit and nothing to uncomment. A file
  that isn't there is ignored and the drawn figure is used instead, so art can
  arrive one face at a time. Missing expressions fall back down a chain, so
  four images per character covers all eight moods and `neutral` alone is
  enough to see somebody in the room.
- **All six have faces.** Neutral, warm, worried, stern and a blink apiece,
  cut from five-panel sheets by `tools/slice-sheet.py`. That script finds the
  panels by the gaps between them, crops all five with one shared box, and
  takes only a band across the face from each — the body always comes from the
  neutral, because a generator asked to change an expression will also redraw
  the coat and, once, turn a man's hair grey. It works out where each face is
  by finding the shoulders, so a wig, a linen cap and a bare head all land
  right without being measured by hand.
- **Sprites move.** A patron rises into the seat rather than appearing,
  breathes, shifts their weight slowly, and settles a little on each line of
  dialogue as though they had just spoken. A change of mood gets its own small
  beat. All of it works off one still image, and every displacement is a whole
  number of pixels, so the art never falls off its grid. Supply an
  eyes-closed `-blink.png` and the character blinks by itself; leave it out and
  nothing blinks.
- **`tools/pixelate.html`** conditions a generated image into a usable sprite:
  area-averages it down to a real pixel grid, cuts the palette to the room's
  own colours, knocks out a flat background by flooding in from the edges, and
  forces hard alpha. It also **slices a sheet of expressions** — tick the box,
  say how many panels across and down, and it cuts them apart, names them in
  order (neutral, warm, worried, stern) and trims every panel to one shared
  box, so a character's head cannot jump when the game swaps expressions.
  Open it in a browser; nothing is uploaded anywhere.
- **Multi-day play.** Doesn't fit one period, but `js/scenes.js` and the `ORDER`
  array are fully separable, so a three-day version is an expansion rather than
  a rewrite.
