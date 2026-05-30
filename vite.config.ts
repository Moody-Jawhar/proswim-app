import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isCapacitor = process.env.BUILD_TARGET === "capacitor";

export default defineConfig({
  plugins: [react()],
  base: isCapacitor ? "/" : "/Mobilev1/",
  server: {
    allowedHosts: true,
    proxy: {
      "/Proswim_API": {
        target: "https://admin.proswim-lb.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});