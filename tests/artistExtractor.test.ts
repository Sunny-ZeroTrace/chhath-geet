import { describe, expect, it } from "vitest";
import { extractArtist, UNKNOWN_ARTIST } from "@/lib/metadata/artistExtractor";

describe("extractArtist", () => {
  it("prefers an explicit artist field when present", () => {
    const artist = extractArtist({ artist: "Sharda Sinha" }, "Some Title | Other");
    expect(artist).toBe("Sharda Sinha");
  });

  it("detects an all-caps name segment between pipes", () => {
    const artist = extractArtist(
      undefined,
      "Aragh Ke Ber | ANURADHA PAUDWAL | Chhath Pooja"
    );
    expect(artist).toBe("ANURADHA PAUDWAL");
  });

  it("detects a 'Singer:' style indicator in the title", () => {
    const artist = extractArtist(undefined, "Chhath Geet Singer: Kalpana Patowary");
    expect(artist.toLowerCase()).toContain("kalpana patowary");
  });

  it("falls back to the uploader/channel when no name is found in the title", () => {
    const artist = extractArtist(
      { uploader: "Bhojpuri Music Channel" },
      "छठ पूजा गीत संग्रह"
    );
    expect(artist).toBe("Bhojpuri Music Channel");
  });

  it("never invents a name — falls back to Unknown Artist", () => {
    const artist = extractArtist(undefined, "छठ पूजा गीत संग्रह");
    expect(artist).toBe(UNKNOWN_ARTIST);
  });
});
