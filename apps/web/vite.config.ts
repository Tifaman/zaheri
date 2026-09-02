import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Read directly from process.env (not import.meta.env — that's only for
// client code): Render injects build-time env vars this way, and it lets
// the PWA cache rule below match the API's real origin in production
// instead of always assuming same-origin '/api'.
const apiBaseUrl = process.env.VITE_API_BASE_URL ?? '';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ZaHeri',
        short_name: 'ZaHeri',
        description: 'Voice-first, guided patient companion for Muhimbili National Hospital.',
        theme_color: '#0b6bcb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        // TODO(asset): replace placeholder icons with the real ZaHeri PWA icon set.
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              apiBaseUrl ? url.origin === new URL(apiBaseUrl).origin : url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: { cacheName: 'zaheri-api-cache' },
          },
        ],
      },
    }),
  ],
  server: {
    // Binds to all network interfaces (not just localhost) so the dev
    // server can be reached from a phone/tablet on the same LAN/Wi-Fi —
    // useful for testing the touch UI and PWA install flow on a real
    // device. Dev-only; production serves from a real host, not `vite dev`.
    host: true,
    // Vite 5's DNS-rebinding guard rejects any Host header it doesn't
    // recognise — which blocks the random subdomain a Cloudflare quick
    // tunnel assigns on every run. Allow the whole trycloudflare.com
    // family (dev-only demo tunnels) rather than one throwaway hostname.
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': {
        // 3000 is taken by an unrelated project on this machine; the
        // ZaHeri API runs on 3001 instead (see apps/api/.env's PORT).
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
