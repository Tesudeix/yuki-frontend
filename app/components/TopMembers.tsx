"use client";
import React, { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../../lib/config";

type User = { id?: string; _id?: string; name?: string | null; phone?: string };
type Post = { _id: string; user?: User; likes?: unknown[]; comments?: unknown[]; shares?: number };

type Member = { id: string; name: string; phone?: string; score: number; posts: number };

export default function TopMembers() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const url = new URL(`${BASE_URL}/api/posts`);
        url.searchParams.set("page", "1");
        url.searchParams.set("limit", "50");
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = (await res.json()) as Post[];
        if (!Array.isArray(data)) return;
        const map = new Map<string, Member>();
        for (const p of data) {
          const u = p.user || {};
          const id = (u.id || u._id || "") as string;
          if (!id) continue;
          const score = (p.likes?.length || 0) + (p.comments?.length || 0) + (p.shares || 0);
          const name = (u.name || u.phone || "User") as string;
          const prev = map.get(id);
          if (prev) {
            prev.score += score;
            prev.posts += 1;
          } else {
            map.set(id, { id, name, phone: u.phone, score, posts: 1 });
          }
        }
        const list = Array.from(map.values()).sort((a, b) => b.score - a.score).slice(0, 5);
        if (mounted) setMembers(list);
      } catch {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const rows = useMemo(() => members, [members]);

  return (
    <section className="rounded-xl border border-white/5 bg-[#0B0B12] p-4">
      <h3 className="text-sm font-semibold mb-3">Идэвхтэй гишүүд</h3>
      <ul className="space-y-2 text-sm text-neutral-300">
        {rows.length === 0 && <li className="text-neutral-500">Одоогоор гишүүн алга</li>}
        {rows.map((m) => (
          <li key={m.id} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-xs font-semibold">
              {(m.name || "U").slice(0, 1).toUpperCase()}
            </div>
            <span className="truncate">{m.name}</span>
            <span className="ml-auto text-xs text-neutral-500">{m.score} оноо</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
