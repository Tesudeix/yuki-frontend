import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Community", href: "/community" },
  { label: "Story", href: "/story" },
  { label: "Contents", href: "/classroom" },
];

const footerAccess = [
  { label: "Membership", href: "/payment" },
  { label: "Profile", href: "/profile" },
  { label: "Support", href: "/support" },
];

export default function SiteFooter() {
  return (
    <footer className="hidden md:block border-t border-white/5 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1.1fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="text-lg font-semibold text-white">Antaqor</div>
          <p className="max-w-sm text-sm text-neutral-400">
            Дижитал байлдан дагуулалт. Community, content, tools — нэг урсгалд.
          </p>
          <div className="flex items-center gap-3">
            <SocialIcon href="https://instagram.com" label="Instagram">
              <InstagramIcon className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="https://youtube.com" label="YouTube">
              <YouTubeIcon className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="https://threads.net" label="Threads">
              <ThreadsIcon className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="https://facebook.com" label="Facebook">
              <FacebookIcon className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="https://t.me" label="Telegram">
              <TelegramIcon className="h-4 w-4" />
            </SocialIcon>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a7fa6]">Platform</p>
          <div className="flex flex-col gap-2 text-sm text-neutral-300">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a7fa6]">Access</p>
          <div className="flex flex-col gap-2 text-sm text-neutral-300">
            {footerAccess.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-neutral-500">
          <span>© 2026 Antaqor</span>
          <span className="uppercase tracking-[0.22em] text-neutral-400">Private by design</span>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-neutral-300 transition hover:border-[#1400FF]/40 hover:text-white"
    >
      {children}
    </a>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="16.5" cy="7.5" r="1" />
    </svg>
  );
}

function YouTubeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.3c0-2.2-.2-3.4-.5-4.2-.3-.8-.9-1.4-1.7-1.7C18.9 6 12 6 12 6s-6.9 0-7.8.4c-.8.3-1.4.9-1.7 1.7C2.2 8.9 2 10.1 2 12.3s.2 3.4.5 4.2c.3.8.9 1.4 1.7 1.7.9.4 7.8.4 7.8.4s6.9 0 7.8-.4c.8-.3 1.4-.9 1.7-1.7.3-.8.5-2 .5-4.2zM10 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  );
}

function ThreadsIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M9.6 10.2c1.2-1.1 3.1-1.4 4.6-.8 1.2.5 2 1.6 2.2 3" />
      <path d="M16.4 12.4c.1 2.4-1.3 4.6-3.5 5.4-2.1.8-4.6.2-6.1-1.6-1.6-1.8-2-4.4-1.2-6.6C6.4 7.6 8.4 6 10.7 6c2.2 0 4.2 1.4 5 3.4" />
      <path d="M12.3 12.3c-.2 1.6-1.6 2.8-3.2 2.7" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8.2V6.5c0-.8.5-1 1-1h2V2h-3c-2.6 0-4 1.7-4 4v2.2H7v3.3h3V22h4v-10.5h3.1l.5-3.3H14z" />
    </svg>
  );
}

function TelegramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 4.5 3.4 11.6c-1.3.5-1.3 1.4-.2 1.7l4.8 1.5 1.8 5.7c.2.6.4.8.8.8.4 0 .6-.2.9-.5l2.6-2.5 5.4 4c1 .6 1.7.3 1.9-.9l3.2-15.1c.3-1.3-.5-1.9-1.6-1.3zM9.7 14.5l8.9-7.7c.4-.3.8-.1.5.2l-7.2 8.7-.3 3.2-1.3-4.1-4.3-1.3 10.6-6.7-6.9 7.7z" />
    </svg>
  );
}
