import { describe, expect, it } from "vitest";

/**
 * The real duplicate check lives in app/api/songs/route.ts and queries
 * Postgres directly (see supabase/migrations/001_initial.sql's
 * `songs_youtube_id_unique` constraint). This test documents and verifies
 * the decision function in isolation: given a youtube_id and a set of
 * existing songs, should this import be treated as a duplicate?
 */
function isDuplicate(
  youtubeId: string | null,
  existingYoutubeIds: string[]
): boolean {
  if (!youtubeId) return false; // no reliable ID — never guess
  return existingYoutubeIds.includes(youtubeId);
}

describe("duplicate detection strategy", () => {
  it("flags a song whose youtube_id already exists", () => {
    expect(isDuplicate("abc123", ["abc123", "def456"])).toBe(true);
  });

  it("does not flag a song with a new youtube_id", () => {
    expect(isDuplicate("xyz999", ["abc123", "def456"])).toBe(false);
  });

  it("never flags a song with no youtube_id as a duplicate by guessing", () => {
    expect(isDuplicate(null, ["abc123"])).toBe(false);
  });
});
