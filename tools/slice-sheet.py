"""Slice a five-panel expression sheet into game-ready sprites.

Three things matter, and none of them is obvious:

  * Panels are found by looking for the empty columns between them, not by
    dividing the width by five. Generators drift, and an even division puts a
    slice line through somebody's shoulder.

  * Every panel is cropped with the SAME box, worked out from the union of all
    five. Cropping each to its own bounds looks tidier and is wrong: the face
    would sit a few pixels higher in one mood than another and the character
    would twitch every time the conversation turned.

  * Only the FACE is taken from each expression panel. The body always comes
    from the neutral. Asked to change a face, a generator will happily redraw
    the coat, thicken the outline, or — as it did to Cato — turn a man's hair
    grey in the blink frame. Cutting a band between the hairline and the collar
    takes the new brows, eyes and mouth and nothing else, so the only thing
    that can change is the only thing that should.

The neutral is taken from the sheet as well, replacing any standalone one.
That matters: a generator handed a template does not reproduce the original
figure, it draws a new one, so the sheet's own neutral is the only body the
other four panels agree with. Keep the old one and the character changes shape
every time the conversation turns.

Usage: slice.py <sheet.png> <char> <outdir> [x0 y0 x1 y1 as fractions]
"""
import sys, os
from PIL import Image

TARGET_H = 151
NAMES = ['neutral', 'warm', 'worried', 'stern', 'blink']

# The face band, as fractions of the trimmed figure. Default is tuned to Cato:
# it starts below the hairline, stops above the collar, and stays inside the
# edge of the head so both cuts land on flat skin rather than on an outline.
BAND = (0.349, 0.152, 0.678, 0.384)


def knockout(im, tol=26):
    """Flood the white background in from the edges, leaving enclosed whites
    (a linen cravat, a cap, the whites of eyes) alone."""
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    stack = []
    for x in range(w):
        stack.append((x, 0)); stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y)); stack.append((w - 1, y))
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h: continue
        i = y * w + x
        if seen[i]: continue
        r, g, b, _ = px[x, y]
        if (255 - r) + (255 - g) + (255 - b) > tol * 3: continue
        seen[i] = 1
        px[x, y] = (0, 0, 0, 0)
        stack.append((x + 1, y)); stack.append((x - 1, y))
        stack.append((x, y + 1)); stack.append((x, y - 1))
    return im


def panels(im):
    w, h = im.size
    px = im.load()
    cols = []
    for x in range(w):
        hit = False
        for y in range(0, h, 3):
            if px[x, y][3] > 24: hit = True; break
        cols.append(hit)
    runs, start = [], None
    for x, on in enumerate(cols):
        if on and start is None: start = x
        elif not on and start is not None:
            if x - start > w // 40: runs.append((start, x))
            start = None
    if start is not None: runs.append((start, w))
    return runs


def band_mask(size, feather=12):
    """A hard cut across a cheek leaves a visible line. This ramps the join
    over a few pixels — done at full resolution, so after the downscale to
    151 tall the blend is under two pixels wide and reads as nothing at all."""
    w, h = size
    m = Image.new('L', size, 255)
    px = m.load()
    for x in range(w):
        for y in range(h):
            d = min(x, w - 1 - x, y, h - 1 - y)
            if d < feather: px[x, y] = round(255 * d / feather)
    return m


def main(path, char, outdir, band=BAND):
    im = knockout(Image.open(path))
    runs = panels(im)
    print('found %d panels: %s' % (len(runs), runs))
    if len(runs) != 5:
        print('!! expected 5 — stopping so nothing is written wrong'); return 1

    boxes = []
    for (x0, x1) in runs:
        sub = im.crop((x0, 0, x1, im.size[1]))
        boxes.append(sub.getchannel('A').getbbox())
    L = min(b[0] for b in boxes); T = min(b[1] for b in boxes)
    R = max(b[2] for b in boxes); Bm = max(b[3] for b in boxes)
    print('shared crop box', (L, T, R, Bm))

    cut = [im.crop((x0, 0, x1, im.size[1])).crop((L, T, R, Bm)) for (x0, x1) in runs]
    fw, fh = cut[0].size
    fx0, fy0 = round(band[0] * fw), round(band[1] * fh)
    fx1, fy1 = round(band[2] * fw), round(band[3] * fh)
    print('face band %s of %s' % ((fx0, fy0, fx1, fy1), (fw, fh)))

    w = max(1, round(fw * TARGET_H / fh))
    for i, panel in enumerate(cut):
        if i == 0:
            out = panel
            name = '%s-neutral.png' % char
        else:
            out = cut[0].copy()                       # the body is always the neutral's
            face = panel.crop((fx0, fy0, fx1, fy1))
            out.paste(face, (fx0, fy0), band_mask(face.size))
            name = '%s-%s.png' % (char, NAMES[i])
        out.resize((w, TARGET_H), Image.Resampling.BOX).save(os.path.join(outdir, name))
        print('  wrote', name)
    return 0


if __name__ == '__main__':
    b = tuple(float(v) for v in sys.argv[4:8]) if len(sys.argv) >= 8 else BAND
    sys.exit(main(sys.argv[1], sys.argv[2], sys.argv[3], b))
