import type { NextConfig } from "next";

const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy API calls to the backend to avoid CORS and mismatched origins
      {
        source: "/api-proxy/:path*",
        destination: `${backend}/:path*`,
      },
      // Serve uploaded files through the frontend origin too
      {
        source: "/files/:path*",
        destination: `${backend}/files/:path*`,
      },
    ];
  },
};

export default nextConfig;
