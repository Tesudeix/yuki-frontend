import { getApiBase } from "./api-client";

// Absolute base URL used for building full URLs in both client and SSR.
// If NEXT_PUBLIC_API_URL is not set, this resolves to the frontend origin
// so that Next.js rewrites can proxy to the backend without CORS.
export const BASE_URL = getApiBase();

// Where uploaded files are served from. With rewrites configured, this path
// is available on the frontend origin too.
export const UPLOADS_URL = `${BASE_URL}/files`;
