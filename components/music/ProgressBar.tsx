"use client";

import { formatDuration } from "@/lib/utils/format";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  compact?: boolean;
}

export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
  compact,
}: ProgressBarProps) {
  const safeDuration = duration > 0 ? duration : 0;

  return (
    <div className={compact ? "flex items-center gap-2" : "flex items-center gap-3"}>
      {!compact && (
        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-cream/60">
          {formatDuration(currentTime)}
        </span>
      )}
      <input
        type="range"
        className="player-range w-full"
        min={0}
        max={safeDuration || 1}
        step={0.1}
        value={Math.min(currentTime, safeDuration || 0)}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Seek"
      />
      {!compact && (
        <span className="w-10 shrink-0 text-xs tabular-nums text-cream/60">
          {formatDuration(safeDuration)}
        </span>
      )}
    </div>
  );
}
