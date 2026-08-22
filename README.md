# Onchain POAPs — Frontend

A fully functional, open-source frontend for the [Onchain POAPs](https://github.com/jvaleskadevs/onchain-poaps) protocol — proof-of-attendance tokens whose SVG artwork and metadata live **100% onchain** on Base. Works as a standalone website **and** as a Farcaster Mini App.

Built for [poidh bounty #1334](https://poidh.xyz/base/bounty/1334).

## Features

**For creators**
- 🎨 4-step registration wizard with live artwork preview, in-browser **SVGO optimization**, byte/gas estimates and SVG validation
- 🔓 Public mint open/close controls with live 30-day-window countdowns
- 📋 Allowlist workflow: paste addresses → Merkle root built client-side → one-tx setup → auto-download `proofs.json`, per-wallet claim links CSV, root re-verification/proof regeneration
- ✍️ Signature minting: **live event mode** (sign → claim QR in seconds at the door) and **batch mode** (signatures.json, claim-links CSV, printable QR sheet for badges)
- 📦 Direct airdrop (`creatorMint`) to up to 101 wallets per tx

**For collectors**
- 🪙 Explore all POAPs with mintability filters
- ⚡ Every enabled mint path: public, allowlist (paste proofs or one-tap claim links), signature (claim links/QR)
- 🎫 Serverless claim links — the URL fragment carries the proof/signature; nothing ever touches a server
- 📖 Stamp-album gallery of owned POAPs with OpenSea/BaseScan verification
- 📚 Full in-app documentation of the entire protocol

**Farcaster Mini App**
- Auto-connects the Farcaster embedded wallet, safe-area handling, bottom tab nav
- Every POAP page is castable as its own mini-app card (dynamic OG image + `fc:miniapp` embed) — followers mint without leaving the feed
- Share-as-cast after creating/minting

## Stack

Next.js 14 (App Router) · TypeScript · wagmi v2 + viem · RainbowKit · `@farcaster/miniapp-sdk` + wagmi connector · `@openzeppelin/merkle-tree` · SVGO (browser) · Tailwind CSS. **No backend, no database** — all state is read from Base via RPC.

## Quick start

```bash
git clone <this-repo>
cd onchain-poaps-frontend
npm install
cp .env.example .env.local   # add your WalletConnect project id
npm run dev
```

Open http://localhost:3000. The app points at the **Base Sepolia** contract `0xC3249356a483fbe17d5355D39105D2eA666d9de6` by default — grab test ETH from any Base Sepolia faucet and everything works end-to-end.

### Environment variables

See [.env.example](./.env.example). Only `NEXT_PUBLIC_WC_PROJECT_ID` is required for local dev; `NEXT_PUBLIC_APP_URL` and the Farcaster association vars matter in production. Switch to mainnet with `NEXT_PUBLIC_CHAIN=base` + `NEXT_PUBLIC_POAP_ADDRESS_BASE=0x…` once the contract is deployed there.

## Deployment

Full walkthrough (Vercel + Farcaster Mini App publishing + cast checklist): **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## Project structure

```
app/                    pages (App Router)
  create/               registration wizard
  explore/              all POAPs
  poap/[id]/            POAP detail + mint panel
  poap/[id]/manage/     creator dashboard (toggle, allowlist, signatures, airdrop)
  poap/[id]/og/         dynamic OG image (per-POAP Farcaster cards)
  claim/                claim-link / QR landing page
  gallery/              owned-POAPs album
  docs/                 in-app documentation
  .well-known/farcaster.json/   Mini App manifest
components/             UI building blocks (stamp frame, mint panel, providers…)
lib/                    contract ABI/config, merkle, signatures, svg, hooks
```

## How the tricky parts work

- **Merkle allowlists** — leaf = `keccak256(abi.encodePacked(address))`, tree built with `@openzeppelin/merkle-tree` (`SimpleMerkleTree`) in the browser, exactly matching the contract's `MerkleProof.verify`. Verified against the contract's own Foundry test vectors.
- **Signature mints** — the creator signs `keccak256(abi.encodePacked(eventId, chainId, recipient))` as an EIP-191 personal message (viem `signMessage({ raw })`), which matches `toEthSignedMessageHash().recover()` in the contract.
- **Claim links** — proof/signature payloads are base64url-encoded into the URL **fragment** (`/claim#…`), so they work as QR codes and never hit any server.

## License

[MIT](./LICENSE)
