"use client";

import { useCallback, useEffect, useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import SongList, { SongListSkeleton } from "@/components/music/SongList";
import type { Song } from "@/types/song";

export default function SearchPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSongs(data.songs ?? []);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    runSearch("");
  }, [runSearch]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 font-display text-3xl text-cream">Search</h1>
      <div className="mb-8 max-w-xl">
        <SearchBar onSearch={runSearch} />
      </div>

      {isLoading && !hasSearched ? (
        <SongListSkeleton />
      ) : (
        <SongList songs={songs} />
      )}
    </div>
  );
}
