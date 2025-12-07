import { ChatInputCommandInteraction, Collection } from "discord.js";
import { SlashCommand } from "../types";
import { slashCommands } from "../commands";
import { logger } from "../core/logger";

export const commands = new Collection<string, SlashCommand>();

for (const command of slashCommands) {
  commands.set(command.data.name, command);
}

export const executeSlashCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  const command = commands.get(interaction.commandName);

  if (!command) {
    logger.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error("error", error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
};
