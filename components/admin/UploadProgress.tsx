"use client";

import { CheckCircle2, AlertCircle, Loader2, Circle } from "lucide-react";
import type { QueueItemStatus } from "./uploadTypes";

interface UploadProgressProps {
  status: QueueItemStatus;
  progress: number;
  label: string;
  errorMessage?: string;
}

const STATUS_LABEL: Record<QueueItemStatus, string> = {
  pending: "Waiting",
  "needs-review": "Needs review",
  duplicate: "Duplicate found",
  uploading: "Uploading",
  saving: "Saving",
  done: "Uploaded",
  error: "Failed",
};

export default function UploadProgress({
  status,
  progress,
  label,
  errorMessage,
}: UploadProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <StatusIcon status={status} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-cream">{label}</p>
        {status === "uploading" ? (
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ghat-700">
            <div
              className="h-full rounded-full bg-gold-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : (
          <p
            className={
              status === "error"
                ? "text-xs text-red-400"
                : status === "duplicate"
                ? "text-xs text-gold-400"
                : "text-xs text-cream/50"
            }
          >
            {errorMessage ?? STATUS_LABEL[status]}
            {status === "uploading" && ` — ${progress}%`}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: QueueItemStatus }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />;
    case "error":
      return <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />;
    case "duplicate":
      return <AlertCircle className="h-5 w-5 shrink-0 text-gold-400" />;
    case "uploading":
    case "saving":
      return <Loader2 className="h-5 w-5 shrink-0 animate-spin text-gold-400" />;
    default:
      return <Circle className="h-5 w-5 shrink-0 text-cream/30" />;
  }
}
