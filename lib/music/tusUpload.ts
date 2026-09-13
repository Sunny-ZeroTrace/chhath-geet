"use client";

import * as tus from "tus-js-client";
import { createClient } from "@/lib/supabase/client";

interface ResumableUploadOptions {
  bucket: string;
  path: string;
  file: File;
  onProgress?: (percent: number) => void;
}

/**
 * Uploads directly from the browser to Supabase Storage's TUS-resumable
 * endpoint. Supabase recommends resumable uploads for larger files and
 * unreliable connections — this is what the bulk uploader uses for every
 * audio file, since a Chhath Geet library can easily include tracks well
 * over 6 MB.
 *
 * Storage RLS policies (see supabase/migrations/001_initial.sql) require an
 * authenticated session for writes, so we attach the current user's access
 * token rather than any admin/service-role credential — this code runs in
 * the browser and must never see the service-role key.
 */
export async function uploadFileResumable({
  bucket,
  path,
  file,
  onProgress,
}: ResumableUploadOptions): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("You must be logged in to upload files.");
  }

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${projectUrl}/storage/v1/upload/resumable`,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
        "x-upsert": "false",
      },
      chunkSize: 6 * 1024 * 1024, // Supabase's recommended chunk size
      metadata: {
        bucketName: bucket,
        objectName: path,
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
      },
      onError: (error) => reject(error),
      onProgress: (bytesSent, bytesTotal) => {
        onProgress?.(Math.round((bytesSent / bytesTotal) * 100));
      },
      onSuccess: () => resolve(),
    });

    // Resume a previous attempt for this exact file if one exists, instead
    // of starting over from zero after a network interruption.
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length > 0) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    });
  });
}
