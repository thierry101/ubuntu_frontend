import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digTrans.AnKe',
  appName: 'AnKeCRM',
  webDir: 'dist',
  server: {
    // url: 'https://ankecrm.app',
    url: 'http://192.168.1.7:4200',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#1565C0',
    },
    Filesystem: {
      iosScheme: 'ionic'
    },
    SplashScreen: {
      launchShowDuration: 2000,        // durée d'affichage en ms
      launchAutoHide: true,            // masquer automatiquement
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true,
    }
  }
};

export default config;