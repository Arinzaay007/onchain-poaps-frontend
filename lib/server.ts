import { createPublicClient, http } from "viem";
import { ACTIVE_CHAIN } from "./contract";

/** Server-side viem client (generateMetadata, OG images) */
export const serverClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(
    ACTIVE_CHAIN.id === 8453
      ? process.env.NEXT_PUBLIC_RPC_BASE ?? undefined
      : process.env.NEXT_PUBLIC_RPC_BASE_SEPOLIA ?? "https://sepolia.base.org",
  ),
});

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
