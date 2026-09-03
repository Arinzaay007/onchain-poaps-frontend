"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import QRCode from "qrcode";
import { usePoapEvent, usePoapMetadata, useTotalSupply } from "@/lib/hooks";
import { useTx } from "@/lib/useTx";
import {
  POAP_ABI,
  POAP_ADDRESS,
  ACTIVE_CHAIN,
  LIMITS,
} from "@/lib/contract";
import {
  creatorWindowEndsAt,
  hasAllowlist,
  isCreatorWindowOpen,
  isSignatureWindowOpen,
  signatureWindowEndsAt,
  type PoapEvent,
} from "@/lib/poap";
import {
  parseAddressList,
  buildAllowlist,
  makeProofsFile,
} from "@/lib/merkle";
import {
  signatureDigest,
  claimUrl,
  type ClaimPayload,
  type SignaturesFile,
} from "@/lib/signature";
import {
  copyToClipboard,
  downloadJson,
  downloadText,
  timeLeft,
} from "@/lib/format";
import { PoapStamp } from "@/components/PoapStamp";
import { getAddress } from "viem";

export function ManageClient({ id }: { id: string }) {
  const eventId = useMemo(() => {
    try {
      return BigInt(id);
    } catch {
      return undefined;
    }
  }, [id]);
  const { event, isLoading, refetch } = usePoapEvent(eventId);
  const { metadata } = usePoapMetadata(eventId);
  const { data: supply } = useTotalSupply(eventId);
  const { address, isConnected } = useAccount();

  if (isLoading || eventId === undefined)
    return <div className="container-page py-16 text-center text-faded">Loading…</div>;
  if (!event)
    return (
      <div className="container-page py-16 text-center text-faded">
        POAP #{id} not found.
      </div>
    );

  const isCreator =
    isConnected && address?.toLowerCase() === event.creator.toLowerCase();

  if (!isCreator) {
    return (
      <div className="container-page max-w-xl py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Creator only</h1>
        <p className="mt-2 text-sm text-faded">
          Connect the wallet that created this POAP ({event.creator}) to manage
          its distribution.
        </p>
        <Link href={`/poap/${id}`} className="btn-secondary mt-6">
          ← Back to POAP
        </Link>
      </div>
    );
  }

  const windowOpen = isCreatorWindowOpen(event);
  const sigOpen = isSignatureWindowOpen(event);

  return (
    <div className="container-page max-w-3xl py-10">
      <Link href={`/poap/${id}`} className="text-sm font-semibold text-faded hover:text-ink">
        ← Back to POAP
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <PoapStamp image={metadata?.image} alt={event.name} size="sm" />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black">{event.name}</h1>
          <p className="text-sm text-faded">
            #{id} · {supply?.toString() ?? "…"} minted ·{" "}
            {windowOpen ? (
              <span className="font-semibold text-mint">
                creator controls {timeLeft(creatorWindowEndsAt(event))}
              </span>
            ) : (
              <span className="font-semibold text-accentdark">
                creator window closed
              </span>
            )}
          </p>
        </div>
        <Link
          href={`/poap/${id}/kiosk`}
          className="btn-primary shrink-0 !py-2 !text-sm"
          title="Open the fullscreen live-event sign-and-show-QR screen"
        >
          Launch kiosk
        </Link>
      </div>

      {!windowOpen && (
        <div className="card mt-5 border-gold/40 bg-gold/10 p-4 text-sm leading-relaxed">
          The 30-day creator window has ended: public-mint toggle, allowlist and
          airdrop are now locked forever.{" "}
          {sigOpen && (
            <>Signature minting is still open {timeLeft(signatureWindowEndsAt(event))}.</>
          )}
        </div>
      )}

      <div className="mt-6 space-y-5">
        <PublicToggleSection event={event} disabled={!windowOpen} onDone={refetch} />
        <AllowlistSection event={event} disabled={!windowOpen} onDone={refetch} />
        <SignatureSection event={event} disabled={!sigOpen} />
        <AirdropSection event={event} disabled={!windowOpen} />
      </div>
    </div>
  );
}

/* ================= Public mint ================= */

