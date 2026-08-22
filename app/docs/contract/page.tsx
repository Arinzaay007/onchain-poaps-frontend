import { EXPLORER_URL, POAP_ADDRESS, ACTIVE_CHAIN } from "@/lib/contract";

export const metadata = { title: "Contract reference" };

export default function Page() {
  return (
    <>
      <h1>Contract reference</h1>
      <p>
        <code>OnchainPOAPs</code> — ERC-1155 + ERC-1155 Supply, deployed at{" "}
        <a href={`${EXPLORER_URL}/address/${POAP_ADDRESS}#code`} target="_blank" rel="noreferrer">
          <code>{POAP_ADDRESS}</code>
        </a>{" "}
        on {ACTIVE_CHAIN.name} (chain ID {ACTIVE_CHAIN.id}). Source:{" "}
        <a href="https://github.com/jvaleskadevs/onchain-poaps" target="_blank" rel="noreferrer">
          jvaleskadevs/onchain-poaps
        </a>. Event ID == token ID. Event 0 is the genesis POAP created at deployment.
      </p>

      <h2>Write functions</h2>
      <table>
        <thead><tr><th>Function</th><th>Access</th><th>Notes</th></tr></thead>
        <tbody>
          <tr>
            <td><code>registerEvent(name, description, eventDate, location, allowlistRoot, svgImage, externalUrl, flags)</code></td>
            <td>anyone</td>
            <td>Creates a POAP, returns new <code>eventId</code>. <code>flags</code>: 0 none / 1 soulbound / 2 public / 3 both. Validation: name 1–128, description ≤512, location ≤128, url ≤128, svg non-empty.</td>
          </tr>
          <tr><td><code>mint(eventId)</code></td><td>anyone</td><td>Public mint. Requires <code>isPublic</code>. 1 per wallet.</td></tr>
          <tr><td><code>allowlistMint(eventId, merkleProof)</code></td><td>listed wallets</td><td>Requires root set. Leaf = <code>keccak256(abi.encodePacked(msg.sender))</code>.</td></tr>
          <tr><td><code>mintWithSignature(eventId, signature)</code></td><td>authorized wallet</td><td>Creator&rsquo;s EIP-191 signature over <code>keccak256(abi.encodePacked(eventId, chainid, msg.sender))</code>. Days 0–37 only.</td></tr>
          <tr><td><code>creatorMint(eventId, recipients[])</code></td><td>creator</td><td>Airdrop ≤101 recipients; skips already-claimed. Days 0–30.</td></tr>
          <tr><td><code>updateAllowlistRoot(eventId, newRoot)</code></td><td>creator</td><td>Once ever. Days 0–30.</td></tr>
          <tr><td><code>updateEventPublic(eventId, isPublic)</code></td><td>creator</td><td>Toggle. Days 0–30.</td></tr>
        </tbody>
      </table>

      <h2>Read functions</h2>
      <table>
        <thead><tr><th>Function</th><th>Returns</th></tr></thead>
        <tbody>
          <tr><td><code>events(eventId)</code></td><td>Full event struct: name, description, eventDate, location, allowlistRoot, svgImage (SSTORE2 pointer), creator, createdAt, externalUrl, isSoulbound, isPublic</td></tr>
          <tr><td><code>hasClaimed(eventId, account)</code></td><td>whether a wallet already minted</td></tr>
          <tr><td><code>totalEvents()</code></td><td>highest event ID (IDs are 0…totalEvents)</td></tr>
          <tr><td><code>totalSupply(eventId)</code></td><td>mints per event</td></tr>
          <tr><td><code>balanceOf(account, eventId)</code></td><td>0 or 1</td></tr>
          <tr><td><code>uri(eventId)</code></td><td>full metadata as <code>data:application/json;base64,…</code></td></tr>
          <tr><td><code>getMultichainEventId(eventId)</code></td><td><code>eip155:&#123;chainId&#125;:&#123;contract&#125;:&#123;eventId&#125;</code></td></tr>
        </tbody>
      </table>

      <h2>Events</h2>
      <ul>
        <li><code>NewEvent(eventId, name, creator)</code></li>
        <li><code>NewMint(eventId, recipient)</code></li>
        <li><code>AllowlistUpdated(eventId, newRoot)</code></li>
        <li><code>EventPublicUpdated(eventId, isPublic)</code></li>
      </ul>

      <h2>Custom errors</h2>
      <table>
        <thead><tr><th>Error</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td><code>POAP__InvalidValue(field)</code></td><td>A parameter failed validation (the field name is included: &ldquo;name&rdquo;, &ldquo;svg&rdquo;, &ldquo;proof&rdquo;, &ldquo;signer&rdquo;, …)</td></tr>
          <tr><td><code>POAP__TimeLockExpired()</code></td><td>Creator/signature window has passed</td></tr>
          <tr><td><code>POAP__OnlyCreator()</code></td><td>Caller is not the event creator</td></tr>
          <tr><td><code>POAP__AlreadyClaimed()</code></td><td>Wallet already has this POAP</td></tr>
          <tr><td><code>POAP__EventNotPublic()</code></td><td>Public mint is off</td></tr>
          <tr><td><code>POAP__AllowlistNotEnabled()</code></td><td>No allowlist root set</td></tr>
          <tr><td><code>POAP__RootAlreadySet()</code></td><td>Allowlist root is one-shot</td></tr>
          <tr><td><code>POAP__SoulboundNotTransferable()</code></td><td>Transfer attempted on a soulbound token</td></tr>
        </tbody>
      </table>

      <h2>Storage design</h2>
      <p>
        The SVG is base64-encoded and written via <strong>SSTORE2</strong> —
        stored as bytecode of a tiny auxiliary contract, roughly 10× cheaper
        than regular storage writes, capped near 24.5 KB. <code>uri()</code>{" "}
        reads it back and assembles the metadata JSON in memory. Nothing about
        a POAP references anything offchain.
      </p>
    </>
  );
}
