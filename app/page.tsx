"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTotalEvents, usePoapList } from "@/lib/hooks";
import { PoapCard } from "@/components/PoapCard";
import { StampLogo } from "@/components/Navbar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { IS_TESTNET, POAP_ADDRESS, EXPLORER_URL } from "@/lib/contract";
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
          <span className="eyebrow mb-6">
            Onchain · Base · No servers
            {IS_TESTNET ? " · Base Sepolia" : ""}
          </span>
          <h1 className="max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Proof of attendance, <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-accent via-accent to-gold bg-clip-text text-transparent">
              stamped forever onchain.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-faded sm:text-lg">
            Create POAPs whose SVG artwork and metadata live entirely on Base.
            Distribute them publicly, by allowlist, or with QR codes at live
            events. Collect them for life.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/create" className="btn-primary !px-6 !py-3 !text-base">
              Create a POAP
            </Link>
            <Link href="/explore" className="btn-secondary !px-6 !py-3 !text-base">
              Explore POAPs
            </Link>
          </div>
          {total !== undefined && (
            <p className="mt-7 font-mono text-xs text-faded">
              <span className="font-semibold text-ink">{(total + 1n).toString()}</span>{" "}
              POAPs registered onchain
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
        <section className="mt-16">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">
              From event to forever, <span className="text-accent">in three moves</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
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
              <Link
                key={s.n}
                href={s.href}
                className="card card-hover relative overflow-hidden p-6"
              >
                <div className="pointer-events-none absolute -right-4 -top-6 font-display text-[88px] font-black leading-none text-accent/[0.06]">
                  {s.n}
                </div>
                <span className="stamp-ring h-9 w-9 font-mono text-xs font-bold text-accent">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-faded">{s.d}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Try it live — self-serve demo the judge can run in 10 seconds */}
        <section className="mt-16">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="eyebrow">Try it live</span>
            <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">
              Every path, <span className="text-accent">one tap away</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm text-faded">
              No signup, no backend. Connect a wallet and run any of these
              against the live contract on Base Sepolia.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🪙",
                t: "Mint a POAP",
                d: "Pick a live public drop and mint one in a single tap. See the stamp land in your collection instantly.",
                href: "/poap/4",
              },
              {
                icon: "📋",
                t: "Open an allowlist",
                d: "Paste addresses, we build the Merkle tree, you get a proofs file + claim links per wallet. No math.",
                href: "/poap/4/manage",
              },
              {
                icon: "🎟",
                t: "Run a live-event kiosk",
                d: "Fullscreen door screen: grab an address, sign, show a QR, they mint. ~2 seconds per person.",
                href: "/poap/4/kiosk",
              },
              {
                icon: "🛰",
                t: "Open the unstoppable export",
                d: "A single self-contained HTML file that reads every POAP straight off-chain. Survives any host dying.",
                href: "/unstoppable",
              },
            ].map((s) => (
              <Link
                key={s.t}
                href={s.href}
                className="card card-hover flex flex-col p-6"
              >
                <span className="text-3xl">{s.icon}</span>
                <h3 className="mt-3 font-display text-lg font-bold">{s.t}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-faded">{s.d}</p>
                <span className="mt-3 text-sm font-semibold text-accent">Open →</span>
              </Link>
            ))}
          </div>
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
            <Link
              href="/verify"
              className="card card-hover block p-5"
            >
              <h3 className="font-display text-lg font-bold">✓ Verify attendance</h3>
              <p className="mt-1 text-sm leading-relaxed text-faded">
                Check whether any wallet holds a given POAP — with the onchain
                mint receipt to prove it.
              </p>
            </Link>
          </div>
        </section>

        {/* Contract strip */}
        <section className="card card-hover mt-16 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="eyebrow">Under the hood</span>
            <p className="mt-1 font-display text-lg font-bold">
              One audited contract on Base Sepolia, unmodified.
            </p>
            <p className="mt-1 font-mono text-xs text-faded">{POAP_ADDRESS}</p>
          </div>
          <a
            href={`${EXPLORER_URL}/address/${POAP_ADDRESS}#code`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary shrink-0"
          >
            View verified contract ↗
          </a>
        </section>
      </div>
    </div>
  );
}
