/**
 * Stamp Studio — generates compact, hand-optimized, PREMIUM SVG POAP artwork.
 * Output is typically 1.5–3 KB: far cheaper to store onchain than tool exports.
 *
 * Produces a "banknote / passport guilloché" medallion look:
 *   - perforated postage edge
 *   - concentric guilloché rosette line-work (the lathe pattern)
 *   - a scalloped petal medallion around the emblem
 *   - curved rim text + a serif caption band
 * All strokes are cheap (1–2 bytes*N), so it stays gas-light.
 */

export interface StampDesign {
  shape: "scallop" | "ring" | "gear";
  bg: string; // background color
  ink: string; // ring/text color
  center: string; // emoji or up to 4 chars
  centerColor: string;
  topText: string; // curved around the top
  bottomText: string; // straight line under center
  showDashRing: boolean;
}

export const PALETTES = [
  { name: "Vermillion", bg: "#f8f3e8", ink: "#c73e1d", centerColor: "#221c14" },
  { name: "Midnight", bg: "#16233a", ink: "#e8dcc0", centerColor: "#f8f3e8" },
  { name: "Forest", bg: "#1e3a2a", ink: "#cfe3b8", centerColor: "#f4efe2" },
  { name: "Ocean", bg: "#123a4a", ink: "#9fd6e0", centerColor: "#eefbff" },
  { name: "Grape", bg: "#2d1b40", ink: "#d8b8f0", centerColor: "#f6eeff" },
  { name: "Sunrise", bg: "#f8e3c0", ink: "#b8541e", centerColor: "#5a2a10" },
  { name: "Slate", bg: "#26262a", ink: "#c9c9d0", centerColor: "#f2f2f5" },
  { name: "Base Blue", bg: "#0a2472", ink: "#9db8ff", centerColor: "#ffffff" },
];

