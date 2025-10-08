import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const videoUrl = searchParams.get("url");
    const name = searchParams.get("name") || "video";

    if (!videoUrl) {
      return NextResponse.json({ error: "Missing video URL" }, { status: 400 });
    }

    const response = await fetch(videoUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.status}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${name}.mp4"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("❌ Download proxy error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
