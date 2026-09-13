# Chhath Geet

A peaceful, premium digital home for Chhath Geet — browse, search, and
listen to traditional Chhath songs, with a bulk-upload admin pipeline that
turns a folder of `.mp3` + `.info.json` + cover images into published songs
automatically.

Built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase
(Postgres + Auth + Storage).

> **Looking for the full non-technical setup walkthrough?** Use the separate
> `chhath-geet-setup-guide` package — it has a numbered, step-by-step guide
> written for someone who has never used Supabase, Git, or Next.js before.
> This README is the shorter, developer-facing version.

## Quick start

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open
**SQL Editor** and run `supabase/migrations/001_initial.sql`. This creates
the `songs` and `site_settings` tables, all indexes, Row Level Security
policies, and the `audio`/`covers` Storage buckets with their policies.

Optionally run `supabase/seed.sql` afterwards to insert a few fictional
sample rows for testing the UI (no real audio is included).

### 2. Create an admin account

In the Supabase dashboard: **Authentication → Users → Add user**. Every
authenticated user in this project is treated as an admin — only create
accounts for people who should be able to publish/delete songs.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the three Supabase values from **Project Settings → API**:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API → anon/public key |
| `SUPABASE_SECRET_KEY` | Project Settings → API → service_role key (**server-only, never commit**) |

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site and
[http://localhost:3000/admin/login](http://localhost:3000/admin/login) to
sign in and upload music.

### 5. Run tests

```bash
npm test
```

## Project structure

```
app/                  Routes (App Router)
  admin/(dashboard)/  Authenticated admin pages: dashboard, songs, upload, settings
  admin/login/        Public login page
  api/                Route handlers (songs CRUD, search, settings)
  songs/[id]/         Public song detail page
  search/             Public search page
components/
  music/              Player, song cards/lists, progress/volume controls
  admin/              Uploader UI: dropzone, metadata preview, upload queue
  layout/             Header, footer, background media
lib/
  supabase/           Browser, server, and admin (service-role) clients
  metadata/           Parser, title normalization, artist extraction
  music/              Player state, Storage URL helpers, data queries
supabase/
  migrations/         001_initial.sql — full schema, RLS, storage policies
  seed.sql            Fictional sample data
tests/                Vitest unit tests
```

## How the bulk uploader works

1. Admin drags in a folder containing `NNN - Title.mp3` / `.info.json` / `.jpg` triples.
2. `lib/metadata/parser.ts` groups files by shared filename prefix — the JSON
   and image are never treated as separate songs.
3. `.info.json` is parsed defensively (every field optional) and run through
   conservative title normalization and artist extraction — when uncertain,
   the original title is kept rather than risking a bad guess.
4. The admin reviews/edits each song in a preview card before publishing.
5. On "Publish All", audio uploads via Supabase's resumable (TUS) endpoint
   directly from the browser; the cover uploads via a normal Storage call;
   then a server route inserts the database row. If the insert fails, the
   just-uploaded files are deleted so nothing is orphaned.
6. Duplicate imports are detected by `youtube_id` (a unique constraint in
   Postgres) and default to **Skip**, with an explicit **Replace** option.

## Security notes

- `SUPABASE_SECRET_KEY` is imported only through `lib/supabase/admin.ts`,
  which uses the `server-only` package — any accidental import from client
  code fails the build.
- Row Level Security is enabled on every exposed table. Public/anon reads
  are restricted to `is_published = true`; all writes require an
  authenticated session (`lib/supabase/server.ts` / Next.js middleware).
- Storage buckets are public-read (needed for playback) but writes require
  authentication — see the policies at the bottom of
  `supabase/migrations/001_initial.sql`.

## Deploying

See the setup guide package's `06-DEPLOYMENT/vercel-deployment.md`, or in
short: push this repo to GitHub, import it in Vercel, add the same three
environment variables in Vercel's project settings, and deploy.
