import type { Metadata } from "next";
import { PoapDetail } from "./PoapDetail";
import { serverClient, APP_URL } from "@/lib/server";
import { POAP_ABI, POAP_ADDRESS } from "@/lib/contract";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const idStr = params.id;
  let name = `POAP #${idStr}`;
  let description = "A fully onchain POAP on Base.";
  try {
    const raw = await serverClient.readContract({
      abi: POAP_ABI,
      address: POAP_ADDRESS,
      functionName: "events",
      args: [BigInt(idStr)],
    });
    if (raw[0]) {
      name = raw[0];
      description = raw[1] || description;
    }
  } catch {
    /* fall back to defaults */
  }

  const pageUrl = `${APP_URL}/poap/${idStr}`;
  const imageUrl = `${APP_URL}/poap/${idStr}/og`;

  return {
    title: name,
    description,
    openGraph: {
      title: `${name} · Onchain POAP`,
      description,
      url: pageUrl,
      images: [imageUrl],
    },
    other: {
      // every POAP page is castable as its own Mini App card
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl,
        button: {
          title: "🪙 Mint this POAP",
          action: {
            type: "launch_miniapp",
            name: "Onchain POAPs",
            url: pageUrl,
            splashImageUrl: `${APP_URL}/splash.png`,
            splashBackgroundColor: "#f8f3e8",
          },
        },
      }),
    },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <PoapDetail id={params.id} />;
}
