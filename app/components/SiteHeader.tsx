"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";

type NavLink = { href: string; label: string };

const navLinks: NavLink[] = [
  { href: "/feed", label: "Home" },
  { href: "/profile", label: "Profile" },
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
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/auth");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/feed" className="inline-flex items-center gap-2 font-semibold text-white">
            <LogoIcon />
            <span className="hidden sm:inline">Yuki Social</span>
          </Link>
          <nav className="ml-3 hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-neutral-800 " +
                  (activeStartsWith(link.href) ? "bg-neutral-800 text-white" : "text-neutral-300")
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              placeholder="Search"
              className="w-56 rounded-md border border-neutral-800 bg-neutral-900 py-1.5 pl-8 pr-3 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none ring-0 focus:border-neutral-700 focus:ring-2 focus:ring-neutral-700"
            />
          </div>

          {!hydrated ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-neutral-800" />
          ) : token ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-2 py-1 hover:bg-neutral-800"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white">
                  {initialsFromName(user?.name || user?.phone || "U")}
                </div>
                <span className="hidden text-sm text-neutral-300 sm:block">{user?.name || user?.phone}</span>
                <ChevronDownIcon className="h-4 w-4 text-neutral-500" />
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
                    Profile
                  </Link>
                  <button
                    className="block w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-neutral-800"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function LogoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5 text-white"
      aria-hidden
    >
      <path d="M12 2a10 10 0 1 0 10 10A10.012 10.012 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Z" />
      <path d="M12 6a6 6 0 0 0-6 6 1 1 0 0 0 2 0 4 4 0 1 1 4 4 1 1 0 0 0 0 2 6 6 0 0 0 0-12Z" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M21.53 20.47l-4.807-4.807A7.5 7.5 0 1 0 10.5 18a7.45 7.45 0 0 0 4.663-1.607l4.807 4.807a.75.75 0 1 0 1.06-1.06zM4.5 10.5a6 6 0 1 1 6 6 6.007 6.007 0 0 1-6-6z" />
    </svg>
  );
}

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

