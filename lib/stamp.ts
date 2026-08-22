/**
 * Stamp Studio — generates compact, hand-optimized SVG POAP artwork.
 * Output is typically 1–2 KB: far cheaper to store onchain than tool exports.
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

/** Ring of scallop bumps as one compact path (arcs), instead of N circles. */
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
    const x2 = +(cx + Math.cos(a) * (r + 7)).toFixed(1);
    const y2 = +(cy + Math.sin(a) * (r + 7)).toFixed(1);
    const x3 = +(cx + Math.cos(a + 0.06) * r).toFixed(1);
    const y3 = +(cy + Math.sin(a + 0.06) * r).toFixed(1);
    d += `M${x1} ${y1}L${x2} ${y2}L${x3} ${y3}Z`;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

/** Curved text without <textPath> — per-glyph placement works in ALL renderers
 *  (browsers, librsvg thumbnailers, etc.), unlike textPath. */
function arcText(
  text: string,
  r: number,
  fontSize: number,
  fill: string,
): string {
  const cx = 100,
    cy = 100;
  const chars = Array.from(text);
  const charW = fontSize * 0.66 + 1.5; // approx serif-bold advance + tracking
  const anglePer = charW / r; // radians
  const total = anglePer * (chars.length - 1);
  let out = `<g font-family="Georgia,serif" font-size="${fontSize}" font-weight="bold" fill="${fill}" text-anchor="middle">`;
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
  const topSize = top.length > 24 ? 9.5 : top.length > 18 ? 10.5 : top.length > 13 ? 12.5 : 15;
  const isEmoji = /\p{Extended_Pictographic}/u.test(d.center);
  const centerSize = isEmoji ? 56 : d.center.length > 2 ? 30 : 44;

  let edge = "";
  if (d.shape === "scallop") {
    edge = `<circle cx="100" cy="100" r="92" fill="${d.bg}"/>` + scallops(100, 100, 92, 28, 5, d.bg);
  } else if (d.shape === "gear") {
    edge = gearTeeth(100, 100, 88, 36, d.bg) + `<circle cx="100" cy="100" r="90" fill="${d.bg}"/>`;
  } else {
    edge =
      `<circle cx="100" cy="100" r="97" fill="${d.bg}"/>` +
      `<circle cx="100" cy="100" r="93" fill="none" stroke="${d.ink}" stroke-width="1.6"/>`;
  }

  const dash = d.showDashRing
    ? `<circle cx="100" cy="100" r="80" fill="none" stroke="${d.ink}" stroke-width="1.2" stroke-dasharray="4 3.2"/>`
    : "";

  const topArc = top ? arcText(top, 71, topSize, d.ink) : "";

  const centerEl = center
    ? `<text x="100" y="${bottom ? 108 : 116}" text-anchor="middle" font-size="${centerSize}" font-family="${isEmoji ? "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" : "Georgia,serif"}" font-weight="bold" fill="${d.centerColor}">${center}</text>`
    : "";

  const bottomEl = bottom
    ? `<text x="100" y="146" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${d.ink}" letter-spacing="1">${bottom}</text>` +
      `<path d="M70 156h60" stroke="${d.ink}" stroke-width="1" stroke-dasharray="2 2"/>`
    : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200">` +
    edge +
    dash +
    topArc +
    centerEl +
    bottomEl +
    `</svg>`
  );
}
