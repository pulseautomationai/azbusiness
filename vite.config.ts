import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(), 
    reactRouter(), 
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '~/convex': path.resolve(__dirname, './convex'),
    },
  },
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    allowedHosts: [
      'serves-uses-existence-sleeve.trycloudflare.com',
      '.trycloudflare.com' // Allow any trycloudflare.com subdomain
    ]
  },
  define: {
    __APP_ENV__: JSON.stringify(process.env.VITE_VERCEL_ENV || 'development'),
  },
});

