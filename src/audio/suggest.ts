import YtDlpWrap from "yt-dlp-wrap";
import { logger } from "../core/logger";
import { Song } from "./search";

const ytDlp = new YtDlpWrap();

export async function getRelatedVideos(url: string): Promise<Song[]> {
  logger.info(`Getting related videos for: ${url}`);

  try {
    const stdout = await ytDlp.execPromise([
      "--dump-single-json",
      "--no-warnings",
      "--quiet",
      "--no-progress",
      url,
    ]);

    const data = JSON.parse(stdout);

    const related = data.related_videos ?? [];
    if (!Array.isArray(related) || related.length === 0) {
      logger.warn("No related videos found");
      return [];
    }

    const songs: Song[] = related.slice(0, 5).map((entry: any) => ({
      title: entry.title,
      thumbnail: entry.thumbnails?.[0]?.url,
      url: `https://www.youtube.com/watch?v=${entry.id}`,
    }));

    return songs;
  } catch (error) {
    logger.error("Error loading related videos:", error);
    return [];
  }
}
