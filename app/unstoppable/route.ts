import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

/** Serves the single-file, zero-dependency onchain explorer. */
export async function GET() {
  const file = path.join(process.cwd(), "public", "unstoppable.html");
  try {
    const html = await readFile(file, "utf8");
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Cache so it behaves like a truly immutable static artifact.
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Unstoppable explorer not built yet — run `npm run unstoppable`.", {
      status: 503,
    });
  }
}
