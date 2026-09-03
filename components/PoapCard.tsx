"use client";

import Link from "next/link";
import { PoapStamp } from "./PoapStamp";
import { StatusBadges } from "./Badges";
import type { PoapListItem } from "@/lib/hooks";
import { formatDate, shortAddress } from "@/lib/format";

export function PoapCard({ item }: { item: PoapListItem }) {
  const { event, metadata, supply } = item;
  return (
    <Link
      href={`/poap/${event.id}`}
      className="card card-hover group relative flex flex-col items-center p-5 text-center"
    >
      {event.isSoulbound && (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-stamp/30 bg-stamp/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stamp">
          🔒 locked
        </span>
      )}
      <PoapStamp image={metadata?.image} alt={event.name} size="md" sealed={event.isSoulbound} />
      <h3 className="mt-3 line-clamp-1 font-display text-lg font-bold">
        {event.name}
      </h3>
      <p className="mt-0.5 text-xs text-faded">
        #{event.id.toString()} · {formatDate(event.eventDate || event.createdAt)}
        {event.location ? ` · ${event.location}` : ""}
      </p>
      <div className="mt-2">
        <StatusBadges event={event} />
      </div>
      <p className="mt-2 text-[11px] font-medium text-faded/80">
        {supply.toString()} minted
        <span className="mx-1.5 text-line">·</span>
        <span className="font-mono">by {shortAddress(event.creator)}</span>
      </p>
    </Link>
  );
}
