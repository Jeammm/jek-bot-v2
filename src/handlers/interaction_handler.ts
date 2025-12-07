import { Interaction } from "discord.js";
import client from "../core/discord_client";
import { logger } from "../core/logger";
import { sessionManager } from "../audio/session_manager";
import { createControlButtons } from "../ui/controls";
import {
  ensureUserPlaylist,
  saveSongToUserPlaylist,
  ensureGuildAnthem,
  saveSongToGuildAnthem,
} from "../core/db/db";

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isButton() || !interaction.guildId) return;

  const session = sessionManager.get(interaction.guildId);
  const currentSong = session?.player.nowPlaying;

  if (!session || !currentSong) {
    await interaction.reply({
      content: "I am not playing anything right now.",
      flags: "Ephemeral",
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const { customId } = interaction;
  logger.info(`Button interaction: ${customId}`);

  switch (customId) {
    case "pause":
      session.player.pause();
      await session.nowPlayingMessage?.edit({
        components: createControlButtons({ isPaused: true }),
      });
      await interaction.deleteReply();
      break;
    case "resume":
      session.player.resume();
      await session.nowPlayingMessage?.edit({
        components: createControlButtons({ isPaused: false }),
      });
      await interaction.deleteReply();
      break;
    case "skip":
      session.player.stop();
      await interaction.deleteReply();
      break;
    case "stop":
      await session.destroy();
      await interaction.deleteReply();
      break;
    case "playlist_add_current":
      try {
        if (!interaction.user.id) {
          throw new Error("User ID not found for playlist.");
        }
        await ensureUserPlaylist(interaction.user.id);
        await saveSongToUserPlaylist(
          interaction.user.id,
          currentSong,
          interaction.user.id
        );
        await interaction.editReply({
          content: `🎵 **${currentSong.title}** added to your personal playlist!`,
        });
      } catch (error) {
        logger.error("Error adding to user playlist:", error);
        await interaction.editReply({
          content: "Failed to add song to your personal playlist.",
        });
      } finally {
        setTimeout(() => interaction.deleteReply(), 5000);
      }
      break;
    case "anthem_add_current":
      try {
        if (!interaction.guildId) {
          throw new Error("Guild ID not found for anthem.");
        }
        await ensureGuildAnthem(interaction.guildId);
        await saveSongToGuildAnthem(
          interaction.guildId,
          currentSong,
          interaction.user.id
        );
        await interaction.editReply({
          content: `🔥 **${currentSong.title}** added to the Guild Anthem!`,
        });
      } catch (error) {
        logger.error("Error adding to guild anthem:", error);
        await interaction.editReply({
          content: "Failed to add song to the Guild Anthem.",
        });
      } finally {
        setTimeout(() => interaction.deleteReply(), 5000);
      }
      break;
  }
});

logger.info("Interaction handler loaded.");
