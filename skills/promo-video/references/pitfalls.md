# Pièges rencontrés (tous vécus, tous vérifiés)

## Remotion
- `interpolate()` refuse les chaînes non numériques (`"blur(0px)" → "blur(6px)"` → *Non-numeric strings
  can only be interpolated using Easing.step1*). Interpole le nombre et construis la chaîne :
  `` filter: `blur(${interpolate(...)}px)` ``. Les chaînes `"0px 40px" → "0px 0px"` (translate) passent.
- `<Folder>` prend `name`, pas `id`.
- `<Sequence from={0}>` est refusé par le lint Remotion (`@remotion/from-0`) : omets `from`.
- Le Studio affiche des erreurs *Module not found: @remotion/whisper-webgpu / @remotion/video-matting*
  tant que ces deux paquets ne sont pas installés (deps optionnelles). `setup.mjs` les installe.
- Audio : `<Audio>` de `@remotion/media`, pas de `remotion`. Pour un SFX à une frame donnée :
  `<Sequence from={f} durationInFrames={8}><Audio src=… /></Sequence>`.
- Vérifier une frame : `npx remotion still <Comp> out/x.png --frame=N --scale=0.5`, puis lire le PNG.
  Les captures d'écran du Studio dans le Browser pane sont trop petites pour juger.
- Les scènes conçues pour 1080x1920 ne se réagencent pas toutes seules en 1920x1080 : le format se
  décide au cadrage, changer ensuite = réécrire les layouts.
- Interactivité Studio : seuls les littéraux inline dans `style` sont éditables. On accepte de
  référencer `brand.*` (partage) — c'est un compromis assumé.
- Un long `TransitionSeries` décale le timing (les transitions chevauchent) : pour caler sur une
  musique, préfère des `<Sequence from>` absolus et gère les fondus dans les scènes.
- Rendu : ~1 min pour 41 s en 1080p sur un laptop ; 32 Mo. Le MP4 est H.264 + AAC.

## Playwright / captures
- Layout `h-screen` + panneau interne scrollable : `fullPage: true` ne capture que le viewport.
  Agrandis le viewport (`viewport: {width: 1920, height: 3400}`) pour une capture haute.
- `deviceScaleFactor: 2` : les PNG font 3840x2160, mais les `boundingBox()` restent en px CSS (1920) —
  affiche l'image à 1920x1080 dans Remotion et les coordonnées tombent juste.
- `getByRole("button", {name: "iOS"})` matche aussi « iOS + Android » : `exact: true` dès qu'un
  libellé est préfixe d'un autre (option de menu vs bouton de filtre « Note »).
- Un popover fermé par navigation : après un clic qui soumet, `waitForLoadState("networkidle")` puis
  re-`waitFor` un bouton stable avant le shot.
- Les tris/filtres sans plancher remontent des données moches (apps à 1 avis, montants non
  formatés) : ajoute un filtre dans l'url de capture (`&minReviews=1000`) plutôt que de retoucher.
- Un mur de connexion/abonnement : cherche un flag de démo dans le code du produit
  (`DEMO_MODE`, `hasAccess`), sinon `cookies`/`localStorage` dans le plan. Ne saisis jamais un mot
  de passe toi-même.
- Génération IA à capturer : `waitFor` le texte de chargement (optionnel, il peut être très bref),
  `shot`, puis `waitGone` avec un timeout de 5 min.
- Regarde chaque capture : un élément d'UI cassé (avatar qui chevauche un lien, décimales brutes)
  finira dans la vidéo. Cache-le avec `hideCss` si ce n'est pas corrigeable côté produit.

## Audio
- Musique synthétisée = zéro souci de droits. Structure : intro tendue → drop → groove → coup final.
  Vérifie le profil RMS par seconde si tu doutes (script Node sur le WAV) : ~-26 dBFS en intro,
  ~-11 dBFS sur le groove, fondu final.
- Tu ne peux pas écouter : dis-le, et indique `volume` (Story.tsx) et `--drop/--end/--bpm`.
- Le ffmpeg de Playwright (`ms-playwright/ffmpeg-*`) ne lit PAS le H.264, ni le navigateur intégré
  (erreur `MEDIA_ERR_SRC_NOT_SUPPORTED`). Vérifie un rendu avec `scripts/probe.mjs` (mediabunny).

## Lint / TypeScript
- `no-irregular-whitespace` : pas d'espace insécable littéral dans le JSX ; écris `{"\u00a0"}`.
- `boxes.ts` en `as const` : les valeurs sont `readonly`, ça passe dans les props `Box` structurelles.
- Imports JSON : passe par `boxes-to-ts.mjs` plutôt qu'`import x from "*.json"` (tsconfig du scaffold).

## Shell (Windows / Git Bash)
- Les apostrophes du français (« l'app ») cassent `node -e '...'` et les heredocs non quotés :
  écris les fichiers avec l'outil Write, ou un heredoc `<<'EOF'`.
- `/tmp` résout en `C:\tmp` : utilise le scratchpad de la session ou `%TEMP%`.
- Le port 3000 est souvent pris : Studio sur 3012 (`--port`), produit sur son port habituel.
- Ne lance pas de serveur dans Bash : `preview_start` (launch.json) — le Bash bloque ou tue le process.

## Storytelling
- Ne montre pas les géants du marché comme exemples si le produit vend l'inverse.
- Un exemple concret vaut mieux que « une app » : nomme la fiche montrée, montre ses vrais chiffres.
- Le spectateur lit les légendes, pas l'UI : l'UI doit *confirmer* la légende (zoom + surlignage).
