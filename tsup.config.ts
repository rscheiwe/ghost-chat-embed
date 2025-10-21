import { defineConfig } from "tsup";

const useReact = process.env.GHOSTCHAT_REACT === "1";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: false,
  bundle: true,
  outDir: "dist",
  outExtension: () => ({ js: ".js" }),
  esbuildOptions(options) {
    options.banner = {
      js: `/**
 * GhostChat Embed
 * @license MIT
 * @version 1.0.0
 */`,
    };

    // Configure JSX
    options.jsx = "automatic";
    options.jsxImportSource = useReact ? "react" : "preact";

    // Alias React to Preact/compat (unless using real React)
    if (!useReact) {
      options.alias = {
        react: "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat",
        "react/jsx-runtime": "preact/jsx-runtime",
      };
    }
  },
  target: "es2020",
  platform: "browser",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    __GC_REACT__: JSON.stringify(useReact),
  },
});
