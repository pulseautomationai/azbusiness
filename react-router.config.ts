import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  serverBuildFile: "index.js",
  serverModuleFormat: "esm",
  serverDependenciesToBundle: [
    // Bundle these dependencies for server-side rendering
    "@clerk/react-router",
    "convex",
    "isbot",
    /^@radix-ui\/.*/,
    "lucide-react",
    "class-variance-authority",
    "clsx",
    "motion",
  ],
  buildDirectory: "build",
  assetsBuildDirectory: "build/client",
  serverBuildDirectory: "build/server",
} satisfies Config;
