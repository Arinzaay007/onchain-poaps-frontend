"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { parseEventLogs } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useConnect } from "wagmi";
import { useMiniApp, composeCast } from "@/components/MiniAppProvider";
import { PoapStamp } from "@/components/PoapStamp";
import { useTx } from "@/lib/useTx";
import {
  POAP_ABI,
  POAP_ADDRESS,
  LIMITS,
  encodeFlags,
  ACTIVE_CHAIN,
} from "@/lib/contract";
import {
  validateSvg,
  optimizeSvg,
  svgToDataUri,
  estimateRegisterGas,
  type OptimizeResult,
} from "@/lib/svg";
import {
  parseAddressList,
  buildAllowlist,
  makeProofsFile,
  type AllowlistData,
} from "@/lib/merkle";
import { downloadJson, formatBytes } from "@/lib/format";
import { ZERO_ROOT } from "@/lib/poap";
import { StampStudio } from "@/components/StampStudio";

type Step = 0 | 1 | 2 | 3;

export default function CreatePage() {
  const [step, setStep] = useState<Step>(0);

  // step 1 — artwork
  const [artMode, setArtMode] = useState<"studio" | "upload">("studio");
  const [rawSvg, setRawSvg] = useState("");
  const [useOptimized, setUseOptimized] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  // step 2 — details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState(""); // yyyy-mm-dd
  const [externalUrl, setExternalUrl] = useState("");

  // step 3 — distribution
  const [isPublic, setIsPublic] = useState(true);
  const [isSoulbound, setIsSoulbound] = useState(true);
  const [allowlistMode, setAllowlistMode] = useState<"none" | "now">("none");
  const [allowlistInput, setAllowlistInput] = useState("");

  const tx = useTx();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { connect, connectors } = useConnect();
  const { isMiniApp } = useMiniApp();

  /* derived — artwork */
  const check = useMemo(() => validateSvg(rawSvg), [rawSvg]);
  const opt: OptimizeResult | null = useMemo(
    () => (rawSvg.trim() && check.ok ? optimizeSvg(rawSvg.trim()) : null),
    [rawSvg, check.ok],
  );
  const finalSvg = useOptimized && opt ? opt.svg : rawSvg.trim();
  const svgBytes = useMemo(
    () => new TextEncoder().encode(finalSvg).length,
    [finalSvg],
  );
  const previewUri = useMemo(
    () => (finalSvg && check.ok ? svgToDataUri(finalSvg) : null),
    [finalSvg, check.ok],
  );

  /* derived — allowlist */
  const parsedList = useMemo(
    () => (allowlistMode === "now" ? parseAddressList(allowlistInput) : null),
    [allowlistMode, allowlistInput],
  );
  const allowlist: AllowlistData | null = useMemo(() => {
    if (!parsedList || parsedList.valid.length === 0) return null;
    try {
      return buildAllowlist(parsedList.valid);
    } catch {
      return null;
    }
  }, [parsedList]);

  /* derived — validation per step */
  const artworkOk = check.ok && !!finalSvg;
  const nameOk = name.trim().length > 0 && name.length <= LIMITS.name;
  const detailsOk =
    nameOk &&
    description.length <= LIMITS.description &&
    location.length <= LIMITS.location &&
    externalUrl.length <= LIMITS.externalUrl;
  const allowlistOk =
    allowlistMode === "none" || (allowlist !== null && parsedList!.invalid.length === 0);

  const eventDateTs = eventDate
    ? BigInt(Math.floor(new Date(eventDate + "T12:00:00Z").getTime() / 1000))
    : 0n;

  const gasEstimate = useMemo(
    () =>
      estimateRegisterGas(
        svgBytes,
        name.length + description.length + location.length + externalUrl.length,
      ),
    [svgBytes, name, description, location, externalUrl],
  );

  /* result */
  const newEventId = useMemo(() => {
    if (!tx.receipt) return null;
    try {
      const logs = parseEventLogs({
        abi: POAP_ABI,
        logs: tx.receipt.logs,
        eventName: "NewEvent",
      });
      return logs[0]?.args.eventId ?? null;
    } catch {
      return null;
    }
  }, [tx.receipt]);

  const register = async () => {
    await tx.send({
      abi: POAP_ABI,
      address: POAP_ADDRESS,
      functionName: "registerEvent",
      args: [
        name.trim(),
        description.trim(),
        eventDateTs,
        location.trim(),
        allowlist ? allowlist.root : ZERO_ROOT,
        finalSvg,
        externalUrl.trim(),
        encodeFlags(isSoulbound, isPublic),
      ],
    });
  };

  /* ------- success screen ------- */
  if (tx.status === "success" && newEventId !== null) {
    return (
      <div className="container-page max-w-2xl py-14 text-center animate-fadeUp">
        <PoapStamp image={previewUri} alt={name} size="lg" stamped className="mx-auto" />
        <h1 className="mt-6 font-display text-3xl font-black">
          &ldquo;{name}&rdquo; is live onchain 🎉
        </h1>
        <p className="mt-2 text-faded">
          POAP #{newEventId.toString()} is registered forever on{" "}
          {ACTIVE_CHAIN.name}. Artwork and metadata are stored fully onchain.
        </p>

        {allowlist && (
          <div className="card mx-auto mt-6 max-w-md border-gold/40 bg-gold/5 p-5 text-left">
            <p className="font-bold">⚠️ Download your allowlist proofs now</p>
            <p className="mt-1 text-sm text-faded">
              Your allowlist root is set. Minters need their proof — download
              the proofs file and distribute it (or generate claim links in the
              manage page).
            </p>
            <button
              className="btn-primary mt-3 w-full"
              onClick={() =>
                downloadJson(
                  `poap-${newEventId}-allowlist-proofs.json`,
                  makeProofsFile(allowlist, ACTIVE_CHAIN.id, POAP_ADDRESS, newEventId),
                )
              }
            >
              Download proofs.json
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={`/poap/${newEventId}`} className="btn-primary">
            View POAP
          </Link>
          <Link href={`/poap/${newEventId}/manage`} className="btn-secondary">
            Manage distribution
          </Link>
          {isMiniApp && (
            <button
              className="btn-secondary"
              onClick={() =>
                composeCast(
                  `I just created "${name}" — a fully onchain POAP on Base. Mint it here 👇`,
                  [`${window.location.origin}/poap/${newEventId}`],
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

  /* ------- wizard ------- */
  const steps = ["Artwork", "Details", "Distribution", "Review"];

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="font-display text-3xl font-black">Create a POAP</h1>
      <p className="mt-1 text-sm text-faded">
        Your artwork and metadata are stored 100% onchain — permanently. Take a
        minute to get them right.
      </p>

      {/* step indicator */}
      <div className="mt-6 flex gap-1.5">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => i < step && setStep(i as Step)}
            className={`flex-1 rounded-full py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
              i === step
                ? "bg-ink text-paper"
                : i < step
                  ? "bg-mint/15 text-mint"
                  : "bg-parchment text-faded/60"
            }`}
          >
            {i < step ? "✓ " : `${i + 1}. `}
            {s}
          </button>
        ))}
      </div>

      <div className="card mt-6 p-6">
        {step === 0 && (
          <section>
            <h2 className="font-display text-xl font-bold">POAP artwork (SVG)</h2>
            <p className="mt-1 text-sm text-faded">
              Design one right here in the Stamp Studio — or bring your own
              SVG. Either way it&rsquo;s stored as text onchain, forever, so
              smaller is better.
            </p>

            <div className="mt-4 flex gap-2">
              <button
                className={artMode === "studio" ? "btn-primary !py-1.5 text-xs" : "btn-secondary !py-1.5 text-xs"}
                onClick={() => setArtMode("studio")}
              >
                🎨 Stamp Studio
              </button>
              <button
                className={artMode === "upload" ? "btn-primary !py-1.5 text-xs" : "btn-secondary !py-1.5 text-xs"}
                onClick={() => setArtMode("upload")}
              >
                Upload / paste SVG
              </button>
            </div>

            {artMode === "studio" && (
              <div className="mt-4">
                <StampStudio
                  eventName={name || undefined}
                  onUse={(svg) => {
                    setRawSvg(svg);
                    setArtMode("upload");
                  }}
                />
                <p className="mt-3 text-[11px] text-faded">
                  Studio designs are hand-optimized SVGs (~1–3 KB) — cheaper to
                  store onchain than most exported files.
                </p>
              </div>
            )}

            {artMode === "upload" && (
              <>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
                Upload .svg file
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setRawSvg(await f.text());
                }}
              />
              <a
                href="https://svgomg.net"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost text-xs"
              >
                or optimize externally with SVGOMG ↗
              </a>
            </div>

            <textarea
              className="input mt-3 min-h-40 font-mono text-xs"
              placeholder="…or paste SVG markup here: <svg viewBox=&quot;0 0 100 100&quot;>…</svg>"
              value={rawSvg}
              onChange={(e) => setRawSvg(e.target.value)}
            />

            {rawSvg.trim() && (
              <div className="mt-4 grid gap-4 sm:grid-cols-[auto,1fr]">
                <PoapStamp image={previewUri} alt="preview" size="md" />
                <div className="space-y-2 text-sm">
                  {check.errors.map((e) => (
                    <p key={e} className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-accentdark">
                      ✕ {e}
                    </p>
                  ))}
                  {check.warnings.map((w) => (
                    <p key={w} className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-gold">
                      ⚠ {w}
                    </p>
                  ))}
                  {opt && (
                    <div className="rounded-lg border border-line bg-white/60 px-3 py-2">
                      <label className="flex cursor-pointer items-center gap-2 font-semibold">
                        <input
                          type="checkbox"
                          checked={useOptimized}
                          onChange={(e) => setUseOptimized(e.target.checked)}
                        />
                        Optimize with SVGO
                        {opt.savedPct > 0 && (
                          <span className="text-mint">
                            −{opt.savedPct}% ({formatBytes(opt.before)} → {formatBytes(opt.after)})
                          </span>
                        )}
                      </label>
                      <p className="mt-1 text-xs text-faded">
                        Final size: <b>{formatBytes(svgBytes)}</b> · rough
                        registration gas ≈ {Math.round(gasEstimate / 1000)}k —
                        pennies on Base, but smaller is better.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
              </>
            )}

            <NavButtons
              onNext={() => setStep(1)}
              nextDisabled={!artworkOk}
              nextLabel="Next: details"
            />
          </section>
        )}

        {step === 1 && (
          <section>
            <h2 className="font-display text-xl font-bold">Event details</h2>
            <p className="mt-1 text-sm text-faded">
              Only the name is required. Everything else enriches the onchain
              metadata collectors will see forever.
            </p>

            <div className="mt-4 space-y-4">
              <Field label={`Name * (${name.length}/${LIMITS.name})`}>
                <input
                  className="input"
                  maxLength={LIMITS.name}
                  placeholder="ETH Lagos Meetup — August 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label={`Description (${description.length}/${LIMITS.description})`}>
                <textarea
                  className="input min-h-24"
                  maxLength={LIMITS.description}
                  placeholder="What happened, where, and why it mattered."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={`Location (${location.length}/${LIMITS.location})`}>
                  <input
                    className="input"
                    maxLength={LIMITS.location}
                    placeholder="Onitsha, Nigeria · or 'Onchain'"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Field>
                <Field label="Event date">
                  <input
                    type="date"
                    className="input"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </Field>
              </div>
              <Field label={`External URL (${externalUrl.length}/${LIMITS.externalUrl})`}>
                <input
                  className="input"
                  maxLength={LIMITS.externalUrl}
                  placeholder="https://your-event.xyz"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </Field>
            </div>

            <NavButtons
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
              nextDisabled={!detailsOk}
              nextLabel="Next: distribution"
            />
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="font-display text-xl font-bold">Distribution</h2>
            <p className="mt-1 text-sm text-faded">
              How should people get this POAP? You can combine methods — and
              change public/allowlist settings for 30 days after registration.
            </p>

            <div className="mt-4 space-y-3">
              <Toggle
                checked={isSoulbound}
                onChange={setIsSoulbound}
                title="Soulbound (recommended for attendance)"
                desc={
                  isSoulbound
                    ? "Non-transferable: the POAP stays with the wallet that earned it, forever. This is what makes it a credible proof of attendance."
                    : "Transferable: holders can send or sell it like a normal NFT. Fine for collectibles, weaker as proof of attendance. ⚠️ This choice is permanent."
                }
              />
              <Toggle
                checked={isPublic}
                onChange={setIsPublic}
                title="Public mint"
                desc={
                  isPublic
                    ? "Anyone can mint (1 per wallet) while public minting is on. Great for open communities. You can close it any time in the first 30 days."
                    : "Public mint off — only allowlist, signatures, or your direct airdrop can distribute this POAP."
                }
              />

              <div className="rounded-xl border border-line bg-white/60 p-4">
                <p className="text-sm font-bold">Allowlist (optional)</p>
                <p className="mt-0.5 text-xs leading-relaxed text-faded">
                  A fixed list of wallets that are allowed to mint. We turn your
                  address list into a Merkle root — you don&rsquo;t need to know
                  what that means.{" "}
                  <b>It can only ever be set once</b>, now or within 30 days
                  from the manage page.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    className={allowlistMode === "none" ? "btn-primary !py-1.5 text-xs" : "btn-secondary !py-1.5 text-xs"}
                    onClick={() => setAllowlistMode("none")}
                  >
                    No allowlist / decide later
                  </button>
                  <button
                    className={allowlistMode === "now" ? "btn-primary !py-1.5 text-xs" : "btn-secondary !py-1.5 text-xs"}
                    onClick={() => setAllowlistMode("now")}
                  >
                    Set it now
                  </button>
                </div>
                {allowlistMode === "now" && (
                  <div className="mt-3">
                    <textarea
                      className="input min-h-28 font-mono text-xs"
                      placeholder={"One address per line (commas also fine):\n0xabc…\n0xdef…"}
                      value={allowlistInput}
                      onChange={(e) => setAllowlistInput(e.target.value)}
                    />
                    {parsedList && (
                      <div className="mt-2 space-y-1 text-xs">
                        <p className="font-semibold text-mint">
                          ✓ {parsedList.valid.length} valid address{parsedList.valid.length === 1 ? "" : "es"}
                          {parsedList.duplicates > 0 && ` · ${parsedList.duplicates} duplicates removed`}
                        </p>
                        {parsedList.invalid.length > 0 && (
                          <p className="text-accentdark">
                            ✕ {parsedList.invalid.length} invalid entr{parsedList.invalid.length === 1 ? "y" : "ies"}:{" "}
                            {parsedList.invalid.slice(0, 3).join(", ")}
                            {parsedList.invalid.length > 3 && "…"}
                          </p>
                        )}
                        {allowlist && (
                          <p className="break-all font-mono text-faded">
                            root: {allowlist.root}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-stamp/25 bg-stamp/5 p-4 text-xs leading-relaxed text-faded">
                <b className="text-ink">Also available after you register:</b>{" "}
                signature minting (QR codes for live events, first 37 days) and
                direct airdrop to up to 101 wallets (first 30 days) — both from
                the manage page. No setup needed now.
              </div>
            </div>

            <NavButtons
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              nextDisabled={!allowlistOk}
              nextLabel="Next: review"
            />
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="font-display text-xl font-bold">Review &amp; register</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-[auto,1fr]">
              <PoapStamp image={previewUri} alt={name} size="md" />
              <dl className="space-y-2 text-sm">
                <ReviewRow k="Name" v={name} />
                <ReviewRow k="Description" v={description || "—"} />
                <ReviewRow k="Location" v={location || "—"} />
                <ReviewRow k="Event date" v={eventDate || "—"} />
                <ReviewRow k="External URL" v={externalUrl || "—"} />
                <ReviewRow k="Soulbound" v={isSoulbound ? "Yes — permanent" : "No — transferable"} />
                <ReviewRow k="Public mint" v={isPublic ? "Open at launch" : "Closed at launch"} />
                <ReviewRow
                  k="Allowlist"
                  v={allowlist ? `${allowlist.addresses.length} addresses (root set at registration)` : "Not set (can add within 30 days)"}
                />
                <ReviewRow k="Artwork size" v={`${formatBytes(svgBytes)}${opt && useOptimized && opt.savedPct > 0 ? ` (optimized −${opt.savedPct}%)` : ""}`} />
                <ReviewRow k="Network" v={ACTIVE_CHAIN.name} />
              </dl>
            </div>

            <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs leading-relaxed">
              ⚠️ <b>Onchain is forever.</b> Name, artwork, description and the
              soulbound setting can never be changed after registration. Public
              mint and allowlist can only be adjusted during the first 30 days.
            </div>

            {tx.error && (
              <p className="mt-3 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accentdark">
                {tx.error}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between">
              <button className="btn-ghost" onClick={() => setStep(2)} disabled={tx.busy}>
                ← Back
              </button>
              {isConnected ? (
                <button className="btn-primary !px-8" onClick={register} disabled={tx.busy}>
                  {tx.status === "wallet"
                    ? "Confirm in wallet…"
                    : tx.status === "pending"
                      ? "Registering onchain…"
                      : "Register POAP"}
                </button>
              ) : (
                <button
                  className="btn-primary !px-8"
                  onClick={() => {
                    if (isMiniApp) {
                      const fc = connectors.find((c) => c.id === "farcaster");
                      if (fc) connect({ connector: fc });
                    } else openConnectModal?.();
                  }}
                >
                  Connect wallet to register
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ---------- small pieces ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full rounded-xl border p-4 text-left transition-colors ${
        checked ? "border-mint/40 bg-mint/5" : "border-line bg-white/60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{title}</p>
        <span
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-mint" : "bg-line"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
          />
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-faded">{desc}</p>
    </button>
  );
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line/60 pb-1.5">
      <dt className="shrink-0 text-faded">{k}</dt>
      <dd className="text-right font-semibold break-words min-w-0">{v}</dd>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      {onBack ? (
        <button className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
      ) : (
        <span />
      )}
      <button className="btn-primary" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </button>
    </div>
  );
}
