import { NextResponse } from "next/server";
import { generateRssFeed } from "@/data/blog/rss";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bookconv.com";
  const xml = generateRssFeed(baseUrl);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
