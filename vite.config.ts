import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sitemap from "vite-plugin-sitemap";

// Update this to your real production domain before deploying.
const SITE_URL = "https://varundhanak.dev";

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: SITE_URL,
      dynamicRoutes: [
        "/",
        "/projects/businessos",
        "/projects/pan-fraud-detection",
        "/projects/mechago",
        "/lab",
        "/lab/image",
        "/lab/video",
        "/lab/chat",
        "/lab/pdf",
        "/lab/business-card",
        "/lab/content",
      ],
    }),
  ],
  resolve: {
    alias: { "@": "/src" },
  },
  build: {
    target: "es2020",
    sourcemap: false,
  },
});
