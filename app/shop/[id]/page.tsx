"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { buildApiUrl } from "@/lib/api-client";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { UPLOADS_URL } from "@/lib/config";

type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

type Product = {
  _id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image?: string | null;
  description?: string | null;
  createdAt?: string | null;
};

const mntPrice = new Intl.NumberFormat("en-US");

const parseProduct = (payload: unknown): Product | null => {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as Record<string, unknown>;

  const id = typeof row._id === "string" ? row._id : "";
  const name = typeof row.name === "string" ? row.name : "";
  const price = typeof row.price === "number" ? row.price : Number(row.price || 0);

  if (!id || !name || Number.isNaN(price)) return null;

  const category =
    typeof row.category === "string" && PRODUCT_CATEGORIES.includes(row.category as ProductCategory)
      ? (row.category as ProductCategory)
      : PRODUCT_CATEGORIES[0];

  return {
    _id: id,
    name,
    price,
    category,
    image: typeof row.image === "string" ? row.image : null,
    description: typeof row.description === "string" ? row.description : null,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : null,
  };
};

const productImage = (fileName?: string | null): string | null => {
  if (!fileName) return null;
  return `${UPLOADS_URL}/${encodeURIComponent(fileName)}`;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [submitTone, setSubmitTone] = useState<"success" | "error" | null>(null);

  const quantityValue = useMemo(() => {
    const parsed = Number(quantity || "1");
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(1, Math.floor(parsed));
  }, [quantity]);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl(`/api/products/${id}`), { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          typeof (payload as { error?: unknown }).error === "string"
            ? (payload as { error: string }).error
            : `Failed to load product (${response.status})`;
        throw new Error(message);
      }

      const parsed = parseProduct((payload as { product?: unknown }).product);
      if (!parsed) {
        throw new Error("Product payload is invalid.");
      }
      setProduct(parsed);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load product.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProduct();
  }, [id]);

  const submitOrder = async () => {
    if (!product || submitting) return;

    if (!customerName.trim() || !phone.trim()) {
      setSubmitStatus("Нэр болон утас оруулна уу.");
      setSubmitTone("error");
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);
    setSubmitTone(null);

    try {
      const response = await fetch(buildApiUrl(`/api/products/${product._id}/order`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          quantity: quantityValue,
          note: note.trim() || undefined,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          typeof (payload as { error?: unknown }).error === "string"
            ? (payload as { error: string }).error
            : `Order failed (${response.status})`;
        throw new Error(message);
      }

      const orderId =
        typeof (payload as { order?: { _id?: unknown } }).order?._id === "string"
          ? ((payload as { order: { _id: string } }).order._id)
          : "";

      setSubmitStatus(orderId ? `Захиалга амжилттай. ID: ${orderId.slice(-6)}` : "Захиалга амжилттай.");
      setSubmitTone("success");
      setNote("");
      setQuantity("1");
    } catch (requestError) {
      setSubmitStatus(requestError instanceof Error ? requestError.message : "Order failed.");
      setSubmitTone("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <Link
        href="/shop"
        className="inline-flex rounded-full bg-[color:var(--surface-muted)] px-4 py-1.5 text-xs font-semibold text-[color:var(--foreground)] transition hover:bg-[#1d1d36]"
      >
        Back to Shop
      </Link>

      {loading ? (
        <section className="mt-5 overflow-hidden rounded-3xl bg-[color:var(--surface)] p-5 shadow-[0_16px_38px_-24px_rgba(0,0,0,0.85)]">
          <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
            <div className="aspect-square animate-pulse rounded-2xl bg-[color:var(--surface-muted)]" />
            <div className="space-y-3">
              <div className="h-4 w-28 animate-pulse rounded bg-[color:var(--surface-muted)]" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-[color:var(--surface-muted)]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[color:var(--surface-muted)]" />
            </div>
          </div>
        </section>
      ) : error ? (
        <section className="mt-5 rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-200">{error}</section>
      ) : product ? (
        <section className="mt-5 overflow-hidden rounded-3xl bg-[color:var(--surface)] p-5 shadow-[0_16px_38px_-24px_rgba(0,0,0,0.85)]">
          <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
            <div className="overflow-hidden rounded-2xl bg-[color:var(--surface-muted)]">
              <div className="relative aspect-square">
                {product.image ? (
                  <Image
                    src={productImage(product.image) || ""}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[color:var(--foreground)]/50">
                    No image
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">{product.category}</p>
                <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[color:var(--foreground)]">{product.name}</h1>
                <p className="mt-3 text-xl font-semibold text-[color:var(--foreground)]">{mntPrice.format(Math.round(product.price))} MNT</p>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]/75">
                  {product.description?.trim() || "No detailed description yet."}
                </p>
                {product.createdAt ? (
                  <p className="mt-3 text-xs text-[color:var(--foreground)]/55">Added: {new Date(product.createdAt).toLocaleDateString()}</p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-[color:var(--surface-muted)] p-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground)]/70">Order This Product</h2>
                <div className="mt-3 grid gap-2">
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Нэр"
                    className="rounded-lg bg-[#0f0f22] px-3 py-2 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--foreground)]/45 focus:ring-2 focus:ring-[color:var(--brand)]"
                  />
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Утас"
                    className="rounded-lg bg-[#0f0f22] px-3 py-2 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--foreground)]/45 focus:ring-2 focus:ring-[color:var(--brand)]"
                  />
                  <input
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value.replace(/[^\d]/g, ""))}
                    placeholder="Тоо ширхэг"
                    className="rounded-lg bg-[#0f0f22] px-3 py-2 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--foreground)]/45 focus:ring-2 focus:ring-[color:var(--brand)]"
                  />
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Тайлбар (сонголтоор)"
                    className="min-h-24 rounded-lg bg-[#0f0f22] px-3 py-2 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--foreground)]/45 focus:ring-2 focus:ring-[color:var(--brand)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void submitOrder()}
                  disabled={submitting}
                  className="mt-3 w-full rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Place Order"}
                </button>

                {submitStatus ? (
                  <p
                    className={`mt-3 text-xs font-medium ${
                      submitTone === "success" ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {submitStatus}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
