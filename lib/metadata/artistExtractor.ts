import type { RawMetadata } from "@/types/metadata";

export const UNKNOWN_ARTIST = "Unknown Artist";

const ARTIST_INDICATOR_PATTERN =
  /(?:singer|artist|vocals?|by|gayak|gayika)\s*[:\-]?\s*([^|]+)/i;

/**
 * Rules, in priority order:
 * 1. A clean explicit artist/creator field, if present and not empty.
 * 2. A pipe-separated title segment that matches a "Singer:"/"Artist:"/"By"
 *    style indicator.
 * 3. A pipe-separated title segment that looks like a name (mostly capital
 *    letters, no known noise words) — common in Chhath uploads that just
 *    put the singer's name in caps between pipes.
 * 4. Fall back to uploader/channel name.
 * 5. Fall back to "Unknown Artist". Never invent a name.
 */
export function extractArtist(
  metadata: RawMetadata | undefined,
  title: string
): string {
  const explicit = metadata?.artist?.trim() || metadata?.creator?.trim();
  if (explicit) return explicit;

  const indicatorMatch = title.match(ARTIST_INDICATOR_PATTERN);
  if (indicatorMatch?.[1]) {
    const candidate = indicatorMatch[1].trim();
    if (candidate.length >= 2 && candidate.length <= 60) return candidate;
  }

  const segments = title.split("|").map((s) => s.trim()).filter(Boolean);
  const nameLikeSegment = segments.find((segment) => looksLikeArtistName(segment));
  if (nameLikeSegment) return nameLikeSegment;

  const fallback = metadata?.uploader?.trim() || metadata?.channel?.trim();
  if (fallback) return fallback;

  return UNKNOWN_ARTIST;
}

const KNOWN_NOISE_WORDS = [
  "chhath",
  "puja",
  "pooja",
  "geet",
  "special",
  "official",
  "video",
  "audio",
  "song",
  "hd",
  "4k",
  "lyrics",
  "new",
  "latest",
];

function looksLikeArtistName(segment: string): boolean {
  if (segment.length < 3 || segment.length > 40) return false;

  const lower = segment.toLowerCase();
  if (KNOWN_NOISE_WORDS.some((word) => lower.includes(word))) return false;

  // Mostly Latin letters and spaces, and either fully capitalized (common
  // pattern: "ANURADHA PAUDWAL") or Title Case with 2-3 words.
  const isLatinName = /^[A-Za-z.\s]+$/.test(segment);
  if (!isLatinName) return false;

  const isAllCaps = segment === segment.toUpperCase();
  const wordCount = segment.trim().split(/\s+/).length;

  return isAllCaps || (wordCount >= 2 && wordCount <= 4);
}
