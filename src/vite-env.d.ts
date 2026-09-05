/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "*.scss";

interface Window {
  EXCALIDRAW_ASSET_PATH: string | string[] | undefined;
}
