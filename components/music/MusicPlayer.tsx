"use client";

import { useEffect } from "react";
import { Pause, Play, SkipBack, SkipForward, Music2 } from "lucide-react";
import { usePlayer } from "@/lib/music/player";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
}

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleMute,
  } = usePlayer();

  // Space = play/pause, Left/Right = seek — but never while typing in search.
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (isTypingInField(event.target) || !currentSong) return;

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.code === "ArrowLeft") {
        seekTo(Math.max(0, currentTime - 5));
      } else if (event.code === "ArrowRight") {
        seekTo(Math.min(duration, currentTime + 5));
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [currentSong, currentTime, duration, togglePlay, seekTo]);

  if (!currentSong) return null;

  return (
    <div
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-gold-500/20 bg-ghat-900/95 backdrop-blur-md"
      role="region"
      aria-label="Music player"
    >
      {/* Mobile layout */}
      <div className="flex flex-col gap-2 px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <CoverThumb song={currentSong} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-devanagari text-sm font-semibold text-cream">
              {currentSong.title}
            </p>
            <p className="truncate text-xs text-cream/60">{currentSong.artist}</p>
          </div>
        </div>
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={seekTo}
          compact
        />
        <div className="flex items-center justify-center gap-8">
          <button aria-label="Previous" onClick={playPrevious} className="text-cream/80">
            <SkipBack className="h-6 w-6" />
          </button>
          <button
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={togglePlay}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-ghat-900"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>
          <button aria-label="Next" onClick={playNext} className="text-cream/80">
            <SkipForward className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="mx-auto hidden max-w-6xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 px-6 py-3 md:grid">
        <div className="flex min-w-0 items-center gap-3">
          <CoverThumb song={currentSong} />
          <div className="min-w-0">
            <p className="truncate font-devanagari text-sm font-semibold text-cream">
              {currentSong.title}
            </p>
            <p className="truncate text-xs text-cream/60">{currentSong.artist}</p>
          </div>
        </div>

        <div className="flex w-full max-w-xl flex-col items-center gap-1.5">
          <div className="flex items-center gap-6">
            <button aria-label="Previous" onClick={playPrevious} className="text-cream/70 transition hover:text-gold-400">
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-ghat-900 transition hover:bg-gold-400"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </button>
            <button aria-label="Next" onClick={playNext} className="text-cream/70 transition hover:text-gold-400">
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={seekTo} />
        </div>

        <div className="flex justify-end">
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onChange={setVolume}
            onToggleMute={toggleMute}
          />
        </div>
      </div>
    </div>
  );
}

function CoverThumb({ song }: { song: { coverUrl: string | null; title: string } }) {
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-ghat-800 ring-1 ring-gold-500/20">
      {song.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={song.coverUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Music2 className="h-5 w-5 text-gold-500/60" />
        </div>
      )}
    </div>
  );
}
