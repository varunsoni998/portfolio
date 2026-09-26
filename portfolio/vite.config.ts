import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Update this to your real production domain before deploying. Also
// used in index.html and src/components/Seo.tsx — keep all three in
// sync (or fix this to be read from one shared place if you template
// index.html at build time later).
// SITE_URL is documented here for that reason, even though this file
// doesn't consume it directly anymore — sitemap.xml is now a plain
// static file at public/sitemap.xml instead of build-time generated
// (see that file's comment for why).
// const SITE_URL = "https://varundhanak.dev";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": "/src" },
  },
  build: {
    target: "es2020",
    sourcemap: false,
  },
});
