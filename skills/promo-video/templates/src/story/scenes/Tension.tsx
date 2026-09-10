import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../../components/DotGrid";
import { brand, fontFamily } from "../../brand";

// Scene 2 — tension (4 s) : deux lignes a gauche (la 2e en accent), a droite une liste anonyme qui
// defile en boucle (le "statu quo" : classement, tableur, boite mail... a adapter), qui se floute
// quand la punchline tombe, puis zoom d'anticipation + flash blanc vers le drop musical.
const ROWS = [0, 1, 2, 3, 4, 5, 6];

export const Tension: React.FC<{ line1: string; line2: string; rowSuffix?: string }> = ({ line1, line2, rowSuffix = "+100M" }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [95, 120], [1, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.6, 0, 0.9, 0.4) });
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: brand.dark }}>
      <AbsoluteFill style={{ scale: String(zoom) }}>
        <DotGrid glow={false} />
        <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 150px", gap: 90 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 40 }}>
            <Interactive.Div
              name="Ligne 1"
              style={{
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 88,
                lineHeight: 1.05,
                letterSpacing: -3,
                opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                translate: interpolate(frame, [0, 18], ["-60px 0px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
              }}
            >
              {line1}
            </Interactive.Div>
            <Interactive.Div
              name="Ligne 2"
              style={{
                color: brand.accent,
                fontWeight: 800,
                fontSize: 88,
                lineHeight: 1.05,
                letterSpacing: -3,
                opacity: interpolate(frame, [48, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                translate: interpolate(frame, [48, 66], ["-60px 0px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
              }}
            >
              {line2}
            </Interactive.Div>
          </div>
          <div
            style={{
              width: 700,
              height: 820,
              overflow: "hidden",
              maskImage: "linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
              opacity: interpolate(frame, [50, 64], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              filter: `blur(${interpolate(frame, [50, 64], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 18, translate: `0px ${-((frame * 3.2) % 130)}px` }}>
              {[...ROWS, ...ROWS].map((i, k) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 26,
                    height: 112,
                    padding: "0 30px",
                    borderRadius: 24,
                    backgroundColor: brand.dark2,
                    flexShrink: 0,
                    opacity: interpolate(frame, [4 + (k % 7) * 4, 16 + (k % 7) * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                    translate: interpolate(frame, [4 + (k % 7) * 4, 18 + (k % 7) * 4], ["80px 0px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
                  }}
                >
                  <div style={{ width: 48, color: brand.muted, fontWeight: 800, fontSize: 38 }}>{(k % 7) + 1}</div>
                  <div style={{ width: 72, height: 72, borderRadius: 18, backgroundColor: "#3f3f46" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ height: 20, width: `${52 - (i % 7) * 4}%`, borderRadius: 10, backgroundColor: "#52525b" }} />
                    <div style={{ height: 14, width: `${30 + (i % 3) * 6}%`, borderRadius: 7, backgroundColor: "#3f3f46" }} />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 600, color: brand.muted }}>{rowSuffix}</div>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: interpolate(frame, [112, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};
