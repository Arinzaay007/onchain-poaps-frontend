# Deployment & bounty-claim guide

End-to-end: deploy the app, publish the Farcaster Mini App, post the cast, submit the poidh claim.

## 1. Push to GitHub

```bash
cd onchain-poaps-frontend
git init && git add -A && git commit -m "Onchain POAPs frontend"
git remote add origin https://github.com/<you>/onchain-poaps-frontend.git
git push -u origin main
```

Make the repo **public** (bounty requirement — it's already MIT licensed).

## 2. Deploy to Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo. Framework auto-detects Next.js.
2. Environment variables (Project → Settings → Environment Variables):

   | Var | Value |
   |---|---|
   | `NEXT_PUBLIC_WC_PROJECT_ID` | your Reown project id |
   | `NEXT_PUBLIC_APP_URL` | your production URL, e.g. `https://onchain-poaps.vercel.app` (add after first deploy, then redeploy) |
   | `NEXT_PUBLIC_CHAIN` | `baseSepolia` (until mainnet contract exists) |

3. Deploy → note the URL → set `NEXT_PUBLIC_APP_URL` → **redeploy**.
4. In the [Reown dashboard](https://dashboard.reown.com), add the domain to your project's allowed origins.
5. Smoke-test on the live URL: explore, create a POAP on Base Sepolia, mint it, check the gallery.

## 3. Publish the Farcaster Mini App

1. Verify `https://<your-domain>/.well-known/farcaster.json` responds (it will, minus `accountAssociation`).
2. Generate the **account association** for your domain: Farcaster mobile app → Settings → Developer → Domains (or https://farcaster.xyz/~/developers/mini-apps/manifest) → enter your domain → sign. You get `header`, `payload`, `signature`.
3. Add them in Vercel as `NEXT_PUBLIC_FC_HEADER`, `NEXT_PUBLIC_FC_PAYLOAD`, `NEXT_PUBLIC_FC_SIGNATURE` → redeploy.
4. Validate with the Mini App debug tool: https://farcaster.xyz/~/developers/mini-apps/debug — paste your URL, confirm the embed renders and the app launches.

## 4. Post the cast

Cast text template (must tag both, include all three links):

> Built a full frontend for Onchain POAPs 🪙 — create, distribute & collect proof-of-attendance tokens that live 100% onchain on Base.
>
> Public mints, allowlists, QR signature claims at live events, and it runs right here as a Mini App 👇
>
> App: https://<your-domain>
> Repo: https://github.com/<you>/onchain-poaps-frontend
>
> @jvaleska.eth @kenny

The mini-app card renders automatically because the URL is in the cast (first embed). Screenshot the posted cast and copy its URL (share → copy link).

## 5. Submit the poidh claim

On [the bounty](https://poidh.xyz/base/bounty/1334), submit a claim including:
- ✅ Standalone app link (your Vercel URL)
- ✅ Mini App link (same URL — launchable in Farcaster; you can also link the cast where it's embedded)
- ✅ GitHub repo link
- ✅ Screenshot of the cast (upload as the claim image)
- ✅ Link to the cast (in the claim description)

## Switching to Base mainnet later

Set `NEXT_PUBLIC_CHAIN=base` and `NEXT_PUBLIC_POAP_ADDRESS_BASE=<mainnet address>` in Vercel, redeploy. Nothing else changes.
