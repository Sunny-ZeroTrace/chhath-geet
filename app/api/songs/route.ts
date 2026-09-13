import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AUDIO_BUCKET, COVERS_BUCKET } from "@/lib/music/urls";

const createSongSchema = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
  album: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  duration: z.number().nullable().optional(),
  youtubeId: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  uploader: z.string().nullable().optional(),
  playlistName: z.string().nullable().optional(),
  playlistId: z.string().nullable().optional(),
  playlistIndex: z.number().nullable().optional(),
  uploadDate: z.string().nullable().optional(),
  sourceMetadata: z.unknown().optional(),
  audioPath: z.string().min(1),
  coverPath: z.string().nullable().optional(),
  isPublished: z.boolean().default(true),
  // When true, an existing row with the same youtube_id is overwritten
  // (its old files are left in place — replace is opt-in and explicit).
  replaceExisting: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const parseResult = createSongSchema.safeParse(await request.json());
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid song payload.", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }
  const body = parseResult.data;
  const admin = createAdminClient();

  // Duplicate detection: prefer the source youtube_id when available.
  if (body.youtubeId) {
    const { data: existing } = await admin
      .from("songs")
      .select("id")
      .eq("youtube_id", body.youtubeId)
      .maybeSingle();

    if (existing && !body.replaceExisting) {
      return NextResponse.json(
        { error: "duplicate", existingId: existing.id },
        { status: 409 }
      );
    }

    if (existing && body.replaceExisting) {
      const { error: updateError } = await admin
        .from("songs")
        .update({
          title: body.title,
          artist: body.artist,
          album: body.album,
          description: body.description,
          language: body.language,
          tags: body.tags ?? [],
          duration: body.duration,
          youtube_url: body.youtubeUrl,
          uploader: body.uploader,
          playlist_name: body.playlistName,
          playlist_id: body.playlistId,
          playlist_index: body.playlistIndex,
          upload_date: body.uploadDate,
          source_metadata: body.sourceMetadata,
          audio_path: body.audioPath,
          cover_path: body.coverPath,
          is_published: body.isPublished,
        })
        .eq("id", existing.id);

      if (updateError) {
        await cleanupUploadedFiles(admin, body.audioPath, body.coverPath);
        return NextResponse.json({ error: "Database update failed." }, { status: 500 });
      }

      return NextResponse.json({ ok: true, id: existing.id, replaced: true });
    }
  }

  const { data: inserted, error: insertError } = await admin
    .from("songs")
    .insert({
      title: body.title,
      artist: body.artist,
      album: body.album,
      description: body.description,
      language: body.language,
      tags: body.tags ?? [],
      duration: body.duration,
      youtube_id: body.youtubeId,
      youtube_url: body.youtubeUrl,
      uploader: body.uploader,
      playlist_name: body.playlistName,
      playlist_id: body.playlistId,
      playlist_index: body.playlistIndex,
      upload_date: body.uploadDate,
      source_metadata: body.sourceMetadata as Record<string, unknown> | null,
      audio_path: body.audioPath,
      cover_path: body.coverPath,
      is_published: body.isPublished,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    // Insert failed — clean up the files we just uploaded rather than
    // leaving orphaned Storage objects behind.
    await cleanupUploadedFiles(admin, body.audioPath, body.coverPath);
    return NextResponse.json(
      { error: "Database insert failed. Uploaded files were cleaned up." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: inserted.id });
}

async function cleanupUploadedFiles(
  admin: ReturnType<typeof createAdminClient>,
  audioPath: string,
  coverPath?: string | null
) {
  await admin.storage.from(AUDIO_BUCKET).remove([audioPath]).catch(() => undefined);
  if (coverPath) {
    await admin.storage.from(COVERS_BUCKET).remove([coverPath]).catch(() => undefined);
  }
}
