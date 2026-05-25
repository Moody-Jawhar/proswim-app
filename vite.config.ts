import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Mobilev1/",
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