import YtDlpWrap from "yt-dlp-wrap";
import { logger } from "../core/logger";

export interface Song {
  title: string;
  url: string;
  thumbnail?: string;
}

const ytDlpWrap = new YtDlpWrap();

export async function searchYouTube(query: string): Promise<Song[]> {
  logger.info(`Searching YouTube for: ${query}`);

  try {
    // USE execPromise() instead of exec()
    const stdout = await ytDlpWrap.execPromise([
      `ytsearch10:${query}`,
      "--dump-single-json",
      "--no-playlist",
    ]);

    const data = JSON.parse(stdout);

    if (!data?.entries) return [];

    return data.entries.map((entry: any) => ({
      title: entry.title,
      url: `https://www.youtube.com/watch?v=${entry.id}`,
      thumbnail: entry.thumbnails?.[0]?.url,
    }));
  } catch (err) {
    logger.error("YouTube search failed:", err);
    return [];
  }
}
