import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Only allow bcliquorstores.com images
  const allowedHost = "www.bcliquorstores.com";
  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
    if (targetUrl.hostname !== allowedHost) {
      return new NextResponse("Invalid image source", { status: 403 });
    }
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/avif,image/webp,image/jpeg,image/png,*/*",
      },
    });

    if (!response.ok) {
      return new NextResponse("Image fetch failed", {
        status: response.status,
      });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        // Private: browsers cache per-URL, but Netlify's shared (Durable) cache
        // keys route-handler responses by path only — "public" made every
        // /api/images request return the first cached image. Private keeps
        // browser caching without collapsing all images into one entry.
        "Cache-Control": "private, max-age=86400", // 24h browser cache for images
      },
    });
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
