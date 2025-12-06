import { Collection, Message } from 'discord.js';
import { Command } from '../types';
import { logger } from '../core/logger';

const commands = new Collection<string, Command>();

export function registerCommand(command: Command) {
  commands.set(command.name, command);
  logger.info(`Registered command: ${command.name}`);
}

export async function executeCommand(commandName: string, message: Message, args: string[]) {
  const command = commands.get(commandName);
  if (!command) {
    logger.warn(`Command not found: ${commandName}`);
    message.reply(`Command not found: ${commandName}`);
    return;
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    logger.error(`Error executing command ${commandName}:`, error);
    message.reply('An error occurred while executing this command.');
  }
}
