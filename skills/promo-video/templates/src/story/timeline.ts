import { Easing, interpolate } from "remotion";

// Petits helpers de timeline pour la sequence demo (frames relatifs a la sequence).

export type ZoomKey = { at: number; zoom: number; ox: number; oy: number };

// Interpole zoom + origine (px CONTENU 1920x1080) entre keyframes successives, easing doux.
export function zoomAt(frame: number, keys: ZoomKey[]): ZoomKey {
  if (frame <= keys[0].at) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.at) {
      const p = interpolate(frame, [a.at, b.at], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.45, 0, 0.15, 1),
      });
      return { at: frame, zoom: a.zoom + (b.zoom - a.zoom) * p, ox: a.ox + (b.ox - a.ox) * p, oy: a.oy + (b.oy - a.oy) * p };
    }
  }
  return keys[keys.length - 1];
}

// Valeur scalaire par keyframes (ex: defilement vertical).
export function valueAt(frame: number, keys: { at: number; v: number }[], easing = Easing.bezier(0.45, 0, 0.15, 1)): number {
  if (frame <= keys[0].at) return keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.at) {
      return interpolate(frame, [a.at, b.at], [a.v, b.v], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
    }
  }
  return keys[keys.length - 1].v;
}

// Centre d'une boite
export const center = (b: { x: number; y: number; w: number; h: number }) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
