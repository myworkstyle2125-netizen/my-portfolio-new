import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const isHttps = Boolean(process.env.APP_URL && process.env.APP_URL.startsWith('https'));
  const clientPort = isHttps ? 443 : 3000;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: {
        clientPort,
        protocol: isHttps ? 'wss' : 'ws',
      },
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
