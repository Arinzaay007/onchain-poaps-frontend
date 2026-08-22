"use client";

/**
 * Browser-side SVG validation + optimization (SVGO).
 * The contract stores the raw SVG string onchain via SSTORE2, so every byte
 * costs gas — optimizing before registration matters.
 */
import { optimize } from "svgo/browser";

export interface SvgCheck {
  ok: boolean;
  warnings: string[];
  errors: string[];
}

export function validateSvg(svg: string): SvgCheck {
  const warnings: string[] = [];
  const errors: string[] = [];
  const trimmed = svg.trim();

  if (!trimmed) errors.push("SVG is empty.");
  if (trimmed && !/<svg[\s>]/i.test(trimmed))
    errors.push("Not an SVG — must contain an <svg> element.");
  if (/<script[\s>]/i.test(trimmed))
    errors.push("Contains <script> — most marketplaces will refuse to render it.");
  if (/href\s*=\s*["']https?:/i.test(trimmed) || /url\(https?:/i.test(trimmed))
    warnings.push(
      "References external URLs — these will not load in most NFT viewers. Inline everything.",
    );
  if (/<image[\s>]/i.test(trimmed) && !/data:image/i.test(trimmed))
    warnings.push("Embedded <image> without a data URI may not render.");
  if (trimmed && !/viewBox/i.test(trimmed))
    warnings.push("No viewBox attribute — the image may scale poorly.");

  const bytes = new TextEncoder().encode(trimmed).length;
  if (bytes > 24_000)
    errors.push(
      `SVG is ${(bytes / 1024).toFixed(1)} KB. SSTORE2 caps contract storage near 24 KB (and base64 adds ~33%). Simplify the artwork.`,
    );
  else if (bytes > 12_000)
    warnings.push(
      `SVG is ${(bytes / 1024).toFixed(1)} KB — registration gas will be significant. Consider simplifying.`,
    );

  return { ok: errors.length === 0, warnings, errors };
}

export interface OptimizeResult {
  svg: string;
  before: number;
  after: number;
  savedPct: number;
}

export function optimizeSvg(svg: string): OptimizeResult {
  const before = new TextEncoder().encode(svg).length;
  let out = svg;
  try {
    const res = optimize(svg, {
      multipass: true,
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              // keep viewBox — needed for correct scaling in NFT viewers
              removeViewBox: false,
            },
          },
          // svgo's TS types for preset config are overly strict in v4 browser build
        } as never,
      ],
    });
    out = res.data;
  } catch {
    // fall through with original
  }
  const after = new TextEncoder().encode(out).length;
  if (after >= before) {
    return { svg, before, after: before, savedPct: 0 };
  }
  return {
    svg: out,
    before,
    after,
    savedPct: Math.round(((before - after) / before) * 100),
  };
}

/**
 * Rough registration gas estimate.
 * The SVG is base64-encoded (×4/3) then written via SSTORE2 (~200 gas/byte)
 * plus event-struct storage + base tx overhead.
 */
export function estimateRegisterGas(svgBytes: number, otherChars: number): number {
  const b64Bytes = Math.ceil((svgBytes * 4) / 3);
  const sstore2 = b64Bytes * 200 + 32_000; // data + CREATE overhead
  const struct = 20 * 20_000 + otherChars * 350;
  return 21_000 + sstore2 + struct;
}

export function svgToDataUri(svg: string): string {
  const b64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${b64}`;
}
