import type { ImportedSong } from "@/types/metadata";

export type QueueItemStatus =
  | "pending"
  | "needs-review"
  | "duplicate"
  | "uploading"
  | "saving"
  | "done"
  | "error";

export interface EditableFields {
  title: string;
  artist: string;
  album: string;
  description: string;
  tags: string;
  language: string;
  playlistName: string;
  isPublished: boolean;
}

export interface QueueItem {
  id: string;
  imported: ImportedSong;
  fields: EditableFields;
  status: QueueItemStatus;
  progress: number;
  errorMessage?: string;
  duplicateExistingId?: string;
  duplicateAction?: "skip" | "replace";
}

export function importedSongToFields(imported: ImportedSong): EditableFields {
  return {
    title: imported.title,
    artist: imported.artist,
    album: "",
    description: imported.description ?? "",
    tags: (imported.tags ?? []).join(", "),
    language: imported.language ?? "",
    playlistName: imported.playlistName ?? "",
    isPublished: true,
  };
}
