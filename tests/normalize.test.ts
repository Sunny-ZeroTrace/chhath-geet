import { describe, expect, it } from "vitest";
import { normalizeTitle, formatDuration, parseUploadDate } from "@/lib/metadata/normalize";

describe("normalizeTitle", () => {
  it("strips festival boilerplate and marketing tags from a messy title", () => {
    const raw =
      "छठ पूजा Special अरघ के बेर Aragh Ke Ber | ANURADHA PAUDWAL | Chhath Pooja | Chhath Puja";
    const result = normalizeTitle(raw);
    expect(result).toContain("अरघ के बेर");
    expect(result.toLowerCase()).not.toContain("chhath pooja");
  });

  it("removes bracketed annotations like [Official Video]", () => {
    const result = normalizeTitle("Chhathi Maiya Ke Geet [Official Video] (HD)");
    expect(result).not.toMatch(/\[.*\]/);
    expect(result).not.toMatch(/\(HD\)/i);
  });

  it("falls back to the original title if cleaning would remove everything", () => {
    const raw = "Chhath Puja | Chhath Pooja | Chhath Geet";
    const result = normalizeTitle(raw);
    expect(result.length).toBeGreaterThan(0);
  });

  it("never returns an empty string for a non-empty input", () => {
    expect(normalizeTitle("   ")).toBe("   ");
    expect(normalizeTitle("a")).toBe("a");
  });
});

describe("formatDuration", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatDuration(370)).toBe("6:10");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(5)).toBe("0:05");
  });

  it("handles missing or invalid durations", () => {
    expect(formatDuration(undefined)).toBe("--:--");
    expect(formatDuration(null)).toBe("--:--");
    expect(formatDuration(-5)).toBe("--:--");
  });
});

describe("parseUploadDate", () => {
  it("parses yt-dlp style YYYYMMDD dates", () => {
    const iso = parseUploadDate("20231115");
    expect(iso).toContain("2023-11-15");
  });

  it("returns undefined for malformed dates", () => {
    expect(parseUploadDate("not-a-date")).toBeUndefined();
    expect(parseUploadDate(undefined)).toBeUndefined();
  });
});
