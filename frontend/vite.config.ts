import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// API local para o `npm run dev` (padrão: stack Docker local em :8080)
const API = process.env.API_URL ?? 'http://localhost:8080'

export default defineConfig({
  server: { proxy: { '/api': API, '/sanctum': API } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // rotas do Laravel nunca caem no index.html em cache do service worker
      workbox: { navigateFallbackDenylist: [/^\/api\//, /^\/sanctum\//, /^\/up$/] },
      includeAssets: ['favicon.svg', 'logo-mark.svg'],
      manifest: {
        name: 'Caliope',
        short_name: 'Caliope',
        description: 'Sua voz no mundo',
        theme_color: '#100c09',
        background_color: '#100c09',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
