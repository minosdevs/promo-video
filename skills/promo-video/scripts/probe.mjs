#!/usr/bin/env node
// Vérifie un rendu MP4 sans ffmpeg (celui de Playwright ne lit pas le H.264) : durée et pistes.
// À lancer DEPUIS le projet Remotion (mediabunny est une dépendance de @remotion/media).
// Usage : node probe.mjs out/video.mp4
import { createRequire } from "node:module";
import path from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("usage: node probe.mjs <fichier.mp4>");
  process.exit(1);
}
const require = createRequire(path.join(process.cwd(), "package.json"));
const { Input, ALL_FORMATS, FilePathSource } = await import(require.resolve("mediabunny"));
const input = new Input({ source: new FilePathSource(file), formats: ALL_FORMATS });
const dur = await input.computeDuration();
const tracks = await input.getTracks();
console.log(`${file}: ${dur.toFixed(2)} s`);
for (const t of tracks) {
  console.log(" -", t.type, t.codec, t.type === "video" ? `${t.displayWidth}x${t.displayHeight}` : `${t.numberOfChannels} ch ${t.sampleRate} Hz`);
}
if (!tracks.some((t) => t.type === "audio")) {
  console.warn("ATTENTION : aucune piste audio — la musique n'a pas été rendue ?");
  process.exitCode = 2;
}
