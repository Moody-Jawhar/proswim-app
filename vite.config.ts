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
      // Dev currently targets the LOCAL API (localhost:5126) so new endpoints
      // (Personal Information / change requests) work before they're deployed.
      // To go back to the deployed test API, restore:
      //   target: "https://admin.proswim-lb.com" and remove the rewrite.
      "/V27_API": {
        target: "http://localhost:5126",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/V27_API/, ""),
      },
      "/Proswim_API": {
        target: "https://admin.proswim-lb.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});