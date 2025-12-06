import ytdl from "ytdl-core";
import { search } from "yt-search";
import { logger } from "../core/logger";
import { Song } from "../types";

export async function getRelatedVideos(url: string): Promise<Song[]> {
  logger.info(`Getting related videos for: ${url}`);

  try {
    const videoInfo = await ytdl.getInfo(url);
    const { videos } = await search(videoInfo.videoDetails.title);

    if (!videos || videos.length === 0) {
      logger.warn("No related videos found");
      return [];
    }

    const songs: Song[] = videos
      .filter((video) => video.url !== url)
      .slice(0, 5)
      .map((video) => ({
        title: video.title,
        thumbnail: video.thumbnail,
        url: video.url,
        duration: {
          seconds: video.duration.seconds,
          timestamp: video.duration.timestamp,
        },
      }));

    return songs;
  } catch (error) {
    logger.error("Error loading related videos:", error);
    return [];
  }
}
