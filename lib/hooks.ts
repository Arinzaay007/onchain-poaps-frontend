"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { POAP_ABI, POAP_ADDRESS, ACTIVE_CHAIN } from "./contract";
import {
  parseEvent,
  parseTokenUri,
  type PoapEvent,
  type PoapMetadata,
  type RawEventTuple,
} from "./poap";

const contract = {
  abi: POAP_ABI,
  address: POAP_ADDRESS,
  chainId: ACTIVE_CHAIN.id,
} as const;

export function useTotalEvents() {
  return useReadContract({
    ...contract,
    functionName: "totalEvents",
    query: { refetchInterval: 30_000 },
  });
}

export function usePoapEvent(id: bigint | undefined) {
  const res = useReadContract({
    ...contract,
    functionName: "events",
    args: id !== undefined ? [id] : undefined,
    query: { enabled: id !== undefined },
  });
  const event: PoapEvent | undefined = useMemo(() => {
    if (!res.data || id === undefined) return undefined;
    const e = parseEvent(id, res.data as RawEventTuple);
    // empty creator == nonexistent event
    if (e.creator === "0x0000000000000000000000000000000000000000") return undefined;
    return e;
  }, [res.data, id]);
  return { ...res, event };
}

export function usePoapMetadata(id: bigint | undefined) {
  const res = useReadContract({
    ...contract,
    functionName: "uri",
    args: id !== undefined ? [id] : undefined,
    query: { enabled: id !== undefined, staleTime: 60_000 },
  });
  const metadata: PoapMetadata | null = useMemo(
    () => (res.data ? parseTokenUri(res.data as string) : null),
    [res.data],
  );
  return { ...res, metadata };
}

export function useHasClaimed(id: bigint | undefined, account?: `0x${string}`) {
  return useReadContract({
    ...contract,
    functionName: "hasClaimed",
    args: id !== undefined && account ? [id, account] : undefined,
    query: { enabled: id !== undefined && !!account },
  });
}

export function useTotalSupply(id: bigint | undefined) {
  return useReadContract({
    ...contract,
    functionName: "totalSupply",
    args: id !== undefined ? [id] : undefined,
    query: { enabled: id !== undefined },
  });
}

export interface PoapListItem {
  event: PoapEvent;
  metadata: PoapMetadata | null;
  supply: bigint;
}

/** Batch-load a page of POAPs (newest first). */
export function usePoapList(ids: bigint[]) {
  const reads = useReadContracts({
    contracts: ids.flatMap((id) => [
      { ...contract, functionName: "events", args: [id] } as const,
      { ...contract, functionName: "uri", args: [id] } as const,
      { ...contract, functionName: "totalSupply", args: [id] } as const,
    ]),
    query: { enabled: ids.length > 0 },
  });

  const items: PoapListItem[] = useMemo(() => {
    if (!reads.data) return [];
    const out: PoapListItem[] = [];
    ids.forEach((id, i) => {
      const ev = reads.data![i * 3];
      const uri = reads.data![i * 3 + 1];
      const sup = reads.data![i * 3 + 2];
      if (ev.status !== "success") return;
      const event = parseEvent(id, ev.result as RawEventTuple);
      out.push({
        event,
        metadata:
          uri.status === "success" ? parseTokenUri(uri.result as string) : null,
        supply: sup.status === "success" ? (sup.result as bigint) : 0n,
      });
    });
    return out;
  }, [reads.data, ids]);

  return { ...reads, items };
}

/** Which of `ids` does `account` own? (balanceOf batch) */
export function useOwnedIds(ids: bigint[], account?: `0x${string}`) {
  const reads = useReadContracts({
    contracts: account
      ? ids.map(
          (id) =>
            ({
              ...contract,
              functionName: "balanceOf",
              args: [account, id],
            }) as const,
        )
      : [],
    query: { enabled: !!account && ids.length > 0 },
  });
  const owned = useMemo(() => {
    if (!reads.data || !account) return [] as bigint[];
    return ids.filter(
      (_, i) =>
        reads.data![i].status === "success" &&
        (reads.data![i].result as bigint) > 0n,
    );
  }, [reads.data, ids, account]);
  return { ...reads, owned };
}
