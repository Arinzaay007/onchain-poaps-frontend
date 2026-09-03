"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectControl } from "./ConnectControl";
import { DarkModeToggle } from "./DarkModeToggle";
import { useMiniApp } from "./MiniAppProvider";
import { IS_TESTNET } from "@/lib/contract";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/create", label: "Create" },
  { href: "/steward", label: "Steward" },
  { href: "/verify", label: "Verify" },
  { href: "/gallery", label: "My Collection" },
  { href: "/docs", label: "Docs" },
];

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function TabHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...stroke}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function TabExplore() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}
function TabCreate() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...stroke}>
      <path d="M12 3v18M3 12h18" />
    </svg>
  );
}
function TabVerify() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...stroke}>
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}
function TabCollection() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...stroke}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}
function TabDocs() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...stroke}>
      <path d="M6 3h9l4 4v14H6Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
function TabSteward() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9h4M10 13h4" />
    </svg>
  );
}

const tabIcons: Record<string, ReactNode> = {
  "/": <TabHome />,
  "/explore": <TabExplore />,
  "/create": <TabCreate />,
  "/steward": <TabSteward />,
  "/verify": <TabVerify />,
  "/gallery": <TabCollection />,
  "/docs": <TabDocs />,
};

export function Navbar() {
  const pathname = usePathname();
  const { isMiniApp } = useMiniApp();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper md:bg-paper/90 md:backdrop-blur">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <StampLogo className="h-8 w-8 transition-transform group-hover:rotate-6" />
          <span className="hidden font-display text-xl font-black tracking-tight sm:block">
            Onchain <span className="text-accent">POAPs</span>
          </span>
          {IS_TESTNET && (
            <span className="badge border border-gold/30 bg-gold/15 text-gold">
              testnet
            </span>
          )}
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "text-ink" : "text-faded hover:text-ink"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[3px] h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <ConnectControl />
        </div>
      </div>

      {/* mobile / mini-app bottom tabs */}
      <nav
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-paper flex ${
          isMiniApp ? "pb-[env(safe-area-inset-bottom)]" : ""
        }`}
      >
        {[{ href: "/", label: "Home" }, { href: "/explore", label: "Explore" }, { href: "/create", label: "Create" }, { href: "/steward", label: "Steward" }, { href: "/gallery", label: "Collection" }, { href: "/docs", label: "Docs" }].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
              (l.href === "/" && pathname === "/") ||
              (l.href !== "/" && pathname.startsWith(l.href))
                ? "text-accent"
                : "text-faded"
            }`}
          >
            {tabIcons[l.href]}
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function StampLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <radialGradient id="logoWax" cx="0.4" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#d8562f" />
          <stop offset="0.65" stopColor="#c73e1d" />
          <stop offset="1" stopColor="#8f2a12" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#logoWax)" />
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={16 + Math.cos(a) * 15}
            cy={16 + Math.sin(a) * 15}
            r="1.5"
            fill="#f8f3e8"
          />
        );
      })}
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="#f8f3e8" strokeWidth="1.1" opacity="0.9" />
      <text
        x="16"
        y="20.5"
        textAnchor="middle"
        fontSize="12"
        fontWeight="900"
        fill="#f8f3e8"
        fontFamily="serif"
      >
        P
      </text>
    </svg>
  );
}
