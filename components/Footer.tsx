import Link from "next/link";
import { EXPLORER_URL, POAP_ADDRESS } from "@/lib/contract";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-parchment/50 pb-20 md:pb-6">
      <div className="container-page flex flex-col gap-4 py-8 text-sm text-faded sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base font-bold text-ink">
            Onchain POAPs
          </p>
          <p className="mt-1 max-w-md text-[13px] leading-relaxed">
            Proof of attendance, forever onchain. Artwork &amp; metadata live
            100% on Base — no IPFS, no servers, no gatekeepers.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium">
          <Link href="/docs" className="hover:text-ink">Docs</Link>
          <a
            href={`${EXPLORER_URL}/address/${POAP_ADDRESS}#code`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            Contract ↗
          </a>
          <a
            href="https://github.com/jvaleskadevs/onchain-poaps"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            Protocol repo ↗
          </a>
          <span className="text-faded/60">MIT licensed</span>
        </div>
      </div>
    </footer>
  );
}
