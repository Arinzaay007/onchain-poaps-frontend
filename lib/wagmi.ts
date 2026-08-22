"use client";

import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { ACTIVE_CHAIN } from "./contract";

const projectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "YOUR_WALLETCONNECT_PROJECT_ID";

const appName = "Onchain POAPs";

const rainbowConnectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        injectedWallet,
        metaMaskWallet,
        coinbaseWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  { appName, projectId },
);

export const wagmiConfig = createConfig({
  chains: ACTIVE_CHAIN.id === base.id ? [base] : [baseSepolia],
  // Farcaster Mini App connector first: it auto-connects inside Farcaster
  connectors: [farcasterMiniApp(), ...rainbowConnectors],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_BASE ?? undefined),
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_RPC_BASE_SEPOLIA ?? "https://sepolia.base.org",
    ),
  },
  ssr: true,
});
