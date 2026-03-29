import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digTrans.AnKe',
  appName: 'AnKeCRM',
  webDir: 'dist',
  server: {
    url: 'http://167.86.92.182',
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