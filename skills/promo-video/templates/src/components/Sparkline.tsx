import { Easing, interpolate, useCurrentFrame } from "remotion";

type Props = {
  values: number[];
  width: number;
  height: number;
  color: string;
  /** Frame (dans la sequence courante) a laquelle le trace commence a se dessiner */
  startFrame: number;
};

// Sparkline SVG pur, tracee progressivement (dashoffset), meme rendu que Sparkline.tsx dans Trkly.
export const Sparkline: React.FC<Props> = ({ values, width, height, color, startFrame }) => {
  const frame = useCurrentFrame();
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 3;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  // Longueur approximative du trace pour le dashoffset (assez precise pour une polyligne)
  let length = 0;
  for (let i = 1; i < pts.length; i++) {
    length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  const progress = interpolate(frame, [startFrame, startFrame + 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
      />
      <circle cx={last[0]} cy={last[1]} r={4.5} fill={color} opacity={progress >= 1 ? 1 : 0} />
    </svg>
  );
};
