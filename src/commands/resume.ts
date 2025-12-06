import { Command } from '../types';
import { sessionManager } from '../audio/session_manager';

const command: Command = {
  name: 'resume',
  description: 'Resumes the currently paused song.',
  execute: (message) => {
    const guildId = message.guildId;
    if (!guildId) return;

    const session = sessionManager.get(guildId);
    if (session) {
      session.player.resume();
      message.reply('Resumed the music.');
    } else {
      message.reply('I am not playing anything.');
    }
  },
};

export default command;
