"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/contexts/auth-context";

export default function FeaturedSlider() {
  const { token } = useAuthContext();

  return (
    <section className="slider">
      <div className="slider__hero">
        <div className="slider__hero-bg">
          <Image
            src="/tesu.png"
            alt="Antaqor"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="slider__hero-image"
            unoptimized
          />
        </div>
        <div className="slider__hero-overlay" />
        <div className="slider__hero-content">
          <div>
            <p className="slider__hero-kicker">Antaqor</p>
            <h1 className="slider__hero-title">Дижитал байлдан дагуулалт</h1>
            <p className="slider__hero-subtitle">Community, content, tools — нэг dashboard-д.</p>
          </div>
          <div className="slider__hero-actions">
            {!token && (
              <Link href="/auth" className="slider__login">
                Нэвтрэх
              </Link>
            )}
            <div className="slider__socials" aria-label="Social media links">
              <a className="slider__social" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <InstagramIcon className="slider__social-icon" />
              </a>
              <a className="slider__social" href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <YouTubeIcon className="slider__social-icon" />
              </a>
              <a className="slider__social" href="https://threads.net" target="_blank" rel="noreferrer" aria-label="Threads">
                <ThreadsIcon className="slider__social-icon" />
              </a>
              <a className="slider__social" href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FacebookIcon className="slider__social-icon" />
              </a>
              <a className="slider__social" href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram">
                <TelegramIcon className="slider__social-icon" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
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
