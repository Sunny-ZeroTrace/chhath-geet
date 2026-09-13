-- ============================================================================
-- Chhath Geet — initial schema migration
-- Safe to run once on a fresh Supabase project via the SQL Editor.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Table: songs
-- ----------------------------------------------------------------------------
create table if not exists public.songs (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  artist            text not null default 'Unknown Artist',
  album             text,
  description       text,

  audio_path        text not null,        -- Storage object path in "audio" bucket
  cover_path        text,                 -- Storage object path in "covers" bucket

  youtube_url       text,
  youtube_id        text,
  uploader          text,
  language          text,

  playlist_name     text,
  playlist_id       text,
  playlist_index    integer,

  duration          integer,              -- seconds
  upload_date       timestamptz,

  tags              text[] not null default '{}',

  view_count        integer not null default 0,
  like_count        integer not null default 0,
  comment_count     integer not null default 0,

  is_published      boolean not null default false,

  -- Full original .info.json payload. Never discarded, even though most of
  -- it isn't surfaced in the UI today.
  source_metadata   jsonb,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Prevent accidental duplicate imports of the same source video.
  constraint songs_youtube_id_unique unique (youtube_id)
);

comment on table public.songs is 'Chhath Geet catalog. Media lives in Storage; this table holds metadata + references.';
comment on column public.songs.source_metadata is 'Raw original .info.json — archival copy, never overwritten destructively.';

create index if not exists songs_title_idx on public.songs using gin (to_tsvector('simple', title));
create index if not exists songs_artist_idx on public.songs (artist);
create index if not exists songs_playlist_index_idx on public.songs (playlist_index);
create index if not exists songs_is_published_idx on public.songs (is_published);
create index if not exists songs_created_at_idx on public.songs (created_at desc);

-- Keep updated_at current on every row change.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists songs_set_updated_at on public.songs;
create trigger songs_set_updated_at
  before update on public.songs
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Table: site_settings (single row, admin-editable site configuration)
-- ----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                integer primary key default 1,
  site_title        text not null default 'Chhath Geet',
  site_description  text not null default 'Traditional Chhath Songs',
  hero_title        text not null default 'CHHATH GEET',
  hero_subtitle     text not null default 'Songs of faith. Songs of tradition. Songs of Chhath.',
  background_url    text,
  updated_at        timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into public.site_settings (id) values (1)
  on conflict (id) do nothing;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.songs enable row level security;
alter table public.site_settings enable row level security;

-- Public/anon + authenticated users may read only published songs.
drop policy if exists "songs_public_read_published" on public.songs;
create policy "songs_public_read_published"
  on public.songs
  for select
  to anon, authenticated
  using (is_published = true);

-- Authenticated admins may read every row (including drafts) for the admin
-- dashboard. This project treats every authenticated Supabase Auth user as
-- an admin — only create accounts for people who should have admin access.
drop policy if exists "songs_admin_read_all" on public.songs;
create policy "songs_admin_read_all"
  on public.songs
  for select
  to authenticated
  using (true);

drop policy if exists "songs_admin_insert" on public.songs;
create policy "songs_admin_insert"
  on public.songs
  for insert
  to authenticated
  with check (true);

drop policy if exists "songs_admin_update" on public.songs;
create policy "songs_admin_update"
  on public.songs
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "songs_admin_delete" on public.songs;
create policy "songs_admin_delete"
  on public.songs
  for delete
  to authenticated
  using (true);

-- site_settings: readable by everyone, writable only by authenticated admins.
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update"
  on public.site_settings
  for update
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- Storage buckets + policies
-- (Also see SQL/storage-policies.sql in the setup guide package — identical
-- statements, duplicated there for convenience.)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- Public read of audio/cover files (buckets are public so playback works
-- without signed URLs). Only authenticated admins may write.
drop policy if exists "audio_public_read" on storage.objects;
create policy "audio_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'audio');

drop policy if exists "audio_admin_write" on storage.objects;
create policy "audio_admin_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'audio');

drop policy if exists "audio_admin_update" on storage.objects;
create policy "audio_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'audio')
  with check (bucket_id = 'audio');

drop policy if exists "audio_admin_delete" on storage.objects;
create policy "audio_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'audio');

drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'covers');

drop policy if exists "covers_admin_write" on storage.objects;
create policy "covers_admin_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'covers');

drop policy if exists "covers_admin_update" on storage.objects;
create policy "covers_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'covers')
  with check (bucket_id = 'covers');

drop policy if exists "covers_admin_delete" on storage.objects;
create policy "covers_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'covers');
