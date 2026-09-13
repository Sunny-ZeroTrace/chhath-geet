-- ============================================================================
-- Sample data for local testing. Fictional entries only — no copyrighted
-- audio is included or referenced. audio_path/cover_path point at objects
-- that do NOT exist by default; upload placeholder files with matching
-- names to the "audio"/"covers" buckets if you want playback to work, or
-- just use this to test the UI's empty/loading states and admin dashboard.
-- ============================================================================

insert into public.songs
  (title, artist, album, description, audio_path, cover_path, language,
   duration, tags, is_published, playlist_name, playlist_index)
values
  ('अरघ के बेर (नमूना)', 'ANURADHA PAUDWAL (Sample)', 'Chhath Sangrah',
   'Sample entry for local UI testing only.',
   'sample/aragh-ke-ber.mp3', 'sample/aragh-ke-ber.jpg', 'hi',
   370, array['chhath','arag','sample'], true, 'Chhath Geet Sangrah', 1),

  ('छठी मईया के गीत (नमूना)', 'SHARDA SINHA (Sample)', 'Chhath Sangrah',
   'Sample entry for local UI testing only.',
   'sample/chhathi-maiya.mp3', 'sample/chhathi-maiya.jpg', 'bho',
   295, array['chhath','maiya','sample'], true, 'Chhath Geet Sangrah', 2),

  ('उगा हो सूरज देव (नमूना, अप्रकाशित)', 'Unknown Artist', null,
   'Draft sample — intentionally unpublished to demonstrate admin drafts.',
   'sample/uga-ho-suraj-dev.mp3', null, 'hi',
   410, array['chhath','draft'], false, null, null)
on conflict (youtube_id) do nothing;
