import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymcar.pro',
  appName: 'gymcar',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
