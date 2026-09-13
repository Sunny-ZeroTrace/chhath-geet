import type { SongRow } from "./database";

/**
 * The shape the frontend actually works with. Storage paths are resolved
 * into public/streamable URLs before this object is created.
 */
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  description: string | null;
  audioUrl: string;
  coverUrl: string | null;
  duration: number | null;
  language: string | null;
  tags: string[];
  playlistName: string | null;
  playlistIndex: number | null;
  isPublished: boolean;
  createdAt: string;
}

export function mapSongRowToSong(
  row: SongRow,
  resolveAudioUrl: (path: string) => string,
  resolveCoverUrl: (path: string | null) => string | null
): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album,
    description: row.description,
    audioUrl: resolveAudioUrl(row.audio_path),
    coverUrl: resolveCoverUrl(row.cover_path),
    duration: row.duration,
    language: row.language,
    tags: row.tags ?? [],
    playlistName: row.playlist_name,
    playlistIndex: row.playlist_index,
    isPublished: row.is_published,
    createdAt: row.created_at,
  };
}
