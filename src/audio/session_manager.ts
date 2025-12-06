import { VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import { MusicPlayer } from "./player";
import { Queue } from "./queue";
import { logger } from "../core/logger";
import { EmbedBuilder, TextChannel, Message } from "discord.js";
import { createControlButtons } from "../ui/controls";
import { Track } from "../types";

export class MusicSession {
  public readonly player: MusicPlayer;
  public readonly queue: Queue;
  public readonly connection: VoiceConnection;
  public nowPlayingMessage: Message | null = null;
  private readonly textChannel: TextChannel;
  private currentTrack: Track | null = null;

  constructor(connection: VoiceConnection, textChannel: TextChannel) {
    this.connection = connection;
    this.textChannel = textChannel;
    this.player = new MusicPlayer();
    this.player.setConnection(connection);
    this.queue = new Queue();

    this.player.on("finish", () => {
      this.playNext();
    });
  }

  public async play(track: Track) {
    this.currentTrack = track;
    this.player.play(track);

    const embed = this.createNowPlayingEmbed(track);

    if (this.nowPlayingMessage) {
      await this.nowPlayingMessage
        .delete()
        .catch((e) => logger.error("Error deleting old message", e));
    }

    this.nowPlayingMessage = await this.textChannel.send({
      embeds: [embed],
      components: [createControlButtons({ isPaused: false })],
    });
  }

  public async playNext() {
    const nextTrack = this.queue.next();
    if (nextTrack) {
      this.play(nextTrack);
    } else {
      await this.destroy();
    }
  }

  public async updateNowPlayingMessage() {
    if (!this.nowPlayingMessage || !this.currentTrack) return;

    const embed = this.createNowPlayingEmbed(this.currentTrack);

    await this.nowPlayingMessage.edit({
      embeds: [embed],
      components: [
        createControlButtons({
          isPaused: this.player.getStatus() === AudioPlayerStatus.Paused,
        }),
      ],
    });
  }

  private createNowPlayingEmbed(track: Track): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(track.title)
      .setURL(track.url)
      .setAuthor({ name: "Now Playing" })
      .setTimestamp()
      .setFooter({
        text: `Requested by ${track.requestedBy.username}`,
        iconURL: track.requestedBy.displayAvatarURL(),
      });

    if (track.thumbnail) {
      embed.setThumbnail(track.thumbnail);
    }

    embed.addFields({
      name: "Duration",
      value: track.duration.timestamp,
      inline: true,
    });

    const upcomingTracks = this.queue.getQueue();
    if (upcomingTracks.length > 0) {
      const queueString = upcomingTracks
        .slice(0, 5)
        .map((t, index) => `${index + 1}. ${t.title}`)
        .join("\n");
      embed.addFields({ name: "Up Next", value: queueString });
    }
    return embed;
  }

  public async destroy() {
    if (this.nowPlayingMessage) {
      await this.nowPlayingMessage
        .delete()
        .catch((e) => logger.error("Error deleting Now Playing message", e));
      this.nowPlayingMessage = null;
    }
    this.queue.clear();
    this.player.stop();
    this.connection.destroy();
    sessionManager.delete(this.connection.joinConfig.guildId);
    logger.info(
      `Session destroyed for guild ${this.connection.joinConfig.guildId}`
    );
  }
}

class SessionManager {
  private sessions = new Map<string, MusicSession>();

  public get(guildId: string): MusicSession | undefined {
    return this.sessions.get(guildId);
  }

  public create(
    guildId: string,
    connection: VoiceConnection,
    textChannel: TextChannel
  ): MusicSession {
    const newSession = new MusicSession(connection, textChannel);
    this.sessions.set(guildId, newSession);
    logger.info(`Session created for guild ${guildId}`);
    return newSession;
  }

  public delete(guildId: string) {
    this.sessions.delete(guildId);
  }
}

export const sessionManager = new SessionManager();
