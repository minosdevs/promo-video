import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BrowserFrame, CONTENT_W, CONTENT_H, CHROME_H } from "../../components/BrowserFrame";
import { Cursor, type CursorStop } from "../../components/Cursor";
import { Caption } from "../../components/Caption";
import { Callout } from "../../components/Callout";
import { DotGrid } from "../../components/DotGrid";
import { fontFamily } from "../../brand";
import { boxes } from "../boxes";
import { center, valueAt, zoomAt, type ZoomKey } from "../timeline";

// Scene 3-7 (8 s -> 36 s, 840 frames) — la demo du VRAI SaaS dans une fenetre de navigateur :
// captures reelles (public/shots, prises par scripts/capture.mjs) enchainees avec un curseur anime,
// des zooms "camera", des surlignages et des legendes. Sous-sequences (frames locaux) :
//   0-180   revelation + filtre plateforme (iOS)
//   180-330 tri par revenu / par note + "Exclure les geants"
//   330-420 recherche "sober" -> resultats -> clic sur la ligne
//   420-540 fiche detail : stats, prix reel, activement maintenue
//   540-690 defilement : suggestions IA puis avis negatifs
//   690-840 clic "Cloner cette app" -> generation -> brief + chips de sections
const FRAME_W = 1640;
const S = FRAME_W / CONTENT_W; // echelle capture -> fenetre
const FRAME_LEFT = (1920 - FRAME_W) / 2;
const FRAME_TOP = (1080 - (CONTENT_H * S + CHROME_H)) / 2;

const b = boxes;
const t = boxes.tall;

type Shot = { src: string; from: number; to: number; tall?: boolean };
const SHOTS: Shot[] = [
  { src: "shots/apps-default.png", from: 0, to: 92 },
  { src: "shots/apps-platform-open.png", from: 88, to: 124 },
  { src: "shots/apps-ios.png", from: 120, to: 207 },
  { src: "shots/apps-sort-open.png", from: 203, to: 257 },
  { src: "shots/apps-sort-rating.png", from: 253, to: 389 },
  { src: "shots/apps-search.png", from: 385, to: 429 },
  { src: "shots/detail-top.png", from: 425, to: 544 },
  { src: "shots/detail-tall.png", from: 540, to: 704, tall: true },
  { src: "shots/detail-top.png", from: 700, to: 724 },
  { src: "shots/clone-loading.png", from: 720, to: 764 },
  { src: "shots/clone-done.png", from: 760, to: 900 },
];

