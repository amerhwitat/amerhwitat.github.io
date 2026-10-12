import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  root: "src",
  plugins: [react()],
  base: "/apps/octavianos/dist/",
  build: { outDir: "../dist", emptyOutDir: true, sourcemap: true }
});