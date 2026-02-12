"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuthContext } from "@/contexts/auth-context";

const navItems = [
  { href: "/shop", label: "Products" },
  { href: "/auth", label: "Admin Login" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { adminToken, adminProfile, clearAdmin, logout } = useAuthContext();

  const isActive = (href: string) => pathname.startsWith(href);

  const signOut = () => {
    clearAdmin();
    logout();
    router.push("/auth");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/15 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/shop" className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
          Yuki Admin
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-[4px] border px-3 py-1.5 text-xs font-medium ${
                isActive(item.href)
                  ? "border-black bg-black text-white"
                  : "border-black/20 bg-white text-black hover:border-black"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {adminToken ? (
            <>
              <span className="hidden text-xs text-black/70 md:block">{adminProfile?.phone || "Admin"}</span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-[4px] border border-black/20 bg-white px-3 py-1.5 text-xs text-black hover:border-black"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="rounded-[4px] border border-black bg-black px-3 py-1.5 text-xs text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
