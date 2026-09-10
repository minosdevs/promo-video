#!/usr/bin/env node
// Capture declarative des VRAIES pages d'un produit web avec Playwright, pour les animer dans Remotion.
// Lit un plan JSON (voir templates/capture-plan.example.json) et produit :
//   <out>/<nom>.png          captures viewport @scale (1920x1080 -> 3840x2160 par defaut)
//   <out>/boxes.json         coordonnees (px CSS du viewport) des elements nommes par les etapes "box"
//                            (groupe optionnel : { "group": "tall" } range les boites sous boxes.tall)
//   <out>/<save>             texte extrait par "innerText"
//
// Usage : node capture.mjs capture-plan.json [--base http://localhost:3000] [--headed]
//
// Etapes supportees (une par objet du tableau "steps") :
//   { "goto": "/path", "waitUntil": "networkidle"|"domcontentloaded" }
//   { "viewport": {"width":1920,"height":3400}, "group": "tall" }   // group: null pour revenir au niveau racine
//   { "waitFor": <locator>, "timeout": 10000, "optional": true }
//   { "waitGone": <locator>, "timeout": 300000, "optional": true }   // attend la disparition (ex: spinner IA)
//   { "click": <locator> }   { "hover": <locator> }   { "type": <locator>, "text": "..." }   { "press": "Enter" }
//   { "wait": 800 }          { "settle": true }  (networkidle)
//   { "shot": "nom" }        { "shotFull": "nom" } (fullPage — attention aux layouts h-screen)
//   { "box": "cle", "locator": <locator> }
//   { "innerText": <locator>, "save": "fichier.txt" }
//   { "eval": "document.querySelector('.cookie')?.remove()" }
//   { "css": "…" }  (injecte une feuille de style, ex: cacher une banniere)
// Locator : { "css": "..." } | { "role": "button", "name": "Ok", "exact": true } | { "text": "…", "exact": true }
//           | { "label": "Email" } | { "placeholder": "…" } ; options : "hasText": "regex", "has": <locator>,
//           "within": <locator>, "nth": 0. Les chaines hasText/text commençant par ^ ou contenant \d sont
//           traitees comme des regex.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const planPath = args.find((a) => !a.startsWith("--")) ?? "capture-plan.json";
const flag = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const headed = args.includes("--headed");

const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const BASE = flag("base") ?? plan.base ?? "http://localhost:3000";
const OUT = plan.out ?? "public/shots";
fs.mkdirSync(OUT, { recursive: true });

const boxes = {};
let group = null;
const rx = (s) => (typeof s === "string" && (s.startsWith("^") || /\\d|\\s|\$$/.test(s)) ? new RegExp(s) : s);

function resolve(page, loc) {
  if (!loc) throw new Error("locator manquant");
  const scope = loc.within ? resolve(page, loc.within) : page;
  let l;
  if (loc.css) l = scope.locator(loc.css);
  else if (loc.role) l = scope.getByRole(loc.role, { name: rx(loc.name), exact: loc.exact });
  else if (loc.text !== undefined) l = scope.getByText(rx(loc.text), { exact: loc.exact });
  else if (loc.label) l = scope.getByLabel(loc.label);
  else if (loc.placeholder) l = scope.getByPlaceholder(loc.placeholder);
  else throw new Error("locator inconnu : " + JSON.stringify(loc));
  if (loc.hasText) l = l.filter({ hasText: rx(loc.hasText) });
  if (loc.has) l = l.filter({ has: resolve(page, loc.has) });
  if (loc.nth !== undefined) l = l.nth(loc.nth);
  return l.first();
}

const browser = await chromium.launch({ headless: !headed, channel: plan.channel });
let ctx = await browser.newContext({
  viewport: plan.viewport ?? { width: 1920, height: 1080 },
  deviceScaleFactor: plan.scale ?? 2,
  locale: plan.locale ?? "fr-FR",
  colorScheme: plan.colorScheme,
});
let page = await ctx.newPage();
if (plan.cookies) await ctx.addCookies(plan.cookies);
if (plan.localStorage) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.evaluate((kv) => Object.entries(kv).forEach(([k, v]) => localStorage.setItem(k, v)), plan.localStorage);
}
const applyHide = async () => {
  if (plan.hideCss) await page.addStyleTag({ content: plan.hideCss }).catch(() => {});
};

