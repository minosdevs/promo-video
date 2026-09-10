import { AbsoluteFill } from "remotion";
import { brand } from "../brand";

// Fond sombre + semis de points (CSS pur, pas d'image) + halo optionnel couleur accent.
export const DotGrid: React.FC<{ glow?: boolean }> = ({ glow = true }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: brand.dark }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(#3f3f46 1.6px, transparent 1.6px)",
          backgroundSize: "30px 30px",
          opacity: 0.6,
        }}
      />
      {glow ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 15%, ${brand.accentGlow}, transparent 70%)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
