# promo-video

**Français** · [English](./README.en.md)

Un skill Claude Code qui transforme ton SaaS qui tourne en local en **vidéo marketing animée**, à
partir du **vrai produit** : Claude cadre le scénario avec toi, capture tes vraies pages, les anime
dans une fenêtre navigateur (zooms caméra, curseur qui clique, surlignages, scroll, saisie), compose
une musique calée sur le montage, rend le MP4 et vérifie le résultat image par image.

```
/promo-video mon SaaS tourne sur localhost:3000, montre la recherche, la fiche produit et l'export en 1 clic
```

Tu ouvres Claude Code dans ton dossier, tu expliques ce que tu veux montrer, tu valides le scénario,
et tu repars avec `out/<produit>-story.mp4`.

---

## Pourquoi

Une vidéo produit faite « à la main » par une IA, c'est des mockups approximatifs, des couleurs
devinées, une musique à droits douteux et un « c'est bon » sans vérification. promo-video remplace ça
par de la **mesure** et une **méthode** :

| Sans | Avec promo-video |
|---|---|
| Des faux écrans redessinés « dans l'esprit » | Les vraies pages capturées par Playwright en 4K, animées telles quelles |
| Un curseur posé au hasard | Chaque bouton, option, ligne a ses coordonnées mesurées (`boxes.json`) : le curseur clique au pixel |
| Une couleur « proche » | La charte lue dans le CSS du produit (`brand.ts`) |
| Un mp3 trouvé sur internet | Musique + bruitages **synthétisés** par script, drop calé sur l'arrivée du produit, zéro droit |
| Un scénario improvisé | Douleur → tension → révélation → preuves → action → promesse, validé avant de coder |
| « Ça devrait marcher » | Stills rendus et relus à chaque moment clé, MP4 sondé (durée, pistes) |

---

## Ce que ça fait, concrètement

1. **Cadrage** — Claude te pose les 5 questions utiles (produit, moments à montrer, douleur, format,
   CTA), écrit les 8 scènes dans le chat et attend ton go.
2. **Scaffold** — `scripts/setup.mjs` crée un projet Remotion séparé (`<produit>-video`), installe les
   dépendances, Playwright + Chromium, les skills officiels Remotion, copie les composants (fenêtre
   navigateur, curseur, légendes, surlignages) et génère une musique par défaut. 3 à 5 minutes.
3. **Charte** — les couleurs, la police et le logo du produit vont dans `src/brand.ts`.
4. **Captures** — un plan JSON déclaratif (`capture-plan.json`) décrit les pages, les clics, les
   saisies et les éléments à mesurer ; `scripts/capture.mjs` produit les PNG @2x et `boxes.json`.
5. **Scènes** — accroche cinétique, tension, démo (captures enchaînées, zooms, curseur, callouts,
   scroll, chips), signature. Toute la copie est en props : éditable dans le Studio Remotion.
6. **Musique** — `scripts/make-music.mjs --drop 8 --end 36` : intro tendue, drop, groove, coup final.
7. **Rendu + vérification** — `remotion render`, `scripts/probe.mjs`, stills relus.

Résultat type : 41 s, 1920x1080, H.264 + AAC, ~30 Mo.

---

## Installation

### En plugin (recommandé)

```
/plugin marketplace add minosdevs/promo-video
/plugin install promo-video@minosdevs-promo-video
```

### En skill perso

```bash
git clone https://github.com/minosdevs/promo-video
cp -r promo-video/skills/promo-video ~/.claude/skills/promo-video
cp promo-video/commands/promo-video.md ~/.claude/commands/promo-video.md
```

Prérequis : Node ≥ 18, Git. Chromium est installé par `setup.mjs` (via Playwright). Le produit à
filmer doit tourner en local (ou être accessible en ligne) ; si un mur de connexion cache le contenu,
prévois un mode démo ou des cookies — Claude ne saisit jamais de mot de passe.

---

## Utilisation

```
/promo-video <ce que tu veux>
```

Exemples :

- `/promo-video Trkly tourne sur localhost:3010. Montre la table des apps avec le filtre iOS/Android, le tri par MRR et par note, la fiche d'une app, les avis négatifs et le prompt de clone en 1 clic.`
- `/promo-video une vidéo de 30 s de mon CRM pour LinkedIn, ton pro, CTA vers app.moncrm.io`

Sans la commande, décrire une « vidéo de mon SaaS », un « teaser Product Hunt » ou une « démo animée »
suffit à déclencher le skill.

---

## Structure du repo

```
.claude-plugin/          plugin.json, marketplace.json
commands/promo-video.md  la commande /promo-video
skills/promo-video/
  SKILL.md               le workflow complet (cadrage → scaffold → charte → captures → scènes → musique → rendu → livraison)
  scripts/               setup.mjs, capture.mjs, boxes-to-ts.mjs, make-music.mjs, probe.mjs
  templates/             brand.ts, composants, scènes, Story/Root, plan de capture exemple, CLAUDE.md du projet
  templates/examples/    la démo complète de référence (Trkly) : Demo.example.tsx, boxes, script de capture
  references/            scenario.md (modèle + règles des légendes), pitfalls.md (tous les pièges), checklist.md
```

---

## Limites connues

- Claude ne peut pas **écouter** la musique : il te le dit et t'indique où régler le volume ou
  regénérer (`--bpm`, `--drop`, `--end`, `--transpose`, `--seed`).
- Les templates sont en **16:9** ; le 9:16 demande de réagencer les scènes.
- Une génération IA à filmer (bouton qui appelle un LLM) coûte ce qu'elle coûte chez ton fournisseur.
- Si l'UI du produit change, il faut recapturer (3 commandes, documentées dans le `CLAUDE.md` généré).

## Licence

MIT — Minos ([@minosdevs](https://github.com/minosdevs)).
