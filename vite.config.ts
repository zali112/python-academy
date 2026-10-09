import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// base заполняется переменной окружения при публикации на GitHub Pages.
// Локально base = "/", поэтому dev-сервер работает на корень сайта.
// Пример: VITE_BASE=/python-academy/ vite build
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
