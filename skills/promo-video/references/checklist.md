# Checklist avant de livrer

## Contenu
- [ ] Le scénario validé (SCENARIO.md) est respecté : chaque moment demandé par l'utilisateur est à l'écran.
- [ ] Chaque légende : une idée, 3–6 mots, un groupe en accent, pas deux légendes en même temps.
- [ ] Les chiffres affichés sont ceux du produit (captures), pas inventés.
- [ ] L'exemple montré est crédible : pas de données de test, pas de bug visible, pas de nom d'utilisateur privé.
- [ ] Le CTA final et la tagline sont ceux validés (ou « Lien en bio → » par défaut, dit dans le récap).

## Image (stills rendus et regardés, pas le Studio)
- [ ] Reveal : la fenêtre arrive sur le drop, la 1re légende n'est pas coupée.
- [ ] Chaque clic : le curseur est SUR l'élément au moment du clic, l'état suivant apparaît juste après.
- [ ] Chaque surlignage entoure le bon élément, son étiquette ne sort pas de la fenêtre et ne cache rien d'important.
- [ ] Zoom : les libellés visés sont lisibles à 1080p ; retour à 1 avant l'action suivante.
- [ ] Scroll : la section visée est cadrée, les callouts défilent avec elle.
- [ ] Pas de texte coupé au bord (chips, étiquettes, légendes), pas de chevauchement légende/action.
- [ ] Signature : logo net (PNG ≥ 400 px), nom, tagline, CTA lisibles.

## Son
- [ ] `probe.mjs` : piste audio présente, durée = frames / fps.
- [ ] Drop = arrivée du produit (frame `DEMO_START`), coup final = début de la signature.
- [ ] Dit dans le récap : « je n'ai pas pu écouter le mix », et comment régler le volume.

## Technique
- [ ] `npm run lint` vert.
- [ ] `boxes.ts` régénéré après la dernière capture (pas de coordonnée en dur dans Demo.tsx).
- [ ] `CLAUDE.md` du projet à jour (produit, port, scénario, commandes de recapture).
- [ ] Rien de secret dans le repo vidéo (`.env` du produit, cookies du plan → à garder hors git si présents).

## Récap à l'utilisateur
- [ ] Chemin du MP4, durée, format, taille.
- [ ] Liste des scènes avec ce qu'on y voit.
- [ ] Ce qui a été vérifié / pas vérifié.
- [ ] Bugs du produit repérés en filmant (sans les corriger).
- [ ] Comment recapturer si l'UI change (3 commandes) et variantes faciles (15 s, 9:16, langue).
