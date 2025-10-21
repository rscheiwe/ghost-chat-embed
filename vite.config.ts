import { defineConfig } from "vite";
import { resolve } from "path";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  root: "./examples",
  server: {
    port: 5173,
    open: true,
    cors: true,
    watch: {
      ignored: ["!**/src/styles/**"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "ghost-chat-embed": resolve(__dirname, "./src/index.ts"),
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react/jsx-dev-runtime": "preact/jsx-dev-runtime",
    },
  },
  build: {
    outDir: "../examples-dist",
    emptyOutDir: true,
  },
});
