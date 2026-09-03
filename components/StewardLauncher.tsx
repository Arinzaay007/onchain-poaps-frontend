"use client";

import Link from "next/link";

/** Floating "Ask the Steward" button — desktop only, hidden on the steward page & mobile. */
export function StewardLauncher() {
  return (
    <Link
      href="/steward"
      className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 rounded-full border border-accentdark/50 bg-gradient-to-b from-accent to-accentdark px-5 py-3 text-sm font-bold text-paper shadow-[0_6px_22px_rgba(156,47,20,.4)] transition-transform hover:scale-105 active:scale-95 animate-floaty [--tilt:0deg] lg:flex"
    >
      <span className="text-lg leading-none">🧭</span>
      Ask the Steward
    </Link>
  );
}
