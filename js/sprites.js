/* ===========================================================================
   sprites.js — optional hand-made character art.

   The game draws its people procedurally by default. Put a PNG path in the
   table below and that image is used instead, for that character and that
   expression. Anything you don't supply keeps falling back, so you can bring
   one face in at a time and the game never breaks.

   HOW TO ADD A CHARACTER
   ----------------------
   1. Save the file as art/characters/<id>-<expression>.png
   2. Uncomment its line below.

   Character ids:  convert (Ezra), minister (Thorne), reader (Cato),
                   captain (Bright), patience (Patience), officer (Pym)

   Expressions:    neutral warm worried stern surprised thoughtful
                   downcast bright

   You do NOT need all eight. Missing ones fall back down this chain:
       bright   -> warm    -> neutral
       downcast -> worried -> neutral
       stern    -> worried -> neutral
       thoughtful, surprised -> neutral
   So four images per character (neutral, warm, worried, stern) covers
   everything, and one (neutral) is enough to see how it looks.

   REQUIREMENTS
   ------------
   - Transparent background. The room is drawn behind it.
   - The figure's shoulders should sit near the bottom of the image; the game
     anchors the sprite so the counter crosses it in the right place.
   - Any size. It is scaled to fit the room's grid on load, so generate big.
   =========================================================================== */

window.SPRITES = {

  // reader: {
  //   neutral: 'art/characters/cato-neutral.png',
  //   warm:    'art/characters/cato-warm.png',
  //   worried: 'art/characters/cato-worried.png',
  //   stern:   'art/characters/cato-stern.png'
  // },

  // convert:  { neutral: 'art/characters/ezra-neutral.png' },
  // minister: { neutral: 'art/characters/thorne-neutral.png' },
  // captain:  { neutral: 'art/characters/bright-neutral.png' },
  // patience: { neutral: 'art/characters/patience-neutral.png' },
  // officer:  { neutral: 'art/characters/pym-neutral.png' }

};

/* How tall a sprite should be drawn, as a fraction of the room's height, and
   where its feet-of-the-bust should land. Tune these once the first image is
   in rather than guessing now. */
window.SPRITE_LAYOUT = {
  height: 0.78,      /* of the 216px room, so ~168px tall               */
  centreX: 0.50,     /* across the frame                                 */
  bottom: 0.94       /* where the bottom edge of the image sits          */
};
