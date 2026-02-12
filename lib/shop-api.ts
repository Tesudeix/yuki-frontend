import { buildApiUrl } from "@/lib/api-client";
import { ADMIN_TOKEN_STORAGE_KEY, PRODUCT_CATEGORIES } from "@/lib/constants";

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type ShopProduct = {
  _id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateProductInput = {
  name: string;
  price: number;
  category: ProductCategory;
  description?: string;
  image?: File | null;
};

export type CreateProductOrderInput = {
  customerName: string;
  phone: string;
  quantity: number;
  note?: string;
};

const isCategory = (value: unknown): value is ProductCategory =>
  typeof value === "string" && PRODUCT_CATEGORIES.includes(value as ProductCategory);

const parseProduct = (value: unknown): ShopProduct | null => {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;

  const id = typeof row._id === "string" ? row._id : "";
  const name = typeof row.name === "string" ? row.name.trim() : "";
  const parsedPrice = typeof row.price === "number" ? row.price : Number(row.price || 0);
  const category = isCategory(row.category) ? row.category : null;

  if (!id || !name || !Number.isFinite(parsedPrice) || !category) return null;

  return {
    _id: id,
    name,
    price: parsedPrice,
    category,
    image: typeof row.image === "string" ? row.image : null,
    description: typeof row.description === "string" ? row.description : null,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : null,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : null,
  };
};

const toErrorMessage = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== "object") return fallback;
  const row = payload as Record<string, unknown>;
  if (typeof row.error === "string" && row.error.trim()) return row.error;
  if (typeof row.message === "string" && row.message.trim()) return row.message;
  return fallback;
};

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

const getAdminAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  if (typeof value !== "string") return null;
  const token = value.trim();
  return token ? token : null;
};

const withAdminAuthHeader = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = getAdminAuthToken();
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

const extractFilenameFromDownloadUrl = (value: string): string => {
  try {
    const parsed = new URL(value);
    const last = parsed.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(last);
  } catch {
    return "";
  }
};

const uploadProductImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.set("file", file);

  const response = await fetch(buildApiUrl("/api/upload"), {
    method: "POST",
    headers: withAdminAuthHeader(),
    body: form,
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(payload, `Failed to upload image (${response.status})`));
  }

  const downloadUrl =
    typeof (payload as { downloadUrl?: unknown } | null)?.downloadUrl === "string"
      ? ((payload as { downloadUrl: string }).downloadUrl)
      : "";

  const filename = extractFilenameFromDownloadUrl(downloadUrl);
  if (!filename) {
    throw new Error("Image upload response is invalid");
  }

  return filename;
};

export const listShopProducts = async (category?: ProductCategory): Promise<ShopProduct[]> => {
  const url = new URL(buildApiUrl("/api/products"));
  if (category) {
    url.searchParams.set("category", category);
  }

  const response = await fetch(url.toString(), { cache: "no-store" });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(payload, `Failed to load products (${response.status})`));
  }

  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { products?: unknown[] } | null)?.products)
    ? ((payload as { products: unknown[] }).products)
    : [];

  return rows
    .map((entry) => parseProduct(entry))
    .filter((entry): entry is ShopProduct => entry !== null);
};

export const getShopProduct = async (id: string): Promise<ShopProduct> => {
  const response = await fetch(buildApiUrl(`/api/products/${id}`), { cache: "no-store" });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(payload, `Failed to load product (${response.status})`));
  }

  const parsed = parseProduct((payload as { product?: unknown } | null)?.product);
  if (!parsed) {
    throw new Error("Product payload is invalid");
  }

  return parsed;
};

export const createShopProduct = async (input: CreateProductInput): Promise<ShopProduct> => {
  const image = input.image ? await uploadProductImage(input.image) : undefined;
  const response = await fetch(buildApiUrl("/api/products"), {
    method: "POST",
    headers: withAdminAuthHeader({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      name: input.name.trim(),
      price: Math.round(input.price),
      category: input.category,
      description: input.description?.trim() || undefined,
      image,
    }),
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(payload, `Failed to create product (${response.status})`));
  }

  const parsed = parseProduct((payload as { product?: unknown } | null)?.product);
  if (!parsed) {
    throw new Error("Product create response is invalid");
  }

  return parsed;
};

export const deleteShopProduct = async (id: string): Promise<void> => {
  const response = await fetch(buildApiUrl(`/api/products/${id}`), {
    method: "DELETE",
    headers: withAdminAuthHeader(),
  });

  if (response.ok) return;
  const payload = await readJson(response);
  throw new Error(toErrorMessage(payload, `Failed to delete product (${response.status})`));
};

export const createShopProductOrder = async (
  productId: string,
  input: CreateProductOrderInput
): Promise<{ orderId?: string }> => {
  const response = await fetch(buildApiUrl(`/api/products/${productId}/order`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      quantity: Math.max(1, Math.floor(input.quantity || 1)),
      note: input.note?.trim() || undefined,
    }),
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(payload, `Order failed (${response.status})`));
  }

  const orderId =
    typeof (payload as { order?: { _id?: unknown } } | null)?.order?._id === "string"
      ? ((payload as { order: { _id: string } }).order._id)
      : undefined;

  return { orderId };
};

export const formatMnt = (value: number): string =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
