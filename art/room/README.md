# The painted room

Drop a file called `tavern-night.png` in this folder and the game stops
drawing its own tavern and paints yours instead. Nothing here? The built-in
room draws exactly as it always has. Same rule as the character art.

**Size:** 384 × 216 exactly, or an exact multiple — 768 × 432, 1152 × 648,
1536 × 864. Multiples are stepped down by halves on load so the pixels stay
square. An odd size still works but will look softer.

**The counter must run across the bottom fifth of the picture**, with its top
edge about 80% of the way down. The customer stands behind it, in the middle
of the frame, and takes up most of the middle third — so leave that area as
plain back wall.

**Leave the moving parts out where you can.** The game draws rain on the
window, flame and sparks in the hearth, candle flames, the firelight breathing
over the room, and every ring and smudge the player has to wipe away. Paint
dark logs and a low bed of embers rather than tall flames, and bare candles
rather than lit ones, and the game supplies the fire.

If your painting already has a fire and lit candles you like better, open
`js/backdrop.js` and set `fire: null` and `candles: []`. They'll stop being
drawn over the top.

**Then check the rectangles in `js/backdrop.js`.** They say where the window,
the firebox, the candles, the pewter shelf and the clickable objects sit. The
defaults match the built-in room; if your window is somewhere else, the rain
will fall somewhere else too until you move the numbers.
