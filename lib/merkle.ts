import { SimpleMerkleTree } from "@openzeppelin/merkle-tree";
import { encodePacked, isAddress, keccak256, getAddress } from "viem";

/**
 * Allowlist Merkle helpers.
 *
 * The contract verifies: leaf = keccak256(abi.encodePacked(msg.sender))
 * against OpenZeppelin MerkleProof (commutative keccak256 pair hashing).
 * SimpleMerkleTree matches that exactly when fed pre-hashed leaves.
 */

export function leafFor(address: `0x${string}`): `0x${string}` {
  return keccak256(encodePacked(["address"], [getAddress(address)]));
}

export interface AllowlistData {
  root: `0x${string}`;
  /** checksummed address -> proof */
  proofs: Record<string, `0x${string}`[]>;
  addresses: `0x${string}`[];
}

/** Parse a pasted / uploaded list: newline, comma, semicolon or whitespace separated. */
export function parseAddressList(input: string): {
  valid: `0x${string}`[];
  invalid: string[];
  duplicates: number;
} {
  const tokens = input
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const valid: `0x${string}`[] = [];
  const invalid: string[] = [];
  let duplicates = 0;
  for (const t of tokens) {
    if (!isAddress(t)) {
      invalid.push(t);
      continue;
    }
    const checksummed = getAddress(t);
    if (seen.has(checksummed)) {
      duplicates++;
      continue;
    }
    seen.add(checksummed);
    valid.push(checksummed);
  }
  return { valid, invalid, duplicates };
}

/** Build the tree + a proof for every address. */
export function buildAllowlist(addresses: `0x${string}`[]): AllowlistData {
  if (addresses.length === 0) throw new Error("Empty address list");
  const checksummed = addresses.map((a) => getAddress(a));
  const leaves = checksummed.map((a) => leafFor(a));
  const tree = SimpleMerkleTree.of(leaves);
  const proofs: Record<string, `0x${string}`[]> = {};
  checksummed.forEach((addr, i) => {
    proofs[addr] = tree.getProof(leaves[i]) as `0x${string}`[];
  });
  return { root: tree.root as `0x${string}`, proofs, addresses: checksummed };
}

/** Look up a proof for an address (case-insensitive). */
export function proofFor(
  data: AllowlistData,
  address: string,
): `0x${string}`[] | null {
  if (!isAddress(address)) return null;
  return data.proofs[getAddress(address)] ?? null;
}

/** Downloadable proofs.json shape (also what the claim page accepts). */
export interface ProofsFile {
  format: "onchain-poaps-allowlist-v1";
  chainId: number;
  contract: string;
  eventId: string;
  root: `0x${string}`;
  proofs: Record<string, `0x${string}`[]>;
}

export function makeProofsFile(
  data: AllowlistData,
  chainId: number,
  contract: string,
  eventId: bigint,
): ProofsFile {
  return {
    format: "onchain-poaps-allowlist-v1",
    chainId,
    contract,
    eventId: eventId.toString(),
    root: data.root,
    proofs: data.proofs,
  };
}
