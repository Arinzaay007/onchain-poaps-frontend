"use client";

import Link from "next/link";
import { useRecentActivity, relTime } from "@/lib/activity";
import { shortAddress } from "@/lib/format";
import { EXPLORER_URL } from "@/lib/contract";

export function ActivityFeed() {
  const { data, isLoading } = useRecentActivity(10);

  if (isLoading)
    return (
      <div className="card p-5">
        <h2 className="font-display text-xl font-bold">Live onchain activity</h2>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded-lg bg-parchment/70" />
          ))}
        </div>
      </div>
    );

  if (!data || data.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-mint" />
        <h2 className="font-display text-xl font-bold">Live onchain activity</h2>
      </div>
      <ul className="mt-3 divide-y divide-line/60">
        {data.map((a) => (
          <li key={a.txHash + a.who} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0 truncate">
              <a
                href={`${EXPLORER_URL}/address/${a.who}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-faded hover:text-ink"
              >
                {shortAddress(a.who)}
              </a>{" "}
              {a.type === "mint" ? (
                <>
                  collected{" "}
                  <Link href={`/poap/${a.eventId}`} className="font-semibold text-accent hover:underline">
                    POAP #{a.eventId.toString()}
                  </Link>
                </>
              ) : (
                <>
                  created{" "}
                  <Link href={`/poap/${a.eventId}`} className="font-semibold text-accent hover:underline">
                    {a.name || `POAP #${a.eventId.toString()}`}
                  </Link>
                </>
              )}
            </span>
            <a
              href={`${EXPLORER_URL}/tx/${a.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-xs text-faded/80 hover:text-ink"
              title="View transaction"
            >
              {relTime(a.timestamp)} ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
