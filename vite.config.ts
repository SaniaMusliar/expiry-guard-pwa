import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.BASE_PATH || '/',
    server: { port: 3000, strictPort: true },
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webp}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/world\.openfoodfacts\.org\/.*$/i,
              handler: 'NetworkFirst',
              options: { cacheName: 'open-food-facts', expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 } },
            },
            {
              urlPattern: /^https:\/\/images\.openfoodfacts\.org\/.*$/i,
              handler: 'CacheFirst',
              options: { cacheName: 'food-images', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 } },
            },
          ],
        },
      }),
    ],
  }
})
