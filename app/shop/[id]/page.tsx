"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { UPLOADS_URL } from "@/lib/config";
import { createShopProductOrder, formatMnt, getShopProduct, type ShopProduct } from "@/lib/shop-api";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");

  const quantityValue = useMemo(() => {
    const parsed = Number(quantity || "1");
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(1, Math.floor(parsed));
  }, [quantity]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getShopProduct(id);
      setProduct(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load product");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const submitOrder = async () => {
    if (!product || submitting) return;
    if (!customerName.trim() || !phone.trim()) {
      setStatus("Name and phone are required.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const result = await createShopProductOrder(product._id, {
        customerName,
        phone,
        quantity: quantityValue,
        note,
      });
      setStatus(result.orderId ? `Order created: ${result.orderId}` : "Order created");
      setNote("");
      setQuantity("1");
    } catch (requestError) {
      setStatus(requestError instanceof Error ? requestError.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <Link href="/shop" className="rounded-[4px] border border-black/20 bg-white px-3 py-1.5 text-xs text-black">
        Back
      </Link>

      {loading ? (
        <section className="mt-4 rounded-[4px] border border-black/20 bg-white p-4 text-sm text-black/70">Loading...</section>
      ) : error ? (
        <section className="mt-4 rounded-[4px] border border-black/20 bg-white p-4 text-sm text-black">{error}</section>
      ) : product ? (
        <section className="mt-4 grid gap-4 rounded-[4px] border border-black/20 bg-white p-4 lg:grid-cols-[1fr,1fr]">
          <div className="relative aspect-square overflow-hidden rounded-[4px] border border-black/10 bg-white">
            {product.image ? (
              <Image
                src={`${UPLOADS_URL}/${encodeURIComponent(product.image)}`}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-black/50">No image</div>
            )}
          </div>

          <div>
            <p className="text-xs text-black/70">{product.category}</p>
            <h1 className="mt-1 text-xl font-semibold text-black">{product.name}</h1>
            <p className="mt-1 text-base font-semibold text-black">{formatMnt(product.price)} ₮</p>
            <p className="mt-2 text-sm text-black/80">{product.description || "No description"}</p>

            <div className="mt-4 grid gap-2">
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Name"
                className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
              />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone"
                className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
              />
              <input
                value={quantity}
                onChange={(event) => setQuantity(event.target.value.replace(/[^\d]/g, ""))}
                placeholder="Quantity"
                className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
              />
              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Note"
                className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
              />

              <button
                type="button"
                onClick={() => void submitOrder()}
                disabled={submitting}
                className="rounded-[4px] border border-black bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Create Order"}
              </button>

              {status ? (
                <p className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-xs text-black">{status}</p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
