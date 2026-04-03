import { NextRequest, NextResponse } from "next/server";

function extract(html: string, property: string): string {
  // property="og:xxx" content="..." と content="..." property="og:xxx" の両方に対応
  const a = html.match(
    new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]*)"`, "i")
  );
  const b = html.match(
    new RegExp(`<meta[^>]+content="([^"]*)"[^>]+property="${property}"`, "i")
  );
  return (a?.[1] ?? b?.[1] ?? "").replace(/&amp;/g, "&").replace(/&#39;/g, "'");
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; noteTreeBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();

    return NextResponse.json({
      title: extract(html, "og:title"),
      image: extract(html, "og:image"),
    });
  } catch {
    return NextResponse.json({ title: "", image: "" });
  }
}
