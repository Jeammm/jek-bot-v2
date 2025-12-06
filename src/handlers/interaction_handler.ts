import { Interaction } from "discord.js";
import client from "../core/discord_client";
import { logger } from "../core/logger";
import { sessionManager } from "../audio/session_manager";
import { createControlButtons } from "../ui/controls";

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

  await interaction.deferUpdate();

  const { customId } = interaction;
  logger.info(`Button interaction: ${customId}`);

  switch (customId) {
    case "pause":
      session.player.pause();
      await session.nowPlayingMessage?.edit({
        components: [createControlButtons({ isPaused: true })],
      });
      break;
    case "resume":
      session.player.resume();
      await session.nowPlayingMessage?.edit({
        components: [createControlButtons({ isPaused: false })],
      });
      break;
    case "skip":
      session.player.stop();
      break;
    case "stop":
      await session.destroy();
      break;
  }
});

logger.info("Interaction handler loaded.");
