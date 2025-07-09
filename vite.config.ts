import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, ssrBuild }) => {
  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    build: {
      // Completely disable sourcemaps for production builds
      sourcemap: false,
      rollupOptions: {
        onLog(level, log, handler) {
          // Ignore sourcemap errors to clean up build output
          if (log.code === 'SOURCEMAP_ERROR') {
            return;
          }
          handler(level, log);
        }
      }
    },
    // SSR-specific configuration
    ssr: {
      noExternal: ssrBuild ? [
        // Ensure these packages are bundled for SSR
        "@clerk/react-router",
        "convex",
        "isbot",
      ] : [],
    },
  };
});
