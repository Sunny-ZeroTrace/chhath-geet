import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveAudioUrl, resolveCoverUrl } from "./urls";
import { mapSongRowToSong } from "@/types/song";
import type { Song } from "@/types/song";

/** Only ever selects published songs — drafts never reach the public site. */
export async function getPublishedSongs(): Promise<Song[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("is_published", true)
    .order("playlist_index", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) =>
    mapSongRowToSong(
      row,
      (path) => resolveAudioUrl(supabase, path),
      (path) => resolveCoverUrl(supabase, path)
    )
  );
}

export async function getRecentlyAddedSongs(limit = 12): Promise<Song[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) =>
    mapSongRowToSong(
      row,
      (path) => resolveAudioUrl(supabase, path),
      (path) => resolveCoverUrl(supabase, path)
    )
  );
}

export async function getSongById(id: string): Promise<Song | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;

  return mapSongRowToSong(
    data,
    (path) => resolveAudioUrl(supabase, path),
    (path) => resolveCoverUrl(supabase, path)
  );
}

export async function getRelatedSongs(song: Song, limit = 6): Promise<Song[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("is_published", true)
    .neq("id", song.id)
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) =>
    mapSongRowToSong(
      row,
      (path) => resolveAudioUrl(supabase, path),
      (path) => resolveCoverUrl(supabase, path)
    )
  );
}

export async function searchPublishedSongs(query: string): Promise<Song[]> {
  const supabase = createServerSupabaseClient();
  const trimmed = query.trim();
  if (!trimmed) return getPublishedSongs();

  const pattern = `%${trimmed}%`;
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("is_published", true)
    .or(
      `title.ilike.${pattern},artist.ilike.${pattern},album.ilike.${pattern},uploader.ilike.${pattern}`
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) =>
    mapSongRowToSong(
      row,
      (path) => resolveAudioUrl(supabase, path),
      (path) => resolveCoverUrl(supabase, path)
    )
  );
}
