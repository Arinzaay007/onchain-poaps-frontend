"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectControl } from "./ConnectControl";
import { useMiniApp } from "./MiniAppProvider";
import { IS_TESTNET } from "@/lib/contract";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/create", label: "Create" },
  { href: "/verify", label: "Verify" },
  { href: "/gallery", label: "My Collection" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isMiniApp } = useMiniApp();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper md:bg-paper/90 md:backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <StampLogo className="h-7 w-7" />
          <span className="font-display text-lg font-black tracking-tight hidden xs:block sm:block">
            Onchain POAPs
          </span>
          {IS_TESTNET && (
            <span className="badge bg-gold/15 text-gold border border-gold/30">
              testnet
            </span>
          )}
        </Link>

        {/* desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith(l.href)
                  ? "bg-parchment text-ink"
                  : "text-faded hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <ConnectControl />
      </div>

      {/* mobile / mini-app bottom tabs */}
      <nav
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-paper flex ${
          isMiniApp ? "pb-[env(safe-area-inset-bottom)]" : ""
        }`}
      >
        {[{ href: "/", label: "Home", icon: "⌂" }, ...links].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 py-2.5 text-center text-[11px] font-semibold ${
              (l.href === "/" && pathname === "/") ||
              (l.href !== "/" && pathname.startsWith(l.href))
                ? "text-accent"
                : "text-faded"
            }`}
          >
            {l.label === "My Collection" ? "Collection" : l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function StampLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#c73e1d" />
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={16 + Math.cos(a) * 15}
            cy={16 + Math.sin(a) * 15}
            r="1.6"
            fill="#f8f3e8"
          />
        );
      })}
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="#f8f3e8" strokeWidth="1.2" />
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
