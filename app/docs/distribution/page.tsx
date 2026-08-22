import Link from "next/link";

export const metadata = { title: "Distribution methods" };

export default function Page() {
  return (
    <>
      <h1>Distribution methods</h1>
      <p>
        The contract supports four ways to get a POAP into wallets. They are
        not mutually exclusive — you can run all four for the same POAP. Every
        method enforces <strong>max 1 per wallet</strong>.
      </p>

      <table>
        <thead>
          <tr><th>Method</th><th>Who mints</th><th>Who pays gas</th><th>Time limit</th><th>Best for</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><Link href="/docs/public-mint">Public mint</Link></td>
            <td>Anyone</td><td>Minter</td>
            <td>While enabled (toggle locked after 30 days)</td>
            <td>Open communities, online events</td>
          </tr>
          <tr>
            <td><Link href="/docs/allowlists">Allowlist</Link></td>
            <td>Listed wallets</td><td>Minter</td>
            <td>Root settable once within 30 days; minting itself has no deadline</td>
            <td>Known guest lists, registered attendees</td>
          </tr>
          <tr>
            <td><Link href="/docs/signatures">Signature / QR</Link></td>
            <td>Anyone the creator signs for</td><td>Minter</td>
            <td>First 37 days after registration</td>
            <td>Live events, on-the-spot claims</td>
          </tr>
          <tr>
            <td>Direct airdrop</td>
            <td>Creator mints <em>to</em> recipients</td><td>Creator</td>
            <td>First 30 days, ≤101 recipients per tx</td>
            <td>Speakers, VIPs, retroactive drops</td>
          </tr>
        </tbody>
      </table>

      <h2>Picking a strategy</h2>
      <h3>Small meetup (≤50 people)</h3>
      <p>
        Use <strong>signature minting in live mode</strong>: at the door, scan
        each attendee&rsquo;s address, sign, they scan the claim QR. Zero
        pre-planning, no gas for you, nobody uninvited can mint.
      </p>
      <h3>Conference with registration</h3>
      <p>
        You have emails/wallets in advance → build an <strong>allowlist</strong>{" "}
        from the wallet list and email each person their claim link. Or
        pre-sign <strong>batch signatures</strong> and print each QR on the
        attendee&rsquo;s badge.
      </p>
      <h3>Online / open community event</h3>
      <p>
        <strong>Public mint</strong>, shared as a link (or cast the POAP page
        directly into Farcaster — it becomes a mintable card). Close the mint
        from the manage page when the window should end.
      </p>
      <h3>Reward past contributors</h3>
      <p>
        <strong>Direct airdrop</strong> — they receive the POAP without doing
        anything. You pay the (tiny) gas.
      </p>

      <blockquote>
        Plan around the clock: creator controls end 30 days after
        registration, signatures work for 37. Register the POAP close to your
        event date so the windows line up. See{" "}
        <Link href="/docs/creator-permissions">deadlines</Link>.
      </blockquote>
    </>
  );
}
