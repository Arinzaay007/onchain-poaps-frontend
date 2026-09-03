import { LIMITS, ACTIVE_CHAIN } from "./contract";
import {
  hasAllowlist,
  isCreatorWindowOpen,
  isSignatureWindowOpen,
  creatorWindowEndsAt,
  signatureWindowEndsAt,
  mintAvailability,
  type PoapEvent,
} from "./poap";
import type { PoapMetadata } from "./poap";
import { timeLeft } from "./format";

/**
 * The STEWARD — a deterministic, onchain-reading assistant.
 * No LLM, no API key, no server: it answers from the real contract state and
 * a built-in knowledge base, so it stays accurate, free, and "unstoppable".
 */

export interface Link {
  label: string;
  href: string;
}

export interface StewardReply {
  text: string;
  links?: Link[];
  /** switch the focused POAP to this id (the UI loads it, then re-answers) */
  switchTo?: bigint;
}

export interface StewardCtx {
  totalEvents?: bigint;
  focus?: PoapEvent | null;
  metadata?: PoapMetadata | null;
  supply?: bigint;
  address?: `0x${string}` | undefined;
}

const ANY = "0x0000000000000000000000000000000000000000";

function has(s: string, words: string[]): boolean {
  const low = s.toLowerCase();
  return words.some((w) => low.includes(w));
}

