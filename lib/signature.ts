import { encodePacked, keccak256, getAddress } from "viem";

/**
 * Signature-mint helpers.
 *
 * Contract check:
 *   message = keccak256(abi.encodePacked(eventId, block.chainid, msg.sender))
 *   signer  = message.toEthSignedMessageHash().recover(signature)
 *   signer must equal the event creator.
 *
 * With viem, signing `{ message: { raw: hash } }` applies the EIP-191
 * "\x19Ethereum Signed Message:\n32" prefix — exactly toEthSignedMessageHash.
 */

export function signatureDigest(
  eventId: bigint,
  chainId: bigint,
  recipient: `0x${string}`,
): `0x${string}` {
  return keccak256(
    encodePacked(
      ["uint256", "uint256", "address"],
      [eventId, chainId, getAddress(recipient)],
    ),
  );
}

/** Compact claim-link payload carried in the URL fragment (never hits a server). */
export interface ClaimPayload {
  v: 1;
  t: "sig" | "proof";
  eventId: string;
  chainId: number;
  /** signature mint: recipient + signature */
  recipient?: `0x${string}`;
  signature?: `0x${string}`;
  /** allowlist mint: proof for recipient */
  proof?: `0x${string}`[];
}

export function encodeClaimPayload(p: ClaimPayload): string {
  const json = JSON.stringify(p);
  // base64url — safe in a URL hash
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(json, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeClaimPayload(s: string): ClaimPayload | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window === "undefined"
        ? Buffer.from(b64, "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(b64)));
    const p = JSON.parse(json);
    if (p && p.v === 1 && (p.t === "sig" || p.t === "proof")) return p;
    return null;
  } catch {
    return null;
  }
}

export function claimUrl(origin: string, payload: ClaimPayload): string {
  return `${origin}/claim#${encodeClaimPayload(payload)}`;
}

/** Downloadable signatures.json shape */
export interface SignaturesFile {
  format: "onchain-poaps-signatures-v1";
  chainId: number;
  contract: string;
  eventId: string;
  signer: `0x${string}`;
  entries: {
    recipient: `0x${string}`;
    signature: `0x${string}`;
    claimUrl: string;
  }[];
}
