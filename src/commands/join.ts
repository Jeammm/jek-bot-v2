import { Command } from '../types';
import { joinVoiceChannel } from '@discordjs/voice';
import { GuildMember } from 'discord.js';

const command: Command = {
  name: 'join',
  description: 'Joins the voice channel of the user.',
  execute: (message) => {
    const member = message.member as GuildMember;
    if (member && member.voice.channel) {
      joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: member.guild.id,
        adapterCreator: member.guild.voiceAdapterCreator,
      });
      message.reply(`Joined ${member.voice.channel.name}!`);
    } else {
      message.reply('You need to be in a voice channel to use this command.');
    }
  },
};

export default command;
