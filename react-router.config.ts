import type { Config } from "@react-router/dev/config";

export default {
  // Use SPA mode due to React Router v7 + Vite 6 compatibility issues
  ssr: false,
  
  // Set serverBuildFile to "index.js"
  serverBuildFile: "index.js",
  
  // Set serverModuleFormat to "esm"
  serverModuleFormat: "esm",
  
  // Keep serverPlatform as node
  // serverPlatform: "node", // TODO: Check if this is supported in current version
  
  // Add buildEnd callback that logs build completion
  buildEnd: async ({ buildManifest }) => {
    console.log("Build completed successfully!");
    console.log("Build manifest routes:", Object.keys(buildManifest?.routes || {}).length);
    // console.log("Build manifest entry:", buildManifest?.entry?.module); // TODO: Check correct property
  },
} satisfies Config;