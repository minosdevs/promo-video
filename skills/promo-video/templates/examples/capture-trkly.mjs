// Capture des VRAIES pages Trkly (serveur dev local, DEMO_MODE=true pour lever le flou abonnement)
// en 1920x1080 @2x, plus les coordonnees (px CSS viewport) des elements que la video anime
// (curseur, surlignages, zooms). Sortie : public/shots/*.png + public/shots/boxes.json.
//
// Usage : node scripts/capture.mjs [appId]     (serveur trkly attendu sur http://localhost:3010)
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.TRKLY_BASE ?? "http://localhost:3010";
const APP_ID = process.argv[2] ?? "3643461f-0f47-4a93-b014-f9fcd35b5746"; // Sober: Sobriety Tracker
const SEARCH_TERM = process.argv[3] ?? "sober";
const OUT = "public/shots";
fs.mkdirSync(OUT, { recursive: true });

const boxes = {};
const browser = await chromium.launch();

async function shot(page, name) {
  await page.waitForTimeout(400); // laisse les images/icones finir de charger
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("shot", name);
}
async function box(page, key, locator) {
  try {
    const b = await locator.first().boundingBox({ timeout: 4000 });
    if (b) boxes[key] = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
    else console.warn("no box for", key);
  } catch (e) {
    console.warn("box failed", key, e.message.split("\n")[0]);
  }
}
const settle = (page) => page.waitForLoadState("networkidle");

