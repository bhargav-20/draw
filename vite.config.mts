import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

import { APP_NAME } from "./src/constants";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // e.g. "/excalidraw-projects/" for GitHub Pages; "/" (default) elsewhere
  const base = env.VITE_BASE_PATH || "/";

  return {
    base,
    define: {
      // required by @excalidraw/excalidraw
      "process.env.IS_PREACT": JSON.stringify("false"),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "fonts/**/*.woff2",
          "favicon.svg",
          "apple-touch-icon.png",
        ],
        manifest: {
          name: APP_NAME,
          short_name: "Excalidraw Projects",
          description:
            "Local-first project & design manager in front of the Excalidraw canvas.",
          theme_color: "#6965db",
          background_color: "#ffffff",
          display: "standalone",
          start_url: base,
          scope: base,
          icons: [
            { src: "icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "icon-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          // precache the app, the excalidraw bundle and the Latin fonts so the
          // editor works fully offline after the first visit
          globPatterns: ["**/*.{js,css,html,svg,png,woff2,json,webmanifest}"],
          globIgnores: [
            // CJK fallback font (12 MB, 200+ subsets) and the mermaid text-to-diagram
            // bundle are cached on first use instead of up front
            "**/fonts/Xiaolai/**",
            "**/assets/mermaid-*.js",
          ],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          navigateFallback: `${base}index.html`,
          runtimeCaching: [
            {
              urlPattern: /\.woff2$/,
              handler: "CacheFirst",
              options: {
                cacheName: "fonts",
                expiration: {
                  maxEntries: 400,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /\/assets\/mermaid-.*\.js$/,
              handler: "CacheFirst",
              options: {
                cacheName: "mermaid",
                expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 90 },
              },
            },
          ],
        },
      }),
    ],
    optimizeDeps: {
      // only scan our own entry – `reference/` holds a clone of upstream excalidraw
      entries: ["index.html"],
      esbuildOptions: {
        // "Arbitrary module namespace identifier names" used by the package
        // are not supported by Vite's default pre-bundling target
        target: "es2022",
        treeShaking: true,
      },
    },
    build: {
      target: "es2022",
      // don't inline fonts/images as data URIs (keeps the SW precache sane)
      assetsInlineLimit: 0,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // text-to-diagram (mermaid + its renderers) is only loaded on demand;
            // keep it in one chunk that the service worker caches on first use
            if (
              /node_modules\/(mermaid|@mermaid-js|@excalidraw\/mermaid-to-excalidraw|cytoscape|katex|dagre|elkjs|d3|khroma|stylis|dompurify|marked)[/-]/.test(
                id,
              )
            ) {
              return "mermaid";
            }
            // the editor package itself (static parts only – its lazy chunks such
            // as the font subsetter stay separate) gets a stable, long-cached chunk
            if (
              /@excalidraw\/excalidraw\/dist\/(prod|dev)\/index\.js$/.test(id)
            ) {
              return "excalidraw";
            }
            return undefined;
          },
        },
      },
    },
    server: {
      port: 5173,
      open: false,
      watch: {
        ignored: ["**/reference/**", "**/design-canvas/**", "**/docs/**"],
      },
    },
  };
});
