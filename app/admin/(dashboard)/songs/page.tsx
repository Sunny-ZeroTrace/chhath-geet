import { getAllSongsForAdmin } from "@/lib/music/adminQueries";
import SongsTable from "./SongsTable";

export default async function AdminSongsPage() {
  const songs = await getAllSongsForAdmin();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-cream">Songs</h1>
      <SongsTable initialSongs={songs} />
    </div>
  );
}
