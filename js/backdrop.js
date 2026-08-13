/* ===========================================================================
   backdrop.js — the painted room, and where its moving parts live.

   THIS IS ALREADY WIRED. You do not need to edit it unless you change the art.

   art/room/tavern-night.png is the room. Take it away and the game falls back
   to drawing its own tavern, exactly as it used to — nothing breaks.

   A painting can't flicker, so everything that moves is still drawn by the
   game over the top of it: rain on the glass, the fire and its sparks, the
   candle burning down, the firelight breathing, and every ring and smudge the
   player has to wipe away. The numbers below say where those things sit in
   the picture. They were measured off the current painting; if you replace
   it, re-measure.
   =========================================================================== */

window.BACKDROP = {

  /* The painted room. Null means the game draws its own tavern instead —
     which it does to these same measurements, so everything below still
     applies either way. Point this at art/room/tavern-night.png to switch to
     the painting; art/room/tavern-night-source.png is the full-size original
     it was made from. */
  image: null,   /* 'art/room/tavern-night.png' to use the painting instead */

  /* Top of the bar. The customer stands behind it and cups sit on it. */
  counterY: 168,

  /* The span spills are scattered over. The drawn room's bar runs the whole
     width; the painting's stops a quarter of the way across, with the hearth
     floor beside it, so switching back to the painting means narrowing this
     to { x: 116, w: 250 } or the player gets rings in the fireplace. */
  bar: { x: 20, w: 344 },

  /* The glass only, inside the frame. Rain falls here, and the street lantern
     outside gutters out as the night wears on — switched off here, because
     this painting's glass already has depth of its own. */
  window: { x: 122, y: 53, w: 50, h: 64, lantern: false },

  /* The firebox. `style: 'tips'` is the quiet fire, for a hearth that is
     already painted: flames lick up off the log line, coals breathe and
     sparks rise, but nothing solid is drawn over the logs. Drop the style and
     a whole fire is drawn instead, for a hearth painted empty. */
  fire: { x: 12, y: 92, w: 68, h: 64, style: 'tips' },

  /* Firelight breathing over the room. The painting already has warm light
     baked into the left wall, so this is kept low and close to the hearth —
     it's there to move, not to light the room. */
  glow: { x: 42, y: 162, r: 68 },

  /* Candles the game draws and burns down. The painting has a lit one on the
     mantel already, so that one is left alone; this is the one standing at
     the far end of the bar, clear of where the customer stands.
     `flameOnly: true` on an entry means the candle is already painted and
     only wants a flame flickering on top of it. */
  candles: [
    { x: 344, y: 170 }
  ],

  /* Where the pewter sits in the cupboard, so tarnish lands on the vessels
     and not on the wall behind them. */
  shelf: { x: 298, y: 18, cols: 4, rows: 4, dx: 15, dy: 30 },

  /* Things worth clicking. First match wins, so the candle is listed before
     the hearth it stands in front of. */
  hits: [
    { id: 'candle', x: 6,   y: 42, w: 24, h: 32  },
    { id: 'hearth', x: 0,   y: 72, w: 100, h: 96  },
    { id: 'window', x: 116, y: 46, w: 62, h: 80  },
    { id: 'sign',   x: 198, y: 26, w: 54, h: 30  },
    { id: 'shelf',  x: 288, y: 24, w: 96, h: 124 }
  ]
};
