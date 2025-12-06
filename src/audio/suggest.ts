import YtDlpWrap from 'yt-dlp-wrap';
import { logger } from '../core/logger';
import { Song } from '../types';

const ytDlp = new YtDlpWrap();

export async function getRelatedVideos(url: string): Promise<Song[]> {
  logger.info(`Getting related videos for: ${url}`);

  try {
    const stdout = await ytDlp.execPromise([
      url,
      '--dump-single-json',
      '--no-playlist',
    ]);

    const data = JSON.parse(stdout);

    const related = data.related ?? data.related_videos ?? [];
    if (!Array.isArray(related) || related.length === 0) {
      logger.warn('No related videos found');
      return [];
    }

    const songs: Song[] = related.slice(0, 5).map((entry: any) => ({
      title: entry.title,
      thumbnail: entry.thumbnail,
      url: `https://www.youtube.com/watch?v=${entry.id}`,
      duration: { seconds: '0', timestamp: '00:00' }, // Duration is not available here
    }));

    return songs;
  } catch (error) {
    logger.error('Error loading related videos:', error);
    return [];
  }
}