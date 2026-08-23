"use client";

import { useState } from "react";
import { useMiniApp } from "./MiniAppProvider";

/**
 * Thin banner inside the Farcaster Mini App inviting the user to pin the app.
 * Tapping "Add" triggers the native sheet from a user gesture — the reliable
 * path on clients that suppress automatic prompts.
 */
export function AddAppBanner() {
  const { isMiniApp, ready, added, promptAdd } = useMiniApp();
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!ready || !isMiniApp || added || hidden) return null;

  return (
    <div className="border-b border-accent/20 bg-accent/10">
      <div className="container-page flex items-center gap-3 py-2">
        <span className="text-base" aria-hidden>
          📌
        </span>
        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">
          Keep Onchain POAPs one tap away
        </p>
        <button
          className="btn-primary !px-3 !py-1 !text-xs"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const ok = await promptAdd();
            setBusy(false);
            if (!ok) setHidden(true); // dismissed — don't nag this session
          }}
        >
          {busy ? "…" : "Add app"}
        </button>
        <button
          className="p-1 text-faded hover:text-ink"
          aria-label="Dismiss"
          onClick={() => setHidden(true)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
