"use client";
import React from "react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/auth-context";

export default function LeftSidebar() {
  const { user } = useAuthContext();

  return (
    <aside id="left-sidebar" className="hidden md:block sticky top-4 self-start">
      <div className="grid gap-3">
        <div className="bg-[#111111] rounded-xl p-4">
          <div className="text-sm text-neutral-400">Signed in as</div>
          <div className="text-base font-semibold text-white">{user?.name || user?.phone || "User"}</div>
        </div>
        <nav className="bg-[#111111] rounded-xl p-2">
          <ul className="grid">
            <li>
              <Link href="/feed" className="block px-3 py-2 rounded-md text-sm hover:bg-neutral-800">Home</Link>
            </li>
            <li>
              <Link href="/profile" className="block px-3 py-2 rounded-md text-sm hover:bg-neutral-800">Profile</Link>
            </li>
            {/* Admin link intentionally hidden in social-only mode */}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
