"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL } from "../../lib/config";
import FeedPostCard, { type Post } from "@/app/components/FeedPostCard";
import PostInput from "@/app/components/PostInput";

export default function ProfilePage() {
  const { token, hydrated, user, updateUserLocal } = useAuthContext();
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

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onChooseFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!myId) return;
    setUploading(true);
    try {
      // 1) Upload file to backend file mirror
      const form = new FormData();
      form.append("file", file);
      const upRes = await fetch(`${BASE_URL}/upload`, { method: "POST", body: form });
      const upJson = await upRes.json();
      const downloadUrl = upJson?.downloadUrl as string | undefined;
      if (!downloadUrl) throw new Error("Upload failed");

      // 2) Persist avatarUrl to profile in backend (Mongo route)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-User-Id": myId,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const patchRes = await fetch(`${BASE_URL}/users/profile/avatar`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ avatarUrl: downloadUrl }),
      });
      const patchJson = await patchRes.json();
      if (!patchRes.ok || !patchJson?.success) {
        throw new Error(patchJson?.error || "Failed to update profile avatar");
      }

      // 3) Update local user cache for immediate UI feedback
      updateUserLocal({ avatarUrl: downloadUrl });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      <div className="mx-auto max-w-3xl p-4 grid gap-5">
        <header className="flex items-center gap-4">
          <div className="relative">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl as string}
                alt="Avatar"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-bold">
                {(user?.name || user?.phone || "U").toString().slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">My Profile</h1>
            <p className="text-sm text-neutral-400">{user?.name || user?.phone}</p>
            <div className="mt-1">
              <button
                onClick={onChooseFile}
                disabled={uploading}
                className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Change Avatar"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>
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
