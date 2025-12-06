import YtDlpWrap from "yt-dlp-wrap";
import { logger } from "../core/logger";

const ytDlp = new YtDlpWrap();

export async function extractAudio(url: string) {
  logger.info(`Extracting audio from: ${url}`);

  try {
    const stream = ytDlp.execStream([
      "-f",
      "bestaudio",
      "--no-playlist",
      "--no-progress",
      "--quiet",
      "--no-warnings",
      "-o",
      "-",
      url,
    ]);

    // stream is already Readable
    stream.on("error", (err) => {
      logger.error("yt-dlp stream error:", err);
    });

    return stream; // <- THIS IS THE AUDIO STREAM
  } catch (error) {
    logger.error("Error extracting audio:", error);
    throw error;
  }
}
