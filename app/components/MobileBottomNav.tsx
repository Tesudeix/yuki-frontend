"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconProps = { className?: string };
type Tab = {
  href: string;
  label: string;
  icon: (props: IconProps) => JSX.Element;
  isActive: (pathname: string) => boolean;
};

const tabs: Tab[] = [
  {
    href: "/",
    label: "Home",
    icon: HomeIcon,
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/classroom",
    label: "Contents",
    icon: ContentsIcon,
    isActive: (pathname) => pathname.startsWith("/classroom") || pathname.startsWith("/categories"),
  },
  {
    href: "/community",
    label: "Community",
    icon: CommunityIcon,
    isActive: (pathname) => pathname.startsWith("/community"),
  },
  {
    href: "/shop",
    label: "Shop",
    icon: ShopIcon,
    isActive: (pathname) => pathname.startsWith("/shop") || pathname.startsWith("/payment"),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: ProfileIcon,
    isActive: (pathname) => pathname.startsWith("/profile") || pathname.startsWith("/members"),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname() || "";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#1400FF]/10 bg-black/95 backdrop-blur-xl shadow-[0_-12px_30px_rgba(0,0,0,0.6)]">
      <div className="mx-auto flex max-w-6xl items-stretch justify-between gap-1.5 px-3 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="group flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2.5 transition-colors"
            >
              <span
                className={[
                  "grid h-9 w-9 place-items-center rounded-xl transition-colors",
                  active
                    ? "bg-[#0e0e1a] text-[#1400FF] ring-1 ring-[#1400FF]/40 shadow-[0_0_18px_rgba(20,0,255,0.35)]"
                    : "bg-[#0b0b11] text-[#6f7496]",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className={["text-[11px] font-semibold tracking-[0.04em] leading-none", active ? "text-white" : "text-[#7a7fa6]"].join(" ")}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3.5 11.5L12 4l8.5 7.5" />
      <path d="M6.5 10.5V20h5v-5h1v5h5v-9.5" />
    </svg>
  );
}

function ContentsIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7 4h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M14 4v5h5" />
      <path d="M8.5 13.5h7" />
      <path d="M8.5 16.5h7" />
    </svg>
  );
}

function CommunityIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M16 11a3 3 0 1 0-3-3" />
      <path d="M8 11a3 3 0 1 0-3-3" />
      <path d="M4 20v-1a4 4 0 0 1 4-4h4" />
      <path d="M20 20v-1a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

function ShopIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 7h12l-1.2 12a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function ProfileIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}
