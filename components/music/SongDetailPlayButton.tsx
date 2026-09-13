"use client";

import { Play } from "lucide-react";
import { usePlayer } from "@/lib/music/player";
import type { Song } from "@/types/song";

export default function SongDetailPlayButton({
  song,
  queue,
}: {
  song: Song;
  queue: Song[];
}) {
  const { playSong } = usePlayer();

  return (
    <button
      type="button"
      onClick={() => playSong(song, queue)}
      className="flex items-center gap-2 rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ghat-900 transition hover:bg-gold-400"
    >
      <Play className="h-4 w-4" />
      Play
    </button>
  );
}
