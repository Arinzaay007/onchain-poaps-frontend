export const metadata = { title: "SVG artwork & optimization" };

export default function Page() {
  return (
    <>
      <h1>SVG artwork &amp; optimization</h1>
      <p>
        Your artwork is stored <em>as text, onchain, forever</em> via SSTORE2.
        That&rsquo;s the superpower of this protocol — and it means artwork
        rules are different from a normal NFT drop.
      </p>

      <h2>Requirements</h2>
      <ul>
        <li><strong>No design skills? Use the built-in Stamp Studio.</strong> The create wizard includes a designer — pick a shape, palette, emoji or initials, and curved rim text — that outputs a hand-optimized 1–3 KB SVG ready to store onchain.</li>
        <li><strong>SVG only.</strong> Raster images (PNG/JPG) would be absurdly expensive to store onchain. Vector art is compact and scales perfectly.</li>
        <li><strong>Self-contained.</strong> No external URLs — external fonts, images or stylesheets will not load inside NFT viewers. Inline everything; convert text to paths if you use a special font.</li>
        <li><strong>No scripts.</strong> Most viewers strip or refuse SVGs containing <code>&lt;script&gt;</code>.</li>
        <li><strong>Include a <code>viewBox</code></strong> so the image scales cleanly everywhere.</li>
        <li><strong>Practical size ceiling ≈ 24 KB</strong> (before base64). SSTORE2 stores data as contract bytecode, which caps out near 24.5 KB — and the contract stores the <em>base64</em> of your SVG, which is ~33% bigger than the raw markup.</li>
      </ul>

      <h2>Every byte costs gas</h2>
      <p>
        Onchain storage is roughly 200 gas per byte. On Base that&rsquo;s cheap
        in absolute terms (a few thousandths of a cent per byte), but a bloated
        20 KB export from a design tool still costs real money versus a clean
        3 KB file — and the size is paid once, then lives rent-free forever.
      </p>

      <h2>Optimization</h2>
      <p>
        The create wizard runs <strong>SVGO</strong> (the industry-standard SVG
        optimizer) in your browser automatically and shows the before/after
        size. Typical design-tool exports shrink 40–80% with zero visual
        change. If you prefer to optimize by hand, use{" "}
        <a href="https://svgomg.net" target="_blank" rel="noreferrer">SVGOMG</a>{" "}
        — the interactive SVGO playground — then paste the result.
      </p>
      <h3>Tips for tiny, beautiful POAPs</h3>
      <ul>
        <li>Design in a circle — the app frames every POAP as a circular stamp.</li>
        <li>Use flat shapes and simple gradients rather than filters and masks.</li>
        <li>Round path coordinates to 1–2 decimals (SVGO does this).</li>
        <li>Convert strokes and text to paths in your design tool.</li>
        <li>Delete hidden layers, editor metadata, and <code>defs</code> you don&rsquo;t use.</li>
      </ul>

      <h2>Gotchas</h2>
      <ul>
        <li>Avoid <code>&quot;</code> inside the SVG where possible (use <code>&apos;</code> for attribute values) — the SVG is base64-encoded so it&rsquo;s generally safe, but simpler is better.</li>
        <li>Emoji and non-ASCII text in the SVG are fine — they&rsquo;re UTF-8 encoded before storage.</li>
        <li>Test how your art looks at 64×64 px — that&rsquo;s how most people will first see it in a wallet.</li>
      </ul>
    </>
  );
}
