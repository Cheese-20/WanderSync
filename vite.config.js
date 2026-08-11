import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/backend/**', '**/node_modules/**']
    },
    // Development server port for Vite
    port: 4173,
    // Proxy /api requests to the ASP.NET backend running locally.
    // This avoids CORS issues during development — the browser hits Vite,
    // and Vite forwards the request to the backend.
    watch: {
      ignored: ['**/backend/**']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5200',
        changeOrigin: true,
        secure: false
      }
    }
  },
});
