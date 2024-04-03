import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymcar.pro',
  appName: 'gymcar',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
