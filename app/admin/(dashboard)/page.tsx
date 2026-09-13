import Link from "next/link";
import { Music2 } from "lucide-react";
import { getAdminDashboardStats, getAdminRecentSongs } from "@/lib/music/adminQueries";

export default async function AdminDashboardPage() {
  const [stats, recentSongs] = await Promise.all([
    getAdminDashboardStats(),
    getAdminRecentSongs(),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-cream">Dashboard</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Songs" value={stats.totalSongs} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Drafts" value={stats.drafts} />
        <StatCard label="Uploads" value={stats.totalSongs} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-cream">Recent Songs</h2>
        <Link href="/admin/songs" className="text-sm text-gold-400 hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-4 divide-y divide-gold-500/10 rounded-xl border border-gold-500/10 bg-ghat-800/40">
        {recentSongs.length === 0 && (
          <p className="p-6 text-sm text-cream/60">
            No songs yet. Go to Upload Music to add your first batch.
          </p>
        )}
        {recentSongs.map((song) => (
          <div key={song.id} className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-ghat-700">
              {song.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={song.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music2 className="h-5 w-5 text-gold-500/40" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-devanagari text-sm font-semibold text-cream">
                {song.title}
              </p>
              <p className="truncate text-xs text-cream/60">{song.artist}</p>
            </div>
            <span
              className={
                song.isPublished
                  ? "shrink-0 rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-400"
                  : "shrink-0 rounded-full bg-gold-500/15 px-3 py-1 text-xs text-gold-400"
              }
            >
              {song.isPublished ? "Published" : "Draft"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gold-500/10 bg-ghat-800/40 p-5">
      <p className="text-2xl font-semibold text-cream">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-cream/50">{label}</p>
    </div>
  );
}
