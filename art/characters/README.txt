Character art goes here.

The six *-neutral.png files are what the game loads. They have been trimmed to
the figure and scaled to 151 pixels tall, which is the size the room draws
them at, so the browser blits them one for one instead of crushing a 700px
image down on every frame.

source/ holds the full-size originals they came from. The game never loads
them; they are kept so expression sheets can be cut from the same art later.

To add an expression, save it next to the neutral one using the names in
js/sprites.js — every path is already wired. Padding and odd dimensions are
fine going in; run new art through tools/pixelate.html, or ask for it to be
conditioned the same way these were.
