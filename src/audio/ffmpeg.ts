import { spawn } from "child_process";
import { Readable } from "stream";
import { logger } from "../core/logger";

export function createPcmStream(input: Readable): Readable {
  logger.info("Creating PCM stream with FFmpeg.");
  const ffmpegProcess = spawn(
    "ffmpeg",
    [
      "-i",
      "pipe:0",
      "-analyzeduration",
      "0",
      "-loglevel",
      "0",
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

  input.pipe(ffmpegProcess.stdin);

  ffmpegProcess.stderr.on("data", (data) => {
    logger.error(`FFmpeg stderr: ${data}`);
  });

  ffmpegProcess.on("error", (error) => {
    logger.error("FFmpeg process error:", error);
    input.unpipe(ffmpegProcess.stdin);
    ffmpegProcess.kill();
  });

  if (!ffmpegProcess.stdout) {
    throw new Error("FFmpeg stdout is null.");
  }

  return ffmpegProcess.stdout;
}
