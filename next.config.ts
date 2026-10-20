import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the demo screen clean: no dev badge over the bottom navigation.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // The demo renders from client-side state, so only validate segments that opt in.
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
