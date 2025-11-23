"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL, UPLOADS_URL } from "@/lib/config";
import { ADMIN_PHONE, PRODUCT_CATEGORIES } from "@/lib/constants";
import { Copy } from "lucide-react";

type Product = {
  _id: string;
  name: string;
  price: number;
  category: (typeof PRODUCT_CATEGORIES)[number];
  image?: string | null;
  description?: string | null;
  createdAt?: string;
};

export default function ShopPage() {
  const { token, user } = useAuthContext();
  const isSuperAdmin = useMemo(() => Boolean(user?.phone && user.phone === ADMIN_PHONE), [user?.phone]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<{ name: string; price: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<"All" | (typeof PRODUCT_CATEGORIES)[number]>("All");

  const load = async (cat?: (typeof PRODUCT_CATEGORIES)[number]) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${BASE_URL}/api/products`);
      if (cat) url.searchParams.set("category", cat);
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(activeCategory === "All" ? undefined : activeCategory); }, [activeCategory]);

  const formatMNT = (value: number) => {
    const s = Math.round(value).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const deleteProduct = async (id: string) => {
    if (!token) return;
    const ok = typeof window !== "undefined" ? window.confirm("Энэ барааг устгах уу?") : true;
    if (!ok) return;
    try {
      const res = await fetch(`${BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: unknown };
        const message = typeof err.error === "string" ? err.error : undefined;
        throw new Error(message ?? `HTTP ${res.status}`);
      }
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Устгах үед алдаа гарлаа");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Дэлгүүр</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", ...PRODUCT_CATEGORIES].map((c) => (
              <button
                key={c}
                className={`rounded px-2 py-1 text-sm ${activeCategory === c ? "bg-[#1080CA] text-white" : "border border-neutral-800 text-neutral-300"}`}
                onClick={() => setActiveCategory(c as typeof activeCategory)}
                type="button"
              >
                {c}
              </button>
            ))}
          </div>
        </header>

        {isSuperAdmin && <AddProduct onAdded={(p) => setProducts((prev) => [p, ...prev])} />}

        {error && <div className="mt-4 rounded border border-rose-800/50 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</div>}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article key={p._id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              {p.image && (
                <div className="relative w-full overflow-hidden rounded-lg bg-neutral-900" style={{ aspectRatio: "3 / 4" }}>
                  <Image
                    src={`${UPLOADS_URL}/${p.image}`}
                    alt={p.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <div className="text-white">{formatMNT(p.price)}₮</div>
                </div>
                <div className="mt-1 text-xs text-neutral-400">Ангилал: {p.category ?? "Тодорхойгүй"}</div>
                {p.description && <p className="mt-1 line-clamp-3 text-sm text-neutral-300">{p.description}</p>}
              </div>
              <div className="mt-4 flex items-center justify-between">
                {isSuperAdmin ? (
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="rounded-md border border-red-700 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
                  >
                    Устгах
                  </button>
                ) : <span />}
                <button
                  className="rounded-md bg-[#1080CA] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
                  onClick={() => setOverlay({ name: p.name, price: `${formatMNT(p.price)}₮` })}
                >
                  Худалдан авах
                </button>
              </div>
            </article>
          ))}
          {!loading && products.length === 0 && (
            <div className="col-span-full text-center text-sm text-neutral-400">Одоогоор бараа байхгүй.</div>
          )}
        </section>
      </div>

      {overlay && <ShopPaymentOverlay name={overlay.name} price={overlay.price} onClose={() => setOverlay(null)} />}
    </main>
  );
}

function AddProduct({ onAdded }: { onAdded: (p: Product) => void }) {
  const { token } = useAuthContext();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<(typeof PRODUCT_CATEGORIES)[number] | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!token || !name.trim() || !price.trim() || !category) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("price", price);
      fd.set("category", category);
      if (desc.trim()) fd.set("description", desc);
      if (image) fd.set("image", image);
      const res = await fetch(`${BASE_URL}/api/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      onAdded(data?.product as Product);
      setName(""); setPrice(""); setDesc(""); setCategory(""); setImage(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <h2 className="mb-2 text-sm font-semibold">Бараа нэмэх (суперадмин)</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <input className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none" placeholder="Нэр" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none" placeholder="Үнэ (₮)" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} />
        <div className="sm:col-span-2 flex gap-2 items-center">
          <label className="text-sm text-neutral-300 shrink-0" htmlFor="category">Ангилал:</label>
          <select
            id="category"
            className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none"
            value={category}
            onChange={(e) => setCategory((e.target.value || "") as (typeof PRODUCT_CATEGORIES)[number] | "")}
          >
            <option value="" disabled>Сонгох</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <input className="sm:col-span-2 rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none" placeholder="Тайлбар (сонголтоор)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="text-sm text-neutral-300" />
        <div className="sm:col-span-2 flex items-center justify-end gap-2">
          <button className="rounded border border-neutral-800 px-3 py-1.5 text-sm" onClick={() => { setName(""); setPrice(""); setDesc(""); setCategory(""); setImage(null); }} type="button">Цэвэрлэх</button>
          <button className="rounded bg-[#1080CA] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50" disabled={busy || !name.trim() || !price.trim() || !category} onClick={submit} type="button">Нэмэх</button>
        </div>
      </div>
    </section>
  );
}

function ShopPaymentOverlay({ name, price, onClose }: { name: string; price: string; onClose: () => void }) {
  const [bankKey, setBankKey] = useState<"khan" | "golomt">("khan");
  const accountHolder = "Baynbileg Dambadarjaa";
  const khan = { name: "Хаан банк", fullAccount: "MN720005005926153085" };
  const golomt = { name: "Голомт банк", fullAccount: "MN150015003005127815" };
  const bank = bankKey === "khan" ? khan.name : golomt.name;
  const accountNo = bankKey === "khan" ? khan.fullAccount : golomt.fullAccount;

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-white">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Худалдан авах — {name}</h2>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-300">Банк:</span>
            <div className="inline-flex rounded-md border border-neutral-800 p-0.5">
              <button type="button" className={`rounded-sm px-2 py-1 ${bankKey === "khan" ? "bg-[#1080CA] text-white" : "text-neutral-300"}`} onClick={() => setBankKey("khan")}>Хаан</button>
              <button type="button" className={`rounded-sm px-2 py-1 ${bankKey === "golomt" ? "bg-[#1080CA] text-white" : "text-neutral-300"}`} onClick={() => setBankKey("golomt")}>Голомт</button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">
            <div className="min-w-0">
              <div className="text-neutral-300">Данс</div>
              <div className="truncate font-medium text-white">{bank} — {accountNo}</div>
              <div className="text-xs text-neutral-400">Эзэмшигч: {accountHolder}</div>
            </div>
            <button onClick={() => copy(accountNo)} className="ml-3 inline-flex items-center gap-1 rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:border-neutral-600">
              <Copy className="h-3.5 w-3.5" /> Хуулах
            </button>
          </div>
          <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300">
            Та заавал гүйлгээний утга дээр email эсвэл идэвхтэй ашиглаж байгаа social хаяг оруулаарай.
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">Дүн: {price}</div>
            <button onClick={onClose} className="rounded-md border border-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900">
              Төлбөр төлсөн
            </button>
          </div>
          <p className="text-center text-[11px] text-neutral-500">та төлбөрөө төлөөд email хариу ирэхгүй бол <span className="text-neutral-300">94641031</span> дугаарлуу залгаарай</p>
        </div>
      </div>
    </div>
  );
}
