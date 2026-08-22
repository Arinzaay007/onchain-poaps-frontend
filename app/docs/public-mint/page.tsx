import Link from "next/link";

export const metadata = { title: "Public minting" };

export default function Page() {
  return (
    <>
      <h1>Public minting</h1>
      <p>
        The simplest method: when public minting is <strong>open</strong>,
        anyone can visit the POAP page, connect a wallet, and mint — one per
        wallet, paying only their own gas.
      </p>

      <h2>For creators</h2>
      <ul>
        <li>Enable it at registration (the &ldquo;Public mint&rdquo; toggle) or later from the manage dashboard.</li>
        <li>You can <strong>open and close it as often as you like during the first 30 days</strong> after registration — useful for limited-time windows.</li>
        <li>After 30 days the toggle locks forever in whatever state it&rsquo;s in. If you leave it open, it stays open permanently; if closed, closed forever.</li>
        <li>There is no supply cap other than 1 per wallet.</li>
      </ul>

      <h2>For minters</h2>
      <ul>
        <li>If the POAP page shows a <em>Public mint open</em> badge, you can mint right now.</li>
        <li>Minting is free — the only cost is Base gas, typically far below $0.01.</li>
        <li>If you see <code>POAP__EventNotPublic</code>, the creator has closed public minting — check whether an allowlist or signature path applies to you.</li>
      </ul>

      <h2>Sharing a public mint</h2>
      <ul>
        <li>Share the POAP page URL anywhere.</li>
        <li>On Farcaster, casting the POAP page link renders a <strong>mintable Mini App card</strong> — people mint without leaving the feed.</li>
        <li>Print the page URL as a QR code for posters (for per-person QR codes, use <Link href="/docs/signatures">signature minting</Link> instead).</li>
      </ul>

      <blockquote>
        Leaving public mint open with no deadline dilutes the &ldquo;I was
        there&rdquo; meaning — anyone can mint years later. For genuine
        attendance proofs, close the mint after the event, or use allowlists /
        signatures instead.
      </blockquote>
    </>
  );
}
