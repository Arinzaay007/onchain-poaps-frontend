export const metadata = { title: "Creator permissions & deadlines" };

export default function Page() {
  return (
    <>
      <h1>Creator permissions &amp; deadlines</h1>
      <p>
        The protocol gives creators real control — but only briefly. Every
        creator power expires <strong>30 days after registration</strong>, after
        which the POAP is fully immutable and trustless. This is a feature:
        collectors know the rules can&rsquo;t change under them forever.
      </p>

      <h2>The timeline</h2>
      <pre><code>{`Day 0        Registration (registerEvent)
│
├─ Days 0–30   CREATOR WINDOW
│    ├─ toggle public mint on/off      (updateEventPublic)
│    ├─ set allowlist root, once ever  (updateAllowlistRoot)
│    └─ direct airdrop, ≤101/tx        (creatorMint)
│
├─ Days 0–37   SIGNATURE WINDOW
│    └─ recipients redeem signatures   (mintWithSignature)
│
└─ Day 37+     FULLY FROZEN
     └─ only public mint (if left open) and
        allowlist mints remain possible — forever`}</code></pre>

      <h2>Permission matrix</h2>
      <table>
        <thead>
          <tr><th>Action</th><th>Who</th><th>When</th><th>How often</th></tr>
        </thead>
        <tbody>
          <tr><td>Register POAP</td><td>Anyone</td><td>Anytime</td><td>—</td></tr>
          <tr><td>Public mint toggle</td><td>Creator only</td><td>Days 0–30</td><td>Unlimited</td></tr>
          <tr><td>Set allowlist root</td><td>Creator only</td><td>Days 0–30</td><td><strong>Once ever</strong></td></tr>
          <tr><td>Direct airdrop</td><td>Creator only</td><td>Days 0–30</td><td>Unlimited (≤101/tx)</td></tr>
          <tr><td>Issue signatures</td><td>Creator only (offchain)</td><td>Anytime (redeemable days 0–37)</td><td>Unlimited</td></tr>
          <tr><td>Public mint</td><td>Anyone</td><td>While enabled</td><td>1 per wallet</td></tr>
          <tr><td>Allowlist mint</td><td>Listed wallets</td><td>Anytime after root set</td><td>1 per wallet</td></tr>
          <tr><td>Signature mint</td><td>Authorized wallet</td><td>Days 0–37</td><td>1 per wallet</td></tr>
        </tbody>
      </table>

      <h2>Contract restrictions cheat-sheet</h2>
      <ul>
        <li><strong>Max 1 POAP per wallet per event</strong> — across all methods combined. The airdrop silently skips wallets that already claimed.</li>
        <li><strong>Name 1–128 chars; description ≤512; location &amp; URL ≤128.</strong></li>
        <li><strong>Soulbound flag is permanent</strong> from the moment of registration.</li>
        <li><strong>Allowlist root can never be changed or unset</strong> once set.</li>
        <li><strong>The creator address is fixed</strong> — controls can&rsquo;t be transferred to another wallet, so register from a wallet you&rsquo;ll keep access to for 30 days.</li>
        <li>After day 30, expired creator actions revert with <code>POAP__TimeLockExpired</code>.</li>
      </ul>

      <blockquote>
        Practical advice: register your POAP <strong>shortly before the
        event</strong>, not months early. All your distribution windows start
        ticking at registration, not at your event date.
      </blockquote>
    </>
  );
}
