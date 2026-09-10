import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BrowserFrame, CONTENT_W, CONTENT_H, CHROME_H } from "../../components/BrowserFrame";
import { Cursor, type CursorStop } from "../../components/Cursor";
import { Caption } from "../../components/Caption";
import { Callout } from "../../components/Callout";
import { DotGrid } from "../../components/DotGrid";
import { brand, fontFamily } from "../../brand";
import { boxes } from "../boxes";
import { center, valueAt, zoomAt, type ZoomKey } from "../timeline";

// Scene demo — le VRAI produit dans une fenetre de navigateur, a partir des captures de
// public/shots (scripts/capture.mjs) et de leurs coordonnees (src/story/boxes.ts).
//
// SQUELETTE A COMPLETER : remplace les SHOTS / ZOOM / CURSOR / captions par ceux de TON scenario
// (voir Demo.example.tsx dans le skill pour une demo complete de 28 s avec 11 captures, scroll,
// saisie clavier, chips). Regles : tout est pilote par des frames LOCAUX (0 = debut de la scene) ;
// aucune coordonnee en dur, tout vient de `boxes` ; un clic = un stop `click: true` dans CURSOR
// (le son de clic en decoule automatiquement).
const FRAME_W = 1640;
const S = FRAME_W / CONTENT_W;
const FRAME_LEFT = (1920 - FRAME_W) / 2;
const FRAME_TOP = (1080 - (CONTENT_H * S + CHROME_H)) / 2;
const b = boxes;
const c = center;

type Shot = { src: string; from: number; to: number; tall?: boolean; tallHeight?: number };
// Chaque capture est visible de `from` a `to` (chevauchement de 4 frames = fondu). `tall` = capture
// haute (viewport agrandi) que l'on fait defiler avec SCROLL.
const SHOTS: Shot[] = [
  { src: "shots/home.png", from: 0, to: 124 },
  { src: "shots/feature.png", from: 120, to: 400 },
];

// Camera : zoom + origine (px de la capture 1920x1080), interpole entre keyframes.
const ZOOM: ZoomKey[] = [
  { at: 0, zoom: 2.4, ox: c(b.hero).x, oy: c(b.hero).y },
  { at: 45, zoom: 1, ox: c(b.hero).x, oy: c(b.hero).y },
  { at: 110, zoom: 1, ox: c(b.ctaButton).x, oy: c(b.ctaButton).y },
  { at: 124, zoom: 1.5, ox: c(b.ctaButton).x, oy: c(b.ctaButton).y },
  { at: 160, zoom: 1, ox: 960, oy: 540 },
];

// Defilement vertical des captures `tall` (px), par keyframes.
const SCROLL = [{ at: 0, v: 0 }];

// Curseur : points d'arrivee (frame, x, y) ; `click: true` = clic (onde + son).
const CURSOR: CursorStop[] = [
  { at: 60, x: 980, y: 640 },
  { at: 110, x: c(b.ctaButton).x, y: c(b.ctaButton).y, click: true },
  { at: 160, x: 1500, y: 700 },
];

const CLICK_FRAMES = CURSOR.filter((s) => s.click).map((s) => s.at);
const WHOOSH_FRAMES = [0, 118];

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const z = zoomAt(frame, ZOOM);
  const scrollY = valueAt(frame, SCROLL);
  const enter = interpolate(frame, [0, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.spring({ damping: 13, mass: 0.8 }) });
  const beat = Math.exp(-(frame % 15) / 4) * 0.007; // pulsation a 120 BPM (15 frames par temps)
  const frameScale = (0.72 + 0.28 * enter) * (1 + beat);
  const flashIn = interpolate(frame, [0, 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: brand.dark }}>
      <DotGrid />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 45% at 50% 55%, ${brand.accentGlow}, transparent 70%)`, scale: String(1 + 0.04 * Math.sin(frame / 12)) }} />

      <div style={{ position: "absolute", left: FRAME_LEFT, top: FRAME_TOP, perspective: 2200, opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <div style={{ scale: String(frameScale), rotate: `x ${(1 - enter) * 14}deg`, transformOrigin: "50% 50%" }}>
          <BrowserFrame width={FRAME_W} url={brand.domain}>
            <div style={{ position: "absolute", left: 0, top: 0, width: CONTENT_W, height: CONTENT_H, scale: String(S), transformOrigin: "0 0" }}>
              <div style={{ position: "absolute", inset: 0, scale: String(z.zoom), transformOrigin: `${z.ox}px ${z.oy}px` }}>
                {SHOTS.map((shot, i) =>
                  frame >= shot.from && frame < shot.to ? (
                    <div key={shot.src + i} style={{ position: "absolute", left: 0, top: 0, width: CONTENT_W, height: CONTENT_H, overflow: "hidden", opacity: interpolate(frame, [shot.from, shot.from + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
                      <div style={{ position: "absolute", left: 0, top: 0, translate: shot.tall ? `0px ${-scrollY}px` : "0px 0px" }}>
                        <Img src={staticFile(shot.src)} style={{ width: CONTENT_W, height: shot.tall ? (shot.tallHeight ?? 3400) : CONTENT_H, display: "block" }} />
                        {/* Les callouts qui doivent DEFILER avec une capture haute se placent ici (coordonnees `boxes.tall`) */}
                      </div>
                    </div>
                  ) : null,
                )}

                {/* Surlignages sur les captures 1920x1080 (coordonnees `boxes`) */}
                <Callout {...b.ctaButton} from={96} to={118} label="Le bouton qui change tout" labelSide="top" pad={6} />

                <Cursor stops={CURSOR} visibleFrom={60} scale={1.35} />
              </div>
            </div>
          </BrowserFrame>
        </div>
      </div>

      {/* Legendes plein cadre */}
      <Caption from={18} to={90} accent="en un coup d'oeil.">Tout ton produit</Caption>
      <Caption from={126} to={200} accent="un clic.">La feature clé, en</Caption>

      <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: flashIn, pointerEvents: "none" }} />

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
    </AbsoluteFill>
  );
};
