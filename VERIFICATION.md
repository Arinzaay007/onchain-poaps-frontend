# Verification — Onchain POAPs Frontend

This app was tested against the real contract. Nothing here is mocked. The
frontend reads and transacts against the provided, **unmodified** contract:

- **Contract:** `OnchainPOAPs` (ERC-1155)
- **Base Sepolia:** `0xC3249356a483fbe17d5355D39105D2eA666d9de6`
- **Repository (unmodified):** https://github.com/jvaleskadevs/onchain-poaps.git

## Merkle-proof correctness

The contract uses **single-hashed leaves**:
`leaf = keccak256(abi.encodePacked(address))`. The app uses
`@openzeppelin/merkle-tree`'s `SimpleMerkleTree` with **pre-hashed leaves**, so
the on-chain root matches the app exactly (a naive `StandardMerkleTree` would
double-hash and fail).

Sanity check (from the contract's own Foundry test vectors / observed state):

- Addresses:
  - `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
  - `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Sorted-pair root: `0x343750465941b29921f50a28e0e43050e5e1c2611a3ea8d7fe1001090d5e1436`
- Proof for the first address matches the second leaf.

## Live contract-state checks (real `eth_call` on Base Sepolia)

| Check | Result |
|---|---|
| `totalEvents()` | reads the live event count |
| `events(id)` for id 0..N | parses name, flags, creator, timestamps |
| `uri(id)` | decodes the base64 JSON metadata + embedded SVG image |
| `totalSupply(id)` | reads mint counts |
| `balanceOf(addr, id)` / `hasClaimed(id, addr)` | ownership & mint flags |

## Full transaction journey (Base Sepolia fork, `anvil`)

Every flow was executed as a **real transaction** against a fork of the live
deployment (Base Sepolia, chain id `84532`). All **11 steps passed**:

1. Parse a messy allowlist address list → 3 valid, 1 duplicate, 1 invalid.
2. `registerEvent` creates a soulbound, public-off POAP (new event id).
3. `updateAllowlistRoot` succeeds.
4. Second root set → reverts `POAP__RootAlreadySet`.
5. Three `allowlistMint` calls succeed; balances = 1 each.
6. Outsider + stolen proof → reverts `POAP__InvalidValue(proof)`.
7. Double-mint → reverts `POAP__AlreadyClaimed`.
8. Creator-signed `mintWithSignature` succeeds.
9. `updateEventPublic`→`true`; `isPublic = true`.
10. Soulbound transfer → reverts `POAP__SoulboundNotTransferable`.
11. After `evm_increaseTime` 31 days → setting root reverts `POAP__TimeLockExpired`.

Plus live (non-fork) simulations confirming:
- `mint(0)` from a fresh wallet succeeds.
- `mint(2)` on a non-public event reverts `POAP__EventNotPublic`.
- `mintWithSignature(0)` with a non-creator signature reverts
  `POAP__InvalidValue(signer)`.
- Registering with empty name / over-length name / empty SVG reverts as the
  contract requires.

## Signature-mint digest

`keccak256(abi.encodePacked(eventId, block.chainid, msg.sender))`, then
`toEthSignedMessageHash().recover(signature)` must equal the creator. The app
signs with viem `signMessage({ message: { raw: digest } })`, which applies the
same EIP-191 prefix the contract expects.

## Edge stack verified live

- **Unstoppable export** — a single self-contained HTML file that reads the
  contract directly over JSON-RPC against public Base RPCs (with fallback +
  retry). Verified to list all live POAPs with names, real artwork, and
  soulbound/transferable flags.
- **Live-event kiosk** — fullscreen creator-gated signing screen; the
  signature-window and creator checks are read from the chain.
- **Attestation receipt** — one-page frameable proof with wallet, collector #,
  mint tx hash and a verify QR.

## Mints onchain

A live mint was confirmed on POAP **#4** (`Poidh x Poap campaign`). Collector
numbers, mints, and supply are pulled straight from the contract's mint logs.
