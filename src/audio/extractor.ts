import YtDlpWrap from "yt-dlp-wrap";
import { logger } from "../core/logger";

const ytDlp = new YtDlpWrap();

export async function getAudioUrl(url: string): Promise<string> {
  logger.info(`Getting audio URL from: ${url}`);
  try {
    const urlString = await ytDlp.execPromise([
      url,
      "-f",
      "bestaudio",
      "--get-url",
    ]);
    return urlString.trim();
  } catch (error) {
    logger.error("Error getting audio URL:", error);
    throw error;
  }
}
