/* ===========================================================================
   backdrop.js — an optional painted room.

   THIS IS ALREADY WIRED. You do not need to edit this file to try a backdrop.

   Drop a 384x216 PNG at the path below and the game stops drawing its own
   tavern and paints yours instead. The file isn't there? Nothing breaks — the
   built-in room draws exactly as before. Same rule as the character art.

   WHAT STAYS ALIVE ON TOP
   -----------------------
   A painted room is a still picture, so everything that moves is still drawn
   by the game over the top of it: rain on the window, the fire and its
   sparks, the candle flames, the light sinking as the night wears on, and the
   rings and tarnish the player has to wipe away. The rectangles below tell
   the game where those things sit in YOUR picture.

   If a flame lands in the wrong place, change the numbers here. Nothing else
   in the game needs touching. Set any entry to null to switch that effect off
   — e.g. if your painting already shows a lit fire you like, set `fire: null`
   and only the sparks-and-glow will be skipped.
   =========================================================================== */

window.BACKDROP = {

  /* The painting. 384x216 exactly, or an exact multiple (768x432, 1152x648,
     1536x864) which is downscaled cleanly on load. */
  image: 'art/room/tavern-night.png',

  /* Top edge of the bar, in buffer pixels. Cups, rings and the served drink
     all sit relative to this, and the customer stands behind it. */
  counterY: 172,

  /* The glass only — not the frame. Rain falls inside this box, and the
     street lantern outside gutters out within it as the night goes on. */
  window: { x: 112, y: 22, w: 58, h: 62 },

  /* The opening of the hearth: where flame, coals and sparks are drawn. */
  fire: { x: 16, y: 76, w: 54, h: 66 },

  /* Warm firelight washing over the room, brightest at this point. */
  glow: { x: 43, y: 110, r: 150 },

  /* Every candle flame. `y` is the top of the wick at the start of the night;
     each one sinks a little as its candle burns down. */
  candles: [
    { x: 18,  y: 56  },
    { x: 36,  y: 160 },
    { x: 344, y: 160 }
  ],

  /* Where the pewter on the shelf sits, so tarnish lands on the shelf and not
     on the wall. Rows and columns of the cupboard. */
  shelf: { x: 299, y: 28, cols: 5, rows: 3, dx: 16, dy: 38 },

  /* Things the player can click to read a note about. Rectangles in buffer
     pixels; retune these to match wherever they ended up in the painting. */
  hits: [
    { id: 'hearth', x: 6,   y: 42,  w: 74, h: 110 },
    { id: 'window', x: 109, y: 19,  w: 64, h: 74  },
    { id: 'sign',   x: 196, y: 18,  w: 66, h: 26  },
    { id: 'shelf',  x: 292, y: 20,  w: 86, h: 132 },
    { id: 'candle', x: 30,  y: 148, w: 14, h: 26  }
  ]
};
