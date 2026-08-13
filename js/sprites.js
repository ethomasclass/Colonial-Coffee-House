/* ===========================================================================
   sprites.js — hand-made character art.

   THIS IS ALREADY WIRED. You do not need to edit this file.

   Every character below points at a filename in art/characters/. A file that
   isn't there yet is simply ignored and the game draws its built-in figure
   instead — so you can drop art in one piece at a time, nothing ever breaks,
   and nothing needs uncommenting.

   TO ADD A FACE
   -------------
   Save a PNG into art/characters/ with the matching name below. That's all.
   tools/pixelate.html will name the file for you if you pick the character
   and expression from its menu before downloading.

   `blink` is optional and separate: supply an eyes-closed version and the
   character blinks every few seconds by itself. It costs one image and buys
   more life than anything else on this list. Leave it out and nothing blinks.

   You do NOT need all four expressions. Missing ones fall back:
       bright   -> warm    -> neutral
       downcast -> worried -> neutral
       stern    -> worried -> neutral
       thoughtful, surprised -> neutral
   So `neutral` alone is enough to see a character in the room, and four
   covers all eight moods the writing uses.

   REQUIREMENTS
   ------------
   - Transparent background, and no table — the room draws its own counter.
   - Crop so the bottom edge sits just below the hands.
   - Any size; it is scaled to the room on load, so generate big.

   (While a file is missing the browser console notes that it could not be
   loaded. That is expected and harmless — it is how the fallback works.)
   =========================================================================== */

window.SPRITES = {

  /* Ezra Hale — the barrel-maker */
  convert: {
    neutral: 'art/characters/ezra-neutral.png',
    /* Deliberately absent. The sheet came back with a grimace here rather than
       a smile, which put a distressed face on his kindest lines. His neutral
       is already a broad grin, so warm falls back to it and reads correctly.
       Point this at a file whenever a better one exists. */
    warm:    null,
    worried: 'art/characters/ezra-worried.png',
    stern:   'art/characters/ezra-stern.png',
    blink:   'art/characters/ezra-blink.png'
  },

  /* Rev. Samuel Thorne — the Old Light minister */
  minister: {
    neutral: 'art/characters/thorne-neutral.png',
    warm:    'art/characters/thorne-warm.png',
    worried: 'art/characters/thorne-worried.png',
    stern:   'art/characters/thorne-stern.png',
    blink:   'art/characters/thorne-blink.png'
  },

  /* Cato Bell — the printer's apprentice */
  reader: {
    neutral: 'art/characters/cato-neutral.png',
    warm:    'art/characters/cato-warm.png',
    worried: 'art/characters/cato-worried.png',
    stern:   'art/characters/cato-stern.png',
    blink:   'art/characters/cato-blink.png'
  },

  /* Capt. Jonas Bright — master of the sloop Dolphin */
  captain: {
    neutral: 'art/characters/bright-neutral.png',
    warm:    'art/characters/bright-warm.png',
    worried: 'art/characters/bright-worried.png',
    stern:   'art/characters/bright-stern.png',
    blink:   'art/characters/bright-blink.png'
  },

  /* Patience Marsh — the merchant's daughter */
  patience: {
    neutral: 'art/characters/patience-neutral.png',
    warm:    'art/characters/patience-warm.png',
    worried: 'art/characters/patience-worried.png',
    stern:   'art/characters/patience-stern.png',
    blink:   'art/characters/patience-blink.png'
  },

  /* Mr. Aldis Pym — His Majesty's Customs */
  officer: {
    neutral: 'art/characters/pym-neutral.png',
    warm:    'art/characters/pym-warm.png',
    worried: 'art/characters/pym-worried.png',
    stern:   'art/characters/pym-stern.png',
    blink:   'art/characters/pym-blink.png'
  }

};

/* Where a supplied sprite sits in the room. These match where the built-in
   figures sit, so art conditioned by tools/pixelate.html should land right
   without touching anything. If one of yours rides high or low, nudge
   `bottom`; if it is too big for the room, drop `height`. */
/* Per-character nudges, in room pixels, for art that is framed differently
   from the rest. Positive `dy` seats somebody lower.

   Mr. Pym is drawn further back than the others: at six pixels above his
   bottom edge his silhouette is 28% as wide as his frame, where everyone else
   is 61-79%. What reaches the bottom of his picture is a hand and the corner
   of his ledger, not his forearms — so lining his picture up with the counter
   leaves his body floating above it.

   Five pixels closed the gap under his coat hem but left the bar top showing
   between his sleeves and his waistcoat, which still read as hovering. At
   fourteen his torso meets the counter the way everyone else's does, and his
   ledger still sits clear of the front edge. */
window.SPRITE_ADJUST = {
  officer: { dy: 14 }
};

window.SPRITE_LAYOUT = {
  height: 0.70,      /* of the 216px room, so about 151px tall           */
  centreX: 0.50,     /* across the frame                                  */
  bottom: 0.84       /* bottom edge lands just past the counter top       */
};