const c = center;
const ZOOM: ZoomKey[] = [
  { at: 0, zoom: 2.6, ox: c(b.badgeCount).x, oy: c(b.badgeCount).y },
  { at: 48, zoom: 1, ox: c(b.badgeCount).x, oy: c(b.badgeCount).y },
  { at: 86, zoom: 1, ox: c(b.btnPlatform).x, oy: c(b.btnPlatform).y + 90 },
  { at: 100, zoom: 1.65, ox: c(b.btnPlatform).x, oy: c(b.btnPlatform).y + 90 },
  { at: 124, zoom: 1.65, ox: c(b.btnPlatform).x, oy: c(b.btnPlatform).y + 90 },
  { at: 152, zoom: 1, ox: c(b.btnPlatform).x, oy: c(b.btnPlatform).y + 90 },
  { at: 198, zoom: 1, ox: c(b.btnSort).x + 80, oy: c(b.btnSort).y + 100 },
  { at: 212, zoom: 1.55, ox: c(b.btnSort).x + 80, oy: c(b.btnSort).y + 100 },
  { at: 256, zoom: 1.55, ox: c(b.btnSort).x + 80, oy: c(b.btnSort).y + 100 },
  { at: 280, zoom: 1.18, ox: c(b.colRating).x, oy: c(b.colRating).y + 240 },
  { at: 300, zoom: 1.18, ox: c(b.colRating).x, oy: c(b.colRating).y + 240 },
  { at: 318, zoom: 1, ox: c(b.btnExcludeGiants).x, oy: c(b.btnExcludeGiants).y },
  { at: 340, zoom: 1, ox: c(b.searchInput).x, oy: c(b.searchInput).y },
  { at: 354, zoom: 1.5, ox: c(b.searchInput).x, oy: c(b.searchInput).y },
  { at: 386, zoom: 1.5, ox: c(b.searchInput).x, oy: c(b.searchInput).y },
  { at: 400, zoom: 1, ox: c(b.searchRow0).x, oy: c(b.searchRow0).y },
  { at: 410, zoom: 1, ox: c(b.searchRow0).x, oy: c(b.searchRow0).y },
  { at: 425, zoom: 1.9, ox: c(b.searchRow0).x, oy: c(b.searchRow0).y },
  { at: 426, zoom: 1.3, ox: c(b.detailStats).x, oy: c(b.detailStats).y },
  { at: 458, zoom: 1, ox: c(b.detailStats).x, oy: c(b.detailStats).y },
  { at: 470, zoom: 1, ox: c(b.detailStats).x, oy: c(b.detailStats).y },
  { at: 538, zoom: 1.1, ox: c(b.detailStats).x, oy: c(b.detailStats).y - 60 },
  { at: 540, zoom: 1, ox: 960, oy: 540 },
  { at: 698, zoom: 1, ox: 960, oy: 540 },
  { at: 700, zoom: 1, ox: c(b.btnClone).x, oy: c(b.btnClone).y },
  { at: 716, zoom: 1.35, ox: c(b.btnClone).x, oy: c(b.btnClone).y },
  { at: 724, zoom: 1.35, ox: c(b.btnClone).x, oy: c(b.btnClone).y },
  { at: 742, zoom: 1, ox: c(b.cloneCard).x, oy: c(b.cloneCard).y },
  { at: 760, zoom: 1, ox: c(b.cloneText).x, oy: c(b.cloneText).y },
  { at: 840, zoom: 1.12, ox: c(b.cloneText).x, oy: c(b.cloneText).y },
];

// Defilement de la capture haute (px contenu), frames locaux
const SCROLL = [
  { at: 540, v: 0 },
  { at: 578, v: t.suggestionsSection.y - 140 },
  { at: 630, v: t.suggestionsSection.y - 140 },
  { at: 662, v: t.reviewsSection.y - 140 },
  { at: 694, v: t.reviewsSection.y - 140 },
  { at: 702, v: 0 },
];

const CURSOR: CursorStop[] = [
  { at: 60, x: 980, y: 640 },
  { at: 85, x: c(b.btnPlatform).x + 6, y: c(b.btnPlatform).y + 4, click: true },
  { at: 115, x: c(b.optIos).x - 40, y: c(b.optIos).y + 4, click: true },
  { at: 145, x: 1040, y: 640 },
  { at: 200, x: c(b.btnSort).x + 4, y: c(b.btnSort).y + 4, click: true },
  { at: 250, x: c(b.optSortRating).x - 40, y: c(b.optSortRating).y + 4, click: true },
  { at: 290, x: c(b.btnExcludeGiants).x, y: c(b.btnExcludeGiants).y + 6 },
  { at: 345, x: b.searchInput.x + 60, y: c(b.searchInput).y + 4, click: true },
  { at: 410, x: c(b.searchRow0).x - 200, y: c(b.searchRow0).y + 6, click: true },
  { at: 450, x: 1700, y: 700 },
  { at: 715, x: c(b.btnClone).x + 4, y: c(b.btnClone).y + 4, click: true },
  { at: 745, x: 1760, y: 820 },
];

const CLICK_FRAMES = CURSOR.filter((s) => s.click).map((s) => s.at);
const WHOOSH_FRAMES = [0, 383, 418, 540, 696, 720];
const CHIPS = ["Concept", "Persona", "Features", "Monétisation", "Stack", "Roadmap"];
const CHIP_START = 772;
const CHIP_STEP = 8;
const POP_FRAMES = CHIPS.map((_, i) => CHIP_START + i * CHIP_STEP);

