"use client";

import { useMemo, useState } from "react";
import { useTotalEvents, usePoapList } from "@/lib/hooks";
import { PoapCard } from "@/components/PoapCard";
import { mintAvailability } from "@/lib/poap";

const PAGE = 24;

type Filter = "all" | "mintable" | "public" | "allowlist" | "signature";

export default function ExplorePage() {
  const { data: total, isLoading } = useTotalEvents();
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");

  const ids = useMemo(() => {
    if (total === undefined) return [] as bigint[];
    const out: bigint[] = [];
    for (let i = total; i >= 0n && out.length < PAGE * pages; i--) out.push(i);
    return out;
  }, [total, pages]);

  const { items, isLoading: loadingItems } = usePoapList(ids);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((it) => {
      const a = mintAvailability(it.event);
      if (filter === "mintable") return a.anyOpen;
      if (filter === "public") return a.publicOpen;
      if (filter === "allowlist") return a.allowlistOpen;
      return a.signatureOpen;
    });
  }, [items, filter]);

  const hasMore = total !== undefined && BigInt(ids.length) < total + 1n;

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black">Explore POAPs</h1>
          <p className="mt-1 text-sm text-faded">
            Every POAP registered on the contract, newest first.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["all", "All"],
              ["mintable", "Mintable now"],
              ["public", "Public"],
              ["allowlist", "Allowlist"],
              ["signature", "Signature"],
            ] as [Filter, string][]
          ).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === f
                  ? "bg-ink text-paper"
                  : "border border-line bg-white/70 text-faded hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || (loadingItems && items.length === 0) ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-80 animate-pulse bg-parchment/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-faded">
          <p className="font-display text-lg font-bold text-ink">
            No POAPs match this filter
          </p>
          <p className="mt-1 text-sm">Try another filter, or create the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((it) => (
            <PoapCard key={it.event.id.toString()} item={it} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button className="btn-secondary" onClick={() => setPages((p) => p + 1)}>
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
