import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.github.abdullah_tuncer.envantr',
  appName: 'EnvanTR',
  webDir: 'dist',
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      androidIsEncryption: false,
      electronIsEncryption: true,
    },
    SplashScreen: {
      launchAutoHide: false,       // otomatik gizleme kapalı
      showSpinner: false,
      androidScaleType: "CENTER_INSIDE",
    }
  }
};

export default config;
