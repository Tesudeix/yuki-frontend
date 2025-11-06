"use client";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../lib/config";

type Post = {
  _id: string;
  content: string;
  likes?: unknown[];
  comments?: unknown[];
  shares?: number;
};

type TrendingItem = { id: string; text: string; score: number };

const truncate = (text: string, n = 80) => (text.length > n ? `${text.slice(0, n - 3)}...` : text);

export default function TrendingTopics() {
  const [topics, setTopics] = useState<TrendingItem[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const url = new URL(`${BASE_URL}/api/posts`);
        url.searchParams.set("page", "1");
        url.searchParams.set("limit", "20");
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const items: TrendingItem[] = data.map((p: Post) => ({
          id: p._id,
          text: truncate(p.content || ""),
          score: (p.likes?.length || 0) + (p.comments?.length || 0) + (p.shares || 0),
        }));
        items.sort((a, b) => b.score - a.score);
        if (mounted) setTopics(items.slice(0, 5));
      } catch {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="bg-[#111111] rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3">Trending</h3>
      <ul className="space-y-2 text-sm text-neutral-300">
        {topics.length === 0 && <li className="text-neutral-500">No trending topics yet</li>}
        {topics.map((t) => (
          <li key={t.id} className="truncate">{t.text || "Untitled post"}</li>
        ))}
      </ul>
    </section>
  );
}
