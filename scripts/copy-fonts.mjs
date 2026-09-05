/**
 * Copies Excalidraw's canvas fonts out of the package into `public/fonts` so
 * they are served from our own origin (required for offline / PWA use).
 * The package resolves them at runtime relative to `window.EXCALIDRAW_ASSET_PATH`.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
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
