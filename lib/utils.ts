export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const coerceId = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (isRecord(value)) {
    const direct = value.id;
    if (typeof direct === "string") {
      return direct;
    }

    const objectId = value._id;
    if (typeof objectId === "string") {
      return objectId;
    }

    if (isRecord(objectId) && typeof objectId.toString === "function") {
      const converted = objectId.toString();
      return typeof converted === "string" ? converted : "";
    }

    if (typeof value.toString === "function") {
      const fallback = value.toString();
      return typeof fallback === "string" && fallback !== "[object Object]" ? fallback : "";
    }
  }

  return "";
};

export const coerceString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

export const coerceNullableString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

export const coerceStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export const coerceBoolean = (value: unknown, fallback = true): boolean =>
  typeof value === "boolean" ? value : fallback;

export const coerceNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
