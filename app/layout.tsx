import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Onchain POAPs — proof of attendance, forever onchain",
    template: "%s · Onchain POAPs",
  },
  description:
    "Create, distribute, mint and collect fully onchain POAPs on Base. SVG artwork and metadata live 100% onchain — no IPFS, no servers.",
  openGraph: {
    title: "Onchain POAPs",
    description:
      "Proof of attendance, forever onchain. Create and collect POAPs whose artwork lives entirely on Base.",
    url: APP_URL,
    siteName: "Onchain POAPs",
    images: ["/og.png"],
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${APP_URL}/og.png`,
      button: {
        title: "🪙 Open Onchain POAPs",
        action: {
          type: "launch_miniapp",
          name: "Onchain POAPs",
          url: APP_URL,
          splashImageUrl: `${APP_URL}/splash.png`,
          splashBackgroundColor: "#f8f3e8",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-body min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
