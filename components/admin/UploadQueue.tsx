"use client";

import { useCallback, useState } from "react";
import { parseImportFiles } from "@/lib/metadata/parser";
import { uploadFileResumable } from "@/lib/music/tusUpload";
import { createClient } from "@/lib/supabase/client";
import { AUDIO_BUCKET, COVERS_BUCKET } from "@/lib/music/urls";
import UploadDropzone from "./UploadDropzone";
import MetadataPreview from "./MetadataPreview";
import UploadProgress from "./UploadProgress";
import {
  importedSongToFields,
  type QueueItem,
  type EditableFields,
} from "./uploadTypes";

export default function UploadQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsParsing(true);
    try {
      const imported = await parseImportFiles(files);
      const newItems: QueueItem[] = imported.map((song) => ({
        id: crypto.randomUUID(),
        imported: song,
        fields: importedSongToFields(song),
        status: song.audioFile ? "pending" : "needs-review",
        progress: 0,
      }));
      setItems((prev) => [...prev, ...newItems]);
    } finally {
      setIsParsing(false);
    }
  }, []);

  function updateItemFields(id: string, fields: EditableFields) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, fields } : item)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function patchItem(id: string, patch: Partial<QueueItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function publishItem(item: QueueItem, replaceExisting = false) {
    const { imported, fields } = item;
    if (!imported.audioFile) {
      patchItem(item.id, { status: "error", errorMessage: "No audio file — cannot publish." });
      return;
    }

    try {
      const songId = crypto.randomUUID();
      const audioExt = imported.audioFile.name.split(".").pop()?.toLowerCase() || "mp3";
      const audioPath = `${songId}/audio.${audioExt}`;
      let coverPath: string | null = null;

      patchItem(item.id, { status: "uploading", progress: 0, errorMessage: undefined });

      await uploadFileResumable({
        bucket: AUDIO_BUCKET,
        path: audioPath,
        file: imported.audioFile,
        onProgress: (percent) => patchItem(item.id, { progress: Math.round(percent * 0.85) }),
      });

      if (imported.coverFile) {
        const coverExt = imported.coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
        coverPath = `${songId}/cover.${coverExt}`;
        const supabase = createClient();
        const { error: coverError } = await supabase.storage
          .from(COVERS_BUCKET)
          .upload(coverPath, imported.coverFile, {
            upsert: false,
            contentType: imported.coverFile.type || undefined,
          });
        if (coverError) {
          throw new Error(`Cover upload failed: ${coverError.message}`);
        }
      }

      patchItem(item.id, { status: "saving", progress: 95 });

      const tags = fields.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fields.title,
          artist: fields.artist,
          album: fields.album || null,
          description: fields.description || null,
          language: fields.language || null,
          tags,
          duration: imported.duration ?? null,
          youtubeId: imported.youtubeId ?? null,
          youtubeUrl: imported.youtubeUrl ?? null,
          uploader: imported.sourceMetadata?.uploader ?? null,
          playlistName: fields.playlistName || null,
          playlistId: imported.playlistId ?? null,
          playlistIndex: imported.playlistIndex ?? null,
          uploadDate: imported.uploadDate ?? null,
          sourceMetadata: imported.sourceMetadata ?? null,
          audioPath,
          coverPath,
          isPublished: fields.isPublished,
          replaceExisting,
        }),
      });

      if (res.status === 409) {
        const body = await res.json();
        patchItem(item.id, {
          status: "duplicate",
          duplicateExistingId: body.existingId,
          progress: 100,
        });
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not save song to the database.");
      }

      patchItem(item.id, { status: "done", progress: 100 });
    } catch (error) {
      patchItem(item.id, {
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  }

  async function handlePublishAll() {
    setIsProcessing(true);
    const publishable = items.filter(
      (item) => item.status === "pending" && item.imported.audioFile
    );

    // Sequential, not parallel — keeps the browser responsive and avoids
    // hammering Storage with dozens of concurrent large uploads at once.
    for (const item of publishable) {
      // eslint-disable-next-line no-await-in-loop
      await publishItem(item);
    }
    setIsProcessing(false);
  }

  async function retryItem(item: QueueItem) {
    await publishItem(item);
  }

  async function resolveDuplicate(item: QueueItem, action: "skip" | "replace") {
    if (action === "skip") {
      patchItem(item.id, { status: "done", duplicateAction: "skip" });
      return;
    }
    await publishItem(item, true);
  }

  const completedCount = items.filter((i) => i.status === "done").length;
  const publishableItems = items.filter((item) => item.imported.audioFile);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gold-500/20 bg-gold-500/5 px-4 py-3 text-sm text-gold-300">
        Only upload recordings you have permission to publish and redistribute.
      </div>

      <UploadDropzone onFilesSelected={handleFilesSelected} />
      {isParsing && <p className="text-sm text-cream/50">Reading metadata…</p>}

      {items.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-cream">
              Uploading Music Library
            </h2>
            <p className="text-sm text-cream/60">
              {completedCount} / {publishableItems.length} completed
            </p>
          </div>

          <div className="space-y-3">
            {items.map((item) =>
              item.status === "pending" || item.status === "needs-review" ? (
                <MetadataPreview
                  key={item.id}
                  item={item}
                  onChange={(fields) => updateItemFields(item.id, fields)}
                  onRemove={() => removeItem(item.id)}
                  disabled={isProcessing}
                />
              ) : (
                <div
                  key={item.id}
                  className="rounded-xl border border-gold-500/15 bg-ghat-800/50 p-4"
                >
                  <UploadProgress
                    status={item.status}
                    progress={item.progress}
                    label={item.fields.title}
                    errorMessage={item.errorMessage}
                  />
                  {item.status === "error" && (
                    <button
                      onClick={() => retryItem(item)}
                      className="mt-2 text-xs font-semibold text-gold-400 hover:underline"
                    >
                      Retry
                    </button>
                  )}
                  {item.status === "duplicate" && (
                    <div className="mt-2 flex gap-3 text-xs">
                      <span className="text-cream/60">Song already exists.</span>
                      <button
                        onClick={() => resolveDuplicate(item, "skip")}
                        className="font-semibold text-cream/80 hover:underline"
                      >
                        Skip
                      </button>
                      <button
                        onClick={() => resolveDuplicate(item, "replace")}
                        className="font-semibold text-gold-400 hover:underline"
                      >
                        Replace
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          <button
            onClick={handlePublishAll}
            disabled={isProcessing || publishableItems.every((i) => i.status !== "pending")}
            className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ghat-900 hover:bg-gold-400 disabled:opacity-50"
          >
            {isProcessing ? "Publishing…" : "Publish All"}
          </button>
        </>
      )}
    </div>
  );
}