export function parseEventId(text: string): bigint | null {
  const m = text.match(/\b(?:poap|event|#)\s*(\d+)\b/i) || text.match(/\b(\d+)\b/);
  if (!m) return null;
  try {
    return BigInt(m[1]);
  } catch {
    return null;
  }
}

export function steward(
  input: string,
  ctx: StewardCtx,
): StewardReply {
  const text = input.trim();
  const low = text.toLowerCase();

  // ---- greetings / help ----
  if (!text || /^(hi|hello|hey|yo|help|\?|what can you do|what do you do)/i.test(text)) {
    return {
      text: `Hey — I'm the Steward. I read ${ctx.totalEvents === undefined ? "the" : `all ${ctx.totalEvents + 1n}`} POAPs straight off the Base contract, no server, no AI bill. Ask me things like:
• "who can mint my POAP right now?"
• "plan a soulbound meetup POAP for 50 people"
• "make me claim links for an allowlist"
• "when does signature minting close?"
• "what's the difference between soulbound and transferable?"`,
      links: [{ label: "Read the docs", href: "/docs" }],
    };
  }

  // ---- create / registration planning ----
  if (has(low, ["create a poap", "make me a poap", "register", "plan", "new poap", "create poap", "set up", "i want to run", "running an event", "meetup", "event for"])) {
    return planCreate(text, ctx);
  }

  // ---- kiosk / live event / qr sign at door ----
  if (has(low, ["kiosk", "live event", "at the door", "qr code", "qr at", "scan", "door", "sign them in", "badge booth"])) {
    const focus = ctx.focus;
    const sigOpen = focus ? isSignatureWindowOpen(focus) : false;
    return {
      text: `Live-event minting is the signature-mint flow, and the app has a dedicated fullscreen kiosk for exactly this.

${focus ? `For **${focus.name}** (#${focus.id}): the signature window is ${sigOpen ? `still OPEN — close ${timeLeft(signatureWindowEndsAt(focus))}.` : `CLOSED (only the first 37 days after registration).`}` : "Open any of your POAPs to check its signature window."}

Kiosk flow: open the POAP → **Manage distribution** → **Launch kiosk**. Type/paste an attendee's address → your wallet signs → a QR appears → they scan and mint in ~2 seconds. Each signature is unique to one address, and you pay no gas to sign (the attendee pays to mint).`,
      links: focus
        ? [
            { label: "Open the kiosk", href: `/poap/${focus.id}/kiosk` },
            { label: "Signature docs", href: "/docs/signatures" },
          ]
        : [{ label: "Kiosk docs", href: "/docs/kiosk" }],
    };
  }

  // ---- allowlist / proofs / claim links ----
  if (has(low, ["allowlist", "proof", "claim link", "merkle", "whitelist", "claim links", "proofs", "recipient list", "list of address"])) {
    return planAllowlist(text, ctx);
  }

  // ---- verify ----
  if (has(low, ["verify", "check if", "does this wallet", "did they mint", "proof of attendance", "prove"])) {
    return {
      text: `The Verify page checks any wallet against any POAP onchain and returns the mint receipt. Paste a wallet + pick a POAP (or just paste a claim link) and it'll show exactly whether they hold it and when.

Every POAP also has an **attestation receipt** on its page (downloadable / printable) with the wallet, collector #, mint tx hash and a verify QR.`,
      links: [
        { label: "Verify attendance", href: "/verify" },
        { label: "Verify docs", href: "/docs/verify" },
      ],
    };
  }

  // ---- soulbound vs transferable ----
  if (has(low, ["soulbound", "non-transferable", "transferable", "locked", "can't send", "can i transfer", "can it be sent"])) {
    return explainSoulbound(ctx);
  }

  // ---- deadlines / restrictions ----
  if (has(low, ["deadline", "how long", "when does", "window", "30 day", "37 day", "expire", "expires", "restriction", "close", "closes"])) {
    return explainDeadlines(ctx);
  }

  // ---- who can mint / mint status ----
  if (has(low, ["mint", "who can", "eligible", "can i mint", "is it mintable", "get one", "claim it", "status"])) {
    return mintStatus(ctx);
  }

  // ---- unstoppable / zero-server / hosting ----
  if (has(low, ["unstoppable", "serverless", "no server", "ipfs", "self-host", "deploy", "host", "offline", "single file"])) {
    return {
      text: `The app ships a zero-dependency, single-file explorer at **/unstoppable** that reads every POAP straight off the chain with plain \`fetch\` against a public Base RPC — no app server, no database, no IPFS. Hard-code it into a static host, IPFS, or a USB stick and it keeps working even if this domain dies.

Regenerate it anytime with \`npm run unstoppable\`. The rest of the app is equally serverless (wagmi/viem read the contract directly).`,
      links: [
        { label: "Open the unstoppable explorer", href: "/unstoppable" },
        { label: "Self-hosting docs", href: "/docs/self-hosting" },
      ],
    };
  }

  // ---- who are you / about ----
  if (has(low, ["who are you", "what is this", "about", "steward", "what are you"])) {
    return {
      text: `I'm the Steward — a deterministic assistant built into this app. Unlike a chatbot, I don't call an external AI: I read the actual Onchain POAPs contract on Base and give you answers backed by real chain state, free and with no downtime. Ask me to plan a drop, explain minting, or generate distribution links.`,
    };
  }

  // ---- default: point somewhere useful ----
  return {
    text: `I can help with creating POAPs, minting, allowlists, live-event sign & QR claims, deadlines, soulbound vs transferable, and the unstoppable export. Try rephrasing (e.g. "who can mint POAP #4?" or "plan an allowlist meetup"). Or browse the docs.`,
    links: [{ label: "Browse the docs", href: "/docs" }],
  };
}

/* -------------------- intent handlers -------------------- */

function planCreate(text: string, ctx: StewardCtx): StewardReply {
  const total = ctx.totalEvents;
  const nextId = total === undefined ? null : (total + 1n).toString();
  const soulbound = /soulbound|locked|non-transferable/i.test(text);
  const publicOn = /public|open mint|anyone/i.test(text);
  const allow = /allowlist|invite|vip|members/i.test(text);
  const flag = (soulbound ? 1 : 0) + (publicOn ? 2 : 0);

  const flagsHelp = [
    "0 = no public mint, not soulbound",
    "1 = soulbound only (locked forever)",
    "2 = public mint only (transferable)",
    "3 = soulbound + public mint",
  ].join("\n");

  return {
    text: `Here's a registration plan. The contract's \`registerEvent(\`name, description, eventDate, location, allowlistRoot, svgImage, externalUrl, flags\`)\` takes exactly these, with limits: name ≤ ${LIMITS.name}, description ≤ ${LIMITS.description}, location ≤ ${LIMITS.externalUrl}, externalUrl ≤ ${LIMITS.externalUrl}, flags ≤ 3, and a non-empty SVG (we optimize it in the create flow to cut gas).

Based on your ask → ${soulbound ? "soulbound" : "transferable"}, ${allow ? "allowlist" : publicOn ? "public mint" : "private"}.

Suggested **flags = ${flag}**: ${flagsHelp}.

${nextId !== null ? `Your registration would create **POAP #${nextId}**.` : ""} I can't auto-deploy the transaction from here (you sign it), but the Create flow builds this exact call — pick your artwork in the Stamp Studio, plug in the details, and it goes onchain.`,
    links: [
      { label: "Start creating", href: "/create" },
      { label: "Creating docs", href: "/docs/creating" },
      { label: "Contract reference", href: "/docs/contract" },
    ],
  };
}

function planAllowlist(text: string, ctx: StewardCtx): StewardReply {
  const focus = ctx.focus;
  const hasList = /(\d+)\s*(address|people|wallets|recipient|invitee)/i.test(text);
  return {
    text: `Allowlists are the cleanest way to gate a drop to a known set. The contract stores a single Merkle root per event; a wallet can mint only if it has a proof against that root, and you can set the root only once, within the **first 30 days**.

How the app handles it (no Merkle math needed):
1. Paste your addresses (newline, comma or space separated).
2. We dedupe, flag any invalid ones, and build the tree with pre-hashed leaves — matching the contract exactly.
3. You set the root onchain, then download a **proofs file** + **a claim link per wallet** (each link is pre-proofed, so the holder just opens it and taps mint).

${focus ? `For **${focus.name}** (#${focus.id}): the root is ${hasAllowlist(focus) ? "already set" : "not yet configured"}.` : "Open a POAP → Manage distribution → Allowlist to run this on a real event."}

${hasList ? "It sounds like you have a list — paste it into the Allowlist tool and it'll produce your proofs + claim links right there." : ""}`,
    links: [
      { label: "Allowlist docs", href: "/docs/allowlists" },
      { label: "Distribution docs", href: "/docs/distribution" },
    ],
  };
}

function explainSoulbound(ctx: StewardCtx): StewardReply {
  const f = ctx.focus;
  return {
    text: `**Soulbound** means the POAP can never be transferred — it's welded to the wallet that minted it. **Transferable** means it can be sent or traded like a regular token. The contract enforces this: a transfer on a soulbound token reverts with \`POAP__SoulboundNotTransferable\`.

In this app the difference is made visually obvious: soulbound stamps get a **lock badge + a wax seal** and read "yours forever"; transferable ones look like loose ticket stubs.

${f ? `**${f.name}** (#${f.id}) is ${f.isSoulbound ? "SOULBOUND — locked, non-transferable." : "transferable — it can travel between wallets."}` : "Open any POAP to see its flag."}`,
    links: [{ label: "Soulbound docs", href: "/docs/soulbound" }],
  };
}

function explainDeadlines(ctx: StewardCtx): StewardReply {
  const f = ctx.focus;
  const lines: string[] = [];
  lines.push(`The contract enforces two clock windows after registration:`);
  lines.push(`• **Creator window — 30 days:** set the allowlist root (once), toggle public mint, and run the creator airdrop.`);
  lines.push(`• **Signature minting — 37 days:** the creator can sign mint permissions.`);
  lines.push(`• **Public & allowlist minting:** no deadline once enabled — they stay open while configured.`);
  if (f) {
    lines.push(``);
    lines.push(`**${f.name}** (#${f.id}): creator window ${isCreatorWindowOpen(f) ? `open — ${timeLeft(creatorWindowEndsAt(f))}` : "closed (30 days elapsed)"}; signature window ${isSignatureWindowOpen(f) ? `open — ${timeLeft(signatureWindowEndsAt(f))}` : "closed (37 days elapsed)"}.`);
  }
  return { text: lines.join("\n"), links: [{ label: "Creator permissions & deadlines", href: "/docs/creator-permissions" }] };
}

function mintStatus(ctx: StewardCtx): StewardReply {
  const f = ctx.focus;
  if (!f) {
    return {
      text: `Pick a POAP and I'll tell you exactly who can mint it right now.`,
      links: [{ label: "Explore POAPs", href: "/explore" }],
    };
  }
  const a = mintAvailability(f);
  const parts: string[] = [];
  parts.push(`**${f.name}** (#${f.id}) · ${a.anyOpen ? "minting is open" : "minting is closed"}`);
  parts.push(``);
  parts.push(`• Public mint: ${a.publicOpen ? "✅ open — anyone can mint" : "⛔ closed"}`);
  parts.push(`• Allowlist: ${a.allowlistOpen ? "✅ open — eligible wallets only" : "⛔ not enabled"}`);
  parts.push(`• Signature: ${a.signatureOpen ? `✅ open — creator-signed, ${timeLeft(signatureWindowEndsAt(f))}` : "⛔ closed"}`);
  parts.push(``);
  parts.push(`Soulbound: ${f.isSoulbound ? "yes — locked, non-transferable" : "no — transferable"}. Minted so far: ${ctx.supply?.toString() ?? "…"}.`);
  return {
    text: parts.join("\n"),
    links: [{ label: `Open POAP #${f.id}`, href: `/poap/${f.id}` }],
  };
}

function shortAddr(a: string): string {
  return a.slice(0, 6) + "…" + a.slice(-4);
}
