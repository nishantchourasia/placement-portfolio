import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Emit <link rel="preload"> for the two fonts used above the fold.
 *
 * Font files are referenced from the stylesheet, so the browser cannot even
 * discover them until the render-blocking CSS has been fetched and parsed —
 * one round trip after it could have started. Their names are content-hashed
 * at build time, which is why this cannot simply be written into index.html
 * by hand.
 *
 * The mono face is deliberately not preloaded: it sets labels and metrics, so
 * swapping it late costs a reflow of small text rather than of the headline,
 * and three preloads would compete with the JS for the same connection.
 */
function preloadFonts(): Plugin {
  const wanted = ["inter-latin", "instrument-serif-latin"];

  return {
    name: "preload-fonts",
    apply: "build",
    enforce: "post",
    transformIndexHtml(_html, context) {
      const files = Object.keys(context.bundle ?? {}).filter(
        (name) =>
          name.endsWith(".woff2") && wanted.some((w) => name.includes(w)),
      );

      return files.map((file) => ({
        tag: "link",
        attrs: {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: `./${file}`,
          crossorigin: "anonymous",
        },
        injectTo: "head-prepend" as const,
      }));
    },
  };
}

// `base: "./"` keeps every asset reference relative, so the built site works
// from a subdirectory (GitHub Pages project sites, a docs/ folder, or a plain
// file:// open) without knowing its deployment path in advance.
export default defineConfig({
  plugins: [react(), preloadFonts()],
  base: "./",
  server: {
    port: 5173,
    // Fail loudly rather than drifting to 5174. A dev server on an unexpected
    // port is how you end up looking at a stale build and not knowing it.
    strictPort: true,
  },
  build: {
    target: "es2020",
    assetsInlineLimit: 0,
    /*
     * 520 kB, not the default 500 or the previous 300.
     *
     * One chunk legitimately exceeds it: `scene`, which is three.js. It is
     * dynamically imported, so it is not in the initial bundle and is only
     * fetched on a device that passed the capability check in HeroScene.tsx —
     * never on a phone, never under reduced motion, never without WebGL. The
     * limit is raised so that a real regression in the *entry* chunk still
     * trips the warning instead of being lost in an expected one.
     */
    chunkSizeWarningLimit: 520,
  },
});
