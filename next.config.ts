import type { NextConfig } from "next";
import path from "path";

const backend =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  // 🚀 BUILD SPEED BOOSTERS
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  // ⚡ KEEP REWRITES MINIMAL
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${backend}/:path*`,
      },
      // Proxy first-class API-style routes directly so client fetches like `${BASE_URL}/api/*` work
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
      // Non-`/api` routes used by the app (map to backend /api/* counterparts)
      {
        source: "/users/:path*",
        destination: `${backend}/api/users/:path*`,
      },
      {
        source: "/admin/:path*",
        destination: `${backend}/api/admin/:path*`,
      },
      {
        source: "/upload",
        destination: `${backend}/upload`,
      },
      {
        source: "/files/:path*",
        destination: `${backend}/files/:path*`,
      },
    ];
  },

  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    };
    return config;
  },
};

export default nextConfig;
