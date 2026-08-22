"use client";

import { useCallback, useState } from "react";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import type { TransactionReceipt } from "viem";
import { ACTIVE_CHAIN } from "./contract";
import { friendlyError } from "./format";

export type TxStatus = "idle" | "wallet" | "pending" | "success" | "error";

/**
 * Wraps write → wait-for-receipt with chain switching and friendly errors.
 */
export function useTx() {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: ACTIVE_CHAIN.id });

  const send = useCallback(
    async (
      params: Parameters<typeof writeContractAsync>[0],
    ): Promise<`0x${string}` | null> => {
      setStatus("wallet");
      setError(null);
      setHash(null);
      try {
        if (chainId !== ACTIVE_CHAIN.id) {
          await switchChainAsync({ chainId: ACTIVE_CHAIN.id });
        }
        const h = await writeContractAsync({
          ...params,
          chainId: ACTIVE_CHAIN.id,
        } as never);
        setHash(h);
        setStatus("pending");
        const rcpt = await publicClient!.waitForTransactionReceipt({ hash: h });
        setReceipt(rcpt);
        setStatus("success");
        return h;
      } catch (e) {
        setError(friendlyError(e));
        setStatus("error");
        return null;
      }
    },
    [chainId, switchChainAsync, writeContractAsync, publicClient],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setHash(null);
    setReceipt(null);
  }, []);

  return { send, status, error, hash, receipt, reset, busy: status === "wallet" || status === "pending" };
}
