export const metadata = { title: "Unstoppable export & attestations" };

export default function UnstoppableDocs() {
  return (
    <>
      <h1>Lifetime export &amp; attestations</h1>
      <p>
        A POAP that can be taken offline isn&rsquo;t really proof — it&rsquo;s a
        hosted image. This app ships two things that make attendance proof{" "}
        <b>last as long as Ethereum itself</b>.
      </p>

      <h2>The unstoppable explorer</h2>
      <p>
        Open <a href="/unstoppable">/unstoppable</a> (or grab the raw file at{" "}
        <code>/unstoppable</code>). It&rsquo;s a <b>single, self-contained HTML
        file</b> with <b>zero external dependencies</b> — no app server, no
        database, no bundler, no Node modules. It talks straight to a public
        Base RPC over plain <code>fetch</code> (with a fallback RPC and retries),
        parses the contract&rsquo;s <code>events</code>, <code>uri</code> and{" "}
        <code>totalSupply</code> views, and renders every POAP with its real
        name, artwork, soulbound/transferable flag and BaseScan link.
      </p>
      <p>
        Because it needs nothing but a browser and an internet connection, you
        can publish that single file to <b>IPFS</b>, Arweave, GitHub Pages, or a
        USB stick — it keeps working if Vercel, any CDN, or the original domain
        disappears. <b>Stamped, not stored.</b>
      </p>
      <ul>
        <li>Regenerate it anytime with <code>npm run unstoppable</code>.</li>
        <li>
          It currently points at Base Sepolia. Swap the contract address and RPC
          at the top of <code>scripts/build-unstoppable.mjs</code> to point it at
          a new deployment.
        </li>
      </ul>

      <h2>The attestation receipt</h2>
      <p>
        On any POAP you&rsquo;ve minted, the detail page offers a{" "}
        <b>"Proof of attendance"</b> card. It renders a one-page, frameable
        receipt:
      </p>
      <ul>
        <li>your wallet address and collector number</li>
        <li>the event name, date and location</li>
        <li>the exact mint transaction hash onchain</li>
        <li>a QR that anyone can scan to verify the attendance</li>
      </ul>
      <p>
        Download it as a PNG or open a print-ready view. It&rsquo;s the physical
        embodiment of the POIDH ethos — <i>pics or it didn&rsquo;t happen</i> —
        and it makes a POAP something you can pin on a wall, not just a row in a
        transaction explorer.
      </p>

      <h2>Why this matters</h2>
      <p>
        The whole point of onchain proof of attendance is that it doesn&rsquo;t
        depend on a middleman. A server-hosted gallery is a convenience; a
        single-file onchain reader plus a signed, verifiable receipt is the
        actual guarantee. Both are one click away from any page in this app.
      </p>
    </>
  );
}
