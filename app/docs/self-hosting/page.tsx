export const metadata = { title: "Self-hosting this app" };

export default function Page() {
  return (
    <>
      <h1>Self-hosting this app</h1>
      <p>
        This frontend is fully open source (MIT) and designed to be deployed by
        anyone. It is a static-ish Next.js app with <strong>no database and no
        backend services</strong> — all state lives on Base.
      </p>

      <h2>Quick start</h2>
      <pre><code>{`git clone <your-fork-url>
cd onchain-poaps-frontend
npm install
cp .env.example .env.local   # fill in the values
npm run dev`}</code></pre>

      <h2>Environment variables</h2>
      <table>
        <thead><tr><th>Variable</th><th>Required</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><code>NEXT_PUBLIC_WC_PROJECT_ID</code></td><td>✅</td><td>WalletConnect/Reown project ID (free at dashboard.reown.com)</td></tr>
          <tr><td><code>NEXT_PUBLIC_APP_URL</code></td><td>✅ in prod</td><td>Canonical deploy URL — used for OG images, claim links, Farcaster manifest</td></tr>
          <tr><td><code>NEXT_PUBLIC_CHAIN</code></td><td>—</td><td><code>baseSepolia</code> (default) or <code>base</code></td></tr>
          <tr><td><code>NEXT_PUBLIC_POAP_ADDRESS_BASE</code></td><td>for mainnet</td><td>Contract address once deployed on Base mainnet</td></tr>
          <tr><td><code>NEXT_PUBLIC_RPC_BASE_SEPOLIA</code> / <code>NEXT_PUBLIC_RPC_BASE</code></td><td>—</td><td>Custom RPC endpoints (defaults to public RPCs; a dedicated RPC is recommended in production)</td></tr>
          <tr><td><code>NEXT_PUBLIC_FC_HEADER/PAYLOAD/SIGNATURE</code></td><td>for Mini App</td><td>Farcaster account-association credentials for the manifest</td></tr>
        </tbody>
      </table>

      <h2>Deploying to Vercel</h2>
      <ol>
        <li>Push the repo to GitHub and import it in Vercel.</li>
        <li>Set the env vars above in the Vercel project settings.</li>
        <li>Deploy. Set <code>NEXT_PUBLIC_APP_URL</code> to the final domain and redeploy.</li>
      </ol>

      <h2>Enabling the Farcaster Mini App</h2>
      <ol>
        <li>Deploy first — the manifest at <code>/.well-known/farcaster.json</code> must be served from your final domain.</li>
        <li>Sign the account association for your domain (Farcaster dev tools → domains) with your Farcaster custody wallet.</li>
        <li>Put the three resulting values into <code>NEXT_PUBLIC_FC_HEADER</code>, <code>NEXT_PUBLIC_FC_PAYLOAD</code>, <code>NEXT_PUBLIC_FC_SIGNATURE</code> and redeploy.</li>
        <li>Validate in the Farcaster Mini App developer tools, then cast your URL — it renders as a launchable card.</li>
      </ol>
      <p>See <code>DEPLOYMENT.md</code> in the repository for the detailed walkthrough.</p>
    </>
  );
}
