# audio/ — background music

`theme.mp3` is the background track. It is already in place; the game loops it
whenever sound is switched on.

**Nothing here?** The game does not care. With no file present it falls back to
the tune it synthesises in the browser — a slow ground bass with a plucked line
over it, in A minor. Sound is off by default either way.

---

## It is only fetched if somebody turns sound on

The music loads on the first press of **Sound on**, not on page load. A student
who never touches the toggle never downloads it. That is why a few megabytes
here is not a problem for a class of thirty on school wifi.

## The loop is cross-faded, so the track does not have to loop perfectly

Almost no piece of music loops cleanly. A song *ends* — it fades, or it stops,
and there is usually a beat of digital silence sitting after the last note.
`theme.mp3` does exactly this: it fades over its last few seconds and carries
about **0.75 s of silence** on the end.

Rather than ask for a surgically trimmed file, the player runs **two audio
decks**. As one comes within four seconds of the end, the other starts from the
top and the pair cross-fade, laying the head of the track over its own tail.
The combined level stays flat across the hand-off, so what a room hears is
continuous music rather than a song ending and restarting every few minutes.

**So you do not need to trim anything.** A track that fades out is fine.

## Adding more than one track

Open `js/audio.js` and find:

```js
var TRACKS = ['audio/theme.mp3'];
```

Add filenames and they cross-fade from one into the next, then wrap around:

```js
var TRACKS = ['audio/theme.mp3', 'audio/late-hour.mp3'];
```

## Checking it works

Open the browser console on the game and type:

```js
Sound.musicInfo()
```

It reports whether the file was found, which track is playing, how far in it
is, and whether a cross-fade is in progress. If it says
`source: 'synthesised tune'`, the mp3 did not load — check the filename matches
`TRACKS` exactly, including case.

## What works well here

- **mp3.** Every browser a school Chromebook might run plays it. Not `.wav`
  (enormous), not `.ogg` (Safari won't).
- **Filenames without spaces or brackets.** `theme.mp3`, not
  `My Track (1).mp3` — spaces have to be URL-encoded and it is an easy thing to
  get wrong on a live site.
- **Keep it reasonable.** A few MB is fine given it only loads on demand.
  96–160 kbps is plenty for background music.
- **Mix it low.** It plays at 30% volume under rain and a hearth, and has to
  sit beneath dialogue without competing.

## Volume

One number in `js/audio.js`:

```js
var MUSIC_VOL = 0.30;
```

Raise it if the music is lost under the rain; lower it if it fights the
writing. `var XFADE = 4.0;` just below sets the hand-off length in seconds.

## Licensing

Whatever goes in here is published to the public site with the game. Use music
you generated, wrote, or hold a licence for. If it came from an AI music tool,
check that tool's terms — free tiers often keep commercial rights even where
classroom use is fine.
