import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isCapacitor = process.env.BUILD_TARGET === "capacitor";

export default defineConfig({
  plugins: [react()],
  base: isCapacitor ? "/" : "/Mobilev1/",
  server: {
    allowedHosts: true,
    proxy: {
      // V27_API = unified-auth test build; Proswim_API = production (old auth).
      "/V27_API": {
        target: "https://admin.proswim-lb.com",
        changeOrigin: true,
        secure: true,
      },
      "/Proswim_API": {
        target: "https://admin.proswim-lb.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});