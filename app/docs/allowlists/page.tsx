import Link from "next/link";

export const metadata = { title: "Allowlists & proofs" };

export default function Page() {
  return (
    <>
      <h1>Allowlists &amp; proofs</h1>
      <p>
        An allowlist is a fixed list of wallets allowed to mint. The chain
        doesn&rsquo;t store the list itself — it stores a single 32-byte
        fingerprint of it (a <em>Merkle root</em>). Each wallet later proves
        membership with a small <em>proof</em>. You don&rsquo;t need to
        understand the cryptography; this app handles all of it.
      </p>

      <h2>Creator workflow: list → configured, in 3 steps</h2>
      <ol>
        <li><strong>Paste your addresses</strong> — in the <Link href="/create">create wizard</Link> (step 3) or the manage dashboard. One per line; CSV pastes work; duplicates and bad entries are flagged automatically.</li>
        <li><strong>Set it onchain</strong> — the app computes the root and you confirm one transaction. ⚠️ <strong>This can be done exactly once per POAP</strong>, and only within 30 days of registration. Triple-check the list first.</li>
        <li><strong>Download &amp; distribute proofs</strong> — the app immediately downloads <code>proofs.json</code> containing every wallet&rsquo;s proof, and can generate <strong>per-wallet claim links</strong> (a CSV) where each link carries its own proof.</li>
      </ol>

      <h2>Distributing proofs to your minters</h2>
      <p>The chain only stores the root, so minters need their proof from <em>you</em>. Three good ways, easiest first:</p>
      <ul>
        <li><strong>Claim links (recommended)</strong> — generate the claim-links CSV in the manage dashboard and send each person their personal link (email, DM, ticketing platform). They open it, connect, tap mint. Done.</li>
        <li><strong>Share proofs.json</strong> — post the whole file anywhere public (your site, GitHub, Discord). Minters paste it into the POAP page&rsquo;s allowlist box; the app picks out their proof automatically. The file contains only addresses + hashes — nothing secret.</li>
        <li><strong>QR codes</strong> — each claim link can be a QR code for badges or posters (per-person, since each proof is wallet-specific).</li>
      </ul>

      <h2>Minter workflow</h2>
      <ol>
        <li>Open your claim link (everything is pre-filled) — or open the POAP page, choose &ldquo;I&rsquo;m on the allowlist&rdquo;, and paste the proofs.json the creator shared.</li>
        <li>Connect the wallet that was allowlisted. Proofs are wallet-specific — a proof for another address will be rejected by the contract.</li>
        <li>Mint. There is <strong>no deadline</strong> for allowlist minting itself.</li>
      </ol>

      <h2>Under the hood (for the curious)</h2>
      <pre><code>{`leaf  = keccak256(abi.encodePacked(walletAddress))
tree  = OpenZeppelin-style Merkle tree over all leaves
        (sorted, commutative keccak256 pair hashing)
root  = stored onchain via updateAllowlistRoot (once!)
mint  = allowlistMint(eventId, proof) — contract verifies
        MerkleProof.verify(proof, root, leaf(msg.sender))`}</code></pre>
      <p>
        This app builds the tree with{" "}
        <a href="https://github.com/OpenZeppelin/merkle-tree" target="_blank" rel="noreferrer">
          @openzeppelin/merkle-tree
        </a>{" "}
        in your browser — the address list never leaves your device.
      </p>

      <h2>FAQ</h2>
      <ul>
        <li><strong>Can I add addresses later?</strong> No. The root is one-shot. If you might need additions, keep <Link href="/docs/signatures">signature minting</Link> in reserve for latecomers (first 37 days), or airdrop directly.</li>
        <li><strong>I lost proofs.json.</strong> No problem — paste the same address list into the manage dashboard and the app rebuilds it, verifying it matches the onchain root.</li>
        <li><strong>Is the list public?</strong> The root reveals nothing by itself, but anyone you gave proofs.json to sees the full list. Treat it as semi-public.</li>
      </ul>
    </>
  );
}
