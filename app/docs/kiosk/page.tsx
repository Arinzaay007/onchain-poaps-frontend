export const metadata = { title: "Live-event kiosk" };

export default function KioskDocs() {
  return (
    <>
      <h1>Live-event kiosk mode</h1>
      <p>
        The kiosk is a single, fullscreen screen made for the door or a badge
        booth at a real event. Its one job: turn an attendee&rsquo;s wallet address
        into an onchain POAP in about two seconds.
      </p>

      <p className="eyebrow">Reach it from</p>
      <p>
        Any of your POAPs → <b>Manage distribution</b> → <b>Launch kiosk</b>, or
        directly at{" "}
        <code>https://your-app.vercel.app/poap/&lt;id&gt;/kiosk</code>. Only the
        creator wallet can run it.
      </p>

      <h2>What it&rsquo;s for</h2>
      <p>
        Signature minting is the only way to award a POAP on the spot at a live
        event (see{" "}
        <a href="/docs/signatures">Signature minting &amp; QR codes</a>). The
        kiosk wraps that into a dead-simple flow an organizer can operate on a
        phone or a laptop at a door.
      </p>

      <h2>How it works</h2>
      <ol>
        <li>
          Open the kiosk in your creator wallet. It checks that you are the POAP
          creator and that the signature window is still open (first 37 days
          after registration).
        </li>
        <li>
          An attendee shows you their wallet address (they can display it as a
          QR in any wallet app).
        </li>
        <li>
          You type or paste it and tap <b>Sign &amp; show QR</b>. Your wallet
          signs a message authorizing that specific address to mint one POAP.
        </li>
        <li>
          A large QR appears. The attendee scans it with any wallet, which opens
          the claim page pre-signed for them — they just tap <b>mint</b>.
        </li>
        <li>
          Tap <b>Next attendee →</b> and repeat. Each signature is unique to one
          address, so the QR is safe to show on a screen.
        </li>
      </ol>

      <h2>Why it&rsquo;s cheap &amp; fast</h2>
      <ul>
        <li>
          You pay <b>no gas</b> to sign — signing is offline-ish and instant.
          The attendee pays the mint gas.
        </li>
        <li>
          The claim link is encoded in the QR <b>without touching a server</b> —
          it lives in the URL fragment, so the kiosk works even if the site
          goes down.
        </li>
        <li>
          Works with public minting <b>closed</b>, so you can gate an event
          strictly to people you sign in.
        </li>
      </ul>

      <h2>Practical tips</h2>
      <ul>
        <li>
          Use a phone or tablet in a stand, or a laptop beside the door; the
          layout is built for a big, tappable screen.
        </li>
        <li>
          Bump the print scale / brightness if the venue is bright so the QR
          scans reliably.
        </li>
        <li>
          If a signature window closes, the kiosk tells you immediately — so you
          never hand out a bad claim.
        </li>
      </ul>

      {/* this keeps the route server-rendered with no client boundary below */}
    </>
  );
}
