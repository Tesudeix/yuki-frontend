import Link from "next/link";

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="mt-2 text-neutral-300">Explore tools and content by category.</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Link
            href="/categories/ai-agents"
            className="rounded-md border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
          >
            <div className="text-lg font-semibold">AI Agents</div>
            <p className="mt-1 text-sm text-neutral-300">Automation and creative helpers</p>
          </Link>

          <Link href="/feed" className="rounded-md border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900">
            <div className="text-lg font-semibold">Blogs</div>
            <p className="mt-1 text-sm text-neutral-300">Stories and updates</p>
          </Link>
        </section>
      </div>
    </main>
  );
}

