"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useConnect } from "wagmi";
import { useMiniApp, composeCast } from "./MiniAppProvider";
import { useTx } from "@/lib/useTx";
import { useHasClaimed } from "@/lib/hooks";
import {
  POAP_ABI,
  POAP_ADDRESS,
  EXPLORER_URL,
  OPENSEA_ASSET_URL,
  ACTIVE_CHAIN,
} from "@/lib/contract";
import {
  hasAllowlist,
  isSignatureWindowOpen,
  signatureWindowEndsAt,
  type PoapEvent,
} from "@/lib/poap";
import { timeLeft } from "@/lib/format";
import { formatDate } from "@/lib/format";
import type { ProofsFile } from "@/lib/merkle";
import { getAddress, isAddress, isHex } from "viem";
import { MintSlam } from "./MintSlam";
import { downloadTicketStub } from "@/lib/stub";

export function MintPanel({
  event,
  onMinted,
  mintNumber,
  image,
}: {
  event: PoapEvent;
  onMinted?: () => void;
  /** total supply after the user's mint — shown as "collector #N" */
  mintNumber?: bigint;
  /** artwork data-uri, used for the ticket-stub download */
  image?: string | null;
}) {
  const { address, isConnected } = useAccount();
  const { isMiniApp } = useMiniApp();
  const { openConnectModal } = useConnectModal();
  const { connect, connectors } = useConnect();
  const claimed = useHasClaimed(event.id, address);
  const tx = useTx();

  const sigOpen = isSignatureWindowOpen(event);
  const allowlistOn = hasAllowlist(event);
  const anyMethod = event.isPublic || allowlistOn || sigOpen;

  const connectNow = () => {
    if (isMiniApp) {
      const fc = connectors.find((c) => c.id === "farcaster");
      if (fc) connect({ connector: fc });
    } else openConnectModal?.();
  };

  if (claimed.data) {
    return (
      <div className="card border-mint/40 bg-mint/5 p-5">
        <p className="font-display text-lg font-bold text-mint">
          ✓ You own this POAP
        </p>
        <p className="mt-1 text-sm text-faded">
          This wallet has already claimed it (max 1 per wallet).
        </p>
        <VerifyLinks eventId={event.id} hash={tx.hash} />
      </div>
    );
  }

  if (tx.status === "success") {
    return (
      <div className="card border-mint/40 bg-mint/5 p-5 animate-fadeUp">
        <MintSlam show />
        <p className="font-display text-xl font-bold text-mint">
          🎉 POAP minted!
        </p>
        <p className="mt-1 text-sm text-faded">
          &ldquo;{event.name}&rdquo; is now permanently in your collection.
          {mintNumber !== undefined && mintNumber > 0n && (
            <>
              {" "}
              You are <b className="text-ink">collector #{mintNumber.toString()}</b>.
            </>
          )}
        </p>
        <VerifyLinks eventId={event.id} hash={tx.hash} />
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/gallery" className="btn-secondary !py-2 text-xs">
            View my collection
          </a>
          <button
            className="btn-secondary !py-2 text-xs"
            onClick={() =>
              downloadTicketStub({
                name: event.name,
                dateStr: formatDate(event.eventDate || event.createdAt),
                location: event.location || undefined,
                image,
                collectorNo:
                  mintNumber && mintNumber > 0n ? mintNumber.toString() : undefined,
                address: address ?? "",
                verifyUrl: `${window.location.origin}/verify?id=${event.id}&addr=${address}`,
                eventId: event.id.toString(),
              })
            }
          >
            🎟️ Download ticket stub
          </button>
          {isMiniApp && (
            <button
              className="btn-primary !py-2 text-xs"
              onClick={() =>
                composeCast(
                  `I just minted the "${event.name}" POAP — fully onchain on Base 🪙`,
                  [`${window.location.origin}/poap/${event.id}`],
                )
              }
            >
              Share as cast
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h2 className="font-display text-lg font-bold">Mint this POAP</h2>

      {!anyMethod && (
        <p className="mt-2 text-sm text-faded">
          Minting is currently closed for this POAP — no public mint, no
          allowlist, and the signature window has ended.
        </p>
      )}

      {!isConnected && anyMethod && (
        <div className="mt-3">
          <p className="mb-3 text-sm text-faded">
            Connect a wallet to mint. Minting is free — you only pay Base gas
            (fractions of a cent).
          </p>
          <button className="btn-primary" onClick={connectNow}>
            Connect wallet
          </button>
        </div>
      )}

      {isConnected && (
        <div className="mt-3 space-y-3">
          {event.isPublic && (
            <MethodBox
              title="Public mint"
              tone="mint"
              desc="Open to everyone. One per wallet."
            >
              <button
                className="btn-primary w-full"
                disabled={tx.busy}
                onClick={async () => {
                  const h = await tx.send({
                    abi: POAP_ABI,
                    address: POAP_ADDRESS,
                    functionName: "mint",
                    args: [event.id],
                  });
                  if (h) onMinted?.();
                }}
              >
                {tx.status === "wallet"
                  ? "Confirm in wallet…"
                  : tx.status === "pending"
                    ? "Minting…"
                    : "Mint — free + gas"}
              </button>
            </MethodBox>
          )}

          {allowlistOn && (
            <AllowlistMintBox event={event} tx={tx} onMinted={onMinted} />
          )}

          {sigOpen && (
            <SignatureMintBox event={event} tx={tx} onMinted={onMinted} />
          )}

          {tx.error && (
            <p className="rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accentdark">
              {tx.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MethodBox({
  title,
  desc,
  tone,
  children,
}: {
  title: string;
  desc: string;
  tone: "mint" | "gold" | "stamp";
  children: React.ReactNode;
}) {
  const toneCls = {
    mint: "border-mint/30",
    gold: "border-gold/40",
    stamp: "border-stamp/30",
  }[tone];
  return (
    <div className={`rounded-xl border ${toneCls} bg-white/60 p-4`}>
      <p className="text-sm font-bold">{title}</p>
      <p className="mb-3 mt-0.5 text-xs leading-relaxed text-faded">{desc}</p>
      {children}
    </div>
  );
}

/* ---------- Allowlist ---------- */

function AllowlistMintBox({
  event,
  tx,
  onMinted,
}: {
  event: PoapEvent;
  tx: ReturnType<typeof useTx>;
  onMinted?: () => void;
}) {
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [proof, setProof] = useState<`0x${string}`[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const tryExtract = (raw: string) => {
    setErr(null);
    setProof(null);
    const text = raw.trim();
    if (!text || !address) return;
    try {
      const parsed = JSON.parse(text);
      // full proofs.json file
      if (parsed && typeof parsed === "object" && parsed.proofs) {
        const file = parsed as ProofsFile;
        const key = Object.keys(file.proofs).find(
          (k) => isAddress(k) && getAddress(k) === getAddress(address),
        );
        if (!key) {
          setErr("Your connected wallet is not in this proofs file.");
          return;
        }
        setProof(file.proofs[key]);
        return;
      }
      // bare array of hashes
      if (Array.isArray(parsed) && parsed.every((p) => isHex(p))) {
        setProof(parsed as `0x${string}`[]);
        return;
      }
      setErr("Unrecognized format — paste a proofs.json or a proof array.");
    } catch {
      // maybe newline/comma separated hex list
      const parts = text.split(/[\s,]+/).filter(Boolean);
      if (parts.length && parts.every((p) => isHex(p) && p.length === 66)) {
        setProof(parts as `0x${string}`[]);
      } else {
        setErr("Could not parse. Paste the proofs.json from the creator, or your proof array.");
      }
    }
  };

  return (
    <MethodBox
      title="Allowlist mint"
      tone="gold"
      desc="For wallets the creator added to the allowlist. You need the proof data the creator distributed (a proofs.json file or a claim link)."
    >
      {!open ? (
        <button className="btn-secondary w-full" onClick={() => setOpen(true)}>
          I&rsquo;m on the allowlist
        </button>
      ) : (
        <div className="space-y-2">
          <textarea
            className="input min-h-24 font-mono text-xs"
            placeholder='Paste proofs.json contents, or your proof array ["0x…","0x…"]'
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              tryExtract(e.target.value);
            }}
          />
          {err && <p className="text-xs text-accentdark">{err}</p>}
          {proof && (
            <p className="text-xs font-semibold text-mint">
              ✓ Proof found for your wallet ({proof.length} hashes)
            </p>
          )}
          <button
            className="btn-primary w-full"
            disabled={!proof || tx.busy}
            onClick={async () => {
              if (!proof) return;
              const h = await tx.send({
                abi: POAP_ABI,
                address: POAP_ADDRESS,
                functionName: "allowlistMint",
                args: [event.id, proof],
              });
              if (h) onMinted?.();
            }}
          >
            {tx.busy ? "Minting…" : "Mint via allowlist"}
          </button>
          <p className="text-[11px] text-faded">
            Got a claim link or QR from the creator instead? Just open it — it
            fills all this in automatically.
          </p>
        </div>
      )}
    </MethodBox>
  );
}

/* ---------- Signature ---------- */

function SignatureMintBox({
  event,
  tx,
  onMinted,
}: {
  event: PoapEvent;
  tx: ReturnType<typeof useTx>;
  onMinted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [sig, setSig] = useState("");
  const valid = isHex(sig.trim()) && sig.trim().length === 132;

  return (
    <MethodBox
      title="Signature mint"
      tone="stamp"
      desc={`The creator can authorize any wallet by signature — usually via a QR code or claim link at a live event. Window closes in ${timeLeft(
        signatureWindowEndsAt(event),
      ).replace(" left", "")}.`}
    >
      {!open ? (
        <button className="btn-secondary w-full" onClick={() => setOpen(true)}>
          I have a signature
        </button>
      ) : (
        <div className="space-y-2">
          <textarea
            className="input min-h-20 font-mono text-xs"
            placeholder="Paste your signature (0x… 132 chars). If you have a claim link/QR, just open it instead."
            value={sig}
            onChange={(e) => setSig(e.target.value)}
          />
          {sig && !valid && (
            <p className="text-xs text-accentdark">
              A signature is 65 bytes — 0x followed by 130 hex characters.
            </p>
          )}
          <button
            className="btn-primary w-full"
            disabled={!valid || tx.busy}
            onClick={async () => {
              const h = await tx.send({
                abi: POAP_ABI,
                address: POAP_ADDRESS,
                functionName: "mintWithSignature",
                args: [event.id, sig.trim() as `0x${string}`],
              });
              if (h) onMinted?.();
            }}
          >
            {tx.busy ? "Minting…" : "Mint with signature"}
          </button>
          <p className="text-[11px] text-faded">
            Note: the signature must have been issued for <em>your</em>{" "}
            connected wallet address on {ACTIVE_CHAIN.name}.
          </p>
        </div>
      )}
    </MethodBox>
  );
}

/* ---------- shared ---------- */

export function VerifyLinks({
  eventId,
  hash,
}: {
  eventId: bigint;
  hash?: `0x${string}` | null;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
      {hash && (
        <a
          className="text-accent hover:underline"
          href={`${EXPLORER_URL}/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
        >
          Transaction ↗
        </a>
      )}
      <a
        className="text-accent hover:underline"
        href={OPENSEA_ASSET_URL(eventId)}
        target="_blank"
        rel="noreferrer"
      >
        OpenSea ↗
      </a>
      <a
        className="text-accent hover:underline"
        href={`${EXPLORER_URL}/token/${POAP_ADDRESS}?a=${eventId}`}
        target="_blank"
        rel="noreferrer"
      >
        BaseScan ↗
      </a>
    </div>
  );
}
