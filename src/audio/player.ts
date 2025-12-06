import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  VoiceConnection,
} from "@discordjs/voice";
import { EventEmitter } from "events";
import { extractAudio } from "./extractor";
import { createPcmStream } from "./ffmpeg";
import { logger } from "../core/logger";
import { Song } from "./search";

export class MusicPlayer extends EventEmitter {
  private player: AudioPlayer;
  private connection: VoiceConnection | null = null;

  constructor() {
    super();
    this.player = createAudioPlayer();
    this.player.on("stateChange", (oldState, newState) => {
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        this.emit("finish");
      } else if (newState.status === AudioPlayerStatus.Playing) {
        this.emit("start");
      }
    });

    this.player.on("error", (error) => {
      logger.error("AudioPlayer error:", error);
      this.emit("error", error);
    });
  }

  public setConnection(connection: VoiceConnection) {
    this.connection = connection;
    this.connection.subscribe(this.player);
  }

  public async play(song: Song) {
    if (!this.connection) {
      throw new Error("No voice connection available.");
    }

    const audioStream = await extractAudio(song.url);
    const pcmStream = createPcmStream(audioStream);
    const resource = createAudioResource(pcmStream, {
      inputType: StreamType.Raw,
    });

    this.player.play(resource);
  }

  public pause() {
    this.player.pause();
  }

  public resume() {
    this.player.unpause();
  }

  public stop() {
    this.player.stop();
  }
}