const TYPED = "sober";
const TYPE_START = 350;
const TYPE_STEP = 5;

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const z = zoomAt(frame, ZOOM);
  const scrollY = valueAt(frame, SCROLL);

  // Entree de la fenetre au drop : ressort + bascule 3D
  const enter = interpolate(frame, [0, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 13, mass: 0.8 }),
  });
  // Pulsation sur chaque temps (120 BPM = 15 frames) — energie discrete
  const beat = Math.exp(-(frame % 15) / 4) * 0.007;
  const frameScale = (0.72 + 0.28 * enter) * (1 + beat);
  const flashTo = interpolate(frame, [0, 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flashDetail = interpolate(frame, [416, 424, 434], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const typedCount = Math.max(0, Math.min(TYPED.length, Math.floor((frame - TYPE_START) / TYPE_STEP) + 1));
  const showTyping = frame >= 347 && frame < 386;

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: "#18181b" }}>
      <DotGrid />
      {/* Halo orange qui respire derriere la fenetre */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 55% 45% at 50% 55%, rgba(249,115,22,0.22), transparent 70%)",
          scale: String(1 + 0.04 * Math.sin(frame / 12)),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: FRAME_LEFT,
          top: FRAME_TOP,
          perspective: 2200,
          opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <div
          style={{
            scale: String(frameScale),
            rotate: `x ${(1 - enter) * 14}deg`,
            transformOrigin: "50% 50%",
          }}
        >
          <BrowserFrame width={FRAME_W} url={frame < 425 ? "trkly.app/apps" : frame < 720 ? "trkly.app/app/sober-sobriety-tracker" : "trkly.app/creative/sober"}>
            {/* Scene 1920x1080 mise a l'echelle de la fenetre */}
            <div style={{ position: "absolute", left: 0, top: 0, width: CONTENT_W, height: CONTENT_H, scale: String(S), transformOrigin: "0 0" }}>
              {/* Couche zoom "camera" */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  scale: String(z.zoom),
                  transformOrigin: `${z.ox}px ${z.oy}px`,
                }}
              >
                {SHOTS.map((shot, i) =>
                  frame >= shot.from && frame < shot.to ? (
                    <div
                      key={shot.src + i}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: CONTENT_W,
                        height: CONTENT_H,
                        overflow: "hidden",
                        opacity: interpolate(frame, [shot.from, shot.from + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                      }}
                    >
                      <div style={{ position: "absolute", left: 0, top: 0, translate: shot.tall ? `0px ${-scrollY}px` : "0px 0px" }}>
                        <Img
                          src={staticFile(shot.src)}
                          style={{ width: CONTENT_W, height: shot.tall ? (CONTENT_W * 6800) / 3840 : CONTENT_H, display: "block" }}
                        />
                        {shot.tall ? (
                          <>
                            {/* Surlignages qui defilent AVEC la capture haute */}
                            <Callout {...t.suggestion0} from={584} to={640} fill color="#f97316" scale={1.4} label="Features suggérées par l'IA" labelSide="top" />
                            <Callout {...t.suggestion1} from={598} to={640} fill color="#f97316" scale={1.4} />
                            <Callout {...t.suggestion2} from={612} to={640} fill color="#f97316" scale={1.4} />
                            <Callout
                              x={t.reviewsHeading.x}
                              y={t.reviewsHeading.y}
                              w={t.reviewsHeading.w}
                              h={t.reviewsSection.h - 40}
                              from={668}
                              to={696}
                              color="#ef4444"
                              scale={1.4}
                              label="Avis négatifs = ta roadmap"
                              labelSide="top"
                            />
                          </>
                        ) : null}
                      </div>
                    </div>
                  ) : null,
                )}

                {/* Saisie dans la barre de recherche */}
                {showTyping ? (
                  <div
                    style={{
                      position: "absolute",
                      left: b.searchInput.x + 40,
                      top: b.searchInput.y + 4,
                      width: b.searchInput.w - 50,
                      height: b.searchInput.h - 8,
                      backgroundColor: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 17,
                      color: "#27272a",
                      fontWeight: 500,
                      opacity: interpolate(frame, [347, 350], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                    }}
                  >
                    {TYPED.slice(0, typedCount)}
                    <span style={{ width: 2, height: 20, marginLeft: 2, backgroundColor: "#f97316", opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0 }} />
                  </div>
                ) : null}

                {/* Surlignages sur les captures 1920x1080 */}
                <Callout {...b.optSortRevenue} from={208} to={248} label="Trie par revenu estimé" labelSide="right" pad={4} />
                <Callout x={b.colRating.x - 20} y={b.colRating.y - 12} w={b.colRating.w + 10} h={560} from={260} to={302} fill label="…ou par note" labelSide="top" pad={0} />
                <Callout {...b.btnExcludeGiants} from={290} to={332} label="Zéro géant dans tes résultats" labelSide="bottom" pad={6} />
                <Callout {...b.detailStats} from={442} to={536} label="Installs · Note · Revenu mensuel estimé" labelSide="top" pad={4} />
                <Callout {...b.detailRealPrice} from={468} to={536} color="#22c55e" label="Vrais prix scrapés sur l'App Store" labelSide="top" pad={6} />
                <Callout {...b.detailMaintained} from={494} to={536} color="#0ea5e9" label="Encore maintenue" labelSide="top" pad={6} />
                <Callout {...b.btnClone} from={706} to={718} pad={8} />

                {/* Chips des sections du brief genere */}
                {CHIPS.map((chip, i) => {
                  const at = CHIP_START + i * CHIP_STEP;
                  if (frame < at) return null;
                  const p = interpolate(frame, [at, at + 16], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.spring({ damping: 10, mass: 0.6 }),
                  });
                  return (
                    <div
                      key={chip}
                      style={{
                        position: "absolute",
                        left: 1572,
                        top: 330 + i * 92,
                        padding: "14px 24px",
                        borderRadius: 16,
                        backgroundColor: i % 2 === 0 ? "#18181b" : "#f97316",
                        color: "#ffffff",
                        fontSize: 26,
                        fontWeight: 800,
                        letterSpacing: -0.5,
                        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                        opacity: p,
                        scale: String(0.5 + 0.5 * p),
                        rotate: `${(1 - p) * -12 + (i % 2 === 0 ? -3 : 3)}deg`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ✓ {chip}
                    </div>
                  );
                })}

                <Cursor stops={CURSOR} visibleFrom={60} scale={1.35} />
              </div>
            </div>
          </BrowserFrame>
        </div>
      </div>

      {/* Legendes plein cadre */}
      <Caption from={18} to={82} accent="iOS + Android.">135 652 apps analysées.</Caption>
      <Caption from={124} to={178}>Filtre par plateforme, pays, catégorie.</Caption>
      <Caption from={206} to={252} accent="revenu estimé…">Trie par</Caption>
      <Caption from={260} to={300} accent="par note.">…ou</Caption>
      <Caption from={302} to={334} accent="Que des apps que tu peux battre.">Zéro géant.</Caption>
      <Caption from={340} to={406} accent="N'importe lequel.">Cherche un sujet.</Caption>
      <Caption from={440} to={536} accent="ne te dira jamais.">Tout ce que le dev</Caption>
      <Caption from={560} to={644} accent="analysés par l'IA.">Les avis négatifs,</Caption>
      <Caption from={656} to={698} accent="= ta roadmap.">Ce que les users détestent</Caption>
      <Caption from={724} to={790} accent="Le brief complet.">Un clic.</Caption>
      <Caption from={794} to={840} accent="Build.">Colle-le dans Claude.</Caption>

      {/* Flashs */}
      <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: flashTo, pointerEvents: "none" }} />
      <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: flashDetail * 0.9, pointerEvents: "none" }} />

      {/* Bruitages */}
      {CLICK_FRAMES.map((f) => (
        <Sequence key={`click-${f}`} from={f} durationInFrames={8}>
          <Audio src={staticFile("audio/click.wav")} volume={0.7} />
        </Sequence>
      ))}
      {WHOOSH_FRAMES.map((f) => (
        <Sequence key={`whoosh-${f}`} from={f} durationInFrames={20}>
          <Audio src={staticFile("audio/whoosh.wav")} volume={0.5} />
        </Sequence>
      ))}
      {POP_FRAMES.map((f) => (
        <Sequence key={`pop-${f}`} from={f} durationInFrames={8}>
          <Audio src={staticFile("audio/pop.wav")} volume={0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
