"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useMiniApp } from "./MiniAppProvider";
import { shortAddress } from "@/lib/format";

/**
 * One connect control for both worlds:
 * - inside Farcaster: connect straight to the embedded wallet (auto-connects usually)
 * - on the web: RainbowKit modal
 */
export function ConnectControl() {
  const { isMiniApp, ready } = useMiniApp();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Stable placeholder while we detect the Farcaster context —
  // prevents the RainbowKit→Farcaster button swap flash on mobile.
  if (!ready) {
    return (
      <button className="btn-primary !py-1.5" disabled>
        Connect
      </button>
    );
  }

  if (isMiniApp) {
    if (isConnected && address) {
      return (
        <button
          onClick={() => disconnect()}
          className="btn-secondary !py-1.5 font-mono text-xs"
          title="Disconnect"
        >
          {shortAddress(address)}
        </button>
      );
    }
    const fc = connectors.find((c) => c.id === "farcaster");
    return (
      <button
        className="btn-primary !py-1.5"
        disabled={isPending}
        onClick={() => fc && connect({ connector: fc })}
      >
        {isPending ? "Connecting…" : "Connect"}
      </button>
    );
  }

  return (
    <ConnectButton
      showBalance={false}
      chainStatus="icon"
      accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
    />
  );
}
