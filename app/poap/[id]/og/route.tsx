import { ImageResponse } from "next/og";
import { serverClient } from "@/lib/server";
import { POAP_ABI, POAP_ADDRESS } from "@/lib/contract";
import { parseTokenUri } from "@/lib/poap";

export const runtime = "edge";
export const revalidate = 300;

const W = 1200;
const H = 800; // 3:2 as required by Farcaster miniapp embeds

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  let name = `POAP #${params.id}`;
  let location = "";
  let image: string | null = null;

  try {
    const id = BigInt(params.id);
    const [raw, uri] = await Promise.all([
      serverClient.readContract({
        abi: POAP_ABI,
        address: POAP_ADDRESS,
        functionName: "events",
        args: [id],
      }),
      serverClient.readContract({
        abi: POAP_ABI,
        address: POAP_ADDRESS,
        functionName: "uri",
        args: [id],
      }),
    ]);
    if (raw[0]) {
      name = raw[0];
      location = raw[3];
    }
    const meta = parseTokenUri(uri as string);
    image = meta?.image ?? null;
  } catch {
    /* render text-only card */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          alignItems: "center",
          background: "#f8f3e8",
          fontFamily: "serif",
          padding: 64,
          gap: 64,
        }}
      >
        <div
          style={{
            width: 480,
            height: 480,
            borderRadius: 480,
            background: "#efe6d2",
            border: "10px dashed #b9a87f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              width={440}
              height={440}
              style={{ borderRadius: 440, objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: 200, color: "#c73e1d", display: "flex" }}>
              🪙
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 28,
              color: "#c73e1d",
              textTransform: "uppercase",
              letterSpacing: 4,
              fontWeight: 700,
              display: "flex",
            }}
          >
            Onchain POAP · #{params.id}
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#221c14",
              lineHeight: 1.1,
              marginTop: 16,
              display: "flex",
            }}
          >
            {name.length > 40 ? name.slice(0, 37) + "…" : name}
          </div>
          {location && (
            <div
              style={{
                fontSize: 32,
                color: "#6f6353",
                marginTop: 16,
                display: "flex",
              }}
            >
              📍 {location}
            </div>
          )}
          <div
            style={{
              fontSize: 26,
              color: "#6f6353",
              marginTop: 32,
              display: "flex",
            }}
          >
            Artwork &amp; metadata live 100% on Base
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
