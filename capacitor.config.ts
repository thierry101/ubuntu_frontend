import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digTrans.AnKe',
  appName: 'AnKeCRM',
  webDir: 'dist',
  server: {
    url: 'https://ankecrm.app',
    // url: 'http://192.168.1.7:4200',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#1565C0'
    }
  }
};

export default config;