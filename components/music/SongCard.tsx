"use client";

import { Music2, Play } from "lucide-react";
import type { Song } from "@/types/song";
import { usePlayer } from "@/lib/music/player";
import Link from "next/link";

interface SongCardProps {
  song: Song;
  queue: Song[];
}

export default function SongCard({ song, queue }: SongCardProps) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isCurrent = currentSong?.id === song.id;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gold-500/10 bg-ghat-800/60 transition hover:border-gold-500/30 hover:bg-ghat-800/90">
      <Link href={`/songs/${song.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-ghat-700">
          {song.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={song.coverUrl}
              alt={`${song.title} cover`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music2 className="h-10 w-10 text-gold-500/40" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 p-3">
        <Link href={`/songs/${song.id}`} className="min-w-0">
          <p className="truncate font-devanagari text-sm font-semibold text-cream">
            {song.title}
          </p>
          <p className="truncate text-xs text-cream/60">{song.artist}</p>
        </Link>
        <button
          type="button"
          aria-label={`Play ${song.title}`}
          onClick={() => playSong(song, queue)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500/90 text-ghat-900 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Play className="ml-0.5 h-4 w-4" />
        </button>
      </div>

      {isCurrent && isPlaying && (
        <span className="absolute right-3 top-3 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-semibold text-ghat-900">
          Playing
        </span>
      )}
    </div>
  );
}