export const STUDIO_EMOJIS = [
  "🎉", "🪙", "🎪", "🎤", "🎧", "🎨", "🏆", "🚀", "🔥", "⚡", "🌍", "🌊",
  "🍕", "☕", "🥂", "🤝", "💜", "🛠️", "🏗️", "📡", "🎓", "🌱", "🦄", "👾",
];

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Ring of scallop bumps as one compact path (arcs), for the perforated edge. */
function scallops(cx: number, cy: number, r: number, n: number, br: number, fill: string): string {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = +(cx + Math.cos(a) * r).toFixed(1);
    const y = +(cy + Math.sin(a) * r).toFixed(1);
    d += `M${x} ${y}m-${br} 0a${br} ${br} 0 1 0 ${br * 2} 0a${br} ${br} 0 1 0 -${br * 2} 0`;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

function gearTeeth(cx: number, cy: number, r: number, n: number, fill: string): string {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x1 = +(cx + Math.cos(a - 0.06) * r).toFixed(1);
    const y1 = +(cy + Math.sin(a - 0.06) * r).toFixed(1);
    const x2 = +(cx + Math.cos(a) * (r + 8)).toFixed(1);
    const y2 = +(cy + Math.sin(a) * (r + 8)).toFixed(1);
    const x3 = +(cx + Math.cos(a + 0.06) * r).toFixed(1);
    const y3 = +(cy + Math.sin(a + 0.06) * r).toFixed(1);
    d += `M${x1} ${y1}L${x2} ${y2}L${x3} ${y3}Z`;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

/** A smooth wavy "guilloché" ring — the concentric lathe rosette line-work. */
function guillocheRing(
  r: number,
  waves: number,
  amp: number,
  stroke: string,
  opacity: number,
  sw: number,
): string {
  const cx = 100, cy = 100;
  const N = 88;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rr = r + amp * Math.sin(waves * a);
    const x = +(cx + Math.cos(a) * rr).toFixed(1);
    const y = +(cy + Math.sin(a) * rr).toFixed(1);
    d += (i === 0 ? "M" : "L") + x + " " + y;
  }
  d += "Z";
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

/** A scalloped petal medallion ring (the rosette "flower" around the emblem). */
function petalRing(
  cx: number,
  cy: number,
  petals: number,
  outerR: number,
  innerR: number,
  fill: string,
  stroke?: string,
  sw?: number,
): string {
  let d = "";
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const a2 = ((i + 0.5) / petals) * Math.PI * 2;
    const a3 = ((i + 1) / petals) * Math.PI * 2;
    const px = +(cx + Math.cos(a) * outerR).toFixed(1);
    const py = +(cy + Math.sin(a) * outerR).toFixed(1);
    const qx = +(cx + Math.cos(a2) * innerR).toFixed(1);
    const qy = +(cy + Math.sin(a2) * innerR).toFixed(1);
    const rx = +(cx + Math.cos(a3) * outerR).toFixed(1);
    const ry = +(cy + Math.sin(a3) * outerR).toFixed(1);
    // teardrop petal via two quadratic curves meeting at the inner notch
    d += `M${px} ${py}Q${qx} ${qy} ${rx} ${ry}`;
  }
  return `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw ?? 1}"` : ""}/>`;
}

/** Curved text without <textPath> — per-glyph placement works in ALL renderers. */
function arcText(
  text: string,
  r: number,
  fontSize: number,
  fill: string,
): string {
  const cx = 100, cy = 100;
  const chars = Array.from(text);
  const charW = fontSize * 0.66 + 1.2;
  const anglePer = charW / r;
  const total = anglePer * (chars.length - 1);
  let out = `<g font-family="Georgia,serif" font-size="${fontSize}" font-weight="bold" fill="${fill}" text-anchor="middle" letter-spacing="0.5">`;
  chars.forEach((ch, i) => {
    if (ch === " ") return;
    const theta = -Math.PI / 2 - total / 2 + anglePer * i;
    const x = +(cx + Math.cos(theta) * r).toFixed(1);
    const y = +(cy + Math.sin(theta) * r).toFixed(1);
    const deg = +((theta + Math.PI / 2) * (180 / Math.PI)).toFixed(1);
    out += `<text x="${x}" y="${y}" transform="rotate(${deg} ${x} ${y})">${esc(ch)}</text>`;
  });
  return out + `</g>`;
}

export function generateStampSvg(d: StampDesign): string {
  const top = esc(d.topText.toUpperCase().slice(0, 30));
  const bottom = esc(d.bottomText.slice(0, 24));
  const center = esc(d.center.slice(0, 4));
  const topSize = top.length > 24 ? 9 : top.length > 18 ? 10 : top.length > 13 ? 12 : 14.5;
  const isEmoji = /\p{Extended_Pictographic}/u.test(d.center);
  const centerSize = isEmoji ? 52 : d.center.length > 2 ? 30 : 42;

  // ---- perforated / scalloped edge ----
  let edge = "";
  if (d.shape === "scallop") {
    edge = `<circle cx="100" cy="100" r="90" fill="${d.bg}"/>` + scallops(100, 100, 90, 26, 6.5, d.bg);
  } else if (d.shape === "gear") {
    edge = gearTeeth(100, 100, 86, 34, d.bg) + `<circle cx="100" cy="100" r="88" fill="${d.bg}"/>`;
  } else {
    edge =
      `<circle cx="100" cy="100" r="96" fill="${d.bg}"/>` +
      `<circle cx="100" cy="100" r="92" fill="none" stroke="${d.ink}" stroke-width="1.6"/>`;
  }

  // ---- concentric guilloché rosette (banknote lathe line-work) ----
  const guilloche =
    guillocheRing(74, 8, 1.4, d.ink, 0.22, 0.7) +
    guillocheRing(66, 14, 1.1, d.ink, 0.16, 0.6) +
    guillocheRing(58, 5, 1.6, d.ink, 0.12, 0.5);

  // ---- dashes (optional) ----
  const dash = d.showDashRing
    ? `<circle cx="100" cy="100" r="${d.shape === "ring" ? 78 : 78}" fill="none" stroke="${d.ink}" stroke-width="1" stroke-dasharray="3 3.2"/>`
    : "";

  // ---- scalloped petal medallion around the emblem ----
  const medallion =
    petalRing(100, 100, 16, 40, 27, d.ink, d.bg, 1) +
    `<circle cx="100" cy="100" r="26.5" fill="${d.ink}"/>` +
    `<circle cx="100" cy="100" r="24.5" fill="${d.bg}" opacity="0"/>`;

  // ---- center emblem ----
  const centerEl = center
    ? `<text x="100" y="${centerSize >= 30 ? 118 : 112}" text-anchor="middle" font-size="${centerSize}" font-family="${isEmoji ? "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" : "Georgia,serif"}" font-weight="bold" fill="${d.centerColor}">${center}</text>`
    : "";

  // ---- caption band (bottom) ----
  const band =
    `<path d="M62 148h76" stroke="${d.ink}" stroke-width="1.2" stroke-dasharray="2 2.4"/>` +
    `<text x="100" y="166" text-anchor="middle" font-family="Georgia,serif" font-size="9.5" letter-spacing="2.5" fill="${d.ink}">${bottom || "ONCHAIN POAP · BASE"}</text>`;

  const topArc = top ? arcText(top, 68, topSize, d.ink) : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200">` +
    edge +
    guilloche +
    dash +
    topArc +
    medallion +
    centerEl +
    band +
    `</svg>`
  );
}
