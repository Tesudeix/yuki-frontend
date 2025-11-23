import React from "react";

export const metadata = {
  title: "Төлбөрийн багц • TESUDEIX",
  description: "Invite код авахын тулд тохирох багцаа сонгон төлнө үү.",
};

function BackgroundMotif() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Dark vertical gradient to match spec */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#171717,40%,#0d0d0d)] opacity-70" />

      {/* Subtle low-poly wolf-like motif (abstract) */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        width={820}
        height={520}
        viewBox="0 0 820 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.04 }}
      >
        <g fill="#e93b68">
          <path d="M410 40l90 60-40 90-80-30-60-50z" />
          <path d="M300 170l110 40 120 10-40 90-130-10-70-60z" />
          <path d="M510 120l120 60-60 60-80-30z" />
          <path d="M240 240l60 80 120 40-80 40-100-60z" />
          <path d="M540 260l90 40-40 80-120-30z" />
        </g>
      </svg>
    </div>
  );
}

import ClientView from "./ClientView";

export default function PaymentPage() {
  return <ClientView />;
}
