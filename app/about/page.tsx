export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-bold">TESUDEIX тухай</h1>
        <p className="mt-2 text-neutral-300">
          Бид ялгаралгүй, хурдсан, энгийн туршлагыг бүтээдэг. Нэг утас. Нэг нууц үг. Илүү ухаалаг ажиллахад тань туслах AI агентууд.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-lg font-semibold">Эрхэм зорилго</h2>
            <p className="mt-2 text-sm text-neutral-300">
              Саад багасгаж, бүтээлчдийг дэмжинэ. Аюулгүй, минимал танигдалтаар хүчирхэг хэрэгслүүдийг хүртээмжтэй болгоно.
            </p>
          </div>
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-lg font-semibold">Юу багтсан бэ</h2>
            <p className="mt-2 text-sm text-neutral-300">
              Анхаарал төвлөрсөн фийд, профайл, мөн арын дэвсгэр арилгах, код оновчлох зэрэг AI агентууд — цаашид нэмэгдэнэ.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
