"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import FeedPostCard, { type Post } from "@/app/components/FeedPostCard";
import { BASE_URL } from "@/lib/config";

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (p: number, append = false) => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/api/posts`);
      url.searchParams.set("page", String(p));
      url.searchParams.set("limit", "10");
      url.searchParams.set("category", "News");
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

  useEffect(() => { setPage(1); void fetchPage(1); }, [fetchPage]);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const next = page + 1;
        setPage(next);
        void fetchPage(next, true);
      }
    });
    const el = loadMoreRef.current;
    if (el) obs.observe(el);
    return () => { if (el) obs.unobserve(el); };
  }, [hasMore, loading, page, fetchPage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#181818] to-[#0A0A0A] text-white">
      <div className="mx-auto max-w-3xl p-4 grid gap-4">
        <header className="flex items-center justify-center py-2">
          <h1 className="text-sm font-semibold text-neutral-400">Мэдээ</h1>
        </header>

        <section className="grid gap-0">
          {posts.map((post) => (
            <FeedPostCard key={post._id} post={post} />
          ))}
          {!loading && posts.length === 0 && (
            <div className="text-center py-6 text-sm text-neutral-400">Одоогоор мэдээ байхгүй.</div>
          )}
          <div ref={loadMoreRef} />
        </section>
      </div>
    </div>
  );
}

