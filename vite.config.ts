import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'PharmaCare Med Scan',
        short_name: 'Med Scan',
        description: 'Barcode lookup for trusted medicine product details.',
        theme_color: '#123f2d',
        background_color: '#f5faf8',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/app-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/admin\/?/],
        runtimeCaching: [],
      },
    }),
  ],
  server: {
    allowedHosts: true,
    host: '127.0.0.1',
    port: 5175,
    strictPort: true,
  },
});
