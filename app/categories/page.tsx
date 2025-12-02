import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-bold">Ангиллууд</h1>
        <p className="mt-2 text-neutral-300">Ангиллаар хэрэгсэл, контентыг судлаарай.</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* Shop category entry */}
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900">
            <Link href="/shop" className="block">
              <div className="text-lg font-semibold">Дэлгүүр</div>
              <p className="mt-1 text-sm text-neutral-300">Бараа, Prompt, Design</p>
            </Link>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((c) => (
                <Link
                  key={c}
                  href={`/shop?category=${encodeURIComponent(c)}`}
                  className="rounded-md border border-neutral-800 px-2 py-1 text-xs text-neutral-300 hover:border-neutral-600"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/categories/ai-agents"
            className="rounded-md border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
          >
            <div className="text-lg font-semibold">AI Агентууд</div>
            <p className="mt-1 text-sm text-neutral-300">Автоматжуулалт, бүтээлч туслагчид</p>
          </Link>

          <Link href="/feed" className="rounded-md border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900">
            <div className="text-lg font-semibold">Блог</div>
            <p className="mt-1 text-sm text-neutral-300">Нийтлэл, шинэчлэлүүд</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
