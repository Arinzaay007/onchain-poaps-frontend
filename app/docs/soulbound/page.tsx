export const metadata = { title: "Soulbound vs transferable" };

export default function Page() {
  return (
    <>
      <h1>Soulbound vs transferable</h1>
      <p>
        When you create a POAP you make one <strong>permanent</strong> choice:
        can holders transfer it, or is it bound to the wallet that earned it?
      </p>

      <h2>Soulbound (recommended for attendance)</h2>
      <ul>
        <li>The token can <strong>never be transferred or sold</strong>. The contract blocks every transfer (minting and burning still work).</li>
        <li>This is what makes a POAP a <em>credible</em> proof of attendance: if you see it in a wallet, that wallet earned it.</li>
        <li>Marketplaces will show it, but buy/sell/transfer will fail at the contract level with <code>POAP__SoulboundNotTransferable</code>.</li>
      </ul>

      <h2>Transferable</h2>
      <ul>
        <li>Behaves like a normal ERC-1155 NFT — holders can send or sell it.</li>
        <li>Good for collectibles, art drops, or when you explicitly want a secondary market.</li>
        <li>Weak as attendance proof: the current holder may not be the original attendee. (The original minter is still verifiable in the onchain event logs.)</li>
      </ul>

      <h2>How to choose</h2>
      <table>
        <thead><tr><th>Use case</th><th>Recommendation</th></tr></thead>
        <tbody>
          <tr><td>Conference / meetup attendance</td><td>Soulbound</td></tr>
          <tr><td>Community membership badge</td><td>Soulbound</td></tr>
          <tr><td>Contributor / achievement recognition</td><td>Soulbound</td></tr>
          <tr><td>Commemorative art drop</td><td>Transferable</td></tr>
          <tr><td>Anything you want traded</td><td>Transferable</td></tr>
        </tbody>
      </table>
      <blockquote>
        Remember: this flag can <strong>never</strong> be changed after
        registration — not even during the 30-day creator window.
      </blockquote>
    </>
  );
}
