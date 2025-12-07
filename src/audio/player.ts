import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  demuxProbe,
  VoiceConnection,
} from "@discordjs/voice";
import { EventEmitter } from "events";
import { getAudioUrl } from "./extractor";
import { createOpusStream } from "./ffmpeg";
import { logger } from "../core/logger";
import { Song } from "../types";
import { ChildProcess } from "child_process";

export class MusicPlayer extends EventEmitter {
  private player: AudioPlayer;
  private connection: VoiceConnection | null = null;
  private ffmpegProcess: ChildProcess | null = null;
  public nowPlaying: Song | null = null;

  constructor() {
    super();
    this.player = createAudioPlayer();
    this.player.on("stateChange", (oldState, newState) => {
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        if (this.ffmpegProcess) {
          this.ffmpegProcess.kill();
          this.ffmpegProcess = null;
        }
        this.emit("finish");
      } else if (newState.status === AudioPlayerStatus.Playing) {
        this.emit("start");
      }
    });

    this.player.on("error", (error) => {
      logger.error("AudioPlayer error:", error);
      if (this.ffmpegProcess) {
        this.ffmpegProcess.kill();
        this.ffmpegProcess = null;
      }
      this.emit("error", error);
    });
  }

  public setConnection(connection: VoiceConnection) {
    this.connection = connection;
    this.connection.subscribe(this.player);
  }

  public async play(song: Song) {
    if (!this.connection) throw new Error("No voice connection.");

    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill();
      this.ffmpegProcess = null;
    }

    const audioUrl = await getAudioUrl(song.url);
    const { stream, process } = createOpusStream(audioUrl);
    this.ffmpegProcess = process;

    const { stream: probed, type } = await demuxProbe(stream);

    const resource = createAudioResource(probed, {
      inputType: type,
    });

    this.player.play(resource);
  }

  public pause() {
    this.player.pause();
  }

  public resume() {
    this.player.unpause();
  }

  public getStatus() {
    return this.player.state.status;
  }

  public stop() {
    this.player.stop();
  }
}
