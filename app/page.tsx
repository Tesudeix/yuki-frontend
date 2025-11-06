import HeroSlider from "./components/HeroSlider";
import React from "react";
import Link from "next/link";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <HeroSlider />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-md border border-neutral-800 bg-neutral-950 p-6">
          <h2 className="text-xl font-semibold mb-3">AI Entrepreneur</h2>
          <p className="text-neutral-200 leading-relaxed">
            AI салбар асар хурдтай хөгжиж байна. Энэ салбарт хоцрохгүй өсөж дэвшихийн тулд бид өдөр бүр тасралтгүй хамт суралцаж,
            хурдтай evolve хийх хэрэгтэй. Бидний эрхэм зорилго: Дэлхийн зах зээлд дижитал капитал бүтээж эрх чөлөөтэй нүүдэлчин
            lifestyle амьдрах.
          </p>
        </section>

        {/* Agents CTA removed per request */}
      </main>
    </div>
  );
}
