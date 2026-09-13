import { NextResponse, type NextRequest } from "next/server";
import { searchPublishedSongs } from "@/lib/music/queries";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const songs = await searchPublishedSongs(query);
  return NextResponse.json({ songs });
}
