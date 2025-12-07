import { GuildMember, Interaction, TextChannel } from "discord.js";
import client from "../core/discord_client";
import { logger } from "../core/logger";
import { sessionManager } from "../audio/session_manager";
import { createControlButtons } from "../ui/controls";
import {
  ensureUserPlaylist,
  saveSongToUserPlaylist,
  ensureGuildAnthem,
  saveSongToGuildAnthem,
  getUserPlaylistSongs,
  getGuildAnthemSongs,
} from "../core/db/db";
import { AudioPlayerStatus, joinVoiceChannel } from "@discordjs/voice";
import { executeSlashCommand } from "./slash_command_handler";

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    await executeSlashCommand(interaction);
  } else if (interaction.isButton()) {
    if (!interaction.guildId) return;

    const { customId } = interaction;
    logger.info(`Button interaction: ${customId}`);

    let session = sessionManager.get(interaction.guildId);
    const currentSong = session?.player.nowPlaying;

    if (customId.startsWith("run_playlist")) {
      if (!interaction.guild) {
        await interaction.reply("This command can only be used in a server.");
        return;
      }

      const member = interaction.member as GuildMember;
      const voice = member.voice.channel;

      if (!voice) {
        await interaction.reply({
          content: "You need to be in a voice channel to use this button.",
          ephemeral: true,
        });
        return;
      }

      if (!session) {
        const connection = joinVoiceChannel({
          channelId: voice.id,
          guildId: interaction.guild!.id,
          adapterCreator: interaction.guild!.voiceAdapterCreator,
        });

        session = sessionManager.create(
          interaction.guildId,
          connection,
          interaction.channel! as TextChannel
        );
      }

      const [, , type, , , ownerId] = customId.split("_");

      let songs = [];

      if (type === "user") {
        songs = await getUserPlaylistSongs(ownerId);
      } else {
        songs = await getGuildAnthemSongs(ownerId);
      }

      for (const song of songs) {
        const track = {
          title: song.title,
          url: song.url,
          duration: { seconds: song.seconds, timestamp: song.ts },
          requestedBy: interaction.user,
        };
        session.queue.add(track);
      }

      const playerIsIdle =
        session.player.getStatus() === AudioPlayerStatus.Idle;

      if (playerIsIdle) {
        session.playNext();
      }

      if (session.nowPlayingMessage) {
        session.updateNowPlayingMessage();
      }

      await interaction.reply({
        content: `▶ Added ${songs.length} songs to the queue!`,
        ephemeral: true,
      });

      return;
    }

    if (!session || !currentSong) {
      await interaction.reply({
        content: "I am not playing anything right now.",
        flags: "Ephemeral",
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

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
  }
});

logger.info("Interaction handler loaded.");
