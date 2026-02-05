import { Skeleton } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <main className="page-shell text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 animate-rise">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
        </div>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <article key={i} className="rounded-xl border border-white/10 bg-black/60 p-4">
              <Skeleton className="mb-3 h-64 w-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="mt-3 h-8 w-28" />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
