"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL } from "../../lib/config";
import PostInput from "@/app/components/PostInput";
import FeedPostCard, { type Post } from "@/app/components/FeedPostCard";
import LeftSidebar from "@/app/components/LeftSidebar";
import RightSidebar from "@/app/components/RightSidebar";

export default function FeedPage() {
  const { token, hydrated } = useAuthContext();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
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
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === 10);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

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
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      <div className="mx-auto max-w-6xl p-4 grid gap-4 md:grid-cols-[240px,minmax(0,1fr)] lg:grid-cols-[240px,minmax(0,1fr),300px]">
        <LeftSidebar />

        <main className="grid gap-4">
          <header className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Home Feed</h1>
          </header>

          {token && <PostInput onPost={addNewPost} />}

          <section className="grid gap-3">
            {posts.map((post) => (
              <FeedPostCard
                key={post._id}
                post={post}
                onDelete={handleDeleteFromFeed}
                onShareAdd={handleShareAddToFeed}
              />
            ))}
            {loading && <div className="text-center py-4 text-sm text-neutral-400">Loading...</div>}
            <div ref={loadMoreRef} />
          </section>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
