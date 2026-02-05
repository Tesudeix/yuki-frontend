export default function StoryPage() {
  return (
    <main className="page-shell text-white">
      <div className="mx-auto max-w-4xl px-6 py-12 animate-rise">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Story</div>
          <h1 className="mt-2 text-3xl font-semibold">Raw Sample Content</h1>
          <p className="mt-2 text-sm text-neutral-400">Энд түр raw sample контент байрлана.</p>
        </header>

        <section className="space-y-4 text-[15px] leading-7 text-neutral-200">
          <p>
            Story #1 — Өнөөдрийн onboarding урсгал: бүртгэл, профайл зураг, дараагийн алхамд төлбөр.
          </p>
          <p>
            Story #2 — Community highlight: хамгийн идэвхтэй гишүүдийн бичлэг, шинэ постууд.
          </p>
          <p>
            Story #3 — Product update: шинэ боломж, сайжруулалт, upcoming.
          </p>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4">
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Sample Block</div>
            <p className="mt-2 text-sm text-neutral-300">
              Энэ хэсэг нь raw sample блок. Дараа нь бодит сторигийн агуулгаар солих боломжтой.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
