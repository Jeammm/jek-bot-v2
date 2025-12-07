-- user_playlists.created_at → bigint
ALTER TABLE user_playlists
  ALTER COLUMN created_at TYPE bigint
  USING created_at::bigint;

-- guild_anthems.created_at → bigint
ALTER TABLE guild_anthems
  ALTER COLUMN created_at TYPE bigint
  USING created_at::bigint;

-- playlist_songs.added_at → bigint
ALTER TABLE playlist_songs
  ALTER COLUMN added_at TYPE bigint
  USING added_at::bigint;
