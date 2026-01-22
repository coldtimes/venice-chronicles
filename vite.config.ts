import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded relatively (required for Electron file:// protocol)
  define: {
    // Polyfill process.env for standard node-like behavior in the browser/electron renderer
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});