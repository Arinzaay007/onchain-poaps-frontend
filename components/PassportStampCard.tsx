"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { PoapStamp } from "@/components/PoapStamp";
import { SoulboundBadge } from "@/components/Badges";
import { formatDate, shortAddress } from "@/lib/format";
import { useCollectors } from "@/lib/activity";
import { EXPLORER_URL, OPENSEA_ASSET_URL, POAP_ADDRESS } from "@/lib/contract";
import type { PoapEvent } from "@/lib/poap";
import type { PoapListItem } from "@/lib/hooks";

/**
 * A single passport PAGE in the owner's stamp book. Each collected stamp is
 * pressed onto a cream page with the collector number, date and a torn
 * corner — so the whole gallery reads as a physical book, not a grid.
 */
export function PassportStampCard({ item }: { item: PoapListItem }) {
  const { address } = useAccount();
  const router = useRouter();
  const event: PoapEvent = item.event;
  const { data } = useCollectors(event.id, event.createdAt);
  const records = data?.records ?? [];
  const mine = address
    ? records.find((r) => r.recipient.toLowerCase() === address.toLowerCase())
    : undefined;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/poap/${event.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/poap/${event.id}`);
        }
      }}
      className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-line bg-[linear-gradient(180deg,#fffdf6_0%,#f6efdd_100%)] p-6 shadow-card transition-transform hover:-translate-y-1 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {/* torn page corner */}
      <div className="pointer-events-none absolute right-0 top-0 h-0 w-0 border-l-[26px] border-t-[26px] border-l-transparent border-t-line" />

      {/* faint page ruling */}
      <div className="pointer-events-none absolute inset-x-5 top-16 space-y-6 opacity-[0.5]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-px bg-line" style={{ opacity: 0.55 - i * 0.06 }} />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        <div className="flex w-full items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-faded">
          <span className="rounded-full border border-line bg-surf px-2 py-0.5">
            Page {String(item.event.id).padStart(2, "0")}
          </span>
          {mine && (
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-gold">
              Coll. #{mine.position}
            </span>
          )}
        </div>

        <div className="mt-5">
          <PoapStamp
            image={item.metadata?.image}
            alt={event.name}
            size="md"
            sealed={event.isSoulbound}
          />
        </div>

        <h3 className="mt-4 line-clamp-1 text-center font-display text-lg font-bold">
          {event.name}
        </h3>
        <p className="mt-0.5 text-xs text-faded">
          {formatDate(event.eventDate || event.createdAt)}
          {event.location ? ` · ${event.location}` : ""}
        </p>

        <div className="mt-2.5">
          <SoulboundBadge soulbound={event.isSoulbound} />
        </div>

        <p className="mt-2 text-center text-[11px] leading-relaxed text-faded/80">
          {event.isSoulbound
            ? "🔒 this one is yours forever — not transferable"
            : "⇄ this one can travel to another wallet"}
        </p>

        <div className="mt-3 flex gap-3 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100">
          <a
            href={OPENSEA_ASSET_URL(event.id)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-accent hover:underline"
          >
            OpenSea ↗
          </a>
          <a
            href={`${EXPLORER_URL}/token/${POAP_ADDRESS}?a=${event.id}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-accent hover:underline"
          >
            BaseScan ↗
          </a>
        </div>

        {mine && (
          <p className="mt-2 font-mono text-[10px] text-faded">
            tx{" "}
            <a
              href={`${EXPLORER_URL}/tx/${mine.txHash}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
            >
              {shortAddress(mine.txHash, 6)}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
