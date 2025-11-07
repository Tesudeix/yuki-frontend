import { Skeleton } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[300px_1fr]">
        {/* Sidebar skeleton */}
        <aside className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </aside>

        {/* Main skeleton */}
        <section className="grid gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-4 w-2/3" />
        </section>
      </div>
    </div>
  );
}

