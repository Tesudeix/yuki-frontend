const RAW_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const DEV_FALLBACK_BASE = (process.env.NEXT_PUBLIC_API_FALLBACK || "http://localhost:4000").replace(/\/$/, "");

export type ApiSuccess<T> = { success: true; message?: string } & T;
export type ApiError = { success: false; error?: string; message?: string; details?: unknown };
export type ApiResponse<T = Record<string, unknown>> = ApiSuccess<T> | ApiError;

let memoizedBaseUrl = RAW_BASE_URL;

const resolveBaseUrl = () => {
  if (memoizedBaseUrl) {
    return memoizedBaseUrl;
  }

  if (typeof window !== "undefined") {
    memoizedBaseUrl = window.location.origin.replace(/\/$/, "");
    return memoizedBaseUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    memoizedBaseUrl = DEV_FALLBACK_BASE;
    return memoizedBaseUrl;
  }

  return "";
};

export const getApiBase = () => resolveBaseUrl();

const normaliseEndpoint = (endpoint: string) => (endpoint.startsWith("/") ? endpoint : `/${endpoint}`);

export const isSuccess = <T,>(payload: ApiResponse<T>): payload is ApiSuccess<T> => payload.success;

export async function apiRequest<T>(endpoint: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const base = resolveBaseUrl();

  if (!base) {
    return { success: false, error: "API суурь хаяг тохируулаагүй байна." };
  }

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

  const url = `${base}${normaliseEndpoint(endpoint)}`;

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
