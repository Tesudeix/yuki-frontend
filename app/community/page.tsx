"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL, UPLOADS_URL } from "@/lib/config";

type Post = {
  _id: string;
  content?: string;
  image?: string;
  category?: string;
  createdAt?: string;
  user?: { name?: string | null };
};

const timeAgo = (iso?: string) => {
  if (!iso) return "Just now";
  const t = new Date(iso).getTime();
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const shortText = (value: string, limit = 46) => {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return "Antaqor update";
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
};

export default function CommunityPage() {
  const { user, token, hydrated } = useAuthContext();
  const membershipActive = Boolean(user?.membershipActive ?? user?.classroomAccess);

  const [antaqorPosts, setAntaqorPosts] = useState<Post[]>([]);
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [loadingAntaqor, setLoadingAntaqor] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadAntaqor = async () => {
      setLoadingAntaqor(true);
      try {
        const url = new URL(`${BASE_URL}/api/posts`);
        url.searchParams.set("limit", "12");
        url.searchParams.set("category", "Antaqor");
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await res.json().catch(() => []);
        if (active && Array.isArray(data)) setAntaqorPosts(data);
      } catch (err) {
        console.warn("Antaqor load failed", err);
        if (active) setError("Антакор хэсэг ачаалахад алдаа гарлаа.");
      } finally {
        if (active) setLoadingAntaqor(false);
      }
    };
    loadAntaqor();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!hydrated) return () => {};

    if (!membershipActive || !token) {
      setCommunityPosts([]);
      setLoadingCommunity(false);
      return () => {};
    }

    const loadCommunity = async () => {
      setLoadingCommunity(true);
      try {
        const url = new URL(`${BASE_URL}/api/posts`);
        url.searchParams.set("limit", "10");
        url.searchParams.set("category", "Community");
        const res = await fetch(url.toString(), {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json().catch(() => []);
        if (active && Array.isArray(data)) setCommunityPosts(data);
      } catch (err) {
        console.warn("Community load failed", err);
        if (active) setError("Community хэсэг ачаалахад алдаа гарлаа.");
      } finally {
        if (active) setLoadingCommunity(false);
      }
    };
    loadCommunity();
    return () => {
      active = false;
    };
  }, [hydrated, membershipActive, token]);

  const antaqorEmpty = !loadingAntaqor && antaqorPosts.length === 0;
  const communityEmpty = !loadingCommunity && communityPosts.length === 0;

  const statusLabel = useMemo(
    () => (membershipActive ? "Active membership" : "Membership required"),
    [membershipActive],
  );

  return (
    <main className="page-shell text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-10">
          <div className="space-y-4">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.36em] text-[#7a7fa6]">Antaqor</p>
                <h1 className="mt-2 text-2xl font-semibold">Antaqor</h1>
                <p className="mt-1 text-sm text-neutral-400">Public identity anchor.</p>
              </div>
              <span className="rounded-sm border border-[#1400FF]/30 bg-[#1400FF]/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#b4b0ff]">
                Public
              </span>
            </header>

            {error && (
              <div className="rounded-sm border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {loadingAntaqor &&
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={`antaqor-skel-${i}`} className="aspect-square border border-white/10 bg-black/60 animate-pulse" />
                ))}

              {antaqorPosts.map((post) => (
                <article key={post._id} className="group relative aspect-square border border-white/10 bg-black/70 overflow-hidden">
                  {post.image && (
                    <Image
                      src={`${UPLOADS_URL}/${post.image}`}
                      alt={post.content || "Antaqor post"}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 transition"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#b4b0ff]">Antaqor</p>
                    <h3 className="mt-1 text-sm font-semibold">{shortText(post.content || "")}</h3>
                  </div>
                </article>
              ))}

              {antaqorEmpty && (
                <div className="col-span-full border border-white/10 bg-black/40 p-6 text-sm text-neutral-400">
                  Одоогоор Антакор пост алга байна.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.36em] text-[#7a7fa6]">Community</p>
                <h2 className="mt-2 text-xl font-semibold">Community (Membership)</h2>
                <p className="mt-1 text-sm text-neutral-400">Inner circle feed.</p>
              </div>
              <span className="rounded-sm border border-white/10 bg-black/50 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-neutral-300">
                {statusLabel}
              </span>
            </header>

            {!membershipActive ? (
              <div className="border border-white/10 bg-black/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">Members only</p>
                    <p className="mt-1 text-xs text-neutral-400">Upgrade to unlock the inner circle.</p>
                  </div>
                  <Link
                    href="/payment"
                    className="rounded-sm bg-[#1400FF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                  >
                    Upgrade
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Link
                      key={`locked-${i}`}
                      href="/payment"
                      className="relative aspect-square border border-white/10 bg-black/70"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1400FF]/25 via-transparent to-black/60" />
                      <div className="absolute inset-0 grid place-items-center text-[11px] uppercase tracking-[0.3em] text-[#b4b0ff]">
                        Locked
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                {loadingCommunity &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={`community-skel-${i}`} className="border border-white/10 bg-black/60 p-4 animate-pulse">
                      <div className="h-3 w-24 rounded bg-neutral-800" />
                      <div className="mt-3 h-4 w-full rounded bg-neutral-800" />
                      <div className="mt-2 h-3 w-32 rounded bg-neutral-800" />
                    </div>
                  ))}

                {communityPosts.map((post) => (
                  <article key={post._id} className="border border-white/10 bg-black/70 p-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="uppercase tracking-[0.2em] text-[#7a7fa6]">Members</span>
                      <span>{timeAgo(post.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-100">{post.content || "Member update"}</p>
                    {post.image && (
                      <div className="mt-3 aspect-video w-full overflow-hidden">
                        <Image
                          src={`${UPLOADS_URL}/${post.image}`}
                          alt="community"
                          width={640}
                          height={360}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </article>
                ))}

                {communityEmpty && (
                  <div className="border border-white/10 bg-black/40 p-6 text-sm text-neutral-400">
                    Одоогоор community пост алга байна.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="hidden lg:flex flex-col gap-4">
          <div className="border border-white/10 bg-black/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Membership</div>
            <div className="mt-3 text-lg font-semibold text-white">
              {membershipActive ? "Active" : "Locked"}
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              {membershipActive ? "You are in the inner circle." : "Upgrade to unlock community access."}
            </p>
            {!membershipActive && (
              <Link
                href="/payment"
                className="mt-4 inline-flex w-full items-center justify-center rounded-sm bg-[#1400FF] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Upgrade
              </Link>
            )}
          </div>

          <div className="border border-white/10 bg-black/70 p-4 text-xs text-neutral-400">
            Antaqor is public. Community is members-only.
          </div>
        </aside>
      </div>
    </main>
  );
}
