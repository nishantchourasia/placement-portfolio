import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base: "./"` keeps every asset reference relative, so the built site works
// from a subdirectory (GitHub Pages project sites, a docs/ folder, or a plain
// file:// open) without knowing its deployment path in advance.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    target: "es2020",
    // Small site, single entry: one chunk avoids a second round trip for a
    // vendor file that would be a few kB.
    chunkSizeWarningLimit: 300,
  },
});
