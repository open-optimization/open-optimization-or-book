import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [
    react({
      include: '**/*.{jsx,js}',
    }),
  ],
  esbuild: {
    loader: 'jsx',
    include: /\.(jsx?|js)$/,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    open: true,
    port: 5173,
  },
});
