"use client";

import Link from "next/link";
import { PoapStamp } from "./PoapStamp";
import { mintAvailability } from "@/lib/poap";
import type { PoapListItem } from "@/lib/hooks";
import { formatDate, shortAddress } from "@/lib/format";
import { IS_TESTNET } from "@/lib/contract";

/**
 * SBT / stamp card — the Design-Arena visual language for a POAP.
 * Header band (ONCHAIN POAP · BASE / No. {id} / SERIES), a mint-type badge,
 * the perforated stamp, a status line, and a mint CTA.
 */
export function SbtCard({ item }: { item: PoapListItem }) {
  const { event, metadata, supply } = item;
  const avail = mintAvailability(event);
  const mintType = avail.signatureOpen
    ? "QR claim"
    : avail.allowlistOpen
      ? "Allowlist"
      : avail.publicOpen
        ? "Public mint"
        : "Claim";
  const series = `SERIES ${String((Number(event.id) % 4) + 1).padStart(2, "0")}`;
  const no = `No. ${String(event.id).padStart(4, "0")}`;
  const minted = supply ?? 0n;
  const status =
    minted > 0n ? (event.isSoulbound ? "Stamped out" : "In collection") : "Mint stamp";

  return (
    <Link
      href={`/poap/${event.id}`}
      className="card card-hover group flex flex-col overflow-hidden bg-card"
    >
      {/* header band */}
      <div className="flex items-center justify-between gap-2 border-b border-line/60 bg-paper/60 px-4 py-2.5">
        <span className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-faded">
          ONCHAIN POAP · BASE{IS_TESTNET ? "·SEP" : ""}
        </span>
        <span className="shrink-0 font-mono text-[10px] tracking-wide text-faded">
          {no} · {series}
        </span>
      </div>

      {/* body */}
      <div className="relative flex flex-1 flex-col p-5">
        {/* type badge */}
        <div className="absolute left-5 top-4">
          <span
            className={`badge ${
              avail.signatureOpen
                ? "border border-accent/30 bg-accent/10 text-accent"
                : avail.allowlistOpen
                  ? "border border-gold/40 bg-gold/10 text-gold"
                  : "border border-line bg-white/50 text-faded"
            }`}
          >
            {mintType}
          </span>
        </div>

        <div className="mt-8 flex justify-center">
          <PoapStamp
            image={metadata?.image}
            alt={event.name}
            size="sm"
            sealed={event.isSoulbound}
          />
        </div>

        <h3 className="mt-4 line-clamp-1 text-center font-display text-lg font-bold">
          {event.name}
        </h3>
        <p className="mt-0.5 text-center text-xs text-faded">
          {formatDate(event.eventDate || event.createdAt)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
        {event.description && (
          <p className="mt-1.5 line-clamp-2 text-center text-xs leading-relaxed text-faded">
            {event.description}
          </p>
        )}

        {/* status footer */}
        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
            <span className={minted > 0n ? "text-mint" : "text-accent"}>{status}</span>
            {minted > 0n && <span className="text-faded"> · {minted.toString()} minted</span>}
          </span>
          <span className="font-mono text-[10px] text-faded">{shortAddress(event.creator)}</span>
        </div>
      </div>
    </Link>
  );
}
