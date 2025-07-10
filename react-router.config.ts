import type { Config } from "@react-router/dev/config";

export default {
  // Ensure SSR is set to true
  ssr: true,
  
  // Set serverBuildFile to "index.js"
  serverBuildFile: "index.js",
  
  // Set serverModuleFormat to "esm"
  serverModuleFormat: "esm",
  
  // Keep serverPlatform as node
  serverPlatform: "node",
  
  // Add buildEnd callback that logs the serverBuildPath to help debug build issues
  buildEnd: async ({ buildManifest, serverBuildPath }) => {
    console.log("Build completed successfully!");
    console.log("Server build path:", serverBuildPath);
    console.log("Build manifest routes:", Object.keys(buildManifest?.routes || {}).length);
    console.log("Build manifest entry:", buildManifest?.entry?.module);
  },
} satisfies Config;