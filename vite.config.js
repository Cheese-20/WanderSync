import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Development server port for Vite
    port: 4173,
    // Proxy /api requests to the ASP.NET backend running locally.
    // This avoids CORS issues during development — the browser hits Vite,
    // and Vite forwards the request to the backend.
    proxy: {
      '/api': {
        // Backend address where dotnet run is serving the API
        target: 'https://localhost:7001',
        changeOrigin: true,
        // Allow self-signed or developer certificates (do not use in production)
        secure: false
      }
    }
  },
});
