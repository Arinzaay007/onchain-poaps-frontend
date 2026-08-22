"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { decodeClaimPayload, type ClaimPayload } from "@/lib/signature";
import { usePoapEvent, usePoapMetadata, useHasClaimed } from "@/lib/hooks";
import { PoapStamp } from "@/components/PoapStamp";
import { SoulboundBadge } from "@/components/Badges";
import { VerifyLinks } from "@/components/MintPanel";
import { useTx } from "@/lib/useTx";
import { POAP_ABI, POAP_ADDRESS, ACTIVE_CHAIN } from "@/lib/contract";
import { formatDate, shortAddress } from "@/lib/format";
import { useMiniApp, composeCast } from "@/components/MiniAppProvider";
import { isSignatureWindowOpen, signatureWindowEndsAt } from "@/lib/poap";
import { timeLeft } from "@/lib/format";
import { WaxSeal } from "@/components/WaxSeal";
import { MintSlam } from "@/components/MintSlam";
import { downloadTicketStub } from "@/lib/stub";
import { useTotalSupply } from "@/lib/hooks";

export default function ClaimPage() {
  return (
    <Suspense>
      <ClaimInner />
    </Suspense>
  );
}

function ClaimInner() {
  const [payload, setPayload] = useState<ClaimPayload | null | "invalid">(null);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return setPayload("invalid");
    const p = decodeClaimPayload(hash);
    setPayload(p ?? "invalid");
  }, []);

  if (payload === null)
    return <div className="container-page py-16 text-center text-faded">Reading claim…</div>;

  if (payload === "invalid")
    return (
      <div className="container-page max-w-lg py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Invalid claim link</h1>
        <p className="mt-2 text-sm text-faded">
          This link is missing or malformed claim data. Ask the POAP creator
          for a fresh link, or browse open mints instead.
        </p>
        <Link href="/explore" className="btn-primary mt-6">
          Explore POAPs
        </Link>
      </div>
    );

  return <ClaimBody payload={payload} />;
}

