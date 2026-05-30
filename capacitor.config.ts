import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proswim.app',
  appName: 'ProSwim',
  webDir: 'dist',
  server: {
    // API calls go through the real server in production
    androidScheme: 'https',
    // Allow the API proxy target directly from the native app
    allowNavigation: ['admin.proswim-lb.com'],
  },
};

export default config;
