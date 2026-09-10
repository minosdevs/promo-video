# promo-video

[Français](./README.md) · **English**

A Claude Code skill that turns your locally running SaaS into an **animated marketing video**, built
from the **real product**: Claude agrees on a storyboard with you, captures your actual pages,
animates them inside a browser window (camera zooms, a cursor that clicks, highlights, scrolling,
typing), composes a soundtrack synced to the cut, renders the MP4 and checks the result frame by frame.

```
/promo-video my SaaS runs on localhost:3000, show the search, the product page and the one-click export
```

Open Claude Code in your folder, explain what you want to show, approve the storyboard, and you get
`out/<product>-story.mp4`.

---

## Why

A product video improvised by an AI means approximate mockups, guessed colours, music with
questionable rights and a "looks good" nobody verified. promo-video replaces that with
**measurement** and a **method**:

| Without | With promo-video |
|---|---|
| Fake screens redrawn "in the spirit of" | Your real pages captured by Playwright at 4K and animated as-is |
| A cursor dropped somewhere | Every button, menu option and row has measured coordinates (`boxes.json`): the cursor clicks to the pixel |
| A "close enough" colour | The brand read from the product's CSS (`brand.ts`) |
| An mp3 found online | Music + SFX **synthesised** by script, drop synced to the product reveal, no licensing |
| An improvised script | Pain → tension → reveal → proofs → action → promise, approved before any code |
| "Should work" | Stills rendered and reviewed at every key moment, MP4 probed (duration, tracks) |

---

## What it does

1. **Framing** — Claude asks the 5 useful questions (product, moments to show, pain, format, CTA),
   writes the 8 scenes in chat and waits for your go.
2. **Scaffold** — `scripts/setup.mjs` creates a separate Remotion project (`<product>-video`),
   installs dependencies, Playwright + Chromium, the official Remotion skills, copies the components
   (browser frame, cursor, captions, callouts) and generates a default soundtrack. 3–5 minutes.
3. **Brand** — the product's colours, font and logo go into `src/brand.ts`.
4. **Captures** — a declarative JSON plan (`capture-plan.json`) lists pages, clicks, typing and the
   elements to measure; `scripts/capture.mjs` outputs @2x PNGs and `boxes.json`.
5. **Scenes** — kinetic hook, tension, demo (chained captures, zooms, cursor, callouts, scroll,
   chips), signature. All copy lives in props: editable in Remotion Studio.
6. **Music** — `scripts/make-music.mjs --drop 8 --end 36`: tense intro, drop, groove, final hit.
7. **Render + verify** — `remotion render`, `scripts/probe.mjs`, stills reviewed.

Typical output: 41 s, 1920x1080, H.264 + AAC, ~30 MB.

---

## Install

### As a plugin (recommended)

```
/plugin marketplace add minosdevs/promo-video
/plugin install promo-video@minosdevs-promo-video
```

### As a personal skill

```bash
git clone https://github.com/minosdevs/promo-video
cp -r promo-video/skills/promo-video ~/.claude/skills/promo-video
cp promo-video/commands/promo-video.md ~/.claude/commands/promo-video.md
```

Requirements: Node ≥ 18, Git. Chromium is installed by `setup.mjs` (through Playwright). The product
must run locally (or be reachable online); if a login wall hides the content, provide a demo mode or
cookies — Claude never types passwords.

---

## Usage

```
/promo-video <what you want>
```

Examples:

- `/promo-video Trkly runs on localhost:3010. Show the apps table with the iOS/Android filter, sorting by MRR and rating, an app page, the negative reviews and the one-click clone prompt.`
- `/promo-video a 30 s video of my CRM for LinkedIn, professional tone, CTA to app.mycrm.io`

Without the command, describing "a video of my SaaS", "a Product Hunt teaser" or "an animated demo"
is enough to trigger the skill.

---

## Repo layout

```
.claude-plugin/          plugin.json, marketplace.json
commands/promo-video.md  the /promo-video command
skills/promo-video/
  SKILL.md               the full workflow (framing → scaffold → brand → captures → scenes → music → render → delivery)
  scripts/               setup.mjs, capture.mjs, boxes-to-ts.mjs, make-music.mjs, probe.mjs
  templates/             brand.ts, components, scenes, Story/Root, example capture plan, project CLAUDE.md
  templates/examples/    the complete reference demo (Trkly): Demo.example.tsx, boxes, capture script
  references/            scenario.md (template + caption rules), pitfalls.md (every gotcha), checklist.md
```

---

## Known limits

- Claude cannot **listen** to the music: it tells you so and points to the volume setting or the
  regeneration flags (`--bpm`, `--drop`, `--end`, `--transpose`, `--seed`).
- Templates are **16:9**; 9:16 requires re-laying out the scenes.
- Filming an AI generation (a button that calls an LLM) costs whatever your provider charges.
- If the product UI changes, recapture (3 commands, documented in the generated `CLAUDE.md`).

## License

MIT — Minos ([@minosdevs](https://github.com/minosdevs)).
