import type { PoapEvent } from "@/lib/poap";
import {
  hasAllowlist,
  isSignatureWindowOpen,
  mintAvailability,
} from "@/lib/poap";

export function SoulboundBadge({ soulbound }: { soulbound: boolean }) {
  return soulbound ? (
    <span className="badge border border-stamp/30 bg-stamp/10 text-stamp">
      🔒 Soulbound
    </span>
  ) : (
    <span className="badge border border-mint/30 bg-mint/10 text-mint">
      ⇄ Transferable
    </span>
  );
}

export function StatusBadges({ event }: { event: PoapEvent }) {
  const a = mintAvailability(event);
  return (
    <div className="flex flex-wrap gap-1.5">
      {a.publicOpen && (
        <span className="badge border border-mint/30 bg-mint/10 text-mint">
          Public mint open
        </span>
      )}
      {hasAllowlist(event) && (
        <span className="badge border border-gold/40 bg-gold/10 text-gold">
          Allowlist
        </span>
      )}
      {isSignatureWindowOpen(event) && (
        <span className="badge border border-stamp/30 bg-stamp/10 text-stamp">
          Signature mint
        </span>
      )}
      {!a.anyOpen && (
        <span className="badge border border-line bg-parchment text-faded">
          Minting closed
        </span>
      )}
    </div>
  );
}
