"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useConnect } from "wagmi";
import { useMiniApp } from "@/components/MiniAppProvider";
import { useTotalEvents, useOwnedIds, usePoapList } from "@/lib/hooks";
import { PoapStamp } from "@/components/PoapStamp";
import { SoulboundBadge } from "@/components/Badges";
import { formatDate, shortAddress } from "@/lib/format";
import { EXPLORER_URL, POAP_ADDRESS, OPENSEA_ASSET_URL } from "@/lib/contract";

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
          Connect your wallet to open your POAP album — every stamp you&rsquo;ve
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
          Connect wallet
        </button>
      </div>
    );
  }

  const loading = loadingOwned || (owned.length > 0 && loadingItems && items.length === 0);

  return (
    <div className="container-page py-10">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black">My collection</h1>
          <p className="mt-1 text-sm text-faded">
            The onchain POAP album of{" "}
            <a
              className="font-mono text-accent hover:underline"
              href={`${EXPLORER_URL}/token/${POAP_ADDRESS}?a=${address}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortAddress(address, 6)}
            </a>
          </p>
        </div>
        {items.length > 0 && (
          <p className="font-mono text-sm text-faded">
            {items.length} stamp{items.length === 1 ? "" : "s"} collected
          </p>
        )}
      </div>

      {loading ? (
        <div className="album mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-parchment/70" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center p-14 text-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-line">
            <span className="text-sm text-faded/70">your first stamp<br />goes here</span>
          </div>
          <p className="mt-5 font-display text-lg font-bold">No POAPs yet</p>
          <p className="mt-1 max-w-sm text-sm text-faded">
            Mint your first onchain POAP and start an attendance record that
            lives forever on Base.
          </p>
          <Link href="/explore" className="btn-primary mt-5">
            Find something to mint
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-line bg-parchment/50 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <div key={it.event.id.toString()} className="group relative flex flex-col items-center">
                <Link href={`/poap/${it.event.id}`} className="transition-transform group-hover:scale-[1.03]">
                  <PoapStamp image={it.metadata?.image} alt={it.event.name} size="md" />
                </Link>
                <h3 className="mt-2 line-clamp-1 text-center font-display text-base font-bold">
                  {it.event.name}
                </h3>
                <p className="text-xs text-faded">
                  {formatDate(it.event.eventDate || it.event.createdAt)}
                  {it.event.location ? ` · ${it.event.location}` : ""}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <SoulboundBadge soulbound={it.event.isSoulbound} />
                </div>
                <div className="mt-1.5 flex gap-3 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={OPENSEA_ASSET_URL(it.event.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    OpenSea ↗
                  </a>
                  <a
                    href={`${EXPLORER_URL}/token/${POAP_ADDRESS}?a=${it.event.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    BaseScan ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
