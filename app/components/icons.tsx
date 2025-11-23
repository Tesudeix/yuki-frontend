import React from "react";

type IconProps = { className?: string };

export function MdiDotsHorizontal({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6,10A2,2 0 1,1 6,14A2,2 0 1,1 6,10M12,10A2,2 0 1,1 12,14A2,2 0 1,1 12,10M18,10A2,2 0 1,1 18,14A2,2 0 1,1 18,10" />
    </svg>
  );
}

export function MdiHeart({ className = "" }: IconProps) {
  // Filled heart
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.3 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.53 5.01 13.2 4 14.94 4 17.45 4 19.5 6 19.5 8.5c0 3.8-3.4 6.86-8.05 11.53L12 21.35z" />
    </svg>
  );
}

export function MdiHeartOutline({ className = "" }: IconProps) {
  // Outline heart
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.1 8.64L12 8.77l-.1-.13C10.14 6.6 7.1 6.24 5.14 8.2c-1.98 1.98-1.98 5.18 0 7.16L12 22l6.86-6.64c1.98-1.98 1.98-5.18 0-7.16-1.96-1.96-5-1.6-6.76.6zM12 19.58l-5.45-5.28c-1.17-1.17-1.17-3.07 0-4.24 1.1-1.1 2.9-1.1 4 0l1.45 1.39 1.45-1.39c1.1-1.1 2.9-1.1 4 0 1.17 1.17 1.17 3.07 0 4.24L12 19.58z" />
    </svg>
  );
}

export function MdiReply({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M10 9V5l-7 7 7 7v-4c6 0 9.5 3 11 8-1-7-5-12-11-12z" />
    </svg>
  );
}

export function MdiRepeat({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17 1l4 4-4 4V6H7a3 3 0 0 0-3 3v2H2V9a5 5 0 0 1 5-5h10V1zm-10 22l-4-4 4-4v3h10a3 3 0 0 0 3-3v-2h2v2a5 5 0 0 1-5 5H7v3z" />
    </svg>
  );
}

export function MdiShareVariant({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77l-7.12-3.73a3.3 3.3 0 0 0 0-1.24l7.12-3.73A2.99 2.99 0 1 0 15 5a2.9 2.9 0 0 0 .06.59L7.94 9.32a3 3 0 1 0 0 5.36l7.12 3.73c-.04.19-.06.39-.06.59a3 3 0 1 0 3-3z" />
    </svg>
  );
}

export function MdiCamera({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9 2l1.5 2H15l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3L9 2zm3 16a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
    </svg>
  );
}

export function MdiSend({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export function MdiCog({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8m8.94 4a7.94 7.94 0 0 0-.15-1.5l2.11-1.65-2-3.46-2.49 1a8.27 8.27 0 0 0-2.61-1.5l-.39-2.65H9.19l-.39 2.65a8.27 8.27 0 0 0-2.61 1.5l-2.49-1-2 3.46 2.11 1.65A7.94 7.94 0 0 0 3.06 12c0 .51.05 1.01.15 1.5L1.1 15.15l2 3.46 2.49-1c.79.62 1.67 1.13 2.61 1.5l.39 2.65h4.82l.39-2.65c.94-.37 1.82-.88 2.61-1.5l2.49 1 2-3.46-2.11-1.65c.1-.49.15-.99.15-1.5z" />
    </svg>
  );
}
