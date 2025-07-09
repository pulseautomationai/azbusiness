import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, ssrBuild }) => {
  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    build: {
      // Disable sourcemaps for production builds
      sourcemap: command === "serve",
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
