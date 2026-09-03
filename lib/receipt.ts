"use client";

import QRCode from "qrcode";

/**
 * A frameable / printable one-page proof of attendance.
 * The "pics or it didn't happen" ethos: this is the physical receipt a judge
 * (or collector) can pin to a wall. Drawn on a portrait A4-ish canvas.
 */
export interface ReceiptData {
  title: string; // e.g. "ONCHAIN POAP · PROOF OF ATTENDANCE"
  eventName: string;
  eventId: string;
  wallet: string; // full 0x address
  collectorNo?: string;
  dateStr: string;
  location?: string;
  txHash?: string;
  baseUrl: string; // link to verify page
  chainLabel: string; // "Base Sepolia"
  contract: string;
}

const W = 1240;
const H = 1754; // portrait, letter-ish ratio

export async function renderAttestationReceipt(d: ReceiptData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const paper = "#f8f3e8";

  // ---- paper ----
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  // subtle grain
  ctx.fillStyle = "rgba(34,28,20,0.04)";
  for (let x = 10; x < W; x += 24)
    for (let y = 10; y < H; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

  // double border (postage frame)
  ctx.strokeStyle = "#c73e1d";
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.strokeStyle = "#b9a87f";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  // perforation dots along inner border
  ctx.fillStyle = "#b9a87f";
  for (let x = 60; x < W - 40; x += 26) {
    ctx.beginPath();
    ctx.arc(x, 44, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, H - 44, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let y = 60; y < H - 40; y += 26) {
    ctx.beginPath();
    ctx.arc(44, y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W - 44, y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const cx = W / 2;

  // ---- header ----
  ctx.textAlign = "center";
  ctx.fillStyle = "#b98a2e";
  ctx.font = "600 26px monospace";
  ctx.fillText("✦ STAMPED, NOT STORED ✦", cx, 150);
  ctx.fillStyle = "#c73e1d";
  ctx.font = "900 52px Georgia, serif";
  ctx.fillText(d.title, cx, 230);
  ctx.fillStyle = "#6f6353";
  ctx.font = "22px Georgia, serif";
  ctx.fillText("Issued onchain on " + d.chainLabel, cx, 268);

  // divider
  ctx.strokeStyle = "#b9a87f";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 300);
  ctx.lineTo(W - 120, 300);
  ctx.stroke();

  // ---- event name (big) ----
  ctx.fillStyle = "#221c14";
  ctx.font = "900 44px Georgia, serif";
  ctx.fillText(d.eventName, cx, 380);
  ctx.fillStyle = "#6f6353";
  ctx.font = "26px Georgia, serif";
  ctx.fillText("#" + d.eventId + " · " + d.dateStr + (d.location ? " · " + d.location : ""), cx, 428);

  // ---- collector badge ----
  ctx.fillStyle = "#221c14";
  roundRect(ctx, cx - 320, 480, 640, 120, 18);
  ctx.fill();
  ctx.fillStyle = "#f8f3e8";
  ctx.font = "700 30px monospace";
  ctx.fillText("CERTIFIED COLLECTOR", cx, 528);
  ctx.font = "900 64px Georgia, serif";
  ctx.fillText(d.collectorNo ? `#${d.collectorNo}` : "✓", cx, 576);

  // ---- wallet ----
  ctx.fillStyle = "#6f6353";
  ctx.font = "500 22px monospace";
  ctx.fillText("WALLET", cx, 680);
  ctx.fillStyle = "#221c14";
  ctx.font = "600 26px monospace";
  ctx.fillText(d.wallet, cx, 716);

  // ---- QR + verify ----
  ctx.fillStyle = "#6f6353";
  ctx.font = "500 22px monospace";
  ctx.fillText("SCAN TO VERIFY ONCHAIN", cx, 800);
  try {
    const qr = await QRCode.toDataURL(d.baseUrl, {
      width: 320,
      margin: 1,
      color: { dark: "#221c14", light: "#f8f3e8" },
    });
    const img = await loadImage(qr);
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, cx - 190, 830, 380, 380, 16);
    ctx.fill();
    ctx.strokeStyle = "#b9a87f";
    ctx.lineWidth = 2;
    roundRect(ctx, cx - 190, 830, 380, 380, 16);
    ctx.stroke();
    ctx.drawImage(img, cx - 168, 852, 336, 336);
  } catch {
    /* no qr */
  }

  // ---- tx hash ----
  if (d.txHash) {
    ctx.fillStyle = "#6f6353";
    ctx.font = "500 20px monospace";
    ctx.fillText("MINT TRANSACTION", cx, 1280);
    ctx.fillStyle = "#221c14";
    ctx.font = "600 22px monospace";
    ctx.fillText(d.txHash, cx, 1316);
  }

  // ---- contract footer ----
  ctx.fillStyle = "#6f6353";
  ctx.font = "18px monospace";
  ctx.fillText("CONTRACT " + d.contract, cx, 1500);
  ctx.fillStyle = "#b9a87f";
  ctx.fillText("onchain-poaps · 100% onchain · no IPFS", cx, 1536);

  // wax seal
  drawSeal(ctx, W - 150, 160);

  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

export async function downloadAttestationReceipt(d: ReceiptData) {
  const blob = await renderAttestationReceipt(d);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attestation-poap-${d.eventId}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function printAttestationReceipt(d: ReceiptData) {
  // Open the image in a new tab sized for printing.
  const blob = await renderAttestationReceipt(d);
  const url = URL.createObjectURL(blob);
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(
      `<html><head><title>Attestation · POAP #${d.eventId}</title><style>body{margin:0;display:flex;justify-content:center;background:#e5e5e5}img{max-width:100%;max-height:96vh}</style></head><body onload="this.focus();this.print()"><img src="${url}"/></body></html>`,
    );
    w.document.close();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.18);
  const g = ctx.createRadialGradient(-10, -10, 6, 0, 0, 52);
  g.addColorStop(0, "#d1473a");
  g.addColorStop(0.6, "#a32618");
  g.addColorStop(1, "#6f140c");
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const r = 50 + (i % 2 ? 6 : -2);
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#5c120a";
  ctx.beginPath();
  ctx.arc(0, -4, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8a1d12";
  ctx.font = "900 26px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("P", 0, 8);
  ctx.restore();
}

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
