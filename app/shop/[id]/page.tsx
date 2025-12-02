"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL, UPLOADS_URL } from "@/lib/config";
import { ADMIN_PHONE, PRODUCT_CATEGORIES } from "@/lib/constants";

type Product = {
  _id: string;
  name: string;
  price: number;
  category: (typeof PRODUCT_CATEGORIES)[number];
  image?: string | null;
  description?: string | null;
  createdAt?: string;
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { token, user } = useAuthContext();

  const isSuperAdmin = useMemo(() => {
    const d = (v: unknown) => String(v || "").replace(/\D/g, "");
    const up = user as any;
    return Boolean((user?.phone && d(user.phone) === d(ADMIN_PHONE)) || (up?.username && d(up.username) === d(ADMIN_PHONE)));
  }, [user?.phone]);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<(typeof PRODUCT_CATEGORIES)[number] | "">("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/api/products/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        setProduct(data as Product);
        setName(data.name || "");
        setPrice(String(Math.round(Number(data.price || 0))));
        setCategory((data.category as (typeof PRODUCT_CATEGORIES)[number]) || ("" as const));
        setDescription(data.description || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [BASE_URL, id]);

  const updateProduct = async () => {
    if (!token || !product) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("price", price);
      if (category) fd.set("category", category);
      fd.set("description", description);
      if (image) fd.set("image", image);
      const res = await fetch(`${BASE_URL}/api/products/${product._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setProduct(data.product as Product);
      setImage(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-10">Түр хүлээнэ үү…</div>
      </main>
    );
  }
  if (error || !product) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-10">{error || "Бараа олдсонгүй."}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/shop" className="text-sm text-neutral-400 hover:text-white">← Дэлгүүр</Link>
          {isSuperAdmin && (
            <button
              onClick={() => router.push(`/shop/${product._id}`)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              ID: {product._id}
            </button>
          )}
        </div>

        {/* Hero */}
        <section className="grid gap-8 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950" style={{ aspectRatio: "3 / 4" }}>
            {product.image ? (
              <Image src={`${UPLOADS_URL}/${product.image}`} alt={product.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-neutral-700">No image</div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <div className="mt-2 text-xl">{new Intl.NumberFormat("mn-MN").format(product.price)}₮</div>
            <div className="mt-2 text-sm text-neutral-400">Ангилал: {product.category}</div>
            {product.description && <p className="mt-4 text-neutral-300">{product.description}</p>}

            {/* Minimal CTAs styled like Tesla UI */}
            <div className="mt-6 flex gap-3">
              <button className="rounded-full bg-white px-5 py-2 text-black hover:bg-neutral-200">Сагсанд хийх</button>
              <button className="rounded-full border border-neutral-700 px-5 py-2 text-white hover:bg-neutral-900">Худалдан авах</button>
            </div>
          </div>
        </section>

        {/* Admin editor */}
        {isSuperAdmin && (
          <section className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="mb-4 text-sm font-semibold text-neutral-300">Барааг засах</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-neutral-400">Нэр</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-neutral-800 bg-black px-3 py-2 outline-none" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-neutral-400">Үнэ (₮)</span>
                <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} className="rounded border border-neutral-800 bg-black px-3 py-2 outline-none" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-neutral-400">Ангилал</span>
                <select value={category} onChange={(e) => setCategory((e.target.value || "") as (typeof PRODUCT_CATEGORIES)[number] | "")} className="rounded border border-neutral-800 bg-black px-3 py-2 outline-none">
                  <option value="" disabled>Сонгох</option>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option value={c} key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm sm:col-span-2">
                <span className="text-neutral-400">Тайлбар</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[96px] rounded border border-neutral-800 bg-black px-3 py-2 outline-none" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-neutral-400">Зураг солих</span>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="text-neutral-400" />
              </label>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button disabled={saving} onClick={() => router.push("/shop")} className="rounded border border-neutral-800 px-4 py-2 text-sm">Буцах</button>
                <button disabled={saving || !name.trim() || !price.trim() || !category} onClick={updateProduct} className="rounded bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">Хадгалах</button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
