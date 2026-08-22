import Link from "next/link";
import { EXPLORER_URL, POAP_ADDRESS } from "@/lib/contract";

export function Footer() {
  return (
    <footer className="mt-16 bg-ink pb-20 text-paper/60 md:pb-6">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-paper">
            Onchain POAPs
          </p>
          <p className="mt-1.5 max-w-md text-[13px] leading-relaxed">
            Proof of attendance, forever onchain. Artwork &amp; metadata live
            100% on Base — no IPFS, no servers, no gatekeepers.
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/35">
            ✦ stamped, not stored ✦
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13px] font-medium sm:text-right">
          <Link href="/explore" className="hover:text-paper">Explore</Link>
          <Link href="/create" className="hover:text-paper">Create</Link>
          <Link href="/verify" className="hover:text-paper">Verify</Link>
          <Link href="/docs" className="hover:text-paper">Docs</Link>
          <a
            href={`${EXPLORER_URL}/address/${POAP_ADDRESS}#code`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-paper"
          >
            Contract ↗
          </a>
          <a
            href="https://github.com/jvaleskadevs/onchain-poaps"
            target="_blank"
            rel="noreferrer"
            className="hover:text-paper"
          >
            Protocol repo ↗
          </a>
          <span className="col-span-2 mt-2 text-paper/35 sm:text-right">
            Open source · MIT licensed
          </span>
        </div>
      </div>
    </footer>
  );
}
