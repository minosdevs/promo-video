---
description: Fabrique une vidéo marketing animée (Remotion) qui montre le vrai produit — scénario validé, captures Playwright, musique synthétisée, rendu MP4 vérifié
argument-hint: "<produit / url locale / ce que tu veux montrer>"
---

Fais une vidéo marketing pour : $ARGUMENTS

Utilise le skill `promo-video` et suis-le dans l'ordre, sans sauter d'étape.

Rappels critiques :

1. **Cadre puis VALIDE le scénario** avant d'écrire une ligne de code : produit, url locale et
   comment lever un éventuel mur de connexion, 3 à 5 moments à montrer, la douleur en une phrase,
   format (16:9 par défaut), CTA. Écris les 8 scènes dans le chat (`references/scenario.md`) et attends
   le go. « Je te laisse gérer » = go, tranche toi-même et documente.
2. **Projet séparé** : `node <skill>/scripts/setup.mjs ../<produit>-video --name … --domain … --base …`.
   `npm run lint` vert avant de toucher au code.
3. **Mesure, ne devine pas** : charte lue dans le CSS du produit → `src/brand.ts` ; pages capturées
   par `capture.mjs` avec un `capture-plan.json` (une `box` pour chaque élément visé) →
   `boxes-to-ts.mjs`. Regarde chaque capture avant de continuer.
4. **Lis `Demo.example.tsx` en entier** avant d'écrire `Demo.tsx`. Zoom vers ce qu'on veut faire lire,
   curseur qui arrive avant de cliquer, état avant → clic → état après, une légende par idée.
5. **Musique calée** : drop = arrivée du produit, coup final = signature (`make-music.mjs --drop --end`).
6. **Vérifie par des stills** (`remotion still`) à chaque moment clé, puis `remotion render` et
   `probe.mjs`. Ne dis jamais « c'est bon » sans avoir regardé les stills de la version finale.
7. **Livrable** : le MP4 envoyé, récap autonome (scènes, vérifié/pas vérifié dont le son, bugs du
   produit repérés, comment recapturer, variantes). Relis `references/checklist.md`.

Charge `references/pitfalls.md` avant de coder.
