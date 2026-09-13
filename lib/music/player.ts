"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Song } from "@/types/song";

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
}

interface PlayerContextValue extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const initialState: PlayerState = {
  currentSong: null,
  queue: [],
  currentIndex: -1,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  isPlaying: false,
};

/**
 * Hook that owns exactly one <audio> element for the whole app lifetime, so
 * playback survives client-side navigation and components never re-mount
 * the element on re-render.
 */
export function usePlayerProvider(): PlayerContextValue {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>(initialState);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none"; // never preload every song — only the selected one
    audio.volume = initialState.volume;
    audioRef.current = audio;

    const onTimeUpdate = () =>
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    const onLoadedMetadata = () =>
      setState((s) => ({ ...s, duration: audio.duration || 0 }));
    const onPlay = () => setState((s) => ({ ...s, isPlaying: true }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));
    const onEnded = () => nextRef.current();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playAtIndex = useCallback((queue: Song[], index: number) => {
    const song = queue[index];
    if (!song || !audioRef.current) return;

    audioRef.current.src = song.audioUrl;
    // Autoplay may be blocked until the user has interacted with the page —
    // that's fine, the play() promise simply rejects and the UI just shows
    // a Play button rather than throwing.
    audioRef.current.play().catch(() => undefined);

    setState((s) => ({
      ...s,
      currentSong: song,
      queue,
      currentIndex: index,
      currentTime: 0,
    }));
  }, []);

  const playSong = useCallback(
    (song: Song, queue?: Song[]) => {
      const effectiveQueue = queue && queue.length > 0 ? queue : [song];
      const index = effectiveQueue.findIndex((s) => s.id === song.id);
      playAtIndex(effectiveQueue, index >= 0 ? index : 0);
    },
    [playAtIndex]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }, []);

  const playNext = useCallback(() => {
    setState((s) => {
      if (s.queue.length === 0) return s;
      const nextIndex = (s.currentIndex + 1) % s.queue.length;
      playAtIndex(s.queue, nextIndex);
      return s;
    });
  }, [playAtIndex]);

  // Ref indirection so the "ended" listener (registered once) always calls
  // the latest playNext without re-registering the event listener.
  const nextRef = useRef(playNext);
  useEffect(() => {
    nextRef.current = playNext;
  }, [playNext]);

  const playPrevious = useCallback(() => {
    setState((s) => {
      if (s.queue.length === 0) return s;
      // Restart the current song if more than 3s in, like most players.
      if (audioRef.current && audioRef.current.currentTime > 3) {
        audioRef.current.currentTime = 0;
        return s;
      }
      const prevIndex = (s.currentIndex - 1 + s.queue.length) % s.queue.length;
      playAtIndex(s.queue, prevIndex);
      return s;
    });
  }, [playAtIndex]);

  const seekTo = useCallback((seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.min(1, Math.max(0, volume));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      audioRef.current.muted = false;
    }
    setState((s) => ({ ...s, volume: clamped, isMuted: false }));
  }, []);

  const toggleMute = useCallback(() => {
    setState((s) => {
      const nextMuted = !s.isMuted;
      if (audioRef.current) audioRef.current.muted = nextMuted;
      return { ...s, isMuted: nextMuted };
    });
  }, []);

  return useMemo(
    () => ({
      ...state,
      playSong,
      togglePlay,
      playNext,
      playPrevious,
      seekTo,
      setVolume,
      toggleMute,
    }),
    [state, playSong, togglePlay, playNext, playPrevious, seekTo, setVolume, toggleMute]
  );
}

export { PlayerContext };

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within <PlayerProvider>");
  return ctx;
}
