import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // Remove Vercel preset for Netlify deployment
  // presets: [vercelPreset()],
  
  // Ensure resource routes work properly
  buildEnd: async ({ buildManifest }) => {
    console.log("Build complete, manifest:", Object.keys(buildManifest.routes));
  },
} satisfies Config;
