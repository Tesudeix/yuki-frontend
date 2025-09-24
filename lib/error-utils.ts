import { ApiError } from "./api-client";

export const resolveErrorMessage = (payload: ApiError, fallback: string): string => {
  if (payload.error) {
    return payload.error;
  }

  if (payload.message) {
    return payload.message;
  }

  if (typeof payload.details === "string") {
    return payload.details;
  }

  if (payload.details && typeof payload.details === "object" && "message" in payload.details) {
    const maybeMessage = (payload.details as { message?: unknown }).message;
    if (typeof maybeMessage === "string") {
      return maybeMessage;
    }
  }

  return fallback;
};