let n = 0;
for (const step of plan.steps) {
  n++;
  const tag = `[${n}/${plan.steps.length}]`;
  try {
    if (step.goto !== undefined) {
      await page.goto(step.goto.startsWith("http") ? step.goto : BASE + step.goto, { waitUntil: step.waitUntil ?? "networkidle" });
      await applyHide();
      console.log(tag, "goto", step.goto);
    } else if (step.viewport) {
      await page.setViewportSize(step.viewport);
      await page.waitForTimeout(400);
      console.log(tag, "viewport", step.viewport);
    } else if (step.waitFor) {
      await resolve(page, step.waitFor).waitFor({ timeout: step.timeout ?? 15000 });
    } else if (step.waitGone) {
      await resolve(page, step.waitGone).waitFor({ state: "detached", timeout: step.timeout ?? 60000 });
      console.log(tag, "gone", JSON.stringify(step.waitGone));
    } else if (step.click) {
      await resolve(page, step.click).click({ timeout: step.timeout ?? 10000 });
      console.log(tag, "click", JSON.stringify(step.click));
    } else if (step.hover) {
      await resolve(page, step.hover).hover();
    } else if (step.type) {
      const l = resolve(page, step.type);
      await l.click();
      await l.pressSequentially(step.text ?? "", { delay: 40 });
      console.log(tag, "type", step.text);
    } else if (step.press) {
      await page.keyboard.press(step.press);
    } else if (step.wait) {
      await page.waitForTimeout(step.wait);
    } else if (step.settle) {
      await page.waitForLoadState("networkidle");
      await applyHide();
    } else if (step.shot || step.shotFull) {
      await page.waitForTimeout(step.delay ?? 400);
      const name = step.shot ?? step.shotFull;
      await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: !!step.shotFull });
      const vp = page.viewportSize();
      (group ? (boxes[group] ??= {}) : boxes)[`__shot_${name}`] = { viewport: vp, scale: plan.scale ?? 2 };
      console.log(tag, "shot", name, `${vp.width}x${vp.height}`);
    } else if (step.box) {
      const bb = await resolve(page, step.locator).boundingBox({ timeout: step.timeout ?? 5000 });
      if (!bb) throw new Error("boundingBox null");
      const target = group ? (boxes[group] ??= {}) : boxes;
      target[step.box] = { x: Math.round(bb.x), y: Math.round(bb.y), w: Math.round(bb.width), h: Math.round(bb.height) };
      console.log(tag, "box", step.box, JSON.stringify(target[step.box]));
    } else if (step.innerText) {
      const txt = await resolve(page, step.innerText).innerText();
      if (step.save) fs.writeFileSync(path.join(OUT, step.save), txt);
      console.log(tag, "innerText", step.save ?? "", txt.length, "chars");
    } else if (step.eval) {
      await page.evaluate(step.eval);
    } else if (step.css) {
      await page.addStyleTag({ content: step.css });
    }
    if ("group" in step) {
      group = step.group ?? null;
      if (group && page.viewportSize()) (boxes[group] ??= {}).viewportHeight = page.viewportSize().height;
    }
  } catch (e) {
    const msg = e.message.split("\n")[0];
    if (step.optional) console.warn(tag, "optionnel, ignore :", msg);
    else {
      console.error(tag, "ECHEC :", JSON.stringify(step), "\n   ", msg);
      await page.screenshot({ path: path.join(OUT, `_error-step-${n}.png`) }).catch(() => {});
      process.exitCode = 1;
      break;
    }
  }
}

fs.writeFileSync(path.join(OUT, "boxes.json"), JSON.stringify(boxes, null, 2));
console.log("boxes ->", path.join(OUT, "boxes.json"), Object.keys(boxes).filter((k) => !k.startsWith("__")).join(", "));
await browser.close();
