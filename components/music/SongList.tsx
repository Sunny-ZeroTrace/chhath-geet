import type { Song } from "@/types/song";
import SongCard from "./SongCard";

interface SongListProps {
  songs: Song[];
  emptyTitle?: string;
  emptyHint?: string;
}

export default function SongList({
  songs,
  emptyTitle = "No songs found.",
  emptyHint = "Try another song name or artist.",
}: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-gold-500/20 py-16 text-center">
        <p className="font-display text-lg text-cream">{emptyTitle}</p>
        <p className="text-sm text-cream/60">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} queue={songs} />
      ))}
    </div>
  );
}

export function SongListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gold-500/10 bg-ghat-800/60">
          <div className="aspect-square w-full bg-ghat-700/80" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 rounded bg-ghat-700/80" />
            <div className="h-2.5 w-1/2 rounded bg-ghat-700/80" />
          </div>
        </div>
      ))}
    </div>
  );
}
