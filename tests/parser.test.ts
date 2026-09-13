import { describe, expect, it } from "vitest";
import { groupImportFiles, parseImportFiles } from "@/lib/metadata/parser";

function makeFile(name: string, content = "x", type = "application/octet-stream"): File {
  return new File([content], name, { type });
}

describe("groupImportFiles", () => {
  it("groups mp3 + info.json + jpg sharing a filename prefix into one song", () => {
    const files = [
      makeFile("001 - Aragh Ke Ber.mp3"),
      makeFile("001 - Aragh Ke Ber.info.json", "{}"),
      makeFile("001 - Aragh Ke Ber.jpg"),
      makeFile("002 - Chhathi Maiya Ke Geet.mp3"),
      makeFile("002 - Chhathi Maiya Ke Geet.info.json", "{}"),
      makeFile("002 - Chhathi Maiya Ke Geet.jpg"),
    ];

    const groups = groupImportFiles(files);
    expect(groups).toHaveLength(2);

    const first = groups.find((g) => g.key === "001 - Aragh Ke Ber");
    expect(first?.audio?.name).toBe("001 - Aragh Ke Ber.mp3");
    expect(first?.json?.name).toBe("001 - Aragh Ke Ber.info.json");
    expect(first?.cover?.name).toBe("001 - Aragh Ke Ber.jpg");
  });

  it("does not treat the JSON or JPG as separate songs", () => {
    const files = [
      makeFile("Song.mp3"),
      makeFile("Song.info.json", "{}"),
      makeFile("Song.jpg"),
    ];
    const groups = groupImportFiles(files);
    expect(groups).toHaveLength(1);
  });

  it("ignores unsupported file types", () => {
    const files = [makeFile("Song.mp3"), makeFile("Song.txt")];
    const groups = groupImportFiles(files);
    expect(groups).toHaveLength(1);
    expect(groups[0].audio?.name).toBe("Song.mp3");
  });
});

describe("parseImportFiles (full pipeline)", () => {
  it("builds a complete ImportedSong from mp3 + info.json + jpg", async () => {
    const metadata = JSON.stringify({
      title: "छठ पूजा Special अरघ के बेर Aragh Ke Ber | ANURADHA PAUDWAL | Chhath Puja",
      id: "abc123",
      duration: 370,
      webpage_url: "https://youtube.com/watch?v=abc123",
      language: "hi",
    });

    const files = [
      makeFile("001 - Aragh Ke Ber.mp3"),
      makeFile("001 - Aragh Ke Ber.info.json", metadata),
      makeFile("001 - Aragh Ke Ber.jpg"),
    ];

    const [song] = await parseImportFiles(files);

    expect(song.title).toContain("अरघ के बेर");
    expect(song.artist).toBe("ANURADHA PAUDWAL");
    expect(song.duration).toBe(370);
    expect(song.youtubeId).toBe("abc123");
    expect(song.audioFile).toBeDefined();
    expect(song.coverFile).toBeDefined();
    expect(song.warnings).toHaveLength(0);
  });

  it("warns but does not throw when the audio file is missing", async () => {
    const files = [makeFile("002 - Song.info.json", "{}"), makeFile("002 - Song.jpg")];
    const [song] = await parseImportFiles(files);
    expect(song.audioFile).toBeUndefined();
    expect(song.warnings.some((w) => w.toLowerCase().includes("audio"))).toBe(true);
  });

  it("warns but keeps the filename as title when JSON is invalid", async () => {
    const files = [makeFile("003 - Song.mp3"), makeFile("003 - Song.info.json", "{not valid json")];
    const [song] = await parseImportFiles(files);
    expect(song.title).toBe("003 - Song");
    expect(song.warnings.some((w) => w.toLowerCase().includes("invalid"))).toBe(true);
  });

  it("warns when the cover image is missing", async () => {
    const files = [makeFile("004 - Song.mp3"), makeFile("004 - Song.info.json", "{}")];
    const [song] = await parseImportFiles(files);
    expect(song.coverFile).toBeUndefined();
    expect(song.warnings.some((w) => w.toLowerCase().includes("cover"))).toBe(true);
  });
});
