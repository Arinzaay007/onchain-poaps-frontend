"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useConnect } from "wagmi";
import { useMiniApp } from "@/components/MiniAppProvider";
import { useTotalEvents, useOwnedIds, usePoapList } from "@/lib/hooks";
import { PoapStamp } from "@/components/PoapStamp";
import { PassportStampCard } from "@/components/PassportStampCard";
import { shortAddress } from "@/lib/format";
import { EXPLORER_URL, POAP_ADDRESS } from "@/lib/contract";

export default function GalleryPage() {
  const { address, isConnected } = useAccount();
  const { data: total } = useTotalEvents();
  const { isMiniApp } = useMiniApp();
  const { openConnectModal } = useConnectModal();
  const { connect, connectors } = useConnect();

  const allIds = useMemo(() => {
    if (total === undefined) return [] as bigint[];
    const ids: bigint[] = [];
    for (let i = 0n; i <= total; i++) ids.push(i);
    return ids;
  }, [total]);

  const { owned, isLoading: loadingOwned } = useOwnedIds(allIds, address);
  const { items, isLoading: loadingItems } = usePoapList(owned);

  if (!isConnected) {
    return (
      <div className="container-page max-w-lg py-20 text-center">
        <h1 className="font-display text-3xl font-black">My collection</h1>
        <p className="mt-3 text-faded">
          Connect your wallet to open your POAP passport — every stamp you&rsquo;ve
          ever collected, straight from the chain.
        </p>
        <button
          className="btn-primary mt-6"
          onClick={() => {
            if (isMiniApp) {
              const fc = connectors.find((c) => c.id === "farcaster");
              if (fc) connect({ connector: fc });
            } else openConnectModal?.();
          }}
        >
          Open my passport
        </button>
      </div>
    );
  }

  const loading = loadingOwned || (owned.length > 0 && loadingItems && items.length === 0);

  const soulboundCount = items.filter((i) => i.event.isSoulbound).length;
  const transferableCount = items.length - soulboundCount;

  return (
    <div className="container-page py-10">
      {/* ---- Passport cover / header ---- */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-[linear-gradient(135deg,#3a2c1c_0%,#4a3823_60%,#3a2c1c_100%)] p-8 text-paper shadow-lift sm:p-10">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-paper/10" />
        <div className="pointer-events-none absolute -right-2 -top-2 h-28 w-28 rounded-full border border-paper/10" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
              POAP · Passport · Vol. 1
            </p>
            <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
              My stamp book
            </h1>
            <p className="mt-2 max-w-md text-sm text-paper/70">
              Every POAP you collect is pressed onto a page here. Open one to
              see its artwork, collector number and the wallet&rsquo;s onchain receipt.
            </p>
          </div>
          <div className="rounded-2xl border border-paper/20 bg-black/20 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-widest text-paper/50">Account</p>
            <a
              className="font-mono text-sm text-gold hover:underline"
              href={`${EXPLORER_URL}/token/${POAP_ADDRESS}?a=${address}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortAddress(address, 6)}
            </a>
          </div>
        </div>

        {/* stamp-count + set progress */}
        {items.length > 0 && (
          <div className="mt-6 flex items-center gap-4">
            <div className="flex shrink-0 flex-col">
              <span className="font-display text-4xl font-black text-gold">
                {items.length}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-paper/50">
                stamps
              </span>
            </div>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/25">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-accent transition-all duration-700"
                style={{ width: `${Math.min(100, (items.length / (allIds.length || 1)) * 100)}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-xs text-paper/50">
              {items.length}/{allIds.length || "–"} of the series
            </span>
          </div>
        )}
      </div>

      {/* ---- Readability legend ---- */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="card flex items-start gap-3 p-4">
          <PoapStamp image={null} alt="locked" size="sm" sealed />
          <div>
            <p className="font-display text-sm font-bold">🔒 Stamped, forever</p>
            <p className="text-xs leading-relaxed text-faded">
              Wax-sealed &amp; locked — this soulbound stamp can never be
              transferred. It belongs to this wallet for life.
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-3 p-4">
          <PoapStamp image={null} alt="loose" size="sm" />
          <div>
            <p className="font-display text-sm font-bold">⇄ Loose ticket stub</p>
            <p className="text-xs leading-relaxed text-faded">
              Transferable — you can gift it, trade it, or send it to another
              wallet at any time.
            </p>
          </div>
        </div>
      </div>

      {/* ---- The book ---- */}
      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-parchment/70" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center p-14 text-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-line">
            <span className="text-sm text-faded/70">your first stamp<br />goes here</span>
          </div>
          <p className="mt-5 font-display text-lg font-bold">Your book is empty</p>
          <p className="mt-1 max-w-sm text-sm text-faded">
            Mint your first onchain POAP and start an attendance record that
            lives forever on Base.
          </p>
          <Link href="/explore" className="btn-primary mt-5">
            Find something to mint
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-faded">
              {soulboundCount} locked · {transferableCount} transferable
            </p>
            <span className="text-xs text-faded">tap a stamp to open it</span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <PassportStampCard key={it.event.id.toString()} item={it} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
