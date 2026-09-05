import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    "process.env.IS_PREACT": JSON.stringify("false"),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    server: {
      deps: {
        // the package's dev build uses extensionless deep imports (roughjs/bin/rough)
        // which Node's ESM resolver rejects – let Vite transform it instead
        inline: [/@excalidraw\//, "fflate"],
      },
    },
  },
});
