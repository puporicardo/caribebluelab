import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// API pública de Gran Faro (Copernicus). Mismo mapeo que los rewrites de vercel.json.
const GRAN_FARO = 'https://gran-faro-cmee.vercel.app';
const granFaroProxy = {
  '/api/granfaro': {
    target: GRAN_FARO,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/granfaro\/(mar|lluvia)\/?$/, '/api/v1/copernicus/$1/'),
  },
};

// SPA con React Router: la web (/, /arrecife, /en/arrecife…) y el kiosco (/kiosco/es, /kiosco/en).
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173, proxy: granFaroProxy },
  preview: { proxy: granFaroProxy },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
  },
});
