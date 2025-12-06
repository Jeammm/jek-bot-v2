import client from './core/discord_client';
import { logger } from './core/logger';
import { DISCORD_TOKEN } from './core/env';
import './core/prefix_handler';
import './handlers/interaction_handler';
import { loadCommands } from './commands';

logger.info('Starting bot...');
loadCommands();

client.login(DISCORD_TOKEN).catch((error) => {
  logger.error('Failed to log in:', error);
  process.exit(1);
});


