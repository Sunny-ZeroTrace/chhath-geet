import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const AUDIO_BUCKET = "audio";
export const COVERS_BUCKET = "covers";

export function resolveAudioUrl(
  supabase: SupabaseClient<Database>,
  path: string
): string {
  return supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function resolveCoverUrl(
  supabase: SupabaseClient<Database>,
  path: string | null
): string | null {
  if (!path) return null;
  return supabase.storage.from(COVERS_BUCKET).getPublicUrl(path).data.publicUrl;
}
