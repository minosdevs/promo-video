// Charte du produit — A REMPLIR depuis le CSS du SaaS (variables :root, tailwind.config, globals.css).
// Tous les composants et scenes lisent ces tokens : change-les ici, pas dans les scenes.
import { loadFont } from "@remotion/google-fonts/Inter"; // remplace par la Google Font du produit

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin"],
});

export const brand = {
  /** Nom affiche dans la signature */
  name: "MonSaaS",
  /** Couleur d'accent (CTA, surlignages) */
  accent: "#f97316",
  /** Variante claire de l'accent (fonds de chips) */
  accentSoft: "#fde9d7",
  /** Halo derriere les scenes sombres — l'accent en rgba */
  accentGlow: "rgba(249,115,22,0.28)",
  /** Fond sombre des scenes texte / signature */
  dark: "#18181b",
  dark2: "#27272a",
  /** Fond clair et texte des scenes claires (si le produit est clair) */
  background: "#f4f4f5",
  surface: "#ffffff",
  foreground: "#27272a",
  muted: "#71717a",
  muted2: "#a1a1aa",
  border: "#e3e3e7",
  up: "#22c55e",
  down: "#ef4444",
  info: "#0ea5e9",
  gradPrimary: "linear-gradient(310deg, #f97316, #fb9552)",
  softShadow: "0 20px 27px 0 rgba(0,0,0,0.05), 0 2px 4px 0 rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)",
  /** Logo dans public/ (copie du logo du produit, PNG/SVG carre de preference) */
  logo: "logo.png",
  /** Url affichee dans la barre du faux navigateur */
  domain: "monsaas.app",
} as const;
