"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import {
  usePoapEvent,
  usePoapMetadata,
  useTotalSupply,
} from "@/lib/hooks";
import {
  creatorWindowEndsAt,
  hasAllowlist,
  isCreatorWindowOpen,
  isSignatureWindowOpen,
  signatureWindowEndsAt,
} from "@/lib/poap";
import { PoapStamp } from "@/components/PoapStamp";
import { SoulboundBadge, StatusBadges } from "@/components/Badges";
import { MintPanel, VerifyLinks } from "@/components/MintPanel";
import {
  formatDate,
  formatDateTime,
  shortAddress,
  timeLeft,
} from "@/lib/format";
import {
  ACTIVE_CHAIN,
  EXPLORER_URL,
  POAP_ADDRESS,
} from "@/lib/contract";
import { composeCast, useMiniApp } from "@/components/MiniAppProvider";

export function PoapDetail({ id }: { id: string }) {
  const eventId = useMemo(() => {
    try {
      return BigInt(id);
    } catch {
      return undefined;
    }
  }, [id]);

  const { event, isLoading, refetch } = usePoapEvent(eventId);
  const { metadata } = usePoapMetadata(eventId);
  const { data: supply, refetch: refetchSupply } = useTotalSupply(eventId);
  const { address } = useAccount();
  const { isMiniApp } = useMiniApp();

  if (eventId === undefined)
    return <NotFound msg="That doesn't look like a valid POAP id." />;
  if (isLoading)
    return (
      <div className="container-page py-16 text-center text-faded">
        Loading POAP from Base…
      </div>
    );
  if (!event) return <NotFound msg={`POAP #${id} doesn't exist (yet).`} />;

  const isCreator =
    address && address.toLowerCase() === event.creator.toLowerCase();
  const multichainId = `eip155:${ACTIVE_CHAIN.id}:${POAP_ADDRESS.toLowerCase()}:${event.id}`;

  return (
    <div className="container-page py-10">
      <Link href="/explore" className="text-sm font-semibold text-faded hover:text-ink">
        ← All POAPs
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[380px,1fr]">
        {/* Left: artwork */}
        <div className="flex flex-col items-center">
          <div className="card flex w-full flex-col items-center p-8">
            <PoapStamp image={metadata?.image} alt={event.name} size="lg" />
            <p className="mt-4 font-mono text-xs text-faded">
              #{event.id.toString()} · {supply?.toString() ?? "…"} minted
            </p>
            <div className="mt-2">
              <SoulboundBadge soulbound={event.isSoulbound} />
            </div>
          </div>
          {isMiniApp && (
            <button
              className="btn-secondary mt-3 w-full"
              onClick={() =>
                composeCast(
                  `Check out the "${event.name}" POAP — mint it right here 👇`,
                  [`${window.location.origin}/poap/${event.id}`],
                )
              }
            >
              Share this POAP as a cast
            </button>
          )}
        </div>

        {/* Right: info + mint */}
        <div className="space-y-5">
          <div>
            <StatusBadges event={event} />
            <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
              {event.name}
            </h1>
            {event.description && (
              <p className="mt-2 max-w-xl leading-relaxed text-faded">
                {event.description}
              </p>
            )}
          </div>

          {isCreator && (
            <div className="card flex flex-wrap items-center justify-between gap-3 border-accent/30 bg-accent/5 p-4">
              <div>
                <p className="text-sm font-bold">You created this POAP</p>
                <p className="text-xs text-faded">
                  {isCreatorWindowOpen(event)
                    ? `Creator controls close ${timeLeft(creatorWindowEndsAt(event)).replace(" left", "")} from now`
                    : "The 30-day creator window has ended"}
                </p>
              </div>
              <Link href={`/poap/${event.id}/manage`} className="btn-primary !py-2">
                Manage distribution
              </Link>
            </div>
          )}

          <MintPanel
            event={event}
            onMinted={() => {
              refetch();
              refetchSupply();
            }}
          />

          {/* Timing */}
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">Timing</h2>
            <div className="mt-3 space-y-2 text-sm">
              <TimeRow
                label="Registered"
                value={formatDateTime(event.createdAt)}
              />
              <TimeRow
                label="Creator controls (public toggle, allowlist, airdrop)"
                value={
                  isCreatorWindowOpen(event)
                    ? `open — ${timeLeft(creatorWindowEndsAt(event))}`
                    : "closed (30 days elapsed)"
                }
                ok={isCreatorWindowOpen(event)}
              />
              <TimeRow
                label="Signature minting"
                value={
                  isSignatureWindowOpen(event)
                    ? `open — ${timeLeft(signatureWindowEndsAt(event))}`
                    : "closed (37 days elapsed)"
                }
                ok={isSignatureWindowOpen(event)}
              />
              <TimeRow
                label="Public / allowlist minting"
                value={
                  event.isPublic || hasAllowlist(event)
                    ? "no deadline — open while enabled"
                    : "not enabled"
                }
                ok={event.isPublic || hasAllowlist(event)}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">
              Onchain metadata
            </h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <MetaRow k="Event date" v={formatDate(event.eventDate)} />
              <MetaRow k="Location" v={event.location || "—"} />
              <MetaRow
                k="Creator"
                v={
                  <a
                    className="font-mono text-accent hover:underline"
                    href={`${EXPLORER_URL}/address/${event.creator}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortAddress(event.creator, 6)}
                  </a>
                }
              />
              <MetaRow
                k="External URL"
                v={
                  event.externalUrl ? (
                    <a
                      className="break-all text-accent hover:underline"
                      href={event.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {event.externalUrl}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <MetaRow
                k="Allowlist"
                v={hasAllowlist(event) ? "configured" : "none"}
              />
              <MetaRow
                k="Soulbound"
                v={event.isSoulbound ? "yes — non-transferable" : "no"}
              />
              <div className="sm:col-span-2">
                <MetaRow
                  k="Multichain ID (CAIP-2)"
                  v={<span className="break-all font-mono text-xs">{multichainId}</span>}
                />
              </div>
            </dl>
            <div className="mt-4 border-t border-line pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-faded">
                Verify onchain
              </p>
              <VerifyLinks eventId={event.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-faded">{label}</span>
      <span
        className={`text-right font-semibold ${
          ok === undefined ? "" : ok ? "text-mint" : "text-faded"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function MetaRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-faded">
        {k}
      </dt>
      <dd className="mt-0.5">{v}</dd>
    </div>
  );
}

function NotFound({ msg }: { msg: string }) {
  return (
    <div className="container-page py-20 text-center">
      <p className="font-display text-2xl font-bold">Hmm.</p>
      <p className="mt-2 text-faded">{msg}</p>
      <Link href="/explore" className="btn-primary mt-6">
        Explore POAPs
      </Link>
    </div>
  );
}
