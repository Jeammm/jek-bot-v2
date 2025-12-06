import { search } from "yt-search";
import { logger } from "../core/logger";
import { Song } from "../types";

export async function searchYouTube(query: string): Promise<Song[]> {
  logger.info(`Searching YouTube for: ${query}`);

  try {
    const { videos } = await search(query);

    if (!videos || videos.length === 0) return [];

    return videos.slice(0, 5).map(
      (video: any): Song => ({
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        duration: {
          seconds: video.duration.seconds,
          timestamp: video.duration.timestamp,
        },
      })
    );
  } catch (err) {
    logger.error("YouTube search failed:", err);
    return [];
  }
}
