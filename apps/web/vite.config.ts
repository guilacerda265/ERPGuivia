import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Minha Loja — Gestão de Moda',
        short_name: 'Minha Loja',
        theme_color: '#7c3aed',
        background_color: '#fafaf9',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // chamadas /api/* vão para a API NestJS em dev (sem CORS, sem URL fixa)
      '/api': 'http://localhost:3333',
    },
  },
});
