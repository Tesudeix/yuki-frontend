"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/contexts/auth-context";

export default function LeftSidebar() {
  const { user } = useAuthContext();

  return (
    <aside id="left-sidebar" className="hidden md:block sticky top-4 self-start">
      <div className="grid gap-3">
        <div className="rounded-xl border border-white/5 bg-[#0B0B12] p-4 flex items-center gap-3">
          {user?.avatarUrl ? (
            <Image src={user.avatarUrl as string} alt="Avatar" width={40} height={40} className="h-10 w-10 rounded-full object-cover" unoptimized />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#1400FF] via-[#3522FF] to-[#050508] text-sm font-bold">
              {(user?.name || user?.phone || "U").toString().slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-sm text-neutral-400">Signed in as</div>
            <div className="text-base font-semibold text-white">{user?.name || user?.phone || "User"}</div>
          </div>
        </div>
        <nav className="rounded-xl border border-white/5 bg-[#0B0B12] p-2">
          <ul className="grid">
            <li>
              <Link href="/" className="block px-3 py-2 rounded-md text-sm hover:bg-white/5">Home</Link>
            </li>
            <li>
              <Link href="/profile" className="block px-3 py-2 rounded-md text-sm hover:bg-white/5">Profile</Link>
            </li>
            {/* Admin link intentionally hidden in social-only mode */}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
