import { Command } from "../types";
import { Message, EmbedBuilder, ChannelType, GuildMember } from "discord.js";
import {
  getUserPlaylistSongs,
  removeSongFromUserPlaylist,
  ensureUserPlaylist,
  saveSongToUserPlaylist,
} from "../core/db/db";
import { logger } from "../core/logger";
import { sessionManager } from "../audio/session_manager";
import { searchYouTube } from "../audio/search";
import { Track } from "../types";
import { AudioPlayerStatus, joinVoiceChannel } from "@discordjs/voice";

const playlistCommand: Command = {
  name: "playlist",
  description: "Manage your personal playlist.",
  async execute(message: Message, args: string[]) {
    const subCommand = args[0];
    const userId = message.author.id;
    const { guildId, channel, member } = message;

    if (!channel || channel.type !== ChannelType.GuildText) {
      return;
    }

    if (!guildId) {
      await message.reply("This command can only be used in a server.");
      return;
    }

    switch (subCommand) {
      case "show":
        const songs = await getUserPlaylistSongs(userId);
        if (songs.length === 0) {
          await message.reply("Your playlist is empty.");
          return;
        }

        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle(`${message.author.username}'s Playlist`)
          .setDescription(
            songs
              .map(
                (song, index) => `${index + 1}. [${song.title}](${song.url})`
              )
              .join("\n")
          );

        await message.reply({ embeds: [embed] });
        break;

      case "play":
        const playlistSongs = await getUserPlaylistSongs(userId);
        if (playlistSongs.length === 0) {
          await message.reply("Your playlist is empty.");
          return;
        }

        let session = sessionManager.get(guildId);

        if (!member?.voice.channel) {
          const msg = await channel.send(
            "You need to be in a voice channel to use this command."
          );
          setTimeout(() => msg.delete().catch(() => {}), 5000);
          return;
        }

        if (!session) {
          const connection = joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: guildId,
            adapterCreator: member.guild.voiceAdapterCreator,
          });
          session = sessionManager.create(guildId, connection, channel);
        }

        for (const song of playlistSongs) {
          const track: Track = {
            title: song.title,
            url: song.url,
            duration: { seconds: song.seconds, timestamp: song.ts },
            requestedBy: message.author,
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

        const feedbackMessage = await message.reply(
          "Playing your playlist now!"
        );

        setTimeout(() => {
          feedbackMessage.delete();
        }, 5000);
        break;

      case "remove":
        const indexToRemove = parseInt(args[1], 10);
        if (isNaN(indexToRemove) || indexToRemove <= 0) {
          await message.reply(
            "Please provide a valid number for the song to remove."
          );
          return;
        }

        try {
          const removed = await removeSongFromUserPlaylist(
            userId,
            indexToRemove - 1
          );

          let feedbackMessage;

          if (removed) {
            feedbackMessage = await message.reply(
              `Removed **${removed.title}** from your playlist.`
            );
          } else {
            feedbackMessage = await message.reply(
              "Song not found at that index in your playlist."
            );
          }

          setTimeout(() => {
            feedbackMessage.delete().catch(() => {});
          }, 5000);
        } catch (error) {
          logger.error("Error removing song from user playlist:", error);
          await message.reply("Failed to remove song from your playlist.");
        }
        break;

      case "add":
        const query = args.slice(1).join(" ");
        if (!query) {
          await message.reply("Please provide a song title or URL to add.");
          return;
        }

        await ensureUserPlaylist(userId);

        if (!channel || channel.type !== 0) {
          await message.reply(
            "This command can only be used in text channels."
          );
          return;
        }

        message.delete().catch(() => {});

        const searchingMessage = await channel.send(
          `🔎 Searching for "${query}"...`
        );

        const result = await searchYouTube(query);

        if (!result) {
          await channel.send("Could not find a song with that query.");
          return;
        }

        searchingMessage.delete().catch(() => {});

        await saveSongToUserPlaylist(userId, result[0], userId);
        const addedMessage = await channel.send(
          `Added **${result[0].title}** to your playlist.`
        );

        setTimeout(() => {
          addedMessage.delete().catch(() => {});
        }, 5000);

        break;

      default:
        await message.reply(
          "Unknown playlist subcommand. Use `show`, `play`, `add`, or `remove`."
        );
        break;
    }
  },
};

export default playlistCommand;
