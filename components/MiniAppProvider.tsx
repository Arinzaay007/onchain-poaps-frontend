"use client";

import {
  createContext,
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
}

const Ctx = createContext<MiniAppState>({ isMiniApp: false, ready: false });

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MiniAppState>({
    isMiniApp: false,
    ready: false,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const isMiniApp = await sdk.isInMiniApp();
        if (cancelled) return;
        setState({ isMiniApp, ready: true });
        if (isMiniApp) {
          // Hide the Farcaster splash screen once the app has rendered
          await sdk.actions.ready();
          // Prompt to add the Mini App — once, and only if not already added.
          try {
            const ctx = await sdk.context;
            const alreadyPrompted = localStorage.getItem("op:addPrompted");
            if (!ctx?.client?.added && !alreadyPrompted) {
              localStorage.setItem("op:addPrompted", "1");
              // slight delay so the user sees the app before the sheet appears
              setTimeout(() => {
                sdk.actions.addMiniApp().catch(() => {
                  /* user dismissed or invalid context — never block the app */
                });
              }, 1500);
            }
          } catch {
            /* context unavailable — skip the prompt */
          }
        }
      } catch {
        if (!cancelled) setState({ isMiniApp: false, ready: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
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
