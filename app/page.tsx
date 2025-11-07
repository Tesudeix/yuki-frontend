"use client";

import HeroSlider from "./components/HeroSlider";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL } from "@/lib/config";
import { Skeleton } from "@/app/components/Skeleton";
import ShippedMarquee from "@/app/components/ShippedMarquee";

export default function HomePage() {
  const { token, hydrated } = useAuthContext();
  const router = useRouter();
  const [membersTotal, setMembersTotal] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (token) router.replace("/feed");
  }, [hydrated, token, router]);

  useEffect(() => {
    let cancelled = false;
    const loadCount = async () => {
      try {
        const res = await fetch(`${BASE_URL}/users/members?limit=1`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setMembersTotal(typeof data?.total === "number" ? data.total : 0);
          setLoadingCount(false);
        }
      } catch {
        if (!cancelled) setLoadingCount(false);
      }
    };
    loadCount();
    const h = setInterval(loadCount, 10000);
    return () => { cancelled = true; clearInterval(h); };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-neutral-100">
      {/* Subtle gradient background overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(16,128,202,0.18),transparent)]" />
      <HeroSlider />

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Headline + CTA (no borders, modern spacing) */}
        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold leading-tight">Бүтээ. Сур. Хамтдаа өсөе.</h2>
            <p className="max-w-prose text-sm text-neutral-300">
              Туршлагатай бүтээгчдийн клантай хамт илүү хурдтай өсөе. Classroom, агентууд, marketplace — хуримтлагдсан өсөлтийн боломжуудыг нээ.
            </p>
            <div className="flex items-center gap-2">
              <a href="/payment" className="rounded-md bg-[#1080CA] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">КЛАНД НЭГДЭХ</a>
              <a href="/shop" className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800">Маркетплейс</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:items-start">
            <div className="rounded-lg bg-neutral-950/80 p-5">
              <div className="text-xs text-neutral-400">Гишүүд</div>
              <div className="mt-1 text-3xl font-extrabold tracking-tight">
                {loadingCount ? <Skeleton className="h-8 w-20" /> : membersTotal ?? 0}
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">10 сек тутам шинэчлэгдэнэ</p>
            </div>
            <div className="rounded-lg bg-neutral-950/80 p-5">
              <div className="text-xs text-neutral-400">Нийгэмлэг</div>
              <div className="mt-1 text-sm text-neutral-200">Хамтдаа өсөх хурдасгуур.</div>
            </div>
          </div>
        </section>

        {/* Shipped this week marquee */}
        <div className="mt-8">
          <div className="mb-2 text-xs uppercase tracking-widest text-neutral-500">Энэ долоо хоногийн өсөлт</div>
          <ShippedMarquee />
        </div>
      </main>
    </div>
  );
}
