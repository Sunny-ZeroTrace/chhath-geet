import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteSongCompletely } from "@/lib/music/adminQueries";

async function requireAdmin() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json();
  const allowedFields = [
    "title",
    "artist",
    "album",
    "description",
    "language",
    "tags",
    "is_published",
    "playlist_name",
    "playlist_index",
  ] as const;

  const update: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) update[field] = body[field];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("songs").update(update).eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Could not update song." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const result = await deleteSongCompletely(params.id);
  if (!result.ok) {
    return NextResponse.json({ error: "Could not delete song." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, warnings: result.warnings });
}
