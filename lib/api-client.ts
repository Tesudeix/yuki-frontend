const RAW_BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const DEV_FALLBACK_FRONTEND = (process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

export type ApiSuccess<T> = { success: true; message?: string } & T;
export type ApiError = { success: false; error?: string; message?: string; details?: unknown };
export type ApiResponse<T = Record<string, unknown>> = ApiSuccess<T> | ApiError;

let memoizedBaseUrl = RAW_BACKEND_BASE || "";
const USING_PROXY = !RAW_BACKEND_BASE; // when no explicit backend URL, route via Next rewrites

const resolveBaseUrl = () => {
  if (memoizedBaseUrl) return memoizedBaseUrl;
  // No explicit backend configured: use the frontend origin. Rewrites will proxy to backend.
  if (typeof window !== "undefined") {
    memoizedBaseUrl = window.location.origin.replace(/\/$/, "");
    return memoizedBaseUrl;
  }
  // On server (SSR/build), assume local Next dev/serve origin
  memoizedBaseUrl = DEV_FALLBACK_FRONTEND;
  return memoizedBaseUrl;
};

export const getApiBase = () => resolveBaseUrl();

const normaliseEndpoint = (endpoint: string) => (endpoint.startsWith("/") ? endpoint : `/${endpoint}`);

const buildDirectApiUrl = (base: string, endpoint: string) => {
  const cleanBase = base.replace(/\/$/, "");
  const ep = normaliseEndpoint(endpoint);

  // Base points to backend API root: https://host/api
  if (cleanBase.endsWith("/api")) {
    if (ep.startsWith("/api/")) return `${cleanBase}${ep.slice(4)}`; // avoid /api/api/*
    if (ep.startsWith("/admin/") || ep.startsWith("/users/")) return `${cleanBase}${ep}`;
    if (ep === "/upload" || ep.startsWith("/files/")) {
      return `${cleanBase.slice(0, -4)}${ep}`; // /api -> root for upload/files
    }
    return `${cleanBase}${ep}`;
  }

  // Base points to backend proxy root: https://host/api-proxy
  if (cleanBase.endsWith("/api-proxy")) {
    if (ep.startsWith("/admin/") || ep.startsWith("/users/")) return `${cleanBase}/api${ep}`;
    return `${cleanBase}${ep}`;
  }

  // Base is origin/domain: https://host
  return `${cleanBase}${ep}`;
};

// Build full request URL.
// - No explicit NEXT_PUBLIC_API_URL: use same-origin endpoints and rely on Next rewrites.
// - Explicit NEXT_PUBLIC_API_URL: normalize for /api, /api-proxy, or origin styles.
export const buildApiUrl = (endpoint: string) => {
  const base = resolveBaseUrl();

  if (USING_PROXY) {
    return `${base}${normaliseEndpoint(endpoint)}`;
  }

  return buildDirectApiUrl(base, endpoint);
};

export const isSuccess = <T,>(payload: ApiResponse<T>): payload is ApiSuccess<T> => payload.success;

export async function apiRequest<T>(endpoint: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = buildApiUrl(endpoint);

  const headers = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  } as Record<string, string>;

  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  if (!requestInit.cache) {
    requestInit.cache = "no-store";
  }

  try {
    const response = await fetch(url, requestInit);
    const raw = await response.json().catch(() => ({}));

    if (!response.ok) {
      const payload = raw as ApiError;
      return {
        success: false,
        error: payload?.error || payload?.message || `Алдаа гарлаа (${response.status})`,
        details: payload?.details,
      };
    }

    const payload = raw as Partial<ApiResponse<T>>;
    if (!payload || typeof payload !== "object" || typeof payload.success !== "boolean") {
      return { success: false, error: "API-ээс буруу форматтай хариу ирлээ." };
    }

    return payload as ApiResponse<T>;
  } catch (error) {
    console.error("Request error", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Сүлжээний алдаа",
    };
  }
}
