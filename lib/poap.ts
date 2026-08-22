import { CREATOR_TIMELOCK, SIGNATURE_WINDOW } from "./contract";

/** Parsed onchain Event struct */
export interface PoapEvent {
  id: bigint;
  name: string;
  description: string;
  eventDate: bigint;
  location: string;
  allowlistRoot: `0x${string}`;
  svgPointer: `0x${string}`;
  creator: `0x${string}`;
  createdAt: bigint;
  externalUrl: string;
  isSoulbound: boolean;
  isPublic: boolean;
}

export type RawEventTuple = readonly [
  string, // name
  string, // description
  bigint, // eventDate
  string, // location
  `0x${string}`, // allowlistRoot
  `0x${string}`, // svgImage pointer
  `0x${string}`, // creator
  bigint, // createdAt
  string, // externalUrl
  boolean, // isSoulbound
  boolean, // isPublic
];

export const ZERO_ROOT =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

export function parseEvent(id: bigint, raw: RawEventTuple): PoapEvent {
  return {
    id,
    name: raw[0],
    description: raw[1],
    eventDate: raw[2],
    location: raw[3],
    allowlistRoot: raw[4],
    svgPointer: raw[5],
    creator: raw[6],
    createdAt: raw[7],
    externalUrl: raw[8],
    isSoulbound: raw[9],
    isPublic: raw[10],
  };
}

export function hasAllowlist(e: PoapEvent): boolean {
  return e.allowlistRoot !== ZERO_ROOT;
}

const nowSec = () => BigInt(Math.floor(Date.now() / 1000));

/** Creator functions (toggle public, set allowlist, creatorMint): first 30 days */
export function creatorWindowEndsAt(e: PoapEvent): bigint {
  return e.createdAt + CREATOR_TIMELOCK;
}
export function isCreatorWindowOpen(e: PoapEvent): boolean {
  return nowSec() <= creatorWindowEndsAt(e);
}

/** Signature minting: first 37 days */
export function signatureWindowEndsAt(e: PoapEvent): bigint {
  return e.createdAt + SIGNATURE_WINDOW;
}
export function isSignatureWindowOpen(e: PoapEvent): boolean {
  return nowSec() <= signatureWindowEndsAt(e);
}

/** Parse the base64 data-uri returned by uri() into JSON metadata */
export interface PoapMetadata {
  name: string;
  description: string;
  image: string; // data:image/svg+xml;base64,...
  external_url?: string;
  attributes?: { trait_type: string; value: string; display_type?: string }[];
}

export function parseTokenUri(dataUri: string): PoapMetadata | null {
  try {
    const prefix = "data:application/json;base64,";
    if (!dataUri.startsWith(prefix)) return null;
    const json = base64ToUtf8(dataUri.slice(prefix.length));
    return JSON.parse(json) as PoapMetadata;
  } catch {
    return null;
  }
}

/** Decode the SVG image data-uri to raw SVG markup */
export function svgFromImageUri(imageUri: string): string | null {
  try {
    const prefix = "data:image/svg+xml;base64,";
    if (!imageUri.startsWith(prefix)) return null;
    return base64ToUtf8(imageUri.slice(prefix.length));
  } catch {
    return null;
  }
}

function base64ToUtf8(b64: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(b64, "base64").toString("utf-8");
  }
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Distribution status summary used across the UI */
export interface MintAvailability {
  publicOpen: boolean;
  allowlistOpen: boolean;
  signatureOpen: boolean;
  anyOpen: boolean;
}

export function mintAvailability(e: PoapEvent): MintAvailability {
  const publicOpen = e.isPublic;
  const allowlistOpen = hasAllowlist(e);
  const signatureOpen = isSignatureWindowOpen(e);
  return {
    publicOpen,
    allowlistOpen,
    signatureOpen,
    anyOpen: publicOpen || allowlistOpen || signatureOpen,
  };
}
