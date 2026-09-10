import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { z } from "zod";
import { Hook } from "./scenes/Hook";
import { Tension } from "./scenes/Tension";
import { Demo } from "./scenes/Demo";
import { Outro } from "./scenes/Outro";

// Toute la copie est en props -> editable dans le Studio sans toucher au code.
export const storySchema = z.object({
  hookLine1: z.string(),
  hookLine2: z.string(),
  hookHighlight: z.string(),
  tensionLine1: z.string(),
  tensionLine2: z.string(),
  tagline: z.string(),
  ctaLabel: z.string(),
});

// Timeline ABSOLUE (30 fps), calee sur public/audio/music.wav (make-music.mjs --drop 8 --end 36) :
//   0-120     accroche      (nappe tendue)
//   120-240   tension       (riser -> flash blanc)
//   240-1080  demo          (DROP a 8 s = arrivee de la fenetre navigateur)
//   1080-1230 signature     (coup final a 36 s)
// Si tu changes ces bornes, regenere la musique avec les memes --drop / --end.
export const DEMO_START = 240;
export const DEMO_DURATION = 840;
export const OUTRO_START = DEMO_START + DEMO_DURATION;
export const STORY_DURATION = OUTRO_START + 150;

export const Story: React.FC<z.infer<typeof storySchema>> = (p) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#18181b" }}>
      <Audio src={staticFile("audio/music.wav")} volume={0.9} />
      <Sequence durationInFrames={120} name="Accroche">
        <Hook line1={p.hookLine1} line2={p.hookLine2} highlight={p.hookHighlight} />
      </Sequence>
      <Sequence from={120} durationInFrames={120} name="Tension">
        <Tension line1={p.tensionLine1} line2={p.tensionLine2} />
      </Sequence>
      <Sequence from={DEMO_START} durationInFrames={DEMO_DURATION} name="Demo produit">
        <Demo />
      </Sequence>
      <Sequence from={OUTRO_START} durationInFrames={150} name="Signature">
        <Outro tagline={p.tagline} ctaLabel={p.ctaLabel} />
      </Sequence>
    </AbsoluteFill>
  );
};
