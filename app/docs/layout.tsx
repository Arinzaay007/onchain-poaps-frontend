"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/creating", label: "Creating a POAP" },
  { href: "/docs/artwork", label: "SVG artwork & optimization" },
  { href: "/docs/soulbound", label: "Soulbound vs transferable" },
  { href: "/docs/distribution", label: "Distribution methods" },
  { href: "/docs/public-mint", label: "Public minting" },
  { href: "/docs/allowlists", label: "Allowlists & proofs" },
  { href: "/docs/signatures", label: "Signature minting & QR codes" },
  { href: "/docs/creator-permissions", label: "Creator permissions & deadlines" },
  { href: "/docs/verify", label: "Verifying POAPs" },
  { href: "/docs/contract", label: "Contract reference" },
  { href: "/docs/self-hosting", label: "Self-hosting this app" },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[240px,1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="label">Documentation</p>
        <nav className="flex flex-col gap-0.5 overflow-x-auto lg:overflow-visible">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                pathname === n.href
                  ? "bg-parchment font-semibold text-ink"
                  : "text-faded hover:text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <article className="prose-docs min-w-0 max-w-3xl">{children}</article>
    </div>
  );
}
