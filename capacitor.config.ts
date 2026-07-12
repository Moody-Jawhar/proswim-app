import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proswimlb.app',
  appName: 'ProSwim',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['admin.proswim-lb.com'],
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
