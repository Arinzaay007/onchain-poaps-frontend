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
      className="card group flex flex-col items-center p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lift"
    >
      <PoapStamp image={metadata?.image} alt={event.name} size="md" />
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
        {supply.toString()} minted · by {shortAddress(event.creator)}
      </p>
    </Link>
  );
}
