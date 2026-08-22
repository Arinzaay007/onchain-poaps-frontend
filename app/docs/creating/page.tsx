import Link from "next/link";
import { LIMITS } from "@/lib/contract";

export const metadata = { title: "Creating a POAP" };

export default function Page() {
  return (
    <>
      <h1>Creating a POAP</h1>
      <p>
        Registration is a single transaction calling <code>registerEvent</code>.
        The <Link href="/create">create wizard</Link> walks you through it in
        four steps. Here&rsquo;s what each field means and what&rsquo;s permanent.
      </p>

      <h2>Fields</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Required</th><th>Limit</th><th>Notes</th></tr>
        </thead>
        <tbody>
          <tr><td>Name</td><td>✅</td><td>{LIMITS.name} chars</td><td>Displayed everywhere; becomes the NFT&rsquo;s name.</td></tr>
          <tr><td>SVG artwork</td><td>✅</td><td>practical ~24&nbsp;KB</td><td>Stored onchain forever. See <Link href="/docs/artwork">SVG artwork</Link>.</td></tr>
          <tr><td>Description</td><td>—</td><td>{LIMITS.description} chars</td><td>Shown on marketplaces and in this app.</td></tr>
          <tr><td>Location</td><td>—</td><td>{LIMITS.location} chars</td><td>Physical or virtual (&ldquo;Onchain&rdquo; is a fine location).</td></tr>
          <tr><td>Event date</td><td>—</td><td>unix timestamp</td><td>The date of the event itself (not registration).</td></tr>
          <tr><td>External URL</td><td>—</td><td>{LIMITS.externalUrl} chars</td><td>Link to your event/project site.</td></tr>
          <tr><td>Soulbound</td><td>flag</td><td>—</td><td><strong>Permanent.</strong> See <Link href="/docs/soulbound">soulbound</Link>.</td></tr>
          <tr><td>Public mint</td><td>flag</td><td>—</td><td>Can be toggled during the first 30 days.</td></tr>
          <tr><td>Allowlist root</td><td>—</td><td>bytes32</td><td>Set at registration or once within 30 days. See <Link href="/docs/allowlists">allowlists</Link>.</td></tr>
        </tbody>
      </table>

      <h2>What the flags mean technically</h2>
      <p>
        The contract packs soulbound + public into one <code>uint8 flags</code>:
        0 = neither, 1 = soulbound, 2 = public, 3 = both. The wizard handles
        this for you — you just flip two toggles.
      </p>

      <h2>POAP metadata — what lives onchain</h2>
      <p>
        When a marketplace asks for token metadata, the contract builds this
        JSON on the fly and returns it as a base64 data URI — no server involved:
      </p>
      <pre><code>{`{
  "name": "<your event name>",
  "description": "<your description>",
  "image": "data:image/svg+xml;base64,<your artwork>",
  "attributes": [
    { "trait_type": "Event",     "value": "<name>" },
    { "trait_type": "Location",  "value": "<location>" },
    { "trait_type": "Date",      "value": "<eventDate>", "display_type": "date" },
    { "trait_type": "EventId",   "value": "<id>" },
    { "trait_type": "Multichain EventId", "value": "eip155:<chainId>:<contract>:<id>" },
    { "trait_type": "Creator",   "value": "<creator address>" },
    { "trait_type": "Soulbound", "value": "true|false" }
  ],
  "external_url": "<your url>"
}`}</code></pre>
      <blockquote>
        Because the metadata JSON embeds your text directly, avoid double
        quotes (<code>&quot;</code>) and backslashes in the name/description —
        they can corrupt the JSON that marketplaces read. The wizard warns you
        about this.
      </blockquote>

      <h2>What can never change</h2>
      <ul>
        <li>Name, description, date, location, external URL, artwork</li>
        <li>The soulbound setting</li>
        <li>The allowlist root, once set</li>
        <li>Everything else too, after the 30-day creator window closes</li>
      </ul>
      <p>
        Treat registration like sending a letter to the future: check it twice,
        because there is no edit button. That&rsquo;s the point.
      </p>
    </>
  );
}
