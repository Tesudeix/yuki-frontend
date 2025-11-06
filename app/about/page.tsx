export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-bold">About TESUDEIX</h1>
        <p className="mt-2 text-neutral-300">
          We build simple, fast experiences around identity and creation. One phone. One password. AI agents
          to help you work smarter.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-lg font-semibold">Our Mission</h2>
            <p className="mt-2 text-sm text-neutral-300">
              Reduce friction. Empower creators. Make powerful tools accessible with a minimal, secure identity.
            </p>
          </div>
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-6">
            <h2 className="text-lg font-semibold">What’s inside</h2>
            <p className="mt-2 text-sm text-neutral-300">
              A focused feed, profile, and AI agents like background removal and code optimization — with more to come.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

