// Hand-written mirror of the `songs` table schema (supabase/migrations/001_initial.sql).
// Keep this in sync with the SQL migration.

export interface SongRow {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  description: string | null;
  audio_path: string;
  cover_path: string | null;
  youtube_url: string | null;
  youtube_id: string | null;
  uploader: string | null;
  language: string | null;
  playlist_name: string | null;
  playlist_id: string | null;
  playlist_index: number | null;
  duration: number | null;
  upload_date: string | null;
  tags: string[] | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_published: boolean;
  source_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsRow {
  id: number;
  site_title: string;
  site_description: string;
  hero_title: string;
  hero_subtitle: string;
  background_url: string | null;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      songs: {
        Row: SongRow;
        Insert: Partial<SongRow> & {
          title: string;
          artist: string;
          audio_path: string;
        };
        Update: Partial<SongRow>;
      };
      site_settings: {
        Row: SiteSettingsRow;
        Insert: Partial<SiteSettingsRow>;
        Update: Partial<SiteSettingsRow>;
      };
    };
  };
}
