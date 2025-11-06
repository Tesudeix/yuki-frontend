"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    title: "Create with AI Agents",
    subtitle: "Extract products, optimize code — faster.",
    cta: { href: "/categories/ai-agents", label: "Explore Agents" },
    bg: "linear-gradient(135deg, #0f172a 0%, #0b1220 100%)",
  },
  {
    title: "Stories & Updates",
    subtitle: "Read the latest from our blog.",
    cta: { href: "/feed", label: "Read Blog" },
    bg: "linear-gradient(135deg, #0b1220 0%, #0a0f1a 100%)",
  },
  {
    title: "Built for Makers",
    subtitle: "One phone. One password.",
    cta: { href: "/auth", label: "Get Started" },
    bg: "linear-gradient(135deg, #0a0f1a 0%, #0f172a 100%)",
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const current = slides[index];

  return (
    <section className="w-full border-b border-neutral-900 bg-black">
      <div
        className="mx-auto max-w-6xl overflow-hidden px-4 py-10 md:py-14"
        style={{ background: current.bg, borderRadius: 12 }}
      >
        <div className="flex flex-col items-start gap-3">
          <div className="text-xs uppercase tracking-widest text-sky-400">Featured</div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">{current.title}</h1>
          <p className="text-sm text-neutral-300">{current.subtitle}</p>
          <div className="mt-2">
            <Link
              href={current.cta.href}
              className="rounded-md bg-[#1080CA] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(16,128,202,0.8)] hover:opacity-95"
            >
              {current.cta.label}
            </Link>
          </div>
        </div>

        <div className="mt-6 flex gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-6 rounded-full ${i === index ? "bg-sky-400" : "bg-neutral-700 hover:bg-neutral-600"}`}
            />)
          )}
        </div>
      </div>
    </section>
  );
}

