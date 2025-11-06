import HeroSlider from "./components/HeroSlider";
import React from "react";
import Link from "next/link";
import FeedPostCard, { type Post } from "@/app/components/FeedPostCard";
import { BASE_URL } from "@/lib/config";

async function getPosts(): Promise<Post[]> {
  try {
    const url = new URL(`${BASE_URL}/api/posts`);
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", "6");
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <HeroSlider />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Latest Blogs</h2>
            <p className="text-sm text-neutral-400">Fresh updates and stories</p>
          </div>
          <Link href="/feed" className="text-sm text-sky-400 hover:underline">
            View all
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {posts.length === 0 ? (
            <div className="rounded-md border border-neutral-800 bg-neutral-950 p-6 text-sm text-neutral-400">
              No posts yet. Check back soon.
            </div>
          ) : (
            posts.map((p) => (
              <FeedPostCard key={p._id} post={p} onDelete={() => {}} onShareAdd={() => {}} />
            ))
          )}
        </section>

        <section className="mt-12 rounded-md border border-neutral-800 bg-neutral-950 p-6">
          <h3 className="mb-2 text-lg font-semibold">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/categories/ai-agents" className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-800">
              AI Agents
            </Link>
            <Link href="/feed" className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-800">
              Blogs
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
