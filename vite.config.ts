import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ isSsrBuild, command }) => ({
  build: {
    // Disable sourcemaps to fix the warnings
    sourcemap: false,
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
    reactRouter({
      ssr: true,
    }), 
    tsconfigPaths()
  ],
  server: {
    port: process.env.PORT as unknown as number || 5173,
  },
  define: {
    __APP_ENV__: JSON.stringify(process.env.VITE_VERCEL_ENV || 'development'),
  },
  ssr: {
    // Bundle all dependencies for SSR to avoid module resolution issues
    noExternal: true
  }
}));