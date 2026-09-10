#!/usr/bin/env node
// Scaffold complet d'un projet Remotion "promo-video" prêt à filmer un SaaS :
//   1. npx create-video (blank + Tailwind v4)            5. copie des templates (composants, scènes, brand, Root)
//   2. deps Remotion (transitions, fonts, media, zod…)    6. CLAUDE.md du projet + .claude/launch.json
//   3. Playwright + Chromium (captures)                   7. musique + SFX par défaut (drop 8 s, fin 36 s)
//   4. skills officiels Remotion (npx skills add)
// Usage : node setup.mjs <dossier> --name "Trkly" --domain trkly.app --base http://localhost:3010
//         [--accent "#f97316"] [--desc "une phrase"] [--port 3012] [--skip-install]
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(here, "..");
const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
if (!dir) {
  console.error('usage: node setup.mjs <dossier> --name "MonSaaS" --domain monsaas.app --base http://localhost:3000');
  process.exit(1);
}
const name = flag("name", path.basename(dir).replace(/-video$/, ""));
const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const domain = flag("domain", `${slug}.app`);
const base = flag("base", "http://localhost:3000");
const accent = flag("accent", "#f97316");
const desc = flag("desc", "");
const port = flag("port", "3012");
const skipInstall = args.includes("--skip-install");

const run = (cmd, cwd) => {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
};
const abs = path.resolve(dir);

// 1. Scaffold
if (!fs.existsSync(abs)) {
  run(`npx --yes create-video@latest --yes --blank "${abs}"`);
} else {
  console.log("dossier existant, scaffold saute :", abs);
}
if (!skipInstall) {
  run("npm install", abs);
  // 2. Deps Remotion (versions alignées par `remotion add`) — whisper/video-matting = deps optionnelles
  //    du Studio qui font des erreurs "Module not found" si absentes.
  run("npx remotion add @remotion/transitions @remotion/google-fonts @remotion/media @remotion/whisper-webgpu @remotion/video-matting zod", abs);
  // 3. Playwright
  run("npm install -D playwright@1.63.0", abs);
  run("npx playwright install chromium", abs);
  // 4. Skills officiels Remotion
  try {
    run("npx --yes skills add remotion-dev/skills --agent claude-code -y", abs);
  } catch {
    console.warn("skills add a échoué (réseau ?) — installe-les plus tard : npx skills add remotion-dev/skills");
  }
}

// 5. Templates
const tpl = path.join(skillDir, "templates");
const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
};
copyDir(path.join(tpl, "src"), path.join(abs, "src"));
fs.rmSync(path.join(abs, "src", "Composition.tsx"), { force: true });
fs.mkdirSync(path.join(abs, "public"), { recursive: true });
fs.copyFileSync(path.join(tpl, "capture-plan.example.json"), path.join(abs, "capture-plan.example.json"));
if (!fs.existsSync(path.join(abs, "capture-plan.json"))) {
  fs.writeFileSync(path.join(abs, "capture-plan.json"), JSON.stringify({ base, out: "public/shots", viewport: { width: 1920, height: 1080 }, scale: 2, locale: "fr-FR", steps: [{ goto: "/" }, { shot: "home" }] }, null, 2));
}
// brand.ts : accent + nom + domaine
const brandPath = path.join(abs, "src", "brand.ts");
let brand = fs.readFileSync(brandPath, "utf8");
brand = brand.replace('name: "MonSaaS"', `name: ${JSON.stringify(name)}`).replace('domain: "monsaas.app"', `domain: ${JSON.stringify(domain)}`);
if (accent !== "#f97316") {
  const hex = accent.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  brand = brand
    .replace('accent: "#f97316"', `accent: ${JSON.stringify(accent)}`)
    .replace('accentGlow: "rgba(249,115,22,0.28)"', `accentGlow: "rgba(${r},${g},${b},0.28)"`)
    .replace('gradPrimary: "linear-gradient(310deg, #f97316, #fb9552)"', `gradPrimary: "linear-gradient(310deg, ${accent}, ${accent}cc)"`);
}
fs.writeFileSync(brandPath, brand);
// Logo placeholder si absent (à remplacer par le vrai)
const logoPath = path.join(abs, "public", "logo.png");
if (!fs.existsSync(logoPath)) fs.copyFileSync(path.join(tpl, "logo-placeholder.png"), logoPath);

// 6. CLAUDE.md + launch.json
const claude = fs
  .readFileSync(path.join(tpl, "CLAUDE.project.md"), "utf8")
  .replaceAll("{{NAME}}", name)
  .replaceAll("{{SLUG}}", slug)
  .replaceAll("{{DESCRIPTION}}", desc || "(à compléter)")
  .replaceAll("{{BASE_URL}}", base)
  .replaceAll("{{SKILL_PATH}}", skillDir.replaceAll("\\", "/"));
fs.writeFileSync(path.join(abs, "CLAUDE.md"), claude);
fs.mkdirSync(path.join(abs, ".claude"), { recursive: true });
const launch = fs.readFileSync(path.join(tpl, ".claude", "launch.json"), "utf8").replaceAll("3012", String(port));
fs.writeFileSync(path.join(abs, ".claude", "launch.json"), launch);
// .gitignore : out/ déjà ignoré par le scaffold ; on ajoute les captures lourdes ? Non : elles font partie du projet.

// 7. Musique par défaut
run(`node "${path.join(here, "make-music.mjs")}" --out public/audio --drop 8 --end 36 --total 42.5`, abs);

console.log(`
✔ Projet prêt : ${abs}
  1. Remplis src/brand.ts (couleurs/police/logo du produit) et remplace public/logo.png
  2. Écris capture-plan.json (pages + clics + boîtes) puis : node ${here.replaceAll("\\", "/")}/capture.mjs capture-plan.json
  3. node ${here.replaceAll("\\", "/")}/boxes-to-ts.mjs
  4. Adapte src/story/scenes/Demo.tsx (SHOTS / ZOOM / CURSOR / captions) et la copie dans src/Root.tsx
  5. npm run lint && npx remotion still Demo out/check.png --frame=60 --scale=0.5
  6. npx remotion render Story out/${slug}-story.mp4
`);
