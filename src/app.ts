import client from './core/discord_client';
import { logger } from './core/logger';
import { DISCORD_TOKEN } from './core/env';
import './core/prefix_handler';
import './handlers/interaction_handler';
import { loadCommands } from './commands';
import { initializeDatabase } from './core/db/db';

logger.info('Starting bot...');
loadCommands();

initializeDatabase().then(() => {
  client.login(DISCORD_TOKEN).catch((error) => {
    logger.error('Failed to log in:', error);
    process.exit(1);
  });
}).catch((error) => {
  logger.error('Failed to initialize database:', error);
  process.exit(1);
});


