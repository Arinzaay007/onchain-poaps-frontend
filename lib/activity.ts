"use client";

import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http, parseAbiItem } from "viem";
import { ACTIVE_CHAIN, POAP_ADDRESS } from "./contract";

/**
 * Onchain activity — read NewMint / NewEvent logs straight from the RPC.
 * Public RPCs cap eth_getLogs at 10k-block ranges, so we scan in chunks
 * with a batched transport (many getLogs per HTTP round-trip).
 */

/** Block the contract was deployed at (found via binary search on getCode). */
export const DEPLOY_BLOCK = BigInt(
  process.env.NEXT_PUBLIC_DEPLOY_BLOCK ?? "45288813",
);

const CHUNK = 9_990n;
const BLOCK_TIME = 2n; // Base ~2s blocks

const client = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(
    ACTIVE_CHAIN.id === 8453
      ? process.env.NEXT_PUBLIC_RPC_BASE ?? undefined
      : process.env.NEXT_PUBLIC_RPC_BASE_SEPOLIA ?? "https://sepolia.base.org",
    { batch: { batchSize: 10, wait: 30 } },
  ),
});

export const NEW_MINT = parseAbiItem(
  "event NewMint(uint256 indexed eventId, address indexed recipient)",
);
export const NEW_EVENT = parseAbiItem(
  "event NewEvent(uint256 indexed eventId, string name, address indexed creator)",
);

export interface ActivityItem {
  type: "mint" | "create";
  eventId: bigint;
  who: `0x${string}`;
  name?: string;
  blockNumber: bigint;
  txHash: `0x${string}`;
  timestamp?: number; // seconds
}

/** Estimate the block for a past timestamp (with a safety margin). */
function estimateBlock(latest: bigint, nowSec: bigint, tsSec: bigint): bigint {
  const behind = (nowSec - tsSec) / BLOCK_TIME + 1800n; // +1h margin
  const est = latest > behind ? latest - behind : DEPLOY_BLOCK;
  return est < DEPLOY_BLOCK ? DEPLOY_BLOCK : est;
}

async function scanChunks<T>(
  from: bigint,
  to: bigint,
  maxChunks: number,
  fetchChunk: (a: bigint, b: bigint) => Promise<T[]>,
  direction: "backward" | "forward",
  stopWhen?: (acc: T[]) => boolean,
): Promise<{ items: T[]; complete: boolean }> {
  const acc: T[] = [];
  let chunksDone = 0;
  if (direction === "backward") {
    let hi = to;
    while (hi >= from && chunksDone < maxChunks) {
      const lo = hi - CHUNK > from ? hi - CHUNK : from;
      const batch = await fetchChunk(lo, hi);
      acc.push(...batch);
      chunksDone++;
      if (stopWhen?.(acc)) return { items: acc, complete: lo <= from };
      if (lo <= from) return { items: acc, complete: true };
      hi = lo - 1n;
    }
    return { items: acc, complete: false };
  } else {
    let lo = from;
    while (lo <= to && chunksDone < maxChunks) {
      const hi = lo + CHUNK < to ? lo + CHUNK : to;
      const batch = await fetchChunk(lo, hi);
      acc.push(...batch);
      chunksDone++;
      if (stopWhen?.(acc)) return { items: acc, complete: hi >= to };
      if (hi >= to) return { items: acc, complete: true };
      lo = hi + 1n;
    }
    return { items: acc, complete: false };
  }
}

async function attachTimestamps(items: ActivityItem[]): Promise<void> {
  const blocks = Array.from(new Set(items.map((i) => i.blockNumber)));
  const times = new Map<bigint, number>();
  await Promise.all(
    blocks.map(async (bn) => {
      try {
        const b = await client.getBlock({ blockNumber: bn });
        times.set(bn, Number(b.timestamp));
      } catch {
        /* leave undefined */
      }
    }),
  );
  items.forEach((i) => (i.timestamp = times.get(i.blockNumber)));
}

/** Latest activity across the whole contract (homepage ticker). */
export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ["activity", ACTIVE_CHAIN.id, limit],
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async (): Promise<ActivityItem[]> => {
      const latest = await client.getBlockNumber();
      const { items } = await scanChunks<ActivityItem>(
        DEPLOY_BLOCK,
        latest,
        14,
        async (a, b) => {
          const [mints, creates] = await Promise.all([
            client.getLogs({ address: POAP_ADDRESS, event: NEW_MINT, fromBlock: a, toBlock: b }),
            client.getLogs({ address: POAP_ADDRESS, event: NEW_EVENT, fromBlock: a, toBlock: b }),
          ]);
          return [
            ...mints.map((l) => ({
              type: "mint" as const,
              eventId: l.args.eventId!,
              who: l.args.recipient!,
              blockNumber: l.blockNumber,
              txHash: l.transactionHash,
            })),
            ...creates.map((l) => ({
              type: "create" as const,
              eventId: l.args.eventId!,
              who: l.args.creator!,
              name: l.args.name,
              blockNumber: l.blockNumber,
              txHash: l.transactionHash,
            })),
          ];
        },
        "backward",
        (acc) => acc.length >= limit,
      );
      items.sort((x, y) => (y.blockNumber > x.blockNumber ? 1 : -1));
      const top = items.slice(0, limit);
      await attachTimestamps(top);
      return top;
    },
  });
}

export interface CollectorRecord {
  recipient: `0x${string}`;
  blockNumber: bigint;
  txHash: `0x${string}`;
  /** 1-based position in mint order */
  position: number;
}

/** All mint records for one POAP, in order (scans forward from creation). */
export function useCollectors(
  eventId: bigint | undefined,
  createdAt: bigint | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["collectors", ACTIVE_CHAIN.id, eventId?.toString()],
    enabled: enabled && eventId !== undefined && createdAt !== undefined,
    staleTime: 30_000,
    queryFn: async () => {
      const latest = await client.getBlockNumber();
      const nowSec = BigInt(Math.floor(Date.now() / 1000));
      const start = estimateBlock(latest, nowSec, createdAt!);
      const { items, complete } = await scanChunks(
        start,
        latest,
        60,
        async (a, b) =>
          client.getLogs({
            address: POAP_ADDRESS,
            event: NEW_MINT,
            args: { eventId },
            fromBlock: a,
            toBlock: b,
          }),
        "forward",
      );
      const records: CollectorRecord[] = items.map((l, i) => ({
        recipient: l.args.recipient!,
        blockNumber: l.blockNumber,
        txHash: l.transactionHash,
        position: i + 1,
      }));
      return { records, complete };
    },
  });
}

export function relTime(tsSec?: number): string {
  if (!tsSec) return "";
  const s = Math.max(1, Math.floor(Date.now() / 1000 - tsSec));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
