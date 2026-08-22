"use client";

import QRCode from "qrcode";

/**
 * Renders a shareable "ticket stub" PNG for a minted POAP:
 * perforated stub edge, artwork, event details, collector number,
 * and a QR pointing at the public verify page.
 */
export interface StubData {
  name: string;
  dateStr: string;
  location?: string;
  image?: string | null; // data-uri SVG artwork
  collectorNo?: string; // "14" | undefined
  address: string;
  verifyUrl: string;
  eventId: string;
}

const W = 1100;
const H = 420;
const STUB_X = 780; // perforation line

export async function renderTicketStub(d: StubData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // paper
  ctx.fillStyle = "#f8f3e8";
  roundRect(ctx, 0, 0, W, H, 22);
  ctx.fill();
  // dotted texture
  ctx.fillStyle = "rgba(34,28,20,0.045)";
  for (let x = 14; x < W; x += 26)
    for (let y = 14; y < H; y += 26) {
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  // border
  ctx.strokeStyle = "#c73e1d";
  ctx.lineWidth = 5;
  roundRect(ctx, 10, 10, W - 20, H - 20, 16);
  ctx.stroke();

  // artwork
  if (d.image) {
    try {
      const img = await loadImage(d.image);
      const cx = 190, cy = H / 2, r = 140;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      ctx.strokeStyle = "#b9a87f";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } catch {
      /* skip artwork */
    }
  }

  // main text block
  const tx = 370;
  ctx.fillStyle = "#c73e1d";
  ctx.font = "bold 22px Georgia, serif";
  ctx.fillText("ONCHAIN POAP · ADMIT ONE", tx, 88);

  ctx.fillStyle = "#221c14";
  ctx.font = "900 44px Georgia, serif";
  wrapText(ctx, d.name, tx, 145, 380, 48, 2);

  ctx.fillStyle = "#6f6353";
  ctx.font = "24px Georgia, serif";
  ctx.fillText(d.dateStr + (d.location ? ` · ${truncate(d.location, 22)}` : ""), tx, 258);

  // collector badge
  if (d.collectorNo) {
    ctx.fillStyle = "#221c14";
    roundRect(ctx, tx, 290, 250, 54, 10);
    ctx.fill();
    ctx.fillStyle = "#f8f3e8";
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillText(`COLLECTOR #${d.collectorNo}`, tx + 20, 326);
  }
  ctx.fillStyle = "#6f6353";
  ctx.font = "18px monospace";
  ctx.fillText(shortAddr(d.address), tx + (d.collectorNo ? 270 : 0), d.collectorNo ? 324 : 320);

  // perforation line
  ctx.strokeStyle = "#b9a87f";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.moveTo(STUB_X, 20);
  ctx.lineTo(STUB_X, H - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // stub side
  ctx.save();
  ctx.translate(STUB_X + 160, 70);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = "#c73e1d";
  ctx.font = "bold 20px Georgia, serif";
  ctx.fillText("VERIFY ONCHAIN →", -30, -125);
  ctx.restore();

  try {
    const qr = await QRCode.toDataURL(d.verifyUrl, { width: 220, margin: 1, color: { dark: "#221c14", light: "#f8f3e8" } });
    const qi = await loadImage(qr);
    ctx.drawImage(qi, STUB_X + 50, 105, 200, 200);
  } catch {
    /* no qr */
  }
  ctx.fillStyle = "#6f6353";
  ctx.font = "16px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(`POAP #${d.eventId} · Base`, STUB_X + 150, 340);
  ctx.textAlign = "left";

  // punch perforation holes along the tear line (transparent)
  ctx.globalCompositeOperation = "destination-out";
  for (let y = 0; y <= H; y += 34) {
    ctx.beginPath();
    ctx.arc(STUB_X, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // notches on outer edges
  for (const ex of [0, W]) {
    ctx.beginPath();
    ctx.arc(ex, H / 2, 18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

export async function downloadTicketStub(d: StubData) {
  const blob = await renderTicketStub(d);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `poap-${d.eventId}-ticket-stub.png`;
  a.click();
  URL.revokeObjectURL(url);
}

/* helpers */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines: number) {
  const words = text.split(" ");
  let line = "", lines = 0;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(lines === maxLines - 1 ? truncate(line, 18) + "…" : line, x, y + lines * lh);
      lines++;
      if (lines >= maxLines) return;
      line = w;
    } else line = test;
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y + lines * lh);
}
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function shortAddr(a: string) {
  return a.slice(0, 6) + "…" + a.slice(-4);
}
