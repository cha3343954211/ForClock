import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        // 开发模式禁用 SW，避免缓存干扰调试
        devOptions: { enabled: false },
        // 预缓存策略
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webp}'],
          // MediaPipe 资源单独按需缓存（避免预缓存 16MB）
          globIgnores: ['**/mediapipe/**'],
          // 单文件最大预缓存 5MB
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            // MediaPipe WASM 与模型：访问后再缓存
            {
              urlPattern: /\/mediapipe\/.*\.(wasm|task|js)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'mediapipe-assets',
                expiration: { maxEntries: 10, maxAgeSeconds: 30 * 24 * 60 * 60 }
              }
            },
            // 字体：长期缓存
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }
              }
            }
          ]
        },
        manifest: {
          name: 'ZenClock - 禅意时钟',
          short_name: 'ZenClock',
          description: '极简禅意时钟屏保，融合 AI 感悟与手势交互',
          theme_color: '#1A1A1A',
          background_color: '#1A1A1A',
          display: 'fullscreen',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          lang: 'zh-CN',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // 单 chunk 警告阈值上调到 800KB（MediaPipe 单独成块仍可能较大）
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            // React 核心独立成块，浏览器可长期缓存
            'react-vendor': ['react', 'react-dom'],
            // MediaPipe 含 WASM 解析逻辑，约 200KB，独立加载
            'mediapipe': ['@mediapipe/tasks-vision'],
            // Google AI SDK 独立成块
            'genai': ['@google/genai'],
            // 图标库
            'icons': ['lucide-react'],
          }
        }
      }
    }
  };
});
