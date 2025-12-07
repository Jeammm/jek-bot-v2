import { Command } from "../types";
import { Message, EmbedBuilder } from "discord.js";
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

const playlistCommand: Command = {
  name: "playlist",
  description: "Manage your personal playlist.",
  async execute(message: Message, args: string[]) {
    const subCommand = args[0];
    const userId = message.author.id;
    const { guildId } = message;

    if (!guildId) {
      await message.reply("This command can only be used in a server.");
      return;
    }

    const session = sessionManager.get(guildId);
    if (
      !session &&
      (subCommand === "play" || subCommand === "add" || subCommand === "remove")
    ) {
      // For "play" and "add" commands, the bot needs to be in a voice channel.
      // For "remove" it doesn't necessarily need to be.
      // Re-evaluate this condition to be more precise for each subcommand.
      // For now, let's keep it as is, assuming the user expects the bot to be active.
      await message.reply("The bot is not currently in a voice channel.");
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

        if (!session) {
          await message.reply("The bot is not currently in a voice channel.");
          return;
        }

        for (const song of playlistSongs) {
          const track: Track = {
            title: song.title,
            url: song.url,
            // Assuming default values or fetching these later if needed
            duration: { seconds: 0, timestamp: "0:00" },
            requestedBy: message.author,
          };
          session.queue.add(track);
        }

        if (!session.player.getStatus()) {
          session.playNext();
        }
        await message.reply("Playing your playlist now!");
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
          ); // Adjust for 0-based index
          if (removed) {
            await message.reply(
              `Removed **${removed.title}** from your playlist.`
            );
          } else {
            await message.reply(
              "Song not found at that index in your playlist."
            );
          }
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

        // Search for the song
        const result = await searchYouTube(query);

        if (!result) {
          await message.reply("Could not find a song with that query.");
          return;
        }

        // Add the song to the user's playlist
        await saveSongToUserPlaylist(userId, result[0], userId);
        await message.reply(`Added **${result[0].title}** to your playlist.`);
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
