"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { useAccount, useSignMessage } from "wagmi";
import { usePoapEvent } from "@/lib/hooks";
import { isSignatureWindowOpen, signatureWindowEndsAt } from "@/lib/poap";
import { signatureDigest, claimUrl } from "@/lib/signature";
import { ACTIVE_CHAIN, POAP_ADDRESS, EXPLORER_URL } from "@/lib/contract";
import { timeLeft, shortAddress, formatDate } from "@/lib/format";
import { PoapStamp } from "@/components/PoapStamp";

/**
 * LIVE-EVENT KIOSK MODE.
 * A single, fullscreen, do-one-job screen for the door/near a badge booth:
 * attendee shows their address (or you scan it) → you tap "sign" → a huge QR
 * appears → they scan with any wallet and mint.
 */
export function KioskClient({ id }: { id: string }) {
  const eventId = useMemo(() => {
    try {
      return BigInt(id);
    } catch {
      return undefined;
    }
  }, [id]);
  const { event, isLoading } = usePoapEvent(eventId);
  const { address, isConnected } = useAccount();
  const { signMessageAsync, isPending } = useSignMessage();

  const [input, setInput] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [signedFor, setSignedFor] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const sigOpen = event ? isSignatureWindowOpen(event) : false;
  const isCreator =
    address && event && address.toLowerCase() === event.creator.toLowerCase();

  const sign = async () => {
    setErr(null);
    const raw = (input || "").trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(raw)) {
      setErr("Paste a full 0x address.");
      return;
    }
    const recipient = raw as `0x${string}`;
    try {
      const digest = signatureDigest(eventId!, BigInt(ACTIVE_CHAIN.id), recipient);
      const signature = await signMessageAsync({ message: { raw: digest } });
      const url = claimUrl(window.location.origin, {
        v: 1,
        t: "sig",
        eventId: eventId!.toString(),
        chainId: ACTIVE_CHAIN.id,
        recipient,
        signature,
      });
      // light background artwork is faintly visible behind the QR (the "ghost")
      const dataUrl = await QRCode.toDataURL(url, {
        width: 720,
        margin: 2,
        color: { dark: "#221c14", light: "#ffffff" },
      });
      setQr(dataUrl);
      setSignedFor(recipient);
    } catch (e) {
      setErr(e instanceof Error ? e.message.split("\n")[0] : "Signing failed");
    }
  };

  const newGuest = () => {
    setQr(null);
    setSignedFor(null);
    setInput("");
    setErr(null);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#16181f] text-paper">
      {/* header bar */}
      <header className="flex items-center justify-between gap-4 border-b border-paper/10 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="badge border border-gold/40 bg-gold/15 text-gold">
            Kiosk mode
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">
              {event ? event.name : "Loading POAP…"}
            </p>
            {event && (
              <p className="font-mono text-[11px] text-paper/50">
                #{event.id.toString()} · {sigOpen ? `sig window open` : "sig window closed"} ·{" "}
                {formatDate(event.eventDate || event.createdAt)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link href={`/poap/${eventId?.toString() ?? ""}`} className="btn-ghost !px-3 !py-1.5 text-paper/70 hover:text-paper">
            ← Detail
          </Link>
          <span className="hidden font-mono text-paper/40 sm:block">
            {isConnected && address ? shortAddress(address) : "connect wallet"}
          </span>
        </div>
      </header>

      {/* main area */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10 text-center">
        {isLoading ? (
          <p className="text-paper/50">Loading event from Base…</p>
        ) : !event ? (
          <div>
            <p className="font-display text-2xl font-bold">No such POAP</p>
            <Link href="/explore" className="btn-secondary mt-4">Go explore</Link>
          </div>
        ) : !isCreator ? (
          <div className="max-w-md">
            <p className="font-display text-3xl font-black">Creator required</p>
            <p className="mt-3 text-paper/60">
              Only the creator of this POAP can run the kiosk (they sign each
              attendee&rsquo;s permission). Connect the creator wallet to start.
            </p>
            <p className="mt-4 font-mono text-xs text-gold">{shortAddress(event.creator, 8)}</p>
          </div>
        ) : !sigOpen ? (
          <div className="max-w-md">
            <p className="font-display text-3xl font-black">Signature window closed</p>
            <p className="mt-3 text-paper/60">
              Signature minting was only available for 37 days after
              registration. This kiosk works during that window.
            </p>
          </div>
        ) : qr ? (
          <>
            <div className="relative">
              {event && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
                  <PoapStamp image={undefined} alt="" size="lg" />
                </div>
              )}
              <img
                src={qr}
                alt="mint QR"
                className="h-80 w-80 rounded-2xl bg-[#ffffff] p-4 shadow-[0_0_60px_rgba(255,255,255,.12)] sm:h-[26rem] sm:w-[26rem]"
              />
            </div>
            <div className="max-w-md">
              <span className="badge border border-mint/40 bg-mint/15 text-mint">Signed ✓</span>
              <p className="mt-3 font-mono text-lg font-bold text-paper">
                {signedFor ? shortAddress(signedFor, 10) : ""}
              </p>
              <p className="mt-1 text-sm text-paper/60">
                They scan this with any wallet and tap mint. One signature, one
                attendee, ~2 seconds.
              </p>
              <p className="mt-2 font-mono text-xs text-paper/40">
                window closes {event ? timeLeft(signatureWindowEndsAt(event)) : ""}
              </p>
            </div>
            <button className="btn-primary !px-8 !py-4 !text-lg" onClick={newGuest}>
              Next attendee →
            </button>
          </>
        ) : (
          <>
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
                Live event · signature mint
              </p>
              <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
                Get the attendee&rsquo;s address
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-paper/60">
                Type or paste the wallet address they show you (they can reveal
                a QR for it in any wallet app). Tap{" "}
                <b className="text-paper">Sign &amp; show QR</b> to mint an
                onchain POAP for them in seconds.
              </p>
            </div>

            <div className="flex w-full max-w-xl flex-col gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="0x… attendee address"
                className="input font-mono text-center !text-lg"
                onKeyDown={(e) => e.key === "Enter" && sign()}
              />
              <button
                className="btn-primary !py-5 !text-xl"
                disabled={isPending || !input}
                onClick={sign}
              >
                {isPending ? "Signing…" : "Sign & show QR"}
              </button>
              {err && <p className="text-sm text-red-300">{err}</p>}
            </div>
          </>
        )}
      </main>

      {/* footer strip */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-paper/10 px-6 py-3 font-mono text-[11px] text-paper/40">
        <span>signature mint · live events</span>
        <a
          href={`${EXPLORER_URL}/address/${POAP_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-paper"
        >
          {shortAddress(POAP_ADDRESS, 6)} ↗
        </a>
      </footer>
    </div>
  );
}
