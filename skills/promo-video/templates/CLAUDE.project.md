# {{NAME}}-video — vidéo marketing Remotion pour {{NAME}}

Projet Remotion généré par le skill **promo-video** (`{{SKILL_PATH}}`). Avant toute tâche, charge ce
skill (il contient le workflow, les pièges et les références), puis les skills officiels Remotion
installés dans `.claude/skills/remotion-*` (`remotion-best-practices` est le routeur).

## Où on en est
- Produit : {{NAME}} — {{DESCRIPTION}}
- Serveur du produit pour les captures : `{{BASE_URL}}`
- Scénario validé : voir `SCENARIO.md` (à écrire/valider AVANT de coder les scènes)
- Rendu : `out/{{SLUG}}-story.mp4`

## Structure
```
src/brand.ts                 # tokens du produit (couleurs, police, logo, domaine) — la SEULE source de style
src/Root.tsx                 # composition "Story" (1920x1080, 30 fps) + dossier Scenes
src/story/Story.tsx          # timeline absolue calée sur la musique (drop = début de la démo)
src/story/scenes/            # Hook, Tension, Demo (captures réelles), Outro
src/story/boxes.ts           # GÉNÉRÉ depuis public/shots/boxes.json — ne pas éditer à la main
src/story/timeline.ts        # zoomAt / valueAt (keyframes)
src/components/              # BrowserFrame, Cursor, Caption, Callout, DotGrid, Sparkline
capture-plan.json            # plan déclaratif des captures (pages, clics, boîtes) pour capture.mjs
public/shots/                # captures @2x + boxes.json ; public/audio/ = musique + SFX ; out/ = rendus
```

## Commandes
```bash
npm run dev                                  # Studio (port 3012, voir .claude/launch.json)
npm run lint                                 # eslint + tsc — toujours vert avant un rendu
node {{SKILL_PATH}}/scripts/capture.mjs capture-plan.json      # recapturer le produit
node {{SKILL_PATH}}/scripts/boxes-to-ts.mjs                    # régénérer src/story/boxes.ts
node {{SKILL_PATH}}/scripts/make-music.mjs --drop 8 --end 36   # regénérer musique + SFX
npx remotion still Demo out/check.png --frame=120 --scale=0.5  # vérifier une frame
npx remotion render Story out/{{SLUG}}-story.mp4               # rendu final
node {{SKILL_PATH}}/scripts/probe.mjs out/{{SLUG}}-story.mp4   # vérifier durée / pistes
```

## Règles
- Animations : `useCurrentFrame()` + `interpolate()` inline, jamais de CSS `transition`/`animation`.
- Toute coordonnée d'écran vient de `boxes.ts` ; si l'UI du produit bouge, on recapture, on ne retouche pas les chiffres.
- Un clic du curseur = un stop `click: true` dans CURSOR (le son suit tout seul).
- Vérifier en rendant des stills (`remotion still`), pas en regardant le Studio réduit.
- Musique : 120 BPM = 15 frames par temps ; le drop doit tomber sur l'arrivée du produit.
