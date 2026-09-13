"use client";

import { CheckCircle2, XCircle, Music2 } from "lucide-react";
import { formatDuration } from "@/lib/utils/format";
import type { QueueItem, EditableFields } from "./uploadTypes";

interface MetadataPreviewProps {
  item: QueueItem;
  onChange: (fields: EditableFields) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export default function MetadataPreview({
  item,
  onChange,
  onRemove,
  disabled,
}: MetadataPreviewProps) {
  const { imported, fields } = item;
  const coverPreviewUrl = imported.coverFile
    ? URL.createObjectURL(imported.coverFile)
    : null;

  function update<K extends keyof EditableFields>(key: K, value: EditableFields[K]) {
    onChange({ ...fields, [key]: value });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gold-500/15 bg-ghat-800/50 p-4 sm:flex-row">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-ghat-700">
        {coverPreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreviewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music2 className="h-8 w-8 text-gold-500/40" />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            <LabeledInput
              label="Title"
              value={fields.title}
              onChange={(v) => update("title", v)}
              disabled={disabled}
              devanagari
            />
            <LabeledInput
              label="Artist"
              value={fields.artist}
              onChange={(v) => update("artist", v)}
              disabled={disabled}
            />
            <LabeledInput
              label="Album"
              value={fields.album}
              onChange={(v) => update("album", v)}
              disabled={disabled}
            />
            <LabeledInput
              label="Language"
              value={fields.language}
              onChange={(v) => update("language", v)}
              disabled={disabled}
            />
            <LabeledInput
              label="Playlist"
              value={fields.playlistName}
              onChange={(v) => update("playlistName", v)}
              disabled={disabled}
            />
            <LabeledInput
              label="Tags (comma separated)"
              value={fields.tags}
              onChange={(v) => update("tags", v)}
              disabled={disabled}
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove from queue"
            className="text-cream/40 transition hover:text-red-400"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-cream/50">
            Description
          </label>
          <textarea
            value={fields.description}
            onChange={(e) => update("description", e.target.value)}
            disabled={disabled}
            rows={2}
            className="w-full rounded-lg border border-gold-500/20 bg-ghat-900/50 px-3 py-2 text-sm text-cream focus:border-gold-500/60 focus:outline-none disabled:opacity-60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-cream/60">
          <span>Duration: {formatDuration(imported.duration)}</span>
          <CheckRow ok={!!imported.audioFile} label="Audio found" />
          <CheckRow ok={!!imported.jsonFile} label="Metadata found" />
          <CheckRow ok={!!imported.coverFile} label="Cover found" />
          <label className="ml-auto flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={fields.isPublished}
              onChange={(e) => update("isPublished", e.target.checked)}
              disabled={disabled}
            />
            Publish immediately
          </label>
        </div>

        {imported.warnings.length > 0 && (
          <ul className="space-y-0.5 text-xs text-gold-400">
            {imported.warnings.map((warning, i) => (
              <li key={i}>⚠ {warning}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok ? "flex items-center gap-1 text-green-400" : "flex items-center gap-1 text-cream/40"}>
      <CheckCircle2 className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  disabled,
  devanagari,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  devanagari?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-cream/50">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={
          "w-full rounded-lg border border-gold-500/20 bg-ghat-900/50 px-3 py-2 text-sm text-cream focus:border-gold-500/60 focus:outline-none disabled:opacity-60 " +
          (devanagari ? "font-devanagari" : "")
        }
      />
    </div>
  );
}
