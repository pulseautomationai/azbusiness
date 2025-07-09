import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  
  // Ensure resource routes work properly
  buildEnd: async ({ buildManifest }) => {
    console.log("Build complete, manifest:", Object.keys(buildManifest.routes));
  },
} satisfies Config;
