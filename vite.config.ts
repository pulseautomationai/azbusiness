import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ isSsrBuild, command }) => ({
  build: {
    // Disable sourcemaps completely to eliminate build warnings
    sourcemap: false,
    target: 'es2015',
    // Configure rollupOptions for SSR builds with proper ESM output
    rollupOptions: isSsrBuild
      ? {
          output: {
            sourcemap: false,
            format: 'esm'
          },
        }
      : {
          output: {
            sourcemap: false,
          },
        },
  },
  plugins: [
    tailwindcss(), 
    reactRouter(), 
    tsconfigPaths()
  ],
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  define: {
    __APP_ENV__: JSON.stringify(process.env.VITE_VERCEL_ENV || 'development'),
  },
  // Set external dependencies appropriately
  ssr: {
    noExternal: ['react', 'react-dom', 'react-router'],
  },
}));