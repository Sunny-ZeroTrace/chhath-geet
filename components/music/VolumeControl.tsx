"use client";

import { Volume2, VolumeX } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onChange: (volume: number) => void;
  onToggleMute: () => void;
}

export default function VolumeControl({
  volume,
  isMuted,
  onChange,
  onToggleMute,
}: VolumeControlProps) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="text-cream/70 transition hover:text-gold-400"
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>
      <input
        type="range"
        className="player-range w-20"
        min={0}
        max={1}
        step={0.01}
        value={isMuted ? 0 : volume}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Volume"
      />
    </div>
  );
}
