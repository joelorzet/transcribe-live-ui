# Transcribe Live — UI

Control room, caption viewer and OBS overlay for
[Transcribe Live](https://github.com/joelorzet/transcribe-live), built for the
[Nerdearla Vibeathon 2026](https://nerdearla26.devpost.com/).

Zero dependencies, zero build step. Plain HTML, CSS and ES modules, so a venue
with bad wifi cannot break the captions.

## Run

```bash
npm start            # http://localhost:5173
```

It talks to `core-api` at `http://localhost:8787` by default. Point it elsewhere
with `?api=`, which is remembered in `localStorage`:

```
http://localhost:5173/?api=https://captions.example.org
```

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Control room — every live track, latency, spend, start/stop |
| `session.html?sessionId=X` | Full-screen captions, original + translation, SRT/VTT/text export |
| `overlay.html?sessionId=X` | Transparent overlay for OBS/vMix browser sources |

### Overlay options

| Query | Effect |
|---|---|
| `sessionId` | Which track to subtitle (required) |
| `lang` | Show only this translation, e.g. `lang=en` |
| `only` | `original` or `translated` to show a single line |
| `chroma=1` | Solid green background for chroma keying instead of transparency |

In OBS: **Sources → + → Browser**, set the URL, 1920×1080, and tick
*Shutdown source when not visible*.

## License

Apache-2.0.
