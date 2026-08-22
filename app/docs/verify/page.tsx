import { EXPLORER_URL, POAP_ADDRESS, ACTIVE_CHAIN, IS_TESTNET } from "@/lib/contract";

export const metadata = { title: "Verifying POAPs" };

export default function Page() {
  const os = IS_TESTNET ? "https://testnets.opensea.io" : "https://opensea.io";
  return (
    <>
      <h1>Verifying POAPs</h1>
      <p>
        A POAP is only worth something if anyone can check it. Everything here
        is verifiable by third parties with no trust in this app.
      </p>

      <h2>Quick checks</h2>
      <ul>
        <li><strong>In this app:</strong> every POAP page and gallery item links directly to BaseScan and OpenSea. Your collection page reads balances live from the chain.</li>
        <li>
          <strong>On BaseScan:</strong> open the{" "}
          <a href={`${EXPLORER_URL}/address/${POAP_ADDRESS}`} target="_blank" rel="noreferrer">contract page</a>{" "}
          → <em>ERC-1155 Token Txns</em> shows every mint. A wallet&rsquo;s holdings appear under its own <em>Token Holdings</em> tab.
        </li>
        <li>
          <strong>On OpenSea:</strong> tokens live at{" "}
          <code>{os}/assets/{IS_TESTNET ? "base_sepolia" : "base"}/{POAP_ADDRESS.toLowerCase()}/&lt;eventId&gt;</code>.
          The artwork and metadata OpenSea shows come straight from the chain.
        </li>
      </ul>

      <h2>Verify like a skeptic (contract-level)</h2>
      <p>On the <a href={`${EXPLORER_URL}/address/${POAP_ADDRESS}#readContract`} target="_blank" rel="noreferrer">Read Contract</a> tab of BaseScan:</p>
      <ul>
        <li><code>balanceOf(wallet, eventId)</code> → <code>1</code> means the wallet holds that POAP.</li>
        <li><code>hasClaimed(eventId, wallet)</code> → <code>true</code> means the wallet minted it (relevant for transferable POAPs where the current holder may differ from the minter).</li>
        <li><code>events(eventId)</code> → the full event record: name, creator, timestamps, flags.</li>
        <li><code>uri(eventId)</code> → the complete metadata as a base64 data URI. Decode it (or paste into the browser address bar) and you&rsquo;re looking at the exact JSON + SVG stored onchain.</li>
        <li><code>totalSupply(eventId)</code> → how many were ever minted.</li>
      </ul>

      <h2>Verifying the mint event itself</h2>
      <p>
        Every mint emits <code>NewMint(eventId, recipient)</code>. On the
        contract&rsquo;s <em>Events</em> tab, filter by the event ID to get the
        complete, timestamped list of who minted and when — the raw attendance
        record. For soulbound POAPs, holding ⇔ minted; the two checks are
        equivalent.
      </p>

      <h2>Cross-chain identity</h2>
      <p>
        Each POAP has a CAIP-2 style global identifier baked into its metadata:{" "}
        <code>eip155:{ACTIVE_CHAIN.id}:{POAP_ADDRESS.toLowerCase()}:&lt;eventId&gt;</code>{" "}
        — a collision-proof reference to this exact POAP on this exact chain,
        usable by any external system.
      </p>
    </>
  );
}
