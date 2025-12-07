ALTER TABLE playlist_songs
  DROP COLUMN duration,
  ADD COLUMN seconds BIGINT,
  ADD COLUMN ts BIGINT;