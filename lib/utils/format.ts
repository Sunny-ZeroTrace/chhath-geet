export { formatDuration } from "@/lib/metadata/normalize";

export function slugifySongId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Normalizes an uploaded filename before it becomes a Storage object path. */
export function normalizeStorageFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return ext ? `file.${ext}` : "file";
}
