import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  serverModuleFormat: "esm",
  serverPlatform: "node",
  
  buildEnd: async ({ buildManifest, serverBuildPath }) => {
    console.log("Build completed successfully!");
    console.log("Server build path:", serverBuildPath);
  },
} satisfies Config;