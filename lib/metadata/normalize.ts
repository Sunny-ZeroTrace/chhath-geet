/**
 * Real-world Chhath Geet titles from YouTube-style metadata look like:
 *   "छठ पूजा Special अरघ के बेर Aragh Ke Ber | ANURADHA PAUDWAL | Chhath Pooja | Chhath Puja"
 *
 * We only strip pieces we are CONFIDENT are noise (marketing tags, quality
 * labels, bracketed annotations, repeated festival-name boilerplate). We
 * never guess at removing something that might be part of the real title.
 * When in doubt, normalizeTitle() returns the original string unchanged.
 */

const NOISE_TAGS = [
  "official video",
  "official audio",
  "lyrical video",
  "lyrics video",
  "full video",
  "full song",
  "audio song",
  "video song",
  "new chhath geet",
  "new song",
  "latest chhath song",
  "hd video",
  "4k video",
  "hd",
  "4k",
];

// Festival-name boilerplate that tends to repeat across nearly every title
// in a Chhath library and adds no distinguishing information.
const FESTIVAL_BOILERPLATE = [
  "chhath pooja",
  "chhath puja",
  "chhath geet",
  "chhath special",
  "छठ पूजा",
  "छठ स्पेशल",
];

function stripBracketedAnnotations(input: string): string {
  // Removes [Official Video], (HD), {4K} style annotations only.
  return input.replace(/[[({][^[\]{}()]{0,40}[\])}]/g, " ");
}

function stripPipeSegmentsMatching(input: string, needles: string[]): string {
  const segments = input.split("|").map((s) => s.trim());
  if (segments.length <= 1) return input;

  const kept = segments.filter((segment) => {
    const lower = segment.toLowerCase();
    return !needles.some((needle) => lower === needle || lower.includes(needle));
  });

  // If stripping would remove everything, keep the original — never return
  // an empty title.
  if (kept.length === 0) return input;
  return kept.join(" | ");
}

export function normalizeTitle(rawTitle: string): string {
  if (!rawTitle || !rawTitle.trim()) return rawTitle;

  let result = rawTitle.trim();
  result = stripBracketedAnnotations(result);
  result = stripPipeSegmentsMatching(result, [
    ...NOISE_TAGS,
    ...FESTIVAL_BOILERPLATE,
  ]);

  // Collapse leftover whitespace and stray pipe/dash artifacts.
  result = result
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s|\-–]+|[\s|\-–]+$/g, "")
    .trim();

  // Conservative guard: if cleaning collapsed the title to almost nothing
  // (e.g. it was ONLY boilerplate), fall back to the original raw title
  // rather than risk destroying a meaningful Hindi/Bhojpuri title.
  if (result.length < 2) return rawTitle.trim();

  return result;
}

export function formatDuration(totalSeconds?: number | null): string {
  if (totalSeconds == null || Number.isNaN(totalSeconds) || totalSeconds < 0) {
    return "--:--";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** yt-dlp style upload_date "YYYYMMDD" -> ISO date, or undefined if unparseable. */
export function parseUploadDate(uploadDate?: string): string | undefined {
  if (!uploadDate || !/^\d{8}$/.test(uploadDate)) return undefined;
  const year = uploadDate.slice(0, 4);
  const month = uploadDate.slice(4, 6);
  const day = uploadDate.slice(6, 8);
  const iso = `${year}-${month}-${day}T00:00:00.000Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : iso;
}