// ---------- Contexte standard 1920x1080 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, locale: "fr-FR" });
  const page = await ctx.newPage();

  // 1. Page Apps par defaut
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Plateforme" }).waitFor();
  await shot(page, "apps-default");
  await box(page, "badgeCount", page.locator("span").filter({ hasText: /^\d{1,3}[\s  ]\d{3}$/ }));
  await box(page, "searchInput", page.locator('input[name="q"]'));
  await box(page, "btnPlatform", page.getByRole("button", { name: "Plateforme" }));
  await box(page, "btnSort", page.getByRole("button", { name: "Trier par" }));
  await box(page, "btnExcludeGiants", page.locator("label").filter({ hasText: "Exclure les géants" }));
  await box(page, "btnSearch", page.getByRole("button", { name: "Chercher" }));
  await box(page, "colRevenue", page.locator("span").filter({ hasText: /^MRR estimé$/ }));
  await box(page, "colRating", page.locator("span").filter({ hasText: /^Note$/ }));
  await box(page, "table", page.locator('a[href^="/app/"]').first().locator(".."));
  await box(page, "row0", page.locator('a[href^="/app/"]').first());
  await box(page, "rowLast", page.locator('a[href^="/app/"]').nth(7));

  // 2. Popover Plateforme ouvert
  await page.getByRole("button", { name: "Plateforme" }).click();
  const pop = page.locator("div.absolute.z-30");
  await pop.waitFor();
  await box(page, "optIos", pop.getByRole("button", { name: "iOS", exact: true }));
  await box(page, "optAndroid", pop.getByRole("button", { name: "Android", exact: true }));
  await shot(page, "apps-platform-open");

  // 3. Filtre iOS applique
  await pop.getByRole("button", { name: "iOS", exact: true }).click();
  await settle(page);
  await page.getByRole("button", { name: "Plateforme" }).waitFor();
  await shot(page, "apps-ios");

  // 3bis. Android (pour un swap rapide iOS -> Android)
  await page.goto(`${BASE}/?platform=android&excludeGiants=1&sort=revenue`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Plateforme" }).waitFor();
  await shot(page, "apps-android");

  // 4. Popover Trier par ouvert (sur iOS)
  await page.goto(`${BASE}/?platform=ios&excludeGiants=1&sort=revenue`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Trier par" }).click();
  await pop.waitFor();
  await box(page, "optSortRevenue", pop.getByRole("button", { name: "Revenu estimé" }));
  await box(page, "optSortRating", pop.getByRole("button", { name: "Note", exact: true }));
  await shot(page, "apps-sort-open");

  // 5. Tri par note
  await pop.getByRole("button", { name: "Note", exact: true }).click();
  await settle(page);
  await page.getByRole("button", { name: "Trier par" }).waitFor();
  await shot(page, "apps-sort-rating");

  // 6. Recherche : resultats pour le terme
  await page.goto(`${BASE}/?q=${encodeURIComponent(SEARCH_TERM)}&platform=ios&excludeGiants=1&sort=revenue`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Plateforme" }).waitFor();
  await shot(page, "apps-search");
  await box(page, "searchRow0", page.locator('a[href^="/app/"]').first());
  const firstHref = await page.locator('a[href^="/app/"]').first().getAttribute("href");
  console.log("first search result:", firstHref, "(attendu /app/" + APP_ID + ")");

  // 7. Fiche detail (haut)
  await page.goto(`${BASE}/app/${APP_ID}`, { waitUntil: "networkidle" });
  await page.locator("h1").waitFor();
  await shot(page, "detail-top");
  await box(page, "detailTitle", page.locator("h1"));
  await box(page, "detailStats", page.locator("div.grid.grid-cols-1.divide-y"));
  await box(page, "detailRealPrice", page.getByText("Prix réel", { exact: true }));
  await box(page, "detailMaintained", page.getByText(/Activement maintenue|Actively maintained/));
  await box(page, "btnClone", page.getByRole("link", { name: "Cloner cette app" }));
  console.log("negative reviews heading:", await page.getByText(/^Avis négatifs \(\d+\)$/).count());

  await ctx.close();
}

// ---------- Contexte HAUT 1920x2600 : la fiche entiere en une image (le layout est h-screen avec
// un panneau central qui scrolle -> fullPage ne marche pas, on agrandit le viewport a la place) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 2600 }, deviceScaleFactor: 2, locale: "fr-FR" });
  const page = await ctx.newPage();
  const tall = {};
  const tbox = async (key, locator) => {
    try {
      const b = await locator.first().boundingBox({ timeout: 4000 });
      if (b) tall[key] = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
      else console.warn("no tall box for", key);
    } catch (e) {
      console.warn("tall box failed", key, e.message.split("\n")[0]);
    }
  };

  await page.goto(`${BASE}/app/${APP_ID}`, { waitUntil: "networkidle" });
  await page.locator("h1").waitFor();
  await shot(page, "detail-tall");
  await tbox("stats", page.locator("div.grid.grid-cols-1.divide-y"));
  await tbox("realPrice", page.getByText("Prix réel", { exact: true }));
  await tbox("btnClone", page.getByRole("link", { name: "Cloner cette app" }));
  await tbox("iapSection", page.locator("div.soft-card").filter({ has: page.getByText(/Prix.*(abonnement|IAP|réels)/i) }));
  await tbox("suggestionsSection", page.locator("div.soft-card").filter({ has: page.getByText("Features à ajouter") }));
  await tbox("reviewsSection", page.locator("div.soft-card").filter({ has: page.getByText(/^Avis négatifs \(\d+\)$/) }));
  await tbox("reviewsHeading", page.getByText(/^Avis négatifs \(\d+\)$/));
  await tbox("suggestionsHeading", page.getByText("Features à ajouter"));
  boxes.tall = tall;

  // 8. Atelier clone : generation auto puis brief deplie
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${BASE}/creative/${APP_ID}?tab=prompt&autogen=1`, { waitUntil: "domcontentloaded" });
  try {
    await page.getByText("Génération en cours").waitFor({ timeout: 15000 });
    await page.waitForTimeout(1500);
    await shot(page, "clone-loading");
    await page.getByText("Génération en cours").waitFor({ state: "detached", timeout: 300000 });
  } catch (e) {
    console.warn("etat loading non capture :", e.message.split("\n")[0]);
  }
  await settle(page);
  // Le brief genere apparait dans "Générations précédentes" (router.refresh) — on deplie la 1re carte
  const card = page.locator("div.soft-card").filter({ has: page.locator("button:has(svg)") }).filter({ hasNot: page.getByText("Cloner cette app") }).first();
  await card.waitFor({ timeout: 20000 });
  await card.locator("button").first().click();
  await page.waitForTimeout(800);
  await shot(page, "clone-done");
  await box(page, "cloneCard", card);
  await box(page, "cloneText", card.locator("div.max-h-\\[32rem\\]"));
  const promptText = await card.locator("div.max-h-\\[32rem\\]").innerText().catch(() => "");
  fs.writeFileSync(`${OUT}/clone-prompt.txt`, promptText);
  console.log("prompt chars:", promptText.length);

  // Version haute du brief pour l'effet de defilement
  await page.setViewportSize({ width: 1920, height: 2600 });
  await page.waitForTimeout(600);
  await shot(page, "clone-tall");
  await tbox("cloneText", card.locator("div.max-h-\\[32rem\\]"));
  boxes.tall = tall;

  await ctx.close();
}

fs.writeFileSync(`${OUT}/boxes.json`, JSON.stringify(boxes, null, 2));
console.log(JSON.stringify(boxes, null, 1));
await browser.close();
