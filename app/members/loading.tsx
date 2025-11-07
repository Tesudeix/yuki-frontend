import { Skeleton } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="mb-4 h-9 w-full sm:w-64" />
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <article key={i} className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="mb-2 h-3 w-2/3" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

