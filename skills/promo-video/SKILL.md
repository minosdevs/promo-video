---
name: promo-video
description: >
  Fabrique une vidéo marketing / démo produit animée (16:9, ~40 s) pour un SaaS ou une app web avec
  Remotion : storytelling (accroche → tension → démo → signature), captures Playwright des VRAIES pages
  du produit animées dans une fenêtre navigateur (zooms caméra, curseur qui clique, surlignages,
  scroll, saisie clavier), musique et bruitages synthétisés libres de droits, rendu MP4 vérifié.
  Utilise ce skill DÈS QUE l'utilisateur veut une vidéo promo, une vidéo de lancement, une démo
  produit animée, un teaser pour X/LinkedIn/YouTube/Product Hunt, « une vidéo de mon SaaS », « montrer
  mon app en vidéo », « un motion design de ma feature », ou parle de Remotion pour du marketing —
  même sans dire « vidéo ». Commande : /promo-video <description ou url du produit>.
---

# promo-video — du SaaS qui tourne en local à la vidéo marketing rendue

Le but : l'utilisateur ouvre Claude dans le dossier de son produit (ou un dossier vide), explique ce
qu'il veut montrer, et repart avec un **MP4 sensationnel qui montre son vrai produit**, pas des
mockups approximatifs. Le storytelling est validé avec lui AVANT de coder. Tout ce qui bouge à
l'écran est mesuré (coordonnées capturées), tout ce qui s'entend est généré (zéro droit d'auteur).

Le skill a été construit en produisant une vraie vidéo (Trkly, 41 s, 11 captures, musique calée)
et encode tout ce qui a été appris : les pièges Remotion, Playwright, lint, et ce qui rend une vidéo
produit crédible.

## Les fichiers du skill

| chemin | rôle |
|---|---|
| `scripts/setup.mjs` | Scaffold complet du projet Remotion (deps, Playwright, skills Remotion, templates, musique) |
| `scripts/capture.mjs` | Capture déclarative des vraies pages (plan JSON → PNG @2x + `boxes.json`) |
| `scripts/boxes-to-ts.mjs` | `boxes.json` → `src/story/boxes.ts` typé |
| `scripts/make-music.mjs` | Musique + SFX synthétisés (drop et coup final paramétrables) |
| `scripts/probe.mjs` | Vérifie un MP4 rendu (durée, pistes) sans ffmpeg |
| `templates/` | Composants (BrowserFrame, Cursor, Caption, Callout, DotGrid), scènes, `brand.ts`, plan de capture exemple, CLAUDE.md du projet |
| `templates/examples/Demo.example.tsx` | La démo complète de référence (28 s, 11 captures, scroll, saisie, chips) à lire avant d'écrire la tienne |
| `references/scenario.md` | Modèle de scénario + règles d'écriture des légendes |
| `references/pitfalls.md` | Tous les pièges rencontrés (Remotion, Playwright, lint, audio, Windows) |
| `references/checklist.md` | Ce qu'il faut vérifier avant de livrer |

`<skill>` ci-dessous = le dossier de ce SKILL.md (`~/.claude/skills/promo-video`, `.claude/skills/promo-video`
ou le cache du plugin). Vérifie avec `ls` avant de lancer un script.

## Workflow

### 0. Cadrer (5 minutes) — et VALIDER le scénario avant de coder

Pose-toi (ou pose à l'utilisateur, en une seule fois) les questions suivantes :

1. **Le produit** : nom, une phrase, url locale (`npm run dev` sur quel port ?) ou url de prod.
   Y a-t-il un mur de connexion / abonnement ? → il faut un moyen de le lever pour filmer (flag de
   démo dans l'app, compte de test, cookies). Ne demande JAMAIS de mot de passe à taper toi-même :
   l'utilisateur se connecte dans un navigateur et te donne les cookies, ou active un mode démo.
2. **Ce qu'il veut montrer** : 3 à 5 moments précis (une page, un filtre, un clic, un résultat).
   Chaque moment = une capture + une action du curseur + une légende.
3. **La douleur** que le produit règle, en une phrase familière (« T'en as marre de… ? »).
4. **Le format** : 16:9 par défaut (X, LinkedIn, YouTube, landing). 9:16 seulement si demandé
   explicitement (TikTok/Reels) — les templates sont conçus 1920x1080.
5. **Le CTA final** : url, « Lien en bio », « Essai gratuit »… et la tagline.

Puis **écris le scénario dans le chat** avec `references/scenario.md` comme modèle : 8 scènes,
durées, texte à l'écran, ce qu'on voit, et propose le choix technique (captures réelles par
Playwright, recommandé). Attends le « go » de l'utilisateur. S'il dit « je te laisse gérer », c'est
un go : ne repose pas de question, fais des choix et documente-les.

Écris le scénario validé dans `SCENARIO.md` à la racine du projet vidéo : c'est la référence pour
toutes les scènes et pour les retouches futures.

### 1. Scaffolder le projet vidéo

Toujours un **projet séparé** du produit (dossier frère `<produit>-video`) : Remotion + Chromium
n'ont rien à faire dans le build du SaaS, et le `tsc` d'un `next build` inclurait les fichiers vidéo.

```bash
node <skill>/scripts/setup.mjs ../monsaas-video --name "MonSaaS" --domain monsaas.app --base http://localhost:3000 --accent "#f97316" --desc "une phrase"
```

Le script : `create-video --blank` (Tailwind v4 inclus), `remotion add` des paquets (transitions,
google-fonts, media, zod, + whisper-webgpu et video-matting qui sont des deps optionnelles du Studio
sans lesquelles il affiche des erreurs), Playwright 1.63 + Chromium, les **skills officiels Remotion**
(`npx skills add remotion-dev/skills`), copie des templates, `CLAUDE.md` du projet, `launch.json`
(Studio sur le port 3012 — change `--port` si pris), et une musique par défaut. Compte 3 à 5 minutes.

Ensuite : `npm run lint` dans le projet doit être vert **avant** toute modification (le squelette
compile avec des boîtes placeholder).

### 2. Extraire la charte du produit

Ouvre le CSS du produit (`globals.css`, `tailwind.config`, variables `:root`) et remplis
`src/brand.ts` : accent, fond sombre, texte, police Google (change l'import
`@remotion/google-fonts/<Font>`), logo (copie le PNG dans `public/logo.png`), domaine. **Ne devine
pas les couleurs** : lis-les. Tous les composants lisent `brand`, aucune couleur n'est codée dans les scènes.

### 3. Capturer le vrai produit

Le produit doit tourner (demande à l'utilisateur de lancer son serveur, ou lance-le via
`preview_start`, jamais dans Bash). Si un mur bloque le contenu, lève-le AVANT (mode démo, cookies
dans le plan : `"cookies": [...]`, ou `"localStorage": {...}`).

Écris `capture-plan.json` (modèle : `capture-plan.example.json`, doc complète en tête de
`scripts/capture.mjs`) : une étape par action. Pour chaque moment du scénario :
- `shot` de l'état avant, `click`/`type` de l'action, `settle`, `shot` de l'état après ;
- `box` pour **chaque élément que le curseur va viser ou qu'un surlignage va entourer** (boutons,
  options de menu, champ de recherche, première ligne d'un tableau, badge, section) ;
- pour une longue page, `viewport` haut (ex. 1920x3400) avec `"group": "tall"` — jamais `shotFull`
  sur un layout `h-screen`/panneau scrollable, il ne capture que le viewport ;
- une génération IA : `shot` pendant le chargement, `waitGone` du spinner (timeout long), `shot` du résultat.

```bash
node <skill>/scripts/capture.mjs capture-plan.json      # PNG @2x + public/shots/boxes.json
node <skill>/scripts/boxes-to-ts.mjs                    # -> src/story/boxes.ts
```

**Regarde chaque capture** (outil Read) avant de continuer : contenu gênant (données de test
moches, bug d'affichage, nom d'utilisateur), popover mal ouvert, page pas chargée. Corrige côté plan
(ajoute un `wait`, un filtre dans l'url, un `css` pour cacher un élément) et recapture. Si tu
repères un bug du produit, note-le pour le livrable — ne le corrige pas dans le produit sans demande.

### 4. Musique

`setup.mjs` a déjà généré `public/audio/` (music + click/whoosh/pop/impact). La musique est
structurée : intro tendue → **drop** → groove → **coup final** → queue. Fais coïncider le drop avec
l'arrivée du produit à l'écran et le coup final avec la signature :

```bash
node <skill>/scripts/make-music.mjs --drop 8 --end 36 --total 42.5 [--bpm 120] [--transpose -2] [--seed 7]
```

120 BPM = 15 frames par temps à 30 fps : cale les scènes sur des multiples de 15. Si l'utilisateur
fournit un mp3, dépose-le dans `public/audio/music.wav|mp3` et adapte `Story.tsx` — vérifie la
licence avant.

### 5. Écrire les scènes

Lis `templates/examples/Demo.example.tsx` **en entier** : c'est le modèle de ce qu'on
attend (zoom caméra vers chaque élément cliqué, curseur qui arrive en arc et clique, capture
suivante en fondu, surlignage + étiquette, scroll d'une capture haute, saisie clavier lettre par
lettre, chips qui poppent, légende plein cadre par idée, flash blanc sur les coupes fortes, pulsation
sur le beat). Puis adapte `Demo.tsx` : `SHOTS` (captures et bornes), `ZOOM` (keyframes caméra),
`SCROLL`, `CURSOR` (les clics déclenchent les sons), les `Callout`, les `Caption`.

Règles de mise en scène :
- **Une idée par légende**, 3 à 6 mots + un groupe en accent. Jamais deux légendes en même temps.
- **Zoom vers ce qu'on veut faire lire** (1,4 à 1,7) puis retour à 1 : le spectateur doit pouvoir
  lire les libellés réels. Une capture pleine largeur non zoomée ne se lit pas.
- **Le curseur montre avant de cliquer** : il arrive 15 à 25 frames avant le clic, jamais téléporté.
- Une action = état avant → clic → état après, avec le fondu de 4 frames des `SHOTS`.
- Pas de coordonnée en dur : tout vient de `boxes`. Si un chiffre te manque, ajoute une `box` au plan.
- Copie et scènes texte (Hook/Tension/Outro) passent par les props de `Story` → éditables dans le Studio.

Vérifie au fur et à mesure avec des stills, pas dans le Studio réduit :

```bash
npx remotion still Demo out/check.png --frame=120 --scale=0.5
```

Regarde chaque still (outil Read). Cherche : texte coupé au bord de la fenêtre, étiquette qui
chevauche un élément lu, curseur au mauvais endroit, capture pas encore affichée, légende qui
recouvre l'action. Corrige, re-rends, jusqu'à ce que chaque moment clé soit propre.

### 6. Rendre et vérifier

```bash
npm run lint
npx remotion render Story out/<slug>-story.mp4
node <skill>/scripts/probe.mjs out/<slug>-story.mp4     # durée, piste vidéo, piste audio
```

Ne conclus pas « c'est bon » sur la foi du rendu : rends 6 à 10 stills aux moments clés de la
version finale et regarde-les. Tu ne peux pas écouter le mix : dis-le à l'utilisateur et indique
comment ajuster (`volume` dans `Story.tsx`, paramètres de `make-music.mjs`).

### 7. Livrer

Envoie le MP4 (SendUserFile) et un récap qui tient seul : où est le fichier, durée/format, la liste
des scènes avec ce qu'on y voit, ce qui a été vérifié et ce qui ne l'a pas été (le son), les bugs du
produit repérés en filmant, comment recapturer si l'UI change (3 commandes), et les variantes faciles
(9:16, version 15 s, autre langue = props de Story). Vois `references/checklist.md`.

## Ce qui rend la vidéo « sensationnelle » (par ordre d'impact)

1. Le **vrai produit** à l'écran, lisible (zoom), avec un curseur qui fait des vraies actions.
2. Le **drop musical synchronisé** avec l'arrivée du produit, flash blanc sur la coupe.
3. Les **légendes** : courtes, familières, une par idée, un mot en accent.
4. Les **surlignages** qui pointent exactement l'élément dont on parle (badge prix réel, bouton).
5. Le rythme : jamais plus de 2 s sans qu'il se passe quelque chose ; 40 s max au total.
6. Les micro-détails : fondu entre captures, pulsation au beat, chips qui poppent, SFX de clic.

Charge `references/pitfalls.md` avant d'écrire du code Remotion et relis `references/checklist.md`
avant de livrer.
