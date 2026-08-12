# The painted room

`tavern-night.png` is the Green Dragon. The game loads it and paints the room
from it instead of drawing its own. Take it away and the built-in tavern comes
back — nothing breaks.

`tavern-night-source.png` is the full-size original it was made from. It is
kept so the small one can be remade if anything changes; the game never loads
it.

## If you replace the room

**Size:** 384 × 216 exactly is best — it lands on the pixel grid with nothing
resampled. An exact multiple (768 × 432, 1152 × 648, 1536 × 864) is stepped
down by halves on load. Anything else still works but softens.

**Composition:** the bar runs across the bottom fifth, and **the middle third
must be plain wall and bar** — the customer stands there and covers anything
you put behind them.

**Leave the moving parts out where you can.** The game draws rain on the
window, flames and sparks in the hearth, candles burning down, the firelight
flickering, and every ring and smudge the player has to wipe away. Paint dark
logs and low embers rather than tall flames, and the game supplies the fire.

**Then re-measure `js/backdrop.js`.** Every rectangle in it was measured off
the current painting: the glass, the firebox, the span of the bar, the shelf
where the pewter sits, the candles, and the clickable objects. If your window
lands somewhere else, the rain falls in the old place until you move the
numbers. Each one is commented, and each can be switched off — `fire: null`
if your hearth is already lit the way you want it, `candles: []` if the bar
already has its own.
