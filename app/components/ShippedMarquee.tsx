"use client";

import { useEffect, useState } from "react";
import { BASE_URL } from "@/lib/config";

type Item = { id: string; text: string };

const truncate = (t: string, n = 80) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

type PostLite = { _id: string; content?: string | null };

export default function ShippedMarquee() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const url = new URL(`${BASE_URL}/api/posts`);
        url.searchParams.set("page", "1");
        url.searchParams.set("limit", "12");
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = (await res.json()) as unknown;
        if (!Array.isArray(data)) return;
        const mapped: Item[] = (data as PostLite[])
          .map((p) => ({ id: String(p._id), text: truncate(String(p.content || "Untitled"), 100) }))
          .filter((i: Item) => Boolean(i.text));
        if (!cancelled) setItems(mapped.slice(0, 12));
      } catch {
        // ignore
      }
    };
    void load();
    const h = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(h); };
  }, []);

  if (items.length === 0) return null;

  // Duplicate for seamless marquee loop
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60" />
      <div
        className="flex gap-6 whitespace-nowrap py-3 text-sm text-neutral-300"
        style={{ animation: "marquee 20s linear infinite" }}
      >
        {loop.map((i, idx) => (
          <span key={`${i.id}-${idx}`} className="inline-flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1400FF]" />
            {i.text}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
