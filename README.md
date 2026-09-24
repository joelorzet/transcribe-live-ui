# Transcribe Live — core-ui

Control room for [Transcribe Live](https://github.com/joelorzet/transcribe-live), the
real-time conference transcription system built for the
[Nerdearla Vibeathon 2026](https://nerdearla26.devpost.com/).

Next.js 16, React 19, Tailwind 4, shadcn/ui, Untitled UI icons.

---

## Run it

The API must be running first. See the
[core-api README](https://github.com/joelorzet/transcribe-live#quick-start).

```bash
npm install
npm run dev          # http://localhost:3000
```

It talks to `http://localhost:8787` by default. Point it elsewhere with `?api=`, which is
remembered afterwards, or set `NEXT_PUBLIC_API_URL`:

```
http://localhost:3000/?api=https://captions.example.org
```

To let phones in the room open the audience page, browse the control room on your machine's
LAN address rather than `localhost`, otherwise the QR codes point somewhere phones cannot
reach. The UI warns you when it spots this.

---

## The screens

| Route | What it is |
|---|---|
| `/` | **Control room.** Every source, live captions, latency, spend split between audio and translation. Search and filter by status, spoken language, output language or how audio arrives. |
| `/sources/new` | **Create a source.** Name it, pick the spoken language, choose how audio reaches it, tick the languages to translate into. |
| `/sources/[id]` | **Manage one source.** Input stats, audio source, spoken language and glossary editable live, one card per output language, and an Advanced section with every integration endpoint. |
| `/session/[id]` | **Audience page.** Full screen captions with a language picker and transcript download. Shareable, works on a phone. |
| `/overlay/[id]` | **Broadcast overlay.** Transparent page for an OBS or vMix browser source. |

### Overlay options

| Query | Effect |
|---|---|
| `lang` | Which translation to show, e.g. `lang=en`. Omit for the original. |
| `only` | `translated` or `original` to show a single line |
| `size` | `sm`, `md` or `lg` |
| `chroma=1` | Solid green background instead of transparent, for mixers without alpha |

In OBS: Sources, add Browser, paste the URL, set 1920 by 1080, tick *Shutdown source when not
visible*. One browser source per language.

---

## Using it at an event

1. **Create a source per room.** Pick the spoken language, or auto-detect if a room mixes
   languages. Attach the Nerdearla glossary so names and technical terms survive.
2. **Give it audio.** Paste a stream URL, or choose OBS and copy the Server and Stream Key into
   your encoder. One RTMP server address serves the whole event; each talk gets its own key.
3. **Add output languages.** Each becomes an independent live translation with its own
   subtitles, latency and cost. Languages can be added or dropped while the talk runs.
4. **Send captions where they belong.** Open **Advanced: consume these streams elsewhere** on
   the source page for the overlay URL, the audience link and QR, the SSE and WebSocket feeds,
   and the plain text URL a vMix title can poll. Every endpoint is scoped to one language.
5. **Watch the control room.** Latency and spend update live. A failed source explains itself
   and offers Retry, which keeps the transcript, outputs and glossary.

---

## How it is put together

The UI holds no business logic. Services own all I/O and are reachable only through contexts
and hooks; components take props and render.

```
src/
  models/      UI vocabulary: Track, Caption, TrackOutput, EngineInfo, filters
  services/    classes owning I/O, plus dto/ and mappers/ at the boundary
  contexts/    ServicesProvider injects services, ControlRoomProvider owns state
  hooks/       state and behaviour: track stream, outputs, filters, forms
  components/  presentational
  app/         routes
```

Backend wire shapes stay in `services/dto` and are mapped to UI models at the edge, so
backend vocabulary never reaches a component. Anything the server owns, such as whether a
source already has an RTMP endpoint, is read from the session snapshot rather than kept in
React state, so every screen agrees.

```bash
npm run build      # production build, type checked
npm run lint
```

---

## License

Apache-2.0. See [LICENSE](LICENSE).
