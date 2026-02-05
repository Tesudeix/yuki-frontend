"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";

type NavLink = { href: string; label: string };

const coreNav: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/community", label: "Community" },
  { href: "/story", label: "Story" },
  { href: "/classroom", label: "Contents" },
];

const extraNav: NavLink[] = [
  { href: "/members", label: "Members" },
  { href: "/profile", label: "Тохиргоо" },
];

const initialsFromName = (value: string): string => {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const CreditsPill = ({ value }: { value: number }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-[#1400FF]/35 bg-[#1400FF]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c6c3ff]">
    <span className="h-1.5 w-1.5 rounded-full bg-[#1400FF]" aria-hidden />
    Credit {value.toLocaleString("en-US")}
  </div>
);

export default function SiteHeader() {
  const { user, token, hydrated, logout } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const isPayment = (pathname || "").startsWith("/payment");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const credits = typeof user?.credits === "number" ? user.credits : 0;

  const activeStartsWith = useMemo(
    () => (href: string) => (href === "/" ? pathname === "/" : (pathname || "").startsWith(href)),
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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
      {/* Main bar */}
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        {/* Left: Mobile burger + Logo (mobile), Logo (desktop) */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Burger only on mobile */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 hover:bg-white/5 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Цэс нээх"
            aria-expanded={mobileOpen}
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          {/* Logo (centered on mobile via flex grow) */}
          <div className="flex flex-1 justify-center md:flex-initial md:justify-start">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-white">
              <span>Antaqor</span>
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
                  "rounded-md px-3 py-2 text-[18px] transition-colors hover:text-[#1400FF] " +
                  (activeStartsWith(link.href) ? "text-white" : "text-neutral-400")
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right: Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <CreditsPill value={credits} />
          {!hydrated ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-neutral-800" />
          ) : token ? (
            <div className="flex items-center gap-2" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-2 py-1 hover:bg-white/5"
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
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#1400FF] via-[#3522FF] to-[#050508] text-xs font-bold text-white">
                    {initialsFromName(user?.name || user?.phone || "U")}
                  </div>
                )}
                <ChevronDownIcon className="h-4 w-4 text-neutral-500" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-neutral-200 hover:bg-white/5"
              >
                Гарах
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-white/10 bg-[#0b0b12] py-1 shadow-lg"
                >
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-sm text-neutral-200 hover:bg-white/5"
                    onClick={() => setMenuOpen(false)}
                  >
                    Профайл
                  </Link>
                  <button
                    className="block w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                    onClick={handleLogout}
                  >
                    Гарах
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1400FF]/40 bg-[#1400FF]/10 text-[#b4b0ff] shadow-[0_10px_24px_-16px_rgba(20,0,255,0.7)] transition hover:text-white hover:shadow-[0_12px_28px_-16px_rgba(20,0,255,0.9)]"
                aria-label="Бүртгүүлэх"
                title="Бүртгүүлэх"
              >
                <RegisterIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/auth"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-neutral-300 transition hover:text-white"
                aria-label="Нэвтрэх"
                title="Нэвтрэх"
              >
                <LoginIcon className="h-5 w-5" />
              </Link>
            </>
          )}
        </div>

        {/* Right: Mobile small action */}
        <div className="flex items-center gap-2 md:hidden">
          <CreditsPill value={credits} />
          {!token && (
            <Link href="/auth" className="text-sm font-semibold text-white hover:opacity-90">
              НЭГДЭХ
            </Link>
          )}
        </div>
      </div>

      {/* Accent line */}
      <div className="h-px w-full bg-[linear-gradient(90deg,rgba(20,0,255,0),rgba(20,0,255,0.75),rgba(20,0,255,0))]" />

      {/* Story link moved into main nav */}

      {/* Mobile full-screen overlay menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
        >
          {/* Soft gradient overlay for depth */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,0,255,0.12),rgba(0,0,0,0.6))]" />
          <div className="relative flex h-full flex-col px-6 pt-6" style={{ paddingBottom: "36px" }}>
            {/* Top bar inside overlay */}
            <div className="flex items-center justify-between">
              <Link href="/" className="text-base font-semibold text-white" onClick={() => setMobileOpen(false)}>
                Antaqor
              </Link>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 hover:bg-white/5"
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
                  className="text-[20px] font-semibold text-white transition-colors hover:text-[#1400FF]"
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
                    className="rounded-md border border-white/10 px-4 py-2.5 text-center text-sm font-semibold text-neutral-100 hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    Профайл руу очих
                  </Link>
                  <button
                    type="button"
                    className="rounded-md border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-neutral-200 hover:bg-white/5"
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                  >
                    Гарах
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="rounded-md bg-[#1400FF] px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
                    onClick={() => setMobileOpen(false)}
                  >
                    КЛАНД НЭГДЭХ
                  </Link>
                  <Link
                    href="/auth"
                    className="rounded-md border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-neutral-200 hover:bg-white/5"
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

function RegisterIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3" />
      <path d="M19 8v6" />
      <path d="M16 11h6" />
    </svg>
  );
}

function LoginIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}
