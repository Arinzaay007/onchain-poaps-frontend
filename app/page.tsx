"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTotalEvents, usePoapList } from "@/lib/hooks";
import { PoapCard } from "@/components/PoapCard";
import { StampLogo } from "@/components/Navbar";
import { IS_TESTNET } from "@/lib/contract";

export default function Home() {
  const { data: total } = useTotalEvents();
  const recentIds = useMemo(() => {
    if (total === undefined) return [] as bigint[];
    const ids: bigint[] = [];
    for (let i = total; i >= 0n && ids.length < 4; i--) ids.push(i);
    return ids;
  }, [total]);
  const { items } = usePoapList(recentIds);

  return (
    <div className="container-page">
      {/* Hero */}
      <section className="flex flex-col items-center py-16 text-center sm:py-24">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-1.5 text-xs font-semibold text-faded">
          <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
          100% onchain · no IPFS · no servers
          {IS_TESTNET && <span className="text-gold">· Base Sepolia</span>}
        </div>
        <h1 className="max-w-3xl font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Proof of attendance,{" "}
          <span className="text-accent">stamped forever onchain.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-faded sm:text-lg">
          Create POAPs whose SVG artwork and metadata live entirely on Base.
          Distribute them publicly, by allowlist, or with QR codes at live
          events. Collect them for life.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/create" className="btn-primary !px-6 !py-3 !text-base">
            Create a POAP
          </Link>
          <Link href="/explore" className="btn-secondary !px-6 !py-3 !text-base">
            Explore POAPs
          </Link>
        </div>
        {total !== undefined && (
          <p className="mt-6 font-mono text-xs text-faded">
            {(total + 1n).toString()} POAPs registered onchain
          </p>
        )}
      </section>

      {/* How it works */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            n: "01",
            t: "Create",
            d: "Upload an SVG, add event details, choose soulbound or transferable. We optimize the artwork so it costs less gas to store forever.",
            href: "/create",
          },
          {
            n: "02",
            t: "Distribute",
            d: "Open a public mint, set an allowlist from a list of addresses, or sign QR-code claims for live events. No Merkle-tree knowledge needed.",
            href: "/docs/distribution",
          },
          {
            n: "03",
            t: "Collect",
            d: "Attendees mint 1 per wallet. Every POAP is verifiable on BaseScan and OpenSea and lives in your onchain collection forever.",
            href: "/gallery",
          },
        ].map((s) => (
          <Link key={s.n} href={s.href} className="card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift">
            <span className="font-mono text-xs font-semibold text-accent">{s.n}</span>
            <h3 className="mt-1 font-display text-xl font-bold">{s.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-faded">{s.d}</p>
          </Link>
        ))}
      </section>

      {/* Recent POAPs */}
      <section className="mt-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Latest POAPs</h2>
          <Link href="/explore" className="text-sm font-semibold text-accent hover:underline">
            View all →
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-12 text-center text-faded">
            <StampLogo className="h-10 w-10 opacity-40" />
            <p className="text-sm">Loading POAPs from Base…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it) => (
              <PoapCard key={it.event.id.toString()} item={it} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
