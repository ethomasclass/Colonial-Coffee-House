# audio/ — background music

Drop an **mp3** in here named `theme.mp3` and the game will loop it as the
background track. That is the whole setup.

```
audio/theme.mp3
```

**Nothing here yet?** That is fine and the game does not care. With no file
present it falls back to the tune it synthesises in the browser, exactly as
before — a slow ground bass with a plucked line over it, in A minor. Sound is
off by default either way.

---

## Adding more than one track

Open `js/audio.js` and find the list near the top of the music section:

```js
var TRACKS = ['audio/theme.mp3'];
```

Add filenames to it and they play in order, then wrap around:

```js
var TRACKS = ['audio/theme.mp3', 'audio/rain-song.mp3', 'audio/late-hour.mp3'];
```

With one track the file loops itself; with several it runs as a playlist.

## What works well here

- **mp3.** Every browser a school Chromebook might be running plays it. Not
  `.wav` (enormous), not `.ogg` (Safari won't).
- **Keep it small.** Aim for **under 3 MB**. The whole rest of the game is
  about 1 MB, and this loads over school wifi thirty at a time. 96–128 kbps
  mono is plenty for background music and roughly halves the size.
- **Make it loop cleanly.** Trim silence off both ends, or the track will
  audibly stop and restart every few minutes. A track that fades out at the
  end will fade out every loop.
- **Mix it low.** It plays at 30% volume under rain and a hearth, and it has
  to sit under spoken dialogue without competing. If your track has a loud
  hook, it will fight the writing.

## Volume

If it turns out too loud or too quiet against the rain, change one number in
`js/audio.js`:

```js
var MUSIC_VOL = 0.30;
```

## Licensing

Whatever goes in here gets published to the public site with the game. Use
music you generated, wrote, or hold a licence for. AI-generated tracks (Suno
and the like) are the easy answer — check the terms of whatever made it, since
free tiers often keep commercial rights even when classroom use is fine.
