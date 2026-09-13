import { z } from "zod";

/**
 * .info.json files (yt-dlp style) are messy and inconsistent in the wild.
 * Every field is optional here on purpose — we never assume a field exists.
 */
export const rawMetadataSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    fulltitle: z.string().optional(),
    artist: z.string().optional(),
    creator: z.string().optional(),
    uploader: z.string().optional(),
    uploader_id: z.string().optional(),
    channel: z.string().optional(),
    duration: z.number().optional(),
    webpage_url: z.string().optional(),
    original_url: z.string().optional(),
    language: z.string().optional(),
    playlist: z.string().optional(),
    playlist_id: z.string().optional(),
    playlist_index: z.number().optional(),
    upload_date: z.string().optional(), // yt-dlp format: YYYYMMDD
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    view_count: z.number().optional(),
    like_count: z.number().optional(),
    comment_count: z.number().optional(),
    thumbnail: z.string().optional(),
    thumbnails: z
      .array(
        z.object({
          url: z.string().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
      )
      .optional(),
    description: z.string().optional(),
  })
  // Real-world files often carry extra fields we don't model. Keep them
  // rather than stripping them, since source_metadata is the archival copy.
  .passthrough();

export type RawMetadata = z.infer<typeof rawMetadataSchema>;

/** Result of parsing + normalizing one grouped song import. */
export interface ImportedSong {
  /** Local grouping key derived from the shared filename prefix. */
  groupKey: string;
  title: string;
  artist: string;
  duration?: number;
  language?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  playlistName?: string;
  playlistId?: string;
  playlistIndex?: number;
  uploadDate?: string;
  tags?: string[];
  description?: string;
  audioFile?: File;
  coverFile?: File;
  jsonFile?: File;
  sourceMetadata?: RawMetadata;
  warnings: string[];
}
