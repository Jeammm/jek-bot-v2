import { Message } from "discord.js";
import { logger } from "./logger";
import client from "./discord_client";
import { executeCommand } from "../handlers/command_handler";
import { PREFIX } from "./env";

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) {
    return;
  }

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) {
    return;
  }

  logger.info(`Command received: ${commandName} with args: ${args.join(", ")}`);
  await executeCommand(commandName, message, args);
});

logger.info("Prefix handler loaded.");