function PublicToggleSection({
  event,
  disabled,
  onDone,
}: {
  event: PoapEvent;
  disabled: boolean;
  onDone: () => void;
}) {
  const tx = useTx();
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold">Public mint</h2>
          <p className="mt-0.5 text-sm text-faded">
            {event.isPublic
              ? "Currently OPEN — anyone can mint (1 per wallet)."
              : "Currently CLOSED — only allowlist, signature or airdrop minting works."}
          </p>
        </div>
        <span
          className={`badge ${event.isPublic ? "border border-mint/40 bg-mint/10 text-mint" : "border border-line bg-parchment text-faded"}`}
        >
          {event.isPublic ? "OPEN" : "CLOSED"}
        </span>
      </div>
      <button
        className={event.isPublic ? "btn-secondary mt-3" : "btn-primary mt-3"}
        disabled={disabled || tx.busy}
        onClick={async () => {
          await tx.send({
            abi: POAP_ABI,
            address: POAP_ADDRESS,
            functionName: "updateEventPublic",
            args: [event.id, !event.isPublic],
          });
          onDone();
        }}
      >
        {tx.busy
          ? "Updating…"
          : event.isPublic
            ? "Close public minting"
            : "Open public minting"}
      </button>
      {tx.error && <TxError msg={tx.error} />}
      {disabled && (
        <p className="mt-2 text-xs text-faded">
          Locked — the 30-day creator window has ended.
        </p>
      )}
    </section>
  );
}

/* ================= Allowlist ================= */

function AllowlistSection({
  event,
  disabled,
  onDone,
}: {
  event: PoapEvent;
  disabled: boolean;
  onDone: () => void;
}) {
  const tx = useTx();
  const [input, setInput] = useState("");
  const parsed = useMemo(() => parseAddressList(input), [input]);
  const built = useMemo(() => {
    if (parsed.valid.length === 0) return null;
    try {
      return buildAllowlist(parsed.valid);
    } catch {
      return null;
    }
  }, [parsed]);
  const [confirmed, setConfirmed] = useState(false);
  const alreadySet = hasAllowlist(event);

  return (
    <section className="card p-5">
      <h2 className="font-display text-lg font-bold">Allowlist</h2>

      {alreadySet ? (
        <div className="mt-2 space-y-3">
          <p className="text-sm text-faded">
            ✓ Allowlist is configured. The root is permanent:
          </p>
          <p className="break-all rounded-lg bg-parchment px-3 py-2 font-mono text-xs">
            {event.allowlistRoot}
          </p>
          <RegenerateProofs event={event} />
        </div>
      ) : (
        <div className="mt-2 space-y-3">
          <p className="text-sm leading-relaxed text-faded">
            Paste wallet addresses; we build a Merkle tree and store only its
            root onchain. <b>This can be done exactly once</b> — the list can
            never be changed afterwards, so double-check it. After setting the
            root you&rsquo;ll download a <code className="font-mono text-xs">proofs.json</code>{" "}
            that minters need — <b>keep it safe and share it</b> (the chain
            stores only the root, not the addresses).
          </p>
          <textarea
            className="input min-h-32 font-mono text-xs"
            placeholder={"0xabc…\n0xdef…\none address per line, commas fine, any size list"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
          />
          {input.trim() && (
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-mint">
                ✓ {parsed.valid.length} valid
                {parsed.duplicates > 0 && ` · ${parsed.duplicates} duplicates removed`}
              </p>
              {parsed.invalid.length > 0 && (
                <p className="text-accentdark">
                  ✕ invalid: {parsed.invalid.slice(0, 3).join(", ")}
                  {parsed.invalid.length > 3 && ` +${parsed.invalid.length - 3} more`}
                </p>
              )}
              {built && (
                <p className="break-all font-mono text-faded">root: {built.root}</p>
              )}
            </div>
          )}
          {built && parsed.invalid.length === 0 && (
            <>
              <label className="flex items-start gap-2 text-xs leading-relaxed">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I understand the allowlist is <b>permanent</b> and can only be
                set once. I have verified all {built.addresses.length} addresses.
              </label>
              <button
                className="btn-primary"
                disabled={disabled || !confirmed || tx.busy}
                onClick={async () => {
                  const h = await tx.send({
                    abi: POAP_ABI,
                    address: POAP_ADDRESS,
                    functionName: "updateAllowlistRoot",
                    args: [event.id, built.root],
                  });
                  if (h) {
                    downloadJson(
                      `poap-${event.id}-allowlist-proofs.json`,
                      makeProofsFile(built, ACTIVE_CHAIN.id, POAP_ADDRESS, event.id),
                    );
                    onDone();
                  }
                }}
              >
                {tx.busy ? "Setting root…" : "Set allowlist onchain"}
              </button>
            </>
          )}
          {tx.error && <TxError msg={tx.error} />}
        </div>
      )}
    </section>
  );
}

/** After the root is set (maybe in a previous session), rebuild proofs & claim links from the original list. */
function RegenerateProofs({ event }: { event: PoapEvent }) {
  const [input, setInput] = useState("");
  const [links, setLinks] = useState<{ addr: string; url: string }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-line bg-white/60 p-4">
      <p className="text-sm font-bold">Proofs &amp; claim links</p>
      <p className="mt-0.5 text-xs text-faded">
        Paste the same address list you used to create the allowlist and we
        rebuild the proofs file plus one-tap claim links (each contains the
        wallet&rsquo;s proof — perfect for DMs or QR codes).
      </p>
      <textarea
        className="input mt-2 min-h-24 font-mono text-xs"
        placeholder="Original allowlist addresses…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          className="btn-secondary !py-2 text-xs"
          onClick={() => {
            setErr(null);
            setLinks(null);
            const parsed = parseAddressList(input);
            if (parsed.valid.length === 0) return setErr("No valid addresses.");
            const built = buildAllowlist(parsed.valid);
            if (built.root.toLowerCase() !== event.allowlistRoot.toLowerCase()) {
              return setErr(
                "This list does NOT match the onchain root — it must be exactly the same set of addresses.",
              );
            }
            downloadJson(
              `poap-${event.id}-allowlist-proofs.json`,
              makeProofsFile(built, ACTIVE_CHAIN.id, POAP_ADDRESS, event.id),
            );
            setLinks(
              built.addresses.map((addr) => ({
                addr,
                url: claimUrl(window.location.origin, {
                  v: 1,
                  t: "proof",
                  eventId: event.id.toString(),
                  chainId: ACTIVE_CHAIN.id,
                  recipient: addr,
                  proof: built.proofs[addr],
                }),
              })),
            );
          }}
        >
          Verify list &amp; generate
        </button>
        {links && (
          <button
            className="btn-secondary !py-2 text-xs"
            onClick={() =>
              downloadText(
                `poap-${event.id}-claim-links.csv`,
                "address,claim_url\n" + links.map((l) => `${l.addr},${l.url}`).join("\n"),
                "text/csv",
              )
            }
          >
            Download claim-links CSV
          </button>
        )}
      </div>
      {err && <p className="mt-2 text-xs text-accentdark">{err}</p>}
      {links && (
        <p className="mt-2 text-xs font-semibold text-mint">
          ✓ Root matches. proofs.json downloaded · {links.length} claim links ready.
        </p>
      )}
    </div>
  );
}

