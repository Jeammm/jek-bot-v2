import { VoiceConnection } from '@discordjs/voice';
import { MusicPlayer } from './player';
import { Queue } from './queue';
import { logger } from '../core/logger';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { createControlButtons } from '../ui/controls';
import { Song } from './search';
import { getRelatedVideos } from './suggest';

export class MusicSession {
  public readonly player: MusicPlayer;
  public readonly queue: Queue;
  public readonly connection: VoiceConnection;
  private readonly textChannel: TextChannel;
  private currentSong: Song | null = null;

  constructor(connection: VoiceConnection, textChannel: TextChannel) {
    this.connection = connection;
    this.textChannel = textChannel;
    this.player = new MusicPlayer();
    this.player.setConnection(connection);
    this.queue = new Queue();

    this.player.on('finish', () => {
      this.playNext();
    });
  }
  
  public play(song: Song) {
    this.currentSong = song;
    this.player.play(song);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(song.title)
      .setURL(song.url)
      .setAuthor({ name: 'Now Playing' })
      .setTimestamp();
    
    if (song.thumbnail) {
      embed.setThumbnail(song.thumbnail);
    }

    this.textChannel.send({
        embeds: [embed],
        components: [createControlButtons()],
    });
  }

  public async playNext() {
    const nextSong = this.queue.next();
    if (nextSong) {
      this.play(nextSong);
    } else {
      // Queue is empty, try to suggest a song
      if (this.currentSong) {
        const related = await getRelatedVideos(this.currentSong.url);
        if (related.length > 0) {
          this.textChannel.send(`Queue is empty. Playing a suggested song...`);
          this.queue.add(related[0]);
          this.playNext(); // Recurse to play the new song
          return;
        }
      }
      
      this.textChannel.send('Queue finished.');
      this.destroy();
    }
  }

  public destroy() {
    this.queue.clear();
    this.player.stop();
    this.connection.destroy();
    sessionManager.delete(this.connection.joinConfig.guildId);
    logger.info(`Session destroyed for guild ${this.connection.joinConfig.guildId}`);
  }
}


class SessionManager {
  private sessions = new Map<string, MusicSession>();

  public get(guildId: string): MusicSession | undefined {
    return this.sessions.get(guildId);
  }

  public create(guildId: string, connection: VoiceConnection, textChannel: TextChannel): MusicSession {
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
