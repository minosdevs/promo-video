import "./index.css";
import { Composition, Folder } from "remotion";
import { Story, STORY_DURATION, storySchema } from "./story/Story";
import { Hook } from "./story/scenes/Hook";
import { Tension } from "./story/scenes/Tension";
import { Demo } from "./story/scenes/Demo";
import { Outro } from "./story/scenes/Outro";

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

const DEFAULTS = {
  hookLine1: "T'en as marre de",
  hookLine2: "perdre du temps là-dessus ?",
  hookHighlight: "perdre du temps",
  tensionLine1: "Des heures à chercher.",
  tensionLine2: "Pour rien.",
  tagline: "Le produit qui règle ça. En quelques clics.",
  ctaLabel: "Essaie gratuitement →",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Story" component={Story} durationInFrames={STORY_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} schema={storySchema} defaultProps={DEFAULTS} />
      {/* Chaque scene seule : pratique pour iterer dans le Studio ou rendre une still */}
      <Folder name="Scenes">
        <Composition id="Hook" component={Hook} durationInFrames={120} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ line1: DEFAULTS.hookLine1, line2: DEFAULTS.hookLine2, highlight: DEFAULTS.hookHighlight }} />
        <Composition id="Tension" component={Tension} durationInFrames={120} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ line1: DEFAULTS.tensionLine1, line2: DEFAULTS.tensionLine2 }} />
        <Composition id="Demo" component={Demo} durationInFrames={840} fps={FPS} width={WIDTH} height={HEIGHT} />
        <Composition id="Outro" component={Outro} durationInFrames={150} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ tagline: DEFAULTS.tagline, ctaLabel: DEFAULTS.ctaLabel }} />
      </Folder>
    </>
  );
};
