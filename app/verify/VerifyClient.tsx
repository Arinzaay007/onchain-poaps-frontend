"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isAddress, getAddress, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { useReadContracts } from "wagmi";
import { useTotalEvents, usePoapList, usePoapMetadata } from "@/lib/hooks";
import { useCollectors } from "@/lib/activity";
import { PoapStamp } from "@/components/PoapStamp";
import { SoulboundBadge } from "@/components/Badges";
import {
  POAP_ABI,
  POAP_ADDRESS,
  ACTIVE_CHAIN,
  EXPLORER_URL,
  OPENSEA_ASSET_URL,
} from "@/lib/contract";
import { copyToClipboard, formatDateTime, shortAddress } from "@/lib/format";

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http("https://cloudflare-eth.com"),
});

export function VerifyClient() {
  const params = useSearchParams();
  const { data: total } = useTotalEvents();

  const allIds = useMemo(() => {
    if (total === undefined) return [] as bigint[];
    const ids: bigint[] = [];
    for (let i = 0n; i <= total; i++) ids.push(i);
    return ids;
  }, [total]);
  const { items } = usePoapList(allIds);

  const [input, setInput] = useState(params.get("addr") ?? "");
  const [selected, setSelected] = useState<string>(params.get("id") ?? "");
  const [resolved, setResolved] = useState<`0x${string}` | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);

  // auto-run when arriving via a share link
  useEffect(() => {
    if (params.get("addr") && params.get("id")) run(params.get("addr")!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (raw?: string) => {
    const value = (raw ?? input).trim();
    setError(null);
    setChecked(false);
    setResolved(null);
    if (!selected) return setError("Pick a POAP to check against.");
    if (isAddress(value)) {
      setResolved(getAddress(value));
      setChecked(true);
      return;
    }
    if (value.toLowerCase().endsWith(".eth")) {
      setResolving(true);
      try {
        const addr = await ensClient.getEnsAddress({ name: normalize(value) });
        if (!addr) throw new Error();
        setResolved(addr);
        setChecked(true);
      } catch {
        setError(`Couldn't resolve ${value} — try the raw 0x address.`);
      } finally {
        setResolving(false);
      }
      return;
    }
    setError("Enter a wallet address (0x…) or an ENS name (name.eth).");
  };

  const eventId = selected ? BigInt(selected) : undefined;
  const selectedItem = items.find((i) => i.event.id.toString() === selected);

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="font-display text-3xl font-black">Verify attendance</h1>
      <p className="mt-1 text-sm text-faded">
        Did a wallet really earn a POAP? Check it against the chain — no trust
        in this app required, every result links to the raw onchain receipt.
      </p>

      <div className="card mt-6 p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
          <div className="space-y-3">
            <div>
              <label className="label">POAP</label>
              <select
                className="input"
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setChecked(false);
                }}
              >
                <option value="">Select a POAP…</option>
                {items.map((i) => (
                  <option key={i.event.id.toString()} value={i.event.id.toString()}>
                    #{i.event.id.toString()} — {i.event.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Wallet address or ENS</label>
              <input
                className="input font-mono text-sm"
                placeholder="0x… or vitalik.eth"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setChecked(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && run()}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full sm:w-auto" onClick={() => run()} disabled={resolving}>
              {resolving ? "Resolving ENS…" : "Check ✓"}
            </button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-accentdark">{error}</p>}
      </div>

      {checked && resolved && eventId !== undefined && selectedItem && (
        <Result
          key={`${resolved}-${selected}`}
          address={resolved}
          eventId={eventId}
          item={selectedItem}
          onCopyLink={async () => {
            const url = `${window.location.origin}/verify?id=${selected}&addr=${resolved}`;
            if (await copyToClipboard(url)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          copied={copied}
        />
      )}
    </div>
  );
}

function Result({
  address,
  eventId,
  item,
  onCopyLink,
  copied,
}: {
  address: `0x${string}`;
  eventId: bigint;
  item: ReturnType<typeof usePoapList>["items"][number];
  onCopyLink: () => void;
  copied: boolean;
}) {
  const reads = useReadContracts({
    contracts: [
      {
        abi: POAP_ABI,
        address: POAP_ADDRESS,
        chainId: ACTIVE_CHAIN.id,
        functionName: "balanceOf",
        args: [address, eventId],
      },
      {
        abi: POAP_ABI,
        address: POAP_ADDRESS,
        chainId: ACTIVE_CHAIN.id,
        functionName: "hasClaimed",
        args: [eventId, address],
      },
    ],
  });
  const { metadata } = usePoapMetadata(eventId);
  const { data: collectors } = useCollectors(eventId, item.event.createdAt);

  if (reads.isLoading)
    return <p className="mt-6 text-center text-sm text-faded">Checking the chain…</p>;

  const balance = (reads.data?.[0]?.result as bigint | undefined) ?? 0n;
  const claimed = (reads.data?.[1]?.result as boolean | undefined) ?? false;
  const holds = balance > 0n;
  const record = collectors?.records.find(
    (r) => r.recipient.toLowerCase() === address.toLowerCase(),
  );

  return (
    <div className="card mt-6 overflow-hidden p-6 text-center animate-fadeUp">
      <div className="relative inline-block">
        <PoapStamp image={metadata?.image} alt={item.event.name} size="md" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            className={`animate-stampIn rounded border-4 px-3 py-1 font-display text-lg font-black uppercase tracking-widest ${
              holds || claimed
                ? "border-mint/80 text-mint"
                : "border-accent/70 text-accent/80"
            }`}
            style={{ transform: "rotate(-8deg)", background: "rgba(255,255,255,.75)" }}
          >
            {holds || claimed ? "Verified" : "No record"}
          </span>
        </div>
      </div>

      <h2 className="mt-3 font-display text-2xl font-black">{item.event.name}</h2>
      <p className="mt-1 font-mono text-sm text-faded">{shortAddress(address, 8)}</p>

      {holds || claimed ? (
        <div className="mx-auto mt-4 max-w-md space-y-2 text-left text-sm">
          <Row k="Holds the POAP now" v={holds ? "yes (balance 1)" : "no — minted but transferred away"} good={holds} />
          <Row k="Minted it (hasClaimed)" v={claimed ? "yes" : "no — received via transfer"} good={claimed} />
          {record && (
            <>
              <Row k="Collector number" v={`#${record.position}`} good />
              <Row
                k="Mint receipt"
                v={
                  <a
                    className="font-semibold text-accent hover:underline"
                    href={`${EXPLORER_URL}/tx/${record.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    tx {record.txHash.slice(0, 10)}… ↗
                  </a>
                }
                good
              />
              <Row k="Mint block" v={record.blockNumber.toString()} good />
            </>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-line pt-2">
            <SoulboundBadge soulbound={item.event.isSoulbound} />
            <div className="flex gap-3 text-xs font-semibold">
              <a className="text-accent hover:underline" href={OPENSEA_ASSET_URL(eventId)} target="_blank" rel="noreferrer">
                OpenSea ↗
              </a>
              <a className="text-accent hover:underline" href={`${EXPLORER_URL}/token/${POAP_ADDRESS}?a=${address}`} target="_blank" rel="noreferrer">
                BaseScan ↗
              </a>
            </div>
          </div>
          <p className="text-xs text-faded">
            Event: {formatDateTime(item.event.eventDate || item.event.createdAt)}
            {item.event.location ? ` · ${item.event.location}` : ""}
          </p>
        </div>
      ) : (
        <p className="mx-auto mt-4 max-w-md text-sm text-faded">
          This wallet has never minted &ldquo;{item.event.name}&rdquo; and
          doesn&rsquo;t hold it. If they should have it,{" "}
          <Link href={`/poap/${eventId}`} className="font-semibold text-accent hover:underline">
            the mint page is here
          </Link>
          .
        </p>
      )}

      <button className="btn-secondary mt-5 !py-2 text-xs" onClick={onCopyLink}>
        {copied ? "✓ Copied" : "Copy shareable verification link"}
      </button>
    </div>
  );
}

function Row({ k, v, good }: { k: string; v: React.ReactNode; good?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-faded">{k}</span>
      <span className={`text-right font-semibold ${good ? "text-mint" : ""}`}>{v}</span>
    </div>
  );
}
