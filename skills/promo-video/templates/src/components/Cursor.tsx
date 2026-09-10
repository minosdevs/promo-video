import { Easing, interpolate, useCurrentFrame } from "remotion";
import { brand } from "../brand";

export type CursorStop = {
  /** frame (relative a la sequence) d'ARRIVEE a ce point */
  at: number;
  x: number;
  y: number;
  /** true = clic a l'arrivee (ripple + squash) */
  click?: boolean;
};

// Curseur souris anime : se deplace de point en point (easing doux), "squash" et onde orange au clic.
// Les coordonnees sont dans l'espace du parent (px). Le point (x,y) est la pointe de la fleche.
export const Cursor: React.FC<{ stops: CursorStop[]; scale?: number; visibleFrom?: number }> = ({
  stops,
  scale = 1,
  visibleFrom = 0,
}) => {
  const frame = useCurrentFrame();
  if (stops.length === 0 || frame < visibleFrom) return null;

  // Position : interpolation entre le stop precedent et le suivant
  let x = stops[0].x;
  let y = stops[0].y;
  for (let i = 1; i < stops.length; i++) {
    const prev = stops[i - 1];
    const next = stops[i];
    if (frame >= next.at) {
      x = next.x;
      y = next.y;
      continue;
    }
    if (frame > prev.at) {
      const travel = Math.max(1, next.at - prev.at);
      const start = next.at - Math.min(travel, 22); // le deplacement dure ~22 frames max
      const p = interpolate(frame, [start, next.at], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.3, 0.9, 0.25, 1),
      });
      // Legere courbe (arc) pour un mouvement moins robotique
      const arc = Math.sin(p * Math.PI) * 18;
      x = prev.x + (next.x - prev.x) * p;
      y = prev.y + (next.y - prev.y) * p - arc;
      break;
    }
    break;
  }

  // Clic : trouve le stop cliquable le plus recent dans les 16 dernieres frames
  let clickP = -1;
  for (const s of stops) {
    if (s.click && frame >= s.at && frame < s.at + 16) clickP = (frame - s.at) / 16;
  }
  const squash = clickP >= 0 && clickP < 0.35 ? 0.82 : 1;
  const opacity = interpolate(frame, [visibleFrom, visibleFrom + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity, pointerEvents: "none" }}>
      {clickP >= 0 ? (
        <div
          style={{
            position: "absolute",
            left: -36 * scale,
            top: -36 * scale,
            width: 72 * scale,
            height: 72 * scale,
            borderRadius: "50%",
            border: `${3 * scale}px solid ${brand.accent}`,
            opacity: 1 - clickP,
            scale: String(0.3 + clickP * 1.2),
          }}
        />
      ) : null}
      <svg
        width={34 * scale}
        height={44 * scale}
        viewBox="0 0 34 44"
        style={{ position: "absolute", left: 0, top: 0, scale: String(squash), transformOrigin: "0 0", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" }}
      >
        <path d="M3 2 L3 34 L11.5 26.5 L17.5 40 L23.5 37.5 L17.5 24 L29 23 Z" fill="#ffffff" stroke="#18181b" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
