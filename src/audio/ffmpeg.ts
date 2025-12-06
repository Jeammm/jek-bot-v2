import { spawn } from "child_process";
import { Readable } from "stream";
import { logger } from "../core/logger";

export function createPcmStream(url: string): Readable {
  logger.info("Creating PCM stream with FFmpeg from URL.");
  const ffmpegProcess = spawn(
    "ffmpeg",
    [
      "-reconnect",
      "1",
      "-reconnect_streamed",
      "1",
      "-reconnect_delay_max",
      "5",
      "-i",
      url,
      "-loglevel",
      "error",
      "-f",
      "s16le",
      "-ar",
      "48000",
      "-ac",
      "2",
      "pipe:1",
    ],
    { stdio: ["pipe", "pipe", "pipe"] }
  );

  ffmpegProcess.stderr.on("data", (data) => {
    logger.error(`FFmpeg stderr: ${data}`);
  });

  ffmpegProcess.on("error", (error) => {
    logger.error("FFmpeg process error:", error);
    ffmpegProcess.kill();
  });

  if (!ffmpegProcess.stdout) {
    throw new Error("FFmpeg stdout is null.");
  }

  return ffmpegProcess.stdout;
}
