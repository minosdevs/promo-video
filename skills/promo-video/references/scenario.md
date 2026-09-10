# Modèle de scénario (à écrire dans le chat, puis dans SCENARIO.md une fois validé)

Structure éprouvée : **douleur → tension → révélation → preuves → action → promesse**. ~40 s, 8 scènes,
30 fps, 120 BPM (15 frames par temps). Les bornes ci-dessous sont celles des templates (`Story.tsx`).

| # | Scène | Frames | Ce qu'on voit | Texte à l'écran (exemple) |
|---|---|---|---|---|
| 1 | Accroche | 0–120 | Fond sombre, mots qui poppent un par un, groupe surligné en accent | « T'en as marre de pas savoir **quelle app** lancer ? » |
| 2 | Tension | 120–240 | Le statu quo à droite (liste anonyme qui défile, se floute), 2 lignes à gauche, flash blanc | « Des heures sur l'App Store. » / « Toujours les mêmes géants. » |
| 3 | Révélation | 240–420 | **Drop musical.** Fenêtre navigateur qui arrive, zoom arrière depuis un chiffre fort, 1er filtre cliqué | « 135 652 apps analysées. **iOS + Android.** » |
| 4 | Preuve 1 | 420–570 | Une action clé (tri, filtre), zoom sur le résultat, surlignage | « Trie par **revenu estimé**… » / « …ou **par note**. » |
| 5 | Preuve 2 | 570–660 | Recherche tapée en direct, clic sur un résultat, zoom-in vers la page suivante | « Cherche un sujet. **N'importe lequel.** » |
| 6 | Preuve 3 | 660–780 | La page détail : 2–3 surlignages étiquetés sur les données qui font « waouh » | « Tout ce que le dev **ne te dira jamais.** » |
| 7 | Preuve 4 / action | 780–1080 | Scroll vers la section forte, puis LE clic magique (génération, export…) et son résultat, chips | « Un clic. **Le brief complet.** » / « Colle-le dans Claude. **Build.** » |
| 8 | Signature | 1080–1230 | **Coup final.** Logo, nom, tagline, bouton CTA | « Trouve l'app gagnante. Copie-la en quelques clics. » / « Lien en bio → » |

Adapte le nombre de preuves à ce que l'utilisateur veut montrer (3 à 5 moments). Chaque preuve =
**une capture avant, une action du curseur, une capture après, une légende**.

## Écrire les légendes

- Tutoiement, familier, direct (« T'en as marre », « Colle-le », « Zéro géant »).
- 3 à 6 mots + un groupe en accent (`accent=` dans `<Caption>`). Le groupe en accent = le bénéfice.
- Une légende par idée, jamais deux à l'écran. Enchaîne-les avec 4 à 8 frames de vide.
- Chiffres réels du produit quand ils existent (« 135 652 apps ») : ils viennent des captures.
- La dernière légende de la démo est un ordre ou une promesse (« Build. », « Lance-toi. »).

## Choix à proposer dans le scénario (et trancher si « je te laisse gérer »)

- Captures Playwright du produit (recommandé) vs enregistrement d'écran fourni vs mockups React.
- L'exemple concret montré (quelle fiche, quelle recherche) : choisis un cas **crédible et flatteur**
  (données complètes, pas de valeurs nulles, pas de bug visible) — vérifie dans la base ou dans l'UI.
- Le CTA final et la tagline.
- Format 16:9 (défaut) ou 9:16.

## Ce que l'utilisateur a tendance à demander ensuite

Version courte 15 s (scènes 1, 3, 7, 8), déclinaison 9:16, autre langue (props de `Story`),
remplacer la musique, ajouter une voix off (ElevenLabs via le skill Remotion `voiceover`).
