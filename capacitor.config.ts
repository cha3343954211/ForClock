import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zenclock.app.pro',
  appName: 'For Clock Pro',
  webDir: 'dist',
  android: {
    // Allow WebView to use camera
    allowMixedContent: false,
    // 启动时 WebView 背景色（避免 HTML 加载前出现白/黑闪屏）
    backgroundColor: '#1A1A1A',
  },
  ios: {
    // Allow WebView to use camera
    allowsLinkPreview: false,
    backgroundColor: '#1A1A1A',
  },
  server: {
    // Allow WebView to access navigator.mediaDevices
    androidScheme: 'https',
    iosScheme: 'https'
  }
};

export default config;

