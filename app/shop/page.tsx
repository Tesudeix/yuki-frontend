"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuthContext } from "@/contexts/auth-context";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import {
  createShopProduct,
  deleteShopProduct,
  formatMnt,
  listShopProducts,
  type ProductCategory,
  type ShopProduct,
} from "@/lib/shop-api";
import { UPLOADS_URL } from "@/lib/config";

type ToastTone = "success" | "error" | "info";

type Toast = {
  tone: ToastTone;
  text: string;
};

const categoryLabels: Record<ProductCategory, string> = {
  "Хоол": "Хоол",
  "Хүнс": "Хүнс",
  "Бөөнний түгээлт": "Бөөнний түгээлт",
  "Урьдчилсан захиалга": "Урьдчилсан захиалга",
  "Кофе амттан": "Кофе амттан",
  "Алкохол": "Алкохол",
  "Гэр ахуй & хүүхэд": "Гэр ахуй & хүүхэд",
  "Эргэнэтэд үйлдвэрлэв": "Эргэнэтэд үйлдвэрлэв",
  "Бэлэг & гоо сайхан": "Бэлэг & гоо сайхан",
  "Гадаад захиалга": "Гадаад захиалга",
};

export default function ShopPage() {
  const { adminToken, adminProfile, hydrated } = useAuthContext();

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<"All" | ProductCategory>("All");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory>(PRODUCT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdminReady = hydrated && Boolean(adminToken);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((item) => item.category === activeCategory);
  }, [activeCategory, products]);

  const totals = useMemo(() => {
    const totalProducts = products.length;
    const categoriesWithProducts = new Set(products.map((item) => item.category)).size;
    const totalValue = products.reduce((sum, item) => sum + item.price, 0);

    return {
      totalProducts,
      categoriesWithProducts,
      totalValue,
    };
  }, [products]);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const data = await listShopProducts();
      setProducts(data);
      if (data.length === 0) {
        setToast({ tone: "info", text: "Одоогоор бүтээгдэхүүн бүртгэлгүй байна." });
      }
    } catch (error) {
      setToast({
        tone: "error",
        text: error instanceof Error ? error.message : "Бүтээгдэхүүн татахад алдаа гарлаа.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshProducts();
  }, []);

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory(PRODUCT_CATEGORIES[0]);
    setDescription("");
    setImageFile(null);
  };

  const submitProduct = async () => {
    if (!adminToken) {
      setToast({ tone: "error", text: "Админ эрхээр нэвтэрнэ үү." });
      return;
    }

    const parsedPrice = Number(price.replace(/[^\d]/g, ""));
    if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setToast({ tone: "error", text: "Нэр болон үнийг зөв оруулна уу." });
      return;
    }

    setSubmitting(true);
    try {
      const created = await createShopProduct(adminToken, {
        name: name.trim(),
        price: parsedPrice,
        category,
        description: description.trim() || undefined,
        image: imageFile,
      });

      setProducts((current) => [created, ...current]);
      setToast({ tone: "success", text: "Бүтээгдэхүүн амжилттай нэмэгдлээ. YukiMobile дээр автоматаар харагдана." });
      resetForm();
    } catch (error) {
      setToast({
        tone: "error",
        text: error instanceof Error ? error.message : "Бүтээгдэхүүн нэмэх үед алдаа гарлаа.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const removeProduct = async (id: string) => {
    if (!adminToken) {
      setToast({ tone: "error", text: "Админ эрхээр нэвтэрнэ үү." });
      return;
    }

    const ok = typeof window !== "undefined" ? window.confirm("Энэ бүтээгдэхүүнийг устгах уу?") : true;
    if (!ok) return;

    try {
      await deleteShopProduct(adminToken, id);
      setProducts((current) => current.filter((item) => item._id !== id));
      setToast({ tone: "success", text: "Бүтээгдэхүүн устгагдлаа." });
    } catch (error) {
      setToast({
        tone: "error",
        text: error instanceof Error ? error.message : "Бүтээгдэхүүн устгах үед алдаа гарлаа.",
      });
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,#1d2b5f_0%,#0b0e16_44%,#06070a_100%)] p-6 shadow-[0_22px_64px_-30px_rgba(0,0,0,0.9)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl" aria-hidden />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Yuki Commerce Admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Ecommerce Product Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200/80">
              Эндээс нэмсэн бүтээгдэхүүнүүд `YukiMobile` аппын бүтээгдэхүүний feed дээр шууд гарна.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-slate-100 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300/90">Admin Session</p>
            <p className="mt-1 font-medium">{adminProfile?.phone || "Нэвтрээгүй"}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Нийт бараа" value={String(totals.totalProducts)} />
        <MetricCard label="Ангилалтай бараа" value={`${totals.categoriesWithProducts}/${PRODUCT_CATEGORIES.length}`} />
        <MetricCard label="Нийт үнэлгээ" value={`${formatMnt(totals.totalValue)} ₮`} />
      </section>

      {toast ? (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
            toast.tone === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
              : toast.tone === "error"
              ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
              : "border-sky-500/40 bg-sky-500/10 text-sky-100"
          }`}
        >
          {toast.text}
        </div>
      ) : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr,2fr]">
        <article className="rounded-3xl border border-white/10 bg-[#0b1019] p-5 shadow-[0_16px_42px_-28px_rgba(0,0,0,0.85)]">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Бүтээгдэхүүн нэмэх</h2>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[11px] text-cyan-200">Mobile Sync</span>
          </header>

          {!isAdminReady ? (
            <div className="rounded-2xl border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Бүтээгдэхүүн нэмэхийн тулд админ эрхээр нэвтэрнэ үү.
              <div className="mt-3">
                <Link href="/auth" className="inline-flex rounded-lg border border-amber-200/40 px-3 py-1.5 text-xs font-semibold hover:bg-amber-100/10">
                  Admin Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <label className="grid gap-1 text-xs text-slate-300">
                <span>Нэр</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
                  placeholder="Жишээ: Premium Coffee Beans"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs text-slate-300">
                  <span>Үнэ (₮)</span>
                  <input
                    value={price}
                    onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ""))}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
                    placeholder="35000"
                  />
                </label>

                <label className="grid gap-1 text-xs text-slate-300">
                  <span>Ангилал</span>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value as ProductCategory)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
                  >
                    {PRODUCT_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {categoryLabels[item]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-1 text-xs text-slate-300">
                <span>Тайлбар</span>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
                  placeholder="Товч тодорхойлолт"
                />
              </label>

              <label className="grid gap-1 text-xs text-slate-300">
                <span>Зураг</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  className="rounded-xl border border-dashed border-white/20 bg-black/20 px-3 py-2 text-xs text-slate-200"
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => void submitProduct()}
                  disabled={submitting}
                  className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-[#021018] disabled:opacity-60"
                >
                  {submitting ? "Publishing..." : "Publish Product"}
                </button>
              </div>
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#0a0d14] p-5 shadow-[0_16px_42px_-28px_rgba(0,0,0,0.85)]">
          <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Inventory</h2>
            <div className="flex flex-wrap gap-2">
              {(["All", ...PRODUCT_CATEGORIES] as const).map((item) => {
                const active = activeCategory === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveCategory(item)}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      active
                        ? "bg-cyan-300 text-[#031019]"
                        : "border border-white/10 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {item === "All" ? "All" : categoryLabels[item]}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => void refreshProducts()}
                disabled={loading}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-60"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </header>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-7 text-center text-sm text-slate-400">
              Энэ ангилалд бүтээгдэхүүн алга байна.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const imageSrc = product.image ? `${UPLOADS_URL}/${encodeURIComponent(product.image)}` : null;
                return (
                  <article key={product._id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
                    <Link href={`/shop/${product._id}`} className="block">
                      <div className="relative aspect-[4/5] bg-[#07090f]">
                        {imageSrc ? (
                          <Image src={imageSrc} alt={product.name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-slate-500">
                            No Image
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">{categoryLabels[product.category]}</p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-white">{product.name}</h3>
                      <p className="mt-2 text-sm font-semibold text-slate-100">{formatMnt(product.price)} ₮</p>
                      {product.description ? (
                        <p className="mt-2 line-clamp-2 text-xs text-slate-400">{product.description}</p>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Link
                          href={`/shop/${product._id}`}
                          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/5"
                        >
                          Detail
                        </Link>
                        {isAdminReady ? (
                          <button
                            type="button"
                            onClick={() => void removeProduct(product._id)}
                            className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-200 hover:bg-rose-500/20"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0d111a] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}
