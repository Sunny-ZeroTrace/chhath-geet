"use client";

import { useMemo, useState } from "react";
import { Music2, Trash2 } from "lucide-react";
import type { Song } from "@/types/song";
import { formatDuration } from "@/lib/utils/format";

interface SongWithStatus extends Song {
  isPublished: boolean;
}

type FilterMode = "all" | "published" | "draft";

export default function SongsTable({ initialSongs }: { initialSongs: Song[] }) {
  const [songs, setSongs] = useState<SongWithStatus[]>(
    initialSongs as SongWithStatus[]
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      if (filter === "published" && !song.isPublished) return false;
      if (filter === "draft" && song.isPublished) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q)
      );
    });
  }, [songs, query, filter]);

  async function togglePublish(song: SongWithStatus) {
    setBusyId(song.id);
    try {
      const res = await fetch(`/api/songs/${song.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !song.isPublished }),
      });
      if (res.ok) {
        setSongs((prev) =>
          prev.map((s) =>
            s.id === song.id ? { ...s, isPublished: !s.isPublished } : s
          )
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setBusyId(null);
      setPendingDeleteId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search by title or artist…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gold-500/20 bg-ghat-800/60 px-4 py-2 text-sm text-cream focus:border-gold-500/60 focus:outline-none sm:w-64"
        />
        <div className="flex gap-2">
          {(["all", "published", "draft"] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={
                filter === mode
                  ? "rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-ghat-900"
                  : "rounded-full border border-gold-500/20 px-3 py-1 text-xs text-cream/60"
              }
            >
              {mode[0].toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gold-500/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ghat-800/60 text-xs uppercase tracking-wide text-cream/50">
            <tr>
              <th className="px-4 py-3">Cover</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Artist</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-500/10">
            {filteredSongs.map((song) => (
              <tr key={song.id} className="bg-ghat-800/20">
                <td className="px-4 py-3">
                  <div className="h-10 w-10 overflow-hidden rounded-md bg-ghat-700">
                    {song.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={song.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Music2 className="h-4 w-4 text-gold-500/40" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 font-devanagari text-cream">
                  {song.title}
                </td>
                <td className="max-w-[160px] truncate px-4 py-3 text-cream/70">
                  {song.artist}
                </td>
                <td className="px-4 py-3 text-cream/60">{formatDuration(song.duration)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => togglePublish(song)}
                    disabled={busyId === song.id}
                    className={
                      song.isPublished
                        ? "rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-400"
                        : "rounded-full bg-gold-500/15 px-3 py-1 text-xs text-gold-400"
                    }
                  >
                    {song.isPublished ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-3 text-cream/50">
                  {new Date(song.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setPendingDeleteId(song.id)}
                    disabled={busyId === song.id}
                    aria-label={`Delete ${song.title}`}
                    className="text-cream/50 transition hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredSongs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-cream/50">
                  No songs match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gold-500/20 bg-ghat-800 p-6">
            <h3 className="font-display text-lg text-cream">Delete this song?</h3>
            <p className="mt-2 text-sm text-cream/60">
              This will remove:
            </p>
            <ul className="mt-1 list-inside list-disc text-sm text-cream/60">
              <li>Database record</li>
              <li>Audio file</li>
              <li>Cover image</li>
            </ul>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="rounded-lg px-4 py-2 text-sm text-cream/70 hover:bg-ghat-700"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(pendingDeleteId)}
                className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
