import Link from "next/link";
import { StampLogo } from "./Navbar";
import { EXPLORER_URL, POAP_ADDRESS } from "@/lib/contract";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line/50 bg-[#181209] pb-24 text-paper/60 md:pb-10">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-[1fr,auto]">
        {/* Brand */}
        <div className="max-w-md">
          <div className="flex items-center gap-2.5">
            <StampLogo className="h-8 w-8" />
            <span className="font-display text-lg font-bold text-paper">
              Onchain POAPs
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed">
            Proof of attendance, forever onchain. Artwork &amp; metadata live
            100% on Base — no IPFS, no servers, no gatekeepers.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/40">
            ✦ stamped, not stored ✦
          </p>
        </div>

        {/* Nav */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-[13px] font-medium">
          <Link href="/explore" className="hover:text-paper">Explore</Link>
          <Link href="/create" className="hover:text-paper">Create</Link>
          <Link href="/verify" className="hover:text-paper">Verify</Link>
          <Link href="/docs" className="hover:text-paper">Docs</Link>
          <Link href="/gallery" className="hover:text-paper">My collection</Link>
          <Link href="/steward" className="hover:text-paper">Steward</Link>
          <Link href="/unstoppable" className="hover:text-paper">Unstoppable export</Link>
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
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-4 text-[11px] font-medium text-paper/35">
          <span>Open source · MIT licensed</span>
          <span className="font-mono uppercase tracking-widest">
            onchain-poaps · build on Base
          </span>
        </div>
      </div>
    </footer>
  );
}
