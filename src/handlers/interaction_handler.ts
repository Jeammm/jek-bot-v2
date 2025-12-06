import { Interaction } from 'discord.js';
import client from '../core/discord_client';
import { logger } from '../core/logger';
import { sessionManager } from '../audio/session_manager';

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isButton() || !interaction.guildId) return;

  const session = sessionManager.get(interaction.guildId);
  if (!session) {
    await interaction.reply({ content: 'I am not playing anything.', ephemeral: true });
    return;
  }

  const { customId } = interaction;
  logger.info(`Button interaction: ${customId}`);

  switch (customId) {
    case 'pause':
      session.player.pause();
      await interaction.reply({ content: 'Paused.', ephemeral: true });
      break;
    case 'resume':
      session.player.resume();
      await interaction.reply({ content: 'Resumed.', ephemeral: true });
      break;
    case 'skip':
      session.player.stop(); // Triggers 'finish' event to play next
      await interaction.reply({ content: 'Skipped.', ephemeral: true });
      break;
    case 'stop':
      session.destroy();
      await interaction.reply({ content: 'Stopped.', ephemeral: true });
      break;
  }
});

logger.info('Interaction handler loaded.');
