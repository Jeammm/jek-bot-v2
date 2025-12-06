import YtDlpWrap from "yt-dlp-wrap";
import { logger } from "../core/logger";
import { Song } from "../types";

const ytDlpWrap = new YtDlpWrap();

function formatDuration(seconds: number): string {
  if (!seconds) {
    return "00:00";
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function searchYouTube(query: string): Promise<Song[]> {
  logger.info(`Searching YouTube for: ${query}`);

  try {
    // USE execPromise() instead of exec()
    const stdout = await ytDlpWrap.execPromise([
      `ytsearch5:${query}`,
      "--dump-single-json",
      "--no-playlist",
      "--no-warnings",
      "--no-progress",
      "--force-ipv4",
      "--socket-timeout",
      "10",
      "--retries",
      "3",
      "--extractor-args",
      "youtube:player_client=android",
    ]);

    const data = JSON.parse(stdout);

    if (!data?.entries) return [];

    return data.entries.map(
      (entry: any): Song => ({
        title: entry.title,
        url: entry.webpage_url,
        thumbnail: entry.thumbnail,
        duration: {
          seconds: entry.duration,
          timestamp: formatDuration(entry.duration),
        },
      })
    );
  } catch (err) {
    logger.error("YouTube search failed:", err);
    return [];
  }
}
