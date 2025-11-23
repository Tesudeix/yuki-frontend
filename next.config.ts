import type { NextConfig } from "next";
import path from "path";

function normalizeBackendUrl(input?: string): string {
  const raw = (input || "").trim();
  if (!raw) return "http://127.0.0.1:4000";
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  const withoutSlash = withScheme.replace(/\/$/, "");
  try {
    // Validate URL format
    // eslint-disable-next-line no-new
    new URL(withoutSlash);
    return withoutSlash;
  } catch {
    return "http://127.0.0.1:4000";
  }
}

const backend = normalizeBackendUrl(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy API calls to the backend to avoid CORS and mismatched origins
      {
        source: "/api-proxy/:path*",
        destination: `${backend}/:path*`,
      },
      // Proxy backend routes used by the frontend auth/admin UIs
      {
        source: "/users/:path*",
        destination: `${backend}/users/:path*`,
      },
      {
        source: "/admin/:path*",
        destination: `${backend}/admin/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
      // Serve uploaded files through the frontend origin too
      {
        source: "/files/:path*",
        destination: `${backend}/files/:path*`,
      },
    ];
  },
  webpack(config) {
    // Ensure alias '@' points to project root for both TS and webpack resolution
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    };
    return config;
  },
};

export default nextConfig;
