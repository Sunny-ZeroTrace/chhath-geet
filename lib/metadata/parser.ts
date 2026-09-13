import { rawMetadataSchema, type ImportedSong, type RawMetadata } from "@/types/metadata";
import { normalizeTitle, parseUploadDate } from "./normalize";
import { extractArtist } from "./artistExtractor";

const AUDIO_EXTENSIONS = ["mp3", "m4a", "wav", "ogg", "webm"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"];

function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop() as string).toLowerCase() : "";
}

/**
 * Derives the grouping key from a filename by stripping its extension and,
 * for ".info.json" files, the ".info" suffix too.
 *   "001 - Aragh Ke Ber.mp3"       -> "001 - Aragh Ke Ber"
 *   "001 - Aragh Ke Ber.info.json" -> "001 - Aragh Ke Ber"
 *   "001 - Aragh Ke Ber.jpg"       -> "001 - Aragh Ke Ber"
 */
function getGroupKey(filename: string): string {
  const withoutExt = filename.replace(/\.[^./\\]+$/, "");
  return withoutExt.replace(/\.info$/i, "");
}

interface FileGroup {
  key: string;
  audio?: File;
  cover?: File;
  json?: File;
}

export function groupImportFiles(files: File[]): FileGroup[] {
  const groups = new Map<string, FileGroup>();

  for (const file of files) {
    const key = getGroupKey(file.name);
    const ext = getExtension(file.name);
    const existing = groups.get(key) ?? { key };

    if (ext === "json") {
      existing.json = file;
    } else if (IMAGE_EXTENSIONS.includes(ext)) {
      // Prefer the first image found; do not overwrite with a second cover
      // candidate for the same group.
      existing.cover = existing.cover ?? file;
    } else if (AUDIO_EXTENSIONS.includes(ext)) {
      existing.audio = existing.audio ?? file;
    }
    // Any other extension is ignored — it is not part of the song bundle.

    groups.set(key, existing);
  }

  return Array.from(groups.values());
}

async function parseJsonFile(file: File): Promise<RawMetadata | undefined> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const result = rawMetadataSchema.safeParse(parsed);
    return result.success ? result.data : undefined;
  } catch {
    return undefined;
  }
}

const FALLBACK_TITLE_PREFIX = "Untitled — ";

export async function buildImportedSong(group: FileGroup): Promise<ImportedSong> {
  const warnings: string[] = [];

  if (!group.audio) warnings.push("Audio file missing — cannot publish without it.");
  if (!group.json) warnings.push("Metadata (.info.json) missing — using filename as title.");
  if (!group.cover) warnings.push("Cover image missing — add one before publishing.");

  const sourceMetadata = group.json ? await parseJsonFile(group.json) : undefined;
  if (group.json && !sourceMetadata) {
    warnings.push("Metadata JSON could not be parsed (invalid JSON) — using filename as title.");
  }

  const rawTitle =
    sourceMetadata?.title?.trim() ||
    sourceMetadata?.fulltitle?.trim() ||
    group.key;

  const title = normalizeTitle(rawTitle) || `${FALLBACK_TITLE_PREFIX}${group.key}`;
  const artist = extractArtist(sourceMetadata, rawTitle);

  return {
    groupKey: group.key,
    title,
    artist,
    duration: sourceMetadata?.duration,
    language: sourceMetadata?.language,
    youtubeId: sourceMetadata?.id,
    youtubeUrl: sourceMetadata?.webpage_url ?? sourceMetadata?.original_url,
    playlistName: sourceMetadata?.playlist,
    playlistId: sourceMetadata?.playlist_id,
    playlistIndex: sourceMetadata?.playlist_index,
    uploadDate: parseUploadDate(sourceMetadata?.upload_date),
    tags: sourceMetadata?.tags ?? sourceMetadata?.categories,
    description: sourceMetadata?.description,
    audioFile: group.audio,
    coverFile: group.cover,
    jsonFile: group.json,
    sourceMetadata,
    warnings,
  };
}

export async function parseImportFiles(files: File[]): Promise<ImportedSong[]> {
  const groups = groupImportFiles(files);
  return Promise.all(groups.map(buildImportedSong));
}
