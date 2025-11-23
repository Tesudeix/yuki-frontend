"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { MdiCog } from "@/app/components/icons";

type NavLink = { href: string; label: string };

const coreNav: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Community" },
  { href: "/classroom", label: "Classroom" },
];

const extraNav: NavLink[] = [
  { href: "/members", label: "Members" },
];

const initialsFromName = (value: string): string => {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function SiteHeader() {
  const { user, token, hydrated, logout } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const isPayment = (pathname || "").startsWith("/payment");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const activeStartsWith = useMemo(
    () => (href: string) => (pathname || "").startsWith(href),
    [pathname],
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuOpen) return;
      const target = e.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  useEffect(() => {
    // Close mobile overlay on route change
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/auth");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0C0C0C] shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
      {/* Main bar */}
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        {/* Left: Mobile burger + Logo (mobile), Logo (desktop) */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Burger only on mobile */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 hover:bg-neutral-800 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Цэс нээх"
            aria-expanded={mobileOpen}
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          {/* Logo (centered on mobile via flex grow) */}
          <div className="flex flex-1 justify-center md:flex-initial md:justify-start">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-white">
              <span>TESUDEIX</span>
            </Link>
          </div>
        </div>

        {/* Center: Desktop navigation */}
        {!isPayment && (
          <nav className="hidden items-center gap-1 md:flex">
            {coreNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "rounded-md px-3 py-2 text-[18px] transition-colors hover:text-white " +
                  (activeStartsWith(link.href) ? "text-white" : "text-[#BDBDBD]")
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right: Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {!hydrated ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-neutral-800" />
          ) : token ? (
            <div className="flex items-center gap-2" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-2 py-1 hover:bg-neutral-800"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl as string}
                    alt="Avatar"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white">
                    {initialsFromName(user?.name || user?.phone || "U")}
                  </div>
                )}
                <ChevronDownIcon className="h-4 w-4 text-neutral-500" />
              </button>

              {/* Settings icon (threads-style) */}
              <Link
                href="/profile"
                className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                aria-label="Тохиргоо"
              >
                <MdiCog className="h-5 w-5" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Гарах
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 py-1 shadow-lg"
                >
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Профайл
                  </Link>
                  <button
                    className="block w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-neutral-800"
                    onClick={handleLogout}
                  >
                    Гарах
                  </button>
                </div>
              )}
            </div>
          ) : isPayment ? (
            // Payment page: reduce choices, only Login on desktop
            <Link
              href="/auth"
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:bg-neutral-800"
            >
              Нэвтрэх
            </Link>
          ) : (
            <>
              <Link
                href="/payment"
                className="rounded-md bg-[#e93b68] px-3 py-1.5 text-sm font-semibold text-white shadow-[0_6px_20px_-8px_rgba(233,59,104,0.6)] transition-opacity hover:opacity-90"
              >
                JOIN CLAN
              </Link>
              <Link
                href="/auth"
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:bg-neutral-800"
              >
                Нэвтрэх
              </Link>
            </>
          )}
        </div>

        {/* Right: Mobile small action */}
        {!token && (
          <div className="flex items-center md:hidden">
            <Link href="/payment" className="text-sm font-semibold text-white hover:opacity-90">
              JOIN
            </Link>
          </div>
        )}
      </div>

      {/* Pink accent line */}
      <div className="h-px w-full bg-[#E93B68]/50" />

      {/* Mobile full-screen overlay menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-[#000000E6] backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          {/* Soft gradient overlay for depth */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2),#0D0D0D)]" />
          <div className="relative flex h-full flex-col px-6 pt-6" style={{ paddingBottom: "36px" }}>
            {/* Top bar inside overlay */}
            <div className="flex items-center justify-between">
              <Link href="/" className="text-base font-semibold text-white" onClick={() => setMobileOpen(false)}>
                TESUDEIX
              </Link>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 hover:bg-neutral-800"
                onClick={() => setMobileOpen(false)}
                aria-label="Цэс хаах"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Links */}
            <nav className="mt-8 flex flex-1 flex-col gap-6">
              {[...coreNav, ...extraNav].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[20px] font-semibold text-white transition-colors hover:text-[#e93b68]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="relative mt-6 grid grid-cols-1 gap-3" style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}>
              {!hydrated ? (
                <div className="h-10 w-full animate-pulse rounded-md bg-neutral-800" />
              ) : token ? (
                <>
                  <Link
                    href="/profile"
                    className="rounded-md border border-neutral-700 px-4 py-2.5 text-center text-sm font-semibold text-neutral-100 hover:bg-neutral-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    Профайл руу очих
                  </Link>
                  <button
                    type="button"
                    className="rounded-md border border-neutral-700 px-4 py-2.5 text-center text-sm font-medium text-neutral-200 hover:bg-neutral-800"
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                  >
                    Гарах
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/payment"
                    className="rounded-md bg-[#e93b68] px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
                    onClick={() => setMobileOpen(false)}
                  >
                    JOIN CLAN
                  </Link>
                  <Link
                    href="/auth"
                    className="rounded-md border border-neutral-700 px-4 py-2.5 text-center text-sm font-medium text-neutral-200 hover:bg-neutral-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    Нэвтрэх
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Removed unused LogoIcon to satisfy ESLint

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 15a1 1 0 0 1-.707-.293l-5-5a1 1 0 0 1 1.414-1.414L12 12.586l4.293-4.293a1 1 0 0 1 1.414 1.414l-5 5A1 1 0 0 1 12 15z" />
    </svg>
  );
}

function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15a1.5 1.5 0 0 1 0 3h-15A1.5 1.5 0 0 1 3 7.5Zm0 9A1.5 1.5 0 0 1 4.5 15h15a1.5 1.5 0 0 1 0 3h-15A1.5 1.5 0 0 1 3 16.5Z" />
    </svg>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 1 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 0 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z" />
    </svg>
  );
}
