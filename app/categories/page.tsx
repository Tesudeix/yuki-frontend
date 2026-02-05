import Link from "next/link";

export default function CategoriesPage() {
  return (
    <main className="page-shell text-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-12 animate-rise">
        <h1 className="text-2xl font-bold">Ангиллууд</h1>
        <p className="mt-2 text-neutral-300">Ангиллаар хэрэгсэл, контентыг судлаарай.</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Link
            href="/categories/ai-agents"
            className="rounded-md border border-white/10 bg-black/60 p-5 hover:bg-white/5"
          >
            <div className="text-lg font-semibold">AI Агентууд</div>
            <p className="mt-1 text-sm text-neutral-300">Автоматжуулалт, бүтээлч туслагчид</p>
          </Link>

          <Link href="/community" className="rounded-md border border-white/10 bg-black/60 p-5 hover:bg-white/5">
            <div className="text-lg font-semibold">Блог</div>
            <p className="mt-1 text-sm text-neutral-300">Нийтлэл, шинэчлэлүүд</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
