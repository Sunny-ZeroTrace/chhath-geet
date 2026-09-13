import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Music2 } from "lucide-react";
import { getSongById, getRelatedSongs } from "@/lib/music/queries";
import { formatDuration } from "@/lib/utils/format";
import SongList from "@/components/music/SongList";
import SongDetailPlayButton from "@/components/music/SongDetailPlayButton";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const song = await getSongById(params.id);
  if (!song) return {};

  return {
    title: song.title,
    description: song.description ?? `${song.title} by ${song.artist} — Chhath Geet`,
    openGraph: {
      title: song.title,
      description: song.description ?? `${song.title} by ${song.artist}`,
      images: song.coverUrl ? [song.coverUrl] : undefined,
    },
  };
}

export default async function SongDetailPage({ params }: PageProps) {
  const song = await getSongById(params.id);
  if (!song) notFound();

  const relatedSongs = await getRelatedSongs(song);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="h-56 w-56 shrink-0 overflow-hidden rounded-2xl bg-ghat-800 shadow-lg shadow-black/30 ring-1 ring-gold-500/20">
          {song.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={song.coverUrl}
              alt={`${song.title} cover`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music2 className="h-16 w-16 text-gold-500/40" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
          <h1 className="font-devanagari text-3xl font-semibold text-cream">
            {song.title}
          </h1>
          <p className="text-lg text-cream/70">{song.artist}</p>

          <SongDetailPlayButton song={song} queue={relatedSongs.length ? [song, ...relatedSongs] : [song]} />

          <dl className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-cream/60 sm:justify-start">
            {song.duration != null && (
              <div className="flex gap-1">
                <dt className="font-medium">Duration:</dt>
                <dd>{formatDuration(song.duration)}</dd>
              </div>
            )}
            {song.language && (
              <div className="flex gap-1">
                <dt className="font-medium">Language:</dt>
                <dd className="uppercase">{song.language}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {song.description && (
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-cream/70">
          {song.description}
        </p>
      )}

      {song.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {song.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gold-500/20 px-3 py-1 text-xs text-cream/60"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {relatedSongs.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-2xl text-cream">More Chhath Geet</h2>
          <SongList songs={relatedSongs} />
        </section>
      )}
    </div>
  );
}
