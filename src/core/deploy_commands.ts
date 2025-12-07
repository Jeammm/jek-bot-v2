import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { slashCommands } from "../commands";
import { logger } from "./logger";
import { CLIENT_ID, DISCORD_TOKEN } from "./env";

export const deployCommands = async (guildId: string) => {
  const commands = slashCommands.map((command) => command.data.toJSON());

  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  try {
    logger.info("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), {
      body: commands,
    });

    logger.info("Successfully reloaded application (/) commands.");
  } catch (error) {
    logger.error("error deploying commands:", error);
  }
};
