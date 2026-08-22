import { base, baseSepolia } from "wagmi/chains";

/**
 * OnchainPOAPs contract — Base Sepolia deployment (source of truth for testing).
 * Mainnet address can be provided via env once deployed.
 */
export const POAP_ADDRESSES: Record<number, `0x${string}` | undefined> = {
  [baseSepolia.id]: (process.env.NEXT_PUBLIC_POAP_ADDRESS_BASE_SEPOLIA ??
    "0xC3249356a483fbe17d5355D39105D2eA666d9de6") as `0x${string}`,
  [base.id]: process.env.NEXT_PUBLIC_POAP_ADDRESS_BASE as
    | `0x${string}`
    | undefined,
};

/** Active chain: "base" or "baseSepolia" via env. Defaults to Base Sepolia (testnet). */
export const ACTIVE_CHAIN =
  process.env.NEXT_PUBLIC_CHAIN === "base" ? base : baseSepolia;

export const POAP_ADDRESS = POAP_ADDRESSES[ACTIVE_CHAIN.id]!;

export const IS_TESTNET = ACTIVE_CHAIN.id === baseSepolia.id;

export const EXPLORER_URL = IS_TESTNET
  ? "https://sepolia.basescan.org"
  : "https://basescan.org";

export const OPENSEA_ASSET_URL = (tokenId: bigint | number | string) =>
  IS_TESTNET
    ? `https://testnets.opensea.io/assets/base_sepolia/${POAP_ADDRESS}/${tokenId}`
    : `https://opensea.io/assets/base/${POAP_ADDRESS}/${tokenId}`;

/** Contract timing constants (seconds) — mirrors Poap.sol */
export const CREATOR_TIMELOCK = 30n * 24n * 60n * 60n; // 30 days
export const SIGNATURE_GRACE = 7n * 24n * 60n * 60n; // +7 days
export const SIGNATURE_WINDOW = CREATOR_TIMELOCK + SIGNATURE_GRACE; // 37 days

/** Contract field limits — mirrors Poap.sol validation */
export const LIMITS = {
  name: 128,
  description: 512,
  location: 128,
  externalUrl: 128,
  creatorMintBatch: 101,
} as const;

/** flags: 0 = none, 1 = soulbound, 2 = public, 3 = soulbound + public */
export function encodeFlags(isSoulbound: boolean, isPublic: boolean): number {
  return (isSoulbound ? 1 : 0) + (isPublic ? 2 : 0);
}

export const POAP_ABI = [
  // ---- errors (so viem decodes reverts nicely) ----
  { type: "error", name: "POAP__InvalidValue", inputs: [{ name: "field", type: "string" }] },
  { type: "error", name: "POAP__TimeLockExpired", inputs: [] },
  { type: "error", name: "POAP__OnlyCreator", inputs: [] },
  { type: "error", name: "POAP__AlreadyClaimed", inputs: [] },
  { type: "error", name: "POAP__EventNotPublic", inputs: [] },
  { type: "error", name: "POAP__AllowlistNotEnabled", inputs: [] },
  { type: "error", name: "POAP__RootAlreadySet", inputs: [] },
  { type: "error", name: "POAP__SoulboundNotTransferable", inputs: [] },
  // ---- write ----
  {
    type: "function",
    name: "registerEvent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "eventDate", type: "uint256" },
      { name: "location", type: "string" },
      { name: "allowlistRoot", type: "bytes32" },
      { name: "svgImage", type: "string" },
      { name: "externalUrl", type: "string" },
      { name: "flags", type: "uint8" },
    ],
    outputs: [{ name: "eventId", type: "uint256" }],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "allowlistMint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "merkleProof", type: "bytes32[]" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "mintWithSignature",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "creatorMint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "recipients", type: "address[]" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "updateAllowlistRoot",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "newRoot", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "updateEventPublic",
    stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "isPublic", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "safeTransferFrom",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "id", type: "uint256" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
  },
  // ---- read ----
  {
    type: "function",
    name: "events",
    stateMutability: "view",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "eventDate", type: "uint256" },
      { name: "location", type: "string" },
      { name: "allowlistRoot", type: "bytes32" },
      { name: "svgImage", type: "address" },
      { name: "creator", type: "address" },
      { name: "createdAt", type: "uint256" },
      { name: "externalUrl", type: "string" },
      { name: "isSoulbound", type: "bool" },
      { name: "isPublic", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "hasClaimed",
    stateMutability: "view",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "account", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "totalEvents",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "uri",
    stateMutability: "view",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "getMultichainEventId",
    stateMutability: "view",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
  // ---- events ----
  {
    type: "event",
    name: "NewEvent",
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "creator", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "NewMint",
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "recipient", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "AllowlistUpdated",
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "newRoot", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "EventPublicUpdated",
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "isPublic", type: "bool", indexed: false },
    ],
  },
] as const;
