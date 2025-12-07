CREATE TABLE playlist_songs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES user_playlists(user_id) ON DELETE CASCADE,
    guild_id TEXT REFERENCES guild_anthems(guild_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    added_by TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    added_at INTEGER NOT NULL,
    CONSTRAINT chk_user_or_guild_id CHECK (
        (user_id IS NOT NULL AND guild_id IS NULL) OR
        (user_id IS NULL AND guild_id IS NOT NULL)
    )
);
