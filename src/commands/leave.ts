import { Command } from '../types';
import { getVoiceConnection } from '@discordjs/voice';

const command: Command = {
  name: 'leave',
  description: 'Leaves the current voice channel.',
  execute: (message) => {
    if (message.guildId) {
      const connection = getVoiceConnection(message.guildId);
      if (connection) {
        connection.destroy();
        message.reply('Left the voice channel.');
      } else {
        message.reply('I am not in a voice channel.');
      }
    }
  },
};

export default command;
