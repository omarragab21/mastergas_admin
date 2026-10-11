import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    cors: true,
    fs: { allow: [projectRoot, path.resolve(projectRoot, '..')] },
    proxy: {
      '/api': { target: 'https://backend-tijara.be-kite.com', changeOrigin: true, secure: false },
      '/storage': { target: 'https://backend-tijara.be-kite.com', changeOrigin: true, secure: false },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/chart.js')) return 'chart-vendor';
          const match = id.match(/\/src\/views\/([^/]+)\.vue$/);
          return match ? `admin-${match[1].replace(/View$/, '').toLowerCase()}` : undefined;
        },
      },
    },
  },
});
