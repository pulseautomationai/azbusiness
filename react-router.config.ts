import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  serverBuildFile: "index.js",
  serverModuleFormat: "esm",
  
  buildEnd: async ({ buildManifest, serverBuildPath }) => {
    console.log("Build completed successfully!");
    console.log("Server build path:", serverBuildPath);
  },
} satisfies Config;