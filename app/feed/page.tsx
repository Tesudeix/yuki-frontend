"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL } from "../../lib/config";
import PostInput from "@/app/components/PostInput";
import FeedPostCard, { type Post } from "@/app/components/FeedPostCard";
import { Skeleton } from "@/app/components/Skeleton";
// import LeftSidebar from "@/app/components/LeftSidebar";
// import RightSidebar from "@/app/components/RightSidebar";

export default function FeedPage() {
  const { token, hydrated, user } = useAuthContext();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<"All" | "General" | "News" | "Tools" | "Tasks">("All");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.push("/auth");
  }, [hydrated, token, router]);

  const fetchPage = useCallback(async (p: number, append = false) => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/api/posts`);
      url.searchParams.set("page", String(p));
      url.searchParams.set("limit", "10");
      if (category !== "All") url.searchParams.set("category", category);
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === 10);
      }
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { setPage(1); fetchPage(1); }, [fetchPage]);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const next = page + 1;
        setPage(next);
        fetchPage(next, true);
      }
    });
    const el = loadMoreRef.current;
    if (el) obs.observe(el);
    return () => { if (el) obs.unobserve(el); };
  }, [hasMore, loading, page, fetchPage]);

  const addNewPost = (post: Post) => setPosts((prev) => [post, ...prev]);

  const handleDeleteFromFeed = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleShareAddToFeed = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#181818] to-[#0A0A0A] text-white">
      <div className="mx-auto max-w-6xl p-4 grid gap-4 md:grid-cols-[240px,minmax(0,1fr)] lg:grid-cols-[240px,minmax(0,1fr),300px]">

        <main className="grid gap-4">

          {/* Pinned paywall banner */}
          {user && !user.classroomAccess && (
            <div className="rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-200">
              <span className="mr-2">📌</span>
              Community нь Clan гишүүдэд нээлттэй.
              <a href="/payment" className="ml-2 underline decoration-[#0D81CA] hover:text-white">Clan-д нэгдэх — ₮25,000</a>
            </div>
          )}

          {/* Threads-style pill filter bar */}
          <div className="flex items-center justify-center gap-2 py-1">
            {(["All","General","News","Tools","Tasks"] as const).map((c) => (
              <button
                key={c}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${category === c ? "bg-[#0D81CA] text-white" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"}`}
                onClick={() => setCategory(c)}
              >
                {({ All: "Бүгд", General: "Ерөнхий", News: "news", Tools: "Хэрэгсэл", Tasks: "Даалгавар" } as const)[c]}
              </button>
            ))}
          </div>

          {token && (
            <div id="composer-anchor">
              <PostInput onPost={addNewPost} initialCategory={(category === "All" ? "General" : category) as "General" | "News" | "Tools" | "Tasks"} />
            </div>
          )}

          <section className="grid gap-4">
            {/* First-load skeletons */}
            {loading && posts.length === 0 && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-neutral-800 bg-[#181818] p-4">
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
              </>
            )}

            {posts.map((post) => (
              <FeedPostCard
                key={post._id}
                post={post}
                onDelete={handleDeleteFromFeed}
                onShareAdd={handleShareAddToFeed}
              />
            ))}
            {!loading && posts.length === 0 && (
              <div className="text-center py-6 text-sm text-neutral-400">Here аsнгилалд одоогоор пост байхгүй.</div>
            )}
            {/* Bottom skeleton while loading more */}
            {loading && posts.length > 0 && (
              <div className="grid gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-neutral-800 bg-[#181818] p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="mb-2 h-3 w-24" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            )}
            <div ref={loadMoreRef} />
          </section>

          {/* Floating '+' button removed as requested */}
        </main>
      </div>
    </div>
  );
}
