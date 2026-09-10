import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { DotGrid } from "../../components/DotGrid";
import { brand, fontFamily } from "../../brand";

// Scene finale — signature (5 s) : logo qui pop, nom du produit, tagline, bouton CTA.
export const Outro: React.FC<{ tagline: string; ctaLabel: string }> = ({ tagline, ctaLabel }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotGrid />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26, padding: "0 160px" }}>
        <Interactive.Div
          name="Logo"
          style={{
            width: 200,
            height: 200,
            borderRadius: 52,
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
            scale: interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.spring({ damping: 12, mass: 0.7 }), output: "perceptual-scale" }),
          }}
        >
          <Img src={staticFile(brand.logo)} style={{ width: 176, height: 176, objectFit: "contain" }} />
        </Interactive.Div>
        <Interactive.Div
          name="Nom"
          style={{
            marginTop: 14,
            fontSize: 120,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -5,
            lineHeight: 1,
            opacity: interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [12, 30], ["0px 40px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          {brand.name}
        </Interactive.Div>
        <Interactive.Div
          name="Tagline"
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: brand.muted2,
            textAlign: "center",
            lineHeight: 1.25,
            opacity: interpolate(frame, [24, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [24, 42], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          {tagline}
        </Interactive.Div>
        <Interactive.Div
          name="CTA"
          style={{
            marginTop: 22,
            padding: "22px 56px",
            borderRadius: 999,
            background: brand.gradPrimary,
            color: "#ffffff",
            fontSize: 40,
            fontWeight: 800,
            boxShadow: `0 16px 40px ${brand.accentGlow}`,
            opacity: interpolate(frame, [40, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            scale: interpolate(frame, [40, 66], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.spring({ damping: 12, mass: 0.7 }), output: "perceptual-scale" }),
          }}
        >
          {ctaLabel}
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
