import { Pool, QueryResult, QueryResultRow } from "pg";
import { logger } from "../logger";
import { Song, PlaylistSong } from "../../types";
import { v4 as uuidv4 } from "uuid";
import {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE,
} from "../env";

export const pool = new Pool({
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE,
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 3000,
});

pool.on("error", (err) => {
  logger.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  logger.info("executed query", { text, duration, rows: res.rowCount });
  return res;
};

export const getClient = async () => {
  const client = await pool.connect();
  const { query, release } = client;
  // set a timeout of 5 seconds, after which we will log this client's query
  const timeout = setTimeout(() => {
    logger.error("A client has been checked out for more than 5 seconds!");
    logger.error(`The last executed query on this client was: ${client.query}`);
  }, 5000);
  client.query = ((...args: Parameters<typeof query>) =>
    query.apply(client, args)) as typeof client.query;
  client.release = () => {
    clearTimeout(timeout);
    // set the original name back, for error reporting
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  return client;
};

export const ensureUserPlaylist = async (userId: string) => {
  const now = Date.now();
  await query(
    `
    INSERT INTO user_playlists (user_id, created_at)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO NOTHING;
  `,
    [userId, now]
  );
};

export const ensureGuildAnthem = async (guildId: string) => {
  const now = Date.now();
  await query(
    `
    INSERT INTO guild_anthems (guild_id, created_at)
    VALUES ($1, $2)
    ON CONFLICT (guild_id) DO NOTHING;
  `,
    [guildId, now]
  );
};

export const saveSongToUserPlaylist = async (
  userId: string,
  song: Song,
  addedBy: string
) => {
  const now = Date.now();
  const id = uuidv4();
  await query(
    `
    INSERT INTO playlist_songs (id, user_id, title, url, added_by, order_index, added_at, seconds, ts)
    VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(order_index), -1) + 1 FROM playlist_songs WHERE user_id = $2), $6, $7, $8);
  `,
    [
      id,
      userId,
      song.title,
      song.url,
      addedBy,
      now,
      song.duration.seconds,
      song.duration.timestamp,
    ]
  );
};

export const saveSongToGuildAnthem = async (
  guildId: string,
  song: Song,
  addedBy: string
) => {
  const now = Date.now();
  const id = uuidv4();
  await query(
    `
    INSERT INTO playlist_songs (id, guild_id, title, url, added_by, order_index, added_at, seconds, ts)
    VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(order_index), -1) + 1 FROM playlist_songs WHERE guild_id = $2), $6, $7, $8);
  `,
    [
      id,
      guildId,
      song.title,
      song.url,
      addedBy,
      now,
      song.duration.seconds,
      song.duration.timestamp,
    ]
  );
};

export const getUserPlaylistSongs = async (
  userId: string
): Promise<PlaylistSong[]> => {
  const res = await query<PlaylistSong>(
    `
    SELECT id, user_id, guild_id, title, url, added_by, order_index, added_at, seconds, ts
    FROM playlist_songs
    WHERE user_id = $1
    ORDER BY order_index ASC;
  `,
    [userId]
  );
  return res.rows;
};

export const removeSongFromUserPlaylist = async (
  userId: string,
  orderIndex: number
): Promise<PlaylistSong | null> => {
  // Get the song to be removed
  const songToRemoveRes = await query<PlaylistSong>(
    `
    SELECT id, user_id, guild_id, title, url, added_by, order_index, added_at, seconds, ts
    FROM playlist_songs
    WHERE user_id = $1 AND order_index = $2;
  `,
    [userId, orderIndex]
  );

  if (songToRemoveRes.rows.length === 0) {
    return null; // Song not found
  }

  const removedSong = songToRemoveRes.rows[0];

  // Remove the song
  await query(
    `
    DELETE FROM playlist_songs
    WHERE id = $1;
  `,
    [removedSong.id]
  );

  // Reorder the remaining songs
  await query(
    `
    UPDATE playlist_songs
    SET order_index = order_index - 1
    WHERE user_id = $1 AND order_index > $2;
  `,
    [userId, orderIndex]
  );

  return removedSong;
};

export const getGuildAnthemSongs = async (
  guildId: string
): Promise<PlaylistSong[]> => {
  const res = await query<PlaylistSong>(
    `
    SELECT id, user_id, guild_id, title, url, added_by, order_index, added_at, seconds, ts
    FROM playlist_songs
    WHERE guild_id = $1
    ORDER BY order_index ASC;
  `,
    [guildId]
  );
  return res.rows;
};

export const removeSongFromGuildAnthem = async (
  guildId: string,
  orderIndex: number
): Promise<PlaylistSong | null> => {
  // Get the song to be removed
  const songToRemoveRes = await query<PlaylistSong>(
    `
    SELECT id, user_id, guild_id, title, url, added_by, order_index, added_at, seconds, ts
    FROM playlist_songs
    WHERE guild_id = $1 AND order_index = $2;
  `,
    [guildId, orderIndex]
  );

  if (songToRemoveRes.rows.length === 0) {
    return null; // Song not found
  }

  const removedSong = songToRemoveRes.rows[0];

  // Remove the song
  await query(
    `
    DELETE FROM playlist_songs
    WHERE id = $1;
  `,
    [removedSong.id]
  );

  // Reorder the remaining songs
  await query(
    `
    UPDATE playlist_songs
    SET order_index = order_index - 1
    WHERE guild_id = $1 AND order_index > $2;
  `,
    [guildId, orderIndex]
  );

  return removedSong;
};

export const initializeDatabase = async () => {
  try {
    await query("SELECT NOW()");
    logger.info("Database connected successfully.");
  } catch (error) {
    logger.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};
