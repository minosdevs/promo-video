import { Easing, interpolate, useCurrentFrame } from "remotion";
import { brand, fontFamily } from "../brand";

// Surlignage anime d'une zone de la capture (cadre orange arrondi qui se dessine + halo), avec une
// etiquette optionnelle. Coordonnees dans l'espace du parent (deja mises a l'echelle).
export const Callout: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  from: number;
  to?: number;
  label?: string;
  labelSide?: "top" | "bottom" | "left" | "right";
  color?: string;
  pad?: number;
  fill?: boolean;
  scale?: number;
}> = ({ x, y, w, h, from, to = 100000, label, labelSide = "top", color = brand.accent, pad = 8, fill = false, scale = 1 }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 2) return null;
  const p = interpolate(frame, [from, from + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const out = interpolate(frame, [to - 8, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = Math.min(p, out);
  // Pulsation douce continue du halo
  const pulse = 0.5 + 0.5 * Math.sin((frame - from) / 6);
  const labelPos: React.CSSProperties =
    labelSide === "top"
      ? { left: 0, bottom: "100%", marginBottom: 12 * scale }
      : labelSide === "bottom"
        ? { left: 0, top: "100%", marginTop: 12 * scale }
        : labelSide === "left"
          ? { right: "100%", top: "50%", translate: "0 -50%", marginRight: 14 * scale }
          : { left: "100%", top: "50%", translate: "0 -50%", marginLeft: 14 * scale };
  return (
    <div
      style={{
        position: "absolute",
        left: x - pad,
        top: y - pad,
        width: w + pad * 2,
        height: h + pad * 2,
        borderRadius: 12 * scale,
        border: `${3 * scale}px solid ${color}`,
        backgroundColor: fill ? `${color}22` : "transparent",
        boxShadow: `0 0 0 ${(6 + pulse * 6) * scale}px ${color}33, 0 0 ${30 * scale}px ${color}66`,
        opacity: o,
        scale: String(0.85 + 0.15 * p),
        fontFamily,
      }}
    >
      {label ? (
        <div
          style={{
            position: "absolute",
            ...labelPos,
            whiteSpace: "nowrap",
            backgroundColor: color,
            color: "#ffffff",
            fontWeight: 800,
            fontSize: 22 * scale,
            letterSpacing: -0.3,
            padding: `${7 * scale}px ${14 * scale}px`,
            borderRadius: 10 * scale,
            boxShadow: `0 10px 24px ${color}66`,
            opacity: interpolate(frame, [from + 8, from + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
