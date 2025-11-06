import Link from "next/link";

const agents = [
  {
    title: "Бүтээгдэхүүн ялгагч",
    href: "/extract-product",
    description: "E‑commerce-д зориулж бүтээгдэхүүнийг цагаан дэвсгэр дээр тусгаарлана.",
  },
];

export default function AiAgentsPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-bold">AI Агентууд</h1>
        <p className="mt-2 text-neutral-300">Ажил үүргийг түргэсгэх практик хэрэгслүүд.</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-1 md:grid-cols-1">
          {agents.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-md border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
            >
              <div className="text-lg font-semibold">{a.title}</div>
              <p className="mt-1 text-sm text-neutral-300">{a.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
