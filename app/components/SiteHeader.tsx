"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuthContext } from "@/contexts/auth-context";

const navItems = [
  { href: "/shop", label: "Products" },
  { href: "/auth", label: "Admin Auth" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { adminToken, adminProfile, clearAdmin, logout } = useAuthContext();

  const isActive = (href: string) => pathname.startsWith(href);

  const signOut = () => {
    // Clear both admin and user sessions to keep dashboard auth predictable.
    clearAdmin();
    logout();
    router.push("/auth");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06080f]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-xs font-black text-[#021019]">
            YK
          </span>
          <span className="text-sm font-semibold tracking-[0.18em] uppercase">Yuki Admin</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-cyan-300 text-[#031019]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {adminToken ? (
            <>
              <div className="hidden rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-right md:block">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Signed as admin</p>
                <p className="text-xs text-slate-100">{adminProfile?.phone || "Admin"}</p>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/20"
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
