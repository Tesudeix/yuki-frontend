"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/shop", label: "Products" },
  { href: "/auth", label: "Login" },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname() || "";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/15 bg-white md:hidden">
      <div className="mx-auto flex max-w-6xl gap-2 px-3 py-2">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 rounded-[4px] border px-3 py-2 text-center text-xs font-medium ${
                active
                  ? "border-black bg-black text-white"
                  : "border-black/20 bg-white text-black"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
