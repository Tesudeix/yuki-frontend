import { Skeleton } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      <div className="mx-auto max-w-6xl p-4 grid gap-4 md:grid-cols-[240px,minmax(0,1fr)] lg:grid-cols-[240px,minmax(0,1fr),300px]">
        <main className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 animate-pulse rounded bg-neutral-800" />
          </div>
          {/* Composer skeleton */}
          <div className="grid gap-3 rounded bg-[#111111] p-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-20 w-full" />
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
          {/* Posts skeleton */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-[#111111] p-4">
              <div className="mb-3 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-3 w-36" />
                  <Skeleton className="h-2 w-24" />
                </div>
              </div>
              <Skeleton className="mb-3 h-16 w-full" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

