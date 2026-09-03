import type { Metadata } from "next";
import { StewardAgent } from "@/components/StewardAgent";

export const metadata: Metadata = {
  title: "Steward — the onchain assistant",
  description:
    "A deterministic assistant that answers from the live Onchain POAPs contract — plan a drop, check minting, set up allowlists, no server, no AI bill.",
};

export default function StewardPage() {
  return (
    <div className="container-page max-w-2xl py-10">
      <span className="eyebrow">The Steward</span>
      <h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">
        Ask the onchain assistant
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-faded">
        Unlike a chatbot, the Steward doesn&rsquo;t call an external AI. It reads
        the actual contract on Base and answers from real chain state — free,
        always-on, and with nothing to go down. It can plan a drop, explain who
        can mint right now, and point you at the right distribution flow.
      </p>

      <div className="mt-6">
        <StewardAgent />
      </div>
    </div>
  );
}
