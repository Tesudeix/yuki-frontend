"use client";
import React, { useEffect, useRef, useState } from "react";

function BackgroundMotif() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#171717,40%,#0d0d0d)] opacity-70" />
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        width={820}
        height={520}
        viewBox="0 0 820 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.04 }}
      >
        <g fill="#e93b68">
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
      <span className="absolute inline-block h-2 w-2 rounded-full bg-pink-500/80" aria-hidden />
      <svg width="10" height="10" viewBox="0 0 10 10" className="relative" aria-hidden>
        <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" className="text-pink-300" />
      </svg>
    </span>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2l7 3v6c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V5l7-3zm-1 12l-3-3 1.4-1.4L11 11.2l3.6-3.6L16 9l-5 5z" />
    </svg>
  );
}

function CardMotif() {
  return (
    <svg
      className="absolute right-[-40px] top-[-20px]"
      width={220}
      height={160}
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.05 }}
    >
      <g fill="#e93b68">
        <path d="M110 10l40 25-15 35-40-12-25-22z" />
        <path d="M70 70l40 12 44 4-15 30-48-4-26-20z" />
      </g>
    </svg>
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

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const goUsers = () => usersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

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
          <span style={{ opacity: 0.6 }}>Focus. Clear. Premium.</span>
        </p>
        <div className="mx-auto mt-4 h-px w-24 bg-[#e93b68]" />
      </section>

      {/* Pricing Grid */}
      <section className="relative mx-auto max-w-[980px] px-6 pb-20">

        <div className="grid grid-cols-1 gap-8">
          {/* Users Plan */}
          <article
            ref={usersRef}
            className={
              "group relative overflow-hidden rounded-2xl border bg-[#171717] p-6 transition-all duration-300 " +
              "border-[#2a2a2a] hover:scale-[1.02] hover:border-pink-500/30 hover:shadow-[0_10px_30px_-20px_rgba(233,59,104,0.35)] " +
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
              <li className="flex items-center gap-2"><Mark /> Agent ашиглах — workflow автоматжуулалт</li>
              <li className="flex items-center gap-2"><Mark /> Сүүлийн AI мэдээ — долоо хоног бүр</li>
            </ul>

            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-[#e93b68] py-2.5 text-center text-sm font-semibold text-white shadow-[0_4px_12px_rgba(233,59,104,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(233,59,104,0.35)]"
            >
              Clan-д нэгдэх — ₮25,000
            </button>

            {/* Trust block inside card */}
            <div className="mt-6 text-[12px] font-semibold uppercase tracking-wide text-neutral-400">Итгэлтэй нэвтрэх эрх</div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-[13px] text-neutral-300 sm:grid-cols-3">
              <div className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-pink-400" /> Төлбөр баталгаатай</div>
              <div className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-pink-400" /> Даруй идэвхжинэ</div>
              <div className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-pink-400" /> Cancel anytime</div>
            </div>
          </article>
        </div>

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
