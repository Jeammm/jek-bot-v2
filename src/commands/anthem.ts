import { Command } from "../types";
import { Message, EmbedBuilder } from "discord.js";
import {
  getGuildAnthemSongs,
  removeSongFromGuildAnthem,
  ensureGuildAnthem,
  saveSongToGuildAnthem,
} from "../core/db/db";
import { logger } from "../core/logger";
import { sessionManager } from "../audio/session_manager";
import { searchYouTube } from "../audio/search";
import { Track } from "../types";

const anthemCommand: Command = {
  name: "anthem",
  description: "Manage the guild's anthem.",
  async execute(message: Message, args: string[]) {
    const subCommand = args[0];
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
      // Similar to playlist command, refine this condition if needed.
      await message.reply("The bot is not currently in a voice channel.");
      return;
    }

    switch (subCommand) {
      case "show":
        const songs = await getGuildAnthemSongs(guildId);
        if (songs.length === 0) {
          await message.reply("The guild anthem is empty.");
          return;
        }

        const embed = new EmbedBuilder()
          .setColor("#FFD700") // Gold color for anthem
          .setTitle(`${message.guild?.name}'s Anthem`)
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
        const anthemSongs = await getGuildAnthemSongs(guildId);
        if (anthemSongs.length === 0) {
          await message.reply("The guild anthem is empty.");
          return;
        }

        if (!session) {
          await message.reply("The bot is not currently in a voice channel.");
          return;
        }

        for (const song of anthemSongs) {
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
        await message.reply("Playing the guild anthem now!");
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
          const removed = await removeSongFromGuildAnthem(
            guildId,
            indexToRemove - 1
          ); // Adjust for 0-based index
          if (removed) {
            await message.reply(
              `Removed **${removed.title}** from the guild anthem.`
            );
          } else {
            await message.reply("Song not found at that index in the anthem.");
          }
        } catch (error) {
          logger.error("Error removing song from guild anthem:", error);
          await message.reply("Failed to remove song from the guild anthem.");
        }
        break;

      case "add":
        const query = args.slice(1).join(" ");
        if (!query) {
          await message.reply("Please provide a song title or URL to add.");
          return;
        }

        await ensureGuildAnthem(guildId);

        // Search for the song
        const result = await searchYouTube(query);

        if (!result) {
          await message.reply("Could not find a song with that query.");
          return;
        }

        // Add the song to the guild's anthem
        await saveSongToGuildAnthem(guildId, result[0], message.author.id);
        await message.reply(
          `Added **${result[0].title}** to the guild anthem.`
        );
        break;

      default:
        await message.reply(
          "Unknown anthem subcommand. Use `show`, `play`, `add`, or `remove`."
        );
        break;
    }
  },
};

export default anthemCommand;
