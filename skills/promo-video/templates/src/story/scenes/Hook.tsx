import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../../components/DotGrid";
import { brand, fontFamily } from "../../brand";

// Scene 1 — accroche cinetique (4 s) : chaque mot "pop" avec un ressort, le groupe `highlight`
// (present dans line2) se surligne en accent, deux halos derivent en fond, fondu vers le noir a la fin.
// Copie pilotee par les props de Story (editable dans le Studio).
const Word: React.FC<{ text: string; at: number; color?: string }> = ({ text, at, color = "#ffffff" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 11, mass: 0.6 }),
  });
  const o = interpolate(frame, [at, at + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <span style={{ display: "inline-block", color, opacity: o, scale: String(0.6 + 0.4 * p), translate: `0px ${(1 - p) * 40}px`, marginRight: 30 }}>
      {text}
    </span>
  );
};

export const Hook: React.FC<{ line1: string; line2: string; highlight: string; highlightWidth?: number }> = ({
  line1,
  line2,
  highlight,
  highlightWidth = 600,
}) => {
  const frame = useCurrentFrame();
  const w1 = line1.split(" ");
  const w2 = line2.split(" ");
  const nHl = highlight.split(" ").length; // les N premiers mots de line2 sont surlignes
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotGrid />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 420px at 20% 30%, ${brand.accentGlow}, transparent 70%)`,
          translate: `${Math.sin(frame / 40) * 80}px ${Math.cos(frame / 50) * 40}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 360px at 80% 75%, ${brand.accentGlow}, transparent 70%)`,
          opacity: 0.7,
          translate: `${Math.cos(frame / 45) * -60}px ${Math.sin(frame / 38) * 50}px`,
        }}
      />
      <AbsoluteFill name="Texte" style={{ justifyContent: "center", padding: "0 150px", fontWeight: 800, fontSize: 120, lineHeight: 1.12, letterSpacing: -4 }}>
        <div>
          {w1.map((w, i) => (
            <Word key={w + i} text={w} at={4 + i * 4} />
          ))}
        </div>
        <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
          <Interactive.Span
            name="Surlignage"
            style={{
              position: "absolute",
              left: -20,
              top: 8,
              height: 128,
              width: highlightWidth,
              borderRadius: 26,
              backgroundColor: brand.accent,
              transformOrigin: "left center",
              scale: interpolate(frame, [52, 74], ["0 1", "1 1"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          />
          <span style={{ position: "relative" }}>
            {w2.map((w, i) => (
              <Word key={w + i} text={w} at={34 + i * 5} color={i < nHl ? "#ffffff" : brand.muted2} />
            ))}
          </span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: brand.dark, opacity: interpolate(frame, [108, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};
