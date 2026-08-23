"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface MiniAppState {
  /** true once we know we're inside a Farcaster Mini App host */
  isMiniApp: boolean;
  /** resolved after first check */
  ready: boolean;
  /** whether the user has added the Mini App to their apps */
  added: boolean;
  /** trigger the native "Add Mini App" sheet (must be called from a user gesture) */
  promptAdd: () => Promise<boolean>;
}

const Ctx = createContext<MiniAppState>({
  isMiniApp: false,
  ready: false,
  added: true,
  promptAdd: async () => false,
});

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    isMiniApp: false,
    ready: false,
    added: true, // assume added until proven otherwise (avoids banner flash)
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const isMiniApp = await sdk.isInMiniApp();
        if (cancelled) return;
        if (!isMiniApp) {
          setState({ isMiniApp: false, ready: true, added: true });
          return;
        }
        // Hide the Farcaster splash screen once the app has rendered
        await sdk.actions.ready();
        let added = true;
        try {
          const ctx = await sdk.context;
          added = !!ctx?.client?.added;
        } catch {
          /* context unavailable — keep banner hidden */
        }
        if (cancelled) return;
        setState({ isMiniApp: true, ready: true, added });
        // gentle one-time auto-prompt (banner remains as the reliable path)
        if (!added && !localStorage.getItem("op:addPrompted")) {
          localStorage.setItem("op:addPrompted", "1");
          setTimeout(() => {
            sdk.actions
              .addMiniApp()
              .then(() => setState((s) => ({ ...s, added: true })))
              .catch(() => {
                /* dismissed — banner still available */
              });
          }, 1500);
        }
      } catch {
        if (!cancelled) setState({ isMiniApp: false, ready: true, added: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const promptAdd = useCallback(async () => {
    try {
      await sdk.actions.addMiniApp();
      setState((s) => ({ ...s, added: true }));
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <Ctx.Provider value={{ ...state, promptAdd }}>{children}</Ctx.Provider>
  );
}

export function useMiniApp() {
  return useContext(Ctx);
}

/** Compose a cast from inside the Mini App (no-op outside). */
export async function composeCast(text: string, embeds: string[] = []) {
  try {
    await sdk.actions.composeCast({
      text,
      embeds: embeds.slice(0, 2) as [] | [string] | [string, string],
    });
  } catch {
    /* outside mini app or user cancelled */
  }
}
