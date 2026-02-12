"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

const categoryOptions: Array<{ key: "All" | ProductCategory; label: string }> = [
  { key: "All", label: "All" },
  ...PRODUCT_CATEGORIES.map((item) => ({ key: item, label: item })),
];

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<"All" | ProductCategory>("All");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory>(PRODUCT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((item) => item.category === activeCategory);
  }, [activeCategory, products]);

  const reload = async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await listShopProducts(activeCategory === "All" ? undefined : activeCategory);
      setProducts(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [activeCategory]);

  const clearForm = () => {
    setName("");
    setPrice("");
    setCategory(PRODUCT_CATEGORIES[0]);
    setDescription("");
    setImageFile(null);
  };

  const publish = async () => {
    const parsedPrice = Number(price.replace(/[^\d]/g, ""));
    if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setMessage("Name and price are required.");
      return;
    }
    if (imageFile && imageFile.size > 8 * 1024 * 1024) {
      setMessage("Image is too large. Max 8MB.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const created = await createShopProduct({
        name,
        price: parsedPrice,
        category,
        description,
        image: imageFile,
      });

      if (activeCategory === "All" || activeCategory === created.category) {
        setProducts((current) => [created, ...current]);
      }

      clearForm();
      setMessage("Product published. It is now available in YukiMobile.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    const confirmed = typeof window === "undefined" ? true : window.confirm("Delete this product?");
    if (!confirmed) return;

    try {
      await deleteShopProduct(id);
      setProducts((current) => current.filter((item) => item._id !== id));
      setMessage("Product deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <section className="rounded-[4px] border border-black/20 bg-white p-4">
        <h1 className="text-base font-semibold text-black">Product Manager</h1>
        <p className="mt-1 text-sm text-black/70">Add products synced to YukiMobile.</p>
      </section>

      <section className="mt-4 rounded-[4px] border border-black/20 bg-white p-4">
        <h2 className="text-sm font-semibold text-black">Add Product</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
          />
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ""))}
            placeholder="Price"
            className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as ProductCategory)}
            className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
          >
            {PRODUCT_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black"
          />
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            className="sm:col-span-2 rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
          />
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={clearForm}
            className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-xs text-black"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={submitting}
            className="rounded-[4px] border border-black bg-black px-3 py-2 text-xs text-white disabled:opacity-60"
          >
            {submitting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </section>

      <section className="mt-4 rounded-[4px] border border-black/20 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-black">Products</h2>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveCategory(item.key)}
                className={`rounded-[4px] border px-2.5 py-1 text-xs ${
                  activeCategory === item.key
                    ? "border-black bg-black text-white"
                    : "border-black/20 bg-white text-black"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void reload()}
              className="rounded-[4px] border border-black/20 bg-white px-2.5 py-1 text-xs text-black"
            >
              {loading ? "Loading..." : "Reload"}
            </button>
          </div>
        </div>

        {message ? (
          <p className="mt-3 rounded-[4px] border border-black/20 bg-white px-3 py-2 text-xs text-black">{message}</p>
        ) : null}

        {visibleProducts.length === 0 ? (
          <p className="mt-3 text-sm text-black/70">No products.</p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <article key={product._id} className="rounded-[4px] border border-black/20 bg-white p-2">
                <Link href={`/shop/${product._id}`} className="block">
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
                </Link>

                <h3 className="mt-2 line-clamp-1 text-sm font-medium text-black">{product.name}</h3>
                <p className="text-xs text-black/70">{product.category}</p>
                <p className="mt-1 text-sm font-semibold text-black">{formatMnt(product.price)} ₮</p>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <Link
                    href={`/shop/${product._id}`}
                    className="rounded-[4px] border border-black/20 bg-white px-2.5 py-1 text-xs text-black"
                  >
                    Detail
                  </Link>
                  <button
                    type="button"
                    onClick={() => void remove(product._id)}
                    className="rounded-[4px] border border-black/20 bg-white px-2.5 py-1 text-xs text-black"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
