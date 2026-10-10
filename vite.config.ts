import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SPA con React Router: la web (/, /arrecife, /en/arrecife…) y el kiosco (/kiosco/es, /kiosco/en).
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
  },
});
