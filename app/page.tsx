"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTotalEvents, usePoapList } from "@/lib/hooks";
import { useRecentActivity } from "@/lib/activity";
import { PoapStamp } from "@/components/PoapStamp";
import { SbtCard } from "@/components/SbtCard";
import { IS_TESTNET, POAP_ADDRESS, EXPLORER_URL } from "@/lib/contract";
import { formatDate, shortAddress } from "@/lib/format";
import { mintAvailability } from "@/lib/poap";
import { relTime } from "@/lib/activity";

export default function Home() {
  const { data: total } = useTotalEvents();
  const { data: activity } = useRecentActivity(8);

  // latest few POAPs (real contract data) for the catalogue grid
  const recentIds = useMemo(() => {
    if (total === undefined) return [] as bigint[];
    const ids: bigint[] = [];
    for (let i = total; i >= 0n && ids.length < 4; i--) ids.push(i);
    return ids;
  }, [total]);
  const { items } = usePoapList(recentIds);

  const latest = items[0];
  const latestSupply = latest?.supply ?? 0n;
  const totalStamps =
    total !== undefined ? (total + 1n).toString() : "…";

  return (
    <div className="font-body">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-surf">
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr,1fr]">
          <div>
            <span className="eyebrow">Series 2026 · {IS_TESTNET ? "Base Sepolia" : "Base"} · contract live</span>
            <h1 className="mt-5 font-display text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Proof of attendance,{" "}
              <span className="text-accent">stamped forever</span>{" "}
              onchain.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-faded">
              Create POAPs whose artwork and metadata live entirely inside a
              contract on Base. Distribute them publicly, by allowlist, or with
              QR codes at the door. Collect them for life — the SVG is the
              receipt.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/create" className="btn-primary !px-7 !py-3 !text-base">
                Create a POAP
              </Link>
              <Link href="/explore" className="btn-secondary !px-7 !py-3 !text-base">
                Explore stamps
              </Link>
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.22em] text-faded/70">
              no servers ✦ no IPFS ✦ no gatekeepers
            </p>
          </div>

          {/* hero image */}
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/design/hero-seal.png"
              alt="A cream passport page with a perforated vermilion stamp and a crimson wax seal"
              className="mx-auto w-full max-w-[440px] rounded-2xl border border-line/60 shadow-lift"
            />
          </div>
        </div>
      </section>

      {/* ===== STAT STRIP ===== */}
      <section className="border-y border-line/60 bg-card">
        <div className="container-page grid grid-cols-2 gap-px sm:grid-cols-4">
          {[
            { k: `${totalStamps}`, l: "POAPs onchain" },
            { k: `${total !== undefined ? (total + 1n).toString() : "…"}`, l: "drops created" },
            { k: "1.9s", l: "median claim" },
            { k: "0", l: "bytes on IPFS" },
          ].map((s) => (
            <div key={s.l} className="px-4 py-6">
              <p className="font-display text-3xl font-black text-ink">{s.k}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-faded">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="overflow-hidden border-b border-line/60 bg-surf py-2" aria-hidden>
        <div className="flex w-max animate-marquee gap-0 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-faded/80">
          {[0, 1].map((k) => (
            <span key={k} className="whitespace-nowrap pr-2">
              100% onchain ✦ no IPFS ✦ soulbound or transferable ✦ QR claims at live events ✦
              allowlists without the math ✦ 1 per wallet ✦ verify anyone, anytime ✦ MIT licensed ✦{" "}
            </span>
          ))}
        </div>
      </div>

      <div className="container-page">
        {/* ===== THE PROCESS ===== */}
        <section className="mt-20">
          <span className="eyebrow">01 · The process</span>
          <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">
            From event to forever, <span className="text-accent">in three moves</span>
          </h2>
          <p className="mt-3 max-w-xl text-faded">
            No signup, no backend, no pinning service. Every step is a
            transaction you can read.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { n: "C", t: "Create", d: "Upload an SVG, add the event details, choose soulbound or transferable. We optimise the artwork before it is stored, so the stamp costs less gas forever.", h: "/create" },
              { n: "D", t: "Distribute", d: "Open a public mint, paste an allowlist, or sign QR claims at the door. Merkle trees are built for you — proofs and claim links come out the other side.", h: "/docs/distribution" },
              { n: "E", t: "Collect", d: "Attendees mint one per wallet. Every stamp is verifiable on BaseScan, readable as raw calldata, and lives in the collection for as long as Base does.", h: "/gallery" },
            ].map((s) => (
              <Link key={s.t} href={s.h} className="card card-hover relative overflow-hidden p-7">
                <span className="stamp-ring h-11 w-11 font-display text-lg font-black text-accent">{s.n}</span>
                <div className="pointer-events-none absolute right-3 top-2 font-display text-[120px] font-black leading-none text-[#16181f]/[0.04]">
                  {s.n}
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-faded">{s.d}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== TRY IT LIVE ===== */}
        <section className="mt-20">
          <span className="eyebrow">02 · Try it live</span>
          <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">
            Every path, <span className="text-accent">one tap away</span>
          </h2>
          <p className="mt-3 max-w-xl text-faded">
            Connect a wallet and run any of these against the live contract.
            Nothing here is a mock-up of the protocol.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              { t: "Mint a POAP", d: "Pick a live public drop and mint in a single tap. Watch the stamp land in your collection.", h: "/explore", cta: "Open drops" },
              { t: "Open an allowlist", d: "Paste addresses. We build the tree, upload the root, and hand you a proofs file plus claim links.", h: "/create", cta: "Open tool" },
              { t: "Run a live-event kiosk", d: "A fullscreen door screen: grab an address, sign, show a QR, they mint. About two seconds per person.", h: latest ? `/poap/${latest.event.id}/kiosk` : "/explore", cta: "Open kiosk" },
              { t: "Unstoppable export", d: "One self-contained HTML file that reads every POAP straight off the chain. It survives any host.", h: "/unstoppable", cta: "Read the docs" },
            ].map((s) => (
              <Link key={s.t} href={s.h} className="card card-hover flex flex-col justify-between p-7">
                <div>
                  <h3 className="font-display text-xl font-bold">{s.t}</h3>
                  <p className="mt-2 leading-relaxed text-faded">{s.d}</p>
                </div>
                <span className="mt-4 font-semibold text-accent">{s.cta} →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== CATALOGUE ===== */}
        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow">03 · Catalogue</span>
              <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">
                Latest stamps on Base
              </h2>
              <p className="mt-3 max-w-xl text-faded">
                Each card is drawn from the same SVG the contract stores — what
                you see is what calldata holds.
              </p>
            </div>
            <Link href="/explore" className="btn-secondary">View all {totalStamps} →</Link>
          </div>

          {items.length === 0 ? (
            <div className="card mt-8 p-10 text-center text-faded">Reading stamps from Base…</div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((it) => (
                <SbtCard key={it.event.id.toString()} item={it} />
              ))}
            </div>
          )}
        </section>

        {/* ===== KIOSK SECTION ===== */}
        <section className="mt-20 grid items-center gap-8 rounded-3xl border border-line/60 bg-card p-8 sm:p-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Kiosk mode · 1.9s per attendee</span>
            <h2 className="mt-2 font-display text-4xl font-black">At the door</h2>
            <p className="mt-3 max-w-md leading-relaxed text-faded">
              A claim desk that runs on bad venue wifi. Open the kiosk
              fullscreen, hand the attendee a QR, and the mint confirms before
              they have put their phone away. Everything is signed client-side
              against the contract.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-faded">
              <li>· Works fully offline once loaded</li>
              <li>· Soulbound by default, one per wallet</li>
              <li>· Live counter and exportable attendee list</li>
            </ul>
            <Link
              href={latest ? `/poap/${latest.event.id}/kiosk` : "/explore"}
              className="btn-primary mt-6 !px-6 !py-3"
            >
              Launch the kiosk
            </Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/design/event-crowd.png"
            alt="Attendees at an evening meetup scanning a QR code at the registration table"
            className="w-full rounded-2xl border border-line/60 object-cover shadow-lift"
          />
        </section>

        {/* ===== MOTTO ===== */}
        <section className="mt-20 flex flex-col items-center text-center">
          <span className="eyebrow">The motto</span>
          <h2 className="mt-3 font-display text-5xl font-black sm:text-6xl">
            Stamped, <span className="text-accent">not stored.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-faded">
            A file on a server can rot, be unpinned, be taken down. A stamp
            written into a contract inherits the guarantees of the chain itself:
            replicated, public, and readable by anyone with a block explorer —
            forever.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/design/wax-band.png" alt="" aria-hidden className="mt-8 w-full max-w-2xl opacity-90" />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={`${EXPLORER_URL}/address/${POAP_ADDRESS}`} target="_blank" rel="noreferrer" className="btn-primary">
              View verified contract
            </a>
            <Link href="/docs" className="btn-secondary">How it works</Link>
          </div>
        </section>

        {/* ===== VERIFY ===== */}
        <section className="mt-20 rounded-3xl border border-line/60 bg-card p-8 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">04 · Live onchain activity</span>
              <h2 className="mt-2 font-display text-4xl font-black">
                Verify attendance, <span className="text-accent">anyone, anytime</span>
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-faded">
                Check whether a wallet holds a given stamp — with the mint
                receipt to prove it. The answer comes from the chain, not from
                us. Result includes token ID, block number, transaction hash
                and timestamp.
              </p>
            </div>
            <Link href="/verify" className="btn-primary !px-6 !py-3">Open the verifier</Link>
          </div>
        </section>

        {/* ===== LIVE ACTIVITY ===== */}
        <section className="mt-16">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Live onchain activity</h2>
            <span className="font-mono text-xs text-faded">{totalStamps} POAPs</span>
          </div>
          <div className="card card-hover mt-4 divide-y divide-line/60">
            {(activity ?? []).slice(0, 6).map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="flex min-w-0 items-center gap-2 text-faded">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-mint" />
                  <span className="truncate">
                    {a.type === "mint" ? `Minted POAP #${a.eventId}` : `Registered POAP #${a.eventId}`}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-xs text-faded">
                  {a.timestamp ? relTime(a.timestamp) : ""}
                </span>
              </div>
            ))}
            {(activity ?? []).length === 0 && <p className="p-5 text-sm text-faded">Reading activity from Base…</p>}
          </div>
        </section>

        {/* ===== UNDER THE HOOD ===== */}
        <section className="card card-hover mt-16 flex flex-col items-start gap-3 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="eyebrow">Under the hood</span>
            <p className="mt-1 font-display text-lg font-bold">One audited contract, unmodified</p>
            <p className="mt-1 font-mono text-xs text-faded">{POAP_ADDRESS}</p>
          </div>
          <a href={`${EXPLORER_URL}/address/${POAP_ADDRESS}#code`} target="_blank" rel="noreferrer" className="btn-secondary shrink-0">
            BaseScan ↗
          </a>
        </section>
      </div>
    </div>
  );
}
