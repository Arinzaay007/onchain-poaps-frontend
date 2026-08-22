"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTotalEvents, usePoapList } from "@/lib/hooks";
import { PoapCard } from "@/components/PoapCard";
import { StampLogo } from "@/components/Navbar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { IS_TESTNET } from "@/lib/contract";
import { generateStampSvg } from "@/lib/stamp";
import { svgToDataUri } from "@/lib/svg";

export default function Home() {
  const { data: total } = useTotalEvents();
  const recentIds = useMemo(() => {
    if (total === undefined) return [] as bigint[];
    const ids: bigint[] = [];
    for (let i = total; i >= 0n && ids.length < 4; i--) ids.push(i);
    return ids;
  }, [total]);
  const { items } = usePoapList(recentIds);

  // decorative hero stamps (generated client-side, zero asset weight)
  const heroStamps = useMemo(
    () => [
      {
        uri: svgToDataUri(
          generateStampSvg({
            shape: "scallop", bg: "#c73e1d", ink: "#f8f3e8", center: "🎪",
            centerColor: "#f8f3e8", topText: "ETH LAGOS 2026", bottomText: "", showDashRing: true,
          }),
        ),
        cls: "left-[3%] top-24 w-32 -rotate-12 [--tilt:-12deg]",
        delay: "0s",
      },
      {
        uri: svgToDataUri(
          generateStampSvg({
            shape: "gear", bg: "#16233a", ink: "#e8dcc0", center: "🛠️",
            centerColor: "#f8f3e8", topText: "BASE BUILDERS", bottomText: "", showDashRing: true,
          }),
        ),
        cls: "right-[4%] top-16 w-36 rotate-[9deg] [--tilt:9deg]",
        delay: "1.6s",
      },
      {
        uri: svgToDataUri(
          generateStampSvg({
            shape: "ring", bg: "#3d7a4f", ink: "#eaf3dc", center: "🌱",
            centerColor: "#eaf3dc", topText: "GENESIS MEETUP", bottomText: "", showDashRing: false,
          }),
        ),
        cls: "right-[12%] bottom-8 w-28 -rotate-6 [--tilt:-6deg]",
        delay: "3.2s",
      },
    ],
    [],
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
          {heroStamps.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={s.uri}
              alt=""
              className={`absolute animate-floaty opacity-80 drop-shadow-md ${s.cls}`}
              style={{ animationDelay: s.delay }}
            />
          ))}
        </div>
        <div className="container-page relative flex flex-col items-center py-16 text-center sm:py-24">
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
        </div>
      </section>

      {/* paper-tape marquee */}
      <div className="overflow-hidden border-y border-line bg-parchment/70 py-2" aria-hidden>
        <div className="flex w-max animate-marquee gap-0 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-faded/80">
          {[0, 1].map((k) => (
            <span key={k} className="whitespace-nowrap pr-2">
              100% onchain ✦ no IPFS ✦ soulbound or transferable ✦ QR claims at live events ✦
              allowlists without the math ✦ 1 per wallet ✦ verify anyone, anytime ✦ MIT licensed ✦{" "}
            </span>
          ))}
        </div>
      </div>

      <div className="container-page">
      {/* How it works */}
      <section className="mt-12 grid gap-4 sm:grid-cols-3">
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

      {/* Live activity + Recent POAPs */}
      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr,380px]">
        <div>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((it) => (
                <PoapCard key={it.event.id.toString()} item={it} />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <ActivityFeed />
          <Link href="/verify" className="card block p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
            <h3 className="font-display text-lg font-bold">✓ Verify attendance</h3>
            <p className="mt-1 text-sm leading-relaxed text-faded">
              Check whether any wallet holds a given POAP — with the onchain
              mint receipt to prove it.
            </p>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
