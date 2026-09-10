#!/usr/bin/env node
// public/shots/boxes.json -> src/story/boxes.ts (typé, `as const`), pour que Demo.tsx lise les
// coordonnées des captures sans jamais coder un chiffre en dur.
// Usage : node boxes-to-ts.mjs [public/shots/boxes.json] [src/story/boxes.ts]
import fs from "node:fs";

const src = process.argv[2] ?? "public/shots/boxes.json";
const dst = process.argv[3] ?? "src/story/boxes.ts";
const raw = JSON.parse(fs.readFileSync(src, "utf8"));

// Retire les métadonnées internes (__shot_*) du type exporté, garde viewportHeight des groupes.
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith("__")).map(([k, v]) => [k, v && typeof v === "object" && !("x" in v) ? clean(v) : v]));
const data = clean(raw);

fs.writeFileSync(
  dst,
  `// GÉNÉRÉ par scripts/boxes-to-ts.mjs depuis ${src} — ne pas éditer à la main, recapturer.\n` +
    `// Coordonnées en px CSS du viewport de capture (1920 de large) ; un groupe (ex: \`tall\`) = autre viewport.\n` +
    `export type Box = { x: number; y: number; w: number; h: number };\n` +
    `export const boxes = ${JSON.stringify(data, null, 2)} as const;\n`,
);
console.log("écrit", dst, "—", Object.keys(data).join(", "));
