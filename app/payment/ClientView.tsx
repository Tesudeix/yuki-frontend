"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";

function BackgroundMotif() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#000000,40%,#0B0B12)] opacity-80" />
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        width={820}
        height={520}
        viewBox="0 0 820 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.04 }}
      >
        <g fill="#1400FF">
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
      <span className="absolute inline-block h-2 w-2 rounded-full bg-[#1400FF]/80" aria-hidden />
      <svg width="10" height="10" viewBox="0 0 10 10" className="relative" aria-hidden>
        <path d="M5 0L10 5L5 10L0 5Z" fill="#1400FF" />
      </svg>
    </span>
  );
}


export default function ClientView() {
  const router = useRouter();
  const { token, hydrated } = useAuthContext();
  const [mounted, setMounted] = useState(false);
  const usersRef = useRef<HTMLDivElement | null>(null);
  const qpayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/auth");
    }
  }, [hydrated, router, token]);

  // composer scroll removed; keep minimal

  if (!hydrated || !token) {
    return (
      <main className="page-shell text-white">
        <BackgroundMotif />
        <section className="mx-auto flex min-h-[60vh] max-w-[760px] flex-col items-center justify-center px-6 text-center">
          <div className="h-10 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-4 w-64 animate-pulse rounded bg-white/10" />
        </section>
      </main>
    );
  }

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
        <h1 className="text-[32px] font-bold tracking-tight text-white">Antaqor албан ёсны гишүүнчлэл</h1>
        <p className="mt-2 text-[16px] font-semibold text-neutral-200">25,000 / 1 сар</p>
        <div className="mx-auto mt-4 h-px w-24 bg-[#1400FF]" />
      </section>

      {/* Pricing Grid */}
      <section className="relative mx-auto max-w-[980px] px-6 pb-20">

        <div className="grid grid-cols-1 gap-8">
          {/* Membership Plan */}
          <article
            ref={usersRef}
            className={
              "group relative overflow-hidden rounded-2xl border bg-[#0B0B12] p-6 transition-all duration-300 " +
              "border-white/10 hover:scale-[1.02] hover:border-[#1400FF]/40 hover:shadow-[0_12px_34px_-20px_rgba(20,0,255,0.35)] " +
              (mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
            }
            aria-label="Antaqor Membership"
            style={{ transitionDelay: mounted ? "60ms" : undefined }}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-200">Antaqor албан ёсны гишүүнчлэл</span>
              </div>
            </div>

            <div className="mt-3 text-2xl font-semibold text-white">
              25,000 <span className="text-base font-semibold text-neutral-400">/ 1 сар</span>
            </div>
            <ul className="mt-3 space-y-2 text-[15px] text-neutral-200">
              <li className="flex items-center gap-2"><Mark /> Дижитал гишүүнчлэлийн карт</li>
              <li className="flex items-center gap-2"><Mark /> Гишүүдэд зориулсан онцгой пост, контентод нэвтрэх эрх</li>
              <li className="flex items-center gap-2"><Mark /> Зөвхөн гишүүдэд зориулсан community орчинд оролцох боломж</li>
              <li className="flex items-center gap-2"><Mark /> Албан ёсны онцгой мерчандайз худалдан авах боломж</li>
              <li className="flex items-center gap-2"><Mark /> Нийтийн нэвтрүүлэг болон онлайн / оффлайн эвентүүдийн сугалаанд оролцох эрх (зохион байгуулагчийн зөвшөөрлөөс хамаарна)</li>
              <li className="flex items-center gap-2"><Mark /> Концертын тасалбарын урьдчилсан борлуулалтад давуу эрхтэйгээр хамрагдах боломж (зохион байгуулагчийн зөвшөөрлөөс хамаарна)</li>
            </ul>
            <p className="mt-4 text-sm text-neutral-300">
              Та төлбөрөө төлсөрнөөр 2,500 credit авна энүүгээрээ та өөрөө сарын эрхээ худалдаж идэвжүүлнэ.
            </p>

            <button
              type="button"
              onClick={() => qpayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="mt-6 w-full rounded-lg bg-[#1400FF] py-2.5 text-center text-sm font-semibold text-white shadow-[0_6px_16px_rgba(20,0,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(20,0,255,0.45)]"
            >
              Нэгдэх
            </button>

            <div ref={qpayRef} className="mt-6 rounded-xl border border-white/10 bg-black/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">QPay</div>
                </div>
                <span className="rounded-full bg-[#1400FF]/20 px-2 py-1 text-xs text-[#c6c3ff]">25,000₮ / 1 сар</span>
              </div>
              <div className="mt-4 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/image/qr.jpg" alt="QPay QR" className="h-48 w-48 rounded-lg object-contain" />
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Sticky CTA removed to avoid duplicate CTAs on payment page */}
    </main>
  );
}
