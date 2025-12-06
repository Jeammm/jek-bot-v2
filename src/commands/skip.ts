import { Command } from '../types';
import { sessionManager } from '../audio/session_manager';

const command: Command = {
  name: 'skip',
  description: 'Skips the currently playing song.',
  execute: (message) => {
    const guildId = message.guildId;
    if (!guildId) return;

    const session = sessionManager.get(guildId);
    if (session) {
      session.player.stop(); // This will trigger the 'finish' event, which plays the next song.
      message.reply('Skipped the song.');
    } else {
      message.reply('I am not playing anything.');
    }
  },
};

export default command;
