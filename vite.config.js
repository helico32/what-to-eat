import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate' : le Service Worker se met à jour silencieusement en arrière-plan.
      // Pas de popup "nouvelle version disponible" — zéro friction pour le persona TDAH.
      registerType: 'autoUpdate',

      // injectManifest : on fournit notre propre SW (src/sw.js) au lieu du SW généré.
      // Nécessaire pour que FCM puisse intercepter les notifications en arrière-plan.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',

      manifest: {
        name: 'What to eat',
        short_name: 'What to eat',
        description: 'Gère ton frigo, réduis le gaspillage.',
        theme_color: '#FDF8F0',
        background_color: '#FDF8F0',
        display: 'standalone',
        start_url: '/',
        lang: 'fr',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },

      injectManifest: {
        // Met en cache tout ce que Vite génère (JS, CSS, HTML).
        // Les images du dossier public/ sont aussi mises en cache.
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico}'],
      },
    }),
  ],
})
