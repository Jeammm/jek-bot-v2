import { Interaction } from "discord.js";
import client from "../core/discord_client";
import { logger } from "../core/logger";
import { sessionManager } from "../audio/session_manager";

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isButton() || !interaction.guildId) return;

  const session = sessionManager.get(interaction.guildId);
  if (!session) {
    await interaction.reply({
      content: "I am not playing anything.",
      flags: "Ephemeral",
    });
    return;
  }

  const { customId } = interaction;
  logger.info(`Button interaction: ${customId}`);

  switch (customId) {
    case "pause":
      session.player.pause();
      await interaction.reply({ content: "Paused.", flags: "Ephemeral" });
      break;
    case "resume":
      session.player.resume();
      await interaction.reply({
        content: "Resumed.",
        flags: "Ephemeral",
      });
      break;
    case "skip":
      session.player.stop();
      await interaction.reply({
        content: "Skipped.",
        flags: "Ephemeral",
      });
      break;
    case "stop":
      session.destroy();
      await interaction.reply({
        content: "Stopped.",
        flags: "Ephemeral",
      });
      break;
  }
});

logger.info("Interaction handler loaded.");
