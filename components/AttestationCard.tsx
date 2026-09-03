"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { PoapStamp } from "@/components/PoapStamp";
import { formatDate } from "@/lib/format";
import { downloadAttestationReceipt, printAttestationReceipt } from "@/lib/receipt";
import { ACTIVE_CHAIN, EXPLORER_URL, POAP_ADDRESS } from "@/lib/contract";
import type { PoapEvent } from "@/lib/poap";
import type { PoapMetadata } from "@/lib/poap";

/**
 * "Pics or it didn't happen." — a frameable proof of attendance for this
 * specific collector: wallet + collector # + event + mint tx + verify QR.
 */
export function AttestationCard({
  event,
  metadata,
  collectorNo,
  txHash,
  supply,
}: {
  event: PoapEvent;
  metadata: PoapMetadata | null;
  collectorNo?: string;
  txHash?: string;
  supply?: bigint;
}) {
  const { address } = useAccount();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!address) return null;

  const verifyUrl = `${window.location.origin}/verify`;

  const data = {
    title: "ONCHAIN POAP · PROOF OF ATTENDANCE",
    eventName: event.name,
    eventId: event.id.toString(),
    wallet: address,
    collectorNo,
    dateStr: formatDate(event.eventDate || event.createdAt),
    location: event.location || undefined,
    txHash,
    baseUrl: verifyUrl,
    chainLabel: ACTIVE_CHAIN.name,
    contract: POAP_ADDRESS,
  };

  const run = async (kind: "dl" | "print") => {
    setBusy(kind);
    setErr(null);
    try {
      if (kind === "dl") await downloadAttestationReceipt(data);
      else await printAttestationReceipt(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't render the receipt.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="card row-span-2 flex flex-col items-center p-6 text-center">
      <PoapStamp image={metadata?.image} alt={event.name} size="sm" sealed={event.isSoulbound} />
      <h2 className="mt-3 font-display text-lg font-bold">Proof of attendance</h2>
      <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-faded">
        Grab a frameable one-page receipt — wallet, collector #{collectorNo ?? "—"}, the mint
        transaction and a QR anyone can scan to verify it onchain. This is your
        “pics or it didn’t happen.”
      </p>

      {collectorNo && (
        <p className="mt-3 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-xs font-bold text-gold">
          COLLECTOR #{collectorNo}
        </p>
      )}
      <p className="mt-2 font-mono text-[11px] text-faded">
        {supply?.toString() ?? "…"} minted on {ACTIVE_CHAIN.name}
      </p>

      <div className="mt-4 flex w-full flex-col gap-2">
        <button className="btn-primary w-full" disabled={!!busy} onClick={() => run("dl")}>
          {busy === "dl" ? "Rendering…" : "⬇ Download receipt"}
        </button>
        <button className="btn-secondary w-full" disabled={!!busy} onClick={() => run("print")}>
          {busy === "print" ? "Rendering…" : "🖨 Print / share"}
        </button>
      </div>

      {err && <p className="mt-2 text-xs text-accent">{err}</p>}

      {txHash && (
        <a
          href={`${EXPLORER_URL}/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 font-mono text-[11px] text-accent hover:underline"
        >
          {txHash.slice(0, 10)}…{txHash.slice(-6)} on explorer ↗
        </a>
      )}
    </div>
  );
}
