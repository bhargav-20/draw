/**
 * Copies Excalidraw's canvas fonts out of the package into `public/fonts` so
 * they are served from our own origin (required for offline / PWA use).
 * The package resolves them at runtime relative to `window.EXCALIDRAW_ASSET_PATH`.
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "node_modules/@excalidraw/excalidraw/dist/prod/fonts");
const target = resolve(root, "public/fonts");

if (!existsSync(source)) {
  console.error(`[copy-fonts] ${source} not found – run \`yarn install\` first`);
  process.exit(1);
}
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
console.log(`[copy-fonts] copied fonts → ${target}`);

// Excalifont ships as content-hashed unicode subsets, so the app's own
// `@font-face` (index.html, used for the hand-drawn empty states) has no stable
// name to point at. Alias the Latin subset — reliably the largest of them,
// since the others cover small symbol ranges — under a fixed filename.
// A wrong pick or a missing file only costs the hand-drawn look: the CSS
// fallback stack still renders the text.
const excalifont = resolve(target, "Excalifont");
const latin = readdirSync(excalifont)
  .filter((name) => name.endsWith(".woff2"))
  .map((name) => ({ name, size: statSync(resolve(excalifont, name)).size }))
  .sort((a, b) => b.size - a.size)[0];
if (latin) {
  copyFileSync(
    resolve(excalifont, latin.name),
    resolve(excalifont, "Excalifont-Regular-latin.woff2"),
  );
  console.log(`[copy-fonts] aliased ${latin.name} → Excalifont-Regular-latin.woff2`);
} else {
  console.warn("[copy-fonts] no Excalifont subset found – hand-drawn text will fall back");
}
