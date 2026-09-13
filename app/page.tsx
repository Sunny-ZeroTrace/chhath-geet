import Link from "next/link";
import { getPublishedSongs, getRecentlyAddedSongs } from "@/lib/music/queries";
import SongList from "@/components/music/SongList";

export default async function HomePage() {
  const [allSongs, recentSongs] = await Promise.all([
    getPublishedSongs(),
    getRecentlyAddedSongs(10),
  ]);

  const featuredSongs = allSongs.slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-12 text-center animate-fade-in">
        <h1 className="font-display text-5xl tracking-wide text-cream sm:text-6xl">
          CHHATH GEET
        </h1>
        <p className="max-w-xl text-balance font-devanagari text-lg text-cream/80 sm:text-xl">
          Songs of faith. Songs of the river. Songs of Chhath.
        </p>
        <Link
          href="/search"
          className="mt-2 rounded-full bg-gold-500 px-8 py-3 text-sm font-semibold uppercase tracking-widest text-ghat-900 transition hover:bg-gold-400"
        >
          Explore Songs
        </Link>
      </section>

      {/* Featured */}
      <section className="mt-16">
        <SectionHeading title="Featured Songs" />
        <SongList
          songs={featuredSongs}
          emptyTitle="No songs published yet."
          emptyHint="Once the administrator uploads and publishes songs, they'll appear here."
        />
      </section>

      {/* Recently added */}
      {recentSongs.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Recently Added" />
          <SongList songs={recentSongs} />
        </section>
      )}

      {/* All songs */}
      <section className="mt-16">
        <SectionHeading title="All Songs" />
        <SongList songs={allSongs} />
      </section>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="mb-5 font-display text-2xl tracking-wide text-cream">
      {title}
    </h2>
  );
}
