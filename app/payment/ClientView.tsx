"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/config";
import { useAuthContext } from "@/contexts/auth-context";

function BackgroundMotif() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0A0A0A,40%,#181818)] opacity-70" />
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        width={820}
        height={520}
        viewBox="0 0 820 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.04 }}
      >
        <g fill="#0D81CA">
          <path d="M410 40l90 60-40 90-80-30-60-50z" />
          <path d="M300 170l110 40 120 10-40 90-130-10-70-60z" />
          <path d="M510 120l120 60-60 60-80-30z" />
          <path d="M240 240l60 80 120 40-80 40-100-60z" />
          <path d="M540 260l90 40-40 80-120-30z" />
        </g>
      </svg>
    </div>
  );
}

function Mark() {
  return (
    <span className="relative inline-flex h-3 w-3 items-center justify-center">
      <span className="absolute inline-block h-2 w-2 rounded-full bg-[#0D81CA]/80" aria-hidden />
      <svg width="10" height="10" viewBox="0 0 10 10" className="relative" aria-hidden>
        <path d="M5 0L10 5L5 10L0 5Z" fill="#0D81CA" />
      </svg>
    </span>
  );
}


function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.4-1.4z" />
    </svg>
  );
}

export default function ClientView() {
  const [mounted, setMounted] = useState(false);
  const usersRef = useRef<HTMLDivElement | null>(null);
  const [members, setMembers] = useState<Array<{ id: string; name?: string | null; username?: string | null; phone?: string | null; avatarUrl?: string | null }>>([]);
  const [total, setTotal] = useState<number>(0);
  const { user, token, fetchProfile } = useAuthContext();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bankKey, setBankKey] = useState<"khan" | "golomt">("khan");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(`${BASE_URL}/users/members`);
        url.searchParams.set("limit", "50");
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await res.json();
        if (res.ok) {
          setMembers((data.members || []) as Array<{ id: string; name?: string | null; phone?: string | null; avatarUrl?: string | null }>);
          setTotal(Number(data.total || 0));
        }
      } catch {
        // ignore; keep minimal
      }
    };
    void run();
  }, []);

  // composer scroll removed; keep minimal

  return (
    <main className="relative">
      <BackgroundMotif />

      {/* Title Section */}
      <section
        className={
          "mx-auto max-w-[980px] px-6 pt-16 pb-8 text-center transition-all duration-500 " +
          (mounted ? "opacity-100 scale-100" : "opacity-0 scale-[.995]")
        }
      >
        <h1 className="text-[32px] font-bold tracking-tight text-white">Төлбөрийн багц</h1>
        <p className="mt-2 text-[14px] font-medium text-[#9d9d9d]">
          Багцаа сонгоод Clan-д нэвтрэх эрхээ шууд идэвхжүүл.
          {" "}
          <span style={{ opacity: 0.6 }}>Төвлөр. Тод. Премиум.</span>
        </p>
        <div className="mx-auto mt-4 h-px w-24 bg-[#0D81CA]" />
      </section>

      {/* Account info */}
      <section className="mx-auto max-w-[980px] px-6 pb-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-400">Миний бүртгэл</div>
              <div className="text-base font-semibold text-white">{user?.name || user?.username || user?.phone || "Зочин"}</div>
              <div className="text-xs text-neutral-400">Төлөв: {user?.classroomAccess ? "Идэвхтэй гишүүн" : "Идэвхгүй"}</div>
            </div>
            <div className="flex gap-2">
              {!token ? (
                <button onClick={() => router.push("/auth")} className="rounded-md bg-[#0D81CA] px-3 py-2 text-sm font-semibold text-white">Нэвтрэх</button>
              ) : (
                <button onClick={() => void fetchProfile()} className="rounded-md border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900">Шинэчлэх</button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="relative mx-auto max-w-[980px] px-6 pb-20">

        <div className="grid grid-cols-1 gap-8">
          {/* Users Plan */}
          <article
            ref={usersRef}
            className={
              "group relative overflow-hidden rounded-2xl border bg-[#171717] p-6 transition-all duration-300 " +
              "border-[#2a2a2a] hover:scale-[1.02] hover:border-[#0D81CA]/30 hover:shadow-[0_10px_30px_-20px_rgba(13,129,202,0.35)] " +
              (mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
            }
            aria-label="Users Plan"
            style={{ transitionDelay: mounted ? "60ms" : undefined }}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-200">Users багц</span>
              </div>
            </div>

            <div className="mt-3 text-2xl font-semibold text-white">
              ₮25,000 <span className="text-base font-semibold text-neutral-400">/ сар</span>
            </div>
            <div className="mt-5 text-[12px] font-semibold uppercase tracking-wide text-neutral-400">Яг одоо авах боломжууд</div>
            <ul className="mt-3 space-y-2 text-[15px] text-neutral-200">
              <li className="flex items-center gap-2"><Mark /> AI Community — 24/7 тусламж</li>
              <li className="flex items-center gap-2"><Mark /> Хичээлүүд — алхам алхмаар</li>
              <li className="flex items-center gap-2"><Mark /> Цаг хэмнэх AI tools — workflow автоматжуулалт</li>
              <li className="flex items-center gap-2"><Mark /> Сүүлийн AI мэдээ — долоо хоног бүр</li>
            </ul>

            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-[#0D81CA] py-2.5 text-center text-sm font-semibold text-white shadow-[0_4px_12px_rgba(13,129,202,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(13,129,202,0.35)]"
              onClick={() => { if (!token) router.push("/auth"); else setOpen(true); }}
            >
              Дижитал байлдан дагуулагч бол — ₮25,000
            </button>

            {/* Trust block inside card */}
              <div className="mt-6 text-[12px] font-semibold uppercase tracking-wide text-neutral-400">Итгэлтэй нэвтрэх эрх</div>
              <div className="mt-2 grid grid-cols-1 gap-2 text-[13px] text-neutral-300 sm:grid-cols-3">
                <div className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-[#0D81CA]" /> Төлбөр баталгаатай</div>
                <div className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-[#0D81CA]" /> Даруй идэвхжинэ</div>
                <div className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-[#0D81CA]" /> Хэзээ ч цуцлах боломжтой</div>
              </div>
          </article>
        </div>

        {/* Payment overlay */}
        {open && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-white">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Төлбөр — Clan</h2>
                <button onClick={() => setOpen(false)} className="rounded-md border border-neutral-700 px-2 py-1 text-sm text-neutral-300 hover:bg-neutral-900">Хаах</button>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-300">Банк:</span>
                  <div className="inline-flex rounded-md border border-neutral-800 p-0.5">
                    <button type="button" className={`rounded-sm px-2 py-1 ${bankKey === "khan" ? "bg-[#1080CA] text-white" : "text-neutral-300"}`} onClick={() => setBankKey("khan")}>Хаан</button>
                    <button type="button" className={`rounded-sm px-2 py-1 ${bankKey === "golomt" ? "bg-[#1080CA] text-white" : "text-neutral-300"}`} onClick={() => setBankKey("golomt")}>Голомт</button>
                  </div>
                </div>
                <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">
                  <div className="text-neutral-300">Данс</div>
                  <div className="truncate font-medium text-white">{bankKey === "khan" ? "Хаан банк — MN720005005926153085" : "Голомт банк — MN150015003005127815"}</div>
                  <div className="text-xs text-neutral-400">Эзэмшигч: Baynbileg Dambadarjaa</div>
                </div>
                <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">
                  <div className="text-neutral-300">Гүйлгээний утга</div>
                  <div className="truncate font-medium text-white">{user?.username || user?.name || user?.phone || "Username/нэр"}</div>
                  <div className="text-xs text-neutral-400">Та заавал утас эсвэл нэрээ бичээрэй.</div>
                </div>
                <button onClick={() => alert("Төлбөр шалгагдсаны дараа гишүүнчлэл идэвхжинэ. Хэрэв 10 минутын дотор идэвхжихгүй бол 94641031 дугаарруу холбогдоно уу.")} className="mt-2 rounded-md bg-[#1080CA] px-4 py-2 text-sm font-semibold text-white">Төлбөр төлсөн</button>
              </div>
            </div>
          </div>
        )}

        {/* Current active members */}
        <section className="mx-auto mt-10 max-w-[980px] px-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-300">Идэвхтэй гишүүд <span className="text-neutral-500">({total})</span></h2>
            <a href="/members" className="text-xs text-neutral-400 hover:text-white">бүгдийг харах →</a>
          </div>
          <div className="flex snap-x overflow-x-auto gap-3">
            {members.map((m) => (
              <div key={m.id} className="w-28 shrink-0 snap-start rounded-md border border-neutral-800 bg-neutral-950 p-3 text-center">
                {m.avatarUrl ? (
                  <Image src={m.avatarUrl} alt={m.name || m.username || m.phone || "avatar"} width={48} height={48} className="mx-auto h-12 w-12 rounded-full object-cover" unoptimized />
                ) : (
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold">
                    {(m.name || m.username || m.phone || "U").toString().slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="mt-2 truncate text-xs text-neutral-300">{m.name || m.username || m.phone || "Member"}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer info */}
        <div className="mt-12 border-t border-white/5 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
            <a href="/support" className="hover:text-neutral-200">Тусламж</a>
            <a href="/policy" className="hover:text-neutral-200">Бодлого</a>
            <a href="/refund" className="hover:text-neutral-200">Буцаан олголт</a>
          </div>
        </div>
      </section>

      {/* Sticky CTA removed to avoid duplicate CTAs on payment page */}
    </main>
  );
}
