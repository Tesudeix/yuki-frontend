"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BASE_URL } from "@/lib/config";
import { useAuthContext } from "@/contexts/auth-context";

type Member = { id: string; name?: string | null; phone?: string | null; avatarUrl?: string | null; createdAt?: string | null };

export default function MembersPage() {
  const { token } = useAuthContext();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/users/members`);
      url.searchParams.set("limit", "200");
      if (q.trim()) url.searchParams.set("q", q.trim());
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members || []);
        setTotal(data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    const h = setInterval(load, 10000);
    return () => clearInterval(h);
  }, [q]);

  const filtered = useMemo(() => members, [members]);

  const initials = (name?: string | null, phone?: string | null) => {
    const base = (name || phone || "U").trim();
    const parts = base.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Members <span className="text-neutral-400">({total})</span></h1>
          <div className="hidden sm:block" />
        </header>

        <div className="mb-4">
          <input
            placeholder="Хайх (нэр, утас)"
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-sky-500 sm:max-w-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") load(); }}
            disabled={!token}
          />
          {!token && (
            <p className="mt-1 text-xs text-neutral-500">Жагсаалтыг харахын тулд нэвтэрнэ үү.</p>
          )}
        </div>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {token
            ? (
                <>
                  {filtered.map((m) => (
                    <article key={m.id} className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                      {m.avatarUrl ? (
                        <Image src={m.avatarUrl} alt={m.name || m.phone || "avatar"} width={48} height={48} className="h-12 w-12 rounded-full object-cover" unoptimized />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold">
                          {initials(m.name, m.phone)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{m.name || m.phone || "Member"}</div>
                        {m.phone && <div className="truncate text-xs text-neutral-400">{m.phone}</div>}
                      </div>
                    </article>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <div className="col-span-full rounded-md border border-neutral-800 bg-neutral-950 p-4 text-center text-sm text-neutral-400">
                      Гишүүн олдсонгүй.
                    </div>
                  )}
                </>
              )
            : (
                // Skeletons for non-logged users
                Array.from({ length: 6 }).map((_, i) => (
                  <article key={i} className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-800" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 h-3 w-2/3 animate-pulse rounded bg-neutral-800" />
                      <div className="h-2 w-1/2 animate-pulse rounded bg-neutral-900" />
                    </div>
                  </article>
                ))
              )}
        </section>
      </div>
    </main>
  );
}
