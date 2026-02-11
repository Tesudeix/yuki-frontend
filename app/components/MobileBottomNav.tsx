"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/shop", label: "Products" },
  { href: "/auth", label: "Auth" },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname() || "";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#06080f]/95 px-3 py-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold transition ${
                active
                  ? "bg-cyan-300 text-[#031019]"
                  : "border border-white/10 text-slate-300 hover:bg-white/5"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
