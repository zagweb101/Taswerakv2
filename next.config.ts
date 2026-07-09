import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Coolify / Hostinger VPS deployment
  // Final artifact: .next/standalone/server.js
  output: "standalone",

  // Don't fail the build on minor TS issues — caught by lint separately
  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,

  // Allow cross-origin from preview panel
  allowedDevOrigins: ["*.space-z.ai", "*.z.ai"],

  // Allow remote images from MinIO + production CDN
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "https", hostname: "**.taswerak.com" },
      { protocol: "https", hostname: "taswerak.com" },
    ],
  },

  // Larger body for payment receipt uploads + EXIF images
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
