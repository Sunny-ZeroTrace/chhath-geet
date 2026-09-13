import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAudioUrl, resolveCoverUrl, AUDIO_BUCKET, COVERS_BUCKET } from "./urls";
import { mapSongRowToSong } from "@/types/song";
import type { Song } from "@/types/song";
import type { SongRow } from "@/types/database";

export interface AdminSongSummary extends Song {
  isPublished: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalSongs: number;
  published: number;
  drafts: number;
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  const { count: totalSongs } = await supabase
    .from("songs")
    .select("*", { count: "exact", head: true });
  const { count: published } = await supabase
    .from("songs")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const total = totalSongs ?? 0;
  const pub = published ?? 0;

  return { totalSongs: total, published: pub, drafts: total - pub };
}

export async function getAdminRecentSongs(limit = 8): Promise<Song[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row: SongRow) =>
    mapSongRowToSong(
      row,
      (path) => resolveAudioUrl(supabase, path),
      (path) => resolveCoverUrl(supabase, path)
    )
  );
}

export async function getAllSongsForAdmin(): Promise<Song[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: SongRow) =>
    mapSongRowToSong(
      row,
      (path) => resolveAudioUrl(supabase, path),
      (path) => resolveCoverUrl(supabase, path)
    )
  );
}

/**
 * Deletes a song's database row and both associated Storage objects.
 * Reports partial failure rather than throwing blindly, so the admin UI can
 * tell the difference between "fully deleted" and "db gone but a file
 * survived" (which needs manual cleanup).
 */
export async function deleteSongCompletely(songId: string): Promise<{
  ok: boolean;
  warnings: string[];
}> {
  const supabase = createAdminClient();
  const warnings: string[] = [];

  const { data: song, error: fetchError } = await supabase
    .from("songs")
    .select("audio_path, cover_path")
    .eq("id", songId)
    .maybeSingle();

  if (fetchError || !song) {
    return { ok: false, warnings: ["Song not found."] };
  }

  const { error: deleteError } = await supabase.from("songs").delete().eq("id", songId);
  if (deleteError) {
    return { ok: false, warnings: [`Database delete failed: ${deleteError.message}`] };
  }

  const { error: audioError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .remove([song.audio_path]);
  if (audioError) warnings.push(`Audio file cleanup failed: ${audioError.message}`);

  if (song.cover_path) {
    const { error: coverError } = await supabase.storage
      .from(COVERS_BUCKET)
      .remove([song.cover_path]);
    if (coverError) warnings.push(`Cover file cleanup failed: ${coverError.message}`);
  }

  return { ok: true, warnings };
}
