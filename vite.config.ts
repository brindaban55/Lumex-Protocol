import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 6789,
    strictPort: true,
    host: true,
  },
  define: {
    'process.env': {},
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'clsx', 'tailwind-merge', 'lucide-react'],
          stellar: ['@stellar/stellar-sdk', '@stellar/freighter-api'],
        },
      },
    },
  },
});