function ClaimBody({ payload }: { payload: ClaimPayload }) {
  const eventId = useMemo(() => BigInt(payload.eventId), [payload.eventId]);
  const { event, isLoading } = usePoapEvent(eventId);
  const { metadata } = usePoapMetadata(eventId);
  const { address, isConnected } = useAccount();
  const claimed = useHasClaimed(eventId, address);
  const { data: supply, refetch: refetchSupply } = useTotalSupply(eventId);
  const tx = useTx();
  const { isMiniApp } = useMiniApp();
  const { openConnectModal } = useConnectModal();
  const { connect, connectors } = useConnect();

  if (isLoading)
    return <div className="container-page py-16 text-center text-faded">Loading POAP…</div>;
  if (!event)
    return (
      <div className="container-page py-16 text-center text-faded">
        POAP #{payload.eventId} not found on {ACTIVE_CHAIN.name}.
      </div>
    );

  const wrongChain = payload.chainId !== ACTIVE_CHAIN.id;
  const isSig = payload.t === "sig";
  const sigExpired = isSig && !isSignatureWindowOpen(event);
  const wrongWallet =
    isConnected &&
    payload.recipient &&
    address?.toLowerCase() !== payload.recipient.toLowerCase();

  const connectNow = () => {
    if (isMiniApp) {
      const fc = connectors.find((c) => c.id === "farcaster");
      if (fc) connect({ connector: fc });
    } else openConnectModal?.();
  };

  const mint = async () => {
    if (isSig) {
      await tx.send({
        abi: POAP_ABI,
        address: POAP_ADDRESS,
        functionName: "mintWithSignature",
        args: [eventId, payload.signature!],
      });
    } else {
      await tx.send({
        abi: POAP_ABI,
        address: POAP_ADDRESS,
        functionName: "allowlistMint",
        args: [eventId, payload.proof ?? []],
      });
    }
    refetchSupply();
  };

  const isYours = !!claimed.data || tx.status === "success";

  return (
    <div className="container-page max-w-xl py-12 text-center">
      <MintSlam show={tx.status === "success"} />
      <p className="text-xs font-bold uppercase tracking-widest text-accent">
        You&rsquo;ve been invited to claim
      </p>
      <div className="card mt-4 flex flex-col items-center p-8">
        <div className="relative">
          <PoapStamp
            image={metadata?.image}
            alt={event.name}
            size="lg"
            stamped={isYours}
          />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
            <WaxSeal state={isYours ? "broken" : "sealed"} size={84} />
          </div>
        </div>
        <h1 className="mt-12 font-display text-3xl font-black">{event.name}</h1>
        {event.description && (
          <p className="mt-2 text-sm leading-relaxed text-faded">{event.description}</p>
        )}
        <p className="mt-2 text-xs text-faded">
          {formatDate(event.eventDate || event.createdAt)}
          {event.location && ` · ${event.location}`} · by {shortAddress(event.creator)}
        </p>
        <div className="mt-2">
          <SoulboundBadge soulbound={event.isSoulbound} />
        </div>

        <div className="mt-6 w-full">
          {isYours ? (
            <div className="animate-fadeUp">
              <p className="font-display text-xl font-bold text-mint">
                🎉 This POAP is yours!
              </p>
              <VerifyLinks eventId={eventId} hash={tx.hash} />
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Link href="/gallery" className="btn-secondary !py-2 text-xs">
                  View my collection
                </Link>
                <button
                  className="btn-secondary !py-2 text-xs"
                  onClick={() =>
                    downloadTicketStub({
                      name: event.name,
                      dateStr: formatDate(event.eventDate || event.createdAt),
                      location: event.location || undefined,
                      image: metadata?.image,
                      collectorNo: supply && supply > 0n ? supply.toString() : undefined,
                      address: address ?? "",
                      verifyUrl: `${window.location.origin}/verify?id=${eventId}&addr=${address}`,
                      eventId: eventId.toString(),
                    })
                  }
                >
                  🎟️ Ticket stub
                </button>
                {isMiniApp && (
                  <button
                    className="btn-primary !py-2 text-xs"
                    onClick={() =>
                      composeCast(
                        `Just claimed the "${event.name}" POAP — fully onchain on Base 🪙`,
                        [`${window.location.origin}/poap/${event.id}`],
                      )
                    }
                  >
                    Share as cast
                  </button>
                )}
              </div>
            </div>
          ) : wrongChain ? (
            <Notice tone="err">
              This claim was issued for chain {payload.chainId}, but this app is
              connected to {ACTIVE_CHAIN.name} ({ACTIVE_CHAIN.id}).
            </Notice>
          ) : sigExpired ? (
            <Notice tone="err">
              The signature-minting window (37 days after registration) has
              ended for this POAP.
            </Notice>
          ) : !isConnected ? (
            <>
              {payload.recipient && (
                <p className="mb-2 text-xs text-faded">
                  Reserved for{" "}
                  <span className="font-mono">{shortAddress(payload.recipient, 6)}</span>
                </p>
              )}
              <button className="btn-primary w-full" onClick={connectNow}>
                Connect wallet to claim
              </button>
            </>
          ) : wrongWallet ? (
            <Notice tone="warn">
              This claim is reserved for{" "}
              <span className="font-mono">{shortAddress(payload.recipient!, 6)}</span>, but
              you&rsquo;re connected as{" "}
              <span className="font-mono">{shortAddress(address!, 6)}</span>. Switch
              wallets to claim it.
            </Notice>
          ) : (
            <>
              <button className="btn-primary w-full !py-3" disabled={tx.busy} onClick={mint}>
                {tx.status === "wallet"
                  ? "Confirm in wallet…"
                  : tx.status === "pending"
                    ? "Minting…"
                    : "Claim my POAP — free + gas"}
              </button>
              {isSig && (
                <p className="mt-2 text-[11px] text-faded">
                  Signature mint · window closes {timeLeft(signatureWindowEndsAt(event)).replace(" left", "")} from now
                </p>
              )}
            </>
          )}
          {tx.error && (
            <p className="mt-3 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accentdark">
              {tx.error}
            </p>
          )}
        </div>
      </div>
      <Link
        href={`/poap/${event.id}`}
        className="mt-4 inline-block text-sm font-semibold text-faded hover:text-ink"
      >
        View full POAP details →
      </Link>
    </div>
  );
}

function Notice({ tone, children }: { tone: "warn" | "err"; children: React.ReactNode }) {
  return (
    <p
      className={`rounded-xl border px-3 py-2.5 text-sm leading-relaxed ${
        tone === "warn"
          ? "border-gold/40 bg-gold/10 text-ink"
          : "border-accent/30 bg-accent/5 text-accentdark"
      }`}
    >
      {children}
    </p>
  );
}
