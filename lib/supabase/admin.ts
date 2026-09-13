import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client. Bypasses Row Level Security entirely.
 *
 * SECURITY: this file imports "server-only" so any accidental import from a
 * "use client" component or the browser bundle fails the build instead of
 * silently leaking the secret key. Only use this inside:
 *   - Route Handlers under app/api/**
 *   - Server Actions
 * that have already verified the caller is an authenticated admin via
 * lib/supabase/server.ts.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. This must only be configured on the server (Vercel/host env vars), never in NEXT_PUBLIC_* or committed to git."
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
