import Link from "next/link";

export const metadata = { title: "Signature minting & QR codes" };

export default function Page() {
  return (
    <>
      <h1>Signature minting &amp; QR codes</h1>
      <p>
        Signature minting lets the creator authorize <em>any specific wallet</em>{" "}
        to mint by signing a message — no allowlist needed, no gas spent by the
        creator, and it can be done <strong>on the spot at a live event</strong>.
        It works for <strong>37 days</strong> after registration (the 30-day
        creator window plus a 7-day grace period).
      </p>

      <h2>How it works</h2>
      <pre><code>{`message   = keccak256(abi.encodePacked(eventId, chainId, recipientAddress))
signature = creator signs message (standard EIP-191 personal_sign)
mint      = recipient calls mintWithSignature(eventId, signature)
            contract recovers the signer and checks it's the creator`}</code></pre>
      <ul>
        <li>Each signature is bound to <strong>one wallet, one POAP, one chain</strong> — it can&rsquo;t be reused by anyone else.</li>
        <li>Signing is free and offchain. Only the recipient&rsquo;s mint transaction touches the chain.</li>
        <li>The app packs the signature into a <strong>claim link</strong> — a URL whose fragment carries everything needed. No server, no database; the link <em>is</em> the ticket.</li>
      </ul>

      <h2>Live event mode (the fun one)</h2>
      <p>From the manage dashboard → <em>Signature minting → Live event mode</em>:</p>
      <ol>
        <li>Attendee shows you their wallet address — every wallet app displays it as a QR they can show you, or they read it out.</li>
        <li>Paste/type it, hit <strong>Sign &amp; show QR</strong>, approve one signature in your wallet (instant, free).</li>
        <li>A claim QR appears on your screen. The attendee scans it with their phone camera → the claim page opens with their POAP preview → connect → mint. Total time: ~20 seconds per person.</li>
      </ol>
      <p>
        Works from a laptop or phone at a check-in desk. Because each QR is
        wallet-bound, someone photographing a QR over a shoulder gains nothing.
      </p>

      <h2>Batch signing (badges, emails, posters)</h2>
      <p>Know your recipients in advance? <em>Batch signing</em> mode:</p>
      <ol>
        <li>Paste all recipient addresses.</li>
        <li>Approve one signature per address in your wallet (rapid-fire approvals; ~100 takes a few minutes).</li>
        <li>Download the results:
          <ul>
            <li><code>signatures.json</code> — raw data, your backup</li>
            <li><code>claim-links.csv</code> — one personal link per recipient, ready for mail-merge or DMs</li>
            <li><strong>Printable QR sheet</strong> — an HTML page with every QR labeled by address; print it, cut it, stick each QR on the right badge</li>
          </ul>
        </li>
      </ol>

      <h2>One shared QR for a screen or poster?</h2>
      <p>
        Signatures are per-wallet by design, so a single reusable
        signature-QR isn&rsquo;t possible (that&rsquo;s the anti-abuse
        feature). For a &ldquo;one QR for the whole room&rdquo; setup you have
        two options:
      </p>
      <ul>
        <li><strong>Public mint + QR of the POAP page</strong> — open public minting during the event and put the POAP page URL on screen. Close it right after. Simple and effective for low-stakes events.</li>
        <li><strong>Live mode at the door</strong> — slightly more work, but only actual attendees can ever mint.</li>
      </ul>

      <h2>Time restrictions</h2>
      <ul>
        <li>Signatures can be <em>created</em> anytime (they&rsquo;re just messages), but <code>mintWithSignature</code> only succeeds during the <strong>first 37 days</strong> after registration.</li>
        <li>Every claim page shows a live countdown. Links that outlive the window fail with <code>POAP__TimeLockExpired</code>.</li>
        <li>Plan: register the POAP shortly before your event so attendees have the full window to redeem.</li>
      </ul>

      <blockquote>
        Security note: a claim link is a bearer of a <em>wallet-specific</em>{" "}
        authorization. Leaking one only lets that exact wallet mint — but send
        links privately anyway to keep your guest list tidy. See also{" "}
        <Link href="/docs/allowlists">allowlists</Link> for pre-committed lists.
      </blockquote>
    </>
  );
}
