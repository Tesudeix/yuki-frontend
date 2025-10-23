import type { NextConfig } from "next";

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
      // Serve uploaded files through the frontend origin too
      {
        source: "/files/:path*",
        destination: `${backend}/files/:path*`,
      },
    ];
  },
};

export default nextConfig;
