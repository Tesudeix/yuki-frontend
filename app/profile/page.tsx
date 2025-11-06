"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL } from "../../lib/config";
import FeedPostCard, { type Post } from "@/app/components/FeedPostCard";
import PostInput from "@/app/components/PostInput";

export default function ProfilePage() {
  const { token, hydrated, user } = useAuthContext();
  const router = useRouter();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const getId = (u: unknown): string => {
    if (!u || typeof u !== "object") return "";
    const obj = u as Record<string, unknown>;
    const id = obj.id;
    const _id = obj._id;
    if (typeof id === "string") return id;
    if (typeof _id === "string") return _id;
    return "";
  };
  const myId = getId(user);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.push("/auth");
  }, [hydrated, token, router]);

  const fetchPage = useCallback(async (p: number) => {
    if (!myId) return;
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/api/posts`);
      url.searchParams.set("page", String(p));
      url.searchParams.set("limit", "10");
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        const mine = data.filter((post: Post) => {
          const owner = getId(post?.user);
          return owner && owner === myId;
        });
        setMyPosts((prev) => (p === 1 ? mine : [...prev, ...mine]));
        setHasMore(data.length === 10);
      }
    } finally {
      setLoading(false);
    }
  }, [myId]);

  useEffect(() => { if (myId) fetchPage(1); }, [fetchPage, myId]);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const next = page + 1;
        setPage(next);
        fetchPage(next);
      }
    });
    const el = loadMoreRef.current;
    if (el) obs.observe(el);
    return () => { if (el) obs.unobserve(el); };
  }, [fetchPage, hasMore, loading, page]);

  const handleDelete = (id: string) => setMyPosts((prev) => prev.filter((p) => p._id !== id));
  const handleShareAdd = (p: Post) => setMyPosts((prev) => [p, ...prev]);
  const handleNewPost = (p: Post) => setMyPosts((prev) => [p, ...prev]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      <div className="mx-auto max-w-3xl p-4 grid gap-5">
        <header className="grid gap-1">
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <p className="text-sm text-neutral-400">{user?.name || user?.phone}</p>
        </header>

        {token && <PostInput onPost={handleNewPost} />}

        <section className="grid gap-3">
          {myPosts.map((p) => (
            <FeedPostCard key={p._id} post={p} onDelete={handleDelete} onShareAdd={handleShareAdd} />
          ))}
          {loading && <div className="text-center py-4 text-sm text-neutral-400">Loading...</div>}
          <div ref={loadMoreRef} />
        </section>
      </div>
    </div>
  );
}
