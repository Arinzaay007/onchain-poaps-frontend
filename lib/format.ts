/** Formatting + misc helpers */

export function shortAddress(addr?: string, chars = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export function formatDate(tsSeconds: bigint | number): string {
  const n = Number(tsSeconds);
  if (!n) return "—";
  return new Date(n * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(tsSeconds: bigint | number): string {
  const n = Number(tsSeconds);
  if (!n) return "—";
  return new Date(n * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "12d 4h left" | "3h 12m left" | "ended" */
export function timeLeft(endsAtSeconds: bigint): string {
  const ms = Number(endsAtSeconds) * 1000 - Date.now();
  if (ms <= 0) return "ended";
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${m}m left`;
  return `${m}m left`;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Human-readable byte size */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

/** Friendly names for known contract revert errors */
export function friendlyError(err: unknown): string {
  const msg =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  if (msg.includes("POAP__AlreadyClaimed"))
    return "This wallet has already claimed this POAP (max 1 per wallet).";
  if (msg.includes("POAP__TimeLockExpired"))
    return "The time window for this action has expired.";
  if (msg.includes("POAP__OnlyCreator"))
    return "Only the POAP creator can do this.";
  if (msg.includes("POAP__EventNotPublic"))
    return "Public minting is not enabled for this POAP.";
  if (msg.includes("POAP__AllowlistNotEnabled"))
    return "This POAP has no allowlist configured.";
  if (msg.includes("POAP__RootAlreadySet"))
    return "The allowlist has already been set — it can only be set once.";
  if (msg.includes("POAP__SoulboundNotTransferable"))
    return "This POAP is soulbound and cannot be transferred.";
  if (msg.includes('POAP__InvalidValue("proof")') || msg.includes("proof"))
    return "Invalid Merkle proof — this wallet may not be on the allowlist.";
  if (msg.includes('POAP__InvalidValue("signer")') || msg.includes("signer"))
    return "Invalid signature — it was not signed by the POAP creator for this wallet.";
  if (msg.toLowerCase().includes("user rejected") || msg.includes("denied"))
    return "Transaction rejected in wallet.";
  if (msg.toLowerCase().includes("insufficient funds"))
    return "Insufficient ETH for gas. On Base Sepolia, grab test ETH from a faucet.";
  // Trim viem's long messages
  const firstLine = msg.split("\n")[0];
  return firstLine.length > 160 ? firstLine.slice(0, 157) + "…" : firstLine || "Transaction failed.";
}
