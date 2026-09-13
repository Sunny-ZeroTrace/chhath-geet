import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json();
  const allowedFields = [
    "site_title",
    "site_description",
    "hero_title",
    "hero_subtitle",
    "background_url",
  ] as const;

  const update: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) update[field] = body[field];
  }

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").update(update).eq("id", 1);

  if (error) {
    return NextResponse.json({ error: "Could not update settings." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
