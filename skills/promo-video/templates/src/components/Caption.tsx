import { Easing, interpolate, useCurrentFrame } from "remotion";
import { brand, fontFamily } from "../brand";

// Legende plein cadre : grosse pilule sombre qui glisse depuis la gauche, barre d'accent a gauche,
// mot(s) en accent via `accent`. Visible de `from` a `to` (frames relatifs a la sequence). Fond
// opaque pour rester lisible par-dessus n'importe quelle capture.
export const Caption: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
  accent?: string;
  position?: "bottom-left" | "bottom-center" | "top-center";
  size?: number;
}> = ({ from, to, children, accent, position = "bottom-left", size = 46 }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 2) return null;
  const enter = interpolate(frame, [from, from + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const exit = interpolate(frame, [to - 10, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = Math.min(enter, exit);
  const pos: React.CSSProperties =
    position === "bottom-left"
      ? { left: 90, bottom: 70 }
      : position === "bottom-center"
        ? { left: "50%", bottom: 70, translate: "-50% 0" }
        : { left: "50%", top: 60, translate: "-50% 0" };
  return (
    <div
      style={{
        position: "absolute",
        ...pos,
        fontFamily,
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "22px 36px",
        borderRadius: 24,
        backgroundColor: "rgba(24,24,27,0.94)",
        color: "#ffffff",
        fontSize: size,
        fontWeight: 800,
        letterSpacing: -1,
        lineHeight: 1.15,
        boxShadow: "0 30px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)",
        opacity: o,
        translate: `${(1 - enter) * -60}px ${(1 - exit) * 30}px`,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ width: 12, height: size * 0.9, borderRadius: 6, backgroundColor: brand.accent, flexShrink: 0 }} />
      <div>
        {children}
        {accent ? <span style={{ color: brand.accent }}> {accent}</span> : null}
      </div>
    </div>
  );
};
