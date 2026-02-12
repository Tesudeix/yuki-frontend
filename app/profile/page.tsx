"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MdiCamera, MdiDotsHorizontal } from "@/app/components/icons";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL } from "../../lib/config";
import FeedPostCard, { type Post } from "@/app/components/FeedPostCard";

export default function ProfilePage() {
  const { token, hydrated, user, updateUserLocal } = useAuthContext();
  const router = useRouter();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [category, setCategory] = useState<"All" | "General" | "News" | "Tools" | "Tasks">("All");

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
      if (category !== "All") url.searchParams.set("category", category);
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
  }, [myId, category]);

  useEffect(() => { if (myId) { setPage(1); fetchPage(1); } }, [fetchPage, myId]);

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
      const upRes = await fetch(`${BASE_URL}/api/upload`, { method: "POST", body: form });
      const upJson = await upRes.json();
      const downloadUrl = upJson?.downloadUrl as string | undefined;
      if (!downloadUrl) throw new Error("Upload failed");

      // 2) Persist avatarUrl to profile in backend (Mongo route)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-User-Id": myId,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const patchRes = await fetch(`${BASE_URL}/api/users/profile/avatar`, {
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
    <div className="page-shell text-white">
      <div className="mx-auto max-w-3xl p-4 grid gap-5 animate-rise">
        {/* Top title */}
        <div className="flex items-center justify-center py-2">
          <h1 className="text-sm font-semibold text-neutral-400">AI Clan • Профайл</h1>
        </div>
        {/* Profile header styled like feed row */}
        <header className="w-full border-b border-white/10 py-5">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl as string}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#1400FF] via-[#3522FF] to-[#050508] text-sm font-semibold">
                {(user?.name || user?.phone || "U").toString().slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white leading-none">{user?.name || user?.phone || "User"}</p>
                  <p className="text-[13px] text-neutral-500">@{(user?.name || user?.phone || "user").toString().slice(-6)}</p>
                </div>
                <button className="text-neutral-500 hover:text-white transition" aria-label="More">
                  <MdiDotsHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={onChooseFile}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-sm text-neutral-200 hover:bg-white/5 disabled:opacity-60"
                >
                  <MdiCamera className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Зураг солих"}
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
          </div>
        </header>

        {/* Pinned banner if not premium */}
        {user && !user.classroomAccess && (
          <div className="rounded-md border border-white/10 bg-black/60 px-4 py-3 text-sm text-neutral-200 backdrop-blur">
            <span className="mr-2">📌</span>
            Community нь Clan гишүүдэд нээлттэй.
            <a href="/payment" className="ml-2 underline decoration-[#1400FF] hover:text-white">Clan-д нэгдэх — ₮25,000</a>
          </div>
        )}

        {/* Threads-style pill filter bar */}
        <div className="flex items-center justify-center gap-2 py-1">
          {(["All","General","News","Tools","Tasks"] as const).map((c) => (
            <button
              key={c}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${category === c ? "bg-[#1400FF] text-white" : "bg-white/5 text-neutral-300 hover:bg-white/10"}`}
              onClick={() => setCategory(c)}
            >
              {({ All: "Бүгд", General: "Ерөнхий", News: "Мэдээ", Tools: "Хэрэгсэл", Tasks: "Даалгавар" } as const)[c]}
            </button>
          ))}
        </div>

        <section className="grid gap-0">
          {myPosts.map((p) => (
            <FeedPostCard key={p._id} post={p} onDelete={handleDelete} onShareAdd={handleShareAdd} />
          ))}
          {loading && <div className="text-center py-4 text-sm text-neutral-400">Ачаалж байна...</div>}
        <div ref={loadMoreRef} />
        </section>


      </div>
    </div>
  );
}
