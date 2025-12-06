import { spawn } from "child_process";
import { logger } from "../core/logger";

export function createOpusStream(url: string) {
  const ffmpeg = spawn("ffmpeg", [
    "-reconnect",
    "1",
    "-reconnect_streamed",
    "1",
    "-reconnect_delay_max",
    "5",
    "-i",
    url,
    "-loglevel",
    "quiet",
    "-ac",
    "2",
    "-f",
    "opus",
    "-ar",
    "48000",
    "pipe:1",
  ]);

  ffmpeg.stderr?.on("data", (data) => {
    logger.error("FFmpeg error:", data.toString());
  });

  return { stream: ffmpeg.stdout, process: ffmpeg };
}