/* ================= Signatures ================= */

function SignatureSection({ event, disabled }: { event: PoapEvent; disabled: boolean }) {
  const { signMessageAsync } = useSignMessage();
  const [mode, setMode] = useState<"live" | "batch">("live");

  // live mode
  const [liveAddr, setLiveAddr] = useState("");
  const [liveQr, setLiveQr] = useState<string | null>(null);
  const [liveLink, setLiveLink] = useState<string | null>(null);
  const [liveBusy, setLiveBusy] = useState(false);
  const [liveErr, setLiveErr] = useState<string | null>(null);

  // batch mode
  const [batchInput, setBatchInput] = useState("");
  const [batchProgress, setBatchProgress] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<SignaturesFile | null>(null);

  const signFor = async (recipient: `0x${string}`) => {
    const digest = signatureDigest(event.id, BigInt(ACTIVE_CHAIN.id), recipient);
    const signature = await signMessageAsync({ message: { raw: digest } });
    const payload: ClaimPayload = {
      v: 1,
      t: "sig",
      eventId: event.id.toString(),
      chainId: ACTIVE_CHAIN.id,
      recipient,
      signature,
    };
    return { signature, url: claimUrl(window.location.origin, payload) };
  };

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Signature minting</h2>
        <span
          className={`badge ${disabled ? "border border-line bg-parchment text-faded" : "border border-stamp/30 bg-stamp/10 text-stamp"}`}
        >
          {disabled ? "window closed" : timeLeft(signatureWindowEndsAt(event))}
        </span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-faded">
        Sign a message authorizing a specific wallet to mint — no gas for you,
        works even with public mint closed. Each signature becomes a{" "}
        <b>claim link / QR code</b> the recipient just opens and taps.
      </p>

      <div className="mt-3 flex gap-2">
        <button
          className={mode === "live" ? "btn-primary !py-1.5 text-xs" : "btn-secondary !py-1.5 text-xs"}
          onClick={() => setMode("live")}
        >
          Live event mode
        </button>
        <button
          className={mode === "batch" ? "btn-primary !py-1.5 text-xs" : "btn-secondary !py-1.5 text-xs"}
          onClick={() => setMode("batch")}
        >
          Batch signing
        </button>
      </div>

      {mode === "live" && (
        <div className="mt-4 space-y-3">
          <p className="text-xs leading-relaxed text-faded">
            At your booth or check-in desk: ask the attendee for their wallet
            address (they can show it as a QR in any wallet app), sign it, and a
            claim QR appears — they scan it and mint on their own phone.
          </p>
          <div className="flex gap-2">
            <input
              className="input font-mono text-xs"
              placeholder="Attendee wallet address 0x…"
              value={liveAddr}
              onChange={(e) => setLiveAddr(e.target.value.trim())}
            />
            <button
              className="btn-primary shrink-0"
              disabled={disabled || liveBusy || !/^0x[0-9a-fA-F]{40}$/.test(liveAddr)}
              onClick={async () => {
                setLiveErr(null);
                setLiveBusy(true);
                setLiveQr(null);
                setLiveLink(null);
                try {
                  const recipient = getAddress(liveAddr);
                  const { url } = await signFor(recipient);
                  setLiveLink(url);
                  setLiveQr(
                    await QRCode.toDataURL(url, { width: 480, margin: 1 }),
                  );
                } catch (e) {
                  setLiveErr(e instanceof Error ? e.message.split("\n")[0] : "Signing failed");
                } finally {
                  setLiveBusy(false);
                }
              }}
            >
              {liveBusy ? "Signing…" : "Sign & show QR"}
            </button>
          </div>
          {liveErr && <p className="text-xs text-accentdark">{liveErr}</p>}
          {liveQr && liveLink && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-stamp/30 bg-white p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={liveQr} alt="Claim QR" className="h-64 w-64" />
              <p className="text-center text-xs text-faded">
                Attendee scans this → opens the claim page → mints. One-time
                use for {liveAddr.slice(0, 8)}… only.
              </p>
              <button
                className="btn-secondary !py-1.5 text-xs"
                onClick={() => copyToClipboard(liveLink)}
              >
                Copy claim link
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "batch" && (
        <div className="mt-4 space-y-3">
          <p className="text-xs leading-relaxed text-faded">
            Paste recipient addresses. Your wallet asks you to sign once per
            address (quick approve-approve-approve), then you get a CSV of
            claim links + a printable QR sheet — put them on badges, in emails
            or DMs.
          </p>
          <textarea
            className="input min-h-28 font-mono text-xs"
            placeholder={"0xabc…\n0xdef…"}
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            disabled={disabled}
          />
          <button
            className="btn-primary"
            disabled={disabled || !!batchProgress}
            onClick={async () => {
              const parsed = parseAddressList(batchInput);
              if (parsed.valid.length === 0) return;
              const entries: SignaturesFile["entries"] = [];
              try {
                for (let i = 0; i < parsed.valid.length; i++) {
                  setBatchProgress(`Signing ${i + 1}/${parsed.valid.length}…`);
                  const recipient = parsed.valid[i];
                  const { signature, url } = await signFor(recipient);
                  entries.push({ recipient, signature, claimUrl: url });
                }
                const file: SignaturesFile = {
                  format: "onchain-poaps-signatures-v1",
                  chainId: ACTIVE_CHAIN.id,
                  contract: POAP_ADDRESS,
                  eventId: event.id.toString(),
                  signer: event.creator,
                  entries,
                };
                setBatchResult(file);
              } catch {
                if (entries.length) {
                  setBatchResult({
                    format: "onchain-poaps-signatures-v1",
                    chainId: ACTIVE_CHAIN.id,
                    contract: POAP_ADDRESS,
                    eventId: event.id.toString(),
                    signer: event.creator,
                    entries,
                  });
                }
              } finally {
                setBatchProgress(null);
              }
            }}
          >
            {batchProgress ?? "Sign all & generate links"}
          </button>

          {batchResult && (
            <div className="space-y-2 rounded-xl border border-stamp/30 bg-white/70 p-4">
              <p className="text-sm font-bold text-mint">
                ✓ {batchResult.entries.length} signatures ready
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-secondary !py-1.5 text-xs"
                  onClick={() =>
                    downloadJson(`poap-${event.id}-signatures.json`, batchResult)
                  }
                >
                  signatures.json
                </button>
                <button
                  className="btn-secondary !py-1.5 text-xs"
                  onClick={() =>
                    downloadText(
                      `poap-${event.id}-claim-links.csv`,
                      "address,claim_url\n" +
                        batchResult.entries
                          .map((e) => `${e.recipient},${e.claimUrl}`)
                          .join("\n"),
                      "text/csv",
                    )
                  }
                >
                  claim-links CSV
                </button>
                <button
                  className="btn-secondary !py-1.5 text-xs"
                  onClick={async () => {
                    const cells = await Promise.all(
                      batchResult.entries.map(async (e) => {
                        const qr = await QRCode.toDataURL(e.claimUrl, {
                          width: 300,
                          margin: 1,
                        });
                        return `<div style="display:inline-block;text-align:center;margin:12px;page-break-inside:avoid"><img src="${qr}" width="220"/><div style="font:11px monospace">${e.recipient.slice(0, 10)}…${e.recipient.slice(-6)}</div></div>`;
                      }),
                    );
                    downloadText(
                      `poap-${event.id}-qr-sheet.html`,
                      `<!doctype html><html><head><meta charset="utf-8"><title>POAP ${event.id} QR sheet</title></head><body style="font-family:sans-serif"><h2>${event.name} — claim QR codes</h2><p>Each QR is valid for one specific wallet only.</p>${cells.join("")}</body></html>`,
                      "text/html",
                    );
                  }}
                >
                  Printable QR sheet (HTML)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ================= Airdrop ================= */

function AirdropSection({ event, disabled }: { event: PoapEvent; disabled: boolean }) {
  const tx = useTx();
  const [input, setInput] = useState("");
  const parsed = useMemo(() => parseAddressList(input), [input]);
  const over = parsed.valid.length > LIMITS.creatorMintBatch;

  return (
    <section className="card p-5">
      <h2 className="font-display text-lg font-bold">Direct airdrop</h2>
      <p className="mt-1 text-sm leading-relaxed text-faded">
        Mint straight into recipients&rsquo; wallets — they pay nothing and do
        nothing. Up to {LIMITS.creatorMintBatch} addresses per transaction;
        already-claimed wallets are skipped automatically.
      </p>
      <textarea
        className="input mt-3 min-h-24 font-mono text-xs"
        placeholder={"0xabc…\n0xdef…"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
      />
      {input.trim() && (
        <p className="mt-1 text-xs">
          <span className="font-semibold text-mint">✓ {parsed.valid.length} valid</span>
          {parsed.invalid.length > 0 && (
            <span className="text-accentdark"> · {parsed.invalid.length} invalid</span>
          )}
          {over && (
            <span className="text-accentdark"> · max {LIMITS.creatorMintBatch} per tx</span>
          )}
        </p>
      )}
      <button
        className="btn-primary mt-3"
        disabled={
          disabled || tx.busy || parsed.valid.length === 0 || over || parsed.invalid.length > 0
        }
        onClick={() =>
          tx.send({
            abi: POAP_ABI,
            address: POAP_ADDRESS,
            functionName: "creatorMint",
            args: [event.id, parsed.valid],
          })
        }
      >
        {tx.busy
          ? "Airdropping…"
          : `Airdrop to ${parsed.valid.length || "…"} wallet${parsed.valid.length === 1 ? "" : "s"}`}
      </button>
      {tx.status === "success" && (
        <p className="mt-2 text-sm font-semibold text-mint">
          ✓ Airdrop complete!
        </p>
      )}
      {tx.error && <TxError msg={tx.error} />}
      {disabled && (
        <p className="mt-2 text-xs text-faded">Locked — the 30-day creator window has ended.</p>
      )}
    </section>
  );
}

function TxError({ msg }: { msg: string }) {
  return (
    <p className="mt-2 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accentdark">
      {msg}
    </p>
  );
}
