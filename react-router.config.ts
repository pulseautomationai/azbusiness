import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router";

export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // Enable Vercel preset for Vercel deployment
  presets: [vercelPreset()],
  
  // Ensure resource routes work properly
  buildEnd: async ({ buildManifest }) => {
    console.log("Build complete, manifest:", Object.keys(buildManifest.routes));
  },
} satisfies Config;
