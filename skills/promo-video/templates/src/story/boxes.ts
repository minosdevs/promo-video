// PLACEHOLDER — remplacé par scripts/boxes-to-ts.mjs après la première capture.
// Les clés utilisées par Demo.tsx (hero, ctaButton) doivent exister dans ton capture-plan.json.
export type Box = { x: number; y: number; w: number; h: number };
export const boxes = {
  hero: { x: 560, y: 120, w: 800, h: 400 },
  ctaButton: { x: 860, y: 560, w: 200, h: 56 },
  tall: { viewportHeight: 3400 },
} as const;
