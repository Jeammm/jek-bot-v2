import { Command } from '../types';
import { getVoiceConnection, joinVoiceChannel, AudioPlayerStatus } from '@discordjs/voice';
import { GuildMember, TextChannel } from 'discord.js';
import { searchYouTube, Song } from '../audio/search';
import { sessionManager } from '../audio/session_manager';

const command: Command = {
  name: 'play',
  description: 'Plays a song from YouTube.',
  execute: async (message, args) => {
    const member = message.member as GuildMember;
    const guildId = message.guildId;
    const textChannel = message.channel as TextChannel;

    if (!member || !guildId) return;

    if (!member.voice.channel) {
      message.reply('You need to be in a voice channel to use this command.');
      return;
    }

    let session = sessionManager.get(guildId);

    if (!session) {
      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: guildId,
        adapterCreator: member.guild.voiceAdapterCreator,
      });
      session = sessionManager.create(guildId, connection, textChannel);
    }

    const query = args.join(' ');
    if (!query) {
      message.reply('Please provide a song name or URL.');
      return;
    }

    let song: Song | undefined;
    if (query.startsWith('http')) {
      song = { title: query, url: query };
    } else {
      const results = await searchYouTube(query);
      if (results.length > 0) {
        song = results[0];
      }
    }

    if (!song) {
      message.reply('Could not find a song to play.');
      return;
    }
    
    const playerIsIdle = session.player.getStatus() === AudioPlayerStatus.Idle;
    session.queue.add(song);

    if (playerIsIdle) {
      session.playNext();
    } else {
      const replyMessage = await message.reply(`Added to queue: ${song.title}`);
      setTimeout(() => {
        replyMessage.delete().catch(() => {}); // Ignore errors
      }, 5000);
    }
  },
};

export default command;
