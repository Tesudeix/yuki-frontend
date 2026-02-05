"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FeaturedSlider from "@/app/components/FeaturedSlider";
import { Skeleton } from "@/app/components/Skeleton";
import { BASE_URL, UPLOADS_URL } from "@/lib/config";
import { useAuthContext } from "@/contexts/auth-context";

type Post = {
  _id: string;
  content?: string;
  image?: string;
  category?: "General" | "News" | "Tools" | "Tasks";
  createdAt?: string;
  sharedFrom?: Post;
};

type RailItem = {
  id: string;
  title: string;
  meta: string;
  badge: string;
  badgeTone: "primary" | "secondary";
  imageUrl?: string;
  href: string;
};

const timeAgo = (iso?: string) => {
  if (!iso) return "Just now";
  const d = new Date(iso).getTime();
  const s = Math.max(0, Math.floor((Date.now() - d) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
};

const truncate = (value: string, limit = 44) => {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return "Private post";
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
};

export default function HomePage() {
  const { token } = useAuthContext();
  const locked = !token;

  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState({ community: true });

  useEffect(() => {
    let active = true;
    const loadCommunity = async () => {
      try {
        const url = new URL(`${BASE_URL}/api/posts`);
        url.searchParams.set("limit", "8");
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await res.json().catch(() => []);
        if (active && Array.isArray(data)) setCommunityPosts(data.slice(0, 8));
      } catch (err) {
        console.warn("Home community load failed", err);
      } finally {
        if (active) setLoading({ community: false });
      }
    };

    loadCommunity();

    return () => {
      active = false;
    };
  }, []);

  const communityItems = useMemo<RailItem[]>(() => (
    communityPosts.map((post) => {
      const display = post.sharedFrom || post;
      return {
        id: post._id,
        title: truncate(display.content || ""),
        meta: timeAgo(display.createdAt),
        badge: locked ? "Private" : display.category || "Community",
        badgeTone: locked ? "primary" : "secondary",
        imageUrl: display.image ? `${UPLOADS_URL}/${display.image}` : undefined,
        href: "/community",
      };
    })
  ), [communityPosts, locked]);

  return (
    <main className="page-shell text-white">
      <FeaturedSlider />

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <HomeRail
          title="Community"
          hint="Latest discussions"
          href="/community"
          items={communityItems}
          loading={loading.community}
          locked={locked}
          emptyLabel="Одоогоор пост алга байна."
        />
      </div>
    </main>
  );
}

function HomeRail({
  title,
  hint,
  href,
  items,
  loading,
  locked,
  emptyLabel,
}: {
  title: string;
  hint: string;
  href: string;
  items: RailItem[];
  loading: boolean;
  locked: boolean;
  emptyLabel: string;
}) {
  return (
    <section className="mt-10 home-rail home-rail--community">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[#7a7fa6]">{hint}</p>
        </div>
        <Link href={href} className="text-[11px] uppercase tracking-[0.22em] text-white/80 hover:text-white">
          View all
        </Link>
      </header>

      <div className="slider__track mt-4" aria-label={`${title} content`}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={`home-skeleton-${title}-${i}`} className="card">
                <div className="card__media">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="card__body">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          : items.map((item) => <HomeCard key={item.id} item={item} locked={locked} />)}

        {!loading && items.length === 0 && (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-white/10 bg-black/40 text-sm text-neutral-400">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
}

function HomeCard({ item, locked }: { item: RailItem; locked: boolean }) {
  const href = locked ? "/auth" : item.href;
  return (
    <article className={`card ${locked ? "card--locked" : ""}`}>
      <Link href={href} className="card__link">
        <div className="card__media">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="240px"
              className="card__media-image"
              unoptimized
            />
          )}
        </div>
        <div className="card__body">
          <span className={`card__badge ${item.badgeTone === "secondary" ? "card__badge--secondary" : ""}`}>
            {item.badge}
          </span>
          <h3 className="card__title">{item.title}</h3>
          <p className="card__meta">{item.meta}</p>
        </div>
      </Link>
      {locked && (
        <div className="card__lock">
          <span className="card__lock-pill">Private</span>
          <span className="card__lock-text">Нэвтэрч үзэх</span>
        </div>
      )}
    </article>
  );
}
